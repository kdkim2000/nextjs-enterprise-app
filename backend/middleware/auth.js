const { verifyToken } = require('../utils/jwt');
const { readJSON } = require('../utils/fileUtils');
const path = require('path');

/**
 * Middleware to verify JWT token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
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
