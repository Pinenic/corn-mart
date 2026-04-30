// src/app.js
// Express application factory.
// Middleware are registered in a deliberate order — each layer
// has a specific reason to be where it is (explained inline).
//
// Note: dotenv is loaded in server.js (the entry point) before this
// module is imported, so process.env is already populated here.

import express     from "express";
import helmet      from "helmet";
import cors        from "cors";
import compression from "compression";
import morgan      from "morgan";

import env                             from "./config/env.js";
import logger                          from "./utils/logger.js";
import routes                          from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

// ── 1. Trust proxy ────────────────────────────────────────────
// If your API runs behind a reverse proxy (Nginx, AWS ALB, Fly.io, etc.)
// this makes req.ip reflect the real client IP for rate limiting.
// Set to the number of proxy hops between the client and this server.
// DO NOT set to true in production without understanding the implications —
// a malicious client could spoof X-Forwarded-For.
if (env.isProd) {
  app.set("trust proxy", 1);
}

// ── 2. Security headers (Helmet) ──────────────────────────────
// Sets a battery of security-related HTTP headers.
// Must come before any response-sending middleware.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow image CDN assets
    contentSecurityPolicy: env.isProd, // only enforce CSP in production
  })
);

// ── 3. CORS ───────────────────────────────────────────────────
// Must come before route handlers so preflight OPTIONS requests are handled.
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (env.cors.origins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin "${origin}" not allowed`));
    },
    methods:     ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge:      86400, // cache preflight for 24h
  })
);

// ── 4. Compression ────────────────────────────────────────────
// Gzip responses. Comes early so all subsequent responses are compressed.
// Skip for small responses (<1KB) — not worth the CPU overhead.
app.use(compression({ threshold: 1024 }));

// ── 5. Request body parsing ───────────────────────────────────
// Limit body size to prevent memory exhaustion attacks.
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false, limit: "2mb" }));

// ── 6. HTTP request logging ───────────────────────────────────
// Morgan logs every request. In dev: readable format. In prod: JSON.
if (env.isDev) {
  app.use(morgan("dev"));
} else {
  // Structured JSON logs for production log aggregation (Datadog, etc.)
  app.use(
    morgan("combined", {
      stream: { write: (msg) => logger.info(msg.trim()) },
      skip: (req) => req.url === "/api/v1/health", // don't log health checks
    })
  );
}

// ── 7. Routes ─────────────────────────────────────────────────
app.use("/api/v1", routes);

// ── 8. 404 handler ────────────────────────────────────────────
// Catches requests that didn't match any route.
// Must come after all routes, before the error handler.
app.use(notFoundHandler);

// ── 9. Global error handler ───────────────────────────────────
// Must be the LAST middleware (4 arguments = error handler in Express).
// Catches anything passed to next(err) and anything thrown by asyncHandler.
app.use(errorHandler);

export default app;
