/**
 * Dashboard Service Layer - Common Module
 */

import { query } from '../../../utils/database';
import * as logService from './logService';
import {
  DashboardSummary,
  ActivityTrend,
  UserStatusDistribution,
  DepartmentStats,
  BoardActivity,
  SystemPerformance,
  HttpStatusDistribution,
  TopPost,
  ErrorEndpoint,
  RecentActivity,
  LoginStats,
  MenuUsage
} from '../types';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const combinedStats = await query(`
    WITH user_stats AS (
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as this_month,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days') as last_month
      FROM users
    ),
    post_stats AS (
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as this_week,
        COALESCE(SUM(view_count), 0) as total_views,
        COUNT(*) FILTER (WHERE updated_at >= CURRENT_DATE) as posts_viewed_today
      FROM posts
    ),
    comment_stats AS (
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today
      FROM comments
    )
    SELECT
      u.total as user_total,
      u.active as user_active,
      u.inactive as user_inactive,
      u.pending as user_pending,
      u.this_month as user_this_month,
      u.last_month as user_last_month,
      p.total as post_total,
      p.today as post_today,
      p.this_week as post_this_week,
      p.total_views as view_total,
      p.posts_viewed_today,
      c.total as comment_total,
      c.today as comment_today
    FROM user_stats u, post_stats p, comment_stats c
  `);

  const stats = combinedStats.rows[0];

  const thisMonth = parseInt(stats.user_this_month) || 0;
  const lastMonth = parseInt(stats.user_last_month) || 1;
  const growthPercent = ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1);

  let errorRate = '0';
  let errorCount = 0;
  try {
    const logs = await logService.getLogs({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      limit: 10000
    });
    const totalRequests = logs.length;
    const errorLogs = logs.filter(log => log.statusCode >= 400);
    errorCount = errorLogs.length;
    errorRate = totalRequests > 0 ? (errorLogs.length / totalRequests * 100).toFixed(1) : '0';
  } catch (e) {
    console.error('Error fetching logs for dashboard:', e);
  }

  return {
    users: {
      total: parseInt(stats.user_total),
      active: parseInt(stats.user_active),
      inactive: parseInt(stats.user_inactive),
      pending: parseInt(stats.user_pending),
      growth: parseFloat(growthPercent)
    },
    posts: {
      total: parseInt(stats.post_total),
      today: parseInt(stats.post_today),
      thisWeek: parseInt(stats.post_this_week)
    },
    comments: {
      total: parseInt(stats.comment_total),
      today: parseInt(stats.comment_today)
    },
    views: {
      total: parseInt(stats.view_total),
      postsViewedToday: parseInt(stats.posts_viewed_today)
    },
    errors: {
      rate: parseFloat(errorRate),
      count: errorCount
    }
  };
}

export async function getActivityTrend(days = 7): Promise<ActivityTrend[]> {
  const result = await query(`
    WITH date_series AS (
      SELECT generate_series(
        CURRENT_DATE - ($1 || ' days')::interval,
        CURRENT_DATE,
        '1 day'::interval
      )::date as date
    ),
    post_counts AS (
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM posts
      WHERE created_at >= CURRENT_DATE - ($1 || ' days')::interval
      GROUP BY DATE(created_at)
    ),
    comment_counts AS (
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM comments
      WHERE created_at >= CURRENT_DATE - ($1 || ' days')::interval
      GROUP BY DATE(created_at)
    ),
    view_counts AS (
      SELECT DATE(viewed_at) as date, COUNT(*) as count
      FROM post_views
      WHERE viewed_at >= CURRENT_DATE - ($1 || ' days')::interval
      GROUP BY DATE(viewed_at)
    )
    SELECT
      ds.date,
      COALESCE(pc.count, 0) as posts,
      COALESCE(cc.count, 0) as comments,
      COALESCE(vc.count, 0) as views
    FROM date_series ds
    LEFT JOIN post_counts pc ON ds.date = pc.date
    LEFT JOIN comment_counts cc ON ds.date = cc.date
    LEFT JOIN view_counts vc ON ds.date = vc.date
    ORDER BY ds.date
  `, [days - 1]);

  return result.rows.map((row: any) => ({
    date: row.date,
    posts: parseInt(row.posts),
    comments: parseInt(row.comments),
    views: parseInt(row.views)
  }));
}

