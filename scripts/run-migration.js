/**
 * Migration runner script
 * Run: node scripts/run-migration.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// Use postgres superuser for migrations (set MIGRATION_USER/MIGRATION_PASSWORD env vars)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'nextjs_enterprise_app',
  user: process.env.MIGRATION_USER || 'postgres',
  password: process.env.MIGRATION_PASSWORD || 'postgres'
});

async function runMigration() {
  const client = await pool.connect();

  try {
    // Get migration file from command line argument or default
    const migrationFileName = process.argv[2] || 'add_attachment_types.sql';
    const migrationFile = path.join(__dirname, '../migration', migrationFileName);
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log(`Running migration: ${migrationFileName}`);
    await client.query(sql);
    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
