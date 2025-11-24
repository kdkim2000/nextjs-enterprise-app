/**
 * Board Type Service Layer
 *
 * Provides data access methods for board type-related operations.
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all board types
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of board type objects
 */
async function getAllBoardTypes(options = {}) {
  const { search, type, category, status, limit, offset } = options;

  let query = 'SELECT * FROM board_types WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (code ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (type) {
    query += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (category) {
    query += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  query += ' ORDER BY "order" ASC, created_at DESC';

  if (limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(limit);
    paramIndex++;
  }

  if (offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(offset);
    paramIndex++;
  }

  const result = await db.query(query, params);
  return result.rows;
}

/**
 * Get board type by ID
 * @param {string} boardTypeId - Board type ID
 * @returns {Promise<Object|null>} Board type object or null
 */
async function getBoardTypeById(boardTypeId) {
  const query = 'SELECT * FROM board_types WHERE id = $1';
  const result = await db.query(query, [boardTypeId]);
  return result.rows[0] || null;
}

/**
 * Get board type by code
 * @param {string} code - Board type code
 * @returns {Promise<Object|null>} Board type object or null
 */
async function getBoardTypeByCode(code) {
  const query = 'SELECT * FROM board_types WHERE code = $1';
  const result = await db.query(query, [code]);
  return result.rows[0] || null;
}

/**
 * Create a new board type
 * @param {Object} boardTypeData - Board type data
 * @returns {Promise<Object>} Created board type object
 */
async function createBoardType(boardTypeData) {
  const {
    code, nameEn, nameKo, nameZh, nameVi,
    descriptionEn, descriptionKo, descriptionZh, descriptionVi,
    type, settings, writeRoles, readRoles,
    category, order, status, createdBy
  } = boardTypeData;

  const id = uuidv4();

  const query = `
    INSERT INTO board_types (
      id, code,
      name_en, name_ko, name_zh, name_vi,
      description_en, description_ko, description_zh, description_vi,
      type, settings, write_roles, read_roles,
      category, "order", status,
      created_at, updated_at, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW(), $18)
    RETURNING *
  `;

  const params = [
    id, code,
    nameEn, nameKo, nameZh, nameVi,
    descriptionEn, descriptionKo, descriptionZh, descriptionVi,
    type || 'normal',
    JSON.stringify(settings || {}),
    JSON.stringify(writeRoles || ['admin', 'manager', 'user']),
    JSON.stringify(readRoles || ['admin', 'manager', 'user']),
    category, order || 0, status || 'active',
    createdBy
  ];

  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Update a board type
 * @param {string} boardTypeId - Board type ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated board type object
 */
async function updateBoardType(boardTypeId, updates) {
  const allowedFields = [
    'code', 'name_en', 'name_ko', 'name_zh', 'name_vi',
    'description_en', 'description_ko', 'description_zh', 'description_vi',
    'type', 'settings', 'write_roles', 'read_roles',
    'category', 'order', 'status', 'updated_by'
  ];

  const setClause = [];
  const params = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      // Handle JSON fields
      if (['settings', 'write_roles', 'read_roles'].includes(dbField)) {
        setClause.push(`${dbField} = $${paramIndex}`);
        params.push(JSON.stringify(value));
      } else {
        // Handle reserved keywords (like 'order') by wrapping in double quotes
        const fieldName = dbField === 'order' ? '"order"' : dbField;
        setClause.push(`${fieldName} = $${paramIndex}`);
        params.push(value);
      }
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  setClause.push(`updated_at = NOW()`);
  params.push(boardTypeId);

  const query = `UPDATE board_types SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await db.query(query, params);
  return result.rows[0] || null;
}

/**
 * Delete a board type
 * @param {string} boardTypeId - Board type ID
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteBoardType(boardTypeId) {
  // Check if there are posts associated with this board type
  const checkQuery = 'SELECT COUNT(*) FROM posts WHERE board_type_id = $1';
  const checkResult = await db.query(checkQuery, [boardTypeId]);
  const postCount = parseInt(checkResult.rows[0].count);

  if (postCount > 0) {
    throw new Error(`Cannot delete board type with ${postCount} existing posts`);
  }

  const query = 'DELETE FROM board_types WHERE id = $1';
  const result = await db.query(query, [boardTypeId]);
  return result.rowCount > 0;
}

/**
 * Get board type statistics
 * @param {string} boardTypeId - Board type ID
 * @returns {Promise<Object>} Statistics object
 */
async function getBoardTypeStats(boardTypeId) {
  const query = `
    SELECT
      bt.id,
      bt.code,
      bt.name_en,
      bt.name_ko,
      bt.total_posts,
      bt.total_views,
      COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'published') as published_posts,
      COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'draft') as draft_posts,
      COUNT(DISTINCT c.id) as total_comments,
      COUNT(DISTINCT pl.id) as total_likes,
      COUNT(DISTINCT a.id) as total_attachments
    FROM board_types bt
    LEFT JOIN posts p ON bt.id = p.board_type_id
    LEFT JOIN comments c ON p.id = c.post_id
    LEFT JOIN post_likes pl ON p.id = pl.post_id
    LEFT JOIN attachments a ON p.id = a.post_id
    WHERE bt.id = $1
    GROUP BY bt.id, bt.code, bt.name_en, bt.name_ko, bt.total_posts, bt.total_views
  `;

  const result = await db.query(query, [boardTypeId]);
  return result.rows[0] || null;
}

/**
 * Get total count of board types
 * @param {Object} filters - Filter options
 * @returns {Promise<number>} Total count
 */
async function getBoardTypeCount(filters = {}) {
  const { search, type, category, status } = filters;

  let query = 'SELECT COUNT(*) FROM board_types WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (code ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (type) {
    query += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (category) {
    query += ` AND category = $${paramIndex}`;
    params.push(category);
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

module.exports = {
  getAllBoardTypes,
  getBoardTypeById,
  getBoardTypeByCode,
  createBoardType,
  updateBoardType,
  deleteBoardType,
  getBoardTypeStats,
  getBoardTypeCount
};
