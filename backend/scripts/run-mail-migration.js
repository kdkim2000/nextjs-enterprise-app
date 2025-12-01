/**
 * Run mail system migration
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'nextjs_enterprise_app',
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'AppUser2024!'
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting mail system migration...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../../migration/create_mail_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Run migration
    await client.query(migrationSQL);
    console.log('✅ Mail system tables created successfully\n');

    // Run attachment type migration
    const attachmentPath = path.join(__dirname, '../../migration/add_mail_attachment_type.sql');
    const attachmentSQL = fs.readFileSync(attachmentPath, 'utf8');

    const attachResult = await client.query(attachmentSQL);
    console.log('✅ MAIL attachment type added successfully\n');
    if (attachResult.rows && attachResult.rows.length > 0) {
      console.log('   MAIL attachment type:', attachResult.rows[0]);
    }

    // Verify tables
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'mail_%'
      ORDER BY table_name
    `);

    console.log('📋 Created mail tables:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Verify folder counts
    const folderCount = await client.query(`
      SELECT COUNT(DISTINCT user_id) as users_with_folders,
             COUNT(*) as total_folders
      FROM mail_folders
    `);
    console.log(`\n📁 Mail folders: ${folderCount.rows[0].total_folders} folders for ${folderCount.rows[0].users_with_folders} users`);

    // Verify attachment type
    const attachmentType = await client.query(`
      SELECT code, name, name_ko, max_file_size, max_files
      FROM attachment_types
      WHERE code = 'MAIL'
    `);

    if (attachmentType.rows.length > 0) {
      const at = attachmentType.rows[0];
      console.log(`\n📎 Attachment type: ${at.code} (${at.name_ko})`);
      console.log(`   Max file size: ${(at.max_file_size / 1024 / 1024).toFixed(0)}MB`);
      console.log(`   Max files: ${at.max_files}`);
    }

    console.log('\n✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.detail) console.error('   Detail:', error.detail);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
