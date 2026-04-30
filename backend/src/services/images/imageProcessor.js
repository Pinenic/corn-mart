// src/images/imageProcessor.js
// ─────────────────────────────────────────────────────────────
// Validates incoming file buffers and generates Supabase-safe
// storage paths. No network calls — pure computation.
//
// Supabase Storage naming rules we enforce:
//   - Lowercase letters, digits, hyphens, underscores, dots only
//   - No spaces (Supabase will reject them)
//   - No consecutive dots or slashes
//   - Path segments joined with /
//
// Filename strategy:
//   <uuid>.<ext>   — random UUID so filenames never collide and
//                    can't be guessed from user input.
//   The UUID replaces the original filename entirely; the original
//   is never used. This prevents path traversal and encoding issues.
// ─────────────────────────────────────────────────────────────

import crypto from "crypto";

// ── Allowed MIME types ────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

// Map MIME type → file extension (canonical form)
const MIME_TO_EXT = {
  "image/jpeg": "jpg",
  "image/jpg":  "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/gif":  "gif",
  "image/avif": "avif",
};

// ── Size limits per use-case ──────────────────────────────────
// These are the defaults. The middleware factory can override them.
export const SIZE_LIMITS = {
  profile:  2  * 1024 * 1024,  //  2 MB — profile pictures
  logo:     3  * 1024 * 1024,  //  3 MB — store logos
  banner:   6  * 1024 * 1024,  //  6 MB — store banners (wider images)
  product:  10 * 1024 * 1024,  // 10 MB — product images (highest quality)
  default:  10 * 1024 * 1024,  // 10 MB — fallback
};

// ── Validate a single file ────────────────────────────────────
// Throws if invalid, returns the canonical extension if valid.
//
// Parameters:
//   file    — multer file object { mimetype, size, originalname }
//   maxSize — max allowed bytes (from SIZE_LIMITS above)
export function validateFile(file, maxSize = SIZE_LIMITS.default) {
  if (!file?.buffer) {
    throw {
      statusCode: 400,
      code:       "MISSING_FILE_BUFFER",
      message:    "File buffer is missing — use memory storage in multer",
    };
  }

  const mime = file.mimetype?.toLowerCase();

  if (!mime || !ALLOWED_MIME_TYPES.has(mime)) {
    throw {
      statusCode: 415,
      code:       "UNSUPPORTED_MEDIA_TYPE",
      message:    `File type "${mime ?? "unknown"}" is not allowed. Accepted: JPEG, PNG, WEBP, GIF, AVIF`,
    };
  }

  if (file.size > maxSize) {
    const mbLimit = (maxSize / (1024 * 1024)).toFixed(0);
    const mbActual = (file.size / (1024 * 1024)).toFixed(1);
    throw {
      statusCode: 413,
      code:       "FILE_TOO_LARGE",
      message:    `File is ${mbActual} MB — maximum allowed is ${mbLimit} MB`,
    };
  }

  return MIME_TO_EXT[mime];
}

// ── Sanitise folder path ──────────────────────────────────────
// Strips leading/trailing slashes, collapses doubles, removes any
// characters that Supabase Storage rejects.
export function sanitiseFolder(folder) {
  if (!folder || typeof folder !== "string") {
    throw {
      statusCode: 500,
      code:       "INVALID_FOLDER",
      message:    "A storage folder path is required",
    };
  }

  const clean = folder
    .trim()
    .replace(/\\/g, "/")          // normalise backslashes
    .replace(/\/+/g, "/")         // collapse consecutive slashes
    .replace(/^\/|\/$/g, "")      // strip leading/trailing slashes
    .replace(/[^a-zA-Z0-9/_\-.]/g, "-");  // replace unsafe chars with hyphen

  if (!clean) {
    throw {
      statusCode: 500,
      code:       "INVALID_FOLDER",
      message:    `Folder path "${folder}" resolved to an empty string after sanitisation`,
    };
  }

  return clean;
}

// ── Generate a storage path for a new file ────────────────────
// Returns a full storage path: "<folder>/<uuid>.<ext>"
// The UUID ensures:
//   1. No collisions even with concurrent uploads
//   2. No information leakage from original filenames
//   3. Cache-busting on replacement (new UUID = new URL)
export function generateStoragePath(folder, mimeType) {
  const safeFolder = sanitiseFolder(folder);
  const ext        = MIME_TO_EXT[mimeType?.toLowerCase()];

  if (!ext) {
    throw {
      statusCode: 415,
      code:       "UNSUPPORTED_MEDIA_TYPE",
      message:    `Cannot generate a path for MIME type "${mimeType}"`,
    };
  }

  const filename = `${crypto.randomUUID()}.${ext}`;
  return `${safeFolder}/${filename}`;
}

// ── Process a batch of files ──────────────────────────────────
// Validates all files in the batch and generates their storage paths.
// Fails fast on the first invalid file.
//
// Returns an array of { file, storagePath } objects ready to upload.
export function processBatch(files, folder, maxSize = SIZE_LIMITS.default) {
  if (!Array.isArray(files) || files.length === 0) {
    throw {
      statusCode: 400,
      code:       "NO_FILES",
      message:    "At least one file is required",
    };
  }

  return files.map((file, index) => {
    let ext;
    try {
      ext = validateFile(file, maxSize);
    } catch (err) {
      // Enrich the error with the file index for better debugging
      throw {
        ...err,
        message: `File ${index + 1}${file.originalname ? ` ("${file.originalname}")` : ""}: ${err.message}`,
      };
    }

    return {
      file,
      storagePath: generateStoragePath(folder, file.mimetype),
    };
  });
}