/**
 * Permission Service - Admin Module
 */

import { query } from '../../../utils/database';
import { getLogger } from '@enterprise/shared';
import { ProgramPermission, AccessibleProgram } from '../types';

const logger = getLogger('core-service:admin:permission-service');

/**
 * Get user's role mappings
 */
export async function getUserRoleMappings(userId: string): Promise<any[]> {
  const result = await query(
    `SELECT urm.*, r.name as role_name
     FROM user_role_mappings urm
     LEFT JOIN roles r ON urm.role_id = r.id
     WHERE urm.user_id = $1`,
    [userId]
  );
  return result.rows;
}

/**
 * Get all role-program mappings
 */
export async function getAllRoleProgramMappings(): Promise<any[]> {
  const result = await query('SELECT * FROM role_program_mappings', []);
  return result.rows;
}

/**
 * Get all programs
 */
export async function getAllPrograms(): Promise<any[]> {
  const result = await query('SELECT * FROM programs', []);
  return result.rows;
}

/**
 * Get program by code
 */
export async function getProgramByCode(code: string): Promise<any | null> {
  const result = await query('SELECT * FROM programs WHERE code = $1', [code]);
  return result.rows[0] || null;
}

/**
 * Get user's aggregated permissions for a program
 */
export async function getUserProgramPermissions(userId: string, programCode: string): Promise<ProgramPermission> {
  try {
    // Find program by code
    const program = await getProgramByCode(programCode);
    if (!program) {
      return { canView: false, canCreate: false, canUpdate: false, canDelete: false, hasAccess: false };
    }

    // Get user's active role mappings
    const userRoleMappings = await getUserRoleMappings(userId);
    const activeUserRoles = userRoleMappings.filter(urm => urm.is_active !== false);

    if (activeUserRoles.length === 0) {
      return { canView: false, canCreate: false, canUpdate: false, canDelete: false, hasAccess: false };
    }

    const userRoleIds = activeUserRoles.map(urm => urm.role_id);

    // Get program permissions for user's roles
    const allRoleProgramMappings = await getAllRoleProgramMappings();
    const programPermissions = allRoleProgramMappings.filter(
      rpm => userRoleIds.includes(rpm.role_id) && rpm.program_code === program.code
    );

    // If no program permissions found, deny access
    if (programPermissions.length === 0) {
      return { canView: false, canCreate: false, canUpdate: false, canDelete: false, hasAccess: false };
    }

    // Aggregate permissions (OR logic - if any role has permission, user has it)
    const aggregatedPermissions = programPermissions.reduce(
      (acc: any, perm: any) => ({
        canView: acc.canView || perm.can_view,
        canCreate: acc.canCreate || perm.can_create,
        canUpdate: acc.canUpdate || perm.can_update,
        canDelete: acc.canDelete || perm.can_delete
      }),
      { canView: false, canCreate: false, canUpdate: false, canDelete: false }
    );

    return {
      ...aggregatedPermissions,
      hasAccess: aggregatedPermissions.canView
    };
  } catch (error) {
    logger.error('Error getting user program permissions:', error);
    return { canView: false, canCreate: false, canUpdate: false, canDelete: false, hasAccess: false };
  }
}

/**
 * Get all programs accessible by user with their permissions
 */
export async function getUserAccessiblePrograms(userId: string): Promise<AccessibleProgram[]> {
  try {
    // Get user's active role mappings
    const userRoleMappings = await getUserRoleMappings(userId);
    const activeUserRoles = userRoleMappings.filter(urm => urm.is_active !== false);

    if (activeUserRoles.length === 0) {
      return [];
    }

    const userRoleIds = activeUserRoles.map(urm => urm.role_id);

    // Get all program permissions for user's roles
    const allRoleProgramMappings = await getAllRoleProgramMappings();
    const userProgramMappings = allRoleProgramMappings.filter(rpm =>
      userRoleIds.includes(rpm.role_id)
    );

    // Get all programs
    const allPrograms = await getAllPrograms();

    // Group by program and aggregate permissions
    const programPermissionsMap = new Map<string, {
      canView: boolean;
      canCreate: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }>();

    userProgramMappings.forEach(rpm => {
      const programCode = rpm.program_code;
      const existing = programPermissionsMap.get(programCode) || {
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      };

      programPermissionsMap.set(programCode, {
        canView: existing.canView || rpm.can_view,
        canCreate: existing.canCreate || rpm.can_create,
        canUpdate: existing.canUpdate || rpm.can_update,
        canDelete: existing.canDelete || rpm.can_delete
      });
    });

    // Map to programs with permissions
    const accessiblePrograms: AccessibleProgram[] = allPrograms
      .filter(program => programPermissionsMap.has(program.code))
      .map(program => ({
        id: program.id,
        code: program.code,
        name: program.name_en || program.name,
        category: program.category,
        permissions: programPermissionsMap.get(program.code)!
      }));

    return accessiblePrograms;
  } catch (error) {
    logger.error('Error getting user accessible programs:', error);
    return [];
  }
}

/**
 * Check if user has admin role
 */
export async function isUserAdmin(userId: string, legacyRole?: string): Promise<boolean> {
  // Check legacy role field first
  if (legacyRole === 'admin') {
    return true;
  }

  try {
    const userRoleMappings = await getUserRoleMappings(userId);

    if (!userRoleMappings || userRoleMappings.length === 0) {
      return false;
    }

    const hasAdminRole = userRoleMappings.some(m =>
      m.is_active && (m.role_id === 'role-001' || m.role_name === 'admin')
    );

    return hasAdminRole;
  } catch (error) {
    logger.error('Error checking admin role:', error);
    return false;
  }
}
