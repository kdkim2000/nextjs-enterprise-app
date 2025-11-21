/**
 * Global Error Handling Middleware
 *
 * Catches all errors and converts them to standardized API responses.
 */

const { isApiError, fromDatabaseError } = require('../utils/ApiError');
const { ErrorCodes } = require('../constants/errorCodes');

/**
 * Global error handler middleware
 * Must be placed after all routes
 */
function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('Error caught by global handler:', {
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.userId,
  });

  // Convert to ApiError if not already
  let apiError = err;

  if (!isApiError(err)) {
    // Check if it's a database error
    if (err.code && err.code.match(/^\d{5}$/)) {
      // PostgreSQL error code format
      apiError = fromDatabaseError(err);
    } else if (err.name === 'ValidationError') {
      // Mongoose/Joi validation error
      const { ApiError } = require('../utils/ApiError');
      apiError = new ApiError(
        ErrorCodes.VALID_INVALID_INPUT,
        err.message,
        400,
        err.details || err.errors
      );
    } else if (err.name === 'JsonWebTokenError') {
      // JWT errors
      const { AuthenticationError } = require('../utils/ApiError');
      apiError = new AuthenticationError(ErrorCodes.AUTH_TOKEN_INVALID);
    } else if (err.name === 'TokenExpiredError') {
      const { AuthenticationError } = require('../utils/ApiError');
      apiError = new AuthenticationError(ErrorCodes.AUTH_TOKEN_EXPIRED);
    } else if (err.name === 'MulterError') {
      // File upload errors
      const { ApiError } = require('../utils/ApiError');
      if (err.code === 'LIMIT_FILE_SIZE') {
        apiError = new ApiError(ErrorCodes.FILE_TOO_LARGE, 'File size exceeds limit');
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        apiError = new ApiError(ErrorCodes.FILE_UPLOAD_FAILED, 'Too many files');
      } else {
        apiError = new ApiError(ErrorCodes.FILE_UPLOAD_FAILED, err.message);
      }
    } else {
      // Generic error
      const { ApiError } = require('../utils/ApiError');
      apiError = new ApiError(
        ErrorCodes.SYS_INTERNAL_ERROR,
        process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        500
      );
    }
  }

  // Send JSON response
  const includeStack = process.env.NODE_ENV === 'development';
  const response = apiError.toJSON(includeStack);

  // Add retry-after header for rate limit errors
  if (apiError.retryAfter) {
    res.set('Retry-After', apiError.retryAfter);
  }

  // Add CORS headers if needed
  res.set('Content-Type', 'application/json');

  res.status(apiError.statusCode).json(response);
}

/**
 * 404 Not Found handler
 * Should be placed before error handler but after all routes
 */
function notFoundHandler(req, res, next) {
  const { NotFoundError } = require('../utils/ApiError');
  const error = new NotFoundError(`Route ${req.method} ${req.path}`);
  next(error);
}

/**
 * Async route handler wrapper
 * Catches async errors and passes them to error handler
 *
 * Usage:
 *   router.get('/users', asyncHandler(async (req, res) => {
 *     const users = await userService.getAllUsers();
 *     res.json({ success: true, data: users });
 *   }));
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Success response helper
 * Standardizes success responses
 *
 * Usage:
 *   res.success(users);
 *   res.success(user, 201);
 *   res.success({ user, token }, 200, { message: 'Login successful' });
 */
function successResponse(data, statusCode = 200, meta = {}) {
  const response = {
    success: true,
    data: data,
    timestamp: new Date().toISOString(),
  };

  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  this.status(statusCode).json(response);
}

/**
 * Middleware to attach success helper to response
 */
function attachResponseHelpers(req, res, next) {
  res.success = successResponse.bind(res);
  next();
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  attachResponseHelpers,
};
