// src/routes/marketplace/buyer.js
// All routes here require authentication — buyers must be signed in.
import express from "express";
import marketplaceBuyerController       from "../../controllers/marketplace/marketplaceBuyerController.js";
import { authenticate }                 from "../../middleware/auth.js";
import { validateBody, validateQuery }  from "../../middleware/validate.js";
import { schemas }                      from "../../middleware/validate.js";
import { writeLimiter, readLimiter }    from "../../middleware/rateLimit.js";

const router = express.Router();

// All buyer routes require a valid session
router.use(authenticate);

// ── Orders ───────────────────────────────────────────────────

// POST /api/v1/marketplace/orders
router.post(
  "/orders",
  writeLimiter,
  validateBody(schemas.placeOrder),
  marketplaceBuyerController.placeOrder
);

// GET /api/v1/marketplace/orders
router.get(
  "/orders",
  readLimiter,
  validateQuery(schemas.pagination),
  marketplaceBuyerController.listOrders
);

// GET /api/v1/marketplace/orders/:orderId
router.get(
  "/orders/:orderId",
  readLimiter,
  marketplaceBuyerController.getOrder
);

// PATCH /api/v1/marketplace/orders/:orderId/cancel
router.patch(
  "/orders/:orderId/cancel",
  writeLimiter,
  validateBody(schemas.cancelOrder),
  marketplaceBuyerController.cancelOrder
);

// ── Notifications ─────────────────────────────────────────────

// PATCH /api/v1/marketplace/notifications/read-all
// Defined BEFORE /:notificationId/read — otherwise "read-all" is
// matched as a notificationId param.
router.patch(
  "/notifications/read-all",
  writeLimiter,
  marketplaceBuyerController.markAllRead
);

// GET /api/v1/marketplace/notifications
router.get(
  "/notifications",
  readLimiter,
  validateQuery(schemas.notificationQuery),
  marketplaceBuyerController.listNotifications
);

// PATCH /api/v1/marketplace/notifications/:notificationId/read
router.patch(
  "/notifications/:notificationId/read",
  writeLimiter,
  marketplaceBuyerController.markRead
);

export default router;
