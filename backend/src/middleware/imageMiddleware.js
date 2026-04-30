// src/middleware/imageMiddleware.js
// ─────────────────────────────────────────────────────────────
// Multer middleware factory for image uploads.
//
// Always uses memoryStorage — files arrive as Buffer on req.files/req.file.
// imageManager.js handles the actual Supabase upload after the request lands.
//
// Usage in route files:
//
//   import { imageUpload } from "../middleware/imageMiddleware.js";
//
//   // Profile: single file, field name "avatar"
//   router.patch("/profile/avatar", imageUpload.profile(), profileController.updateAvatar);
//
//   // Store: single logo
//   router.patch("/:storeId/logo", imageUpload.logo(), storeController.updateLogo);
//
//   // Store: single banner
//   router.patch("/:storeId/banner", imageUpload.banner(), storeController.updateBanner);
//
//   // Products: up to 3 images, field name "images"
//   router.post("/:productId/images", imageUpload.productImages(), productController.addImage);
// ─────────────────────────────────────────────────────────────

import multer from "multer";
import { SIZE_LIMITS } from "../services/images/imageProcessor.js";

// ── Allowed MIME type filter ──────────────────────────────────
// Multer rejects non-image files before they reach the controller.
// imageProcessor.js does a second validation pass with a detailed error.
function imageFileFilter(_req, file, cb) {
  const allowed = [
    "image/jpeg", "image/jpg", "image/png",
    "image/webp", "image/gif", "image/avif",
  ];
  if (allowed.includes(file.mimetype?.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error(`File type "${file.mimetype}" is not allowed. Use JPEG, PNG, WEBP, GIF, or AVIF.`), {
        statusCode: 415,
        code:       "UNSUPPORTED_MEDIA_TYPE",
      }),
      false
    );
  }
}

// ── Base multer instance ──────────────────────────────────────
// Memory storage — buffer available as file.buffer in the controller.
function makeUploader(fileSizeLimit) {
  return multer({
    storage:    multer.memoryStorage(),
    limits:     { fileSize: fileSizeLimit },
    fileFilter: imageFileFilter,
  });
}

// ── Multer error handler middleware ───────────────────────────
// Wraps a multer middleware and converts MulterErrors into the
// standard API error shape before passing to the global error handler.
function withMulterErrors(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (!err) return next();

      if (err.code === "LIMIT_FILE_SIZE") {
        return next({
          statusCode: 413,
          code:       "FILE_TOO_LARGE",
          message:    `File exceeds the size limit for this upload type`,
        });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return next({
          statusCode: 400,
          code:       "TOO_MANY_FILES",
          message:    err.message ?? "Too many files",
        });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next({
          statusCode: 400,
          code:       "UNEXPECTED_FIELD",
          message:    `Unexpected field "${err.field}" — check the field name in your request`,
        });
      }

      // Pass through application errors (from fileFilter) or unknown multer errors
      next(err);
    });
  };
}

// ── Public middleware factory ─────────────────────────────────
export const imageUpload = {
  // Single profile picture — field: "avatar"
  profile: () => withMulterErrors(
    makeUploader(SIZE_LIMITS.profile).single("avatar")
  ),

  // Single store logo — field: "logo"
  logo: () => withMulterErrors(
    makeUploader(SIZE_LIMITS.logo).single("logo")
  ),

  // Single store banner — field: "banner"
  banner: () => withMulterErrors(
    makeUploader(SIZE_LIMITS.banner).single("banner")
  ),

  // Up to 3 product images — field: "images"
  productImages: (maxCount = 3) => withMulterErrors(
    makeUploader(SIZE_LIMITS.product).array("images", maxCount)
  ),

  // Generic single-file upload with a custom field name
  single: (fieldName, maxSize = SIZE_LIMITS.default) => withMulterErrors(
    makeUploader(maxSize).single(fieldName)
  ),

  // Generic multi-file upload with a custom field name
  array: (fieldName, maxCount = 5, maxSize = SIZE_LIMITS.default) => withMulterErrors(
    makeUploader(maxSize).array(fieldName, maxCount)
  ),
};