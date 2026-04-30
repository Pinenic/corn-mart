// src/config/env.js
// Validates all required environment variables at startup.
// The app will throw immediately if something is missing rather
// than failing silently mid-request.

const required = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_KEY",
  "SUPABASE_JWT_SECRET",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}\n` +
    "Copy .env.example to .env and fill in the values."
  );
}

const env = {
  NODE_ENV:    process.env.NODE_ENV    || "development",
  PORT:        parseInt(process.env.PORT || "4000", 10),
  isDev:       (process.env.NODE_ENV || "development") === "development",
  isProd:      process.env.NODE_ENV === "production",

  supabase: {
    url:        process.env.SUPABASE_URL,
    anonKey:    process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    jwtSecret:  process.env.SUPABASE_JWT_SECRET,
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || "http://localhost:3000")
      .split(",")
      .map((o) => o.trim()),
  },

  rateLimit: {
    windowMs:     parseInt(process.env.RATE_LIMIT_WINDOW_MS  || "900000", 10),
    max:          parseInt(process.env.RATE_LIMIT_MAX_REQUESTS|| "100",   10),
    authMax:      parseInt(process.env.AUTH_RATE_LIMIT_MAX   || "20",     10),
  },
};

export default env;
