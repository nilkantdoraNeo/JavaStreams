const sequelize = require("../config/database");
const { DiscussionPost, DiscussionVote, User } = require("../model");

function serializePost(post, currentUserVoteSet) {
  return {
    id: post.id,
    problemId: post.problemId,
    parentId: post.parentId,
    content: post.content,
    upvotes: post.upvotes,
    isPinned: post.isPinned,
    createdAt: post.createdAt,
    author: post.User
      ? {
          id: post.User.id,
          name: post.User.name,
          level: post.User.level
        }
      : null,
    hasUpvoted: currentUserVoteSet.has(post.id)
  };
}

class CommunityService {
  async listProblemDiscussion({ userId, problemId }) {
    const [posts, votes] = await Promise.all([
      DiscussionPost.findAll({
        where: { problemId },
        include: [{ model: User, attributes: ["id", "name", "level"] }],
        order: [
          ["isPinned", "DESC"],
          ["upvotes", "DESC"],
          ["createdAt", "DESC"]
        ]
      }),
      DiscussionVote.findAll({ where: { userId }, attributes: ["discussionPostId"] })
    ]);
    const voteSet = new Set(votes.map((item) => item.discussionPostId));
    return posts.map((post) => serializePost(post, voteSet));
  }

  async createPost({ userId, problemId, content, parentId }) {
    if (!content || content.trim().length < 5) {
      const error = new Error("Discussion post is too short");
      error.status = 400;
      throw error;
    }
    const post = await DiscussionPost.create({
      userId,
      problemId,
      parentId: parentId || null,
      content: content.trim()
    });
    const hydrated = await DiscussionPost.findByPk(post.id, {
      include: [{ model: User, attributes: ["id", "name", "level"] }]
    });
    return serializePost(hydrated, new Set());
  }

  async toggleUpvote({ userId, postId }) {
    return sequelize.transaction(async (transaction) => {
      const post = await DiscussionPost.findByPk(postId, { transaction });
      if (!post) {
        const error = new Error("Discussion post not found");
        error.status = 404;
        throw error;
      }

      const existing = await DiscussionVote.findOne({
        where: { userId, discussionPostId: postId },
        transaction
      });
      if (existing) {
        await existing.destroy({ transaction });
        post.upvotes = Math.max(0, post.upvotes - 1);
        await post.save({ transaction });
        return { postId, upvotes: post.upvotes, hasUpvoted: false };
      }

      await DiscussionVote.create(
        {
          userId,
          discussionPostId: postId
        },
        { transaction }
      );
      post.upvotes += 1;
      await post.save({ transaction });
      return { postId, upvotes: post.upvotes, hasUpvoted: true };
    });
  }
}

module.exports = new CommunityService();
