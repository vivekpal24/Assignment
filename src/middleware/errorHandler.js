// src/middleware/errorHandler.js

function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
  }

  // Duplicate key (e.g., reservationId conflict)
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry detected';
  }

  // Invalid ObjectId or cast error
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  // Final response as assignment requires
  const response = { error: message };

  // Only include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

module.exports = errorHandler;
