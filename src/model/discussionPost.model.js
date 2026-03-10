const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DiscussionPost = sequelize.define(
  "DiscussionPost",
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
    parentId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    upvotes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: "discussion_posts"
  }
);

module.exports = DiscussionPost;
