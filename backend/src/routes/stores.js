// src/routes/stores.js
import express from "express";
import storeController              from "../controllers/storeController.js";
import { authenticate }             from "../middleware/auth.js";
import { requireStoreAccess }       from "../middleware/storeAccess.js";
import { validateBody }             from "../middleware/validate.js";
import { schemas }                  from "../middleware/validate.js";
import { writeLimiter, readLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

// All store routes require authentication
router.use(authenticate);

// ── Store profile ─────────────────────────────────────────────

// GET /api/v1/stores/mine
// Returns all stores owned by the current user.
// Must be defined before /:storeId to avoid "mine" being treated as an ID.
router.post("/onboarding", readLimiter, storeController.createOne)
router.get("/mine", readLimiter, storeController.getMine);

// GET /api/v1/stores/:storeId
router.get("/:storeId", readLimiter, requireStoreAccess, storeController.getOne);

// PATCH /api/v1/stores/:storeId
router.patch(
  "/:storeId",
  writeLimiter,
  requireStoreAccess,
  validateBody(schemas.updateStore),
  storeController.update
);

// ── Locations ─────────────────────────────────────────────────

// GET /api/v1/stores/:storeId/locations
router.get(
  "/:storeId/locations",
  readLimiter,
  requireStoreAccess,
  storeController.getLocations
);

// POST /api/v1/stores/:storeId/locations
router.post(
  "/:storeId/locations",
  writeLimiter,
  requireStoreAccess,
  validateBody(schemas.location),
  storeController.createLocation
);

// PATCH /api/v1/stores/:storeId/locations/:locationId
router.patch(
  "/:storeId/locations/:locationId",
  writeLimiter,
  requireStoreAccess,
  validateBody(schemas.location),
  storeController.updateLocation
);

// DELETE /api/v1/stores/:storeId/locations/:locationId
router.delete(
  "/:storeId/locations/:locationId",
  writeLimiter,
  requireStoreAccess,
  storeController.deleteLocation
);

export default router;
