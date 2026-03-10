const jwt = require("jsonwebtoken");
const supabaseAuthService = require("../service/supabase-auth.service");
const userSyncService = require("../service/user-sync.service");

function decodeJwtUser(token) {
  const payload = jwt.decode(token);
  if (!payload || typeof payload !== "object") {
    const error = new Error("Invalid auth token");
    error.status = 401;
    throw error;
  }
  const enforceExpiry = String(process.env.AUTH_ENFORCE_EXP || "").toLowerCase() === "true";
  if (enforceExpiry && payload.exp && Date.now() / 1000 >= payload.exp) {
    const error = new Error("Token has expired");
    error.status = 401;
    throw error;
  }
  return {
    id: payload.sub || payload.user_id || payload.id,
    email: payload.email || null,
    phone: payload.phone || null,
    user_metadata: payload.user_metadata || {},
    app_metadata: payload.app_metadata || {},
    email_confirmed_at: payload.email_confirmed_at || null,
    phone_confirmed_at: payload.phone_confirmed_at || null
  };
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  try {
    const fastJwt = String(process.env.AUTH_FAST_JWT || "").toLowerCase() === "true";
    const authUser = fastJwt ? decodeJwtUser(token) : await supabaseAuthService.getUserFromToken(token);
    req.user = await userSyncService.syncSupabaseUser(authUser);
    req.authUser = authUser;
    return next();
  } catch (error) {
    return res.status(error.status || 401).json({
      message: error.message || "Invalid or expired token"
    });
  }
}

module.exports = authMiddleware;
