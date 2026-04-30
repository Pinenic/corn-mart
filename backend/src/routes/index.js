// src/routes/index.js
// Central router. Mounts all feature routers under /api/v1/.
//
// URL structure:
//
//   ── DASHBOARD (store owner) ───────────────────────────────
//   /api/v1/categories                        — global reference data
//   /api/v1/stores/mine                       — current user's stores
//   /api/v1/stores/:storeId                   — store profile
//   /api/v1/stores/:storeId/locations         — delivery locations
//   /api/v1/stores/:storeId/orders            — order management
//   /api/v1/stores/:storeId/products          — product catalogue
//   /api/v1/stores/:storeId/analytics         — dashboard analytics
//
//   ── MARKETPLACE (buyer) ───────────────────────────────────
//   /api/v1/marketplace/stores                — browse all stores   [public]
//   /api/v1/marketplace/stores/:id/products   — store's products    [public]
//   /api/v1/marketplace/stores/:id/follow     — follow/unfollow     [auth]
//   /api/v1/marketplace/products              — global product search[public]
//   /api/v1/marketplace/products/:id          — product detail      [public]
//   /api/v1/marketplace/orders                — buyer's orders      [auth]
//   /api/v1/marketplace/notifications         — buyer notifications  [auth]

import express from "express";

import storeRoutes from "./stores.js";
import orderRoutes from "./orders.js";
import productRoutes from "./products.js";
import categoryRoutes from "./categories.js";
import analyticsRoutes from "./analytics.js";

// Marketplace
import marketplaceStoreRoutes from "./marketplace/stores.js";
import marketplaceProductRoutes from "./marketplace/products.js";
import marketplaceBuyerRoutes from "./marketplace/buyer.js";

const router = express.Router();

// ── Global reference data ─────────────────────────────────────
router.use("/categories", categoryRoutes);

// ── Dashboard: store profile + locations ─────────────────────
router.use("/stores", storeRoutes);

// ── Dashboard: store-scoped features ─────────────────────────
router.use("/stores/:storeId/orders", orderRoutes);
router.use("/stores/:storeId/products", productRoutes);
router.use("/stores/:storeId/analytics", analyticsRoutes);

// ── Marketplace: public browse ────────────────────────────────
router.use("/marketplace/stores", marketplaceStoreRoutes);
router.use("/marketplace/products", marketplaceProductRoutes);

// ── Marketplace: authenticated buyer actions ──────────────────
// buyer.js handles /orders and /notifications internally
router.use("/marketplace", marketplaceBuyerRoutes);

// ── Health check (no auth required) ──────────────────────────
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
    },
  });
});

export default router;
