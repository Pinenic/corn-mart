// src/controllers/marketplace/marketplaceBuyerController.js
import marketplaceBuyerService from "../../services/marketplace/marketplaceBuyerService.js";
import response                from "../../utils/response.js";
import asyncHandler            from "../../utils/asyncHandler.js";

const marketplaceBuyerController = {

  // ── Orders ─────────────────────────────────────────────────

  // POST /api/v1/marketplace/orders
  placeOrder: asyncHandler(async (req, res) => {
    const result = await marketplaceBuyerService.placeOrder(req.user.id, req.body);
    return response.created(res, result);
  }),

  // GET /api/v1/marketplace/orders
  listOrders: asyncHandler(async (req, res) => {
    const { orders, total } = await marketplaceBuyerService.listOrders(
      req.user.id,
      req.query
    );
    return response.ok(
      res,
      orders,
      response.pageMeta({ page: req.query.page, limit: req.query.limit, total })
    );
  }),

  // GET /api/v1/marketplace/orders/:orderId
  getOrder: asyncHandler(async (req, res) => {
    const order = await marketplaceBuyerService.getOrder(
      req.user.id,
      req.params.orderId
    );
    if (!order) return response.notFound(res, "Order not found");
    return response.ok(res, order);
  }),

  // PATCH /api/v1/marketplace/orders/:orderId/cancel
  cancelOrder: asyncHandler(async (req, res) => {
    const result = await marketplaceBuyerService.cancelOrder(
      req.user.id,
      req.params.orderId,
      req.body.reason
    );

    if (result.notFound)    return response.notFound(res, "Order not found");
    if (result.cannotCancel) return response.unprocessable(res, result.reason);

    return response.ok(res, result.order);
  }),

  // ── Notifications ─────────────────────────────────────────

  // GET /api/v1/marketplace/notifications
  listNotifications: asyncHandler(async (req, res) => {
    const { notifications, total, unread } = await marketplaceBuyerService.listNotifications(
      req.user.id,
      req.query
    );
    return response.ok(
      res,
      notifications,
      {
        ...response.pageMeta({ page: req.query.page, limit: req.query.limit, total }),
        unread,
      }
    );
  }),

  // PATCH /api/v1/marketplace/notifications/:notificationId/read
  markRead: asyncHandler(async (req, res) => {
    const marked = await marketplaceBuyerService.markNotificationRead(
      req.user.id,
      req.params.notificationId
    );
    if (!marked) return response.notFound(res, "Notification not found");
    return response.ok(res, { read: true });
  }),

  // PATCH /api/v1/marketplace/notifications/read-all
  // Must be defined BEFORE /:notificationId/read in the router
  markAllRead: asyncHandler(async (req, res) => {
    await marketplaceBuyerService.markAllNotificationsRead(req.user.id);
    return response.ok(res, { read: true });
  }),
};

export default marketplaceBuyerController;
