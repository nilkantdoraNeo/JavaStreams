const { Sequelize } = require("sequelize");
const env = require("./env");

if (!env.db.url) {
  throw new Error("Missing Supabase Postgres connection. Set DATABASE_URL (or SUPABASE_DB_URL + credentials). SQLite is disabled.");
}

const sequelize = new Sequelize(env.db.url, {
  dialect: "postgres",
  logging: false,
  dialectOptions: env.db.ssl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {},
  define: {
    freezeTableName: true,
    underscored: true,
    timestamps: true,
    updatedAt: false
  }
});

module.exports = sequelize;
