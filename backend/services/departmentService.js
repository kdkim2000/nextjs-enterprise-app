/**
 * Department Service Layer
 *
 * Performance Optimization:
 * - Uses Full-Text Search for general department searches
 * - Optimized with proper indexes
 */

const db = require('../config/database');
const { buildDepartmentSearchCondition, cleanSearchTerm } = require('../utils/searchHelper');

async function getAllDepartments(options = {}) {
  const { search } = options;
  let query = 'SELECT * FROM departments WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    const cleanedSearch = cleanSearchTerm(search);
    const { condition, param } = buildDepartmentSearchCondition(cleanedSearch, paramIndex);

    if (condition) {
      query += ` AND ${condition}`;
      params.push(param);
      paramIndex++;
    }
  }

  query += ' ORDER BY code';
  const result = await db.query(query, params);
  return result.rows;
}

async function getDepartmentById(id) {
  const result = await db.query('SELECT * FROM departments WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function getDepartmentByCode(code) {
  const result = await db.query('SELECT * FROM departments WHERE code = $1', [code]);
  return result.rows[0] || null;
}

async function getDepartmentsByParentId(parentId) {
  const query = parentId
    ? 'SELECT * FROM departments WHERE parent_id = $1'
    : 'SELECT * FROM departments WHERE parent_id IS NULL';

  const params = parentId ? [parentId] : [];
  const result = await db.query(query, params);
  return result.rows;
}

async function createDepartment(data) {
  const {
    id,
    code,
    nameEn,
    nameKo,
    nameZh,
    nameVi,
    descriptionEn,
    descriptionKo,
    descriptionZh,
    descriptionVi,
    parentId,
    managerId,
    level,
    order,
    status
  } = data;

  const query = `
    INSERT INTO departments (
      id, code,
      name_en, name_ko, name_zh, name_vi,
      description_en, description_ko, description_zh, description_vi,
      parent_id, manager_id, level, "order", status,
      created_at, updated_at
    )
    VALUES (
      $1, $2,
      $3, $4, $5, $6,
      $7, $8, $9, $10,
      $11, $12, $13, $14, $15,
      NOW(), NOW()
    )
    RETURNING *
  `;

  const result = await db.query(query, [
    id, code,
    nameEn, nameKo, nameZh, nameVi,
    descriptionEn, descriptionKo, descriptionZh, descriptionVi,
    parentId, managerId, level, order, status
  ]);

  return result.rows[0];
}

async function updateDepartment(id, updates) {
  const allowedFields = [
    'code',
    'name_en', 'name_ko', 'name_zh', 'name_vi',
    'description_en', 'description_ko', 'description_zh', 'description_vi',
    'parent_id', 'manager_id', 'level', 'order', 'status'
  ];

  const setClause = [];
  const params = [];
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

  const query = `UPDATE departments SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await db.query(query, params);
  return result.rows[0] || null;
}

async function deleteDepartment(id) {
  const result = await db.query('DELETE FROM departments WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = {
  getAllDepartments,
  getDepartmentById,
  getDepartmentByCode,
  getDepartmentsByParentId,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
