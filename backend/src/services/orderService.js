// src/services/orderService.js
// All database operations for store_orders and store_order_status_history.
//
// NOTE on schema assumption:
// The provided schema doesn't include an order_items / store_order_items
// table, but there must be one (orders need line items). This service
// assumes a `store_order_items` table with at minimum:
//   store_order_id, product_id, variant_id, quantity, unit_price
// If your table is named differently, adjust the select strings below.
//
// DELIVERY INTEGRATION (new):
// When an order has fulfillment_method = 'platform_delivery' and
// transitions processing → shipped, this calls the delivery
// platform's API to create the actual delivery job before writing
// the new status. See deliveryIntegrationService.js for the payload
// shape and its field-name assumptions about your `stores` table.

import { supabaseAdmin } from "../config/supabase.js";
import deliveryIntegrationService from "./deliveryIntegrationService.js";
import { DeliveryApiError } from "../config/deliveryClient.js";

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
  fulfillment_method,
  pickup_method,
  delivery_order_id,
  delivery_status,
  parcel_size,
  buyer_delivery_fee,
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
  //
  // `store` is the seller's store record (already loaded by the
  // requireStoreAccess middleware as req.store) — passed through so
  // this can build a delivery pickup contact without an extra query.
  //
  // `parcel_size` is only meaningful on the processing → shipped
  // transition for platform_delivery orders — the seller picks it in
  // the ship-confirmation dialog just before this fires.
  async updateStatus(storeId, orderId, { status, comment, parcel_size }, actorId, store) {
    // Verify order belongs to this store
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("store_orders")
      .select(
        "id, status, fulfillment_method, delivery_order_id, shipping_info, order_items(*,products(name, thumbnail_url, description))"
      )
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

    // ── Delivery platform hand-off ────────────────────────────
    // Fires once: processing → shipped, platform_delivery orders
    // only, and only if a delivery hasn't already been created for
    // this order (guards against double-dispatch on retries/double
    // clicks — the delivery platform's API has no idempotency key
    // of its own, so this check is what prevents duplicates).
    const deliveryFields = {};
    if (
      status === "shipped" &&
      existing.fulfillment_method === "platform_delivery" &&
      !existing.delivery_order_id
    ) {
      if (!store) {
        const err = new Error(
          "Store record is required to dispatch a platform delivery"
        );
        err.statusCode = 500;
        err.code = "MISSING_STORE_CONTEXT";
        throw err;
      }

      try {
        const delivery = await deliveryIntegrationService.createDeliveryForOrder(
          existing,
          store,
          parcel_size
        );
        deliveryFields.delivery_order_id = delivery.id;
        deliveryFields.delivery_status = delivery.status;
        deliveryFields.parcel_size = parcel_size ?? null;
      } catch (err) {
        // A missing/invalid parcel_size for a tiered client comes
        // back as a 400 with a tier list attached — surface that
        // distinctly so the frontend can re-show the size picker
        // with real options, instead of just a dead-end error toast.
        if (err instanceof DeliveryApiError && err.status === 400 && err.tiers) {
          const wrapped = new Error(err.message);
          wrapped.statusCode = 422;
          wrapped.code = "PARCEL_SIZE_REQUIRED";
          wrapped.details = { tiers: err.tiers };
          throw wrapped;
        }

        // Don't silently mark the order "shipped" if dispatch failed —
        // the seller needs to know the handoff didn't actually happen.
        const message =
          err instanceof DeliveryApiError
            ? `Could not create the delivery: ${err.message}`
            : "Could not reach the delivery platform. Try again shortly.";
        const wrapped = new Error(message);
        wrapped.statusCode = 502;
        wrapped.code = "DELIVERY_DISPATCH_FAILED";
        throw wrapped;
      }
    }

    // Update status on store_orders
    // The trigger `trigger_sync_order_status` will propagate this
    // up to the parent orders table automatically.
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("store_orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...deliveryFields,
      })
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

  // Called by the webhook receiver when the delivery platform pushes
  // a status change. Looks up by delivery_order_id (their ID, stored
  // on our row when we created the delivery). Deliberately does NOT
  // go through the transitions guard above — that guard is for
  // seller-initiated actions; this is an external system reporting
  // what already happened.
  async syncDeliveryStatus(deliveryOrderId, deliveryStatus) {
    const { data: order, error: fetchError } = await supabaseAdmin
      .from("store_orders")
      .select("id, status")
      .eq("delivery_order_id", deliveryOrderId)
      .maybeSingle();

    if (fetchError || !order) return null;

    const updates = { delivery_status: deliveryStatus, updated_at: new Date().toISOString() };

    // Mirror a delivered/failed delivery into the order's own status,
    // but only forward — never override a status the seller already
    // moved past (e.g. don't resurrect a cancelled order).
    if (deliveryStatus === "delivered" && order.status === "shipped") {
      updates.status = "delivered";
    }
    if (deliveryStatus === "failed" && order.status === "shipped") {
      // Failed delivery doesn't auto-cancel the order — that's a
      // judgment call for the seller/support to make, not something
      // to automate silently.
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("store_orders")
      .update(updates)
      .eq("id", order.id)
      .select(ORDER_FIELDS)
      .single();

    if (updateError) throw updateError;

    if (updates.status) {
      await supabaseAdmin.from("store_order_status_history").insert({
        store_order_id: order.id,
        actor_id: null,
        status: updates.status,
        comment: `Synced from delivery platform (${deliveryStatus})`,
      });
    }

    return updated;
  },

  // Used by the ship-confirmation dialog to fetch size/price options
  // before the seller commits. Thin passthrough — no store scoping
  // needed since pricing is the same regardless of which of your
  // stores is asking (it's YOUR contract with the delivery platform,
  // not a per-store one).
  async getDeliveryPricing() {
    return deliveryIntegrationService.getPricing();
  },
};

export default orderService;