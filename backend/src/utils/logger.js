// src/utils/logger.js
// Lightweight structured logger.
// In production, swap the console calls for a proper logger
// (Winston, Pino) and ship logs to a service (Datadog, Logtail).

import env from "../config/env.js";

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = env.isDev ? LEVELS.debug : LEVELS.info;

function format(level, message, meta = {}) {
  const entry = {
    ts:      new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  // In production emit pure JSON; in dev emit readable format
  if (env.isProd) return JSON.stringify(entry);
  const metaStr = Object.keys(meta).length
    ? "  " + JSON.stringify(meta, null, 0)
    : "";
  return `[${entry.ts}] ${level.toUpperCase().padEnd(5)} ${message}${metaStr}`;
}

const logger = {
  error: (message, meta) => {
    if (currentLevel >= LEVELS.error) console.error(format("error", message, meta));
  },
  warn: (message, meta) => {
    if (currentLevel >= LEVELS.warn) console.warn(format("warn", message, meta));
  },
  info: (message, meta) => {
    if (currentLevel >= LEVELS.info) console.info(format("info", message, meta));
  },
  debug: (message, meta) => {
    if (currentLevel >= LEVELS.debug) console.debug(format("debug", message, meta));
  },
};

export default logger;
