const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getLogs } = require('../middleware/logger');

const router = express.Router();

/**
 * Get logs with filters
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Only admin can view all logs
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const filters = {
      userId: req.query.userId,
      path: req.query.path,
      method: req.query.method,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const logs = await getLogs(filters);

    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedLogs = logs.slice(startIndex, endIndex);

    res.json({
      logs: paginatedLogs,
      pagination: {
        total: logs.length,
        page,
        limit,
        totalPages: Math.ceil(logs.length / limit)
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

/**
 * Get user's own logs
 */
router.get('/my-logs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const logs = await getLogs({ userId });

    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedLogs = logs.slice(startIndex, endIndex);

    res.json({
      logs: paginatedLogs,
      pagination: {
        total: logs.length,
        page,
        limit,
        totalPages: Math.ceil(logs.length / limit)
      }
    });
  } catch (error) {
    console.error('Get my logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
