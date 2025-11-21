const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { RateLimitError } = require('../utils/ApiError');
const { ErrorCodes } = require('../constants/errorCodes');

/**
 * Standard rate limit error handler
 * Uses the new ApiError system for consistent error responses
 */
function createRateLimitHandler(errorCode = ErrorCodes.RATE_LIMIT_EXCEEDED) {
  return (req, res) => {
    const error = new RateLimitError(errorCode);
    const errorResponse = error.toJSON();

    // Add rate limit specific information
    errorResponse.retryAfter = Math.ceil(req.rateLimit.resetTime / 1000);
    errorResponse.limit = req.rateLimit.limit;

    console.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.method} ${req.path}`);

    res.status(error.statusCode).json(errorResponse);
  };
}

/**
 * Get configuration from environment or use defaults
 */
const config = {
  general: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  auth: {
    windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 5,
  },
  mfa: {
    windowMs: parseInt(process.env.RATE_LIMIT_MFA_WINDOW_MS, 10) || 5 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MFA_MAX, 10) || 3,
  },
  upload: {
    windowMs: parseInt(process.env.RATE_LIMIT_UPLOAD_WINDOW_MS, 10) || 60 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX, 10) || 50,
  },
  modify: {
    windowMs: parseInt(process.env.RATE_LIMIT_MODIFY_WINDOW_MS, 10) || 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MODIFY_MAX, 10) || 20,
  },
};

/**
 * General API rate limiter
 * Applies to all API endpoints
 * Configurable via RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX env vars
 */
const generalLimiter = rateLimit({
  windowMs: config.general.windowMs,
  max: config.general.max,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for authenticated users with higher privileges
  skip: (req) => {
    // If user is authenticated and is an admin, skip rate limiting
    return req.user && req.user.user_category === 'admin';
  },
  handler: createRateLimitHandler(ErrorCodes.RATE_LIMIT_EXCEEDED),
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 * Configurable via RATE_LIMIT_AUTH_WINDOW_MS and RATE_LIMIT_AUTH_MAX
 */
const authLimiter = rateLimit({
  windowMs: config.auth.windowMs,
  max: config.auth.max,
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
  // Use IP + username for more accurate rate limiting
  // Using ipKeyGenerator to properly handle IPv6 addresses
  keyGenerator: (req) => {
    const username = req.body?.loginid || req.body?.email || 'unknown';
    const ip = ipKeyGenerator(req);
    return `${ip}-${username}`;
  },
  handler: createRateLimitHandler(ErrorCodes.RATE_LOGIN_LIMIT_EXCEEDED),
});

/**
 * Rate limiter for MFA endpoints
 * Prevents MFA code brute force
 * Configurable via RATE_LIMIT_MFA_WINDOW_MS and RATE_LIMIT_MFA_MAX
 */
const mfaLimiter = rateLimit({
  windowMs: config.mfa.windowMs,
  max: config.mfa.max,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(ErrorCodes.RATE_MFA_LIMIT_EXCEEDED),
});

/**
 * Rate limiter for file upload endpoints
 * Prevents abuse of file upload functionality
 * Configurable via RATE_LIMIT_UPLOAD_WINDOW_MS and RATE_LIMIT_UPLOAD_MAX
 */
const uploadLimiter = rateLimit({
  windowMs: config.upload.windowMs,
  max: config.upload.max,
  standardHeaders: true,
  legacyHeaders: false,
  // Higher limit for authenticated users
  skip: (req) => {
    return req.user && req.user.user_category === 'admin';
  },
  handler: createRateLimitHandler(ErrorCodes.RATE_UPLOAD_LIMIT_EXCEEDED),
});

/**
 * Rate limiter for API endpoints that modify data
 * Prevents spam and abuse
 * Configurable via RATE_LIMIT_MODIFY_WINDOW_MS and RATE_LIMIT_MODIFY_MAX
 */
const modifyLimiter = rateLimit({
  windowMs: config.modify.windowMs,
  max: config.modify.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(ErrorCodes.RATE_LIMIT_EXCEEDED),
});

/**
 * Very strict rate limiter for sensitive operations
 * Use for password reset, account deletion, etc.
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(ErrorCodes.RATE_LIMIT_EXCEEDED),
});

module.exports = {
  generalLimiter,
  authLimiter,
  mfaLimiter,
  uploadLimiter,
  modifyLimiter,
  strictLimiter,
  config, // Export config for reference
};
