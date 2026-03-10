const { Achievement, UserAchievement } = require("../model");
const { Op } = require("sequelize");

class AchievementRepository {
  async createBulk(items, transaction) {
    return Achievement.bulkCreate(items, {
      ignoreDuplicates: true,
      transaction
    });
  }

  async findByKeys(keys) {
    return Achievement.findAll({
      where: { key: { [Op.in]: keys } }
    });
  }

  async findUserAchievements(userId) {
    return UserAchievement.findAll({
      where: { userId },
      include: [{ model: Achievement }]
    });
  }

  async assign(userId, achievementId, transaction) {
    return UserAchievement.findOrCreate({
      where: { userId, achievementId },
      defaults: { userId, achievementId },
      transaction
    });
  }
}

module.exports = new AchievementRepository();
