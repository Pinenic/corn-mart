// src/services/orderService.js
// All database operations for store_orders and store_order_status_history.
//
// NOTE on schema assumption:
// The provided schema doesn't include an order_items / store_order_items
// table, but there must be one (orders need line items). This service
// assumes a `store_order_items` table with at minimum:
//   store_order_id, product_id, variant_id, quantity, unit_price
// If your table is named differently, adjust the select strings below.

import { supabaseAdmin } from "../config/supabase.js";

// Fields intentionally excluded from order responses:
//   - payout_reference_id  (internal payout system detail)
//   - account_number       (sensitive — never send to client)
const ORDER_FIELDS = `
  id,
  order_id,
  store_id,
  customer:buyer_id(id, full_name, email, avatar_url),
  order_items(*,products(name, thumbnail_url)),
  subtotal,
  platform_fee,
  net_amount,
  status,
  payout_status,
  payout_retries,
  shipping_info,
  created_at,
  updated_at
`.trim();

const orderService = {
  // List orders for a store with filters and pagination
  async list(
    storeId,
    { page = 1, limit = 20, status, dateFrom, dateTo, search, sort = "created_at", order = "desc" }
  ) {
    let query = supabaseAdmin
      .from("store_orders")
      .select(ORDER_FIELDS, { count: "exact" })
      .eq("store_id", storeId);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (dateFrom) {
      query = query.gte("created_at", new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      // Include the full day
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      query = query.lte("created_at", end.toISOString());
    }

    // Ensure page and limit are valid numbers to prevent memory issues
    const validPage = Math.max(1, parseInt(page) || 1);
    const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));

    // Pagination
    const from = (validPage - 1) * validLimit;
    const to = from + validLimit - 1;

    query = query.order(sort, { ascending: order === "asc" }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return { orders: data, total: count };
  },

  // Get a single order with buyer info and status history
  async getById(storeId, orderId) {
    const { data: order, error } = await supabaseAdmin
      .from("store_orders")
      .select(
        `
        ${ORDER_FIELDS},
        history:store_order_status_history(
          id, status, comment, created_at,
          actor:actor_id(id)
        )
      `
      )
      .eq("id", orderId)
      .eq("store_id", storeId)
      .single();

    if (error || !order) return null;
    return order;
  },

  // Update order status and write to status history
  async updateStatus(storeId, orderId, { status, comment }, actorId) {
    // Verify order belongs to this store
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("store_orders")
      .select("id, status")
      .eq("id", orderId)
      .eq("store_id", storeId)
      .single();

    if (fetchError || !existing) return null;

    // Prevent invalid status transitions
    // e.g. can't go from delivered → pending
    const transitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered", "cancelled"],
      delivered: ["refunded"],
      cancelled: [],
      refunded: [],
    };
    const allowed = transitions[existing.status] || [];
    if (!allowed.includes(status)) {
      const err = new Error(
        `Cannot transition from "${existing.status}" to "${status}"`
      );
      err.statusCode = 422;
      err.code = "INVALID_TRANSITION";
      throw err;
    }

    // Update status on store_orders
    // The trigger `trigger_sync_order_status` will propagate this
    // up to the parent orders table automatically.
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("store_orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select(ORDER_FIELDS)
      .single();

    if (updateError) throw updateError;

    // Write to audit history
    await supabaseAdmin.from("store_order_status_history").insert({
      store_order_id: orderId,
      actor_id: actorId,
      status,
      comment: comment || null,
    });

    return updated;
  },

  // Get status history for an order
  async getStatusHistory(storeId, orderId) {
    // First verify order belongs to store
    const { data: order } = await supabaseAdmin
      .from("store_orders")
      .select("id")
      .eq("id", orderId)
      .eq("store_id", storeId)
      .single();

    if (!order) return null;

    const { data, error } = await supabaseAdmin
      .from("store_order_status_history")
      .select("id, status, comment, created_at, actor_id")
      .eq("store_order_id", orderId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Quick status counts for the orders page filter tabs
  async getStatusCounts(storeId) {
    const { data, error } = await supabaseAdmin
      .from("store_orders")
      .select("status")
      .eq("store_id", storeId);

    if (error) throw error;

    const counts = {
      all: data.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    };
    data.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status]++;
    });
    return counts;
  },
};

export default orderService;
