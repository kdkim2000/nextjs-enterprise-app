/**
 * Role Program Mapping Service - Admin Module
 */

import { query } from '../../../utils/database';
import { getLogger } from '@enterprise/shared';
import { v4 as uuidv4 } from 'uuid';
import { RoleProgramMapping, RoleProgramMappingWithDetails } from '../types';

const logger = getLogger('core-service:admin:role-program-mapping-service');

/**
 * Get all role program mappings
 */
export async function getAllMappings(options: {
  roleId?: string;
  programCode?: string;
  includeDetails?: boolean;
} = {}): Promise<RoleProgramMappingWithDetails[]> {
  const { roleId, programCode, includeDetails } = options;

  let sql: string;
  const params: any[] = [];
  let paramIndex = 1;

  if (includeDetails) {
    sql = `
      SELECT
        rpm.*,
        r.name as role_name,
        r.display_name as role_display_name,
        p.name_ko as program_name
      FROM role_program_mappings rpm
      LEFT JOIN roles r ON rpm.role_id = r.id
      LEFT JOIN programs p ON rpm.program_code = p.code
      WHERE 1=1
    `;
  } else {
    sql = 'SELECT * FROM role_program_mappings WHERE 1=1';
  }

  if (roleId) {
    sql += ` AND rpm.role_id = $${paramIndex}`;
    params.push(roleId);
    paramIndex++;
  }

  if (programCode) {
    sql += ` AND rpm.program_code = $${paramIndex}`;
    params.push(programCode);
    paramIndex++;
  }

  sql += ' ORDER BY rpm.created_at DESC';

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Get mappings by role ID
 */
export async function getMappingsByRoleId(roleId: string, includeDetails = false): Promise<RoleProgramMappingWithDetails[]> {
  let sql: string;

  if (includeDetails) {
    sql = `
      SELECT
        rpm.*,
        r.name as role_name,
        r.display_name as role_display_name,
        p.name_ko as program_name
      FROM role_program_mappings rpm
      LEFT JOIN roles r ON rpm.role_id = r.id
      LEFT JOIN programs p ON rpm.program_code = p.code
      WHERE rpm.role_id = $1
      ORDER BY rpm.created_at DESC
    `;
  } else {
    sql = 'SELECT * FROM role_program_mappings WHERE role_id = $1 ORDER BY created_at DESC';
  }

  const result = await query(sql, [roleId]);
  return result.rows;
}

/**
 * Get mapping by ID
 */
export async function getMappingById(id: string): Promise<RoleProgramMapping | null> {
  const result = await query('SELECT * FROM role_program_mappings WHERE id = $1', [id]);
  return result.rows[0] || null;
}

/**
 * Check if mapping exists
 */
export async function mappingExists(roleId: string, programCode: string): Promise<boolean> {
  const result = await query(
    'SELECT 1 FROM role_program_mappings WHERE role_id = $1 AND program_code = $2',
    [roleId, programCode]
  );
  return result.rows.length > 0;
}

/**
 * Create role program mapping
 */
export async function createMapping(data: {
  roleId: string;
  programCode: string;
  canView?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  createdBy?: string;
}): Promise<RoleProgramMapping> {
  const {
    roleId,
    programCode,
    canView = true,
    canCreate = false,
    canUpdate = false,
    canDelete = false,
    createdBy
  } = data;

  const sql = `
    INSERT INTO role_program_mappings (
      id, role_id, program_code, can_view, can_create, can_update, can_delete, created_by, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    RETURNING *
  `;

  const result = await query(sql, [
    uuidv4(),
    roleId,
    programCode,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    createdBy || null
  ]);

  return result.rows[0];
}

/**
 * Update role program mapping
 */
export async function updateMapping(id: string, updates: {
  canView?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}): Promise<RoleProgramMapping | null> {
  const { canView, canCreate, canUpdate, canDelete } = updates;

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (canView !== undefined) {
    setClause.push(`can_view = $${paramIndex}`);
    params.push(canView);
    paramIndex++;
  }

  if (canCreate !== undefined) {
    setClause.push(`can_create = $${paramIndex}`);
    params.push(canCreate);
    paramIndex++;
  }

  if (canUpdate !== undefined) {
    setClause.push(`can_update = $${paramIndex}`);
    params.push(canUpdate);
    paramIndex++;
  }

  if (canDelete !== undefined) {
    setClause.push(`can_delete = $${paramIndex}`);
    params.push(canDelete);
    paramIndex++;
  }

  if (setClause.length === 0) {
    return getMappingById(id);
  }

  setClause.push('updated_at = NOW()');
  params.push(id);

  const sql = `UPDATE role_program_mappings SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(sql, params);
  return result.rows[0] || null;
}

/**
 * Delete role program mapping
 */
export async function deleteMapping(id: string): Promise<boolean> {
  const result = await query('DELETE FROM role_program_mappings WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Delete all mappings for a role
 */
export async function deleteMappingsByRoleId(roleId: string): Promise<number> {
  const result = await query('DELETE FROM role_program_mappings WHERE role_id = $1', [roleId]);
  return result.rowCount ?? 0;
}
