# Error Handling — Analysis & Action Plan ✅

**Goal:** Introduce a single, robust error-handling strategy for the `backend/` Express app: central error types, a consistent JSON error response, centralized error middleware, integration guidance, and a safe incremental migration plan.

---

## 1) Current state (quick analysis)
- No centralized Express error middleware in `server.js`. Routes are mounted and app starts immediately.
- Most controllers use try/catch and directly respond with `res.status(...).json(...)` on error. Common patterns: `res.status(500).json({ error: err.message })`, `res.status(404)...`, `res.status(400)...`.
- Services (Supabase wrappers) sometimes `throw new Error(...)` (operational DB errors) or return `null` when not found.
- Multer config uses callback `cb(new Error(...))` which produces Multer errors.
- Background jobs/util functions (workers, jobs, utils) use try/catch and console logs; they are not Express request handlers but should still log and surface operational issues to monitoring.

> Implication: A centralized error handler will reduce duplication, standardize responses, and make it easier to log/monitor and change behavior between **development** and **production**.

---

## 2) Design goals / principles 💡
- **Single source of truth** for HTTP error responses (uniform JSON shape).
- **Operational vs programmer errors**: operational errors (expected, e.g., validation, not found) get proper status codes; programmer/unknown errors get 500 and are logged thoroughly.
- **Non-leaking**: in production, do not send stack traces or secrets in error responses.
- **Support library errors** (Multer, SyntaxError from JSON parsing, Supabase errors, Stripe) and map them to appropriate status codes.
- **Incremental adoption**: changes should be non-breaking and allow migration controller-by-controller.

---

## 3) Recommended artifacts / files to add 🔧
Add these files under `backend/`:
- `utils/AppError.js` — small Error subclass (statusCode, status, isOperational, code, details).
- `utils/asyncHandler.js` — simple wrapper to catch async errors and pass to next (or use `express-async-handler`).
- `middlewares/errorHandler.js` — the central Express error handler (err, req, res, next) that normalizes errors and sends consistent JSON.
- `middlewares/notFoundHandler.js` — catches unmatched routes and forwards a 404 `AppError`.

Small optional helpers:
- `utils/errorTypes.js` — optional enum of string codes for common errors.
- `lib/logger.js` — wrapper over console/pino/winston for consistent logging (recommended but optional).


---

## 4) Error classes & response shape (proposal)
- AppError (extends Error): { message, statusCode (number), status ('error'|'fail'), isOperational (boolean), code (string), details (object) }

Standard JSON response shape:
```
{ "status": "error" | "fail", "statusCode": 400, "message": "Human-friendly message", "code": "PRODUCT_NOT_FOUND", "details": { /* optional structured info */ } }
```
- `status = 'fail'` for 4xx (client errors), `status = 'error'` for 5xx.

---

## 5) Status code mapping (recommended) — Table

| Error type | Status code | Example mapping / notes |
|---|---:|---|
| Validation / Missing params | 400 Bad Request | `cart_id and buyer_id required` |
| Authentication required | 401 Unauthorized | Missing/invalid token |
| Forbidden | 403 Forbidden | Not enough rights |
| Not found | 404 Not Found | Resource not found |
| Conflict | 409 Conflict | Unique constraint violations |
| Unprocessable | 422 Unprocessable Entity | Semantic validation |
| Too Many Requests | 429 Too Many Requests | Rate limiting |
| Payment-specific | 402 Payment Required | External payment failures (optional) |
| External service / DB failure | 503 Service Unavailable | Upstream service down |
| Unknown/programmer error | 500 Internal Server Error | Default for unexpected errors |


---

## 6) Error normalization & special cases
- Multer errors: `MulterError` → map to 400 with `code` like `INVALID_UPLOAD`.
- JSON parse errors (body parser): a `SyntaxError` from `JSON.parse` → 400 Bad Request with message `Invalid JSON`.
- Supabase errors: detect via message or presence of returned `error` objects; convert to `AppError` with 502 or 503 depending on context, or 500 if unknown.
- Validation from business logic: use `AppError` with 400 or 422.
- Operational thrown errors: services currently `throw new Error(...)` — central handler will transform these to 500 unless controllers throw `AppError` instead.

---

## 7) Integration approach (non-breaking, incremental)
Priority order and steps (small commits per step):

1) Add `AppError`, `asyncHandler`, `errorHandler`, `notFoundHandler`, and `logger` (optional). ✅
   - Minimal code required; tests not yet updated.

2) Plug into `server.js` (no controller changes yet):
   - After all `app.use('/api/...')` calls, add:
     ```js
     import notFoundHandler from './middlewares/notFoundHandler.js';
     import errorHandler from './middlewares/errorHandler.js';
     app.use(notFoundHandler);
     app.use(errorHandler);
     ```
   - This ensures 404/500 handling is present immediately.

