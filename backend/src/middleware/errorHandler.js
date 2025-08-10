const { logger } = require('../utils/logger');

const errorHandler = (error, req, res, next) => {
  // Log the error
  logger.error('Unhandled error occurred', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id || 'anonymous',
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let errorCode = 'INTERNAL_ERROR';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errorCode = 'VALIDATION_ERROR';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    errorCode = 'INVALID_ID';
  } else if (error.name === 'MongoError' && error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate key error';
    errorCode = 'DUPLICATE_KEY';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
    errorCode = 'UNAUTHORIZED';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
    errorCode = 'FORBIDDEN';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
    errorCode = 'NOT_FOUND';
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    message = 'Resource conflict';
    errorCode = 'CONFLICT';
  } else if (error.name === 'TooManyRequestsError') {
    statusCode = 429;
    message = 'Too many requests';
    errorCode = 'TOO_MANY_REQUESTS';
  }

  // Handle custom error objects
  if (error.statusCode) {
    statusCode = error.statusCode;
  }
  
  if (error.message) {
    message = error.message;
  }
  
  if (error.errorCode) {
    errorCode = error.errorCode;
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    code: errorCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error
    })
  });
};

module.exports = { errorHandler }; 