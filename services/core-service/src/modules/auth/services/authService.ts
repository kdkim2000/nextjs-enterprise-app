/**
 * Auth Service - Core Service
 * Authentication Logic
 */

import { v4 as uuidv4 } from 'uuid';
import { getLogger } from '@enterprise/shared';
import { query } from '../../../utils/database';
import {
  addToBlacklist,
  isBlacklisted,
  storeMFACode,
  verifyMFACode as verifyMFACodeRedis,
  storeRefreshToken,
} from '../../../utils/redis';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getTokenExpirationSeconds,
} from '../../../utils/jwt';
import { comparePassword, generateMFACode, hashPassword } from '../../../utils/password';
import {
  getUserByUsername,
  getUserById,
  updateLastLogin,
  createUser,
  usernameExists,
  emailExists,
} from './userService';
import { LoginResponse, User, UserInfo, TokenPayload } from '../types';

const logger = getLogger('core-service:auth');

// MFA expiration in seconds (5 minutes)
const MFA_EXPIRY_SECONDS = 300;

/**
 * Helper: Convert User to UserInfo (safe for client)
 */
const toUserInfo = (user: User): UserInfo => ({
  id: user.id,
  loginid: user.loginid,
  name: user.name_ko || user.name_en || user.loginid,
  email: user.email,
  role: user.role,
  department: user.department,
  position: user.position,
});

/**
 * Login user
 */
