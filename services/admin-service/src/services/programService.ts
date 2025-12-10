/**
 * Program Service
 */

import { query } from '../utils/database';
import { getLogger } from '@enterprise/shared';
import { v4 as uuidv4 } from 'uuid';

const logger = getLogger('admin-service:program-service');

export interface Program {
  id: string;
  code: string;
  name_en?: string;
  name_ko?: string;
  name_zh?: string;
  name_vi?: string;
  description_en?: string;
  description_ko?: string;
  description_zh?: string;
  description_vi?: string;
  category?: string;
  type?: string;
  status?: string;
  permissions?: any;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Get all programs
 */
export async function getAllPrograms(options: {
  search?: string;
  category?: string;
  type?: string;
  status?: string;
} = {}): Promise<Program[]> {
  const { search, category, type, status } = options;

  let sql = 'SELECT * FROM programs WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    sql += ` AND (code ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (category) {
    sql += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (type) {
    sql += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (status) {
    sql += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  sql += ' ORDER BY code';

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Get program by ID
 */
export async function getProgramById(id: string): Promise<Program | null> {
  const result = await query('SELECT * FROM programs WHERE id = $1', [id]);
  return result.rows[0] || null;
}

/**
 * Get program by code
 */
export async function getProgramByCode(code: string): Promise<Program | null> {
  const result = await query('SELECT * FROM programs WHERE code = $1', [code]);
  return result.rows[0] || null;
}

/**
 * Create program
 */
export async function createProgram(data: {
  code: string;
  nameEn?: string;
  nameKo?: string;
  nameZh?: string;
  nameVi?: string;
  descriptionEn?: string;
  descriptionKo?: string;
  descriptionZh?: string;
  descriptionVi?: string;
  category?: string;
  type?: string;
  status?: string;
  permissions?: any;
}): Promise<Program> {
  const {
    code,
    nameEn = '',
    nameKo = '',
    nameZh = '',
    nameVi = '',
    descriptionEn = '',
    descriptionKo = '',
    descriptionZh = '',
    descriptionVi = '',
    category = 'general',
    type = 'page',
    status = 'active',
    permissions = { canView: true, canCreate: false, canUpdate: false, canDelete: false }
  } = data;

  const sql = `
    INSERT INTO programs (
      id, code,
      name_en, name_ko, name_zh, name_vi,
      description_en, description_ko, description_zh, description_vi,
      category, type, status, permissions,
      created_at, updated_at
    )
    VALUES (
      $1, $2,
      $3, $4, $5, $6,
      $7, $8, $9, $10,
      $11, $12, $13, $14,
      NOW(), NOW()
    )
    RETURNING *
  `;

  const result = await query(sql, [
    uuidv4(), code,
    nameEn, nameKo, nameZh, nameVi,
    descriptionEn, descriptionKo, descriptionZh, descriptionVi,
    category, type, status, JSON.stringify(permissions)
  ]);

  return result.rows[0];
}

/**
 * Update program
 */
export async function updateProgram(id: string, updates: Record<string, any>): Promise<Program | null> {
  const allowedFields = [
    'code',
    'name_en', 'name_ko', 'name_zh', 'name_vi',
    'description_en', 'description_ko', 'description_zh', 'description_vi',
    'category', 'type', 'status', 'permissions'
  ];

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    // Convert camelCase to snake_case
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();

    if (allowedFields.includes(dbField)) {
      setClause.push(`${dbField} = $${paramIndex}`);
      params.push(dbField === 'permissions' ? JSON.stringify(value) : value);
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    return getProgramById(id);
  }

  setClause.push('updated_at = NOW()');
  params.push(id);

  const sql = `UPDATE programs SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(sql, params);
  return result.rows[0] || null;
}

/**
 * Delete program
 */
export async function deleteProgram(id: string): Promise<boolean> {
  const result = await query('DELETE FROM programs WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Get program categories
 */
export async function getCategories(): Promise<string[]> {
  const result = await query('SELECT DISTINCT category FROM programs WHERE category IS NOT NULL ORDER BY category');
  return result.rows.map(row => row.category);
}

/**
 * Get program types
 */
export async function getTypes(): Promise<string[]> {
  const result = await query('SELECT DISTINCT type FROM programs WHERE type IS NOT NULL ORDER BY type');
  return result.rows.map(row => row.type);
}
