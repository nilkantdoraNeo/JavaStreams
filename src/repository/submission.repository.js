const { Submission, Problem } = require("../model");

class SubmissionRepository {
  async create(data, transaction) {
    return Submission.create(data, { transaction });
  }

  async findRecentByUser(userId, limit = 20) {
    return Submission.findAll({
      where: { userId },
      include: [{ model: Problem }],
      order: [["createdAt", "DESC"]],
      limit
    });
  }

  async countAcceptedByUser(userId) {
    return Submission.count({
      where: {
        userId,
        status: "ACCEPTED"
      }
    });
  }
}

module.exports = new SubmissionRepository();
