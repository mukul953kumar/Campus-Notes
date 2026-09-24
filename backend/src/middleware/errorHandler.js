/**
 * Centralized Express error-handling middleware.
 * Ensures uniform error payloads and masks internal details in production.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // In development, log full error stack for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${req.method} ${req.originalUrl} - Status: ${statusCode}`, err);
  } else if (!isOperational) {
    // In production, log unhandled programming errors
    console.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, err.message);
  }

  const responsePayload = {
    success: false,
    message: isOperational || process.env.NODE_ENV !== 'production' 
      ? err.message 
      : 'Something went wrong on the server. Please try again.'
  };

  // Include stack trace only in non-production environments
  if (process.env.NODE_ENV === 'development') {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
