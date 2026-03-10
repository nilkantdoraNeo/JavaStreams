const { Problem } = require("../model");

class ProblemRepository {
  async createBulk(items, transaction) {
    return Problem.bulkCreate(items, { transaction });
  }

  async count() {
    return Problem.count();
  }

  async findAllOrdered() {
    return Problem.findAll({
      order: [
        ["levelNumber", "ASC"]
      ]
    });
  }

  async findById(problemId) {
    return Problem.findByPk(problemId);
  }

  async findByLevelNumber(levelNumber) {
    return Problem.findOne({ where: { levelNumber } });
  }

  async findDailyChallenge() {
    return Problem.findOne({
      where: { isDaily: true }
    });
  }

  async resetDailyFlags(transaction) {
    await Problem.update({ isDaily: false }, { where: {}, transaction });
  }

  async markDaily(problemId, transaction) {
    await Problem.update({ isDaily: true }, { where: { id: problemId }, transaction });
  }
}

module.exports = new ProblemRepository();
