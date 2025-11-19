const mappingService = require('../services/mappingService');
const programService = require('../services/programService');

/**
 * Get user's aggregated permissions for a program
 * @param {string} userId - User ID
 * @param {string} programCode - Program code (e.g., 'PROG-USER-LIST')
 * @returns {Promise<Object>} - { canView, canCreate, canUpdate, canDelete, hasAccess }
 */
async function getUserProgramPermissions(userId, programCode) {
  try {
    // Find program by code
    const program = await programService.getProgramByCode(programCode);
    if (!program) {
      return { canView: false, canCreate: false, canUpdate: false, canDelete: false, hasAccess: false };
    }

    // Get user's active role mappings
    const userRoleMappings = await mappingService.getUserRoleMappings(userId);
    const activeUserRoles = userRoleMappings.filter(urm => urm.is_active !== false);

    if (activeUserRoles.length === 0) {
      return { canView: false, canCreate: false, canUpdate: false, canDelete: false, hasAccess: false };
    }

    const userRoleIds = activeUserRoles.map(urm => urm.role_id);

    // Get program permissions for user's roles
    const allRoleProgramMappings = await mappingService.getAllRoleProgramMappings();
    const programPermissions = allRoleProgramMappings.filter(
      rpm => userRoleIds.includes(rpm.role_id) && rpm.program_id === program.id
    );

    // If no program permissions found, deny access
    if (programPermissions.length === 0) {
      return { canView: false, canCreate: false, canUpdate: false, canDelete: false, hasAccess: false };
    }

    // Aggregate permissions (OR logic - if any role has permission, user has it)
    const aggregatedPermissions = programPermissions.reduce(
      (acc, perm) => ({
        canView: acc.canView || perm.can_view,
        canCreate: acc.canCreate || perm.can_create,
        canUpdate: acc.canUpdate || perm.can_update,
        canDelete: acc.canDelete || perm.can_delete
      }),
      { canView: false, canCreate: false, canUpdate: false, canDelete: false }
    );

    return {
      ...aggregatedPermissions,
      hasAccess: aggregatedPermissions.canView // At minimum, user needs view permission
    };
  } catch (error) {
    console.error('Error getting user program permissions:', error);
    return { canView: false, canCreate: false, canUpdate: false, canDelete: false, hasAccess: false };
  }
}

/**
 * Synchronous version for backward compatibility - caches user permissions
 * Note: This should be replaced with async version in routes
 */
const permissionsCache = new Map();

function getUserProgramPermissionsSync(userId, programCode) {
  const cacheKey = `${userId}:${programCode}`;

  if (permissionsCache.has(cacheKey)) {
    return permissionsCache.get(cacheKey);
  }

  // For sync calls, return a promise that must be awaited
  // This is a compatibility shim
  console.warn('Using sync permission check - consider migrating to async');
  return { canView: false, canCreate: false, canUpdate: false, canDelete: false, hasAccess: false };
}

/**
 * Check if user has access to a program
 * @param {string} programCode - Program code
 * @returns {Function} Express middleware
 */
function requireProgramAccess(programCode) {
  return async (req, res, next) => {
    try {
      // Get userId from JWT token (set by authenticateToken middleware)
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const permissions = await getUserProgramPermissions(userId, programCode);

      if (!permissions.hasAccess) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have permission to access this program'
        });
      }

      // Attach permissions to request object for use in route handlers
      req.programPermissions = permissions;
      next();
    } catch (error) {
      console.error('Error checking program access:', error);
      res.status(500).json({ error: 'Failed to check program access' });
    }
  };
}

/**
 * Check if user has specific permission for a program
 * @param {string} programCode - Program code
 * @param {string} permission - Permission type: 'view', 'create', 'update', 'delete'
 * @returns {Function} Express middleware
 */
function requirePermission(programCode, permission) {
  return async (req, res, next) => {
    try {
      // Get userId from JWT token (set by authenticateToken middleware)
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const permissions = await getUserProgramPermissions(userId, programCode);
      const permissionKey = `can${permission.charAt(0).toUpperCase() + permission.slice(1)}`;

      if (!permissions[permissionKey]) {
        return res.status(403).json({
          error: 'Permission denied',
          message: `You do not have ${permission} permission for this program`
        });
      }

      req.programPermissions = permissions;
      next();
    } catch (error) {
      console.error('Error checking permission:', error);
      res.status(500).json({ error: 'Failed to check permission' });
    }
  };
}

/**
 * Get all programs accessible by user with their permissions (SYNC for backward compatibility)
 * @param {string} userId - User ID
 * @returns {Array} - Array of programs with permissions (empty for sync, use async version)
 */
function getUserAccessiblePrograms(userId) {
  // For backward compatibility with synchronous code
  // Return empty array and log warning
  console.warn('getUserAccessiblePrograms called synchronously - use async version');

  // Try to get from cache if available
  const cacheKey = `user_programs:${userId}`;
  if (permissionsCache.has(cacheKey)) {
    return permissionsCache.get(cacheKey);
  }

  return [];
}

/**
 * Get all programs accessible by user with their permissions (ASYNC)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of programs with permissions
 */
async function getUserAccessibleProgramsAsync(userId) {
  try {
    // Get user's active role mappings
    const userRoleMappings = await mappingService.getUserRoleMappings(userId);
    const activeUserRoles = userRoleMappings.filter(urm => urm.is_active !== false);

    if (activeUserRoles.length === 0) {
      return [];
    }

    const userRoleIds = activeUserRoles.map(urm => urm.role_id);

    // Get all program permissions for user's roles
    const allRoleProgramMappings = await mappingService.getAllRoleProgramMappings();
    const userProgramMappings = allRoleProgramMappings.filter(rpm =>
      userRoleIds.includes(rpm.role_id)
    );

    // Get all programs
    const allPrograms = await programService.getAllPrograms();

    // Group by program and aggregate permissions
    const programPermissionsMap = new Map();

    userProgramMappings.forEach(rpm => {
      const programId = rpm.program_id;
      const existing = programPermissionsMap.get(programId) || {
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      };

      programPermissionsMap.set(programId, {
        canView: existing.canView || rpm.can_view,
        canCreate: existing.canCreate || rpm.can_create,
        canUpdate: existing.canUpdate || rpm.can_update,
        canDelete: existing.canDelete || rpm.can_delete
      });
    });

    // Map to programs with permissions
    const accessiblePrograms = allPrograms
      .filter(program => programPermissionsMap.has(program.id))
      .map(program => ({
        id: program.id,
        code: program.code,
        name: program.name_en || program.name,
        category: program.category,
        permissions: programPermissionsMap.get(program.id)
      }));

    // Cache for sync calls
    const cacheKey = `user_programs:${userId}`;
    permissionsCache.set(cacheKey, accessiblePrograms);

    // Clear cache after 1 minute
    setTimeout(() => {
      permissionsCache.delete(cacheKey);
    }, 60000);

    return accessiblePrograms;
  } catch (error) {
    console.error('Error getting user accessible programs:', error);
    return [];
  }
}

// Initialize cache for first user on startup
(async () => {
  try {
    // Pre-cache for common scenarios if needed
  } catch (error) {
    console.error('Error initializing permission cache:', error);
  }
})();

module.exports = {
  getUserProgramPermissions,
  getUserProgramPermissionsSync,
  requireProgramAccess,
  requirePermission,
  getUserAccessiblePrograms,
  getUserAccessibleProgramsAsync
};
