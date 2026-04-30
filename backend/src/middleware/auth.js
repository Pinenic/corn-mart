// src/middleware/auth.js
// Verifies the Supabase JWT sent in the Authorization header.
// Attaches the decoded user object to req.user on success.
//
// Flow:
//   1. Extract Bearer token from Authorization header
//   2. Call supabase.auth.getUser(token) — this validates the JWT
//      signature against the Supabase project's secret and checks
//      expiry. It also handles token revocation via Supabase's
//      auth.users table.
//   3. Attach req.user = { id, email, ... }
//
// Why use getUser() instead of manually verifying the JWT?
//   - getUser() also checks if the session has been revoked (e.g. after
//     the user signs out from another device). Manual JWT verification
//     with jsonwebtoken would not catch revoked sessions.
//   - The slight network overhead is acceptable for a dashboard API
//     where security matters more than raw throughput.

import { supabaseAnon } from "../config/supabase.js";
import response from "../utils/response.js";
import logger from "../utils/logger.js";

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.unauthorised(res, "Authorization header missing or malformed");
  }

  const token = authHeader.slice(7); // strip "Bearer "

  const { data, error } = await supabaseAnon.auth.getUser(token);

  if (error || !data?.user) {
    logger.warn("Auth failure", { error: error?.message, ip: req.ip });
    return response.unauthorised(res, "Invalid or expired token");
  }

  // Attach user to request for downstream middleware and controllers
  req.user = data.user;
  req.token = token; // forwarded to Supabase when making user-context queries
  next();
}

// Optional auth — attaches req.user if token present, but doesn't block
// if no token. Useful for public endpoints that have enhanced behaviour
// for authenticated users.
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data } = await supabaseAnon.auth.getUser(token);
    if (data?.user) {
      req.user = data.user;
      req.token = token;
    }
  }
  next();
}

export { authenticate, optionalAuth };