export const login = async (
  username: string,
  password: string
): Promise<LoginResponse & { requireMFA?: boolean; mfaToken?: string }> => {
  // Find user
  const user = await getUserByUsername(username);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check account status
  if (user.status !== 'active') {
    throw new Error('Account is inactive');
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Check if MFA is enabled
  if (user.mfa_enabled) {
    // Generate and store MFA code
    const mfaCode = generateMFACode();
    const mfaToken = uuidv4();

    await storeMFACode(user.id, mfaCode, MFA_EXPIRY_SECONDS);

    // Store MFA token to user mapping
    await query(
      `INSERT INTO mfa_codes (id, user_id, code, expires_at, used)
       VALUES ($1, $2, $3, NOW() + INTERVAL '5 minutes', false)`,
      [mfaToken, user.id, mfaCode]
    );

    // TODO: Send MFA code via email
    logger.info(`MFA code generated for user ${username}: ${mfaCode} (DEV ONLY)`);

    return {
      requireMFA: true,
      mfaToken,
      accessToken: '',
      refreshToken: '',
      user: toUserInfo(user),
    };
  }

  // Generate tokens
  return await generateTokensForUser(user);
};

/**
 * Verify MFA code and complete login
 */
export const verifyMFA = async (
  mfaToken: string,
  code: string
): Promise<LoginResponse> => {
  // Find MFA record
  const result = await query(
    `SELECT user_id, code, expires_at, used
     FROM mfa_codes
     WHERE id = $1`,
    [mfaToken]
  );

  const mfaRecord = result.rows[0];

  if (!mfaRecord) {
    throw new Error('Invalid MFA token');
  }

  if (mfaRecord.used) {
    throw new Error('MFA code already used');
  }

  if (new Date(mfaRecord.expires_at) < new Date()) {
    throw new Error('MFA code expired');
  }

  // Verify code (check Redis first, then DB)
  const isValidRedis = await verifyMFACodeRedis(mfaRecord.user_id, code);
  const isValidDB = mfaRecord.code === code;

  if (!isValidRedis && !isValidDB) {
    throw new Error('Invalid MFA code');
  }

  // Mark as used
  await query(
    `UPDATE mfa_codes SET used = true WHERE id = $1`,
    [mfaToken]
  );

  // Get user and generate tokens
  const user = await getUserById(mfaRecord.user_id);
  if (!user) {
    throw new Error('User not found');
  }

  return await generateTokensForUser(user);
};

/**
 * Resend MFA code
 */
export const resendMFA = async (mfaToken: string): Promise<{ devCode?: string }> => {
  // Find existing MFA record
  const result = await query(
    `SELECT user_id FROM mfa_codes WHERE id = $1 AND used = false`,
    [mfaToken]
  );

  const mfaRecord = result.rows[0];
  if (!mfaRecord) {
    throw new Error('Invalid MFA token');
  }

  // Generate new code
  const newCode = generateMFACode();
  const newMfaToken = uuidv4();

  // Invalidate old token
  await query(`UPDATE mfa_codes SET used = true WHERE id = $1`, [mfaToken]);

  // Create new MFA record
  await query(
    `INSERT INTO mfa_codes (id, user_id, code, expires_at, used)
     VALUES ($1, $2, $3, NOW() + INTERVAL '5 minutes', false)`,
    [newMfaToken, mfaRecord.user_id, newCode]
  );

  // Store in Redis
  await storeMFACode(mfaRecord.user_id, newCode, MFA_EXPIRY_SECONDS);

  // TODO: Send via email
  logger.info(`New MFA code generated: ${newCode} (DEV ONLY)`);

  return {
    devCode: process.env.NODE_ENV === 'development' ? newCode : undefined,
  };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  // Check if token is blacklisted
  const blacklisted = await isBlacklisted(refreshToken);
  if (blacklisted) {
    throw new Error('Token has been revoked');
  }

  // Verify refresh token
  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }

  // Get user
  const user = await getUserById(payload.userId);
  if (!user || user.status !== 'active') {
    throw new Error('User not found or inactive');
  }

  // Blacklist old refresh token
  const expiresIn = getTokenExpirationSeconds(refreshToken);
  if (expiresIn > 0) {
    await addToBlacklist(refreshToken, expiresIn);
  }

  // Generate new tokens
  const tokenPayload = {
    userId: user.id,
    loginid: user.loginid,
    role: user.role || 'user',
  };

  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  // Store new refresh token
  await storeRefreshToken(user.id, newRefreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Logout user
 */
export const logout = async (accessToken: string, refreshToken?: string): Promise<void> => {
  // Blacklist access token
  const accessExpiresIn = getTokenExpirationSeconds(accessToken);
  if (accessExpiresIn > 0) {
    await addToBlacklist(accessToken, accessExpiresIn);
  }

  // Blacklist refresh token if provided
  if (refreshToken) {
    const refreshExpiresIn = getTokenExpirationSeconds(refreshToken);
    if (refreshExpiresIn > 0) {
      await addToBlacklist(refreshToken, refreshExpiresIn);
    }
  }

  // Also store in database for persistence
  try {
    const decoded = verifyAccessToken(accessToken);
    await query(
      `INSERT INTO token_blacklist (token, user_id, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')
       ON CONFLICT (token) DO NOTHING`,
      [accessToken, decoded.userId]
    );
  } catch {
    // Token might be invalid, but we still blacklist it
  }

  logger.debug('User logged out, tokens blacklisted');
};

/**
 * Register new user
 */
export const register = async (userData: {
  username: string;
  password: string;
  name_ko?: string;
  name_en?: string;
  email?: string;
  department?: string;
  position?: string;
}): Promise<{ user: UserInfo }> => {
  // Check if username exists
  if (await usernameExists(userData.username)) {
    throw new Error('Username already exists');
  }

  // Check if email exists
  if (userData.email && await emailExists(userData.email)) {
    throw new Error('Email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user
  const user = await createUser({
    loginid: userData.username,
    password: hashedPassword,
    name_ko: userData.name_ko,
    name_en: userData.name_en,
    email: userData.email,
    department: userData.department,
    position: userData.position,
  });

  logger.info(`New user registered: ${userData.username}`);

  return {
    user: toUserInfo(user),
  };
};

/**
 * Validate token
 */
export const validateToken = async (token: string): Promise<UserInfo | null> => {
  // Check blacklist
  const blacklisted = await isBlacklisted(token);
  if (blacklisted) {
    return null;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await getUserById(payload.userId);

    if (!user || user.status !== 'active') {
      return null;
    }

    return {
      id: user.id,
      loginid: user.loginid,
      name: user.name_ko || user.name_en || user.loginid,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
    };
  } catch {
    return null;
  }
};

/**
 * Get current user info
 */
export const getCurrentUser = async (userId: string): Promise<UserInfo | null> => {
  const user = await getUserById(userId);
  if (!user) return null;

  return {
    id: user.id,
    loginid: user.loginid,
    name: user.name_ko || user.name_en || user.loginid,
    email: user.email,
    role: user.role,
    department: user.department,
    position: user.position,
  };
};

/**
 * Helper: Generate tokens for user
 */
async function generateTokensForUser(user: User): Promise<LoginResponse> {
  const tokenPayload = {
    userId: user.id,
    loginid: user.loginid,
    role: user.role || 'user',
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Update last login
  await updateLastLogin(user.id);

  // Store refresh token in Redis
  await storeRefreshToken(user.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      loginid: user.loginid,
      name: user.name_ko || user.name_en || user.loginid,
      name_ko: user.name_ko,
      name_en: user.name_en,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      avatarUrl: user.avatar_url,
      employee_number: user.employee_number,
      phone_number: user.phone_number,
      mobile_number: user.mobile_number,
    },
  };
}
