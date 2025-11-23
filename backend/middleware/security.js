/**
 * Security Middleware
 *
 * Implements security best practices:
 * - XSS Protection headers
 * - Content Security Policy (CSP)
 * - HSTS (HTTP Strict Transport Security)
 * - Clickjacking protection
 * - MIME type sniffing protection
 * - NoSQL injection prevention
 * - Request size limiting
 */

const { ValidationError } = require('../utils/ApiError');
const { ErrorCodes } = require('../constants/errorCodes');

/**
 * Security Headers Middleware
 * Adds security-related HTTP headers to responses
 */
function securityHeaders(req, res, next) {
  // X-Content-Type-Options: Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options: Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // X-XSS-Protection: Enable XSS filter (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy: Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // X-Download-Options: Prevent IE from executing downloads
  res.setHeader('X-Download-Options', 'noopen');

  // X-Permitted-Cross-Domain-Policies: Restrict Adobe products
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // Content-Security-Policy (CSP)
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for development
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);

  // HSTS: Force HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Remove powered-by header
  res.removeHeader('X-Powered-By');

  next();
}

/**
 * NoSQL Injection Prevention
 * Checks for MongoDB operators in request data
 * Even though we use PostgreSQL, this prevents injection attempts
 */
function preventNoSQLInjection(req, res, next) {
  const check = (obj, path = '') => {
    if (typeof obj !== 'object' || obj === null) {
      return null;
    }

    for (const key of Object.keys(obj)) {
      // Check for MongoDB operators
      if (key.startsWith('$')) {
        return `${path}${key}`;
      }

      // Check for prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return `${path}${key}`;
      }

      // Recursive check
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const result = check(obj[key], `${path}${key}.`);
        if (result) return result;
      }
    }

    return null;
  };

  // Check body
  if (req.body) {
    const injectionKey = check(req.body);
    if (injectionKey) {
      throw new ValidationError(
        ErrorCodes.VALID_INVALID_INPUT,
        `Invalid request: suspicious key detected (${injectionKey})`
      );
    }
  }

  // Check query
  if (req.query) {
    const injectionKey = check(req.query);
    if (injectionKey) {
      throw new ValidationError(
        ErrorCodes.VALID_INVALID_INPUT,
        `Invalid request: suspicious key detected (${injectionKey})`
      );
    }
  }

  next();
}

/**
 * XSS Protection Middleware
 * Sanitizes input to prevent XSS attacks
 */
function xssProtection(req, res, next) {
  /**
   * Sanitize string to remove potentially dangerous content
   */
  const sanitize = (value, fieldName = '') => {
    if (typeof value === 'string') {
      // Don't sanitize HTML content fields (these are sanitized client-side with DOMPurify)
      const isContentField = fieldName.toLowerCase().includes('content') ||
                            fieldName.toLowerCase().includes('body') ||
                            fieldName.toLowerCase().includes('html');

      if (isContentField) {
        // For content fields, only remove dangerous JavaScript but keep HTML tags
        return value
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick=, onerror=, etc.)
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
          .trim();
      }

      // For non-content fields, apply strict sanitization
      return value
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, onerror=, etc.)
        .trim();
    }

    if (Array.isArray(value)) {
      return value.map((item, index) => sanitize(item, `${fieldName}[${index}]`));
    }

    if (value && typeof value === 'object') {
      const sanitized = {};
      for (const [key, val] of Object.entries(value)) {
        // Don't sanitize password fields
        if (key.toLowerCase().includes('password')) {
          sanitized[key] = val;
        } else {
          sanitized[key] = sanitize(val, key);
        }
      }
      return sanitized;
    }

    return value;
  };

  // Sanitize body (except for password fields)
  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitize(req.query);
  }

  next();
}

/**
 * Request Size Limiting
 * Prevents large payloads that could cause DoS
 */
function limitRequestSize(maxSizeInMB = 10) {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    const maxSize = maxSizeInMB * 1024 * 1024;

    if (contentLength > maxSize) {
      throw new ValidationError(
        ErrorCodes.VALID_INVALID_INPUT,
        `Request body too large. Maximum size: ${maxSizeInMB}MB`
      );
    }

    next();
  };
}

/**
 * SQL Injection Prevention (Additional Layer)
 * Checks for common SQL injection patterns
 * Note: Primary protection is using parameterized queries
 */
function preventSQLInjection(req, res, next) {
  const SQL_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(\bUNION\b.*\bSELECT\b)/gi,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
  ];

  const checkForSQLInjection = (value, fieldName = '') => {
    if (typeof value === 'string') {
      for (const pattern of SQL_PATTERNS) {
        if (pattern.test(value)) {
          throw new ValidationError(
            ErrorCodes.VALID_INVALID_INPUT,
            `Suspicious SQL pattern detected in ${fieldName || 'input'}`
          );
        }
      }
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) =>
        checkForSQLInjection(item, `${fieldName}[${index}]`)
      );
    }

    if (value && typeof value === 'object') {
      for (const [key, val] of Object.entries(value)) {
        // Skip password fields
        if (!key.toLowerCase().includes('password')) {
          checkForSQLInjection(val, key);
        }
      }
    }
  };

  try {
    // Check query parameters
    if (req.query) {
      checkForSQLInjection(req.query, 'query');
    }

    // Check body (be more lenient with body as it might contain legitimate SQL in some cases)
    // Only check if not a file upload
    if (req.body && !req.is('multipart/form-data')) {
      checkForSQLInjection(req.body, 'body');
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Hide Server Information
 * Removes identifying headers that could help attackers
 */
function hideServerInfo(req, res, next) {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
}

/**
 * CORS Security Enhancement
 * More restrictive CORS configuration for production
 */
function enhancedCORS(req, res, next) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
        /^http:\/\/\[::1\]:\d+$/,
      ];

  const origin = req.get('origin');

  if (!origin) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    return next();
  }

  const isAllowed = allowedOrigins.some((allowed) => {
    if (allowed instanceof RegExp) {
      return allowed.test(origin);
    }
    return allowed === origin;
  });

  if (!isAllowed && process.env.NODE_ENV === 'production') {
    throw new ValidationError(
      ErrorCodes.AUTH_PERMISSION_DENIED,
      'Origin not allowed by CORS policy'
    );
  }

  next();
}

/**
 * Prevent Parameter Pollution
 * Ensures query parameters are not arrays (unless expected)
 */
function preventParameterPollution(allowedArrayParams = []) {
  return (req, res, next) => {
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (Array.isArray(value) && !allowedArrayParams.includes(key)) {
          throw new ValidationError(
            ErrorCodes.VALID_INVALID_INPUT,
            `Parameter pollution detected: ${key} cannot be an array`
          );
        }
      }
    }
    next();
  };
}

module.exports = {
  securityHeaders,
  preventNoSQLInjection,
  xssProtection,
  limitRequestSize,
  preventSQLInjection,
  hideServerInfo,
  enhancedCORS,
  preventParameterPollution,
};
