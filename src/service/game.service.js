const { Op } = require("sequelize");
const { User, UserProgress, Problem, UserAchievement, Achievement, Submission, Bookmark } = require("../model");

function normalizeName(value) {
  const trimmed = String(value || "").trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return null;
  }
  if (trimmed.length < 2 || trimmed.length > 64) {
    const error = new Error("Name must be between 2 and 64 characters.");
    error.status = 400;
    throw error;
  }
  return trimmed;
}

function normalizePhone(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return null;
  }
  const normalized = trimmed.replace(/\s+/g, "");
  if (!/^[+]?[\d-]{7,20}$/.test(normalized)) {
    const error = new Error("Phone number must be 7-20 digits (you can include + or -).");
    error.status = 400;
    throw error;
  }
  return trimmed;
}

function normalizeAvatar(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return null;
  }
  if (!/^(https?:\/\/|data:image\/)/i.test(trimmed)) {
    const error = new Error("Avatar must be a valid image URL.");
    error.status = 400;
    throw error;
  }
  return trimmed;
}

function startOfWeek(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

class GameService {
  async getDashboard(user) {
    const totalProblems = await Problem.count();
    const completed = await UserProgress.count({
      where: { userId: user.id, status: "COMPLETED" }
    });
    const unlocked = await UserProgress.count({
      where: { userId: user.id, status: { [Op.in]: ["UNLOCKED", "COMPLETED"] } }
    });
    const currentProgress = await UserProgress.findOne({
      where: { userId: user.id, status: "UNLOCKED" },
      include: [{ model: Problem }],
      order: [[Problem, "levelNumber", "ASC"]]
    });
    let dailyChallenge = await UserProgress.findOne({
      where: { userId: user.id, status: { [Op.in]: ["UNLOCKED", "COMPLETED"] } },
      include: [{ model: Problem, where: { isDaily: true } }]
    });
    if (!dailyChallenge) {
      dailyChallenge = await UserProgress.findOne({
        where: { userId: user.id, status: { [Op.in]: ["UNLOCKED", "COMPLETED"] } },
        include: [{ model: Problem }],
        order: [[Problem, "levelNumber", "ASC"]]
      });
    }

    const topicRows = await UserProgress.findAll({
      where: { userId: user.id, status: "COMPLETED" },
      include: [{ model: Problem, attributes: ["topic"] }]
    });
    const conceptMasteryMap = new Map();
    for (const row of topicRows) {
      const topic = row.Problem?.topic || "Complex pipelines";
      conceptMasteryMap.set(topic, (conceptMasteryMap.get(topic) || 0) + 1);
    }
    const conceptMastery = Array.from(conceptMasteryMap.entries())
      .map(([topic, solved]) => ({ topic, solved }))
      .sort((a, b) => b.solved - a.solved);

    return {
      profile: {
        id: user.id,
        name: user.name,
        xp: user.xp,
        level: user.level,
        streak: user.streak
      },
      progress: {
        completed,
        unlocked,
        totalProblems,
        percent: totalProblems > 0 ? Math.round((completed / totalProblems) * 100) : 0
      },
      currentLevel: currentProgress
        ? {
            id: currentProgress.Problem.id,
            title: currentProgress.Problem.title,
            levelNumber: currentProgress.Problem.levelNumber,
            world: currentProgress.Problem.world
          }
        : null,
      dailyChallenge: dailyChallenge?.Problem
        ? {
            id: dailyChallenge.Problem.id,
            title: dailyChallenge.Problem.title,
            world: dailyChallenge.Problem.world,
            xpReward: dailyChallenge.Problem.xpReward
          }
        : null,
      conceptMastery
    };
  }

  async getLeaderboard({ limit = 50, scope = "global", topic = null }) {
    const safeLimit = Math.min(Math.max(limit, 5), 200);
    if (scope === "global") {
      const users = await User.findAll({
        order: [
          ["xp", "DESC"],
          ["level", "DESC"],
          ["id", "ASC"]
        ],
        limit: safeLimit
      });
      return users.map((user, index) => ({
        rank: index + 1,
        id: user.id,
        name: user.name,
        xp: user.xp,
        level: user.level,
        streak: user.streak
      }));
    }

    if (scope === "weekly") {
      const from = startOfWeek();
      const submissions = await Submission.findAll({
        where: {
          createdAt: { [Op.gte]: from },
          status: "ACCEPTED"
        },
        include: [{ model: User, attributes: ["id", "name", "level", "streak"] }]
      });
      const scoreByUser = new Map();
      for (const row of submissions) {
        if (!scoreByUser.has(row.userId)) {
          scoreByUser.set(row.userId, {
            id: row.userId,
            name: row.User?.name || `User ${row.userId}`,
            xp: 0,
            level: row.User?.level || 1,
            streak: row.User?.streak || 0
          });
        }
        const item = scoreByUser.get(row.userId);
        item.xp += 20;
      }
      return Array.from(scoreByUser.values())
        .sort((a, b) => b.xp - a.xp || b.level - a.level)
        .slice(0, safeLimit)
        .map((row, index) => ({ rank: index + 1, ...row }));
    }

    if (scope === "topic") {
      const whereTopic = topic ? { topic } : {};
      const acceptedRows = await UserProgress.findAll({
        where: { status: "COMPLETED" },
        include: [
          { model: Problem, where: whereTopic, attributes: ["topic"] },
          { model: User, attributes: ["id", "name", "level", "streak", "xp"] }
        ]
      });
      const byUser = new Map();
      for (const row of acceptedRows) {
        const key = row.userId;
        if (!byUser.has(key)) {
          byUser.set(key, {
            id: key,
            name: row.User?.name || `User ${key}`,
            xp: row.User?.xp || 0,
            level: row.User?.level || 1,
            streak: row.User?.streak || 0,
            solved: 0
          });
        }
        byUser.get(key).solved += 1;
      }
      return Array.from(byUser.values())
        .sort((a, b) => b.solved - a.solved || b.xp - a.xp)
        .slice(0, safeLimit)
        .map((row, index) => ({ rank: index + 1, ...row }));
    }

    return [];
  }

  async getProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const completed = await UserProgress.count({
      where: { userId, status: "COMPLETED" }
    });
    const total = await Problem.count();
    const achievementRows = await UserAchievement.findAll({
      where: { userId },
      include: [{ model: Achievement }],
      order: [["createdAt", "DESC"]]
    });
    const recentSubmissions = await Submission.findAll({
      where: { userId, isPracticeRun: false },
      include: [{ model: Problem }],
      order: [["createdAt", "DESC"]],
      limit: 30
    });
    const favorites = await Bookmark.findAll({
      where: { userId },
      include: [{ model: Problem }],
      order: [["createdAt", "DESC"]],
      limit: 10
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar || null,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      solvedLevels: completed,
      totalLevels: total,
      achievements: achievementRows
        .map((row) => row.Achievement)
        .filter(Boolean)
        .map((item) => ({
          key: item.key,
          name: item.name,
          description: item.description,
          badgeColor: item.badgeColor
        })),
      activityTimeline: recentSubmissions.map((row) => ({
        id: row.id,
        problemId: row.problemId,
        problemTitle: row.Problem?.title || "Unknown",
        status: row.status,
        executionTime: row.executionTime,
        createdAt: row.createdAt
      })),
      favoriteSolutions: favorites
        .map((row) => row.Problem)
        .filter(Boolean)
        .map((problem) => ({
          id: problem.id,
          title: problem.title,
          topic: problem.topic,
          difficulty: problem.difficulty
        }))
    };
  }

  async updateProfile(userId, payload = {}) {
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const nextName = payload.name !== undefined ? normalizeName(payload.name) : user.name;
    const nextPhone = payload.phone !== undefined ? normalizePhone(payload.phone) : user.phone;
    const nextAvatar = payload.avatar !== undefined ? normalizeAvatar(payload.avatar) : user.avatar;

    if (nextName && nextName !== user.name) {
      const existing = await User.findOne({
        where: {
          name: nextName,
          id: { [Op.ne]: user.id }
        }
      });
      if (existing) {
        const error = new Error("Username already in use.");
        error.status = 409;
        throw error;
      }
    }

    if (nextPhone && nextPhone !== user.phone) {
      const existingPhone = await User.findOne({
        where: {
          phone: nextPhone,
          id: { [Op.ne]: user.id }
        }
      });
      if (existingPhone) {
        const error = new Error("Phone number already in use.");
        error.status = 409;
        throw error;
      }
    }

    user.name = nextName || user.name;
    user.phone = nextPhone || null;
    user.avatar = nextAvatar || null;

    await user.save();

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar || null
    };
  }

  async getInsights(userId) {
    const totalByTopicRows = await Problem.findAll({
      attributes: ["topic"]
    });
    const solvedByTopicRows = await UserProgress.findAll({
      where: { userId, status: "COMPLETED" },
      include: [{ model: Problem, attributes: ["topic"] }]
    });

    const totalByTopic = new Map();
    for (const row of totalByTopicRows) {
      const topic = row.topic || "Complex pipelines";
      totalByTopic.set(topic, (totalByTopic.get(topic) || 0) + 1);
    }
    const solvedByTopic = new Map();
    for (const row of solvedByTopicRows) {
      const topic = row.Problem?.topic || "Complex pipelines";
      solvedByTopic.set(topic, (solvedByTopic.get(topic) || 0) + 1);
    }

    const stats = Array.from(totalByTopic.entries()).map(([topic, total]) => {
      const solved = solvedByTopic.get(topic) || 0;
      return {
        topic,
        solved,
        total,
        percent: total > 0 ? Math.round((solved / total) * 100) : 0
      };
    });

    const weakAreas = [...stats].sort((a, b) => a.percent - b.percent).slice(0, 3);
    const strongAreas = [...stats].sort((a, b) => b.percent - a.percent).slice(0, 3);

    const recommendations = weakAreas
      .filter((item) => item.total > item.solved)
      .map((item) => item.topic);

    const recommendedProblems = await Problem.findAll({
      where: {
        topic: { [Op.in]: recommendations.length > 0 ? recommendations : ["Filtering"] }
      },
      order: [["popularity", "DESC"]],
      limit: 6
    });

    return {
      weakAreas,
      strongAreas,
      recommendations: recommendedProblems.map((problem) => ({
        id: problem.id,
        title: problem.title,
        topic: problem.topic,
        difficulty: problem.difficulty,
        levelNumber: problem.levelNumber
      }))
    };
  }

  async getDailyChallenge(userId) {
    const daily = await UserProgress.findOne({
      where: { userId, status: { [Op.in]: ["UNLOCKED", "COMPLETED"] } },
      include: [{ model: Problem, where: { isDaily: true } }]
    });
    if (!daily?.Problem) {
      return null;
    }
    return {
      id: daily.Problem.id,
      title: daily.Problem.title,
      world: daily.Problem.world,
      difficulty: daily.Problem.difficulty,
      levelNumber: daily.Problem.levelNumber,
      xpReward: daily.Problem.xpReward
    };
  }
}

module.exports = new GameService();
