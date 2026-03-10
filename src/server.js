const app = require("./app");
const env = require("./config/env");
const sequelize = require("./config/database");
const { Problem, Achievement, UserProgress } = require("./model");
const { seedProblemsAndAchievements } = require("./seed/problemSeeder");

async function syncDatabase() {
  const mode = String(process.env.DB_SYNC_MODE || "alter").toLowerCase();

  if (mode === "none") {
    return;
  }

  if (mode === "force") {
    await sequelize.sync({ force: true });
    return;
  }

  try {
    await sequelize.sync({ alter: true });
  } catch (error) {
    const allowForce = String(process.env.DB_SYNC_FALLBACK_FORCE || "").toLowerCase() === "true";
    if (!allowForce) {
      throw error;
    }
    // eslint-disable-next-line no-console
    console.warn("Alter sync failed; falling back to force sync.");
    await sequelize.sync({ force: true });
  }
}

async function bootstrap() {
  await sequelize.authenticate();
  await syncDatabase();

  const shouldSeed = String(process.env.SEED_ON_START || "").toLowerCase() === "true";
  if (shouldSeed) {
    const summary = await seedProblemsAndAchievements();
    // eslint-disable-next-line no-console
    console.log(`Seeded ${summary.problemCount} problems. Daily challenge level #${summary.dailyChallengeLevel}.`);
  }

  const shouldSyncProgress = String(process.env.USER_PROGRESS_SYNC || "true").toLowerCase() !== "false";
  if (shouldSyncProgress) {
    UserProgress.update(
      { status: "UNLOCKED" },
      {
        where: { status: "LOCKED" }
      }
    ).catch((error) => {
      // eslint-disable-next-line no-console
      console.warn("User progress sync skipped:", error.message);
    });
  }

  app.listen(env.app.port, () => {
    // eslint-disable-next-line no-console
    console.log(`StreamQuest API running on port ${env.app.port}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to bootstrap API:", error);
  process.exit(1);
});
