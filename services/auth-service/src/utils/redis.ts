/**
 * Redis Connection for Session & Token Management
 *
 * Redis가 없어도 기본 기능이 동작하도록 In-Memory 폴백 지원
 */

import Redis from 'ioredis';
import { getLogger } from '@enterprise/shared';

const logger = getLogger('auth-service:redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

// In-Memory 폴백 저장소 (개발/테스트용)
const memoryStore = new Map<string, { value: string; expiresAt: number }>();

// 만료된 항목 정리 (1분마다)
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of memoryStore.entries()) {
    if (data.expiresAt < now) {
      memoryStore.delete(key);
    }
  }
}, 60000);

let redis: Redis | null = null;
let redisConnected = false;

if (REDIS_ENABLED) {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Redis connection failed, using in-memory fallback');
        return null; // Stop retrying
      }
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true, // 지연 연결
  });

  redis.on('connect', () => {
    redisConnected = true;
    logger.info('Redis connected');
  });

  redis.on('error', (err) => {
    redisConnected = false;
    logger.warn('Redis error (using in-memory fallback):', err.message);
  });

  redis.on('close', () => {
    redisConnected = false;
    logger.warn('Redis disconnected, using in-memory fallback');
  });

  // 연결 시도 (실패해도 계속 진행)
  redis.connect().catch(() => {
    logger.warn('Redis initial connection failed, using in-memory fallback');
  });
} else {
  logger.info('Redis disabled, using in-memory storage');
}

// Token Blacklist Keys
const TOKEN_BLACKLIST_PREFIX = 'token:blacklist:';
const MFA_CODE_PREFIX = 'mfa:code:';
const SESSION_PREFIX = 'session:';

// Helper functions for memory/redis operations
const memorySet = (key: string, value: string, expiresInSeconds: number): void => {
  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  });
};

const memoryGet = (key: string): string | null => {
  const data = memoryStore.get(key);
  if (!data) return null;
  if (data.expiresAt < Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return data.value;
};

const memoryDel = (key: string): void => {
  memoryStore.delete(key);
};

const memoryExists = (key: string): boolean => {
  return memoryGet(key) !== null;
};

/**
 * Add token to blacklist
 */
export const addToBlacklist = async (token: string, expiresInSeconds: number): Promise<void> => {
  const key = `${TOKEN_BLACKLIST_PREFIX}${token}`;
  if (redisConnected && redis) {
    await redis.setex(key, expiresInSeconds, '1');
  } else {
    memorySet(key, '1', expiresInSeconds);
  }
  logger.debug(`Token added to blacklist, expires in ${expiresInSeconds}s`);
};

/**
 * Check if token is blacklisted
 */
export const isBlacklisted = async (token: string): Promise<boolean> => {
  const key = `${TOKEN_BLACKLIST_PREFIX}${token}`;
  if (redisConnected && redis) {
    const result = await redis.exists(key);
    return result === 1;
  }
  return memoryExists(key);
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
  if (redisConnected && redis) {
    await redis.setex(key, expiresInSeconds, code);
  } else {
    memorySet(key, code, expiresInSeconds);
  }
  logger.debug(`MFA code stored for user ${userId}`);
};

/**
 * Verify and consume MFA code
 */
export const verifyMFACode = async (userId: string, code: string): Promise<boolean> => {
  const key = `${MFA_CODE_PREFIX}${userId}`;
  let storedCode: string | null;

  if (redisConnected && redis) {
    storedCode = await redis.get(key);
    if (storedCode === code) {
      await redis.del(key);
      return true;
    }
  } else {
    storedCode = memoryGet(key);
    if (storedCode === code) {
      memoryDel(key);
      return true;
    }
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
  const value = JSON.stringify(sessionData);
  if (redisConnected && redis) {
    await redis.setex(key, expiresInSeconds, value);
  } else {
    memorySet(key, value, expiresInSeconds);
  }
};

/**
 * Get user session
 */
export const getSession = async (userId: string): Promise<object | null> => {
  const key = `${SESSION_PREFIX}${userId}`;
  let data: string | null;

  if (redisConnected && redis) {
    data = await redis.get(key);
  } else {
    data = memoryGet(key);
  }
  return data ? JSON.parse(data) : null;
};

/**
 * Delete user session
 */
export const deleteSession = async (userId: string): Promise<void> => {
  const key = `${SESSION_PREFIX}${userId}`;
  if (redisConnected && redis) {
    await redis.del(key);
  } else {
    memoryDel(key);
  }
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
  if (redisConnected && redis) {
    await redis.setex(key, expiresInSeconds, token);
  } else {
    memorySet(key, token, expiresInSeconds);
  }
};

/**
 * Invalidate all refresh tokens for user
 */
export const invalidateUserTokens = async (userId: string): Promise<void> => {
  const pattern = `refresh:${userId}:`;
  if (redisConnected && redis) {
    const keys = await redis.keys(`${pattern}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.debug(`Invalidated ${keys.length} refresh tokens for user ${userId}`);
    }
  } else {
    // In-memory: find and delete matching keys
    let count = 0;
    for (const key of memoryStore.keys()) {
      if (key.startsWith(pattern)) {
        memoryStore.delete(key);
        count++;
      }
    }
    if (count > 0) {
      logger.debug(`Invalidated ${count} refresh tokens for user ${userId}`);
    }
  }
};

/**
 * Check if Redis is connected
 */
export const isRedisConnected = (): boolean => redisConnected;

export default redis;
