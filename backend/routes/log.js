const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getLogs } = require('../middleware/logger');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

const USERS_FILE = path.join(__dirname, '../data/users.json');

/**
 * Helper function to enrich logs with user names
 */
async function enrichLogsWithUserNames(logs) {
  try {
    const usersData = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(usersData);
    const usersArray = Array.isArray(users) ? users : [];

    // Create a map for efficient lookup
    const userMap = new Map();
    usersArray.forEach(user => {
      userMap.set(user.id, user.name || user.username);
    });

    // Enrich logs with user names
    return logs.map(log => {
      const userName = userMap.get(log.userId);
      return {
        ...log,
        userName: userName || (log.userId === 'anonymous' ? 'Anonymous' : log.userId)
      };
    });
  } catch (error) {
    console.error('Error enriching logs with user names:', error);
    // Return logs without enrichment if error occurs
    return logs.map(log => ({
      ...log,
      userName: log.userId === 'anonymous' ? 'Anonymous' : log.userId
    }));
  }
}

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
      programId: req.query.programId,
      statusCode: req.query.statusCode,
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

    // Enrich with user names
    const enrichedLogs = await enrichLogsWithUserNames(paginatedLogs);

    res.json({
      logs: enrichedLogs,
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

    // Enrich with user names
    const enrichedLogs = await enrichLogsWithUserNames(paginatedLogs);

    res.json({
      logs: enrichedLogs,
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
