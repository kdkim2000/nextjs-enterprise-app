/**
 * PostgreSQL Database Configuration and Connection Pool
 *
 * This module manages the PostgreSQL connection pool and provides
 * a centralized database configuration for the entire backend application.
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'enterprise_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,

  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established

  // Additional PostgreSQL settings
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

  // Client encoding
  client_encoding: 'UTF8',
};

// Create connection pool
const pool = new Pool(dbConfig);

// Pool event handlers for monitoring
pool.on('connect', (client) => {
  console.log('✓ New database connection established');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle database client:', err);
  process.exit(-1);
});

pool.on('remove', (client) => {
  console.log('⚠ Database client removed from pool');
});

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✓ Database connection test successful');
    console.log('  PostgreSQL Version:', result.rows[0].pg_version.split(' ')[1]);
    console.log('  Server Time:', result.rows[0].current_time);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    throw error;
  }
}

/**
 * Execute a query with automatic connection management
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries (> 1000ms)
    if (duration > 1000) {
      console.warn(`⚠ Slow query detected (${duration}ms):`, text.substring(0, 100));
    }

    return result;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    console.error('   Query:', text.substring(0, 200));
    throw error;
  }
}

/**
 * Get a client from the pool for transaction management
 * @returns {Promise<Object>} PostgreSQL client
 */
async function getClient() {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  // Set a timeout to release client after 30 seconds
  const timeout = setTimeout(() => {
    console.error('⚠ Client has been checked out for more than 30 seconds!');
    console.error('   Releasing client forcefully');
    client.release();
  }, 30000);

  // Override release method to clear timeout
  client.release = () => {
    clearTimeout(timeout);
    client.release = release;
    return release();
  };

  return client;
}

/**
 * Execute multiple queries in a transaction
 * @param {Function} callback - Callback function that receives a client
 * @returns {Promise<any>} Result of the callback
 */
async function transaction(callback) {
  const client = await getClient();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Gracefully close all connections in the pool
 * @returns {Promise<void>}
 */
async function closePool() {
  try {
    await pool.end();
    console.log('✓ Database connection pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error.message);
    throw error;
  }
}

/**
 * Get current pool status
 * @returns {Object} Pool statistics
 */
function getPoolStatus() {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
}

// Graceful shutdown on process termination
process.on('SIGINT', async () => {
  console.log('\n⚠ SIGINT signal received: closing database pool');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠ SIGTERM signal received: closing database pool');
  await closePool();
  process.exit(0);
});

module.exports = {
  pool,
  query,
  getClient,
  transaction,
  testConnection,
  closePool,
  getPoolStatus,
};
