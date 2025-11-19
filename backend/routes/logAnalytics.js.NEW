const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getLogs } = require('../middleware/logger');

const router = express.Router();

/**
 * Get log analytics and statistics
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const logs = await getLogs(filters);
    const totalRequests = logs.length;

    const methodStats = logs.reduce((acc, log) => {
      acc[log.method] = (acc[log.method] || 0) + 1;
      return acc;
    }, {});

    const statusStats = logs.reduce((acc, log) => {
      const category = String(Math.floor(log.statusCode / 100)) + 'xx';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const errorLogs = logs.filter(log => log.statusCode >= 400);
    const errorRate = totalRequests > 0 ? (errorLogs.length / totalRequests * 100).toFixed(2) : '0';

    const endpointCounts = logs.reduce((acc, log) => {
      const endpoint = log.method + ' ' + log.path;
      acc[endpoint] = (acc[endpoint] || 0) + 1;
      return acc;
    }, {});
    const topEndpoints = Object.entries(endpointCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));

    const userCounts = logs.reduce((acc, log) => {
      if (log.userId && log.userId !== 'anonymous') {
        acc[log.userId] = (acc[log.userId] || 0) + 1;
      }
      return acc;
    }, {});
    const topUsers = Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count }));

    const totalDuration = logs.reduce((acc, log) => {
      const duration = parseInt(log.duration.replace('ms', ''));
      return acc + (isNaN(duration) ? 0 : duration);
    }, 0);
    const avgResponseTime = totalRequests > 0 ? Math.round(totalDuration / totalRequests) : 0;

    const slowRequests = logs.filter(log => {
      const duration = parseInt(log.duration.replace('ms', ''));
      return !isNaN(duration) && duration > 1000;
    });

    const now = new Date();
    const timeSeriesData = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      const hourLogs = logs.filter(log => {
        const logTime = new Date(log.timestamp);
        return logTime >= hourStart && logTime < hourEnd;
      });
      timeSeriesData.push({
        hour: hourStart.toISOString(),
        count: hourLogs.length,
        errors: hourLogs.filter(l => l.statusCode >= 400).length
      });
    }

    const recentErrors = errorLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    res.json({
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
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * Get error logs only
 */
router.get('/errors', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const logs = await getLogs(filters);
    const errorLogs = logs.filter(log => log.statusCode >= 400);

    errorLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedLogs = errorLogs.slice(startIndex, endIndex);

    res.json({
      logs: paginatedLogs,
      pagination: {
        total: errorLogs.length,
        page,
        limit,
        totalPages: Math.ceil(errorLogs.length / limit)
      }
    });
  } catch (error) {
    console.error('Get error logs error:', error);
    res.status(500).json({ error: 'Failed to fetch error logs' });
  }
});

module.exports = router;
