/**
 * Custom API Error Class
 *
 * Standardized error format for consistent error handling across the application.
 */

const { ErrorCodes, getHttpStatusFromCode, getMessageFromCode } = require('../constants/errorCodes');

class ApiError extends Error {
  /**
   * Create an API Error
   * @param {string} code - Error code from ErrorCodes
   * @param {string} message - Optional custom message (overrides default)
   * @param {number} statusCode - Optional custom HTTP status code
   * @param {Object} details - Optional additional error details
   */
  constructor(code, message = null, statusCode = null, details = null) {
    // Use provided message or get default message from code
    const errorMessage = message || getMessageFromCode(code);
    super(errorMessage);

    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode || getHttpStatusFromCode(code);
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON response format
   * @param {boolean} includeStack - Whether to include stack trace (only in development)
   * @returns {Object} JSON error response
   */
  toJSON(includeStack = false) {
    const response = {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        timestamp: this.timestamp,
      },
    };

    if (this.details) {
      response.error.details = this.details;
    }

    if (includeStack && process.env.NODE_ENV === 'development') {
      response.error.stack = this.stack;
    }

    return response;
  }
}

/**
 * Convenience factory methods for common errors
 */

class AuthenticationError extends ApiError {
  constructor(code = ErrorCodes.AUTH_TOKEN_INVALID, message = null) {
    super(code, message);
  }
}

class ValidationError extends ApiError {
  constructor(message, details = null) {
    super(ErrorCodes.VALID_INVALID_INPUT, message, 400, details);
  }
}

class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(ErrorCodes.RES_NOT_FOUND, `${resource} not found`, 404);
  }
}

class ConflictError extends ApiError {
  constructor(message = 'Resource already exists') {
    super(ErrorCodes.RES_ALREADY_EXISTS, message, 409);
  }
}

class ForbiddenError extends ApiError {
  constructor(message = 'Permission denied') {
    super(ErrorCodes.AUTH_PERMISSION_DENIED, message, 403);
  }
}

class DatabaseError extends ApiError {
  constructor(message = 'Database operation failed', code = ErrorCodes.DB_QUERY_FAILED) {
    super(code, message, 500);
  }
}

class RateLimitError extends ApiError {
  constructor(retryAfter = null) {
    super(ErrorCodes.RATE_LIMIT_EXCEEDED);
    this.retryAfter = retryAfter;
  }

  toJSON(includeStack = false) {
    const response = super.toJSON(includeStack);
    if (this.retryAfter) {
      response.retryAfter = this.retryAfter;
    }
    return response;
  }
}

/**
 * Convert database errors to ApiError
 * @param {Error} error - Database error
 * @returns {ApiError} Converted API error
 */
function fromDatabaseError(error) {
  // PostgreSQL error codes
  // https://www.postgresql.org/docs/current/errcodes-appendix.html

  if (error.code === '23505') {
    // Unique constraint violation
    return new ApiError(
      ErrorCodes.DB_DUPLICATE_KEY,
      'A record with this value already exists',
      409,
      { constraint: error.constraint }
    );
  }

  if (error.code === '23503') {
    // Foreign key violation
    return new ApiError(
      ErrorCodes.DB_FOREIGN_KEY_VIOLATION,
      'Referenced record does not exist',
      400,
      { constraint: error.constraint }
    );
  }

  if (error.code === '23502') {
    // Not null violation
    return new ApiError(
      ErrorCodes.VALID_MISSING_FIELD,
      'Required field cannot be null',
      400,
      { column: error.column }
    );
  }

  if (error.code === '22P02') {
    // Invalid text representation
    return new ApiError(
      ErrorCodes.VALID_INVALID_FORMAT,
      'Invalid data format',
      400
    );
  }

  if (error.code === '57014') {
    // Query canceled (timeout)
    return new ApiError(
      ErrorCodes.DB_TIMEOUT,
      'Database query timeout',
      504
    );
  }

  // Generic database error
  return new DatabaseError(
    process.env.NODE_ENV === 'development'
      ? error.message
      : 'Database operation failed'
  );
}

/**
 * Check if error is an ApiError
 * @param {Error} error - Error to check
 * @returns {boolean} True if error is ApiError
 */
function isApiError(error) {
  return error instanceof ApiError;
}

module.exports = {
  ApiError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
  DatabaseError,
  RateLimitError,
  fromDatabaseError,
  isApiError,
};
