// src/images/imageStorage.js
// ─────────────────────────────────────────────────────────────
// Pure Supabase Storage primitives.
// No business logic, no HTTP concerns, no validation.
// Every function throws a plain object with { statusCode, code, message }
// so the caller can wrap it in a proper ApiError.
//
// All uploads go into the single "user_uploads" bucket.
// Sub-directories inside the bucket are controlled by the `folder` argument:
//
//   profiles/                     → user profile pictures
//   stores/<storeId>/             → store logos and banners
//   stores/<storeId>/products/<productId>/  → product images
//
// Supabase Storage path rules (enforced by imageProcessor before we get here):
//   - No leading slash
//   - Segments separated by /
//   - No consecutive slashes
//   - Filenames: alphanumeric, hyphens, underscores, dots only
// ─────────────────────────────────────────────────────────────

import { supabaseAdmin } from "../../config/supabase.js";

const BUCKET = "user_uploads";

// ── Upload ────────────────────────────────────────────────────
// Uploads a single file buffer to Supabase Storage.
// Returns { path, publicUrl }.
//
// Parameters:
//   buffer    — Buffer from multer's memory storage
//   mimeType  — e.g. "image/jpeg"
//   storagePath — full path inside the bucket, e.g. "stores/abc/logo.jpg"
//   upsert    — if true, overwrites an existing file at the same path.
//               Use false for new uploads, true for replacements.
export async function storageUpload({ buffer, mimeType, storagePath, upsert = false }) {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert,
      // Supabase Storage caches aggressively by default.
      // Cache-Control: no-cache on replacements ensures CDN serves the new file.
      cacheControl: upsert ? "no-cache" : "3600",
    });

  if (error) {
    throw {
      statusCode: 500,
      code:       "STORAGE_UPLOAD_ERROR",
      message:    error.message ?? "Failed to upload file to storage",
    };
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);

  return {
    path:      storagePath,
    publicUrl: data.publicUrl,
  };
}

// ── Delete ────────────────────────────────────────────────────
// Deletes one or more files from Supabase Storage.
// Accepts either a single storagePath string or an array of them.
// Silent if a file doesn't exist (Supabase returns no error for missing files).
export async function storageDelete(storagePaths) {
  const paths = Array.isArray(storagePaths) ? storagePaths : [storagePaths];

  // Filter out any nulls/undefineds that might come from records with no image
  const valid = paths.filter(Boolean);
  if (valid.length === 0) return;

  const { error } = await supabaseAdmin.storage.from(BUCKET).remove(valid);

  if (error) {
    throw {
      statusCode: 500,
      code:       "STORAGE_DELETE_ERROR",
      message:    error.message ?? "Failed to delete file(s) from storage",
    };
  }
}

// ── Extract path from public URL ──────────────────────────────
// Supabase public URLs look like:
//   https://<project>.supabase.co/storage/v1/object/public/user_uploads/stores/abc/logo.jpg
//
// To delete a file we need the storage path ("stores/abc/logo.jpg"),
// not the full URL. This function extracts it.
//
// Returns null if the URL doesn't look like a Supabase Storage URL for this bucket.
export function extractPathFromUrl(publicUrl) {
  if (!publicUrl) return null;
  try {
    const marker = `/object/public/${BUCKET}/`;
    const idx    = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(publicUrl.slice(idx + marker.length));
  } catch {
    return null;
  }
}

// ── List files in a folder ────────────────────────────────────
// Useful for cleaning up all images for a deleted product or store.
// Returns an array of storage paths.
export async function storageListFolder(folder) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .list(folder, { limit: 1000, offset: 0 });

  if (error) {
    throw {
      statusCode: 500,
      code:       "STORAGE_LIST_ERROR",
      message:    error.message ?? "Failed to list folder in storage",
    };
  }

  return (data ?? [])
    .filter(item => item.name && !item.name.endsWith("/"))   // skip sub-folders
    .map(item => `${folder}/${item.name}`);
}