3) Wrap existing route handlers with `asyncHandler` inside route files (
   `routes/*.js`
   ) so that thrown async errors get forwarded to the error handler. Example:
   ```js
   import asyncHandler from '../utils/asyncHandler.js';
   router.get('/', asyncHandler(getProducts));
   ```
   - You can do this file-by-file to keep commits small.

4) Migrate controllers to stop directly calling `res.status(500).json(...)` where appropriate, and instead:
   - Throw `new AppError('message', 500)` or `next(new AppError('message', 400))` for known error cases.
   - For 404 conditions, either `throw new AppError('Product not found', 404)` or `return next(new AppError(...))`.
   - Optional: keep current 4xx/404 returns for now if desired; centralizing server errors (5xx) first gives immediate benefit.

5) Replace ad-hoc string messages with consistent `code` values where helpful (e.g., `PRODUCT_NOT_FOUND`, `INVALID_UPLOAD`).

6) Add tests (see section below) and add logging / Sentry integration for production.

---

## 8) Example implementations (minimal & suggested)

### AppError (backend/utils/AppError.js)
```js
export default class AppError extends Error {
  constructor(message, statusCode = 500, { code = null, details = null, isOperational = true } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.code = code; // e.g., 'PRODUCT_NOT_FOUND'
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### asyncHandler (backend/utils/asyncHandler.js)
```js
export default (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

### notFoundHandler (backend/middlewares/notFoundHandler.js)
```js
import AppError from '../utils/AppError.js';
export default (req, res, next) => next(new AppError('Not Found', 404, { code: 'NOT_FOUND' }));
```

### errorHandler (backend/middlewares/errorHandler.js)
```js
import AppError from '../utils/AppError.js';
import logger from '../lib/logger.js'; // optional

export default (err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Normalize: wrap non-AppError errors
  if (!(err instanceof AppError)) {
    // Map some known error types
    if (err.name === 'MulterError') {
      err = new AppError(err.message || 'Invalid file upload', 400, { code: 'INVALID_UPLOAD', details: { multerr: err.code } });
    } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      err = new AppError('Invalid JSON payload', 400, { code: 'INVALID_JSON' });
    } else {
      err = new AppError(err.message || 'Internal Server Error', 500, { isOperational: false });
    }
  }

  // Log (detailed for non-operational or in dev)
  logger.error?.(err); // or console.error

  const payload = {
    status: err.status,
    statusCode: err.statusCode,
    message: process.env.NODE_ENV === 'production' && !err.isOperational ? 'Internal Server Error' : err.message,
    code: err.code || null,
    details: err.details || null,
  };
  if (process.env.NODE_ENV !== 'production') payload.stack = err.stack;

  res.status(err.statusCode || 500).json(payload);
};
```

> Note: these are minimal examples. Add better typed logging and adjust fields as needed.

---

## 9) Tests & acceptance ✅
Create tests covering these cases:
- Missing body/required params → 400 with consistent shape.
- Resource not found → 404.
- Invalid file uploads (Multer) → 400 + code `INVALID_UPLOAD`.
- Invalid JSON → 400 + `INVALID_JSON`.
- Supabase error flows → map to 502/503 or 500 depending on context.
- Unexpected runtime error → 500 with message masked in prod.

Acceptance criteria:
- `server.js` uses the `notFoundHandler` and `errorHandler` and they respond to all unmatched routes and runtime errors.
- All JSON errors returned match the standard response shape.
- No stack traces in production responses.
- Logging captures the full error for later debugging.

---

## 10) Migration plan & priorities (timeline estimates)
1) Very high impact, quick (1–2 hrs): Add helpers & middleware files and register them in `server.js` (no controller changes). This gives immediate central handling of some errors (404, thrown errors from async throws).
2) Medium (2–6 hrs): Wrap all route handlers with `asyncHandler`. This is mechanical and can be done file-by-file.
3) Medium (4–12 hrs): Migrate controllers to throw `AppError` for 4xx/5xx (instead of directly calling `res.status` for server errors) and to use structured codes.
4) Optional (2–6 hrs): Integrate logging provider (pino/winston) and monitoring (Sentry). Add tests.

---

## Appendix — Quick checklist before merging
- [ ] Add `utils/AppError.js`, `utils/asyncHandler.js`.
- [ ] Add `middlewares/errorHandler.js`, `middlewares/notFoundHandler.js`.
- [ ] Plug them into `server.js` **after** all routes.
- [ ] Wrap route handlers with `asyncHandler` (gradually).
- [ ] Replace internal `res.status(500).json` for server errors with `throw new AppError(...)` or `next(err)` where appropriate.
- [ ] Add/extend tests for error cases.
- [ ] Add structured logging and monitoring (Sentry/Grafana) in a follow-up PR.

---

If you want, I can now implement the minimal artifact set and wiring (small PR): create `utils/AppError.js`, `utils/asyncHandler.js`, `middlewares/errorHandler.js`, `middlewares/notFoundHandler.js`, plus show a sample change to a single route file (wrap handler) so you can review the pattern. 🔧

