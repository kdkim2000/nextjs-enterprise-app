const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');
const { getLogs } = require('../middleware/logger');

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary KPIs
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    // Combined query for all statistics - reduces 5 queries to 1
    const combinedStats = await db.query(`
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

    // Calculate growth percentage
    const thisMonth = parseInt(stats.user_this_month) || 0;
    const lastMonth = parseInt(stats.user_last_month) || 1;
    const growthPercent = ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1);

    // Error rate from logs
    let errorRate = '0';
    let errorCount = 0;
    try {
      const logs = await getLogs({ startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() });
      const totalRequests = logs.length;
      const errorLogs = logs.filter(log => log.statusCode >= 400);
      errorCount = errorLogs.length;
      errorRate = totalRequests > 0 ? (errorLogs.length / totalRequests * 100).toFixed(1) : '0';
    } catch (e) {
      console.error('Error fetching logs for dashboard:', e);
    }

    res.json({
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
    });
  } catch (error) {
    console.error('Dashboard summary error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch dashboard summary', details: error.message });
  }
});

/**
 * @swagger
 * /api/dashboard/activity-trend:
 *   get:
 *     summary: Get activity trend data for charts
 *     tags: [Dashboard]
 */
router.get('/activity-trend', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;

    const result = await db.query(`
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

    res.json(result.rows.map(row => ({
      date: row.date,
      posts: parseInt(row.posts),
      comments: parseInt(row.comments),
      views: parseInt(row.views)
    })));
  } catch (error) {
    console.error('Activity trend error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch activity trend', details: error.message });
  }
});

/**
 * @swagger
 * /api/dashboard/user-status:
 *   get:
 *     summary: Get user status distribution
 *     tags: [Dashboard]
 */
router.get('/user-status', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
      FROM users
      GROUP BY status
      ORDER BY count DESC
    `);

    res.json(result.rows.map(row => ({
      status: row.status,
      count: parseInt(row.count),
      percentage: parseFloat(row.percentage)
    })));
  } catch (error) {
    console.error('User status error:', error);
    res.status(500).json({ error: 'Failed to fetch user status' });
  }
});

/**
 * @swagger
 * /api/dashboard/department-stats:
 *   get:
 *     summary: Get department user statistics
 *     tags: [Dashboard]
 */
router.get('/department-stats', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const result = await db.query(`
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

    res.json(result.rows.map(row => ({
      id: row.id,
      name: row.name,
      count: parseInt(row.count)
    })));
  } catch (error) {
    console.error('Department stats error:', error);
    res.status(500).json({ error: 'Failed to fetch department stats' });
  }
});

/**
 * @swagger
 * /api/dashboard/board-activity:
 *   get:
 *     summary: Get board activity statistics
 *     tags: [Dashboard]
 */
router.get('/board-activity', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
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

    res.json(result.rows.map(row => ({
      id: row.id,
      name: row.name,
      postCount: parseInt(row.post_count),
      totalViews: parseInt(row.total_views)
    })));
  } catch (error) {
    console.error('Board activity error:', error);
    res.status(500).json({ error: 'Failed to fetch board activity' });
  }
});

/**
 * @swagger
 * /api/dashboard/system-performance:
 *   get:
 *     summary: Get system performance metrics
 *     tags: [Dashboard]
 */
router.get('/system-performance', authenticateToken, async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const logs = await getLogs({
      startDate: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    });

    // Group by hour
    const now = new Date();
    const hourlyData = [];

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

    res.json(hourlyData);
  } catch (error) {
    console.error('System performance error:', error);
    res.status(500).json({ error: 'Failed to fetch system performance' });
  }
});

/**
 * @swagger
 * /api/dashboard/http-status:
 *   get:
 *     summary: Get HTTP status code distribution
 *     tags: [Dashboard]
 */
