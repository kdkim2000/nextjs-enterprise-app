const fs = require('fs');
const path = require('path');

// Load data files
const getRoleProgramMappings = () => {
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/roleProgramMappings.json'), 'utf8')
  );
  return data.roleProgramMappings || [];
};

const getUserRoleMappings = () => {
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/userRoleMappings.json'), 'utf8')
  );
  return data.userRoleMappings || [];
};

const getPrograms = () => {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/programs.json'), 'utf8')
  );
};

/**
 * Get user's aggregated permissions for a program
 * @param {string} userId - User ID
 * @param {string} programCode - Program code (e.g., 'PROG-USER-LIST')
 * @returns {Object} - { canView, canCreate, canUpdate, canDelete, hasAccess }
 */
function getUserProgramPermissions(userId, programCode) {
  const userRoleMappings = getUserRoleMappings();
  const roleProgramMappings = getRoleProgramMappings();
  const programs = getPrograms();

  // Find program by code
  const program = programs.find(p => p.code === programCode);
  if (!program) {
    return { canView: false, canCreate: false, canUpdate: false, canDelete: false, hasAccess: false };
  }

  // Get user's active roles
  const userRoles = userRoleMappings
    .filter(urm => urm.userId === userId && urm.isActive)
    .map(urm => urm.roleId);

  if (userRoles.length === 0) {
    return { canView: false, canCreate: false, canUpdate: false, canDelete: false, hasAccess: false };
  }

  // Get program permissions for user's roles
  const programPermissions = roleProgramMappings.filter(
    rpm => userRoles.includes(rpm.roleId) && rpm.programId === program.id
  );

  // If no program permissions found, deny access
  if (programPermissions.length === 0) {
    return { canView: false, canCreate: false, canUpdate: false, canDelete: false, hasAccess: false };
  }

  // Aggregate permissions (OR logic - if any role has permission, user has it)
  const aggregatedPermissions = programPermissions.reduce(
    (acc, perm) => ({
      canView: acc.canView || perm.canView,
      canCreate: acc.canCreate || perm.canCreate,
      canUpdate: acc.canUpdate || perm.canUpdate,
      canDelete: acc.canDelete || perm.canDelete
    }),
    { canView: false, canCreate: false, canUpdate: false, canDelete: false }
  );

  return {
    ...aggregatedPermissions,
    hasAccess: aggregatedPermissions.canView // At minimum, user needs view permission
  };
}

/**
 * Check if user has access to a program
 * @param {string} programCode - Program code
 * @returns {Function} Express middleware
 */
function requireProgramAccess(programCode) {
  return (req, res, next) => {
    // Get userId from JWT token (set by authenticateToken middleware)
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const permissions = getUserProgramPermissions(userId, programCode);

    if (!permissions.hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this program'
      });
    }

    // Attach permissions to request object for use in route handlers
    req.programPermissions = permissions;
    next();
  };
}

/**
 * Check if user has specific permission for a program
 * @param {string} programCode - Program code
 * @param {string} permission - Permission type: 'view', 'create', 'update', 'delete'
 * @returns {Function} Express middleware
 */
function requirePermission(programCode, permission) {
  return (req, res, next) => {
    // Get userId from JWT token (set by authenticateToken middleware)
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const permissions = getUserProgramPermissions(userId, programCode);
    const permissionKey = `can${permission.charAt(0).toUpperCase() + permission.slice(1)}`;

    if (!permissions[permissionKey]) {
      return res.status(403).json({
        error: 'Permission denied',
        message: `You do not have ${permission} permission for this program`
      });
    }

    req.programPermissions = permissions;
    next();
  };
}

/**
 * Get all programs accessible by user with their permissions
 * @param {string} userId - User ID
 * @returns {Array} - Array of programs with permissions
 */
function getUserAccessiblePrograms(userId) {
  const userRoleMappings = getUserRoleMappings();
  const roleProgramMappings = getRoleProgramMappings();
  const programs = getPrograms();

  // Get user's active roles
  const userRoles = userRoleMappings
    .filter(urm => urm.userId === userId && urm.isActive)
    .map(urm => urm.roleId);

  if (userRoles.length === 0) {
    return [];
  }

  // Get all program permissions for user's roles
  const userProgramMappings = roleProgramMappings.filter(rpm =>
    userRoles.includes(rpm.roleId)
  );

  // Group by program and aggregate permissions
  const programPermissionsMap = new Map();

  userProgramMappings.forEach(rpm => {
    const programId = rpm.programId;
    const existing = programPermissionsMap.get(programId) || {
      canView: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false
    };

    programPermissionsMap.set(programId, {
      canView: existing.canView || rpm.canView,
      canCreate: existing.canCreate || rpm.canCreate,
      canUpdate: existing.canUpdate || rpm.canUpdate,
      canDelete: existing.canDelete || rpm.canDelete
    });
  });

  // Map to programs with permissions
  const accessiblePrograms = programs
    .filter(program => programPermissionsMap.has(program.id))
    .map(program => ({
      ...program,
      permissions: programPermissionsMap.get(program.id)
    }));

  return accessiblePrograms;
}

module.exports = {
  getUserProgramPermissions,
  requireProgramAccess,
  requirePermission,
  getUserAccessiblePrograms
};
