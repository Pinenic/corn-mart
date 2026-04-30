// src/controllers/orderController.js
import orderService from "../services/orderService.js";
import response     from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

const orderController = {
  // GET /api/v1/stores/:storeId/orders
  list: asyncHandler(async (req, res) => {
    const { orders, total } = await orderService.list(req.store.id, req.query);

    return response.ok(
      res,
      orders,
      response.pageMeta({
        page:  req.query.page,
        limit: req.query.limit,
        total,
      })
    );
  }),

  // GET /api/v1/stores/:storeId/orders/status-counts
  // Returns counts per status — used to drive the filter tab badges
  // Placed before /:orderId so "status-counts" isn't treated as an ID
  getStatusCounts: asyncHandler(async (req, res) => {
    const counts = await orderService.getStatusCounts(req.store.id);
    return response.ok(res, counts);
  }),

  // GET /api/v1/stores/:storeId/orders/:orderId
  getOne: asyncHandler(async (req, res) => {
    const order = await orderService.getById(req.store.id, req.params.orderId);
    if (!order) return response.notFound(res, "Order not found");
    return response.ok(res, order);
  }),

  // PATCH /api/v1/stores/:storeId/orders/:orderId/status
  updateStatus: asyncHandler(async (req, res) => {
    const updated = await orderService.updateStatus(
      req.store.id,
      req.params.orderId,
      req.body,
      req.user.id   // actor for audit history
    );
    if (!updated) return response.notFound(res, "Order not found");
    return response.ok(res, updated);
  }),

  // GET /api/v1/stores/:storeId/orders/:orderId/history
  getHistory: asyncHandler(async (req, res) => {
    const history = await orderService.getStatusHistory(
      req.store.id,
      req.params.orderId
    );
    if (!history) return response.notFound(res, "Order not found");
    return response.ok(res, history);
  }),
};

export default orderController;
