/**
 * Verification Script for PostgreSQL Migration
 * Compares JSON file counts with database table counts
 *
 * Usage: node verify.js
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load configuration
let config;
try {
  config = JSON.parse(fs.readFileSync('./migrate.config.json', 'utf8'));
} catch (error) {
  console.error('Failed to load migrate.config.json');
  process.exit(1);
}

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password
});

const dataPath = config.dataPath || '../backend/data';

function readJsonFile(filename) {
  const filePath = path.join(dataPath, filename);
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    if (Array.isArray(data)) {
      return data;
    } else if (typeof data === 'object' && data !== null) {
      const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
      if (arrayKey) {
        return data[arrayKey];
      }
    }

    return data;
  } catch (error) {
    return null;
  }
}

async function getTableCount(client, tableName) {
  try {
    const result = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
    return parseInt(result.rows[0].count);
  } catch (error) {
    return -1;
  }
}

async function verify() {
  console.log('='.repeat(70));
  console.log('PostgreSQL Migration Verification');
  console.log('='.repeat(70));

  const client = await pool.connect();

  const checks = [
    { file: 'codeTypes.json', table: 'code_types', name: 'Code Types' },
    { file: 'codes.json', table: 'codes', name: 'Codes' },
    { file: 'departments.json', table: 'departments', name: 'Departments' },
    { file: 'roles.json', table: 'roles', name: 'Roles' },
    { file: 'users.json', table: 'users', name: 'Users' },
    { file: 'messages.json', table: 'messages', name: 'Messages' },
    { file: 'menus.json', table: 'menus', name: 'Menus' },
    { file: 'programs.json', table: 'programs', name: 'Programs' },
    { file: 'help.json', table: 'help', name: 'Help' },
    { file: 'permissions.json', table: 'permissions', name: 'Permissions' },
    { file: 'userRoleMappings.json', table: 'user_role_mappings', name: 'User Role Mappings' },
    { file: 'roleMenuMappings.json', table: 'role_menu_mappings', name: 'Role Menu Mappings' },
    { file: 'roleProgramMappings.json', table: 'role_program_mappings', name: 'Role Program Mappings' },
    { file: 'userPreferences.json', table: 'user_preferences', name: 'User Preferences' },
    { file: 'logs.json', table: 'logs', name: 'Logs' }
  ];

  let totalMatches = 0;
  let totalMismatches = 0;

  console.log('');
  console.log('Checking data counts...');
  console.log('-'.repeat(70));
  console.log(
    'Table'.padEnd(25) +
    'JSON Count'.padEnd(15) +
    'DB Count'.padEnd(15) +
    'Status'
  );
  console.log('-'.repeat(70));

  for (const check of checks) {
    const jsonData = readJsonFile(check.file);
    const jsonCount = jsonData ? (Array.isArray(jsonData) ? jsonData.length : 1) : 0;
    const dbCount = await getTableCount(client, check.table);

    const match = jsonCount === dbCount;
    const status = match ? '✓ OK' : '✗ MISMATCH';

    if (match) {
      totalMatches++;
    } else {
      totalMismatches++;
    }

    console.log(
      check.name.padEnd(25) +
      jsonCount.toString().padEnd(15) +
      dbCount.toString().padEnd(15) +
      status
    );
  }

  console.log('-'.repeat(70));
  console.log('');

  // Sample data verification
  console.log('Checking sample data quality...');
  console.log('-'.repeat(70));

  try {
    // Check multi-language columns
    const deptResult = await client.query(`
      SELECT code, name_en, name_ko, name_zh, name_vi
      FROM departments
      LIMIT 3
    `);

    console.log('\n✓ Multi-language columns (departments):');
    deptResult.rows.forEach(row => {
      console.log(`  ${row.code}: en=${!!row.name_en}, ko=${!!row.name_ko}, zh=${!!row.name_zh}, vi=${!!row.name_vi}`);
    });

    // Check JSONB fields
    const codeResult = await client.query(`
      SELECT code, attributes
      FROM codes
      WHERE attributes IS NOT NULL
      LIMIT 3
    `);

    console.log('\n✓ JSONB fields (codes):');
    console.log(`  Found ${codeResult.rows.length} codes with attributes`);

    // Check users
    const userResult = await client.query(`
      SELECT COUNT(*) as active_users
      FROM users
      WHERE status = 'active'
    `);

    console.log('\n✓ User status:');
    console.log(`  Active users: ${userResult.rows[0].active_users}`);

    // Check indexes
    const indexResult = await client.query(`
      SELECT
        schemaname,
        tablename,
        COUNT(*) as index_count
      FROM pg_indexes
      WHERE schemaname = 'public'
      GROUP BY schemaname, tablename
      ORDER BY index_count DESC
      LIMIT 5
    `);

    console.log('\n✓ Index coverage (top 5 tables):');
    indexResult.rows.forEach(row => {
      console.log(`  ${row.tablename}: ${row.index_count} indexes`);
    });

  } catch (error) {
    console.log(`\n✗ Error checking sample data: ${error.message}`);
  }

  console.log('-'.repeat(70));
  console.log('');

  // Summary
  console.log('='.repeat(70));
  console.log('Verification Summary');
  console.log('='.repeat(70));
  console.log(`Total tables checked: ${checks.length}`);
  console.log(`✓ Matches: ${totalMatches}`);
  console.log(`✗ Mismatches: ${totalMismatches}`);
  console.log('');

  if (totalMismatches === 0) {
    console.log('🎉 Migration verification PASSED! All data counts match.');
  } else {
    console.log('⚠ Migration verification FAILED! Some data counts do not match.');
    console.log('Please review the mismatches above and re-run migration if needed.');
  }

  console.log('='.repeat(70));

  client.release();
  await pool.end();

  process.exit(totalMismatches > 0 ? 1 : 0);
}

verify().catch(error => {
  console.error('Verification failed:', error.message);
  process.exit(1);
});
