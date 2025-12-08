/**
 * User Service - Database Operations
 */

import { query } from '../utils/database';
import { User, UserInfo } from '../types';
import { getLogger } from '@enterprise/shared';

const logger = getLogger('auth-service:userService');

/**
 * Get user by username (loginid)
 */
export const getUserByUsername = async (username: string): Promise<User | null> => {
  const sql = `
    SELECT
      id, loginid, password, name, email, role,
      department, position, phone, status,
      mfa_enabled, last_login, created_at, updated_at
    FROM users
    WHERE loginid = $1
  `;

  const result = await query(sql, [username]);
  return result.rows[0] || null;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  const sql = `
    SELECT
      id, loginid, password, name, email, role,
      department, position, phone, status,
      mfa_enabled, last_login, created_at, updated_at
    FROM users
    WHERE id = $1
  `;

  const result = await query(sql, [userId]);
  return result.rows[0] || null;
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const sql = `
    SELECT
      id, loginid, password, name, email, role,
      department, position, phone, status,
      mfa_enabled, last_login, created_at, updated_at
    FROM users
    WHERE email = $1
  `;

  const result = await query(sql, [email]);
  return result.rows[0] || null;
};

/**
 * Update last login time
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  const sql = `UPDATE users SET last_login = NOW() WHERE id = $1`;
  await query(sql, [userId]);
  logger.debug(`Updated last login for user ${userId}`);
};

/**
 * Create new user
 */
export const createUser = async (userData: {
  loginid: string;
  password: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
  position?: string;
  phone?: string;
}): Promise<User> => {
  const sql = `
    INSERT INTO users (
      loginid, password, name, email, role,
      department, position, phone, status, mfa_enabled
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', false)
    RETURNING *
  `;

  const result = await query(sql, [
    userData.loginid,
    userData.password,
    userData.name,
    userData.email,
    userData.role || 'user',
    userData.department || null,
    userData.position || null,
    userData.phone || null,
  ]);

  logger.info(`Created new user: ${userData.loginid}`);
  return result.rows[0];
};

/**
 * Check if username exists
 */
export const usernameExists = async (username: string): Promise<boolean> => {
  const sql = `SELECT 1 FROM users WHERE loginid = $1`;
  const result = await query(sql, [username]);
  return (result.rowCount ?? 0) > 0;
};

/**
 * Check if email exists
 */
export const emailExists = async (email: string): Promise<boolean> => {
  const sql = `SELECT 1 FROM users WHERE email = $1`;
  const result = await query(sql, [email]);
  return (result.rowCount ?? 0) > 0;
};

/**
 * Convert User to UserInfo (safe for client)
 */
export const toUserInfo = (user: User): UserInfo => {
  return {
    id: user.id,
    loginid: user.loginid,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    position: user.position,
  };
};

/**
 * Get user permissions (from role_program_mappings)
 */
export const getUserPermissions = async (userId: string): Promise<string[]> => {
  const sql = `
    SELECT DISTINCT pm.code as program_code
    FROM user_role_mappings urm
    JOIN role_program_mappings rpm ON urm.role_id = rpm.role_id
    JOIN programs pm ON rpm.program_id = pm.id
    WHERE urm.user_id = $1
      AND urm.is_active = true
      AND rpm.can_view = true
  `;

  const result = await query(sql, [userId]);
  return result.rows.map((row: { program_code: string }) => row.program_code);
};
