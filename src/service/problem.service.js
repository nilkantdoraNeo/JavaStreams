const { Op } = require("sequelize");
const { Problem, UserProgress, Bookmark } = require("../model");

const LEARNING_PATHS = [
  {
    id: "stream-fundamentals",
    title: "Stream Fundamentals",
    level: "Beginner",
    topics: ["Filtering", "Mapping", "Collecting", "Distinct operations"]
  },
  {
    id: "filtering-mapping",
    title: "Filtering and Mapping",
    level: "Beginner",
    topics: ["Filtering", "Mapping", "Flat Mapping", "Stream chaining"]
  },
  {
    id: "transformations",
    title: "Stream Transformations",
    level: "Intermediate",
    topics: ["Flat Mapping", "Sorting", "Limit and skip operations", "Functional composition"]
  },
  {
    id: "collectors-aggregations",
    title: "Collectors and Aggregations",
    level: "Intermediate",
    topics: ["Collecting", "Grouping", "Aggregation", "Reduction"]
  },
  {
    id: "advanced-pipelines",
    title: "Advanced Stream Pipelines",
    level: "Advanced",
    topics: ["Complex pipelines", "Custom collectors", "Optional handling"]
  },
  {
    id: "performance-optimization",
    title: "Performance Optimization",
    level: "Advanced",
    topics: ["Performance optimization", "Parallel streams", "Custom collectors"]
  }
];

function normalizeStatus(status) {
  return status === "COMPLETED" ? "COMPLETED" : "UNLOCKED";
}

function sanitizeProblem(problem, progressStatus) {
  return {
    id: problem.id,
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    topic: problem.topic,
    tags: problem.tags || [],
    world: problem.world,
    worldNumber: problem.worldNumber,
    levelNumber: problem.levelNumber,
    worldLevelNumber: problem.worldLevelNumber,
    starterCode: problem.starterCode,
    sampleTests: problem.sampleTests,
    expectedOutput: problem.expectedOutput,
    xpReward: problem.xpReward,
    timeLimitMs: problem.timeLimitMs,
    memoryLimitMb: problem.memoryLimitMb,
    inputFormat: problem.inputFormat,
    outputFormat: problem.outputFormat,
    constraints: problem.constraints,
    examples: problem.examples || [],
    acceptanceRate: problem.acceptanceRate,
    popularity: problem.popularity,
    isDaily: problem.isDaily,
    isPracticeFeatured: problem.isPracticeFeatured,
    isChallengeFeatured: problem.isChallengeFeatured,
    progressStatus
  };
}

function toLibraryItem(problem, status, isBookmarked) {
  return {
    id: problem.id,
    title: problem.title,
    levelNumber: problem.levelNumber,
    difficulty: problem.difficulty,
    topic: problem.topic,
    acceptanceRate: problem.acceptanceRate,
    popularity: problem.popularity,
    status,
    isBookmarked,
    isDaily: problem.isDaily,
    isNew: (problem.worldLevelNumber || 0) <= 5
  };
}

class ProblemService {
  async getWorldMap(userId) {
    const problems = await Problem.findAll({
      order: [["levelNumber", "ASC"]]
    });
    const progressRows = await UserProgress.findAll({
      where: { userId }
    });
    const progressByProblemId = new Map(progressRows.map((item) => [item.problemId, item]));
    const worlds = new Map();

    for (const problem of problems) {
      if (!worlds.has(problem.worldNumber)) {
        worlds.set(problem.worldNumber, {
          worldNumber: problem.worldNumber,
          worldName: problem.world,
          levels: []
        });
      }
      const progress = progressByProblemId.get(problem.id);
      worlds.get(problem.worldNumber).levels.push({
        id: problem.id,
        levelNumber: problem.levelNumber,
        worldLevelNumber: problem.worldLevelNumber,
        title: problem.title,
        difficulty: problem.difficulty,
        topic: problem.topic,
        acceptanceRate: problem.acceptanceRate,
        xpReward: problem.xpReward,
        status: normalizeStatus(progress ? progress.status : null)
      });
    }

    return Array.from(worlds.values()).sort((a, b) => a.worldNumber - b.worldNumber);
  }

