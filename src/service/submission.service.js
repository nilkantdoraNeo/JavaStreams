const sequelize = require("../config/database");
const { Submission, UserProgress, Problem } = require("../model");
const problemService = require("./problem.service");
const gamificationService = require("./gamification.service");
const { runJavaTests } = require("../codeexecutor/dockerJavaRunner");

function normalizeRunStatus(executionStatus) {
  if (executionStatus === "ACCEPTED") {
    return "RUN_OK";
  }
  if (executionStatus === "WRONG_ANSWER") {
    return "RUN_FAIL";
  }
  return executionStatus;
}

class SubmissionService {
  async runCode({ user, problemId, code, mode = "practice", customInput = "" }) {
    const { problem } = await problemService.getProblemForExecution({
      userId: user.id,
      problemId
    });

    const result = await runJavaTests({
      code,
      testCases: problem.sampleTests,
      timeoutMs: problem.timeLimitMs,
      memoryMb: problem.memoryLimitMb
    });

    const status = normalizeRunStatus(result.status);

    return {
      submissionId: 0,
      status,
      output: result.output || "",
      failedTests: result.failedTests || [],
      executionTime: result.executionTime || null,
      passed: result.passed || 0,
      total: result.total || 0
    };
  }

  async submitCode({ user, problemId, code, mode = "practice", contestId = null }) {
    const { problem, progress } = await problemService.getProblemForExecution({
      userId: user.id,
      problemId
    });

    const timeoutMs = mode === "challenge" ? Math.max(1000, Math.floor(problem.timeLimitMs * 0.75)) : problem.timeLimitMs;
    const memoryMb = mode === "challenge" ? Math.max(64, Math.floor(problem.memoryLimitMb * 0.85)) : problem.memoryLimitMb;

    const execution = await runJavaTests({
      code,
      testCases: problem.testCases,
      timeoutMs,
      memoryMb
    });

    return sequelize.transaction(async (transaction) => {
      const submission = await Submission.create(
        {
          userId: user.id,
          problemId: problem.id,
          code,
          status: execution.status,
          executionTime: execution.executionTime || null,
          results: {
            mode: "submit",
            userMode: mode,
            contestId: contestId || null,
            output: execution.output || "",
            failedTests: execution.failedTests || [],
            passed: execution.passed || 0,
            total: execution.total || 0
          },
          isPracticeRun: false
        },
        { transaction }
      );

      progress.attempts += 1;
      progress.lastSubmittedAt = new Date();

      const response = {
        submissionId: submission.id,
        status: execution.status,
        output: execution.output || "",
        failedTests: execution.failedTests || [],
        executionTime: execution.executionTime || null,
        passed: execution.passed || 0,
        total: execution.total || 0,
        unlockedLevel: null,
        rewards: null
      };

      if (execution.status === "ACCEPTED") {
        const firstSolve = progress.status !== "COMPLETED";
        progress.status = "COMPLETED";
        progress.solvedAt = progress.solvedAt || new Date();
        if (!progress.bestExecutionTime || (execution.executionTime && execution.executionTime < progress.bestExecutionTime)) {
          progress.bestExecutionTime = execution.executionTime || progress.bestExecutionTime;
        }

        if (firstSolve) {
          const nextProblem = await Problem.findOne({
            where: { levelNumber: problem.levelNumber + 1 },
            transaction
          });
          if (nextProblem) {
            const nextProgress = await UserProgress.findOne({
              where: { userId: user.id, problemId: nextProblem.id },
              transaction
            });
            if (nextProgress && nextProgress.status === "LOCKED") {
              nextProgress.status = "UNLOCKED";
              await nextProgress.save({ transaction });
              response.unlockedLevel = {
                id: nextProblem.id,
                levelNumber: nextProblem.levelNumber,
                title: nextProblem.title
              };
            }
          }

          const rewards = await gamificationService.applyAcceptedSubmissionRewards({
            user,
            problem,
            executionTime: execution.executionTime || problem.timeLimitMs,
            transaction
          });
          response.rewards = rewards;
        }
      }

      await progress.save({ transaction });
      return response;
    });
  }

  async getRecentSubmissions(userId) {
    return Submission.findAll({
      where: { userId, isPracticeRun: false },
      include: [{ model: Problem }],
      order: [["createdAt", "DESC"]],
      limit: 30
    });
  }
}

module.exports = new SubmissionService();
