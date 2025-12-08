/**
 * Database Connection
 */

import { Pool } from 'pg';
import { getLogger } from '@enterprise/shared';

const logger = getLogger('auth-service:db');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'corenextdb',
  user: process.env.DB_USER || 'corenext',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  logger.debug('Database connected');
});

pool.on('error', (err) => {
  logger.error('Database error:', err);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Query executed in ${duration}ms`, { rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query error:', error);
    throw error;
  }
};

export const getClient = () => pool.connect();

export default pool;
