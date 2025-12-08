/**
 * PostgreSQL 데이터베이스 설정
 */

import pgPromise, { IDatabase, IMain } from 'pg-promise';
import { getLogger } from '../middleware/logger';

const logger = getLogger('Database');

// pg-promise 초기화 옵션
const initOptions = {
  // 쿼리 시작 시 로깅 (개발 환경)
  query(e: { query: string }) {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Query: ${e.query.substring(0, 200)}...`);
    }
  },
  // 에러 발생 시 로깅
  error(err: any, e: any) {
    logger.error('Database error:', {
      message: err.message,
      query: e?.query?.substring(0, 200),
    });
  },
  // 연결 성공 시
  connect(client: any) {
    logger.debug('Database connected');
  },
  // 연결 해제 시
  disconnect(client: any) {
    logger.debug('Database disconnected');
  },
};

// pg-promise 인스턴스
const pgp: IMain = pgPromise(initOptions);

// 데이터베이스 설정
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number; // 최대 연결 수
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

/**
 * 환경 변수에서 DB 설정 로드
 */
export function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'corenextdb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
  };
}

// 데이터베이스 인스턴스 캐시
let dbInstance: IDatabase<any> | null = null;

/**
 * 데이터베이스 연결 가져오기 (싱글톤)
 */
export function getDatabase(): IDatabase<any> {
  if (!dbInstance) {
    const config = getDatabaseConfig();
    dbInstance = pgp(config);
    logger.info(`Database configured: ${config.host}:${config.port}/${config.database}`);
  }
  return dbInstance;
}

/**
 * 데이터베이스 연결 테스트
 */
export async function testConnection(): Promise<boolean> {
  try {
    const db = getDatabase();
    await db.one('SELECT 1 AS result');
    logger.info('Database connection test successful');
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * 트랜잭션 헬퍼
 */
export async function transaction<T>(
  callback: (t: any) => Promise<T>
): Promise<T> {
  const db = getDatabase();
  return db.tx(callback);
}

/**
 * 배치 쿼리 헬퍼
 */
export async function batch<T>(
  queries: Array<{ query: string; values?: any[] }>
): Promise<T[]> {
  const db = getDatabase();
  return db.tx(t => {
    const promises = queries.map(q =>
      t.any(q.query, q.values)
    );
    return t.batch(promises);
  });
}

/**
 * 연결 종료
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await pgp.end();
    dbInstance = null;
    logger.info('Database connections closed');
  }
}

// pg-promise 인스턴스 export (커스텀 쿼리용)
export { pgp };

export default getDatabase;
