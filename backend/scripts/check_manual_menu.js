/**
 * Script to check manual menu in the database
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'nextjs_enterprise_app',
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'AppUser2024!'
});

async function checkManualMenu() {
  const client = await pool.connect();
  try {
    console.log('Checking for manual menu...\n');

    // Check for manual menu
    const result = await client.query(
      "SELECT id, code, name_en, name_ko, icon, path FROM menus WHERE code ILIKE '%manual%'"
    );

    if (result.rows.length === 0) {
      console.log('No menu with "manual" code found');

      // List all menus
      const allMenus = await client.query(
        "SELECT id, code, name_en, icon FROM menus ORDER BY code LIMIT 30"
      );
      console.log('\nAll menus in database:');
      allMenus.rows.forEach(m => {
        console.log(`  ${m.code}: ${m.name_en} (icon: ${m.icon})`);
      });
    } else {
      console.log('Found manual menu:');
      result.rows.forEach(m => {
        console.log(`  ID: ${m.id}`);
        console.log(`  Code: ${m.code}`);
        console.log(`  Name: ${m.name_en} / ${m.name_ko}`);
        console.log(`  Icon: ${m.icon}`);
        console.log(`  Path: ${m.path}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

checkManualMenu().catch(console.error);
