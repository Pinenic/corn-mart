// src/controllers/stockController.js
import stockService  from "../services/stockService.js";
import response      from "../utils/response.js";
import asyncHandler  from "../utils/asyncHandler.js";

// GET /api/v1/stores/:storeId/stock
export const listEntries = asyncHandler(async (req, res) => {
  const { entries, total } = await stockService.list(req.store.id, req.query);
  return response.ok(
    res, entries,
    response.pageMeta({ page: req.query.page, limit: req.query.limit, total })
  );
});

// GET /api/v1/stores/:storeId/stock/summary
export const getSummary = asyncHandler(async (req, res) => {
  const summary = await stockService.getSummary(req.store.id, req.query);
  return response.ok(res, summary);
});

// GET /api/v1/stores/:storeId/stock/:entryId
export const getEntry = asyncHandler(async (req, res) => {
  const entry = await stockService.getById(req.store.id, req.params.entryId);
  if (!entry) return response.notFound(res, "Stock entry not found");
  return response.ok(res, entry);
});

// POST /api/v1/stores/:storeId/stock
// Accepts either { product_id } for a listed product, or
// { pending_product_name } for stock bought before listing.
export const createEntry = asyncHandler(async (req, res) => {
  const entry = await stockService.create(req.store.id, req.body);
  return response.created(res, entry);
});

// PATCH /api/v1/stores/:storeId/stock/:entryId
export const updateEntry = asyncHandler(async (req, res) => {
  const entry = await stockService.update(req.store.id, req.params.entryId, req.body);
  if (!entry) return response.notFound(res, "Stock entry not found");
  return response.ok(res, entry);
});

// DELETE /api/v1/stores/:storeId/stock/:entryId
export const deleteEntry = asyncHandler(async (req, res) => {
  const deleted = await stockService.delete(req.store.id, req.params.entryId);
  if (!deleted) return response.notFound(res, "Stock entry not found");
  return response.noContent(res);
});

// POST /api/v1/stores/:storeId/stock/link-pending
// Bulk-links every entry with the given pending_product_name to a
// real product_id (and optionally a specific variant_id), then
// credits the variant's stock for the total quantity linked.
//
// Body: { pending_product_name, product_id, variant_id? }
//
// Typical caller: after the seller finishes the "create product" flow
// for an item they'd already logged purchases for, the frontend calls
// this with the pending name they used and the new product's id.
export const linkPendingEntries = asyncHandler(async (req, res) => {
  const { pending_product_name, product_id, variant_id } = req.body;

  const result = await stockService.linkPendingEntries(req.store.id, {
    pendingProductName: pending_product_name,
    productId:          product_id,
    variantId:          variant_id ?? null,
  });

  if (result.linked === 0) {
    return response.notFound(
      res,
      `No pending entries found matching "${pending_product_name}"`
    );
  }

  return response.ok(res, result);
});
