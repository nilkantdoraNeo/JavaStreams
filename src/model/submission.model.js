const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Submission = sequelize.define(
  "Submission",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    problemId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    executionTime: {
      type: DataTypes.INTEGER,
      field: "runtime_ms",
      allowNull: true
    },
    memoryKb: {
      type: DataTypes.INTEGER,
      field: "memory_kb",
      allowNull: true
    },
    results: {
      type: DataTypes.JSON,
      allowNull: true
    },
    isPracticeRun: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: "submissions"
  }
);

module.exports = Submission;
