/**
 * Role Service Layer
 */

import { query } from '../utils/database';
import { Role, RoleCreateRequest, RoleUpdateRequest } from '../types';

export async function getAllRoles(options: {
  search?: string;
  isActive?: boolean;
  roleType?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Role[]> {
  const { search, isActive, roleType, limit, offset } = options;

  let queryText = 'SELECT * FROM roles WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` AND (name ILIKE $${paramIndex} OR display_name ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (isActive !== undefined) {
    queryText += ` AND is_active = $${paramIndex}`;
    params.push(isActive);
    paramIndex++;
  }

  if (roleType) {
    queryText += ` AND role_type = $${paramIndex}`;
    params.push(roleType);
    paramIndex++;
  }

  queryText += ' ORDER BY name';

  if (limit) {
    queryText += ` LIMIT $${paramIndex}`;
    params.push(limit);
    paramIndex++;
  }

  if (offset) {
    queryText += ` OFFSET $${paramIndex}`;
    params.push(offset);
  }

  const result = await query(queryText, params);
  return result.rows;
}

export async function getRoleById(roleId: string): Promise<Role | null> {
  const result = await query('SELECT * FROM roles WHERE id = $1', [roleId]);
  return result.rows[0] || null;
}

export async function getRoleByName(name: string): Promise<Role | null> {
  const result = await query('SELECT * FROM roles WHERE name = $1', [name]);
  return result.rows[0] || null;
}

export async function createRole(roleData: {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  role_type?: string;
  manager?: string;
  representative?: string;
  is_system?: boolean;
  is_active?: boolean;
  created_by?: string;
}): Promise<Role> {
  const queryText = `
    INSERT INTO roles (
      id, name, display_name, description, role_type, manager, representative,
      is_system, is_active, created_at, updated_at, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), $10)
    RETURNING *`;

  const params = [
    roleData.id,
    roleData.name,
    roleData.display_name,
    roleData.description,
    roleData.role_type,
    roleData.manager,
    roleData.representative,
    roleData.is_system !== undefined ? roleData.is_system : false,
    roleData.is_active !== undefined ? roleData.is_active : true,
    roleData.created_by
  ];

  const result = await query(queryText, params);
  return result.rows[0];
}

export async function updateRole(roleId: string, updates: any): Promise<Role | null> {
  const allowedFields = [
    'name', 'display_name', 'description', 'role_type',
    'manager', 'representative', 'is_system', 'is_active', 'updated_by'
  ];

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      setClause.push(`${key} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  setClause.push('updated_at = NOW()');
  params.push(roleId);

  const queryText = `UPDATE roles SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(queryText, params);
  return result.rows[0] || null;
}

export async function deleteRole(roleId: string): Promise<boolean> {
  const result = await query('DELETE FROM roles WHERE id = $1', [roleId]);
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function countUsersByRole(roleName: string): Promise<number> {
  const result = await query('SELECT COUNT(*) FROM users WHERE role = $1', [roleName]);
  return parseInt(result.rows[0].count, 10);
}
