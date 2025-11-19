/**
 * Log Service Layer
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function createLog(logData) {
  const { userId, method, path, statusCode, duration, ip, userAgent, programId } = logData;
  const id = uuidv4();
  const query = `
    INSERT INTO logs (id, user_id, method, path, status_code, duration, ip, user_agent, program_id, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    RETURNING *
  `;
  const params = [id, userId, method, path, statusCode, duration, ip, userAgent, programId];
  const result = await db.query(query, params);
  return result.rows[0];
}

async function getLogs(options = {}) {
  const { userId, path, method, programId, statusCode, startDate, endDate, limit = 100, offset = 0 } = options;

  let query = 'SELECT * FROM logs WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (userId) {
    query += ` AND user_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }

  if (path) {
    query += ` AND path ILIKE $${paramIndex}`;
    params.push(`%${path}%`);
    paramIndex++;
  }

  if (method) {
    query += ` AND method = $${paramIndex}`;
    params.push(method);
    paramIndex++;
  }

  if (programId) {
    query += ` AND program_id = $${paramIndex}`;
    params.push(programId);
    paramIndex++;
  }

  if (statusCode) {
    query += ` AND status_code = $${paramIndex}`;
    params.push(statusCode);
    paramIndex++;
  }

  if (startDate) {
    query += ` AND timestamp >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    query += ` AND timestamp <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  query += ' ORDER BY timestamp DESC';

  if (limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(limit);
    paramIndex++;
  }

  if (offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(offset);
  }

  const result = await db.query(query, params);
  return result.rows;
}

async function getLogCount(filters = {}) {
  const { userId, path, method, programId, statusCode, startDate, endDate } = filters;

  let query = 'SELECT COUNT(*) FROM logs WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (userId) {
    query += ` AND user_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }

  if (path) {
    query += ` AND path ILIKE $${paramIndex}`;
    params.push(`%${path}%`);
    paramIndex++;
  }

  if (method) {
    query += ` AND method = $${paramIndex}`;
    params.push(method);
    paramIndex++;
  }

  if (programId) {
    query += ` AND program_id = $${paramIndex}`;
    params.push(programId);
    paramIndex++;
  }

  if (statusCode) {
    query += ` AND status_code = $${paramIndex}`;
    params.push(statusCode);
    paramIndex++;
  }

  if (startDate) {
    query += ` AND timestamp >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    query += ` AND timestamp <= $${paramIndex}`;
    params.push(endDate);
  }

  const result = await db.query(query, params);
  return parseInt(result.rows[0].count, 10);
}

async function getLogAnalytics(options = {}) {
  const { startDate, endDate, groupBy = 'day' } = options;

  let dateFormat;
  switch (groupBy) {
    case 'hour':
      dateFormat = 'YYYY-MM-DD HH24:00';
      break;
    case 'day':
      dateFormat = 'YYYY-MM-DD';
      break;
    case 'month':
      dateFormat = 'YYYY-MM';
      break;
    default:
      dateFormat = 'YYYY-MM-DD';
  }

  let query = `
    SELECT
      TO_CHAR(timestamp, '${dateFormat}') as period,
      COUNT(*) as total_requests,
      AVG(duration) as avg_duration,
      COUNT(DISTINCT user_id) as unique_users,
      SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count
    FROM logs
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  if (startDate) {
    query += ` AND timestamp >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    query += ` AND timestamp <= $${paramIndex}`;
    params.push(endDate);
  }

  query += ' GROUP BY period ORDER BY period DESC';

  const result = await db.query(query, params);
  return result.rows;
}

async function deleteOldLogs(daysToKeep = 90) {
  const query = `
    DELETE FROM logs
    WHERE timestamp < NOW() - INTERVAL '${daysToKeep} days'
  `;
  const result = await db.query(query);
  return result.rowCount;
}

module.exports = {
  createLog,
  getLogs,
  getLogCount,
  getLogAnalytics,
  deleteOldLogs,
};
