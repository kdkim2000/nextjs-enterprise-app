const { verifyToken } = require('../utils/jwt');
const { readJSON } = require('../utils/fileUtils');
const { isBlacklisted } = require('../utils/tokenBlacklist');
const path = require('path');

/**
 * Middleware to verify JWT token
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log(`[Auth] No token provided for ${req.method} ${req.path}`);
    return res.status(401).json({ error: 'Access token required' });
  }

  // Check if token is blacklisted (async)
  try {
    const blacklisted = await isBlacklisted(token);
    if (blacklisted) {
      console.log(`[Auth] Blacklisted token for ${req.method} ${req.path}`);
      return res.status(401).json({ error: 'Token has been revoked' });
    }
  } catch (error) {
    console.error(`[Auth] Error checking blacklist:`, error);
    // Continue - fail open for availability
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    // Return 401 for invalid/expired tokens (not 403)
    // 401 = authentication failed, 403 = insufficient permissions
    console.log(`[Auth] Invalid/expired token for ${req.method} ${req.path}:`, error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware to check user permissions
 */
async function checkPermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const permissionsPath = path.join(__dirname, '../data/permissions.json');
      const permissions = await readJSON(permissionsPath);

      const userPermissions = permissions.find(p => p.userId === userId);

      if (!userPermissions) {
        return res.status(403).json({ error: 'No permissions found' });
      }

      const hasPermission = userPermissions.permissions.includes(requiredPermission) ||
                           userPermissions.permissions.includes('*');

      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

module.exports = {
  authenticateToken,
  checkPermission
};
