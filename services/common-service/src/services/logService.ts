/**
 * Log Service Layer
 */

import { query } from '../utils/database';
import { v4 as uuidv4 } from 'uuid';
import { Log, LogQueryOptions, LogAnalytics } from '../types';

export async function createLog(logData: {
  userId?: string;
  method: string;
  path: string;
  statusCode: number;
  duration: string;
  ip?: string;
  userAgent?: string;
  programId?: string;
}): Promise<any> {
  const id = uuidv4();
  const queryText = `
    INSERT INTO logs (id, user_id, method, path, status_code, duration, ip, user_agent, program_id, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    RETURNING *
  `;
  const params = [
    id,
    logData.userId,
    logData.method,
    logData.path,
    logData.statusCode,
    logData.duration,
    logData.ip,
    logData.userAgent,
    logData.programId
  ];
  const result = await query(queryText, params);
  return result.rows[0];
}

export async function getLogs(options: LogQueryOptions = {}): Promise<Log[]> {
  const { userId, path: pathFilter, method, programId, statusCode, minStatusCode, startDate, endDate, limit = 100, offset = 0 } = options;

  let queryText = 'SELECT * FROM logs WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (userId) {
    queryText += ` AND user_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }

  if (pathFilter) {
    queryText += ` AND path ILIKE $${paramIndex}`;
    params.push(`%${pathFilter}%`);
    paramIndex++;
  }

  if (method) {
    queryText += ` AND method = $${paramIndex}`;
    params.push(method);
    paramIndex++;
  }

  if (programId) {
    queryText += ` AND program_id = $${paramIndex}`;
    params.push(programId);
    paramIndex++;
  }

  if (statusCode) {
    queryText += ` AND status_code = $${paramIndex}`;
    params.push(statusCode);
    paramIndex++;
  }

  if (minStatusCode) {
    queryText += ` AND status_code >= $${paramIndex}`;
    params.push(minStatusCode);
    paramIndex++;
  }

  if (startDate) {
    queryText += ` AND timestamp >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    queryText += ` AND timestamp <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  queryText += ' ORDER BY timestamp DESC';

  if (limit) {
    queryText += ` LIMIT $${paramIndex}`;
    params.push(limit);
    paramIndex++;
  }

  if (offset) {
    queryText += ` OFFSET $${paramIndex}`;
    params.push(offset);
  }

  const result = await query(queryText, params);

  return result.rows.map((row: any) => ({
    id: row.id,
    timestamp: row.timestamp,
    method: row.method,
    path: row.path,
    url: row.url,
    originalUrl: row.original_url,
    statusCode: row.status_code,
    duration: row.duration,
    userId: row.user_id,
    programId: row.program_id,
    ip: row.ip,
    userAgent: row.user_agent
  }));
}

export async function getLogCount(filters: LogQueryOptions = {}): Promise<number> {
  const { userId, path: pathFilter, method, programId, statusCode, minStatusCode, startDate, endDate } = filters;

  let queryText = 'SELECT COUNT(*) FROM logs WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (userId) {
    queryText += ` AND user_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }

  if (pathFilter) {
    queryText += ` AND path ILIKE $${paramIndex}`;
    params.push(`%${pathFilter}%`);
    paramIndex++;
  }

  if (method) {
    queryText += ` AND method = $${paramIndex}`;
    params.push(method);
    paramIndex++;
  }

  if (programId) {
    queryText += ` AND program_id = $${paramIndex}`;
    params.push(programId);
    paramIndex++;
  }

  if (statusCode) {
    queryText += ` AND status_code = $${paramIndex}`;
    params.push(statusCode);
    paramIndex++;
  }

  if (minStatusCode) {
    queryText += ` AND status_code >= $${paramIndex}`;
    params.push(minStatusCode);
    paramIndex++;
  }

  if (startDate) {
    queryText += ` AND timestamp >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    queryText += ` AND timestamp <= $${paramIndex}`;
    params.push(endDate);
  }

  const result = await query(queryText, params);
  return parseInt(result.rows[0].count, 10);
}

export async function getLogAnalytics(options: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'hour' | 'day' | 'month';
} = {}): Promise<LogAnalytics[]> {
  const { startDate, endDate, groupBy = 'day' } = options;

  let dateFormat: string;
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

  let queryText = `
    SELECT
      TO_CHAR(timestamp, '${dateFormat}') as period,
      COUNT(*) as total_requests,
      AVG(CAST(REPLACE(duration, 'ms', '') AS INTEGER)) as avg_duration,
      COUNT(DISTINCT user_id) as unique_users,
      SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count
    FROM logs
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (startDate) {
    queryText += ` AND timestamp >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    queryText += ` AND timestamp <= $${paramIndex}`;
    params.push(endDate);
  }

  queryText += ' GROUP BY period ORDER BY period DESC';

  const result = await query(queryText, params);
  return result.rows.map((row: any) => ({
    period: row.period,
    totalRequests: parseInt(row.total_requests),
    avgDuration: Math.round(parseFloat(row.avg_duration) || 0),
    uniqueUsers: parseInt(row.unique_users),
    errorCount: parseInt(row.error_count)
  }));
}

export async function deleteOldLogs(daysToKeep = 90): Promise<number> {
  const queryText = `
    DELETE FROM logs
    WHERE timestamp < NOW() - INTERVAL '${daysToKeep} days'
  `;
  const result = await query(queryText);
  return result.rowCount ?? 0;
}

export async function cleanupOldLogs(days = 30): Promise<number> {
  return deleteOldLogs(days);
}

export async function getAllLogs(filters: LogQueryOptions = {}): Promise<Log[]> {
  const { limit, offset, ...restFilters } = filters;
  return getLogs({ ...restFilters, limit: 100000, offset: 0 });
}
