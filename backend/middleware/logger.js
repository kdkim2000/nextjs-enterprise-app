const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const LOG_FILE = path.join(__dirname, '../data/logs.json');

/**
 * Middleware to log all requests
 */
function loggerMiddleware(req, res, next) {
  const startTime = Date.now();

  // Capture response
  const oldJson = res.json;
  res.json = function(data) {
    res.locals.responseData = data;
    return oldJson.call(this, data);
  };

  res.on('finish', async () => {
    const duration = Date.now() - startTime;

    const logEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.userId || 'anonymous',
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      requestBody: req.method !== 'GET' ? req.body : undefined,
      // Don't log response body for large responses
      responsePreview: res.statusCode >= 400 ? res.locals.responseData : undefined
    };

    try {
      await appendLog(logEntry);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  });

  next();
}

/**
 * Append log entry to file
 */
async function appendLog(logEntry) {
  try {
    let logs = [];
    try {
      const data = await fs.readFile(LOG_FILE, 'utf8');
      logs = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is empty
      logs = [];
    }

    logs.push(logEntry);

    // Keep only last 10000 entries
    if (logs.length > 10000) {
      logs = logs.slice(-10000);
    }

    await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Error writing log file:', error);
  }
}

/**
 * Get logs with filtering
 */
async function getLogs(filters = {}) {
  try {
    const data = await fs.readFile(LOG_FILE, 'utf8');
    let logs = JSON.parse(data);

    // Apply filters
    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }
    if (filters.path) {
      logs = logs.filter(log => log.path.includes(filters.path));
    }
    if (filters.method) {
      logs = logs.filter(log => log.method === filters.method);
    }
    if (filters.startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    return logs;
  } catch (error) {
    return [];
  }
}

module.exports = {
  loggerMiddleware,
  appendLog,
  getLogs
};
