const { Op } = require("sequelize");
const { User } = require("../model");

class UserRepository {
  async create(userData) {
    return User.create(userData);
  }

  async findById(id) {
    return User.findByPk(id);
  }

  async findByEmailOrPhone(identifier) {
    return User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { phone: identifier }]
      }
    });
  }

  async existsEmailOrPhone({ email, phone }) {
    const where = [];
    if (email) {
      where.push({ email });
    }
    if (phone) {
      where.push({ phone });
    }
    if (where.length === 0) {
      return false;
    }
    const user = await User.findOne({
      where: { [Op.or]: where }
    });
    return Boolean(user);
  }

  async topByXp(limit = 20) {
    return User.findAll({
      order: [
        ["xp", "DESC"],
        ["level", "DESC"],
        ["id", "ASC"]
      ],
      limit
    });
  }

  async save(user) {
    return user.save();
  }
}

module.exports = new UserRepository();
