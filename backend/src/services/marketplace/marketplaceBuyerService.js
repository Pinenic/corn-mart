// src/services/marketplace/marketplaceBuyerService.js
// Authenticated buyer operations: place orders, view own orders,
// cancel pending orders, manage notifications.
//
// Order model (schema recap):
//   orders          — parent marketplace-level order (one per checkout)
//   store_orders    — per-store slice of that order (one per store involved)
//   order_items     — line items linked to a store_order
//
// Since payment is not yet handled on-platform, orders are created with:
//   payment_status = "unpaid"
//   status         = "pending"
// The buyer contacts the seller externally to complete payment.
// The seller then uses the dashboard to move the order through the
// status machine (pending → confirmed → processing → shipped → delivered).
//
// DELIVERY INTEGRATION (new):
// fulfillment_method now flows through to the checkout_cart_v2 RPC,
// which is the actual authoritative validation point (re-checks
// delivery eligibility server-side — see checkout_cart_v2_delivery_
// update.sql). This service only does a cheap whitelist check before
// calling the RPC, since there's no reason to make a DB round-trip
// for an obviously invalid value.

import { supabaseAdmin } from "../../config/supabase.js";

// ── Order field sets ──────────────────────────────────────────
const PARENT_ORDER_FIELDS = `
  id, buyer_id, total_amount, status,
  payment_status, created_at, updated_at
`.trim();

const STORE_ORDER_FIELDS = `
  id, order_id, store_id, buyer_id,
  subtotal, platform_fee, net_amount,
  status, payout_status, shipping_info,
  fulfillment_method, buyer_delivery_fee,
  delivery_order_id, delivery_status, pickup_method,
  created_at, updated_at
`.trim();

const VALID_FULFILLMENT_METHODS = ["platform_delivery", "self_arranged"];

// ── Cancellable statuses ──────────────────────────────────────
// A buyer can only cancel orders that haven't been picked up yet.
const BUYER_CANCELLABLE_STATUSES = ["pending", "confirmed"];

const marketplaceBuyerService = {
  // ── Place an order ────────────────────────────────────────────
  // Items can span multiple stores. All the real work — stock
  // locking, per-store splitting, delivery eligibility, fee
  // calculation — happens inside the checkout_cart_v2 RPC as a single
  // transaction. This function's job is just to validate the
  // fulfillment_method value and pass everything through.
  async placeOrder(
    buyerId,
    { cart_id, shipping_info, fulfillment_method, note }
  ) {
    const method = fulfillment_method ?? "self_arranged";

    if (!VALID_FULFILLMENT_METHODS.includes(method)) {
      const err = new Error(
        `fulfillment_method must be one of: ${VALID_FULFILLMENT_METHODS.join(
          ", "
        )}`
      );
      err.statusCode = 422;
      err.code = "INVALID_FULFILLMENT_METHOD";
      throw err;
    }

    const { data, error } = await supabaseAdmin.rpc("checkout_cart_v2", {
      p_cart_id: cart_id,
      p_buyer_id: buyerId,
      p_shipping_info: shipping_info,
      p_fulfillment_method: method,
    });

    if (error) {
      // The RPC raises a specific error (P0004) when platform_delivery
      // is requested but a store in the cart can't fulfill it — surface
      // that as a clean 422 rather than a generic 500.
      if (error.code === "P0004") {
        const err = new Error(error.message);
        err.statusCode = 422;
        err.code = "DELIVERY_NOT_AVAILABLE";
        throw err;
      }
      throw error;
    }

    return {
      order: data,
      note: "Payment is handled offline. Contact the seller to arrange payment.",
    };
  },

  // ── Buyer's own orders ────────────────────────────────────────
  // Returns parent orders with their store_orders nested.
  async listOrders(buyerId, { page, limit, status }) {
    let query = supabaseAdmin
      .from("orders")
      .select(
        `
        ${PARENT_ORDER_FIELDS},
        store_orders(
          ${STORE_ORDER_FIELDS},
          store:store_id(id, name, logo),
          items:order_items(
            id, quantity, unit_price, subtotal,
            product:product_id(id, name, thumbnail_url),
            variant:variant_id(id, name)
          )
        )
      `,
        { count: "exact" }
      )
      .eq("buyer_id", buyerId);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const from = (page - 1) * limit;
    query = query
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return { orders: data, total: count };
  },

  // ── Single order detail ───────────────────────────────────────
  // Verifies the order belongs to the requesting buyer.
  async getOrder(buyerId, orderId) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        ${PARENT_ORDER_FIELDS},
        store_orders(
          ${STORE_ORDER_FIELDS},
          store:store_id(id, name, logo, is_verified, location:store_locations(address, city, province, country, latitude, longitude, contact_phone)),
          items:order_items(
            id, quantity, unit_price, subtotal,
            product:product_id(id, name, thumbnail_url, description),
            variant:variant_id(id, name, sku)
          )
        )
      `
      )
      .eq("id", orderId)
      .eq("buyer_id", buyerId)
      .single();

    if (error || !data) return null;
    return data;
  },

  // ── Cancel an order ───────────────────────────────────────────
  // Buyers can only cancel orders in "pending" or "confirmed" status.
  // Cancellation cascades: parent order → all store_orders set to cancelled.
  // The DB trigger trigger_sync_order_status keeps the parent in sync.
  async cancelOrder(buyerId, orderId, reason) {
    // Verify ownership and check current status
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from("orders")
      .select("id, status, buyer_id")
      .eq("id", orderId)
      .eq("buyer_id", buyerId)
      .single();

    if (fetchErr || !order) return { notFound: true };

    if (!BUYER_CANCELLABLE_STATUSES.includes(order.status)) {
      return {
        cannotCancel: true,
        reason: `Orders with status "${order.status}" cannot be cancelled`,
      };
    }

    // Cancel all store_orders for this parent order
    const { error: soErr } = await supabaseAdmin
      .from("store_orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("order_id", orderId);

    if (soErr) throw soErr;

    // Cancel the parent order
    // (trigger trigger_sync_order_status would also catch this, but be explicit)
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select(PARENT_ORDER_FIELDS)
      .single();

    if (updateErr) throw updateErr;
    return { order: updated };
  },

  // ── Notifications ─────────────────────────────────────────────

  async listNotifications(userId, { page, limit, type, is_read }) {
    let query = supabaseAdmin
      .from("notifications")
      .select(
        "id, title, message, type, metadata, is_read, channel, created_at",
        { count: "exact" }
      )
      .eq("user_id", userId);

    if (type && type !== "all") query = query.eq("type", type);
    if (is_read != null) query = query.eq("is_read", is_read);

    const from = (page - 1) * limit;
    query = query
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    // Also return the unread count as a convenience
    const { count: unreadCount } = await supabaseAdmin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    return { notifications: data, total: count, unread: unreadCount ?? 0 };
  },

  async markNotificationRead(userId, notificationId) {
    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from("notifications")
      .select("id")
      .eq("id", notificationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!existing) return false;

    const { error } = await supabaseAdmin
      .from("notifications")
      .update({
        is_read: true,
        viewed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", notificationId);

    if (error) throw error;
    return true;
  },

  async markAllNotificationsRead(userId) {
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({
        is_read: true,
        viewed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
    return true;
  },
};

export default marketplaceBuyerService;
