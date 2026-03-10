const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserAchievement = sequelize.define(
  "UserAchievement",
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
    achievementId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    unlockedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "user_achievements",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "achievement_id"]
      }
    ]
  }
);

module.exports = UserAchievement;
