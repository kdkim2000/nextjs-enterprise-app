const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const LOG_FILE = path.join(__dirname, '../data/logs.json');
const MAX_LOGS = 10000; // Keep last 10000 entries
let writeQueue = Promise.resolve();

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

  res.on('finish', async () => {
    const duration = Date.now() - startTime;

    const logEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      url: req.url,
      originalUrl: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.userId || 'anonymous',
      programId: getProgramIdFromPath(req.path),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
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
        logs = [];
      }

      logs.push(logEntry);

      // Keep only last MAX_LOGS entries
      if (logs.length > MAX_LOGS) {
        logs = logs.slice(-MAX_LOGS);
      }

      await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2));
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
 * Get logs with filtering - Optimized for large datasets
 */
async function getLogs(filters = {}) {
  try {
    // Check if log file exists
    try {
      await fs.access(LOG_FILE);
    } catch {
      return [];
    }

    // Get file size to determine loading strategy
    const stats = await fs.stat(LOG_FILE);
    const fileSizeInMB = stats.size / (1024 * 1024);

    console.log(`[Logger] Reading log file (${fileSizeInMB.toFixed(2)} MB)`);

    // For files larger than 50MB, use streaming approach
    if (fileSizeInMB > 50) {
      return await getLogsStreaming(filters);
    }

    // For smaller files, use the fast in-memory approach
    const data = await fs.readFile(LOG_FILE, 'utf8');
    let logs = JSON.parse(data);

    if (!Array.isArray(logs)) {
      console.warn('Log file corrupted');
      return [];
    }

    console.log(`[Logger] Total logs before filtering: ${logs.length}`);

    // Apply filters efficiently
    logs = logs.filter(log => {
      // userId filter
      if (filters.userId && log.userId !== filters.userId) {
        return false;
      }

      // path filter (partial match)
      if (filters.path && (!log.path || !log.path.includes(filters.path))) {
        return false;
      }

      // method filter (can be array or single value)
      if (filters.method) {
        const methods = Array.isArray(filters.method) ? filters.method : [filters.method];
        if (methods.length > 0 && !methods.includes(log.method)) {
          return false;
        }
      }

      // programId filter
      if (filters.programId && log.programId !== filters.programId) {
        return false;
      }

      // statusCode filter
      if (filters.statusCode && log.statusCode !== parseInt(filters.statusCode)) {
        return false;
      }

      // startDate filter
      if (filters.startDate) {
        const logDate = new Date(log.timestamp);
        const startDate = new Date(filters.startDate);
        if (logDate < startDate) {
          return false;
        }
      }

      // endDate filter
      if (filters.endDate) {
        const logDate = new Date(log.timestamp);
        const endDate = new Date(filters.endDate);
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);
        if (logDate > endDate) {
          return false;
        }
      }

      return true;
    });

    console.log(`[Logger] Total logs after filtering: ${logs.length}`);
    return logs;
  } catch (error) {
    console.error('Error reading logs:', error);
    return [];
  }
}

/**
 * Stream-based log reading for very large files
 * Uses readline to read file line by line without loading entire file into memory
 */
async function getLogsStreaming(filters = {}) {
  const readline = require('readline');
  const fsStream = require('fs');

  return new Promise((resolve, reject) => {
    const logs = [];
    let buffer = '';
    let isFirstLine = true;

    const stream = fsStream.createReadStream(LOG_FILE, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      buffer += line;

      // Skip the opening bracket of JSON array
      if (isFirstLine && line.trim() === '[') {
        isFirstLine = false;
        buffer = '';
        return;
      }

      // Try to parse a complete JSON object
      try {
        // Remove trailing comma if present
        const cleanLine = buffer.trim().replace(/,$/, '');
        if (cleanLine && cleanLine !== ']') {
          const log = JSON.parse(cleanLine);

          // Apply filters
          let matches = true;

          if (filters.userId && log.userId !== filters.userId) matches = false;
          if (filters.path && (!log.path || !log.path.includes(filters.path))) matches = false;

          if (filters.method) {
            const methods = Array.isArray(filters.method) ? filters.method : [filters.method];
            if (methods.length > 0 && !methods.includes(log.method)) matches = false;
          }

          if (filters.programId && log.programId !== filters.programId) matches = false;
          if (filters.statusCode && log.statusCode !== parseInt(filters.statusCode)) matches = false;

          if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) matches = false;
          if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999);
            if (new Date(log.timestamp) > endDate) matches = false;
          }

          if (matches) {
            logs.push(log);
          }
        }
        buffer = '';
      } catch (e) {
        // Line is not complete JSON, continue buffering
      }
    });

    rl.on('close', () => {
      console.log(`[Logger] Streaming completed. Found ${logs.length} matching logs`);
      resolve(logs);
    });

    rl.on('error', (error) => {
      console.error('Error streaming logs:', error);
      reject(error);
    });
  });
}

module.exports = {
  loggerMiddleware,
  appendLog,
  getLogs
};
