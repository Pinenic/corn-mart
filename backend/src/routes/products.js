// src/routes/products.js
import express from "express";
import productController                      from "../controllers/productController.js";
import { authenticate }                       from "../middleware/auth.js";
import { requireStoreAccess }                 from "../middleware/storeAccess.js";
import { validateBody, validateQuery }        from "../middleware/validate.js";
import { schemas }                            from "../middleware/validate.js";
import { writeLimiter, readLimiter }          from "../middleware/rateLimit.js";
import { upload }                             from "../middleware/multerConfig.js";
import { productImageRoutes } from "./imageRoutes.js";

const router = express.Router({ mergeParams: true });

router.use(authenticate, requireStoreAccess);

// ── Products ──────────────────────────────────────────────────

// GET  /api/v1/stores/:storeId/products
router.get(
  "/",
  readLimiter,
  validateQuery(schemas.productQuery),
  productController.list
);

// POST /api/v1/stores/:storeId/products
router.post(
  "/",
  writeLimiter,
  validateBody(schemas.createProduct),
  productController.create
);

// GET  /api/v1/stores/:storeId/products/:productId
router.get("/:productId", readLimiter, productController.getOne);

// PATCH /api/v1/stores/:storeId/products/:productId
router.patch(
  "/:productId",
  writeLimiter,
  validateBody(schemas.updateProduct),
  productController.update
);

// DELETE /api/v1/stores/:storeId/products/:productId
// Soft delete — sets is_active = false
router.delete("/:productId", writeLimiter, productController.delete);

// ── Variants ──────────────────────────────────────────────────

// GET  /api/v1/stores/:storeId/products/:productId/variants
router.get("/:productId/variants", readLimiter, productController.listVariants);

// POST /api/v1/stores/:storeId/products/:productId/variants
router.post(
  "/:productId/variants",
  writeLimiter,
  validateBody(schemas.createVariant),
  productController.createVariant
);

// PATCH /api/v1/stores/:storeId/products/:productId/variants/:variantId
router.patch(
  "/:productId/variants/:variantId",
  writeLimiter,
  validateBody(schemas.updateVariant),
  productController.updateVariant
);

// DELETE /api/v1/stores/:storeId/products/:productId/variants/:variantId
router.delete(
  "/:productId/variants/:variantId",
  writeLimiter,
  productController.deleteVariant
);

// ── Images ────────────────────────────────────────────────────

// PATCH /api/v1/stores/:storeId/products/:productId/images/reorder
// Must be defined BEFORE /:imageId to prevent "reorder" matching as an ID
router.patch(
  "/:productId/images/reorder",
  writeLimiter,
  validateBody(schemas.reorderImages),
  productController.reorderImages
);

// POST /api/v1/stores/:storeId/products/:productId/images
// router.post(
//   "/:productId/images",
//   writeLimiter,
//   upload.array("images", 3),
//   productController.addImage
// );

// // DELETE /api/v1/stores/:storeId/products/:productId/images/:imageId
// router.delete(
//   "/:productId/images/:imageId",
//   writeLimiter,
//   productController.deleteImage
// );

// ── Images (modular routes) ───────────────────────────────────

// mounts:
// /api/v1/stores/:storeId/products/:productId/images/*
router.use("/:productId/images", productImageRoutes);

export default router;
