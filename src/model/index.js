const User = require("./user.model");
const Problem = require("./problem.model");
const Submission = require("./submission.model");
const UserProgress = require("./userProgress.model");
const Achievement = require("./achievement.model");
const UserAchievement = require("./userAchievement.model");
const Bookmark = require("./bookmark.model");
const DiscussionPost = require("./discussionPost.model");
const DiscussionVote = require("./discussionVote.model");

User.hasMany(Submission, { foreignKey: "userId" });
Submission.belongsTo(User, { foreignKey: "userId" });

Problem.hasMany(Submission, { foreignKey: "problemId" });
Submission.belongsTo(Problem, { foreignKey: "problemId" });

User.hasMany(UserProgress, { foreignKey: "userId" });
UserProgress.belongsTo(User, { foreignKey: "userId" });

Problem.hasMany(UserProgress, { foreignKey: "problemId" });
UserProgress.belongsTo(Problem, { foreignKey: "problemId" });

User.belongsToMany(Achievement, {
  through: UserAchievement,
  foreignKey: "userId",
  otherKey: "achievementId"
});
Achievement.belongsToMany(User, {
  through: UserAchievement,
  foreignKey: "achievementId",
  otherKey: "userId"
});

UserAchievement.belongsTo(User, { foreignKey: "userId" });
UserAchievement.belongsTo(Achievement, { foreignKey: "achievementId" });
User.hasMany(UserAchievement, { foreignKey: "userId" });
Achievement.hasMany(UserAchievement, { foreignKey: "achievementId" });

User.hasMany(Bookmark, { foreignKey: "userId" });
Bookmark.belongsTo(User, { foreignKey: "userId" });
Problem.hasMany(Bookmark, { foreignKey: "problemId" });
Bookmark.belongsTo(Problem, { foreignKey: "problemId" });

User.hasMany(DiscussionPost, { foreignKey: "userId" });
DiscussionPost.belongsTo(User, { foreignKey: "userId" });
Problem.hasMany(DiscussionPost, { foreignKey: "problemId" });
DiscussionPost.belongsTo(Problem, { foreignKey: "problemId" });
DiscussionPost.hasMany(DiscussionPost, { foreignKey: "parentId", as: "Replies" });
DiscussionPost.belongsTo(DiscussionPost, { foreignKey: "parentId", as: "Parent" });

DiscussionPost.hasMany(DiscussionVote, { foreignKey: "discussionPostId" });
DiscussionVote.belongsTo(DiscussionPost, { foreignKey: "discussionPostId" });
User.hasMany(DiscussionVote, { foreignKey: "userId" });
DiscussionVote.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  User,
  Problem,
  Submission,
  UserProgress,
  Achievement,
  UserAchievement,
  Bookmark,
  DiscussionPost,
  DiscussionVote
};
