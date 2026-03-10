const env = require("../config/env");
const userRepository = require("../repository/user.repository");
const supabaseAuthService = require("./supabase-auth.service");
const userSyncService = require("./user-sync.service");

function toUserPayload(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    avatar: user.avatar || null
  };
}

function requireEmail(identifier) {
  const value = String(identifier || "").trim().toLowerCase();
  if (!value.includes("@")) {
    const error = new Error("Use your email address to sign in");
    error.status = 400;
    throw error;
  }
  return value;
}

class AuthService {
  getPublicConfig() {
    return supabaseAuthService.getPublicConfig();
  }

  async signup(payload) {
    const email = requireEmail(payload.email);
    const redirectTo = payload.redirectTo || `${env.app.corsOrigin}/auth`;
    const authResult = await supabaseAuthService.signUpWithEmail({
      email,
      password: payload.password,
      name: payload.name,
      phone: payload.phone || null,
      redirectTo
    });
    const user = await userSyncService.syncSupabaseUser(authResult.user);

    return {
      token: authResult.session?.access_token || null,
      user: toUserPayload(user),
      requiresEmailVerification: !authResult.session,
      message: authResult.session
        ? "Signed in successfully"
        : "Check your email to verify your account, then sign in."
    };
  }

  async login(payload) {
    const email = requireEmail(payload.identifier);
    const authResult = await supabaseAuthService.signInWithPassword({
      email,
      password: payload.password
    });
    const user = await userSyncService.syncSupabaseUser(authResult.user);

    return {
      token: authResult.session.access_token,
      user: toUserPayload(user)
    };
  }

  async me(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    return toUserPayload(user);
  }
}

module.exports = new AuthService();