export async function getUserStatusDistribution(): Promise<UserStatusDistribution[]> {
  const result = await query(`
    SELECT
      status,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
    FROM users
    GROUP BY status
    ORDER BY count DESC
  `);

  return result.rows.map((row: any) => ({
    status: row.status,
    count: parseInt(row.count),
    percentage: parseFloat(row.percentage)
  }));
}

export async function getDepartmentStats(limit = 8): Promise<DepartmentStats[]> {
  const result = await query(`
    SELECT
      d.id,
      d.name_ko as name,
      COUNT(u.id) as count
    FROM departments d
    LEFT JOIN users u ON u.department = d.id
    WHERE d.status = 'active'
    GROUP BY d.id, d.name_ko
    ORDER BY count DESC
    LIMIT $1
  `, [limit]);

  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    count: parseInt(row.count)
  }));
}

export async function getBoardActivity(): Promise<BoardActivity[]> {
  const result = await query(`
    SELECT
      bt.id,
      bt.name_ko as name,
      COUNT(p.id) as post_count,
      COALESCE(SUM(p.view_count), 0) as total_views
    FROM board_types bt
    LEFT JOIN posts p ON p.board_type_id = bt.id
    WHERE bt.status = 'active'
    GROUP BY bt.id, bt.name_ko
    ORDER BY post_count DESC
  `);

  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    postCount: parseInt(row.post_count),
    totalViews: parseInt(row.total_views)
  }));
}

export async function getSystemPerformance(hours = 24): Promise<SystemPerformance[]> {
  const logs = await logService.getLogs({
    startDate: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
    limit: 100000
  });

  const now = new Date();
  const hourlyData: SystemPerformance[] = [];

  for (let i = hours - 1; i >= 0; i--) {
    const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

    const hourLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= hourStart && logTime < hourEnd;
    });

    const totalDuration = hourLogs.reduce((acc, log) => {
      const duration = parseInt(log.duration?.replace('ms', '') || '0');
      return acc + (isNaN(duration) ? 0 : duration);
    }, 0);

    hourlyData.push({
      hour: hourStart.toISOString(),
      requests: hourLogs.length,
      avgResponseTime: hourLogs.length > 0 ? Math.round(totalDuration / hourLogs.length) : 0,
      errors: hourLogs.filter(l => l.statusCode >= 400).length
    });
  }

  return hourlyData;
}

