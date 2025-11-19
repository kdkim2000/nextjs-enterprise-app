/**
 * User Service Layer
 *
 * Provides data access methods for user-related operations.
 * All database queries for the users table are centralized here.
 */

const db = require('../config/database');

/**
 * Get all users with optional filtering and pagination
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of records to return
 * @param {number} options.offset - Number of records to skip
 * @param {string} options.search - Search term for username, email, name
 * @param {string} options.status - Filter by status (active, inactive, locked)
 * @param {string} options.department - Filter by department
 * @param {string} options.role - Filter by role
 * @returns {Promise<Array>} Array of user objects
 */
async function getAllUsers(options = {}) {
  const {
    limit,
    offset,
    search,
    status,
    department,
    role,
  } = options;

  let query = 'SELECT * FROM users WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  // Search filter
  if (search) {
    query += ` AND (username ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR name ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Status filter
  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  // Department filter
  if (department) {
    query += ` AND department = $${paramIndex}`;
    params.push(department);
    paramIndex++;
  }

  // Order by created_at descending
  query += ' ORDER BY created_at DESC';

  // Pagination
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
 * Get total count of users (for pagination)
 * @param {Object} filters - Filter options
 * @returns {Promise<number>} Total count
 */
async function getUserCount(filters = {}) {
  const { search, status, department } = filters;

  let query = 'SELECT COUNT(*) FROM users WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (username ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR name ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (department) {
    query += ` AND department = $${paramIndex}`;
    params.push(department);
    paramIndex++;
  }

  const result = await db.query(query, params);
  return parseInt(result.rows[0].count, 10);
}

/**
 * Get a user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function getUserById(userId) {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await db.query(query, [userId]);
  return result.rows[0] || null;
}

/**
 * Get a user by username
 * @param {string} username - Username
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function getUserByUsername(username) {
  const query = 'SELECT * FROM users WHERE username = $1';
  const result = await db.query(query, [username]);
  return result.rows[0] || null;
}

/**
 * Get a user by email
 * @param {string} email - Email address
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function getUserByEmail(email) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await db.query(query, [email]);
  return result.rows[0] || null;
}

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user object
 */
async function createUser(userData) {
  const {
    id,
    username,
    email,
    password,
    name,
    firstName,
    lastName,
    department,
    status = 'active',
    mfaEnabled = false,
    profileImage,
    phone,
  } = userData;

  // If name is not provided but firstName/lastName are, combine them
  const fullName = name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || '');

  const query = `
    INSERT INTO users (
      id, username, email, password, name,
      department, status, mfa_enabled, avatar_url,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    RETURNING *
  `;

  const params = [
    id,
    username,
    email,
    password,
    fullName,
    department,
    status,
    mfaEnabled,
    profileImage,
  ];

  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Update a user
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated user object or null if not found
 */
async function updateUser(userId, updates) {
  const allowedFields = [
    'username',
    'email',
    'password',
    'name',
    'department',
    'status',
    'role',
    'mfa_enabled',
    'sso_enabled',
    'avatar_url',
    'last_login',
  ];

  const setClause = [];
  const params = [];
  let paramIndex = 1;

  // Handle firstName/lastName to name conversion
  const processedUpdates = { ...updates };
  if (updates.firstName || updates.lastName) {
    processedUpdates.name = updates.name ||
      (updates.firstName && updates.lastName ? `${updates.firstName} ${updates.lastName}` :
       updates.firstName || updates.lastName);
    delete processedUpdates.firstName;
    delete processedUpdates.lastName;
  }

  // Build SET clause dynamically
  for (const [key, value] of Object.entries(processedUpdates)) {
    // Convert camelCase to snake_case
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

  // Add userId as last parameter
  params.push(userId);

  const query = `
    UPDATE users
    SET ${setClause.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await db.query(query, params);
  return result.rows[0] || null;
}

/**
 * Delete a user (soft delete by setting status to inactive)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteUser(userId) {
  const query = `
    UPDATE users
    SET status = 'inactive'
    WHERE id = $1
    RETURNING id
  `;

  const result = await db.query(query, [userId]);
  return result.rowCount > 0;
}

/**
 * Hard delete a user (permanent deletion)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function hardDeleteUser(userId) {
  const query = 'DELETE FROM users WHERE id = $1';
  const result = await db.query(query, [userId]);
  return result.rowCount > 0;
}

/**
 * Update user's last login time
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function updateLastLogin(userId) {
  const query = `
    UPDATE users
    SET last_login = NOW()
    WHERE id = $1
  `;

  await db.query(query, [userId]);
}

/**
 * Increment failed login attempts
 * @param {string} userId - User ID
 * @returns {Promise<number>} New failed attempts count
 */
async function incrementFailedAttempts(userId) {
  const query = `
    UPDATE users
    SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1
    WHERE id = $1
    RETURNING failed_login_attempts
  `;

  const result = await db.query(query, [userId]);
  return result.rows[0]?.failed_login_attempts || 0;
}

/**
 * Reset failed login attempts
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function resetFailedAttempts(userId) {
  const query = `
    UPDATE users
    SET failed_login_attempts = 0
    WHERE id = $1
  `;

  await db.query(query, [userId]);
}

/**
 * Lock a user account
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function lockUser(userId) {
  const query = `
    UPDATE users
    SET status = 'locked'
    WHERE id = $1
  `;

  await db.query(query, [userId]);
}

/**
 * Check if username exists
 * @param {string} username - Username to check
 * @param {string} excludeUserId - User ID to exclude from check (for updates)
 * @returns {Promise<boolean>} True if username exists
 */
async function usernameExists(username, excludeUserId = null) {
  let query = 'SELECT COUNT(*) FROM users WHERE username = $1';
  const params = [username];

  if (excludeUserId) {
    query += ' AND id != $2';
    params.push(excludeUserId);
  }

  const result = await db.query(query, params);
  return parseInt(result.rows[0].count, 10) > 0;
}

/**
 * Check if email exists
 * @param {string} email - Email to check
 * @param {string} excludeUserId - User ID to exclude from check (for updates)
 * @returns {Promise<boolean>} True if email exists
 */
async function emailExists(email, excludeUserId = null) {
  let query = 'SELECT COUNT(*) FROM users WHERE email = $1';
  const params = [email];

  if (excludeUserId) {
    query += ' AND id != $2';
    params.push(excludeUserId);
  }

  const result = await db.query(query, params);
  return parseInt(result.rows[0].count, 10) > 0;
}

/**
 * Get multiple users by their IDs
 * @param {Array<string>} userIds - Array of user IDs
 * @returns {Promise<Array>} Array of user objects
 */
async function getUsersByIds(userIds) {
  if (!userIds || userIds.length === 0) {
    return [];
  }

  const placeholders = userIds.map((_, index) => `$${index + 1}`).join(', ');
  const query = `SELECT * FROM users WHERE id IN (${placeholders})`;

  const result = await db.query(query, userIds);
  return result.rows;
}

module.exports = {
  getAllUsers,
  getUserCount,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  getUsersByIds,
  createUser,
  updateUser,
  deleteUser,
  hardDeleteUser,
  updateLastLogin,
  incrementFailedAttempts,
  resetFailedAttempts,
  lockUser,
  usernameExists,
  emailExists,
};
