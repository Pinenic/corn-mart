// src/utils/response.js
// Standardised JSON response shape used across all controllers.
//
// Success:  { success: true,  data: <payload>,    meta?: <pagination> }
// Error:    { success: false, error: { code, message, details? } }
//
// Keeping shape consistent makes frontend error handling predictable:
// always check response.success, then read response.data or response.error.

const response = {
  // 200 OK
  ok(res, data = null, meta = null) {
    const body = { success: true, data };
    if (meta) body.meta = meta;
    return res.status(200).json(body);
  },

  // 201 Created
  created(res, data = null) {
    return res.status(201).json({ success: true, data });
  },

  // 204 No Content (delete operations)
  noContent(res) {
    return res.status(204).send();
  },

  // 400 Bad Request (validation errors)
  badRequest(res, message = "Bad request", details = null) {
    const body = { success: false, error: { code: "BAD_REQUEST", message } };
    if (details) body.error.details = details;
    return res.status(400).json(body);
  },

  // 401 Unauthorised
  unauthorised(res, message = "Authentication required") {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORISED", message },
    });
  },

  // 403 Forbidden (authenticated but not allowed)
  forbidden(res, message = "You do not have permission to perform this action") {
    return res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message },
    });
  },

  // 404 Not Found
  notFound(res, message = "Resource not found") {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message },
    });
  },

  // 409 Conflict (e.g. duplicate SKU)
  conflict(res, message = "Resource already exists") {
    return res.status(409).json({
      success: false,
      error: { code: "CONFLICT", message },
    });
  },

  // 422 Unprocessable Entity (business logic violations)
  unprocessable(res, message, details = null) {
    const body = { success: false, error: { code: "UNPROCESSABLE", message } };
    if (details) body.error.details = details;
    return res.status(422).json(body);
  },

  // 429 Too Many Requests (used by rate limiter)
  tooManyRequests(res, message = "Too many requests. Please try again later.") {
    return res.status(429).json({
      success: false,
      error: { code: "RATE_LIMITED", message },
    });
  },

  // 500 Internal Server Error
  serverError(res, message = "An unexpected error occurred") {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message },
    });
  },

  // Pagination meta helper
  pageMeta({ page, limit, total }) {
    return {
      page,
      limit,
      total,
      totalPages:  Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  },
};

export default response;
