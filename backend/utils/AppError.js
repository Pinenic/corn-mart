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
