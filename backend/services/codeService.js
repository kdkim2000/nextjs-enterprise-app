/**
 * Code Service Layer
 *
 * Provides data access methods for codes and code types.
 */

const db = require('../config/database');
const { transformMultiLangArray, transformMultiLangFields } = require('../utils/multiLangTransform');

/**
 * Code Types Operations
 */

/**
 * Get all code types
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of code type objects
 */
async function getAllCodeTypes(options = {}) {
  const { search } = options;

  let query = 'SELECT * FROM code_types WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (code ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  query += ' ORDER BY code';

  const result = await db.query(query, params);
  return transformMultiLangArray(result.rows, ['name', 'description']);
}

/**
 * Get code type by code
 * @param {string} code - Code type code
 * @returns {Promise<Object|null>} Code type object or null
 */
async function getCodeTypeByCode(code) {
  const query = 'SELECT * FROM code_types WHERE code = $1';
  const result = await db.query(query, [code]);
  return result.rows[0] ? transformMultiLangFields(result.rows[0], ['name', 'description']) : null;
}

/**
 * Get code type by ID
 * @param {string} id - Code type ID
 * @returns {Promise<Object|null>} Code type object or null
 */
async function getCodeTypeById(id) {
  const query = 'SELECT * FROM code_types WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0] ? transformMultiLangFields(result.rows[0], ['name', 'description']) : null;
}

/**
 * Create a new code type
 * @param {Object} codeTypeData - Code type data
 * @returns {Promise<Object>} Created code type object
 */
async function createCodeType(codeTypeData) {
  const { id, code, nameEn, nameKo, nameZh, nameVi, descriptionEn, descriptionKo, descriptionZh, descriptionVi } = codeTypeData;

  const query = `
    INSERT INTO code_types (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    RETURNING *
  `;

  const params = [id, code, nameEn, nameKo, nameZh, nameVi, descriptionEn, descriptionKo, descriptionZh, descriptionVi];
  const result = await db.query(query, params);
  return transformMultiLangFields(result.rows[0], ['name', 'description']);
}

/**
 * Update a code type
 * @param {string} codeTypeId - Code type ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated code type object
 */
async function updateCodeType(codeTypeId, updates) {
  const allowedFields = ['code', 'name_en', 'name_ko', 'name_zh', 'name_vi', 'description_en', 'description_ko', 'description_zh', 'description_vi'];
  const setClause = [];
  const params = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      setClause.push(`${dbField} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  setClause.push(`updated_at = NOW()`);
  params.push(codeTypeId);

  const query = `UPDATE code_types SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await db.query(query, params);
  return result.rows[0] ? transformMultiLangFields(result.rows[0], ['name', 'description']) : null;
}

/**
 * Delete a code type
 * @param {string} codeTypeId - Code type ID
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteCodeType(codeTypeId) {
  const query = 'DELETE FROM code_types WHERE id = $1';
  const result = await db.query(query, [codeTypeId]);
  return result.rowCount > 0;
}

/**
 * Codes Operations
 */

/**
 * Get all codes with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of code objects
 */
async function getAllCodes(options = {}) {
  const { search, codeType, status } = options;

  let query = 'SELECT * FROM codes WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (code ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (codeType) {
    query += ` AND code_type = $${paramIndex}`;
    params.push(codeType);
    paramIndex++;
  }

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  query += ' ORDER BY code_type, "order", code';

  const result = await db.query(query, params);
  return result.rows;
}

/**
 * Get codes by code type
 * @param {string} codeType - Code type
 * @returns {Promise<Array>} Array of code objects
 */
async function getCodesByType(codeType) {
  const query = 'SELECT * FROM codes WHERE code_type = $1 AND status = $2 ORDER BY "order", code';
  const result = await db.query(query, [codeType, 'active']);
  return result.rows;
}

/**
 * Get code by ID
 * @param {string} id - Code ID
 * @returns {Promise<Object|null>} Code object or null
 */
async function getCodeById(id) {
  const query = 'SELECT * FROM codes WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}

/**
 * Get code by code
 * @param {string} code - Code
 * @returns {Promise<Object|null>} Code object or null
 */
async function getCodeByCode(code) {
  const query = 'SELECT * FROM codes WHERE code = $1';
  const result = await db.query(query, [code]);
  return result.rows[0] || null;
}

/**
 * Get code by type and code
 * @param {string} codeType - Code type
 * @param {string} code - Code
 * @returns {Promise<Object|null>} Code object or null
 */
async function getCodeByTypeAndCode(codeType, code) {
  const query = 'SELECT * FROM codes WHERE code_type = $1 AND code = $2';
  const result = await db.query(query, [codeType, code]);
  return result.rows[0] || null;
}

/**
 * Get count of codes with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise<number>} Count of codes
 */
async function getCodeCount(options = {}) {
  const { search, codeType, status } = options;

  let query = 'SELECT COUNT(*) FROM codes WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (code ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (codeType) {
    query += ` AND code_type = $${paramIndex}`;
    params.push(codeType);
    paramIndex++;
  }

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  const result = await db.query(query, params);
  return parseInt(result.rows[0].count);
}

/**
 * Get distinct code types
 * @returns {Promise<Array>} Array of distinct code types
 */
async function getDistinctCodeTypes() {
  const query = 'SELECT DISTINCT code_type FROM codes ORDER BY code_type';
  const result = await db.query(query);
  return result.rows.map(row => row.code_type);
}

/**
 * Create a new code
 * @param {Object} codeData - Code data
 * @returns {Promise<Object>} Created code object
 */
async function createCode(codeData) {
  const {
    id, code, codeType, nameEn, nameKo, nameZh, nameVi,
    descriptionEn, descriptionKo, descriptionZh, descriptionVi,
    order, status, attributes
  } = codeData;

  const query = `
    INSERT INTO codes (
      id, code, code_type, name_en, name_ko, name_zh, name_vi,
      description_en, description_ko, description_zh, description_vi,
      "order", status, attributes, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    id, code, codeType, nameEn, nameKo, nameZh, nameVi,
    descriptionEn, descriptionKo, descriptionZh, descriptionVi,
    order, status || 'active', attributes ? JSON.stringify(attributes) : null
  ];

  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Update a code
 * @param {string} codeId - Code ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated code object
 */
async function updateCode(codeId, updates) {
  const allowedFields = [
    'code', 'code_type', 'name_en', 'name_ko', 'name_zh', 'name_vi',
    'description_en', 'description_ko', 'description_zh', 'description_vi',
    'order', 'status', 'attributes'
  ];

  const setClause = [];
  const params = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      if (dbField === 'attributes' && value !== null) {
        setClause.push(`${dbField} = $${paramIndex}::jsonb`);
        params.push(JSON.stringify(value));
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
  params.push(codeId);

  const query = `UPDATE codes SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await db.query(query, params);
  return result.rows[0] || null;
}

/**
 * Delete a code
 * @param {string} codeId - Code ID
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteCode(codeId) {
  const query = 'DELETE FROM codes WHERE id = $1';
  const result = await db.query(query, [codeId]);
  return result.rowCount > 0;
}

module.exports = {
  // Code Types
  getAllCodeTypes,
  getCodeTypeByCode,
  getCodeTypeById,
  createCodeType,
  updateCodeType,
  deleteCodeType,

  // Codes
  getAllCodes,
  getCodesByType,
  getCodeById,
  getCodeByCode,
  getCodeByTypeAndCode,
  getCodeCount,
  getDistinctCodeTypes,
  createCode,
  updateCode,
  deleteCode,
};
