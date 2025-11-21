/**
 * Performance Testing Script
 *
 * Tests database query performance and generates benchmark reports.
 *
 * Usage:
 *   node scripts/performance-test.js
 */

const db = require('../config/database');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, COLORS.reset);
}

/**
 * Run a query and measure performance
 */
async function measureQuery(name, query, params = []) {
  const start = Date.now();
  try {
    const result = await db.query(query, params);
    const duration = Date.now() - start;

    const color = duration < 50 ? COLORS.green : duration < 100 ? COLORS.yellow : COLORS.red;
    log(color, `  ✓ ${name}: ${duration}ms (${result.rowCount} rows)`);

    return { name, duration, rowCount: result.rowCount, success: true };
  } catch (error) {
    log(COLORS.red, `  ✗ ${name}: Failed - ${error.message}`);
    return { name, duration: 0, rowCount: 0, success: false, error: error.message };
  }
}

/**
 * Test Full-Text Search Performance
 */
async function testFullTextSearch() {
  log(COLORS.cyan, '\n📊 Testing Full-Text Search Performance...\n');

  const searches = [
    { term: 'test', desc: 'Single word' },
    { term: 'john doe', desc: 'Two words' },
    { term: 'admin', desc: 'Common word' },
  ];

  const results = [];

  for (const { term, desc } of searches) {
    log(COLORS.blue, `  Testing: "${term}" (${desc})`);

    // Old method: ILIKE
    const ilikeQuery = `
      SELECT COUNT(*) FROM users
      WHERE loginid ILIKE $1 OR email ILIKE $1 OR name_ko ILIKE $1
    `;
    const ilikeResult = await measureQuery(
      `    ILIKE search`,
      ilikeQuery,
      [`%${term}%`]
    );

    // New method: Full-Text Search
    const ftsQuery = `
      SELECT COUNT(*) FROM users
      WHERE to_tsvector('simple',
        COALESCE(loginid, '') || ' ' ||
        COALESCE(email, '') || ' ' ||
        COALESCE(name_ko, '') || ' ' ||
        COALESCE(name_en, '')
      ) @@ plainto_tsquery('simple', $1)
    `;
    const ftsResult = await measureQuery(
      `    FTS search`,
      ftsQuery,
      [term]
    );

    if (ilikeResult.success && ftsResult.success) {
      const improvement = ((ilikeResult.duration - ftsResult.duration) / ilikeResult.duration * 100).toFixed(1);
      const color = improvement > 0 ? COLORS.green : COLORS.red;
      log(color, `    → Improvement: ${improvement}%`);
    }

    results.push({ term, ilikeResult, ftsResult });
  }

  return results;
}

/**
 * Test Index Performance
 */
async function testIndexPerformance() {
  log(COLORS.cyan, '\n📊 Testing Index Performance...\n');

  const tests = [
    {
      name: 'User by loginid (indexed)',
      query: `SELECT * FROM users WHERE loginid = $1 LIMIT 1`,
      params: ['admin'],
    },
    {
      name: 'User by email (indexed)',
      query: `SELECT * FROM users WHERE email = $1 LIMIT 1`,
      params: ['admin@example.com'],
    },
    {
      name: 'Users by department (indexed)',
      query: `SELECT COUNT(*) FROM users WHERE department = $1`,
      params: ['DEPT-100'],
    },
    {
      name: 'Users by status (indexed)',
      query: `SELECT COUNT(*) FROM users WHERE status = $1`,
      params: ['active'],
    },
    {
      name: 'Logs by timestamp range (indexed)',
      query: `SELECT COUNT(*) FROM logs WHERE timestamp > NOW() - INTERVAL '1 hour'`,
      params: [],
    },
    {
      name: 'Logs by user_id (indexed)',
      query: `SELECT COUNT(*) FROM logs WHERE user_id = $1`,
      params: ['user-1'],
    },
  ];

  const results = [];
  for (const test of tests) {
    const result = await measureQuery(test.name, test.query, test.params);
    results.push(result);
  }

  return results;
}

/**
 * Test JOIN Performance
 */
