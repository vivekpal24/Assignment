function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle MongoDB / Mongoose specific errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
  }

  if (err.code === 11000) {
    // Duplicate key error (e.g., reservationId already exists)
    statusCode = 409;
    message = 'Duplicate entry detected';
  }

  if (err.name === 'CastError') {
    // Invalid ObjectId or casting issue
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  // Send response
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
