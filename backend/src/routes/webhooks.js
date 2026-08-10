// src/routes/webhooks.js
//
// Deliberately does NOT use `authenticate`/`requireStoreAccess` —
// this is called by the delivery platform's server, not a logged-in
// Corn Mart user. Authenticity is checked via the x-webhook-secret
// header instead (see webhookController.deliveryStatus).
import express from "express";
import webhookController from "../controllers/webhookController.js";

const router = express.Router();

// POST /api/v1/webhooks/delivery-status
router.post("/delivery-status", webhookController.deliveryStatus);

export default router;

// ── Mounting ─────────────────────────────────────────────────
// In your main app file (app.js / index.js — not shared with me,
// so wire this in manually), alongside your other route mounts:
//
//   import webhookRoutes from "./routes/webhooks.js";
//   app.use("/api/v1/webhooks", webhookRoutes);
//
// Mount this BEFORE any global `authenticate` middleware if you
// apply one at the app level rather than per-router — otherwise the
// delivery platform's request will get rejected before it reaches
// this route.
