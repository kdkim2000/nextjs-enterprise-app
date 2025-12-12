/**
 * Log Service Layer - Common Module
 */

import { query } from '../../../utils/database';
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

/**
 * Get detailed log analytics similar to legacy logAnalytics.js
 */
export async function getDetailedLogAnalytics(options: {
  startDate?: string;
  endDate?: string;
} = {}): Promise<{
  summary: {
    totalRequests: number;
    errorRate: string;
    avgResponseTime: string;
    slowRequestCount: number;
  };
  methodStats: Record<string, number>;
  statusStats: Record<string, number>;
  topEndpoints: Array<{ endpoint: string; count: number }>;
  topUsers: Array<{ userId: string; count: number }>;
  timeSeriesData: Array<{ hour: string; count: number; errors: number }>;
  recentErrors: any[];
}> {
  const { startDate, endDate } = options;

  let whereClause = '1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (startDate) {
    whereClause += ` AND timestamp >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    whereClause += ` AND timestamp <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  const logsResult = await query(
    `SELECT * FROM logs WHERE ${whereClause} ORDER BY timestamp DESC LIMIT 10000`,
    params
  );
  const logs = logsResult.rows;
  const totalRequests = logs.length;

  const methodStats: Record<string, number> = {};
  logs.forEach((log: any) => {
    methodStats[log.method] = (methodStats[log.method] || 0) + 1;
  });

  const statusStats: Record<string, number> = {};
  logs.forEach((log: any) => {
    const category = String(Math.floor(log.status_code / 100)) + 'xx';
    statusStats[category] = (statusStats[category] || 0) + 1;
  });

  const errorLogs = logs.filter((log: any) => log.status_code >= 400);
  const errorRate = totalRequests > 0
    ? (errorLogs.length / totalRequests * 100).toFixed(2)
    : '0';

  const endpointCounts: Record<string, number> = {};
  logs.forEach((log: any) => {
    const endpoint = `${log.method} ${log.path}`;
    endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
  });
  const topEndpoints = Object.entries(endpointCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([endpoint, count]) => ({ endpoint, count }));

  const userCounts: Record<string, number> = {};
  logs.forEach((log: any) => {
    if (log.user_id && log.user_id !== 'anonymous') {
      userCounts[log.user_id] = (userCounts[log.user_id] || 0) + 1;
    }
  });
  const topUsers = Object.entries(userCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([userId, count]) => ({ userId, count }));

  let totalDuration = 0;
  logs.forEach((log: any) => {
    const duration = parseInt(String(log.duration).replace('ms', ''));
    if (!isNaN(duration)) {
      totalDuration += duration;
    }
  });
  const avgResponseTime = totalRequests > 0 ? Math.round(totalDuration / totalRequests) : 0;

  const slowRequests = logs.filter((log: any) => {
    const duration = parseInt(String(log.duration).replace('ms', ''));
    return !isNaN(duration) && duration > 1000;
  });

  const now = new Date();
  const timeSeriesData: Array<{ hour: string; count: number; errors: number }> = [];
  for (let i = 23; i >= 0; i--) {
    const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
    const hourLogs = logs.filter((log: any) => {
      const logTime = new Date(log.timestamp);
      return logTime >= hourStart && logTime < hourEnd;
    });
    timeSeriesData.push({
      hour: hourStart.toISOString(),
      count: hourLogs.length,
      errors: hourLogs.filter((l: any) => l.status_code >= 400).length
    });
  }

  const recentErrors = errorLogs.slice(0, 20).map((log: any) => ({
    id: log.id,
    timestamp: log.timestamp,
    method: log.method,
    path: log.path,
    statusCode: log.status_code,
    duration: log.duration,
    userId: log.user_id,
    ip: log.ip,
    userAgent: log.user_agent
  }));

  return {
    summary: {
      totalRequests,
      errorRate: errorRate + '%',
      avgResponseTime: avgResponseTime + 'ms',
      slowRequestCount: slowRequests.length
    },
    methodStats,
    statusStats,
    topEndpoints,
    topUsers,
    timeSeriesData,
    recentErrors
  };
}
