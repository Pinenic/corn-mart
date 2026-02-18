import AppError from "../utils/AppError.js";
import logger from "../lib/logger.js";

export default (err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Normalize non-AppError errors
  if (!(err instanceof AppError)) {
    // Multer file upload errors
    if (err.name === "MulterError") {
      err = new AppError(err.message || "Invalid file upload", 400, {
        code: "INVALID_UPLOAD",
        details: { multerCode: err.code },
      });
    } else if (
      err instanceof SyntaxError &&
      err.status === 400 &&
      "body" in err
    ) {
      // Body parser / JSON parse error
      err = new AppError("Invalid JSON payload", 400, { code: "INVALID_JSON" });
    } else {
      // Unknown error — mark as non-operational
      err = new AppError(err.message || "Internal Server Error", 500, {
        isOperational: false,
      });
    }
  }

  // Detailed logging for non-operational errors
  if (!err.isOperational || process.env.NODE_ENV !== "production") {
    logger.error(err);
  } else {
    logger.warn(err.message);
  }

  const payload = {
    status: err.status,
    statusCode: err.statusCode,
    message:
      process.env.NODE_ENV === "production" && !err.isOperational
        ? "Internal Server Error"
        : err.message,
    code: err.code || null,
    details: err.details || null,
  };

  if (process.env.NODE_ENV !== "production") payload.stack = err.stack;

  res.status(err.statusCode || 500).json(payload);
};
