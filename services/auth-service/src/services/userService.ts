/**
 * User Service - Database Operations
 */

import { query } from '../utils/database';
import { User } from '../types';
import { getLogger } from '@enterprise/shared';

const logger = getLogger('auth-service:userService');

/**
 * Get user by username (loginid)
 */
export const getUserByUsername = async (username: string): Promise<User | null> => {
  const sql = `
    SELECT
      id, loginid, password, name_ko, name_en, email, role,
      department, position, phone_number, mobile_number, status,
      mfa_enabled, sso_enabled, last_login, created_at, updated_at,
      employee_number, avatar_url
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
      id, loginid, password, name_ko, name_en, email, role,
      department, position, phone_number, mobile_number, status,
      mfa_enabled, sso_enabled, last_login, created_at, updated_at,
      employee_number, avatar_url
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
      id, loginid, password, name_ko, name_en, email, role,
      department, position, phone_number, mobile_number, status,
      mfa_enabled, sso_enabled, last_login, created_at, updated_at,
      employee_number, avatar_url
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
  name_ko?: string;
  name_en?: string;
  email?: string;
  role?: string;
  department?: string;
  position?: string;
}): Promise<User> => {
  const sql = `
    INSERT INTO users (
      id, loginid, password, name_ko, name_en, email, role,
      department, position, status, mfa_enabled
    ) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, 'active', false)
    RETURNING *
  `;

  const result = await query(sql, [
    userData.loginid,
    userData.password,
    userData.name_ko || null,
    userData.name_en || null,
    userData.email || null,
    userData.role || 'user',
    userData.department || null,
    userData.position || null,
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

