// server.js
// Process entry point. Starts the HTTP server and handles graceful shutdown.
//
// Graceful shutdown matters because:
//   - In-flight requests should complete before the process exits
//   - Supabase connections should be released cleanly
//   - Kubernetes/Docker send SIGTERM before force-killing a container

// dotenv must be the very first import so env vars are loaded
// before any other module (especially config/env.js) is evaluated
import "dotenv/config";

import app from "./src/app.js";
import env from "./src/config/env.js";
import logger from "./src/utils/logger.js";
import { emailWorker } from "./src/workers/emailWorker.js";
import { notificationWorker } from "./src/workers/notificationWorker.js";

let server;

function start() {
  server = app.listen(env.PORT, () => {
    logger.info(`Corn Mart API running`, {
      port: env.PORT,
      env: env.NODE_ENV,
      version: process.env.npm_package_version || "1.0.0",
    });
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      logger.error(`Port ${env.PORT} is already in use`);
    } else {
      logger.error("Server error", { message: err.message });
    }
    process.exit(1);
  });

  setInterval(notificationWorker, 60000); // every 60 sec
  setInterval(emailWorker, 70000); // every 70 sec
}

// ── Graceful shutdown ─────────────────────────────────────────
// Stops accepting new connections, waits for in-flight requests to finish,
// then exits cleanly. Container orchestrators (Docker, Kubernetes) send
// SIGTERM first, then SIGKILL after a grace period (default 30s).

function shutdown(signal) {
  logger.info(`${signal} received — starting graceful shutdown`);

  if (!server) return process.exit(0);

  server.close((err) => {
    if (err) {
      logger.error("Error during server close", { message: err.message });
      process.exit(1);
    }
    logger.info("All connections closed — process exiting");
    process.exit(0);
  });

  // Force exit after 10s if connections are still open
  setTimeout(() => {
    logger.warn("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Catch unhandled promise rejections — log and exit
// (Node.js will exit with code 1 by default in Node 18+, but we want logging)
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason: String(reason) });
  shutdown("unhandledRejection");
});

// Catch uncaught exceptions — these are always fatal
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", {
    message: err.message,
    stack: err.stack,
  });
  shutdown("uncaughtException");
});

start();
