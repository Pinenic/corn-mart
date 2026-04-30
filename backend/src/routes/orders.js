// src/routes/orders.js
import express from "express";
import orderController                    from "../controllers/orderController.js";
import { authenticate }                   from "../middleware/auth.js";
import { requireStoreAccess }             from "../middleware/storeAccess.js";
import { validateBody, validateQuery }    from "../middleware/validate.js";
import { schemas }                        from "../middleware/validate.js";
import { writeLimiter, readLimiter }      from "../middleware/rateLimit.js";

const router = express.Router({ mergeParams: true });

// All order routes require authentication + store ownership
router.use(authenticate, requireStoreAccess);

// GET /api/v1/stores/:storeId/orders/status-counts
// Must be defined BEFORE /:orderId to prevent "status-counts" matching as an ID
router.get(
  "/status-counts",
  readLimiter,
  orderController.getStatusCounts
);

// GET /api/v1/stores/:storeId/orders
router.get(
  "/",
  readLimiter,
  validateQuery(schemas.orderQuery),
  orderController.list
);

// GET /api/v1/stores/:storeId/orders/:orderId
router.get("/:orderId", readLimiter, orderController.getOne);

// PATCH /api/v1/stores/:storeId/orders/:orderId/status
router.patch(
  "/:orderId/status",
  writeLimiter,
  validateBody(schemas.updateOrderStatus),
  orderController.updateStatus
);

// GET /api/v1/stores/:storeId/orders/:orderId/history
router.get("/:orderId/history", readLimiter, orderController.getHistory);

export default router;
