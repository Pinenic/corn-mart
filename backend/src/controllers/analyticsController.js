// src/controllers/analyticsController.js
import analyticsService from "../services/analyticsService.js";
import response         from "../utils/response.js";
import asyncHandler     from "../utils/asyncHandler.js";

const analyticsController = {
  // GET /api/v1/stores/:storeId/analytics/overview
  // KPI cards: revenue, orders, AOV with period-over-period comparison
  overview: asyncHandler(async (req, res) => {
    const data = await analyticsService.getOverview(req.store.id, req.query);
    return response.ok(res, data);
  }),

  // GET /api/v1/stores/:storeId/analytics/revenue
  // Daily revenue time series for charts
  revenue: asyncHandler(async (req, res) => {
    const series = await analyticsService.getRevenueSeries(req.store.id, req.query);
    return response.ok(res, series);
  }),

  // GET /api/v1/stores/:storeId/analytics/orders-by-status
  // Counts per status — for donut/pie chart and status breakdown
  ordersByStatus: asyncHandler(async (req, res) => {
    const counts = await analyticsService.getOrdersByStatus(req.store.id);
    return response.ok(res, counts);
  }),

  // GET /api/v1/stores/:storeId/analytics/products
  // Product-level performance — units, revenue, returns
  // Requires order_items schema to be confirmed (see service)
  products: asyncHandler(async (req, res) => {
    const data = await analyticsService.getProductPerformance(
      req.store.id, req.query
    );
    return response.ok(res, data);
  }),

  // GET /api/v1/stores/:storeId/analytics/followers
  // Follower growth over time — daily new follower series
  followers: asyncHandler(async (req, res) => {
    const series = await analyticsService.getFollowerGrowth(
      req.store.id, req.query
    );
    return response.ok(res, series);
  }),

  // GET /api/v1/stores/:storeId/analytics/categories
  // Revenue breakdown by product category
  categories: asyncHandler(async (req, res) => {
    const data = await analyticsService.getCategoryBreakdown(
      req.store.id, req.query
    );
    return response.ok(res, data);
  }),
};

export default analyticsController;
