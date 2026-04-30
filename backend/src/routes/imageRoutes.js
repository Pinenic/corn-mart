// src/routes/imageRoutes.js
// ─────────────────────────────────────────────────────────────
// Shows how to wire the imageMiddleware and imageController into
// your existing route files. These snippets slot into the routes
// you already have — they are not a standalone file to copy verbatim.
// ─────────────────────────────────────────────────────────────

import express from "express";
import { imageUpload }  from "../middleware/imageMiddleware.js";
import { authenticate } from "../middleware/auth.js";
import {
  updateProfileAvatar, deleteProfileAvatar,
  updateStoreLogo, deleteStoreLogo,
  updateStoreBanner, deleteStoreBanner,
  addProductImages, deleteProductImage,
} from "../controllers/imageController.js";
import { requireStoreAccess } from "../middleware/storeAccess.js";
import { writeLimiter }       from "../middleware/rateLimit.js";

// ── Profile avatar (add to your existing user/profile router) ─
export const profileImageRoutes = express.Router();
profileImageRoutes.use(authenticate);

// PATCH /api/v1/users/me/avatar
profileImageRoutes.patch(
  "/avatar",
  writeLimiter,
  imageUpload.profile(),          // multer: single file, field "avatar", 2MB limit
  updateProfileAvatar
);

// DELETE /api/v1/users/me/avatar
profileImageRoutes.delete(
  "/avatar",
  writeLimiter,
  deleteProfileAvatar
);

// ── Store logo + banner (add to your existing store router) ───
export const storeImageRoutes = express.Router({ mergeParams: true });
storeImageRoutes.use(authenticate, requireStoreAccess);

// PATCH /api/v1/stores/:storeId/logo
storeImageRoutes.patch(
  "/logo",
  writeLimiter,
  imageUpload.logo(),             // single file, field "logo", 3MB limit
  updateStoreLogo
);

// DELETE /api/v1/stores/:storeId/logo
storeImageRoutes.delete(
  "/logo",
  writeLimiter,
  deleteStoreLogo
);

// PATCH /api/v1/stores/:storeId/banner
storeImageRoutes.patch(
  "/banner",
  writeLimiter,
  imageUpload.banner(),           // single file, field "banner", 6MB limit
  updateStoreBanner
);

// DELETE /api/v1/stores/:storeId/banner
storeImageRoutes.delete(
  "/banner",
  writeLimiter,
  deleteStoreBanner
);

// ── Product images (add to your existing product router) ──────
export const productImageRoutes = express.Router({ mergeParams: true });
productImageRoutes.use(authenticate, requireStoreAccess);

// POST /api/v1/stores/:storeId/products/:productId/images
productImageRoutes.post(
  "/",
  writeLimiter,
  imageUpload.productImages(3),   // up to 3 files, field "images", 10MB each
  addProductImages
);

// DELETE /api/v1/stores/:storeId/products/:productId/images/:imageId
productImageRoutes.delete(
  "/:imageId",
  writeLimiter,
  deleteProductImage
);