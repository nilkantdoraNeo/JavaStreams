const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { Problem, User, UserProgress } = require("../model");

function toDateOrNull(value) {
  return value ? new Date(value) : null;
}

function clampUsername(value) {
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  return (normalized || "StreamQuest Player").slice(0, 64);
}

function baseUsernameForUser(authUser) {
  const metadata = authUser.user_metadata || {};
  return clampUsername(
    metadata.name ||
      metadata.full_name ||
      metadata.user_name ||
      metadata.preferred_username ||
      authUser.email?.split("@")[0] ||
      authUser.phone ||
      "StreamQuest Player"
  );
}

function buildCandidate(baseName, suffix) {
  if (suffix <= 1) {
    return baseName;
  }
  const suffixText = `-${suffix}`;
  return `${baseName.slice(0, Math.max(1, 64 - suffixText.length))}${suffixText}`;
}

async function reserveUsername(baseName, transaction, excludedUserId = null) {
  let suffix = 1;
  while (true) {
    const candidate = buildCandidate(baseName, suffix);
    const existing = await User.findOne({
      where: {
        name: candidate,
        ...(excludedUserId ? { id: { [Op.ne]: excludedUserId } } : {})
      },
      transaction
    });
    if (!existing) {
      return candidate;
    }
    suffix += 1;
  }
}

async function initializeProgressForUser(userId, transaction) {
  const problems = await Problem.findAll({
    attributes: ["id"],
    order: [["levelNumber", "ASC"]],
    transaction
  });

  if (problems.length === 0) {
    return;
  }

  await UserProgress.bulkCreate(
    problems.map((problem) => ({
      userId,
      problemId: problem.id,
      status: "UNLOCKED"
    })),
    { transaction }
  );
}

function buildUserValues(authUser, username, existingUser = null) {
  const metadata = authUser.user_metadata || {};
  const provider = authUser.app_metadata?.provider || (authUser.phone ? "phone" : "email");

  return {
    id: authUser.id,
    name: username,
    email: authUser.email || null,
    phone: authUser.phone || existingUser?.phone || null,
    passwordHash: null,
    avatar: metadata.avatar_url || metadata.picture || existingUser?.avatar || null,
    authProvider: provider,
    emailVerifiedAt: toDateOrNull(authUser.email_confirmed_at),
    phoneVerifiedAt: toDateOrNull(authUser.phone_confirmed_at)
  };
}

class UserSyncService {
  async syncSupabaseUser(authUser) {
    const existingUser = await User.findByPk(authUser.id);
    if (existingUser) {
      const desiredName = existingUser.name || (await reserveUsername(baseUsernameForUser(authUser), null, existingUser.id));
      Object.assign(existingUser, buildUserValues(authUser, desiredName, existingUser));
      await existingUser.save();
      return existingUser;
    }

    return sequelize.transaction(async (transaction) => {
      const username = await reserveUsername(baseUsernameForUser(authUser), transaction);
      const user = await User.create(buildUserValues(authUser, username), { transaction });
      await initializeProgressForUser(user.id, transaction);
      return user;
    });
  }
}

module.exports = new UserSyncService();
