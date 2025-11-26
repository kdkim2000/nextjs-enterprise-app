/**
 * Program Service Layer
 *
 * Provides data access methods for program-related operations.
 *
 * Performance Optimization:
 * - Uses Full-Text Search for general program searches
 * - Optimized with proper indexes
 */

const db = require('../config/database');
const { buildProgramSearchCondition, cleanSearchTerm } = require('../utils/searchHelper');

/**
 * Get all programs
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of program objects
 */
async function getAllPrograms(options = {}) {
  const { search, category, limit, offset } = options;

  let query = 'SELECT * FROM programs WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    const cleanedSearch = cleanSearchTerm(search);
    const { condition, param } = buildProgramSearchCondition(cleanedSearch, paramIndex);

    if (condition) {
      query += ` AND ${condition}`;
      params.push(param);
      paramIndex++;
    }
  }

  if (category) {
    query += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  query += ' ORDER BY category, code';

  if (limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(limit);
    paramIndex++;
  }

  if (offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(offset);
  }

  const result = await db.query(query, params);
  return result.rows;
}

/**
 * Get program by ID
 * @param {string} programId - Program ID
 * @returns {Promise<Object|null>} Program object or null
 */
async function getProgramById(programId) {
  const query = 'SELECT * FROM programs WHERE id = $1';
  const result = await db.query(query, [programId]);
  return result.rows[0] || null;
}

/**
 * Get program by code
 * @param {string} code - Program code
 * @returns {Promise<Object|null>} Program object or null
 */
async function getProgramByCode(code) {
  const query = 'SELECT * FROM programs WHERE code = $1';
  const result = await db.query(query, [code]);
  return result.rows[0] || null;
}

/**
 * Create a new program
 * @param {Object} programData - Program data
 * @returns {Promise<Object>} Created program object
 */
async function createProgram(programData) {
  const {
    id, code, nameEn, nameKo, nameZh, nameVi,
    descriptionEn, descriptionKo, descriptionZh, descriptionVi,
    category, type, status, permissions
  } = programData;

  const query = `
    INSERT INTO programs (
      id, code, name_en, name_ko, name_zh, name_vi,
      description_en, description_ko, description_zh, description_vi,
      category, type, status, permissions, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
    RETURNING *
  `;

  // For JSONB columns, pass the object directly (pg driver handles serialization)
  const permissionsValue = permissions || [];

  const params = [
    id, code, nameEn || '', nameKo || '', nameZh || '', nameVi || '',
    descriptionEn || '', descriptionKo || '', descriptionZh || '', descriptionVi || '',
    category, type || 'module', status || 'development',
    JSON.stringify(permissionsValue)
  ];
  console.log('[createProgram] SQL params:', params);
  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Update a program
 * @param {string} programId - Program ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated program object
 */
async function updateProgram(programId, updates) {
  const allowedFields = [
    'code', 'name_en', 'name_ko', 'name_zh', 'name_vi',
    'description_en', 'description_ko', 'description_zh', 'description_vi',
    'category', 'type', 'status', 'permissions'
  ];

  const setClause = [];
  const params = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      // Handle permissions as JSON
      if (dbField === 'permissions') {
        setClause.push(`${dbField} = $${paramIndex}`);
        params.push(value ? JSON.stringify(value) : '[]');
      } else {
        setClause.push(`${dbField} = $${paramIndex}`);
        params.push(value);
      }
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  setClause.push(`updated_at = NOW()`);
  params.push(programId);

  const query = `UPDATE programs SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await db.query(query, params);
  return result.rows[0] || null;
}

/**
 * Delete a program
 * @param {string} programId - Program ID
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteProgram(programId) {
  const query = 'DELETE FROM programs WHERE id = $1';
  const result = await db.query(query, [programId]);
  return result.rowCount > 0;
}

/**
 * Get user accessible programs based on role permissions
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of accessible program objects with permissions
 */
async function getUserPrograms(userId) {
  const query = `
    SELECT DISTINCT
      p.*,
      MAX(CASE WHEN rpm.can_view THEN 1 ELSE 0 END)::boolean as can_view,
      MAX(CASE WHEN rpm.can_create THEN 1 ELSE 0 END)::boolean as can_create,
      MAX(CASE WHEN rpm.can_update THEN 1 ELSE 0 END)::boolean as can_update,
      MAX(CASE WHEN rpm.can_delete THEN 1 ELSE 0 END)::boolean as can_delete
    FROM programs p
    INNER JOIN role_program_mappings rpm ON p.id = rpm.program_id
    INNER JOIN user_role_mappings urm ON rpm.role_id = urm.role_id
    WHERE urm.user_id = $1
    GROUP BY p.id
    HAVING MAX(CASE WHEN rpm.can_view THEN 1 ELSE 0 END) = 1
    ORDER BY p.category, p.code
  `;

  const result = await db.query(query, [userId]);
  return result.rows;
}

/**
 * Get user permissions for a specific program
 * @param {string} userId - User ID
 * @param {string} programCode - Program code
 * @returns {Promise<Object>} Permission object
 */
async function getUserProgramPermissions(userId, programCode) {
  const query = `
    SELECT
      MAX(CASE WHEN rpm.can_view THEN 1 ELSE 0 END)::boolean as can_view,
      MAX(CASE WHEN rpm.can_create THEN 1 ELSE 0 END)::boolean as can_create,
      MAX(CASE WHEN rpm.can_update THEN 1 ELSE 0 END)::boolean as can_update,
      MAX(CASE WHEN rpm.can_delete THEN 1 ELSE 0 END)::boolean as can_delete
    FROM programs p
    INNER JOIN role_program_mappings rpm ON p.id = rpm.program_id
    INNER JOIN user_role_mappings urm ON rpm.role_id = urm.role_id
    WHERE urm.user_id = $1 AND p.code = $2
    GROUP BY p.id
  `;

  const result = await db.query(query, [userId, programCode]);
  return result.rows[0] || { can_view: false, can_create: false, can_update: false, can_delete: false };
}

module.exports = {
  getAllPrograms,
  getProgramById,
  getProgramByCode,
  createProgram,
  updateProgram,
  deleteProgram,
  getUserPrograms,
  getUserProgramPermissions,
};
