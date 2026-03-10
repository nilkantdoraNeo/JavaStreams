const sequelize = require("../config/database");
const env = require("../config/env");
const { Problem, Achievement } = require("../model");
const { buildProblemSeed, buildAchievementSeed } = require("./problemGenerator");

function dayOfYear(date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

async function seedProblemsAndAchievements() {
  return sequelize.transaction(async (transaction) => {
    await Problem.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true, transaction });
    await Achievement.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true, transaction });

    const targetCount = Math.max(30, env.game.targetProblemCount || 200);
    const problems = buildProblemSeed(targetCount);
    if (problems.length === 0) {
      throw new Error("Problem seed list is empty");
    }

    const day = dayOfYear(new Date());
    const dailyIndex = day % problems.length;
    problems[dailyIndex].isDaily = true;

    await Problem.bulkCreate(problems, { transaction });
    await Achievement.bulkCreate(buildAchievementSeed(), { transaction });

    return {
      problemCount: problems.length,
      dailyChallengeLevel: problems[dailyIndex].levelNumber
    };
  });
}

module.exports = {
  seedProblemsAndAchievements
};
