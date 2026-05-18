/**
 * PostgreSQL Database Module (pg Pool based)
 * 각 마이크로서비스에서 사용하는 간단한 Pool 기반 DB 모듈
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { getLogger } from '../middleware/logger';

// 서비스별 로거 설정을 위한 변수
let serviceName = 'shared';

/**
 * 서비스 이름 설정 (로거용)
 */
export function setServiceName(name: string): void {
  serviceName = name;
}

/**
 * 데이터베이스 설정 인터페이스
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

/**
 * 환경 변수에서 DB 설정 로드
 */
export function getDatabaseConfig(options?: Partial<DatabaseConfig>): DatabaseConfig {
  return {
    host: options?.host || process.env.DB_HOST || 'localhost',
    port: options?.port || parseInt(process.env.DB_PORT || '5432', 10),
    database: options?.database || process.env.DB_NAME || 'corenextdb',
    user: options?.user || process.env.DB_USER || 'corenext',
    password: options?.password || process.env.DB_PASSWORD || '',
    ssl: options?.ssl !== undefined
      ? options.ssl
      : process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
    max: options?.max || parseInt(process.env.DB_POOL_MAX || '5', 10),
    idleTimeoutMillis: options?.idleTimeoutMillis || parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: options?.connectionTimeoutMillis || parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),
  };
}

// Pool 인스턴스 캐시
let poolInstance: Pool | null = null;

/**
 * Pool 인스턴스 가져오기 (싱글톤)
 */
export function getPool(options?: Partial<DatabaseConfig>): Pool {
  if (!poolInstance) {
    const config = getDatabaseConfig(options);
    const logger = getLogger(`${serviceName}:db`);

    logger.info('Creating database pool', {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      max: config.max,
    });

    poolInstance = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl,
      max: config.max,
      idleTimeoutMillis: config.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionTimeoutMillis,
    });

    poolInstance.on('connect', () => {
      logger.debug('Database client connected');
    });

    poolInstance.on('error', (err) => {
      logger.error('Database pool error:', err);
    });

    poolInstance.on('remove', () => {
      logger.debug('Database client removed from pool');
    });
  }

  return poolInstance;
}

/**
 * 쿼리 실행 (기본 query 함수)
 */
export async function query(
  text: string,
  params?: any[]
): Promise<QueryResult> {
  const logger = getLogger(`${serviceName}:db`);
  const start = Date.now();

  try {
    const pool = getPool();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // 느린 쿼리 경고 (100ms 이상)
    if (duration > 100) {
      logger.warn(`Slow query (${duration}ms):`, {
        query: text.substring(0, 200),
        params: params?.slice(0, 5),
      });
    } else {
      logger.debug(`Query executed (${duration}ms)`, {
        rows: result.rowCount,
      });
    }

    return result;
  } catch (error) {
    logger.error('Query error:', {
      query: text.substring(0, 200),
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
}

/**
 * 단일 행 조회
 */
export async function queryOne(
  text: string,
  params?: any[]
): Promise<any | null> {
  const result = await query(text, params);
  return result.rows[0] || null;
}

/**
 * 여러 행 조회
 */
export async function queryMany(
  text: string,
  params?: any[]
): Promise<any[]> {
  const result = await query(text, params);
  return result.rows;
}

/**
 * Pool에서 Client 가져오기 (트랜잭션용)
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return pool.connect();
}

/**
 * 트랜잭션 헬퍼
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  const logger = getLogger(`${serviceName}:db`);

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    logger.debug('Transaction committed');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 데이터베이스 연결 테스트
 */
export async function testConnection(): Promise<boolean> {
  const logger = getLogger(`${serviceName}:db`);

  try {
    const pool = getPool();
    await pool.query('SELECT 1 AS result');
    logger.info('Database connection test successful');
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Pool 종료
 */
export async function closePool(): Promise<void> {
  const logger = getLogger(`${serviceName}:db`);

  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
    logger.info('Database pool closed');
  }
}

/**
 * Pool 인스턴스 리셋 (테스트용)
 */
export function resetPool(): void {
  poolInstance = null;
}

// 기본 export
export default {
  query,
  queryOne,
  queryMany,
  getClient,
  getPool,
  withTransaction,
  testConnection,
  closePool,
  setServiceName,
  getDatabaseConfig,
};
