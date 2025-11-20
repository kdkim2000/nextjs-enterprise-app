/**
 * Role Service Layer
 *
 * Provides data access methods for role-related operations.
 */

const db = require('../config/database');

/**
 * Get all roles
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of role objects
 */
async function getAllRoles(options = {}) {
  const { search, isActive, roleType, limit, offset } = options;

  let query = 'SELECT * FROM roles WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (name ILIKE $${paramIndex} OR display_name ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (isActive !== undefined) {
    query += ` AND is_active = $${paramIndex}`;
    params.push(isActive);
    paramIndex++;
  }

  if (roleType) {
    query += ` AND role_type = $${paramIndex}`;
    params.push(roleType);
    paramIndex++;
  }

  query += ' ORDER BY name';

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
 * Get role by ID
 * @param {string} roleId - Role ID
 * @returns {Promise<Object|null>} Role object or null
 */
async function getRoleById(roleId) {
  const query = 'SELECT * FROM roles WHERE id = $1';
  const result = await db.query(query, [roleId]);
  return result.rows[0] || null;
}

/**
 * Get role by name
 * @param {string} name - Role name
 * @returns {Promise<Object|null>} Role object or null
 */
async function getRoleByName(name) {
  const query = 'SELECT * FROM roles WHERE name = $1';
  const result = await db.query(query, [name]);
  return result.rows[0] || null;
}

/**
 * Create a new role
 * @param {Object} roleData - Role data
 * @returns {Promise<Object>} Created role object
 */
async function createRole(roleData) {
  const {
    id,
    name,
    display_name,
    description,
    role_type,
    manager,
    representative,
    is_system,
    is_active,
    created_by
  } = roleData;

  const query = `
    INSERT INTO roles (
      id, name, display_name, description, role_type, manager, representative,
      is_system, is_active, created_at, updated_at, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), $10)
    RETURNING *
  `;

  const params = [
    id,
    name,
    display_name,
    description,
    role_type,
    manager,
    representative,
    is_system !== undefined ? is_system : false,
    is_active !== undefined ? is_active : true,
    created_by
  ];

  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Update a role
 * @param {string} roleId - Role ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated role object
 */
async function updateRole(roleId, updates) {
  const allowedFields = [
    'name',
    'display_name',
    'description',
    'role_type',
    'manager',
    'representative',
    'is_system',
    'is_active',
    'updated_by'
  ];

  const setClause = [];
  const params = [];
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

  setClause.push(`updated_at = NOW()`);
  params.push(roleId);

  const query = `UPDATE roles SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await db.query(query, params);
  return result.rows[0] || null;
}

/**
 * Delete a role
 * @param {string} roleId - Role ID
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteRole(roleId) {
  const query = 'DELETE FROM roles WHERE id = $1';
  const result = await db.query(query, [roleId]);
  return result.rowCount > 0;
}

/**
 * Count users with a specific role
 * @param {string} roleName - Role name
 * @returns {Promise<number>} Number of users
 */
async function countUsersByRole(roleName) {
  const query = 'SELECT COUNT(*) FROM users WHERE role = $1';
  const result = await db.query(query, [roleName]);
  return parseInt(result.rows[0].count);
}

module.exports = {
  getAllRoles,
  getRoleById,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
  countUsersByRole,
};
