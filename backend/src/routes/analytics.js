// src/routes/analytics.js
import express from "express";
import analyticsController    from "../controllers/analyticsController.js";
import { authenticate }       from "../middleware/auth.js";
import { requireStoreAccess } from "../middleware/storeAccess.js";
import { validateQuery }      from "../middleware/validate.js";
import { schemas }            from "../middleware/validate.js";
import { analyticsLimiter }   from "../middleware/rateLimit.js";

const router = express.Router({ mergeParams: true });

router.use(authenticate, requireStoreAccess);

// All analytics routes share the same query schema (period, dateFrom, dateTo)
const withQuery = validateQuery(schemas.analyticsQuery);

// GET /api/v1/stores/:storeId/analytics/overview
router.get("/overview",          analyticsLimiter, withQuery, analyticsController.overview);

// GET /api/v1/stores/:storeId/analytics/revenue
router.get("/revenue",           analyticsLimiter, withQuery, analyticsController.revenue);

// GET /api/v1/stores/:storeId/analytics/orders-by-status
router.get("/orders-by-status",  analyticsLimiter,            analyticsController.ordersByStatus);

// GET /api/v1/stores/:storeId/analytics/products
router.get("/products",          analyticsLimiter, withQuery, analyticsController.products);

// GET /api/v1/stores/:storeId/analytics/followers
router.get("/followers",         analyticsLimiter, withQuery, analyticsController.followers);

// GET /api/v1/stores/:storeId/analytics/categories
router.get("/categories",        analyticsLimiter, withQuery, analyticsController.categories);

export default router;
