// src/routes/stock.js
// Mount under: /api/v1/stores/:storeId  (mergeParams: true)
import express                from "express";
import { authenticate }       from "../middleware/auth.js";
import { requireStoreAccess } from "../middleware/storeAccess.js";
import { validateBody, validateQuery, schemas } from "../middleware/validate.js";
import { readLimiter, writeLimiter }            from "../middleware/rateLimit.js";
import Joi from "joi";
import {
  listEntries, getSummary, getEntry,
  createEntry, updateEntry, deleteEntry,
  linkPendingEntries,
} from "../controllers/stockController.js";

const router = express.Router({ mergeParams: true });
router.use(authenticate, requireStoreAccess);

// ── Validation schemas ──────────────────────────────────────────

const listQuery = Joi.object({
  page:       Joi.number().integer().min(1).default(1),
  limit:      Joi.number().integer().min(1).max(100).default(25),
  product_id: Joi.string().uuid().allow(null, ""),
  date_from:  Joi.string().isoDate().allow(null, ""),
  date_to:    Joi.string().isoDate().allow(null, ""),
  search:     Joi.string().max(200).allow(null, ""),
  // "all" (default) | "listed" | "pending"
  // Filters entries by whether product_id is set.
  status:     Joi.string().valid("all", "listed", "pending").default("all"),
});

// product_id and pending_product_name are mutually exclusive and
// at least one is required — mirrors the DB check constraint.
// variant_id is only allowed alongside product_id.
const createBody = Joi.object({
  product_id:           Joi.string().uuid().allow(null),
  pending_product_name: Joi.string().trim().max(200).allow(null),
  variant_id:           Joi.string().uuid().allow(null, "")
                          .when("product_id", {
                            is:   Joi.exist().not(null),
                            then: Joi.optional(),
                            // Block variant_id when there's no real product —
                            // matches the DB constraint, fails fast client-side.
                            // otherwise: Joi.forbidden().messages({
                            //   "any.unknown": "variant_id cannot be set without product_id",
                            // }),
                          }),
  supplier:      Joi.string().max(200).allow(null, ""),
  quantity:      Joi.number().integer().not(0).required(),
  unit_cost:     Joi.number().min(0).required(),
  total_cost:    Joi.number().min(0).required(),
  entry_date:    Joi.string().isoDate().required(),
  notes:         Joi.string().max(1000).allow(null, ""),
  is_adjustment: Joi.boolean().default(false),
})
  // .xor("product_id", "pending_product_name")
  // .messages({
  //   "object.xor": "Provide either product_id (for a listed product) or pending_product_name (for one not yet listed) — not both, not neither.",
  // });

// Partial updates — mutual exclusivity is enforced in the service layer
// since only changed fields are sent and Joi's .xor() doesn't compose
// well with .min(1) partial-update schemas.
const updateBody = Joi.object({
  product_id:           Joi.string().uuid().allow(null,""),
  pending_product_name: Joi.string().trim().max(200).allow(null,""),
  supplier:             Joi.string().max(200).allow(null, ""),
  variant_id:           Joi.string().uuid().allow(null, ""),
  quantity:             Joi.number().integer().not(0),
  unit_cost:            Joi.number().min(0),
  total_cost:           Joi.number().min(0),
  entry_date:           Joi.string().isoDate(),
  notes:                Joi.string().max(1000).allow(null, ""),
  is_adjustment:        Joi.boolean(),
}).min(1);

const summaryQuery = Joi.object({
  date_from: Joi.string().isoDate().allow(null, ""),
  date_to:   Joi.string().isoDate().allow(null, ""),
});

// Linking all pending entries with a given name to a newly-listed product.
const linkBody = Joi.object({
  pending_product_name: Joi.string().trim().max(200).required(),
  product_id:           Joi.string().uuid().required(),
  // Optionally assign a specific variant to all linked entries.
  variant_id:           Joi.string().uuid().allow(null),
});

// ── Routes ─────────────────────────────────────────────────────

// GET  /api/v1/stores/:storeId/stock/summary   — must come before /:entryId
router.get("/summary",   readLimiter,  validateQuery(summaryQuery), getSummary);

// POST /api/v1/stores/:storeId/stock/link-pending
// Bulk-links every stock_entries row matching pending_product_name to a
// real product_id. Must come before /:entryId to avoid "link-pending"
// being matched as an :entryId param.
router.post("/link-pending", writeLimiter, validateBody(linkBody), linkPendingEntries);

// GET  /api/v1/stores/:storeId/stock
router.get("/",          readLimiter,  validateQuery(listQuery),    listEntries);

// POST /api/v1/stores/:storeId/stock
router.post("/",         writeLimiter, validateBody(createBody),    createEntry);

// GET  /api/v1/stores/:storeId/stock/:entryId
router.get("/:entryId",  readLimiter,                               getEntry);

// PATCH /api/v1/stores/:storeId/stock/:entryId
router.patch("/:entryId", writeLimiter, validateBody(updateBody),   updateEntry);

// DELETE /api/v1/stores/:storeId/stock/:entryId
router.delete("/:entryId", writeLimiter,                            deleteEntry);

export default router;

/* ── How to mount in src/routes/index.js ──────────────────────
import stockRoutes from "./stock.js";
router.use("/stores/:storeId/stock", stockRoutes);
─────────────────────────────────────────────────────────────── */
