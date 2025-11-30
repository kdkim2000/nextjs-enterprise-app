/**
 * Script to update Phase 1 settings to is_ready=true
 * Run: node backend/scripts/update-phase1-ready.js
 */

const db = require('../config/database');

const phase1Settings = [
  // Basic info (localized)
  'app_name_en',
  'app_name_ko',
  'app_name_zh',
  'app_name_vi',
  'app_version',
  'copyright_text',
  // Organization
  'company_address',
  'company_phone',
  'company_email',
  'support_email',
  'privacy_policy_url',
  'terms_of_service_url'
];

async function updatePhase1Settings() {
  console.log('Updating Phase 1 settings to is_ready=true...\n');

  const placeholders = phase1Settings.map((_, i) => `$${i + 1}`).join(', ');

  try {
    // Update is_ready to true
    const updateQuery = `
      UPDATE app_settings
      SET is_ready = true, updated_at = NOW()
      WHERE key IN (${placeholders})
    `;

    const updateResult = await db.query(updateQuery, phase1Settings);
    console.log(`Updated ${updateResult.rowCount} settings to is_ready=true\n`);

    // Verify
    const verifyQuery = `
      SELECT key, value, is_ready, is_applied
      FROM app_settings
      WHERE key IN (${placeholders})
      ORDER BY key
    `;

    const verifyResult = await db.query(verifyQuery, phase1Settings);

    console.log('Updated settings:');
    console.log('-'.repeat(80));
    verifyResult.rows.forEach(row => {
      const value = row.value?.length > 30 ? row.value.substring(0, 30) + '...' : row.value;
      console.log(`${row.key.padEnd(25)} | Ready: ${row.is_ready ? 'Y' : 'N'} | Applied: ${row.is_applied ? 'Y' : 'N'} | ${value || '(empty)'}`);
    });
    console.log('-'.repeat(80));

    console.log('\nPhase 1 settings update complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating settings:', error);
    process.exit(1);
  }
}

updatePhase1Settings();
