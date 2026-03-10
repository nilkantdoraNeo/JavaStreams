const { UserProgress, Problem } = require("../model");

class ProgressRepository {
  async createBulk(items, transaction) {
    return UserProgress.bulkCreate(items, { transaction });
  }

  async findOne(userId, problemId) {
    return UserProgress.findOne({ where: { userId, problemId } });
  }

  async findAllByUser(userId) {
    return UserProgress.findAll({
      where: { userId },
      include: [{ model: Problem }],
      order: [[Problem, "levelNumber", "ASC"]]
    });
  }

  async markUnlocked(userId, problemId, transaction) {
    return UserProgress.update(
      { status: "UNLOCKED" },
      { where: { userId, problemId }, transaction }
    );
  }

  async save(progress, transaction) {
    return progress.save({ transaction });
  }

  async completedCount(userId) {
    return UserProgress.count({
      where: { userId, status: "COMPLETED" }
    });
  }
}

module.exports = new ProgressRepository();
