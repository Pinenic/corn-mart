// src/utils/asyncHandler.js
// Wraps an async route handler and forwards any rejected promise
// to Express's next(err) — which routes it to the global error handler.
//
// Usage:
//   router.get("/route", asyncHandler(async (req, res) => { ... }))
//
// This eliminates the need for try/catch boilerplate in every controller.

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
