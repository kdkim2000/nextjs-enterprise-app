const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const LOG_FILE = path.join(__dirname, '../data/logs.json');
const MAX_LOGS = 10000; // Keep last 10000 entries
let writeQueue = Promise.resolve();
let cachedLogs = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5000; // 5 seconds cache

/**
 * Get program ID from request path
 */
function getProgramIdFromPath(reqPath) {
  // Map common paths to program IDs
  const pathMapping = {
    '/dashboard': 'PROG-DASHBOARD',
    '/admin/users': 'PROG-USERS',
    '/admin/roles': 'PROG-ROLES',
    '/admin/menus': 'PROG-MENUS',
    '/admin/programs': 'PROG-PROGRAMS',
    '/admin/logs': 'PROG-LOGS',
    '/profile': 'PROG-PROFILE',
    '/settings': 'PROG-SETTINGS'
  };

  // Check exact match first
  if (pathMapping[reqPath]) {
    return pathMapping[reqPath];
  }

  // Check partial matches
  for (const [path, programId] of Object.entries(pathMapping)) {
    if (reqPath.startsWith(path)) {
      return programId;
    }
  }

  // Check API routes
  if (reqPath.startsWith('/user')) return 'PROG-USERS';
  if (reqPath.startsWith('/role')) return 'PROG-ROLES';
  if (reqPath.startsWith('/menu')) return 'PROG-MENUS';
  if (reqPath.startsWith('/program')) return 'PROG-PROGRAMS';
  if (reqPath.startsWith('/log')) return 'PROG-LOGS';

  return 'PROG-SYSTEM';
}

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
      programId: getProgramIdFromPath(req.path),
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
 * Append log entry to file with queue to prevent race conditions
 */
async function appendLog(logEntry) {
  // Add to write queue to prevent concurrent writes
  writeQueue = writeQueue.then(async () => {
    try {
      let logs = [];
      try {
        const data = await fs.readFile(LOG_FILE, 'utf8');
        logs = JSON.parse(data);
        if (!Array.isArray(logs)) {
          console.warn('Log file corrupted, resetting to empty array');
          logs = [];
        }
      } catch (error) {
        // File doesn't exist or is empty
        console.log('Creating new log file');
        logs = [];
      }

      logs.push(logEntry);

      // Keep only last MAX_LOGS entries
      if (logs.length > MAX_LOGS) {
        logs = logs.slice(-MAX_LOGS);
      }

      await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2));

      // Update cache
      cachedLogs = logs;
      cacheTimestamp = Date.now();
    } catch (error) {
      console.error('Error writing log file:', error);
      throw error;
    }
  }).catch(error => {
    console.error('Write queue error:', error);
  });

  return writeQueue;
}

/**
 * Get logs with filtering
 */
async function getLogs(filters = {}) {
  try {
    // Use cache if available and recent
    if (cachedLogs && (Date.now() - cacheTimestamp) < CACHE_TTL) {
      let logs = [...cachedLogs];
      return applyFilters(logs, filters);
    }

    const data = await fs.readFile(LOG_FILE, 'utf8');
    let logs = JSON.parse(data);

    if (!Array.isArray(logs)) {
      console.warn('Log file corrupted');
      return [];
    }

    // Update cache
    cachedLogs = logs;
    cacheTimestamp = Date.now();

    return applyFilters(logs, filters);
  } catch (error) {
    console.error('Error reading logs:', error);
    return [];
  }
}

/**
 * Apply filters to logs array
 */
function applyFilters(logs, filters) {
  let filtered = [...logs];

  if (filters.userId) {
    filtered = filtered.filter(log => log.userId === filters.userId);
  }
  if (filters.path) {
    filtered = filtered.filter(log => log.path && log.path.includes(filters.path));
  }
  if (filters.method) {
    filtered = filtered.filter(log => log.method === filters.method);
  }
  if (filters.programId) {
    filtered = filtered.filter(log => log.programId === filters.programId);
  }
  if (filters.statusCode) {
    filtered = filtered.filter(log => log.statusCode === parseInt(filters.statusCode));
  }
  if (filters.startDate) {
    filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
  }
  if (filters.endDate) {
    filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
  }

  return filtered;
}

module.exports = {
  loggerMiddleware,
  appendLog,
  getLogs
};
