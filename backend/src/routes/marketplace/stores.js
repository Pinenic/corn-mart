// src/routes/marketplace/stores.js
import express from "express";
import marketplaceStoreController       from "../../controllers/marketplace/marketplaceStoreController.js";
import { optionalAuth, authenticate }   from "../../middleware/auth.js";
import { validateQuery }                from "../../middleware/validate.js";
import { schemas }                      from "../../middleware/validate.js";
import { publicLimiter, writeLimiter }  from "../../middleware/rateLimit.js";

const router = express.Router();

// ── Public browse ─────────────────────────────────────────────
// optionalAuth: logged-in users get enhanced responses (follow status)
// but a token is not required to browse.

// GET /api/v1/marketplace/stores
router.get(
  "/",
  publicLimiter,
  optionalAuth,
  validateQuery(schemas.marketplaceStoreQuery),
  marketplaceStoreController.list
);

// GET /api/v1/marketplace/stores/:storeId
router.get(
  "/:storeId",
  publicLimiter,
  optionalAuth,
  marketplaceStoreController.getOne
);

// GET /api/v1/marketplace/stores/:storeId/products
router.get(
  "/:storeId/products",
  publicLimiter,
  optionalAuth,
  validateQuery(schemas.marketplaceProductQuery),
  marketplaceStoreController.getProducts
);

// GET /api/v1/marketplace/stores/:storeId/locations
router.get(
  "/:storeId/locations",
  publicLimiter,
  marketplaceStoreController.getLocations
);

// ── Authenticated: follow / unfollow ──────────────────────────

// POST /api/v1/marketplace/stores/:storeId/follow
router.post(
  "/:storeId/follow",
  writeLimiter,
  authenticate,
  marketplaceStoreController.follow
);

// DELETE /api/v1/marketplace/stores/:storeId/follow
router.delete(
  "/:storeId/follow",
  writeLimiter,
  authenticate,
  marketplaceStoreController.unfollow
);

export default router;
