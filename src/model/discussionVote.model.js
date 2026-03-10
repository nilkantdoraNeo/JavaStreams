const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DiscussionVote = sequelize.define(
  "DiscussionVote",
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
    discussionPostId: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  },
  {
    tableName: "discussion_votes",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "discussion_post_id"]
      }
    ]
  }
);

module.exports = DiscussionVote;
