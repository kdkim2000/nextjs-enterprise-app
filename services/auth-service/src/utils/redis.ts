/**
 * Redis Connection for Session & Token Management
 */

import Redis from 'ioredis';
import { getLogger } from '@enterprise/shared';

const logger = getLogger('auth-service:redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error('Redis error:', err);
});

redis.on('reconnecting', () => {
  logger.warn('Redis reconnecting...');
});

// Token Blacklist Keys
const TOKEN_BLACKLIST_PREFIX = 'token:blacklist:';
const MFA_CODE_PREFIX = 'mfa:code:';
const SESSION_PREFIX = 'session:';

/**
 * Add token to blacklist
 */
export const addToBlacklist = async (token: string, expiresInSeconds: number): Promise<void> => {
  const key = `${TOKEN_BLACKLIST_PREFIX}${token}`;
  await redis.setex(key, expiresInSeconds, '1');
  logger.debug(`Token added to blacklist, expires in ${expiresInSeconds}s`);
};

/**
 * Check if token is blacklisted
 */
export const isBlacklisted = async (token: string): Promise<boolean> => {
  const key = `${TOKEN_BLACKLIST_PREFIX}${token}`;
  const result = await redis.exists(key);
  return result === 1;
};

/**
 * Store MFA code
 */
export const storeMFACode = async (
  userId: string,
  code: string,
  expiresInSeconds: number = 300
): Promise<void> => {
  const key = `${MFA_CODE_PREFIX}${userId}`;
  await redis.setex(key, expiresInSeconds, code);
  logger.debug(`MFA code stored for user ${userId}`);
};

/**
 * Verify and consume MFA code
 */
export const verifyMFACode = async (userId: string, code: string): Promise<boolean> => {
  const key = `${MFA_CODE_PREFIX}${userId}`;
  const storedCode = await redis.get(key);

  if (storedCode === code) {
    await redis.del(key); // Consume the code
    return true;
  }
  return false;
};

/**
 * Store user session
 */
export const storeSession = async (
  userId: string,
  sessionData: object,
  expiresInSeconds: number = 86400 // 24 hours
): Promise<void> => {
  const key = `${SESSION_PREFIX}${userId}`;
  await redis.setex(key, expiresInSeconds, JSON.stringify(sessionData));
};

/**
 * Get user session
 */
export const getSession = async (userId: string): Promise<object | null> => {
  const key = `${SESSION_PREFIX}${userId}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Delete user session
 */
export const deleteSession = async (userId: string): Promise<void> => {
  const key = `${SESSION_PREFIX}${userId}`;
  await redis.del(key);
};

/**
 * Store refresh token
 */
export const storeRefreshToken = async (
  userId: string,
  token: string,
  expiresInSeconds: number = 604800 // 7 days
): Promise<void> => {
  const key = `refresh:${userId}:${token.slice(-10)}`;
  await redis.setex(key, expiresInSeconds, token);
};

/**
 * Invalidate all refresh tokens for user
 */
export const invalidateUserTokens = async (userId: string): Promise<void> => {
  const pattern = `refresh:${userId}:*`;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
    logger.debug(`Invalidated ${keys.length} refresh tokens for user ${userId}`);
  }
};

export default redis;
