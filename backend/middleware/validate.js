/**
 * Request Validation Middleware
 *
 * Validates request body, query params, and URL params using Zod schemas
 */

const { ValidationError } = require('../utils/ApiError');
const { ZodError } = require('zod');

/**
 * Validate request using Zod schema
 *
 * @param {Object} schema - Zod schema object
 * @param {string} source - 'body', 'query', or 'params'
 * @returns {Function} Express middleware
 */
function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      // Get data from specified source
      const data = req[source];

      // Validate and transform data
      const validated = await schema.parseAsync(data);

      // Replace original data with validated & sanitized data
      req[source] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        // Return validation error
        const validationError = new ValidationError(
          'Validation failed',
          errors
        );

        return next(validationError);
      }

      // Other errors
      next(error);
    }
  };
}

/**
 * Validate request body
 */
function validateBody(schema) {
  return validate(schema, 'body');
}

/**
 * Validate query parameters
 */
function validateQuery(schema) {
  return validate(schema, 'query');
}

/**
 * Validate URL parameters
 */
function validateParams(schema) {
  return validate(schema, 'params');
}

/**
 * Validate multiple sources at once
 *
 * @param {Object} schemas - Object with body, query, params schemas
 * @returns {Function} Express middleware
 */
function validateRequest(schemas) {
  return async (req, res, next) => {
    try {
      const errors = [];

      // Validate body
      if (schemas.body) {
        try {
          req.body = await schemas.body.parseAsync(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map((err) => ({
              source: 'body',
              field: err.path.join('.'),
              message: err.message,
            })));
          }
        }
      }

      // Validate query
      if (schemas.query) {
        try {
          req.query = await schemas.query.parseAsync(req.query);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map((err) => ({
              source: 'query',
              field: err.path.join('.'),
              message: err.message,
            })));
          }
        }
      }

      // Validate params
      if (schemas.params) {
        try {
          req.params = await schemas.params.parseAsync(req.params);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map((err) => ({
              source: 'params',
              field: err.path.join('.'),
              message: err.message,
            })));
          }
        }
      }

      // If there are validation errors, return them
      if (errors.length > 0) {
        const validationError = new ValidationError(
          'Validation failed',
          errors
        );
        return next(validationError);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Sanitize all string inputs in request
 * Use this as a catch-all safety measure
 */
function sanitizeRequest(req, res, next) {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .trim()
        .replace(/[<>]/g, '') // Remove HTML tags
        .substring(0, 1000); // Limit length
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }

    return obj;
  };

  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }

  // Sanitize query
  if (req.query && typeof req.query === 'object') {
    req.query = sanitize(req.query);
  }

  next();
}

/**
 * Prevent NoSQL Injection
 * Checks for MongoDB operators in request data
 */
function preventNoSQLInjection(req, res, next) {
  const check = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    for (const key of Object.keys(obj)) {
      // Check for MongoDB operators
      if (key.startsWith('$')) {
        return true;
      }

      // Recursive check
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (check(obj[key])) {
          return true;
        }
      }
    }

    return false;
  };

  // Check body
  if (check(req.body)) {
    const error = new ValidationError('Invalid request: NoSQL injection detected');
    return next(error);
  }

  // Check query
  if (check(req.query)) {
    const error = new ValidationError('Invalid request: NoSQL injection detected');
    return next(error);
  }

  next();
}

/**
 * Limit request body size
 * Use this in addition to express.json({ limit }) for extra safety
 */
function limitRequestSize(maxSizeInMB = 10) {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    const maxSize = maxSizeInMB * 1024 * 1024;

    if (contentLength > maxSize) {
      const error = new ValidationError(
        `Request body too large. Maximum size: ${maxSizeInMB}MB`
      );
      return next(error);
    }

    next();
  };
}

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateRequest,
  sanitizeRequest,
  preventNoSQLInjection,
  limitRequestSize,
};
