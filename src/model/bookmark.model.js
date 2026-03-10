const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Bookmark = sequelize.define(
  "Bookmark",
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
    collection: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: "My List"
    },
    note: {
      type: DataTypes.STRING(280),
      allowNull: true
    }
  },
  {
    tableName: "bookmarks",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "problem_id", "collection"]
      }
    ]
  }
);

module.exports = Bookmark;
