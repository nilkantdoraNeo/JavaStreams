const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserProgress = sequelize.define(
  "UserProgress",
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
    status: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: "LOCKED"
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    bestExecutionTime: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    lastSubmittedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    solvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: "user_progress",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "problem_id"]
      }
    ]
  }
);

module.exports = UserProgress;
