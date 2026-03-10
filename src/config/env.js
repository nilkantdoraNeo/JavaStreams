const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

function resolveEnvPath() {
  const explicit = (process.env.ENV_FILE || "").trim();
  if (explicit) {
    return path.resolve(explicit);
  }

  const renderSecret = "/etc/secrets/.env";
  if (fs.existsSync(renderSecret)) {
    return renderSecret;
  }

  return path.resolve(process.cwd(), ".env");
}

const envPath = resolveEnvPath();
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

function asNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
}

function resolveDatabaseUrl() {
  const direct = (process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || "").trim();
  if (direct) {
    return direct;
  }

  const supabaseDbUrl = (process.env.SUPABASE_DB_URL || "").trim();
  if (!supabaseDbUrl) {
    return "";
  }

  if (!supabaseDbUrl.startsWith("jdbc:")) {
    return supabaseDbUrl;
  }

  if (!supabaseDbUrl.startsWith("jdbc:postgresql://")) {
    return "";
  }

  try {
    const url = new URL(supabaseDbUrl.replace(/^jdbc:/, ""));
    const username = (process.env.SUPABASE_DB_USER || "").trim();
    const password = process.env.SUPABASE_DB_PASSWORD || "";

    if (username) {
      url.username = username;
    }
    if (password) {
      url.password = password;
    }

    return url.toString();
  } catch (error) {
    return "";
  }
}

module.exports = {
  app: {
    port: asNumber(process.env.PORT, 8080),
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:4200"
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "streamquest-dev-secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d"
  },
  supabase: {
    url: (process.env.SUPABASE_URL || "https://baqibpndwbfqlklsgsyl.supabase.co").trim(),
    anonKey: (process.env.SUPABASE_ANON_KEY || "").trim(),
    serviceRoleKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  },
  db: {
    url: resolveDatabaseUrl(),
    ssl: asBoolean(process.env.DB_SSL, true)
  },
  codeRunner: {
    mode: process.env.CODE_RUNNER_MODE || "docker",
    dockerImage: process.env.DOCKER_IMAGE || "eclipse-temurin:17-jdk",
    timeoutMs: asNumber(process.env.CODE_TIMEOUT_MS, 5000),
    memoryMb: asNumber(process.env.CODE_MEMORY_MB, 128),
    startupGraceMs: asNumber(process.env.CODE_STARTUP_GRACE_MS, 7000)
  },
  game: {
    xpMultiplier: asNumber(process.env.XP_MULTIPLIER, 1),
    dailyChallengeMultiplier: asNumber(process.env.DAILY_CHALLENGE_MULTIPLIER, 2),
    targetProblemCount: asNumber(process.env.TARGET_PROBLEM_COUNT, 200)
  },
  admin: {
    token: process.env.ADMIN_TOKEN || "streamquest-admin-token"
  }
};
