/**
 * Authentication Service Layer
 *
 * Handles authentication-related database operations including
 * token blacklist and MFA codes management.
 */

const db = require('../config/database');

/**
 * Token Blacklist Operations
 */

/**
 * Add a token to the blacklist
 * @param {string} token - JWT token to blacklist
 * @param {string} userId - User ID who owns the token
 * @param {Date} expiresAt - Token expiration date
 * @returns {Promise<Object>} Created blacklist entry
 */
async function addToBlacklist(token, userId, expiresAt) {
  const query = `
    INSERT INTO token_blacklist (token, user_id, expires_at, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING *
  `;

  const result = await db.query(query, [token, userId, expiresAt]);
  return result.rows[0];
}

/**
 * Check if a token is blacklisted
 * @param {string} token - JWT token to check
 * @returns {Promise<boolean>} True if token is blacklisted
 */
async function isTokenBlacklisted(token) {
  const query = `
    SELECT COUNT(*) FROM token_blacklist
    WHERE token = $1 AND expires_at > NOW()
  `;

  const result = await db.query(query, [token]);
  return parseInt(result.rows[0].count, 10) > 0;
}

/**
 * Clean up expired tokens from blacklist
 * @returns {Promise<number>} Number of tokens removed
 */
async function cleanupExpiredTokens() {
  const query = `
    DELETE FROM token_blacklist
    WHERE expires_at <= NOW()
  `;

  const result = await db.query(query);
  return result.rowCount;
}

/**
 * Get all blacklisted tokens for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of blacklisted tokens
 */
async function getUserBlacklistedTokens(userId) {
  const query = `
    SELECT * FROM token_blacklist
    WHERE user_id = $1 AND expires_at > NOW()
    ORDER BY created_at DESC
  `;

  const result = await db.query(query, [userId]);
  return result.rows;
}

/**
 * Blacklist all tokens for a user (useful for logout all sessions)
 * @param {string} userId - User ID
 * @param {Array<string>} tokens - Array of tokens to blacklist
 * @param {Date} expiresAt - Expiration date for all tokens
 * @returns {Promise<number>} Number of tokens blacklisted
 */
async function blacklistUserTokens(userId, tokens, expiresAt) {
  if (tokens.length === 0) return 0;

  const values = tokens.map((token, index) => {
    const base = index * 3;
    return `($${base + 1}, $${base + 2}, $${base + 3}, NOW())`;
  }).join(', ');

  const params = tokens.flatMap(token => [token, userId, expiresAt]);

  const query = `
    INSERT INTO token_blacklist (token, user_id, expires_at, created_at)
    VALUES ${values}
    ON CONFLICT (token) DO NOTHING
  `;

  const result = await db.query(query, params);
  return result.rowCount;
}

/**
 * MFA Codes Operations
 */

/**
 * Store a new MFA code
 * @param {string} userId - User ID
 * @param {string} code - MFA verification code
 * @param {Date} expiresAt - Code expiration date
 * @returns {Promise<Object>} Created MFA code entry
 */
async function createMFACode(userId, code, expiresAt) {
  const query = `
    INSERT INTO mfa_codes (user_id, code, expires_at, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING *
  `;

  const result = await db.query(query, [userId, code, expiresAt]);
  return result.rows[0];
}

/**
 * Verify an MFA code
 * @param {string} userId - User ID
 * @param {string} code - MFA code to verify
 * @returns {Promise<Object|null>} MFA code entry if valid, null otherwise
 */
async function verifyMFACode(userId, code) {
  const query = `
    SELECT * FROM mfa_codes
    WHERE user_id = $1 AND code = $2 AND expires_at > NOW() AND used = false
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const result = await db.query(query, [userId, code]);
  return result.rows[0] || null;
}

/**
 * Mark an MFA code as used
 * @param {string} codeId - MFA code ID
 * @returns {Promise<void>}
 */
async function markMFACodeAsUsed(codeId) {
  const query = `
    UPDATE mfa_codes
    SET used = true
    WHERE id = $1
  `;

  await db.query(query, [codeId]);
}

/**
 * Delete all MFA codes for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of codes deleted
 */
async function deleteMFACodesForUser(userId) {
  const query = `
    DELETE FROM mfa_codes
    WHERE user_id = $1
  `;

  const result = await db.query(query, [userId]);
  return result.rowCount;
}

/**
 * Clean up expired MFA codes
 * @returns {Promise<number>} Number of codes removed
 */
async function cleanupExpiredMFACodes() {
  const query = `
    DELETE FROM mfa_codes
    WHERE expires_at <= NOW()
  `;

  const result = await db.query(query);
  return result.rowCount;
}

/**
 * Get recent MFA codes for a user (for rate limiting)
 * @param {string} userId - User ID
 * @param {number} minutes - Number of minutes to look back
 * @returns {Promise<Array>} Array of recent MFA codes
 */
async function getRecentMFACodes(userId, minutes = 5) {
  const query = `
    SELECT * FROM mfa_codes
    WHERE user_id = $1 AND created_at > NOW() - INTERVAL '${minutes} minutes'
    ORDER BY created_at DESC
  `;

  const result = await db.query(query, [userId]);
  return result.rows;
}

/**
 * Get failed MFA attempts count
 * @param {string} userId - User ID
 * @param {number} minutes - Number of minutes to look back
 * @returns {Promise<number>} Number of failed attempts
 */
async function getFailedMFAAttempts(userId, minutes = 15) {
  // This would require tracking failed attempts separately
  // For now, we can count all unused codes that have expired
  const query = `
    SELECT COUNT(*) FROM mfa_codes
    WHERE user_id = $1
    AND used = false
    AND expires_at <= NOW()
    AND created_at > NOW() - INTERVAL '${minutes} minutes'
  `;

  const result = await db.query(query, [userId]);
  return parseInt(result.rows[0].count, 10);
}

module.exports = {
  // Token Blacklist
  addToBlacklist,
  isTokenBlacklisted,
  cleanupExpiredTokens,
  getUserBlacklistedTokens,
  blacklistUserTokens,

  // MFA Codes
  createMFACode,
  verifyMFACode,
  markMFACodeAsUsed,
  deleteMFACodesForUser,
  cleanupExpiredMFACodes,
  getRecentMFACodes,
  getFailedMFAAttempts,
};
