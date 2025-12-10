/**
 * Database Connection for Communication Service
 */

import { Pool, PoolClient } from 'pg';
import { getLogger } from '@enterprise/shared';

const logger = getLogger('communication-service:db');

let pool: Pool | null = null;

const getPool = (): Pool => {
  if (!pool) {
    const password = process.env.DB_PASSWORD || '';
    logger.info('Creating database pool with config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      passwordLength: password.length,
    });

    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'corenextdb',
      user: process.env.DB_USER || 'corenext',
      password: process.env.DB_PASSWORD || '',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('connect', () => {
      logger.debug('Database connected');
    });

    pool.on('error', (err) => {
      logger.error('Database error:', err);
    });
  }
  return pool;
};

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await getPool().query(text, params);
    const duration = Date.now() - start;

    // Log slow queries
    if (duration > 100) {
      logger.warn('Slow query (' + duration + 'ms): ' + text.substr(0, 100));
    }

    return result;
  } catch (error) {
    logger.error('Query error:', error);
    throw error;
  }
};

export const getClient = (): Promise<PoolClient> => getPool().connect();

export { pool };

export default { query, getClient, pool };
