/**
 * Script to FORCE clear ALL tokens from the blacklist
 * Use this when users are locked out due to blacklisted tokens
 */

require('dotenv').config();
const { Pool } = require('pg');

async function forceClearBlacklist() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'nextjs_enterprise_app',
    user: process.env.DB_USER || 'app_user',
    password: process.env.DB_PASSWORD || 'app_password',
  });

  try {
    console.log('⚠️  WARNING: This will clear ALL blacklisted tokens!\n');
    console.log('Connecting to database...');

    // Check current blacklist count
    const countResult = await pool.query('SELECT COUNT(*) FROM token_blacklist');
    const beforeCount = parseInt(countResult.rows[0].count);
    console.log(`Current blacklisted tokens: ${beforeCount}`);

    if (beforeCount === 0) {
      console.log('✓ No tokens to clear.');
      return;
    }

    // Clear ALL tokens
    const allResult = await pool.query('DELETE FROM token_blacklist RETURNING *');
    console.log(`\n✓ Cleared ALL ${allResult.rowCount} blacklisted tokens`);

    // Verify
    const finalCountResult = await pool.query('SELECT COUNT(*) FROM token_blacklist');
    const afterCount = parseInt(finalCountResult.rows[0].count);
    console.log(`Remaining blacklisted tokens: ${afterCount}`);

    console.log('\n✅ Blacklist cleared successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. In your browser console (F12), run:');
    console.log('   localStorage.clear();');
    console.log('   window.location.reload();');
    console.log('2. Log in again with your credentials');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

forceClearBlacklist();
