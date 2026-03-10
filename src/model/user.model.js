const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(64),
      field: "username",
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: { isEmail: true }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      field: "password_hash",
      allowNull: true
    },
    xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    streak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    lastSolvedAt: {
      type: DataTypes.DATE,
      field: "last_solved_at",
      allowNull: true
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Unknown"
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    authProvider: {
      type: DataTypes.STRING(32),
      field: "auth_provider",
      allowNull: false,
      defaultValue: "email"
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      field: "email_verified_at",
      allowNull: true
    },
    phoneVerifiedAt: {
      type: DataTypes.DATE,
      field: "phone_verified_at",
      allowNull: true
    },
    problemsSolved: {
      type: DataTypes.INTEGER,
      field: "problems_solved",
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: "users"
  }
);

module.exports = User;
