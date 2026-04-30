// src/routes/marketplace/products.js
import express from "express";
import marketplaceProductController from "../../controllers/marketplace/marketplaceProductController.js";
import { validateQuery }            from "../../middleware/validate.js";
import { schemas }                  from "../../middleware/validate.js";
import { publicLimiter }            from "../../middleware/rateLimit.js";

const router = express.Router();

// All product browse endpoints are fully public — no auth required.

// GET /api/v1/marketplace/products
router.get(
  "/",
  publicLimiter,
  validateQuery(schemas.marketplaceProductQuery),
  marketplaceProductController.list
);

// GET /api/v1/marketplace/products/:productId
router.get(
  "/:productId",
  publicLimiter,
  marketplaceProductController.getOne
);

export default router;
