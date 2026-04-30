// src/routes/categories.js
// Categories are global reference data — readable by any authenticated user.
// No store ownership check needed.
import express from "express";
import categoryController from "../controllers/categoryController.js";
import { authenticate }   from "../middleware/auth.js";
import { readLimiter }    from "../middleware/rateLimit.js";

const router = express.Router();

router.use(authenticate);

// GET /api/v1/categories
// All categories with nested subcategories
router.get("/", readLimiter, categoryController.getAll);

// GET /api/v1/categories/flat
// Flat list for dropdowns — no nested subs
// Must be before /:categoryId to avoid "flat" matching as an ID
router.get("/flat", readLimiter, categoryController.getFlat);

// GET /api/v1/categories/:categoryId/subcategories
router.get(
  "/:categoryId/subcategories",
  readLimiter,
  categoryController.getSubcategories
);

export default router;
