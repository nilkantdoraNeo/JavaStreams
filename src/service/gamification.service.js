const { Op } = require("sequelize");
const env = require("../config/env");
const { UserProgress, Problem, Achievement, UserAchievement } = require("../model");
const { daysBetween } = require("../utils/date");

const ACHIEVEMENT_KEYS = {
  FIRST_SOLVE: "first_solve",
  STREAK_3: "streak_3",
  STREAK_7: "streak_7",
  TEN_SOLVES: "ten_solves",
  FIFTY_SOLVES: "fifty_solves",
  WORLD_1_MASTER: "world_1_master",
  WORLD_5_MASTER: "world_5_master"
};

function calculateLevelFromXp(xp) {
  return Math.max(1, Math.floor(xp / 150) + 1);
}

class GamificationService {
  async applyAcceptedSubmissionRewards({ user, problem, executionTime, transaction }) {
    const today = new Date();
    const previous = user.lastSolvedAt ? new Date(user.lastSolvedAt) : null;

    if (!previous) {
      user.streak = 1;
    } else {
      const distance = daysBetween(previous, today);
      if (distance === 0) {
        user.streak = Math.max(user.streak, 1);
      } else if (distance === 1) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }
    }

    const baseXp = problem.xpReward;
    const dailyMultiplier = problem.isDaily ? env.game.dailyChallengeMultiplier : 1;
    const performanceBonus = executionTime && executionTime <= Math.floor(problem.timeLimitMs * 0.4) ? 15 : 0;
    const gainedXp = Math.round(baseXp * env.game.xpMultiplier * dailyMultiplier + performanceBonus);

    user.xp += gainedXp;
    user.level = calculateLevelFromXp(user.xp);
    user.lastSolvedAt = today;
    await user.save({ transaction });

    const newlyUnlockedAchievements = await this.unlockAchievements({
      userId: user.id,
      streak: user.streak,
      transaction
    });

    let bonusXp = 0;
    if (newlyUnlockedAchievements.length > 0) {
      const achievements = await Achievement.findAll({
        where: { key: { [Op.in]: newlyUnlockedAchievements } },
        transaction
      });
      bonusXp = achievements.reduce((sum, item) => sum + item.xpBonus, 0);
      if (bonusXp > 0) {
        user.xp += bonusXp;
        user.level = calculateLevelFromXp(user.xp);
        await user.save({ transaction });
      }
    }

    return {
      gainedXp: gainedXp + bonusXp,
      streak: user.streak,
      level: user.level,
      achievements: newlyUnlockedAchievements
    };
  }

  async unlockAchievements({ userId, streak, transaction }) {
    const completedCount = await UserProgress.count({
      where: { userId, status: "COMPLETED" },
      transaction
    });

    const world1Total = await Problem.count({
      where: { worldNumber: 1 },
      transaction
    });
    const world1Completed = await UserProgress.count({
      where: { userId, status: "COMPLETED" },
      include: [{ model: Problem, where: { worldNumber: 1 } }],
      transaction
    });
    const world5Total = await Problem.count({
      where: { worldNumber: 5 },
      transaction
    });
    const world5Completed = await UserProgress.count({
      where: { userId, status: "COMPLETED" },
      include: [{ model: Problem, where: { worldNumber: 5 } }],
      transaction
    });

    const candidates = [];
    if (completedCount >= 1) {
      candidates.push(ACHIEVEMENT_KEYS.FIRST_SOLVE);
    }
    if (streak >= 3) {
      candidates.push(ACHIEVEMENT_KEYS.STREAK_3);
    }
    if (streak >= 7) {
      candidates.push(ACHIEVEMENT_KEYS.STREAK_7);
    }
    if (completedCount >= 10) {
      candidates.push(ACHIEVEMENT_KEYS.TEN_SOLVES);
    }
    if (completedCount >= 50) {
      candidates.push(ACHIEVEMENT_KEYS.FIFTY_SOLVES);
    }
    if (world1Total > 0 && world1Completed === world1Total) {
      candidates.push(ACHIEVEMENT_KEYS.WORLD_1_MASTER);
    }
    if (world5Total > 0 && world5Completed === world5Total) {
      candidates.push(ACHIEVEMENT_KEYS.WORLD_5_MASTER);
    }

    if (candidates.length === 0) {
      return [];
    }

    const achievementRows = await Achievement.findAll({
      where: { key: { [Op.in]: candidates } },
      transaction
    });
    const unlockedNow = [];
    for (const row of achievementRows) {
      const [record, created] = await UserAchievement.findOrCreate({
        where: { userId, achievementId: row.id },
        defaults: { userId, achievementId: row.id },
        transaction
      });
      if (created && record) {
        unlockedNow.push(row.key);
      }
    }
    return unlockedNow;
  }
}

module.exports = new GamificationService();
