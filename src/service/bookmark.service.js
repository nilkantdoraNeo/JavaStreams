const { Bookmark, Problem, UserProgress } = require("../model");

class BookmarkService {
  async listBookmarks(userId) {
    const rows = await Bookmark.findAll({
      where: { userId },
      include: [{ model: Problem }],
      order: [["createdAt", "DESC"]]
    });
    const progressRows = await UserProgress.findAll({ where: { userId } });
    const statusByProblemId = new Map(progressRows.map((row) => [row.problemId, row.status]));

    return rows.map((row) => ({
      id: row.id,
      collection: row.collection,
      note: row.note,
      problem: row.Problem
        ? {
            id: row.Problem.id,
            title: row.Problem.title,
            levelNumber: row.Problem.levelNumber,
            difficulty: row.Problem.difficulty,
            topic: row.Problem.topic,
            acceptanceRate: row.Problem.acceptanceRate,
            status: statusByProblemId.get(row.problemId) || "UNLOCKED"
          }
        : null
    }));
  }

  async addBookmark({ userId, problemId, collection, note }) {
    const problem = await Problem.findByPk(problemId);
    if (!problem) {
      const error = new Error("Problem not found");
      error.status = 404;
      throw error;
    }
    const bookmark = await Bookmark.findOrCreate({
      where: {
        userId,
        problemId,
        collection: collection || "My List"
      },
      defaults: {
        userId,
        problemId,
        collection: collection || "My List",
        note: note || null
      }
    });
    const [row] = bookmark;
    if (note !== undefined) {
      row.note = note || null;
      await row.save();
    }
    return {
      id: row.id,
      collection: row.collection,
      note: row.note,
      problemId: row.problemId
    };
  }

  async removeBookmark({ userId, bookmarkId }) {
    const deleted = await Bookmark.destroy({
      where: { id: bookmarkId, userId }
    });
    if (!deleted) {
      const error = new Error("Bookmark not found");
      error.status = 404;
      throw error;
    }
    return { success: true };
  }

  async removeBookmarkByProblem({ userId, problemId, collection }) {
    const deleted = await Bookmark.destroy({
      where: {
        userId,
        problemId,
        ...(collection ? { collection } : {})
      }
    });
    return { success: deleted > 0 };
  }
}

module.exports = new BookmarkService();
