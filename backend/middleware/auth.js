const { verifyToken } = require('../utils/jwt');
const { readJSON } = require('../utils/fileUtils');
const { isBlacklisted } = require('../utils/tokenBlacklist');
const { AuthenticationError } = require('../utils/ApiError');
const { ErrorCodes } = require('../constants/errorCodes');
const path = require('path');

/**
 * Middleware to verify JWT token
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log(`[Auth] No token provided for ${req.method} ${req.path}`);
      throw new AuthenticationError(ErrorCodes.AUTH_TOKEN_MISSING);
    }

    // Check if token is blacklisted (async)
    try {
      const blacklisted = await isBlacklisted(token);
      if (blacklisted) {
        console.log(`[Auth] Blacklisted token for ${req.method} ${req.path}`);
        throw new AuthenticationError(ErrorCodes.AUTH_TOKEN_REVOKED);
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      console.error(`[Auth] Error checking blacklist:`, error);
      // Continue - fail open for availability
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    // Pass to error handler middleware
    next(error);
  }
}

/**
 * Middleware to check user permissions
 * Note: This uses legacy permissions.json file
 */
async function checkPermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const permissionsPath = path.join(__dirname, '../data/permissions.json');
      const permissions = await readJSON(permissionsPath);

      const userPermissions = permissions.find(p => p.userId === userId);

      if (!userPermissions) {
        const { ForbiddenError } = require('../utils/ApiError');
        throw new ForbiddenError('No permissions found');
      }

      const hasPermission = userPermissions.permissions.includes(requiredPermission) ||
                           userPermissions.permissions.includes('*');

      if (!hasPermission) {
        const { ForbiddenError } = require('../utils/ApiError');
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  authenticateToken,
  checkPermission
};
