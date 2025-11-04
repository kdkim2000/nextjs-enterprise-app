const fs = require('fs').promises;
const path = require('path');

const BLACKLIST_FILE = path.join(__dirname, '../data/tokenBlacklist.json');

// In-memory blacklist for better performance
// In production, consider using Redis for distributed systems
let blacklistCache = new Set();

/**
 * Load blacklist from file into memory on startup
 */
async function loadBlacklist() {
  try {
    const data = await fs.readFile(BLACKLIST_FILE, 'utf8');
    const blacklist = JSON.parse(data);

    // Clean expired tokens
    const now = Date.now();
    const validTokens = blacklist.filter(item => item.expiresAt > now);

    blacklistCache = new Set(validTokens.map(item => item.token));

    // Save cleaned blacklist back to file
    if (validTokens.length !== blacklist.length) {
      await fs.writeFile(BLACKLIST_FILE, JSON.stringify(validTokens, null, 2));
    }

    console.log(`Loaded ${blacklistCache.size} blacklisted tokens`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, create it
      await fs.writeFile(BLACKLIST_FILE, JSON.stringify([], null, 2));
      console.log('Created new token blacklist file');
    } else {
      console.error('Error loading token blacklist:', error);
    }
  }
}

/**
 * Add a token to the blacklist
 * @param {string} token - The token to blacklist
 * @param {number} expiresAt - Timestamp when the token expires (ms)
 */
async function addToBlacklist(token, expiresAt) {
  try {
    // Add to memory cache
    blacklistCache.add(token);

    // Read current blacklist
    let blacklist = [];
    try {
      const data = await fs.readFile(BLACKLIST_FILE, 'utf8');
      blacklist = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is empty
    }

    // Add new token
    blacklist.push({
      token,
      expiresAt,
      blacklistedAt: Date.now()
    });

    // Clean expired tokens before saving
    const now = Date.now();
    blacklist = blacklist.filter(item => item.expiresAt > now);

    // Save to file
    await fs.writeFile(BLACKLIST_FILE, JSON.stringify(blacklist, null, 2));

    console.log(`Token added to blacklist. Total: ${blacklistCache.size}`);
  } catch (error) {
    console.error('Error adding token to blacklist:', error);
    throw new Error('Failed to blacklist token');
  }
}

/**
 * Check if a token is blacklisted
 * @param {string} token - The token to check
 * @returns {boolean} True if token is blacklisted
 */
function isBlacklisted(token) {
  return blacklistCache.has(token);
}

/**
 * Remove expired tokens from blacklist
 * Should be called periodically (e.g., via cron job)
 */
async function cleanExpiredTokens() {
  try {
    const data = await fs.readFile(BLACKLIST_FILE, 'utf8');
    const blacklist = JSON.parse(data);

    const now = Date.now();
    const validTokens = blacklist.filter(item => item.expiresAt > now);

    // Update cache
    blacklistCache = new Set(validTokens.map(item => item.token));

    // Save cleaned blacklist
    await fs.writeFile(BLACKLIST_FILE, JSON.stringify(validTokens, null, 2));

    const removed = blacklist.length - validTokens.length;
    if (removed > 0) {
      console.log(`Cleaned ${removed} expired tokens from blacklist`);
    }

    return removed;
  } catch (error) {
    console.error('Error cleaning expired tokens:', error);
    return 0;
  }
}

/**
 * Get blacklist statistics
 * @returns {Object} Statistics about the blacklist
 */
function getBlacklistStats() {
  return {
    totalTokens: blacklistCache.size,
    cacheSize: blacklistCache.size
  };
}

// Initialize blacklist on module load
loadBlacklist().catch(console.error);

// Clean expired tokens every hour
setInterval(() => {
  cleanExpiredTokens().catch(console.error);
}, 60 * 60 * 1000); // 1 hour

module.exports = {
  addToBlacklist,
  isBlacklisted,
  cleanExpiredTokens,
  getBlacklistStats,
  loadBlacklist
};
