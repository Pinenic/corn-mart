// src/routes/imageRoutes.js
// ─────────────────────────────────────────────────────────────
// Shows how to wire the imageMiddleware and imageController into
// your existing route files. These snippets slot into the routes
// you already have — they are not a standalone file to copy verbatim.
//
// NOTE ON MOUNTING productImageRoutes:
// Previously this router represented the "/images" sub-path and was
// mounted at:
//   app.use("/api/v1/stores/:storeId/products/:productId/images", productImageRoutes)
// It now represents the whole "/products/:productId" scope (because
// slots live under /variants/:variantId/images/:slotIndex), so mount
// it one level up instead:
//   app.use("/api/v1/stores/:storeId/products/:productId", productImageRoutes)
// ─────────────────────────────────────────────────────────────

import express from "express";
import { imageUpload }  from "../middleware/imageMiddleware.js";
import { authenticate } from "../middleware/auth.js";
import {
  updateProfileAvatar, deleteProfileAvatar,
  updateStoreLogo, deleteStoreLogo,
  updateStoreBanner, deleteStoreBanner,
  upsertVariantImageSlot, deleteVariantImageSlot,
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
// Mount at /api/v1/stores/:storeId/products/:productId — see note above.
export const productImageRoutes = express.Router({ mergeParams: true });
productImageRoutes.use(authenticate, requireStoreAccess);

// PUT /api/v1/stores/:storeId/products/:productId/variants/:variantId/images/:slotIndex
// Upserts a single image into slot 0/1/2 of a variant — creates if
// the slot is empty, replaces in place (old file removed) if occupied.
productImageRoutes.put(
  "/variants/:variantId/images/:slotIndex",
  writeLimiter,
  imageUpload.productImageSlot(),   // single file, field "image", 10MB limit
  upsertVariantImageSlot
);

// DELETE /api/v1/stores/:storeId/products/:productId/variants/:variantId/images/:slotIndex
productImageRoutes.delete(
  "/variants/:variantId/images/:slotIndex",
  writeLimiter,
  deleteVariantImageSlot
);