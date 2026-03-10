const { createClient } = require("@supabase/supabase-js");
const env = require("../config/env");

let supabaseClient;

function ensureSupabaseConfig() {
  if (!env.supabase.url || !env.supabase.anonKey) {
    const error = new Error("Supabase auth is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.");
    error.status = 503;
    throw error;
  }
}

function getClient() {
  ensureSupabaseConfig();
  if (!supabaseClient) {
    supabaseClient = createClient(env.supabase.url, env.supabase.anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseClient;
}

function toError(error, fallbackMessage, fallbackStatus) {
  const wrapped = new Error(error?.message || fallbackMessage);
  wrapped.status = error?.status || fallbackStatus;
  return wrapped;
}

class SupabaseAuthService {
  getPublicConfig() {
    ensureSupabaseConfig();
    return {
      supabaseUrl: env.supabase.url,
      supabaseAnonKey: env.supabase.anonKey
    };
  }

  async signUpWithEmail({ email, password, name, phone, redirectTo }) {
    const { data, error } = await getClient().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          name,
          phone: phone || undefined
        }
      }
    });

    if (error) {
      throw toError(error, "Unable to create account", 400);
    }
    if (!data.user) {
      throw toError(null, "Unable to create account", 400);
    }
    return data;
  }

  async signInWithPassword({ email, password }) {
    const { data, error } = await getClient().auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw toError(error, "Unable to sign in", 401);
    }
    if (!data.user || !data.session?.access_token) {
      throw toError(null, "Unable to sign in", 401);
    }
    return data;
  }

  async getUserFromToken(token) {
    const { data, error } = await getClient().auth.getUser(token);
    if (error || !data.user) {
      throw toError(error, "Invalid or expired token", 401);
    }
    return data.user;
  }
}

module.exports = new SupabaseAuthService();