async function testJoinPerformance() {
  log(COLORS.cyan, '\n📊 Testing JOIN Performance...\n');

  const tests = [
    {
      name: 'User-Role JOIN',
      query: `
        SELECT u.loginid, r.name
        FROM users u
        INNER JOIN user_role_mappings urm ON u.id = urm.user_id
        INNER JOIN roles r ON urm.role_id = r.id
        LIMIT 100
      `,
    },
    {
      name: 'Role-Menu JOIN',
      query: `
        SELECT r.name, m.name_en
        FROM roles r
        INNER JOIN role_menu_mappings rmm ON r.id = rmm.role_id
        INNER JOIN menus m ON rmm.menu_id = m.id
        LIMIT 100
      `,
    },
  ];

  const results = [];
  for (const test of tests) {
    const result = await measureQuery(test.name, test.query);
    results.push(result);
  }

  return results;
}

/**
 * Test Connection Pool
 */
async function testConnectionPool() {
  log(COLORS.cyan, '\n📊 Testing Connection Pool...\n');

  const poolStatus = db.getPoolStatus();
  log(COLORS.blue, `  Total connections: ${poolStatus.total}`);
  log(COLORS.blue, `  Idle connections: ${poolStatus.idle}`);
  log(COLORS.blue, `  Waiting requests: ${poolStatus.waiting}`);

  // Run concurrent queries
  const concurrentQueries = 20;
  log(COLORS.blue, `\n  Running ${concurrentQueries} concurrent queries...`);

  const start = Date.now();
  const promises = Array(concurrentQueries).fill(null).map(() =>
    db.query('SELECT COUNT(*) FROM users')
  );

  await Promise.all(promises);
  const duration = Date.now() - start;

  log(COLORS.green, `  ✓ Completed in ${duration}ms (avg ${(duration / concurrentQueries).toFixed(1)}ms per query)`);

  const finalStatus = db.getPoolStatus();
  log(COLORS.blue, `  Final pool status: ${finalStatus.total} total, ${finalStatus.idle} idle`);
}

/**
 * Test Table Sizes
 */
async function testTableSizes() {
  log(COLORS.cyan, '\n📊 Table Sizes and Statistics...\n');

  const query = `
    SELECT
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
      n_live_tup as row_count
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    LIMIT 10
  `;

  const result = await db.query(query);

  console.log('\n  Top 10 Largest Tables:');
  result.rows.forEach(row => {
    console.log(`    ${row.tablename.padEnd(25)} ${row.size.padEnd(10)} (${row.row_count.toLocaleString()} rows)`);
  });
}

/**
 * Test Index Usage
 */
async function testIndexUsage() {
  log(COLORS.cyan, '\n📊 Index Usage Statistics...\n');

  const query = `
    SELECT
      schemaname,
      tablename,
      indexname,
      idx_scan as scans,
      pg_size_pretty(pg_relation_size(indexrelid)) as size
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
    ORDER BY idx_scan DESC
    LIMIT 15
  `;

  const result = await db.query(query);

  console.log('\n  Top 15 Most Used Indexes:');
  result.rows.forEach(row => {
    const color = row.scans > 1000 ? COLORS.green : row.scans > 100 ? COLORS.yellow : COLORS.red;
    log(color, `    ${row.indexname.padEnd(40)} ${row.scans.toString().padEnd(8)} scans (${row.size})`);
  });

  // Find unused indexes
  const unusedQuery = `
    SELECT
      schemaname,
      tablename,
      indexname,
      pg_size_pretty(pg_relation_size(indexrelid)) as size
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
      AND idx_scan = 0
    ORDER BY pg_relation_size(indexrelid) DESC
  `;

  const unusedResult = await db.query(unusedQuery);

  if (unusedResult.rowCount > 0) {
    log(COLORS.yellow, `\n  ⚠️  ${unusedResult.rowCount} Unused Indexes Found:`);
    unusedResult.rows.forEach(row => {
      console.log(`    ${row.indexname.padEnd(40)} (${row.size}) - Consider removing`);
    });
  } else {
    log(COLORS.green, '\n  ✓ All indexes are being used!');
  }
}

/**
 * Main function
 */
async function main() {
  console.log('═'.repeat(70));
  log(COLORS.cyan, '  PERFORMANCE TEST SUITE');
  console.log('═'.repeat(70));

  try {
    // Test database connection
    await db.testConnection();

    // Run all tests
    await testFullTextSearch();
    await testIndexPerformance();
    await testJoinPerformance();
    await testConnectionPool();
    await testTableSizes();
    await testIndexUsage();

    console.log('\n' + '═'.repeat(70));
    log(COLORS.green, '  ✓ All tests completed successfully!');
    console.log('═'.repeat(70) + '\n');

    process.exit(0);
  } catch (error) {
    log(COLORS.red, '\n✗ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
main();
