const sequelize = require("../config/database");
const { seedProblemsAndAchievements } = require("./problemSeeder");

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

async function run() {
  try {
    await sequelize.authenticate();
    await syncDatabase();
    const summary = await seedProblemsAndAchievements();
    // eslint-disable-next-line no-console
    console.log("Seed complete:", summary);
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

run();
