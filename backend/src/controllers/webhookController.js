// src/controllers/webhookController.js
//
// Receives POSTs from the delivery platform when a delivery's status
// changes. Payload shape (see the delivery platform's dispatch route):
//   { event, delivery_id, external_reference, status, changed_by_role, changed_at }
//
// external_reference is the store_order.id we sent when creating the
// delivery — but this handler looks up by delivery_id instead, since
// that's what we stored on our own row as the source of truth
// (see orderService.syncDeliveryStatus)

import orderService from "../services/orderService.js";
import response from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

const webhookController = {
  // POST /api/v1/webhooks/delivery-status
  deliveryStatus: asyncHandler(async (req, res) => {
    const secret = req.headers["x-webhook-secret"];
    if (secret !== process.env.DELIVERY_WEBHOOK_SECRET) {
      // Not using response.unauthorized() here since I haven't seen
      // utils/response.js and don't know if that helper exists —
      // this matches the { success, error } envelope your API
      // client already expects, just written out directly.
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Invalid webhook secret" },
      });
    }

    const { delivery_id, status } = req.body ?? {};

    if (!delivery_id || !status) {
      // Acknowledge rather than error on a malformed/unexpected
      // payload — there's nothing actionable to retry here, and
      // erroring would just cause the sender to keep retrying it.
      return response.ok(res, { ignored: true });
    }

    const updated = await orderService.syncDeliveryStatus(delivery_id, status);

    if (!updated) {
      // No matching order — logged, not a hard failure. Could happen
      // if this webhook fires for a delivery Corn Mart doesn't own
      // (shouldn't happen given the API key scoping, but defensive).
      console.warn(
        `[webhook] No store_order found for delivery_id=${delivery_id}`
      );
      return response.ok(res, { matched: false });
    }

    return response.ok(res, { matched: true, order_id: updated.id });
  }),
};

export default webhookController;