router.get('/http-status', authenticateToken, async (req, res) => {
  try {
    const logs = await getLogs({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    });

    const statusStats = logs.reduce((acc, log) => {
      const category = String(Math.floor(log.statusCode / 100)) + 'xx';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const total = logs.length || 1;
    const result = Object.entries(statusStats).map(([status, count]) => ({
      status,
      count,
      percentage: parseFloat((count / total * 100).toFixed(1))
    }));

    // Ensure all status categories exist
    const categories = ['2xx', '3xx', '4xx', '5xx'];
    categories.forEach(cat => {
      if (!result.find(r => r.status === cat)) {
        result.push({ status: cat, count: 0, percentage: 0 });
      }
    });

    result.sort((a, b) => a.status.localeCompare(b.status));

    res.json(result);
  } catch (error) {
    console.error('HTTP status error:', error);
    res.status(500).json({ error: 'Failed to fetch HTTP status' });
  }
});

/**
 * @swagger
 * /api/dashboard/top-posts:
 *   get:
 *     summary: Get top posts by view count
 *     tags: [Dashboard]
 */
router.get('/top-posts', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const result = await db.query(`
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

    res.json(result.rows.map(row => ({
      id: row.id,
      title: row.title,
      views: parseInt(row.view_count) || 0,
      likes: parseInt(row.like_count) || 0,
      author: row.author_name,
      board: row.board_name,
      createdAt: row.created_at
    })));
  } catch (error) {
    console.error('Top posts error:', error);
    res.status(500).json({ error: 'Failed to fetch top posts' });
  }
});

/**
 * @swagger
 * /api/dashboard/error-endpoints:
 *   get:
 *     summary: Get endpoints with most errors
 *     tags: [Dashboard]
 */
router.get('/error-endpoints', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const logs = await getLogs({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    });

    const errorLogs = logs.filter(log => log.statusCode >= 400);

    const endpointErrors = errorLogs.reduce((acc, log) => {
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

    const result = Object.entries(endpointErrors)
      .map(([endpoint, data]) => ({
        endpoint,
        errorCount: data.count,
        lastError: data.lastError,
        statusCode: data.statusCode
      }))
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, limit);

    res.json(result);
  } catch (error) {
    console.error('Error endpoints error:', error);
    res.status(500).json({ error: 'Failed to fetch error endpoints' });
  }
});

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent activity feed
 *     tags: [Dashboard]
 */
router.get('/recent-activity', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent posts
    const recentPosts = await db.query(`
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

    // Get recent comments
    const recentComments = await db.query(`
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

    // Get recent errors from logs
    let recentErrors = [];
    try {
      const logs = await getLogs({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      });
      recentErrors = logs
        .filter(log => log.statusCode >= 500)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
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

    // Combine and sort
    const activities = [
      ...recentPosts.rows.map(row => ({
        type: 'post',
        id: row.id,
        action: '새 게시글 작성',
        target: row.target,
        user: row.user_name,
        meta: row.board_name,
        timestamp: row.timestamp
      })),
      ...recentComments.rows.map(row => ({
        type: 'comment',
        id: row.id,
        action: '댓글 작성',
        target: row.target + '...',
        user: row.user_name,
        meta: row.post_title,
        timestamp: row.timestamp
      })),
      ...recentErrors.map(err => ({
        type: 'error',
        id: null,
        action: `API Error (${err.statusCode})`,
        target: err.target,
        user: err.user_name,
        meta: null,
        timestamp: err.timestamp
      }))
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    res.json(activities);
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

/**
 * @swagger
 * /api/dashboard/login-stats:
 *   get:
 *     summary: Get login statistics
 *     tags: [Dashboard]
 */
router.get('/login-stats', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;

    // Daily login statistics from logs table
    const result = await db.query(`
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

    res.json(result.rows.map(row => ({
      date: row.date,
      success: parseInt(row.success),
      failed: parseInt(row.failed)
    })));
  } catch (error) {
    console.error('Login stats error:', error);
    res.status(500).json({ error: 'Failed to fetch login stats' });
  }
});

/**
 * @swagger
 * /api/dashboard/menu-usage:
 *   get:
 *     summary: Get menu/program usage statistics
 *     tags: [Dashboard]
 */
router.get('/menu-usage', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Program usage from logs table with program names
    const result = await db.query(`
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

    res.json(result.rows.map(row => ({
      programId: row.program_id,
      name: row.program_name || row.program_id,
      accessCount: parseInt(row.access_count),
      uniqueUsers: parseInt(row.unique_users)
    })));
  } catch (error) {
    console.error('Menu usage error:', error);
    res.status(500).json({ error: 'Failed to fetch menu usage' });
  }
});

module.exports = router;
