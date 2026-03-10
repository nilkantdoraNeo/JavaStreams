const { Problem, Submission, User } = require("../model");

const CONTESTS = [
  {
    id: "weekly-stream-sprint",
    title: "Weekly Stream Sprint",
    description: "Solve focused Stream API problems in 90 minutes.",
    mode: "Challenge",
    startsAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    endsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    durationMinutes: 90,
    problemLimit: 4
  },
  {
    id: "daily-functional-cup",
    title: "Daily Functional Cup",
    description: "Fast daily contest on pipelines and collectors.",
    mode: "Practice",
    startsAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
    durationMinutes: 60,
    problemLimit: 3
  }
];

function contestState(contest) {
  const now = Date.now();
  const start = new Date(contest.startsAt).getTime();
  const end = new Date(contest.endsAt).getTime();
  if (now < start) {
    return "upcoming";
  }
  if (now > end) {
    return "finished";
  }
  return "live";
}

class ContestService {
  async listContests() {
    return CONTESTS.map((contest) => ({
      ...contest,
      state: contestState(contest)
    }));
  }

  async getContest(contestId) {
    const contest = CONTESTS.find((item) => item.id === contestId);
    if (!contest) {
      const error = new Error("Contest not found");
      error.status = 404;
      throw error;
    }
    const problems = await Problem.findAll({
      order: [["levelNumber", "ASC"]],
      limit: contest.problemLimit
    });
    return {
      ...contest,
      state: contestState(contest),
      problems: problems.map((problem) => ({
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        topic: problem.topic,
        xpReward: problem.xpReward
      }))
    };
  }

  async getContestLeaderboard(contestId) {
    const contest = CONTESTS.find((item) => item.id === contestId);
    if (!contest) {
      const error = new Error("Contest not found");
      error.status = 404;
      throw error;
    }

    const contestSubmissions = await Submission.findAll({
      where: {},
      include: [{ model: User, attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]]
    });

    const byUser = new Map();
    for (const item of contestSubmissions) {
      const marker = item.results?.contestId;
      if (marker !== contestId) {
        continue;
      }
      const userKey = item.userId;
      if (!byUser.has(userKey)) {
        byUser.set(userKey, {
          userId: item.userId,
          name: item.User ? item.User.name : `User ${item.userId}`,
          solved: 0,
          attempts: 0,
          totalRuntime: 0
        });
      }
      const entry = byUser.get(userKey);
      entry.attempts += 1;
      if (item.status === "ACCEPTED") {
        entry.solved += 1;
      }
      entry.totalRuntime += item.executionTime || 0;
    }

    return Array.from(byUser.values())
      .sort((a, b) => b.solved - a.solved || a.totalRuntime - b.totalRuntime || a.name.localeCompare(b.name))
      .map((row, index) => ({
        rank: index + 1,
        ...row
      }));
  }
}

module.exports = new ContestService();
