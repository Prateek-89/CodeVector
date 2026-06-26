/**
 * Centralized error handling middleware.
 *
 * All errors, whether from validation, database, or unknown sources,
 * are caught here and returned as consistent JSON responses.
 * This eliminates try/catch duplication in controllers.
 */

// Custom application error class with HTTP status code
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Express error-handling middleware (4 parameters)
function errorHandler(err, _req, res, _next) {
  // Log the error for debugging
  console.error(`[ERROR] ${err.message}`, err.stack);

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Prisma known request errors (e.g., record not found)
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Resource not found',
    });
  }

  // Our custom operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Unknown errors — don't leak details in production
  return res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
}

module.exports = { AppError, errorHandler };