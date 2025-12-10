/**
 * @enterprise/shared
 * 마이크로서비스 간 공유 라이브러리
 */

// Types
export * from './types';

// Config
export * from './config';

// Constants
export * from './constants';

// Utils (기존 jwt.ts 포함)
export * from './utils';

// Middleware (기존 auth.ts 포함)
export * from './middleware';

// Database (pg Pool based) - 새 모듈
// config/database.ts와 충돌 방지를 위해 명시적 export
export {
  query,
  queryOne,
  queryMany,
  getClient,
  getPool,
  withTransaction,
  closePool,
  resetPool,
  setServiceName,
  DatabaseConfig,
} from './database';

// Auth (JWT utilities) - 새 모듈
// utils/jwt.ts와 충돌 방지를 위해 명시적 export
export {
  generateAccessToken,
  verifyAccessToken,
  getTokenExpirationSeconds,
  generateTokenPair,
} from './auth';
