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
 * @param {string} options.search - Search term for loginid, email, name_ko, name_en, employee_number
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

  // Search filter - updated to search new fields
  if (search) {
    query += ` AND (loginid ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR employee_number ILIKE $${paramIndex})`;
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
    query += ` AND (loginid ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR employee_number ILIKE $${paramIndex})`;
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
 * Get a user by loginid
 * @param {string} loginid - Login ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function getUserByLoginId(loginid) {
  const query = 'SELECT * FROM users WHERE loginid = $1';
  const result = await db.query(query, [loginid]);
  return result.rows[0] || null;
}

/**
 * Get a user by username (backward compatibility)
 * @param {string} username - Username (treated as loginid)
 * @returns {Promise<Object|null>} User object or null if not found
 * @deprecated Use getUserByLoginId instead
 */
async function getUserByUsername(username) {
  return getUserByLoginId(username);
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
    loginid,
    username, // backward compatibility
    email,
    password,
    name_ko,
    name_en,
    name, // backward compatibility
    firstName,
    lastName,
    employee_number,
    system_key,
    phone_number,
    mobile_number,
    user_category = 'regular',
    department,
    status = 'active',
    mfaEnabled = false,
    profileImage,
    phone,
  } = userData;

  // Backward compatibility: use username if loginid not provided
  const finalLoginId = loginid || username;

  // Backward compatibility: if name_ko is not provided, use name
  const finalNameKo = name_ko || name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || '');

  // Generate system_key if not provided
  const finalSystemKey = system_key || `USR-${id}`;

  // Use phone as fallback for phone_number if provided
  const finalPhoneNumber = phone_number || phone;

  const query = `
    INSERT INTO users (
      id, loginid, email, password, name_ko, name_en,
      employee_number, system_key, phone_number, mobile_number,
      user_category, department, status, mfa_enabled, avatar_url,
      last_password_changed, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    id,
    finalLoginId,
    email,
    password,
    finalNameKo,
    name_en,
    employee_number,
    finalSystemKey,
    finalPhoneNumber,
    mobile_number,
    user_category,
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
    'loginid',
    'username', // backward compatibility, will be mapped to loginid
    'email',
    'password',
    'name_ko',
    'name_en',
    'name', // backward compatibility, will be mapped to name_ko
    'employee_number',
    'system_key',
    'phone_number',
    'mobile_number',
    'user_category',
    'department',
    'status',
    'role',
    'mfa_enabled',
    'sso_enabled',
    'avatar_url',
    'last_login',
    'last_password_changed',
  ];

  const setClause = [];
  const params = [];
  let paramIndex = 1;

  // Handle backward compatibility and field conversions
  const processedUpdates = { ...updates };

  // username -> loginid
  if (updates.username && !updates.loginid) {
    processedUpdates.loginid = updates.username;
    delete processedUpdates.username;
  }

  // name -> name_ko
  if (updates.name && !updates.name_ko) {
    processedUpdates.name_ko = updates.name;
    delete processedUpdates.name;
  }

  // firstName/lastName to name_ko
  if (updates.firstName || updates.lastName) {
    processedUpdates.name_ko = updates.name_ko ||
      (updates.firstName && updates.lastName ? `${updates.firstName} ${updates.lastName}` :
       updates.firstName || updates.lastName);
    delete processedUpdates.firstName;
    delete processedUpdates.lastName;
  }

  // Update last_password_changed when password is changed
  if (updates.password) {
    processedUpdates.last_password_changed = new Date().toISOString();
  }

  // Build SET clause dynamically
  for (const [key, value] of Object.entries(processedUpdates)) {
    // Convert camelCase to snake_case
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();

    if (allowedFields.includes(key) || allowedFields.includes(dbField)) {
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
 * Check if loginid exists
 * @param {string} loginid - Login ID to check
 * @param {string} excludeUserId - User ID to exclude from check (for updates)
 * @returns {Promise<boolean>} True if loginid exists
 */
async function loginidExists(loginid, excludeUserId = null) {
  let query = 'SELECT COUNT(*) FROM users WHERE loginid = $1';
  const params = [loginid];

  if (excludeUserId) {
    query += ' AND id != $2';
    params.push(excludeUserId);
  }

  const result = await db.query(query, params);
  return parseInt(result.rows[0].count, 10) > 0;
}

/**
 * Check if username exists (backward compatibility)
 * @param {string} username - Username to check
 * @param {string} excludeUserId - User ID to exclude from check (for updates)
 * @returns {Promise<boolean>} True if username exists
 * @deprecated Use loginidExists instead
 */
async function usernameExists(username, excludeUserId = null) {
  return loginidExists(username, excludeUserId);
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
  getUserByLoginId,
  getUserByUsername, // backward compatibility
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
  loginidExists,
  usernameExists, // backward compatibility
  emailExists,
};
