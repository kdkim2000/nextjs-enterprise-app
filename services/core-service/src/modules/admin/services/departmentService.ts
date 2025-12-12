/**
 * Department Service - Admin Module
 */

import { query } from '../../../utils/database';
import { getLogger } from '@enterprise/shared';

const logger = getLogger('core-service:admin:department-service');

export async function getAllDepartments(options: { search?: string } = {}) {
  const { search } = options;

  let sql = 'SELECT * FROM departments WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    sql += ` AND (
      code ILIKE $${paramIndex} OR
      name_en ILIKE $${paramIndex} OR
      name_ko ILIKE $${paramIndex}
    )`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  sql += ' ORDER BY code';

  const result = await query(sql, params);
  return result.rows;
}

export async function getDepartmentById(id: string) {
  const result = await query('SELECT * FROM departments WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function getDepartmentByCode(code: string) {
  const result = await query('SELECT * FROM departments WHERE code = $1', [code]);
  return result.rows[0] || null;
}

export async function getDepartmentsByParentId(parentId: string | null) {
  const sql = parentId
    ? 'SELECT * FROM departments WHERE parent_id = $1'
    : 'SELECT * FROM departments WHERE parent_id IS NULL';

  const params = parentId ? [parentId] : [];
  const result = await query(sql, params);
  return result.rows;
}

export async function createDepartment(data: {
  id?: string;
  code: string;
  nameEn: string;
  nameKo: string;
  nameZh?: string;
  nameVi?: string;
  descriptionEn?: string;
  descriptionKo?: string;
  descriptionZh?: string;
  descriptionVi?: string;
  parentId?: string | null;
  managerId?: string | null;
  level: number;
  order: number;
  status: string;
}) {
  const {
    id,
    code,
    nameEn,
    nameKo,
    nameZh = '',
    nameVi = '',
    descriptionEn = '',
    descriptionKo = '',
    descriptionZh = '',
    descriptionVi = '',
    parentId = null,
    managerId = null,
    level,
    order,
    status
  } = data;

  const sql = `
    INSERT INTO departments (
      id, code,
      name_en, name_ko, name_zh, name_vi,
      description_en, description_ko, description_zh, description_vi,
      parent_id, manager_id, level, "order", status,
      created_at, updated_at
    )
    VALUES (
      COALESCE($1, gen_random_uuid()), $2,
      $3, $4, $5, $6,
      $7, $8, $9, $10,
      $11, $12, $13, $14, $15,
      NOW(), NOW()
    )
    RETURNING *
  `;

  const result = await query(sql, [
    id, code,
    nameEn, nameKo, nameZh, nameVi,
    descriptionEn, descriptionKo, descriptionZh, descriptionVi,
    parentId, managerId, level, order, status
  ]);

  return result.rows[0];
}

export async function updateDepartment(id: string, updates: Record<string, any>) {
  const allowedFields = [
    'code',
    'name_en', 'name_ko', 'name_zh', 'name_vi',
    'description_en', 'description_ko', 'description_zh', 'description_vi',
    'parent_id', 'manager_id', 'level', 'order', 'status'
  ];

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    // Convert camelCase to snake_case
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();

    if (allowedFields.includes(dbField)) {
      // Handle "order" as a reserved keyword
      const fieldName = dbField === 'order' ? '"order"' : dbField;
      setClause.push(`${fieldName} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  setClause.push(`updated_at = NOW()`);
  params.push(id);

  const sql = `UPDATE departments SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(sql, params);
  return result.rows[0] || null;
}

export async function deleteDepartment(id: string) {
  const result = await query('DELETE FROM departments WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
