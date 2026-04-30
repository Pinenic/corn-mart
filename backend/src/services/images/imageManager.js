// src/images/imageManager.js
// ─────────────────────────────────────────────────────────────
// The public API for all image operations across the platform.
//
// This is the ONLY file controllers should import for image work.
// It combines imageProcessor (validation + naming) and imageStorage
// (Supabase operations) into a clean, use-case-agnostic interface.
//
// The `folder` parameter is the only thing that changes between
// use-cases — controllers pass the right folder for their context:
//
//   User profile:
//     folder: `profiles/${userId}`
//
//   Store logo:
//     folder: `stores/${storeId}`
//
//   Store banner:
//     folder: `stores/${storeId}`
//
//   Product images:
//     folder: `stores/${storeId}/products/${productId}`
//
// Operations:
//   uploadOne(file, folder, options)           → { path, publicUrl }
//   uploadMany(files, folder, options)         → [{ path, publicUrl }, ...]
//   replaceOne(file, folder, oldUrl, options)  → { path, publicUrl }
//   deleteOne(publicUrl)                       → void
//   deleteMany(publicUrls)                     → void
//   deleteFolder(folder)                       → void  (e.g. when a product is deleted)
// ─────────────────────────────────────────────────────────────

import logger                                              from "../../utils/logger.js";
import { validateFile, processBatch, SIZE_LIMITS }         from "./imageProcessor.js";
import { storageUpload, storageDelete,
         storageListFolder, extractPathFromUrl }           from "./imageStorage.js";

// ── uploadOne ─────────────────────────────────────────────────
// Upload a single image to storage.
//
// Parameters:
//   file    — multer file object { buffer, mimetype, size, originalname }
//   folder  — storage sub-directory (see header for conventions)
//   options — { maxSize?: number }
//
// Returns: { path: string, publicUrl: string }
export async function uploadOne(file, folder, options = {}) {
  const maxSize = options.maxSize ?? SIZE_LIMITS.default;

  const [{ file: validFile, storagePath }] = processBatch([file], folder, maxSize);

  const result = await storageUpload({
    buffer:      validFile.buffer,
    mimeType:    validFile.mimetype,
    storagePath,
    upsert:      false,
  });

  logger.info("Image uploaded", { storagePath: result.path });
  return result;
}

// ── uploadMany ────────────────────────────────────────────────
// Upload multiple images to the same folder.
// Uploads run in parallel — all-or-nothing: if any upload fails,
// the error is thrown and already-uploaded files are cleaned up.
//
// Parameters:
//   files   — array of multer file objects
//   folder  — storage sub-directory
//   options — { maxSize?: number, maxCount?: number }
//
// Returns: [{ path, publicUrl }, ...]
export async function uploadMany(files, folder, options = {}) {
  const maxSize  = options.maxSize  ?? SIZE_LIMITS.default;
  const maxCount = options.maxCount ?? 10;

  if (files.length > maxCount) {
    throw {
      statusCode: 400,
      code:       "TOO_MANY_FILES",
      message:    `Maximum ${maxCount} files allowed per upload, received ${files.length}`,
    };
  }

  const processed = processBatch(files, folder, maxSize);

  // Upload all in parallel and clean up on partial failure
  const uploaded = [];
  try {
    const results = await Promise.all(
      processed.map(({ file, storagePath }) =>
        storageUpload({
          buffer:      file.buffer,
          mimeType:    file.mimetype,
          storagePath,
          upsert:      false,
        })
      )
    );
    uploaded.push(...results);
    logger.info("Images uploaded", { count: results.length, folder });
    return results;
  } catch (err) {
    // Clean up anything that succeeded before the failure
    if (uploaded.length > 0) {
      await storageDelete(uploaded.map(u => u.path)).catch(e =>
        logger.warn("Cleanup of partial upload failed", { error: e.message })
      );
    }
    throw err;
  }
}

// ── replaceOne ────────────────────────────────────────────────
// Replace an existing image with a new one.
//
// Strategy: upload the new file with a FRESH UUID path, then delete
// the old file. This means:
//   1. The new URL is always different — CDN caches are busted automatically.
//   2. A failed delete doesn't roll back the upload (the new image is safe).
//   3. The old file is orphaned at worst, not lost.
//
// Parameters:
//   file    — new multer file object
//   folder  — storage sub-directory (same folder as the old file)
//   oldUrl  — the current publicUrl stored in the database, OR the storage
//              path if you already extracted it. Pass null/undefined to
//              skip deletion (functionally equivalent to uploadOne).
//   options — { maxSize?: number }
//
// Returns: { path: string, publicUrl: string }
export async function replaceOne(file, folder, oldUrl, options = {}) {
  // 1. Upload new file first — if this fails, nothing changes
  const newImage = await uploadOne(file, folder, options);

  // 2. Delete the old file — non-fatal, never rolls back the upload
  if (oldUrl) {
    const oldPath = extractPathFromUrl(oldUrl) ?? oldUrl;
    await storageDelete(oldPath).catch(err =>
      logger.warn("Old image delete failed (non-fatal)", {
        oldPath,
        error: err.message,
      })
    );
  }

  logger.info("Image replaced", { newPath: newImage.path });
  return newImage;
}

// ── deleteOne ─────────────────────────────────────────────────
// Delete a single image by its public URL (as stored in the DB).
// Silent if the file no longer exists in storage.
//
// Parameters:
//   publicUrl — the URL stored in the database field (logo, banner, thumbnail_url, etc.)
export async function deleteOne(publicUrl) {
  if (!publicUrl) return;
  const path = extractPathFromUrl(publicUrl) ?? publicUrl;
  await storageDelete(path);
  logger.info("Image deleted", { path });
}

// ── deleteMany ────────────────────────────────────────────────
// Delete multiple images by their public URLs.
// Runs as a single Supabase batch call.
//
// Parameters:
//   publicUrls — array of URLs stored in DB (nulls are filtered out)
export async function deleteMany(publicUrls) {
  if (!Array.isArray(publicUrls) || publicUrls.length === 0) return;

  const paths = publicUrls
    .filter(Boolean)
    .map(url => extractPathFromUrl(url) ?? url);

  if (paths.length === 0) return;

  await storageDelete(paths);
  logger.info("Images deleted", { count: paths.length });
}

// ── deleteFolder ──────────────────────────────────────────────
// Delete ALL images inside a storage folder.
// Use this when deleting a product or store — clean up the entire directory.
// Non-fatal if the folder is already empty or doesn't exist.
//
// Parameters:
//   folder — storage sub-directory, e.g. "stores/abc/products/xyz"
export async function deleteFolder(folder) {
  if (!folder) return;

  let paths;
  try {
    paths = await storageListFolder(folder);
  } catch (err) {
    logger.warn("Could not list folder for deletion (non-fatal)", {
      folder, error: err.message,
    });
    return;
  }

  if (paths.length === 0) return;

  await storageDelete(paths);
  logger.info("Folder deleted", { folder, count: paths.length });
}

// ── SIZE_LIMITS re-export ─────────────────────────────────────
// Controllers use this to pass the right size limit for each use-case.
export { SIZE_LIMITS };