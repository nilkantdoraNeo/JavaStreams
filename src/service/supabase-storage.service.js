const { createClient } = require("@supabase/supabase-js");
const env = require("../config/env");

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const BUCKET_NAME = env.storage?.bucket || "avatars";
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"]
]);

let storageClient;

function ensureStorageConfig() {
  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    const error = new Error("Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    error.status = 503;
    throw error;
  }
}

function getClient() {
  ensureStorageConfig();
  if (!storageClient) {
    storageClient = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return storageClient;
}

async function ensureBucket() {
  const client = getClient();
  const { data, error } = await client.storage.listBuckets();
  if (error) {
    const wrapped = new Error(error.message || "Unable to access Supabase storage buckets.");
    wrapped.status = 503;
    throw wrapped;
  }
  const exists = Array.isArray(data) && data.some((bucket) => bucket.name === BUCKET_NAME);
  if (exists) {
    return;
  }
  const { error: createError } = await client.storage.createBucket(BUCKET_NAME, { public: true });
  if (createError && !/exist/i.test(createError.message || "")) {
    const wrapped = new Error(createError.message || "Unable to create storage bucket.");
    wrapped.status = 503;
    throw wrapped;
  }
}

function parseDataUrl(dataUrl) {
  const trimmed = String(dataUrl || "").trim();
  if (!trimmed.startsWith("data:image/")) {
    const error = new Error("Avatar must be an image file.");
    error.status = 400;
    throw error;
  }
  const match = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(trimmed);
  if (!match) {
    const error = new Error("Avatar must be a base64 encoded image.");
    error.status = 400;
    throw error;
  }
  const contentType = match[1].toLowerCase();
  const extension = ALLOWED_TYPES.get(contentType);
  if (!extension) {
    const error = new Error("Unsupported image type. Use PNG, JPG, WEBP, or GIF.");
    error.status = 400;
    throw error;
  }
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length) {
    const error = new Error("Avatar file is empty.");
    error.status = 400;
    throw error;
  }
  if (buffer.length > MAX_AVATAR_BYTES) {
    const error = new Error("Avatar file must be 2MB or smaller.");
    error.status = 413;
    throw error;
  }
  return { buffer, contentType, extension };
}

function extractPathFromPublicUrl(publicUrl) {
  try {
    const url = new URL(publicUrl);
    const marker = "/storage/v1/object/public/";
    const index = url.pathname.indexOf(marker);
    if (index === -1) {
      return null;
    }
    const suffix = url.pathname.slice(index + marker.length);
    const [bucket, ...rest] = suffix.split("/");
    if (bucket !== BUCKET_NAME) {
      return null;
    }
    return rest.join("/");
  } catch (error) {
    return null;
  }
}

async function uploadAvatar(userId, dataUrl) {
  await ensureBucket();
  const { buffer, contentType, extension } = parseDataUrl(dataUrl);
  const filePath = `${userId}/${Date.now()}.${extension}`;
  const client = getClient();
  const { error } = await client.storage.from(BUCKET_NAME).upload(filePath, buffer, {
    contentType,
    upsert: true
  });
  if (error) {
    const wrapped = new Error(error.message || "Unable to upload avatar.");
    wrapped.status = 503;
    throw wrapped;
  }
  const { data } = client.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return { publicUrl: data.publicUrl, path: filePath };
}

async function removeAvatarByPublicUrl(publicUrl) {
  const path = extractPathFromPublicUrl(publicUrl);
  if (!path) {
    return;
  }
  const client = getClient();
  await client.storage.from(BUCKET_NAME).remove([path]);
}

module.exports = {
  uploadAvatar,
  removeAvatarByPublicUrl
};
