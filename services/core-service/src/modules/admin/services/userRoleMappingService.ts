/**
 * User Role Mapping Service - Admin Module
 */

import { query } from '../../../utils/database';
import { getLogger } from '@enterprise/shared';
import { v4 as uuidv4 } from 'uuid';
import { UserRoleMapping, UserRoleMappingWithDetails } from '../types';

const logger = getLogger('core-service:admin:user-role-mapping-service');

/**
 * Get all user role mappings
 */
export async function getAllMappings(options: {
  userId?: string;
  roleId?: string;
  isActive?: boolean;
  includeDetails?: boolean;
} = {}): Promise<UserRoleMappingWithDetails[]> {
  const { userId, roleId, isActive, includeDetails } = options;

  let sql: string;
  const params: any[] = [];
  let paramIndex = 1;

  if (includeDetails) {
    sql = `
      SELECT
        urm.*,
        u.name_ko as user_name,
        u.loginid as user_loginid,
        u.email as user_email,
        r.name as role_name,
        r.display_name as role_display_name
      FROM user_role_mappings urm
      LEFT JOIN users u ON urm.user_id = u.id
      LEFT JOIN roles r ON urm.role_id = r.id
      WHERE 1=1
    `;
  } else {
    sql = 'SELECT * FROM user_role_mappings WHERE 1=1';
  }

  if (userId) {
    sql += ` AND urm.user_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }

  if (roleId) {
    sql += ` AND urm.role_id = $${paramIndex}`;
    params.push(roleId);
    paramIndex++;
  }

  if (isActive !== undefined) {
    sql += ` AND urm.is_active = $${paramIndex}`;
    params.push(isActive);
    paramIndex++;
  }

  sql += ' ORDER BY urm.created_at DESC';

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Get mappings by user ID
 */
export async function getMappingsByUserId(userId: string): Promise<UserRoleMapping[]> {
  const result = await query(
    'SELECT * FROM user_role_mappings WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

/**
 * Get mappings by role ID
 */
export async function getMappingsByRoleId(roleId: string, includeDetails = false): Promise<UserRoleMappingWithDetails[]> {
  let sql: string;

  if (includeDetails) {
    sql = `
      SELECT
        urm.*,
        u.name_ko as user_name,
        u.loginid as user_loginid,
        u.email as user_email,
        r.name as role_name,
        r.display_name as role_display_name
      FROM user_role_mappings urm
      LEFT JOIN users u ON urm.user_id = u.id
      LEFT JOIN roles r ON urm.role_id = r.id
      WHERE urm.role_id = $1
      ORDER BY urm.created_at DESC
    `;
  } else {
    sql = 'SELECT * FROM user_role_mappings WHERE role_id = $1 ORDER BY created_at DESC';
  }

  const result = await query(sql, [roleId]);
  return result.rows;
}

/**
 * Get mapping by ID
 */
export async function getMappingById(id: string): Promise<UserRoleMapping | null> {
  const result = await query('SELECT * FROM user_role_mappings WHERE id = $1', [id]);
  return result.rows[0] || null;
}

/**
 * Check if mapping exists
 */
export async function mappingExists(userId: string, roleId: string): Promise<boolean> {
  const result = await query(
    'SELECT 1 FROM user_role_mappings WHERE user_id = $1 AND role_id = $2',
    [userId, roleId]
  );
  return result.rows.length > 0;
}

/**
 * Create user role mapping
 */
export async function createMapping(data: {
  userId: string;
  roleId: string;
  assignedBy?: string;
  expiresAt?: Date | null;
  isActive?: boolean;
}): Promise<UserRoleMapping> {
  const { userId, roleId, assignedBy, expiresAt, isActive = true } = data;

  const sql = `
    INSERT INTO user_role_mappings (
      id, user_id, role_id, assigned_by, assigned_at, expires_at, is_active, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, NOW(), $5, $6, NOW(), NOW())
    RETURNING *
  `;

  const result = await query(sql, [
    uuidv4(),
    userId,
    roleId,
    assignedBy || null,
    expiresAt || null,
    isActive
  ]);

  return result.rows[0];
}

/**
 * Update user role mapping
 */
export async function updateMapping(id: string, updates: {
  isActive?: boolean;
  expiresAt?: Date | null;
  updatedBy?: string;
}): Promise<UserRoleMapping | null> {
  const { isActive, expiresAt, updatedBy } = updates;

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (isActive !== undefined) {
    setClause.push(`is_active = $${paramIndex}`);
    params.push(isActive);
    paramIndex++;
  }

  if (expiresAt !== undefined) {
    setClause.push(`expires_at = $${paramIndex}`);
    params.push(expiresAt);
    paramIndex++;
  }

  if (updatedBy) {
    setClause.push(`updated_by = $${paramIndex}`);
    params.push(updatedBy);
    paramIndex++;
  }

  if (setClause.length === 0) {
    return getMappingById(id);
  }

  setClause.push('updated_at = NOW()');
  params.push(id);

  const sql = `UPDATE user_role_mappings SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(sql, params);
  return result.rows[0] || null;
}

/**
 * Delete user role mapping
 */
export async function deleteMapping(id: string): Promise<boolean> {
  const result = await query('DELETE FROM user_role_mappings WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Delete all mappings for a user
 */
export async function deleteMappingsByUserId(userId: string): Promise<number> {
  const result = await query('DELETE FROM user_role_mappings WHERE user_id = $1', [userId]);
  return result.rowCount ?? 0;
}

/**
 * Delete all mappings for a role
 */
export async function deleteMappingsByRoleId(roleId: string): Promise<number> {
  const result = await query('DELETE FROM user_role_mappings WHERE role_id = $1', [roleId]);
  return result.rowCount ?? 0;
}
