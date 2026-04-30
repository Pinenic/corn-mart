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
  created_at, updated_at
`.trim();

// ── Cancellable statuses ──────────────────────────────────────
// A buyer can only cancel orders that haven't been picked up yet.
const BUYER_CANCELLABLE_STATUSES = ["pending", "confirmed"];

const marketplaceBuyerService = {

  // ── Place an order ────────────────────────────────────────────
  // Items can span multiple stores. We:
  //   1. Validate every product/variant exists and is active
  //   2. Create the parent `orders` record
  //   3. Group items by store and create one `store_orders` + `order_items` per store
  //
  // Stock is NOT decremented here — that should happen when the store
  // confirms the order (reserved_stock on variants). Keeping it
  // decrement-on-confirm avoids ghost reservations on unpaid orders.
  async placeOrder(buyerId, { cart_id, shipping_info, note }) {

    const { data, error } = await supabaseAdmin.rpc("checkout_cart", {
      p_cart_id: cart_id,
      p_buyer_id: buyerId,
      p_shipping_info: shipping_info,
    });

    if(error) throw error;
    // ── 1. Fetch and validate all products/variants ──────────
    // const productIds = [...new Set(items.map((i) => i.product_id))];
    // const variantIds = items.map((i) => i.variant_id).filter(Boolean);

    // const { data: products, error: pErr } = await supabaseAdmin
    //   .from("products")
    //   .select("id, store_id, name, price, is_active")
    //   .in("id", productIds);

    // if (pErr) throw pErr;

    // // Build lookup maps
    // const productMap = Object.fromEntries((products ?? []).map((p) => [p.id, p]));

    // // Validate variants if any were requested
    // let variantMap = {};
    // if (variantIds.length > 0) {
    //   const { data: variants, error: vErr } = await supabaseAdmin
    //     .from("product_variants")
    //     .select("id, product_id, name, price, available_stock, is_active")
    //     .in("id", variantIds);

    //   if (vErr) throw vErr;
    //   variantMap = Object.fromEntries((variants ?? []).map((v) => [v.id, v]));
    // }

    // // Check every item is valid and active
    // for (const item of items) {
    //   const product = productMap[item.product_id];
    //   if (!product) {
    //     const err = new Error(`Product ${item.product_id} not found`);
    //     err.statusCode = 422;
    //     err.code = "PRODUCT_NOT_FOUND";
    //     throw err;
    //   }
    //   if (!product.is_active) {
    //     const err = new Error(`"${product.name}" is no longer available`);
    //     err.statusCode = 422;
    //     err.code = "PRODUCT_UNAVAILABLE";
    //     throw err;
    //   }
    //   if (item.variant_id) {
    //     const variant = variantMap[item.variant_id];
    //     if (!variant || variant.product_id !== item.product_id) {
    //       const err = new Error(`Variant ${item.variant_id} not found`);
    //       err.statusCode = 422;
    //       err.code = "VARIANT_NOT_FOUND";
    //       throw err;
    //     }
    //     if (!variant.is_active) {
    //       const err = new Error(`Variant "${variant.name}" is no longer available`);
    //       err.statusCode = 422;
    //       err.code = "VARIANT_UNAVAILABLE";
    //       throw err;
    //     }
    //     // Check stock — warn but don't block (contact-seller model)
    //     // In a payment-first model you'd hard-block here.
    //     if (variant.available_stock < item.quantity) {
    //       const err = new Error(
    //         `Only ${variant.available_stock} units of "${variant.name}" are available`
    //       );
    //       err.statusCode = 422;
    //       err.code = "INSUFFICIENT_STOCK";
    //       throw err;
    //     }
    //   }
    // }

    // // ── 2. Compute totals and group by store ─────────────────
    // let totalAmount = 0;
    // const storeGroups = {};

    // for (const item of items) {
    //   const product = productMap[item.product_id];
    //   const variant = item.variant_id ? variantMap[item.variant_id] : null;
    //   // Variant price overrides product price if set
    //   const unitPrice = Number(variant?.price ?? product.price);
    //   const itemSubtotal = unitPrice * item.quantity;
    //   totalAmount += itemSubtotal;

    //   if (!storeGroups[product.store_id]) {
    //     storeGroups[product.store_id] = { subtotal: 0, items: [] };
    //   }
    //   storeGroups[product.store_id].subtotal += itemSubtotal;
    //   storeGroups[product.store_id].items.push({
    //     product_id: item.product_id,
    //     variant_id: item.variant_id ?? null,
    //     quantity:   item.quantity,
    //     unit_price: unitPrice,
    //   });
    // }

    // // ── 3. Create parent order ────────────────────────────────
    // const { data: parentOrder, error: orderErr } = await supabaseAdmin
    //   .from("orders")
    //   .insert({
    //     buyer_id:       buyerId,
    //     total_amount:   Math.round(totalAmount * 100) / 100,
    //     status:         "pending",
    //     payment_status: "unpaid",
    //   })
    //   .select(PARENT_ORDER_FIELDS)
    //   .single();

    // if (orderErr) throw orderErr;

    // // ── 4. Create store_orders + order_items per store ────────
    // const createdStoreOrders = [];

    // for (const [storeId, group] of Object.entries(storeGroups)) {
    //   // Create store_order
    //   const { data: storeOrder, error: soErr } = await supabaseAdmin
    //     .from("store_orders")
    //     .insert({
    //       order_id:     parentOrder.id,
    //       store_id:     storeId,
    //       buyer_id:     buyerId,
    //       subtotal:     Math.round(group.subtotal * 100) / 100,
    //       status:       "pending",
    //       payout_status:"pending",
    //       shipping_info: shipping_info ?? {},
    //     })
    //     .select(STORE_ORDER_FIELDS)
    //     .single();

    //   if (soErr) {
    //     // Best-effort: try to mark the parent order cancelled
    //     await supabaseAdmin
    //       .from("orders")
    //       .update({ status: "cancelled" })
    //       .eq("id", parentOrder.id);
    //     throw soErr;
    //   }

    //   // Create order_items for this store_order
    //   const orderItems = group.items.map((item) => ({
    //     store_order_id: storeOrder.id,
    //     product_id:     item.product_id,
    //     variant_id:     item.variant_id,
    //     quantity:       item.quantity,
    //     unit_price:     item.unit_price,
    //   }));

    //   const { error: itemErr } = await supabaseAdmin
    //     .from("order_items")
    //     .insert(orderItems);

    //   if (itemErr) throw itemErr;

    //   createdStoreOrders.push({
    //     ...storeOrder,
    //     items: group.items,
    //   });
    // }

    return {
      order:        data,
      // store_orders: createdStoreOrders,
      note: "Payment is handled offline. Contact the seller to arrange payment.",
    };
  },

  // ── Buyer's own orders ────────────────────────────────────────
  // Returns parent orders with their store_orders nested.
  async listOrders(buyerId, { page, limit, status }) {
    let query = supabaseAdmin
      .from("orders")
      .select(`
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
      `, { count: "exact" })
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
      .select(`
        ${PARENT_ORDER_FIELDS},
        store_orders(
          ${STORE_ORDER_FIELDS},
          store:store_id(id, name, logo, is_verified),
          items:order_items(
            id, quantity, unit_price, subtotal,
            product:product_id(id, name, thumbnail_url, description),
            variant:variant_id(id, name, sku)
          )
        )
      `)
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
      .select("id, title, message, type, metadata, is_read, channel, created_at", { count: "exact" })
      .eq("user_id", userId);

    if (type && type !== "all") query = query.eq("type", type);
    if (is_read != null)        query = query.eq("is_read", is_read);

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
      .update({ is_read: true, viewed: true, updated_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) throw error;
    return true;
  },

  async markAllNotificationsRead(userId) {
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true, viewed: true, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
    return true;
  },
};

export default marketplaceBuyerService;
