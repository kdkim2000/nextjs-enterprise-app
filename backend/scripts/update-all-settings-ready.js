/**
 * Script to update ALL settings to is_ready=true
 * Run: node backend/scripts/update-all-settings-ready.js
 */

const db = require('../config/database');

async function updateAllSettingsReady() {
  console.log('Updating ALL settings to is_ready=true...\n');

  try {
    // First, get count of settings before update
    const beforeResult = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_ready = true THEN 1 ELSE 0 END) as ready_count,
        SUM(CASE WHEN is_ready = false THEN 1 ELSE 0 END) as not_ready_count
      FROM app_settings
    `);

    const before = beforeResult.rows[0];
    console.log('Before update:');
    console.log(`  Total: ${before.total}`);
    console.log(`  Ready: ${before.ready_count}`);
    console.log(`  Not Ready: ${before.not_ready_count}`);
    console.log('');

    // Update all settings to is_ready=true
    const updateResult = await db.query(`
      UPDATE app_settings
      SET is_ready = true, updated_at = NOW()
      WHERE is_ready = false
    `);

    console.log(`Updated ${updateResult.rowCount} settings to is_ready=true\n`);

    // Get count after update
    const afterResult = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_ready = true THEN 1 ELSE 0 END) as ready_count,
        SUM(CASE WHEN is_applied = true THEN 1 ELSE 0 END) as applied_count
      FROM app_settings
    `);

    const after = afterResult.rows[0];
    console.log('After update:');
    console.log(`  Total: ${after.total}`);
    console.log(`  Ready: ${after.ready_count}`);
    console.log(`  Applied: ${after.applied_count}`);
    console.log('');

    // Show summary by category
    const categoryResult = await db.query(`
      SELECT
        category,
        COUNT(*) as total,
        SUM(CASE WHEN is_ready = true THEN 1 ELSE 0 END) as ready,
        SUM(CASE WHEN is_applied = true THEN 1 ELSE 0 END) as applied
      FROM app_settings
      GROUP BY category
      ORDER BY category
    `);

    console.log('Settings by category:');
    console.log('-'.repeat(60));
    console.log('Category'.padEnd(20) + 'Total'.padEnd(10) + 'Ready'.padEnd(10) + 'Applied');
    console.log('-'.repeat(60));

    categoryResult.rows.forEach(row => {
      console.log(
        row.category.padEnd(20) +
        row.total.toString().padEnd(10) +
        row.ready.toString().padEnd(10) +
        row.applied.toString()
      );
    });
    console.log('-'.repeat(60));

    console.log('\nAll settings updated to is_ready=true!');
    console.log('You can now set is_applied=true in the admin UI to activate each setting.');

    process.exit(0);
  } catch (error) {
    console.error('Error updating settings:', error);
    process.exit(1);
  }
}

updateAllSettingsReady();
