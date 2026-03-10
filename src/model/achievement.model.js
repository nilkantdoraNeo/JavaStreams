const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Achievement = sequelize.define(
  "Achievement",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(400),
      allowNull: false
    },
    badgeColor: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "gold"
    },
    xpBonus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: "achievements"
  }
);

module.exports = Achievement;
