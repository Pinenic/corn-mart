// src/middleware/rateLimit.js
// Tiered rate limiting using express-rate-limit.
//
// Three tiers:
//   authLimiter     — strict; prevents brute-force on auth endpoints
//   writeLimiter    — moderate; for POST/PATCH/DELETE mutations
//   readLimiter     — relaxed; for GET requests
//   analyticsLimiter— most relaxed; analytics are read-heavy and
//                     dashboard may poll frequently
//
// Keys are per-IP by default. In production, if your API sits behind
// a load balancer or proxy, ensure trust proxy is set correctly
// (app.set("trust proxy", 1)) so the real client IP is used —
// otherwise all requests will appear to come from the proxy's IP
// and rate limits will be shared across all users.
//
// For distributed deployments, switch to a Redis store:
//   npm install rate-limit-redis ioredis
//   const RedisStore = require("rate-limit-redis");

import rateLimit from "express-rate-limit";
import env from "../config/env.js";
import response from "../utils/response.js";

// Shared handler so the response shape is consistent
const handler = (req, res) => response.tooManyRequests(res);

// Strict — auth endpoints (20 per 15 min by default)
const authLimiter = rateLimit({
  windowMs:         env.rateLimit.windowMs,
  max:              env.rateLimit.authMax,
  standardHeaders:  true,
  legacyHeaders:    false,
  skipSuccessfulRequests: false,
  handler,
});

// Write operations — POST / PATCH / DELETE (100 per 15 min)
const writeLimiter = rateLimit({
  windowMs:         env.rateLimit.windowMs,
  max:              env.rateLimit.max,
  standardHeaders:  true,
  legacyHeaders:    false,
  skip: (req) => req.method === "GET" || req.method === "HEAD",
  handler,
});

// Read operations — GET (300 per 15 min)
const readLimiter = rateLimit({
  windowMs:         env.rateLimit.windowMs,
  max:              env.rateLimit.max * 3,
  standardHeaders:  true,
  legacyHeaders:    false,
  skip: (req) => req.method !== "GET",
  handler,
});

// Analytics — GET only, higher limit (500 per 15 min)
const analyticsLimiter = rateLimit({
  windowMs:         env.rateLimit.windowMs,
  max:              env.rateLimit.max * 5,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler,
});

// Public marketplace browse — unauthenticated GET requests (1000 per 15 min)
// Higher than readLimiter because marketplace pages are public-facing and
// may be hit by many concurrent anonymous users. Still prevents scraping.
const publicLimiter = rateLimit({
  windowMs:         env.rateLimit.windowMs,
  max:              env.rateLimit.max * 10,
  standardHeaders:  true,
  legacyHeaders:    false,
  skip: (req) => req.method !== "GET",
  handler,
});

export { authLimiter, writeLimiter, readLimiter, analyticsLimiter, publicLimiter };
