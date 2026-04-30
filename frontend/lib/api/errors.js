// lib/api/errors.js
// ─────────────────────────────────────────────────────────────
// Typed error class and user-facing message translation.
//
// Every non-ok response from the API throws an ApiError.
// Components and hooks catch ApiError and show translated messages —
// never raw API error strings, which may leak implementation details.
// ─────────────────────────────────────────────────────────────

// Maps API error codes (from the backend's response.js) to
// messages a store owner can understand and act on.
const ERROR_MESSAGES = {
  // Auth
  UNAUTHORISED:       "Your session has expired. Please sign in again.",
  FORBIDDEN:          "You don't have permission to do that.",

  // Validation
  BAD_REQUEST:        "Some of the information provided was invalid.",
  VALIDATION_ERROR:   "Please check the form for errors and try again.",

  // Resources
  NOT_FOUND:          "This item could not be found. It may have been deleted.",
  CONFLICT:           "This already exists. Please use a different value.",

  // Business logic
  UNPROCESSABLE:      "This action couldn't be completed.",
  INVALID_TRANSITION: "That status change isn't allowed at this stage.",
  DUPLICATE_SKU:      "This SKU is already in use by another variant.",

  // Server
  SERVER_ERROR:       "Something went wrong on our end. Please try again.",
  RATE_LIMITED:       "You're doing that too quickly. Please wait a moment.",

  // Network / client-side
  NETWORK_ERROR:      "Could not reach the server. Please check your connection.",
  TIMEOUT:            "The request took too long. Please try again.",
  UNKNOWN:            "An unexpected error occurred. Please try again.",
};

export class ApiError extends Error {
  /**
   * @param {string}  code        — machine-readable code from the API (e.g. "NOT_FOUND")
   * @param {string}  message     — user-facing message (translated from code)
   * @param {number}  status      — HTTP status code
   * @param {Array}   details     — field-level validation errors from Joi
   * @param {string}  rawMessage  — original API message (for dev logging only)
   */
  constructor({ code = "UNKNOWN", status = 0, details = null, rawMessage = "" } = {}) {
    const userMessage = ERROR_MESSAGES[code] ?? ERROR_MESSAGES.UNKNOWN;
    super(userMessage);

    this.name        = "ApiError";
    this.code        = code;
    this.status      = status;
    this.details     = details;   // Array<{ field, message }> for form validation
    this.rawMessage  = rawMessage; // Never show this to users
  }

  // True if the error is because the session expired
  get isAuth()        { return this.status === 401; }
  // True if the request was valid but the server says no
  get isForbidden()   { return this.status === 403; }
  // True if something wasn't found
  get isNotFound()    { return this.status === 404; }
  // True if Joi validation failed — details array will be populated
  get isValidation()  { return this.status === 400 && Array.isArray(this.details); }
  // True if the network itself failed (no response)
  get isNetwork()     { return this.status === 0; }
  // True if the request timed out
  get isTimeout()     { return this.code === "TIMEOUT"; }
  // True if rate limited
  get isRateLimited() { return this.status === 429; }
}

// Converts Joi field-level errors into a flat { fieldName: message } map
// for easy use with form state.
// e.g. { "price": "Price must be a positive number", "name": "Name is required" }
export function flattenValidationErrors(apiError) {
  if (!apiError?.isValidation || !Array.isArray(apiError.details)) return {};
  return apiError.details.reduce((acc, { field, message }) => {
    acc[field] = message;
    return acc;
  }, {});
}

// Returns a user-facing message for any error — works for ApiError and
// plain Error alike, so callers don't need to check the type.
export function getErrorMessage(err) {
  if (err instanceof ApiError) return err.message;
  if (err?.message) return ERROR_MESSAGES.UNKNOWN;
  return ERROR_MESSAGES.UNKNOWN;
}
