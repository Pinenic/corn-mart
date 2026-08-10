// src/services/deliveryIntegrationService.js
//
// Updated against your real schema (stores + store_locations).
// One real gap: neither table has a contact phone column, and I
// don't have your `users` table schema to know if `stores.owner_id`
// joins to a `users.phone`. `buildPickupContact` tries `store.config`
// as a fallback (since stores.config is a free-form jsonb column)
// but if there's no phone anywhere, riders will have no way to call
// the seller on pickup — worth adding a `contact_phone` column to
// store_locations before this goes live. Flagged clearly below.

import { supabaseAdmin } from "../config/supabase.js";
import { deliveryClient } from "../config/deliveryClient.js";

function summarizeParcel(orderItems) {
  const names = orderItems.map(
    (item) => `${item.products?.name ?? "item"} x${item.quantity}`
  );
  const summary = names.join(", ");
  return summary.length > 120 ? `${summary.slice(0, 117)}...` : summary;
}

function totalWeight(orderItems) {
  const known = orderItems.filter((item) => item.products?.weight_kg != null);
  if (known.length === 0) return undefined;
  return known.reduce(
    (sum, item) => sum + item.products.weight_kg * item.quantity,
    0
  );
}

// The store may have multiple locations; only ones with
// delivery_enabled = true are valid pickup points. Checkout only
// offers "platform delivery" when at least one exists (see
// useDeliveryEligibility.js on the frontend), so by the time we get
// here one should always exist — but this still fails loudly rather
// than silently picking a non-delivery location if that invariant
// ever breaks.
async function getDeliveryLocation(storeId) {
  const { data, error } = await supabaseAdmin
    .from("store_locations")
    .select("address, city, province, country, contact_phone")
    .eq("store_id", storeId)
    .eq("delivery_enabled", true)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new Error(
      `Store ${storeId} has no delivery-enabled location — cannot dispatch a pickup.`
    );
  }
  return data;
}

function buildPickupContact(store, location) {
  const address = [location.address, location.city, location.province, location.country]
    .filter(Boolean)
    .join(", ");

  // Prefers the location's own contact number (see 007_delivery_fee_
  // and_contact_phone.sql) — falls back to stores.config as a last
  // resort in case that migration hasn't run yet.
  const phone = location.contact_phone ?? store.config?.phone ?? null;

  return {
    pickup_name: store.name,
    pickup_phone: phone,
    pickup_address: address,
  };
}

function buildDropoffContact(shippingInfo) {
  const line = shippingInfo.line1 ?? shippingInfo.address ?? "";
  const rest = [shippingInfo.city, shippingInfo.state, shippingInfo.country]
    .filter(Boolean)
    .join(", ");

  return {
    dropoff_name: shippingInfo.name,
    dropoff_phone: shippingInfo.phone,
    dropoff_address: [line, rest].filter(Boolean).join(", "),
  };
}

const deliveryIntegrationService = {
  async createDeliveryForOrder(storeOrder, store, parcelSize) {
    const location = await getDeliveryLocation(store.id);

    if (!buildPickupContact(store, location).pickup_phone) {
      // Don't silently dispatch a rider with no way to reach the
      // seller — this is exactly the gap called out above.
      throw new Error(
        `Store ${store.id} has no contact phone configured — add one before dispatching deliveries.`
      );
    }

    const payload = {
      external_reference: storeOrder.id,
      ...buildPickupContact(store, location),
      ...buildDropoffContact(storeOrder.shipping_info),
      parcel_description: summarizeParcel(storeOrder.order_items),
      parcel_weight_kg: totalWeight(storeOrder.order_items),
      // Only meaningful for 'tiered' clients — the delivery platform
      // ignores it for 'flat' ones. Missing/invalid for a tiered
      // client comes back as a 400 with a `tiers` list attached to
      // the thrown DeliveryApiError (see deliveryClient.js), which
      // orderService surfaces to the ship-confirmation dialog.
      parcel_size: parcelSize || undefined,
    };

    // The delivery platform's POST /api/v1/deliveries returns the
    // object directly — { id, status, delivery_fee, created_at }.
    return deliveryClient.post("/api/v1/deliveries", payload);
  },

  // Used by the ship-confirmation dialog to render size/price options
  // before the seller commits — reads the SAME config the actual
  // dispatch call will use, so there's no risk of the picker and the
  // real charge disagreeing.
  async getPricing() {
    return deliveryClient.get("/api/v1/pricing");
  },
};

export default deliveryIntegrationService;