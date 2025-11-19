/**
 * Script to clear expired tokens from the blacklist
 * Run this if users are getting 401 errors with valid credentials
 */

require('dotenv').config();
const { Pool } = require('pg');

async function clearBlacklist() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'nextjs_enterprise_app',
    user: process.env.DB_USER || 'app_user',
    password: process.env.DB_PASSWORD || 'app_password',
  });

  try {
    console.log('Connecting to database...');

    // Check current blacklist count
    const countResult = await pool.query('SELECT COUNT(*) FROM token_blacklist');
    const beforeCount = parseInt(countResult.rows[0].count);
    console.log(`Current blacklisted tokens: ${beforeCount}`);

    if (beforeCount === 0) {
      console.log('No tokens to clear.');
      return;
    }

    // Option 1: Clear expired tokens only
    const expiredResult = await pool.query(
      'DELETE FROM token_blacklist WHERE expires_at <= NOW() RETURNING *'
    );
    console.log(`✓ Cleared ${expiredResult.rowCount} expired tokens`);

    // Option 2: Clear ALL tokens (uncomment if needed)
    // const allResult = await pool.query('DELETE FROM token_blacklist RETURNING *');
    // console.log(`✓ Cleared ALL ${allResult.rowCount} blacklisted tokens`);

    // Check final count
    const finalCountResult = await pool.query('SELECT COUNT(*) FROM token_blacklist');
    const afterCount = parseInt(finalCountResult.rows[0].count);
    console.log(`Remaining blacklisted tokens: ${afterCount}`);

    console.log('\n✅ Done! You may need to clear localStorage and re-login.');
    console.log('In browser console, run: localStorage.clear(); window.location.reload();');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

clearBlacklist();
