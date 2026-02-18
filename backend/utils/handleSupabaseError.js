// utils/handleSupabaseError.js
import AppError from "./AppError.js";

/**
 * Maps known Supabase / Postgres error codes to HTTP status codes
 * Extend this map as your app grows
 */
const SUPABASE_STATUS_MAP = {
  // PostgREST
  PGRST116: 404, // No rows found
  PGRST301: 400, // Invalid request / bad input

  // Postgres
  "22P02": 400,  // Invalid text representation (e.g. bad UUID)
  "23505": 409,  // Unique constraint violation
  "23503": 409,  // Foreign key violation
};

/**
 * Normalizes Supabase errors into AppError instances
 * so they are safe to throw across service boundaries
 */
export function handleSupabaseError(
  error,
  {
    message = "Database operation failed",
    defaultStatusCode = 500,
    isOperational = true,
  } = {}
) {
  // Safety guard — should never happen, but protects against misuse
  if (!error) {
    return new AppError("Unknown database error", 500, {
      isOperational: false,
    });
  }

  const statusCode =
    SUPABASE_STATUS_MAP[error.code] || defaultStatusCode;

  return new AppError(message, statusCode, {
    code: error.code || "SUPABASE_ERROR",
    details: {
      message: error.message,
      hint: error.hint,
      details: error.details,
    },
    isOperational,
  });
}
