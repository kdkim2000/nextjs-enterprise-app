/**
 * Menu Service Layer
 *
 * Provides data access methods for menu-related operations.
 *
 * Performance Optimization:
 * - Uses Full-Text Search for general menu searches
 * - Optimized with proper indexes
 */

const db = require('../config/database');
const { buildMenuSearchCondition, cleanSearchTerm } = require('../utils/searchHelper');

/**
 * Get all menus
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of menu objects
 */
async function getAllMenus(options = {}) {
  const { search, level } = options;

  let query = 'SELECT * FROM menus WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    const cleanedSearch = cleanSearchTerm(search);
    const { condition, param } = buildMenuSearchCondition(cleanedSearch, paramIndex);

    if (condition) {
      query += ` AND ${condition}`;
      params.push(param);
      paramIndex++;
    }
  }

  if (level !== undefined) {
    query += ` AND level = $${paramIndex}`;
    params.push(level);
    paramIndex++;
  }

  query += ' ORDER BY level, "order", code';

  const result = await db.query(query, params);
  return result.rows;
}

/**
 * Get menu by ID
 * @param {string} menuId - Menu ID
 * @returns {Promise<Object|null>} Menu object or null
 */
async function getMenuById(menuId) {
  const query = 'SELECT * FROM menus WHERE id = $1';
  const result = await db.query(query, [menuId]);
  return result.rows[0] || null;
}

/**
 * Get menu by code
 * @param {string} code - Menu code
 * @returns {Promise<Object|null>} Menu object or null
 */
async function getMenuByCode(code) {
  const query = 'SELECT * FROM menus WHERE code = $1';
  const result = await db.query(query, [code]);
  return result.rows[0] || null;
}

/**
 * Get menu by path
 * @param {string} path - Menu path
 * @returns {Promise<Object|null>} Menu object or null
 */
async function getMenuByPath(path) {
  const query = 'SELECT * FROM menus WHERE path = $1';
  const result = await db.query(query, [path]);
  return result.rows[0] || null;
}

/**
 * Get child menus
 * @param {string} parentId - Parent menu ID
 * @returns {Promise<Array>} Array of child menu objects
 */
async function getChildMenus(parentId) {
  const query = 'SELECT * FROM menus WHERE parent_id = $1 ORDER BY "order", code';
  const result = await db.query(query, [parentId]);
  return result.rows;
}

/**
 * Create a new menu
 * @param {Object} menuData - Menu data
 * @returns {Promise<Object>} Created menu object
 */
async function createMenu(menuData) {
  const {
    id, code, nameEn, nameKo, nameZh, nameVi, path, icon,
    parentId, level, order, visible, programId
  } = menuData;

  const query = `
    INSERT INTO menus (
      id, code, name_en, name_ko, name_zh, name_vi, path, icon,
      parent_id, level, "order", visible, program_id, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
    RETURNING *
  `;

  const params = [id, code, nameEn, nameKo, nameZh, nameVi, path, icon, parentId, level, order, visible, programId];
  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Update a menu
 * @param {string} menuId - Menu ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated menu object
 */
async function updateMenu(menuId, updates) {
  const allowedFields = [
    'code', 'name_en', 'name_ko', 'name_zh', 'name_vi', 'path', 'icon',
    'parent_id', 'level', 'order', 'visible', 'program_id'
  ];

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
  params.push(menuId);

  const query = `UPDATE menus SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await db.query(query, params);
  return result.rows[0] || null;
}

/**
 * Delete a menu
 * @param {string} menuId - Menu ID
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteMenu(menuId) {
  const query = 'DELETE FROM menus WHERE id = $1';
  const result = await db.query(query, [menuId]);
  return result.rowCount > 0;
}

/**
 * Get user accessible menus based on role permissions
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of accessible menu objects
 */
async function getUserMenus(userId) {
  const query = `
    SELECT DISTINCT m.* FROM menus m
    INNER JOIN role_menu_mappings rmm ON m.id = rmm.menu_id
    INNER JOIN user_role_mappings urm ON rmm.role_id = urm.role_id
    WHERE urm.user_id = $1 AND m.visible = true
    ORDER BY m.level, m."order", m.code
  `;

  const result = await db.query(query, [userId]);
  return result.rows;
}

module.exports = {
  getAllMenus,
  getMenuById,
  getMenuByCode,
  getMenuByPath,
  getChildMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  getUserMenus,
};
