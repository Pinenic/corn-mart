// config/cors.js

const ALLOWED_ORIGINS = {
  development: [
    "http://localhost:3000",   // Next.js dev server
    "http://localhost:3001",   // alternate frontend port
  ],
  production: [
    "https://pinapps.net",
    "https://www.pinapps.net",
    "https://corn-mart.vercel.app"
  ],
  test: [
    "http://localhost:3000",
  ],
};

const getAllowedOrigins = () => {
  const env = process.env.NODE_ENV || "development";
  return ALLOWED_ORIGINS[env] || ALLOWED_ORIGINS.development;
};

export const corsOptions = {
  origin: (incomingOrigin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (e.g. Postman, curl, server-to-server)
    if (!incomingOrigin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(incomingOrigin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${incomingOrigin}`);
      callback(new Error(`CORS policy: origin ${incomingOrigin} is not allowed`));
    }
  },

  credentials: true,           // ← Required for cookies to work cross-origin

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
  ],

  exposedHeaders: [
    "Set-Cookie",              // expose so browser can read the cookie header
  ],

  optionsSuccessStatus: 200,   // Some legacy browsers choke on 204
  maxAge: 86400,               // Cache preflight for 24 hours (seconds)
};