  async getProblemLibrary({
    userId,
    difficulty,
    topic,
    solved,
    search,
    sort = "recommended",
    page = 1,
    pageSize = 10
  }) {
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(Math.max(Number(pageSize) || 10, 1), 500);
    const where = {};
    if (difficulty && ["Beginner", "Intermediate", "Advanced", "Expert"].includes(difficulty)) {
      where.difficulty = difficulty;
    }
    if (topic) {
      where.topic = topic;
    }
    if (search && search.trim().length > 0) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search.trim()}%` } },
        { description: { [Op.like]: `%${search.trim()}%` } },
        { topic: { [Op.like]: `%${search.trim()}%` } }
      ];
    }

    const order =
      sort === "popular"
        ? [["popularity", "DESC"], ["levelNumber", "ASC"]]
        : sort === "newest"
          ? [["createdAt", "DESC"]]
          : [["levelNumber", "ASC"]];

    const [problems, progressRows, bookmarks] = await Promise.all([
      Problem.findAll({
        where,
        order,
        attributes: [
          "id",
          "title",
          "levelNumber",
          "difficulty",
          "topic",
          "acceptanceRate",
          "popularity",
          "isDaily",
          "worldLevelNumber"
        ]
      }),
      UserProgress.findAll({ where: { userId } }),
      Bookmark.findAll({ where: { userId } })
    ]);

    const progressByProblemId = new Map(progressRows.map((item) => [item.problemId, item.status]));
    const bookmarked = new Set(bookmarks.map((item) => item.problemId));

    const filtered = problems
      .map((problem) => {
        const status = normalizeStatus(progressByProblemId.get(problem.id) || null);
        return toLibraryItem(problem, status, bookmarked.has(problem.id));
      })
      .filter((item) => {
        if (solved === "solved") {
          return item.status === "COMPLETED";
        }
        if (solved === "unsolved") {
          return item.status !== "COMPLETED";
        }
        return true;
      });

    const total = filtered.length;
    const start = (safePage - 1) * safePageSize;
    const paged = filtered.slice(start, start + safePageSize);

    return {
      items: paged,
      total
    };
  }

  async getConceptCategories() {
    const rows = await Problem.findAll({
      attributes: ["topic"]
    });
    const counts = new Map();
    for (const row of rows) {
      const topic = row.topic || "Complex pipelines";
      counts.set(topic, (counts.get(topic) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => a.topic.localeCompare(b.topic));
  }

  async getLearningPaths(userId) {
    const [problems, progressRows] = await Promise.all([
      Problem.findAll({ attributes: ["id", "topic", "difficulty", "title", "levelNumber"], order: [["levelNumber", "ASC"]] }),
      UserProgress.findAll({ where: { userId }, attributes: ["problemId", "status"] })
    ]);
    const progressByProblemId = new Map(progressRows.map((item) => [item.problemId, item.status]));

    return LEARNING_PATHS.map((path) => {
      const pathProblems = problems.filter((problem) => path.topics.includes(problem.topic));
      const solved = pathProblems.filter((problem) => progressByProblemId.get(problem.id) === "COMPLETED").length;
      return {
        id: path.id,
        title: path.title,
        level: path.level,
        topics: path.topics,
        totalProblems: pathProblems.length,
        solvedProblems: solved,
        completionPercent: pathProblems.length > 0 ? Math.round((solved / pathProblems.length) * 100) : 0,
        nextProblems: pathProblems
          .filter((problem) => progressByProblemId.get(problem.id) !== "COMPLETED")
          .slice(0, 5)
          .map((problem) => ({
            id: problem.id,
            title: problem.title,
            levelNumber: problem.levelNumber,
            difficulty: problem.difficulty,
            topic: problem.topic
          }))
      };
    });
  }

  async getProblemForUser({ userId, problemId }) {
    const problem = await Problem.findByPk(problemId);
    if (!problem) {
      const error = new Error("Problem not found");
      error.status = 404;
      throw error;
    }
    const [progress] = await UserProgress.findOrCreate({
      where: { userId, problemId: problem.id },
      defaults: {
        userId,
        problemId: problem.id,
        status: "UNLOCKED"
      }
    });
    if (progress.status === "LOCKED") {
      progress.status = "UNLOCKED";
      await progress.save();
    }
    return sanitizeProblem(problem, normalizeStatus(progress.status));
  }

  async getProblemForExecution({ userId, problemId }) {
    const problem = await Problem.findByPk(problemId);
    if (!problem) {
      const error = new Error("Problem not found");
      error.status = 404;
      throw error;
    }
    const [progress] = await UserProgress.findOrCreate({
      where: { userId, problemId: problem.id },
      defaults: {
        userId,
        problemId: problem.id,
        status: "UNLOCKED"
      }
    });
    if (progress.status === "LOCKED") {
      progress.status = "UNLOCKED";
      await progress.save();
    }
    return {
      problem,
      progress
    };
  }

  async getHint({ userId, problemId }) {
    const { problem } = await this.getProblemForExecution({ userId, problemId });
    return {
      problemId: problem.id,
      hint: problem.hint,
      step: 1,
      totalSteps: Array.isArray(problem.hintSteps) ? problem.hintSteps.length : 1
    };
  }

  async getHintStep({ userId, problemId, step }) {
    const { problem } = await this.getProblemForExecution({ userId, problemId });
    const steps = Array.isArray(problem.hintSteps) && problem.hintSteps.length > 0 ? problem.hintSteps : [problem.hint];
    const normalized = Math.min(Math.max(Number(step) || 1, 1), steps.length);
    return {
      problemId: problem.id,
      step: normalized,
      totalSteps: steps.length,
      hint: steps[normalized - 1]
    };
  }

  async getEditorial({ userId, problemId }) {
    const { problem, progress } = await this.getProblemForExecution({ userId, problemId });
    if (progress.status !== "COMPLETED") {
      const error = new Error("Solve the problem first to unlock editorial");
      error.status = 403;
      throw error;
    }
    return {
      problemId: problem.id,
      title: problem.title,
      editorial: problem.editorial,
      optimizedSolution: problem.optimizedSolution
    };
  }
}

module.exports = new ProblemService();
