// src/middleware/errorHandler.js
// Global Express error handler — must be registered LAST (after all routes).
// Catches anything passed to next(err) and anything thrown in async handlers
// (via asyncHandler wrapper).
//
// Never expose raw error messages or stack traces in production —
// they leak implementation details and database structure.

import response from "../utils/response.js";
import logger from "../utils/logger.js";
import env from "../config/env.js";

// Supabase error codes that map to specific HTTP responses
const SUPABASE_UNIQUE_VIOLATION = "23505";
const SUPABASE_FOREIGN_KEY      = "23503";
const SUPABASE_NOT_NULL         = "23502";

function errorHandler(err, req, res, next) {
  // Log every error with context
  logger.error("Unhandled error", {
    message: err.message,
    code:    err.code,
    stack:   env.isDev ? err.stack : undefined,
    url:     req.originalUrl,
    method:  req.method,
    userId:  req.user?.id,
  });

  // Already sent — can't send again
  if (res.headersSent) return next(err);

  // ── Supabase / Postgres error codes ──────────────────────
  if (err.code === SUPABASE_UNIQUE_VIOLATION) {
    return response.conflict(res, "A record with this value already exists");
  }
  if (err.code === SUPABASE_FOREIGN_KEY) {
    return response.unprocessable(res, "Referenced record does not exist");
  }
  if (err.code === SUPABASE_NOT_NULL) {
    return response.badRequest(res, "A required field was not provided");
  }

  // ── Application errors ────────────────────────────────────
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code:    err.code    || "APP_ERROR",
        message: err.message || "An error occurred",
      },
    });
  }

  // ── JWT errors ────────────────────────────────────────────
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return response.unauthorised(res, "Invalid or expired token");
  }

  // ── Payload too large ─────────────────────────────────────
  if (err.type === "entity.too.large") {
    return response.badRequest(res, "Request body too large");
  }

  // ── Default: 500 ──────────────────────────────────────────
  // In production, hide the real error message
  const message = env.isProd
    ? "An unexpected error occurred"
    : err.message;

  return response.serverError(res, message);
}

// 404 handler for unknown routes — register before errorHandler
function notFoundHandler(req, res) {
  return response.notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
}

export { errorHandler, notFoundHandler };