export async function getHttpStatusDistribution(): Promise<HttpStatusDistribution[]> {
  const logs = await logService.getLogs({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    limit: 100000
  });

  const statusStats = logs.reduce((acc: Record<string, number>, log) => {
    const category = String(Math.floor(log.statusCode / 100)) + 'xx';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const total = logs.length || 1;
  const result = Object.entries(statusStats).map(([status, count]) => ({
    status,
    count: count as number,
    percentage: parseFloat(((count as number) / total * 100).toFixed(1))
  }));

  const categories = ['2xx', '3xx', '4xx', '5xx'];
  categories.forEach(cat => {
    if (!result.find(r => r.status === cat)) {
      result.push({ status: cat, count: 0, percentage: 0 });
    }
  });

  result.sort((a, b) => a.status.localeCompare(b.status));

  return result;
}

export async function getTopPosts(limit = 5): Promise<TopPost[]> {
  const result = await query(`
    SELECT
      p.id,
      p.title,
      p.view_count,
      p.like_count,
      p.created_at,
      u.name_ko as author_name,
      bt.name_ko as board_name
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN board_types bt ON p.board_type_id = bt.id
    WHERE p.status = 'published'
    ORDER BY p.view_count DESC
    LIMIT $1
  `, [limit]);

  return result.rows.map((row: any) => ({
    id: row.id,
    title: row.title,
    views: parseInt(row.view_count) || 0,
    likes: parseInt(row.like_count) || 0,
    author: row.author_name,
    board: row.board_name,
    createdAt: row.created_at
  }));
}

export async function getErrorEndpoints(limit = 5): Promise<ErrorEndpoint[]> {
  const logs = await logService.getLogs({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    limit: 100000
  });

  const errorLogs = logs.filter(log => log.statusCode >= 400);

  const endpointErrors = errorLogs.reduce((acc: Record<string, any>, log) => {
    const endpoint = `${log.method} ${log.path}`;
    if (!acc[endpoint]) {
      acc[endpoint] = { count: 0, lastError: log.timestamp, statusCode: log.statusCode };
    }
    acc[endpoint].count++;
    if (new Date(log.timestamp) > new Date(acc[endpoint].lastError)) {
      acc[endpoint].lastError = log.timestamp;
      acc[endpoint].statusCode = log.statusCode;
    }
    return acc;
  }, {});

  return Object.entries(endpointErrors)
    .map(([endpoint, data]: [string, any]) => ({
      endpoint,
      errorCount: data.count,
      lastError: data.lastError,
      statusCode: data.statusCode
    }))
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, limit);
}

export async function getRecentActivity(limit = 10): Promise<RecentActivity[]> {
  const recentPosts = await query(`
    SELECT
      'post' as type,
      p.id,
      p.title as target,
      u.name_ko as user_name,
      bt.name_ko as board_name,
      p.created_at as timestamp
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN board_types bt ON p.board_type_id = bt.id
    ORDER BY p.created_at DESC
    LIMIT $1
  `, [limit]);

  const recentComments = await query(`
    SELECT
      'comment' as type,
      c.id,
      SUBSTRING(c.content, 1, 50) as target,
      u.name_ko as user_name,
      p.title as post_title,
      c.created_at as timestamp
    FROM comments c
    LEFT JOIN users u ON c.author_id = u.id
    LEFT JOIN posts p ON c.post_id = p.id
    ORDER BY c.created_at DESC
    LIMIT $1
  `, [limit]);

  let recentErrors: any[] = [];
  try {
    const logs = await logService.getLogs({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      limit: 10000
    });
    recentErrors = logs
      .filter(log => log.statusCode >= 500)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
      .map(log => ({
        type: 'error',
        id: null,
        target: `${log.method} ${log.path}`,
        user_name: 'System',
        statusCode: log.statusCode,
        timestamp: log.timestamp
      }));
  } catch (e) {
    console.error('Error fetching recent errors:', e);
  }

  const activities: RecentActivity[] = [
    ...recentPosts.rows.map((row: any) => ({
      type: 'post' as const,
      id: row.id,
      action: '새 게시글 작성',
      target: row.target,
      user: row.user_name,
      meta: row.board_name,
      timestamp: row.timestamp
    })),
    ...recentComments.rows.map((row: any) => ({
      type: 'comment' as const,
      id: row.id,
      action: '댓글 작성',
      target: row.target + '...',
      user: row.user_name,
      meta: row.post_title,
      timestamp: row.timestamp
    })),
    ...recentErrors.map((err: any) => ({
      type: 'error' as const,
      id: null,
      action: `API Error (${err.statusCode})`,
      target: err.target,
      user: err.user_name,
      meta: undefined,
      timestamp: err.timestamp
    }))
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  return activities;
}

export async function getLoginStats(days = 7): Promise<LoginStats[]> {
  const result = await query(`
    WITH date_series AS (
      SELECT generate_series(
        CURRENT_DATE - ($1 || ' days')::interval,
        CURRENT_DATE,
        '1 day'::interval
      )::date as date
    ),
    login_attempts AS (
      SELECT
        DATE(timestamp) as date,
        COUNT(*) FILTER (WHERE status_code = 200) as success,
        COUNT(*) FILTER (WHERE status_code >= 400) as failed
      FROM logs
      WHERE path LIKE '%/auth/login%'
        AND method = 'POST'
        AND timestamp >= CURRENT_DATE - ($1 || ' days')::interval
      GROUP BY DATE(timestamp)
    )
    SELECT
      ds.date,
      COALESCE(la.success, 0) as success,
      COALESCE(la.failed, 0) as failed
    FROM date_series ds
    LEFT JOIN login_attempts la ON ds.date = la.date
    ORDER BY ds.date
  `, [days - 1]);

  return result.rows.map((row: any) => ({
    date: row.date,
    success: parseInt(row.success),
    failed: parseInt(row.failed)
  }));
}

export async function getMenuUsage(limit = 10): Promise<MenuUsage[]> {
  const result = await query(`
    SELECT
      l.program_id,
      p.name_ko as program_name,
      COUNT(*) as access_count,
      COUNT(DISTINCT l.user_id) as unique_users
    FROM logs l
    LEFT JOIN programs p ON l.program_id = p.id
    WHERE l.program_id IS NOT NULL
      AND l.program_id != 'PROG-SYSTEM'
      AND l.timestamp >= NOW() - INTERVAL '7 days'
      AND l.status_code < 400
    GROUP BY l.program_id, p.name_ko
    ORDER BY access_count DESC
    LIMIT $1
  `, [limit]);

  return result.rows.map((row: any) => ({
    programId: row.program_id,
    name: row.program_name || row.program_id,
    accessCount: parseInt(row.access_count),
    uniqueUsers: parseInt(row.unique_users)
  }));
}
