/**
 * Data Migration Script from JSON to PostgreSQL
 * Migrates backend/data JSON files to PostgreSQL database
 *
 * Usage:
 *   node migrate.js [options]
 *
 * Options:
 *   --config <path>   Path to config file (default: ./migrate.config.json)
 *   --dry-run        Simulate migration without actual database operations
 *   --table <name>   Migrate specific table only
 *   --batch <size>   Batch size for bulk inserts (default: 1000)
 *   --verbose        Show detailed logs
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// ==========================================
// Configuration
// ==========================================
const args = process.argv.slice(2);
const configPath = args.find((arg, i) => args[i - 1] === '--config') || './migrate.config.json';
const isDryRun = args.includes('--dry-run');
const targetTable = args.find((arg, i) => args[i - 1] === '--table');
const batchSize = parseInt(args.find((arg, i) => args[i - 1] === '--batch')) || 1000;
const isVerbose = args.includes('--verbose');

let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error(`Failed to load config file: ${configPath}`);
  console.error('Please create migrate.config.json with database connection settings.');
  process.exit(1);
}

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const dataPath = config.dataPath || '../backend/data';

// ==========================================
// Utility Functions
// ==========================================
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '✓',
    warn: '⚠',
    error: '✗',
    verbose: '→'
  }[level] || 'ℹ';

  if (level === 'verbose' && !isVerbose) return;

  console.log(`${timestamp} ${prefix} ${message}`);
}

function readJsonFile(filename) {
  const filePath = path.join(dataPath, filename);
  try {
    if (!fs.existsSync(filePath)) {
      log(`File not found: ${filePath}`, 'warn');
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    // Handle both array and object with array property
    if (Array.isArray(data)) {
      return data;
    } else if (typeof data === 'object' && data !== null) {
      // Find the first array property
      const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
      if (arrayKey) {
        return data[arrayKey];
      }
    }

    return data;
  } catch (error) {
    log(`Error reading ${filename}: ${error.message}`, 'error');
    return null;
  }
}

async function executeBatch(client, query, values, tableName) {
  if (isDryRun) {
    log(`[DRY-RUN] Would insert ${values.length} rows into ${tableName}`, 'verbose');
    return { rowCount: values.length };
  }

  try {
    const result = await client.query(query, values);
    return result;
  } catch (error) {
    log(`Error inserting into ${tableName}: ${error.message}`, 'error');
    log(`Query: ${query.substring(0, 200)}...`, 'verbose');
    throw error;
  }
}

function formatMultiLang(obj, fieldName) {
  if (!obj || typeof obj !== 'object') return {};

  return {
    [`${fieldName}_en`]: obj.en || null,
    [`${fieldName}_ko`]: obj.ko || null,
    [`${fieldName}_zh`]: obj.zh || null,
    [`${fieldName}_vi`]: obj.vi || null
  };
}

function safeJsonStringify(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value;
}

// ==========================================
// Migration Functions
// ==========================================

async function migrateCodeTypes(client) {
  log('Migrating code_types table...');
  const data = readJsonFile('codeTypes.json');
  if (!data || data.length === 0) {
    log('No data to migrate for code_types', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  for (const item of data) {
    try {
      const query = `
        INSERT INTO code_types (
          id, code, name_en, name_ko, name_zh, name_vi,
          description_en, description_ko, description_zh, description_vi,
          "order", status, category, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `;

      const nameFields = formatMultiLang(item.name, 'name');
      const descFields = formatMultiLang(item.description, 'description');

      const values = [
        item.id,
        item.code,
        nameFields.name_en,
        nameFields.name_ko,
        nameFields.name_zh,
        nameFields.name_vi,
        descFields.description_en,
        descFields.description_ko,
        descFields.description_zh,
        descFields.description_vi,
        item.order || null,
        item.status || 'active',
        item.category || null,
        item.createdAt || new Date().toISOString(),
        item.updatedAt || new Date().toISOString()
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted code_type: ${item.code}`, 'verbose');
    } catch (error) {
      log(`Failed to insert code_type ${item.code}: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`code_types: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migrateCodes(client) {
  log('Migrating codes table...');
  const data = readJsonFile('codes.json');
  if (!data || data.length === 0) {
    log('No data to migrate for codes', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  for (const item of data) {
    try {
      const query = `
        INSERT INTO codes (
          id, code_type, code, name_en, name_ko, name_zh, name_vi,
          description_en, description_ko, description_zh, description_vi,
          "order", status, parent_code, attributes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `;

      const nameFields = formatMultiLang(item.name, 'name');
      const descFields = formatMultiLang(item.description, 'description');

      const values = [
        item.id,
        item.codeType,
        item.code,
        nameFields.name_en,
        nameFields.name_ko,
        nameFields.name_zh,
        nameFields.name_vi,
        descFields.description_en,
        descFields.description_ko,
        descFields.description_zh,
        descFields.description_vi,
        item.order || null,
        item.status || 'active',
        item.parentCode || null,
        safeJsonStringify(item.attributes),
        item.createdAt || new Date().toISOString(),
        item.updatedAt || new Date().toISOString()
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted code: ${item.code}`, 'verbose');
    } catch (error) {
      log(`Failed to insert code ${item.code}: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`codes: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migrateDepartments(client) {
  log('Migrating departments table...');
  const data = readJsonFile('departments.json');
  if (!data || data.length === 0) {
    log('No data to migrate for departments', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  for (const item of data) {
    try {
      const query = `
        INSERT INTO departments (
          id, code, name_en, name_ko, name_zh, name_vi,
          description_en, description_ko, description_zh, description_vi,
          parent_id, manager_id, level, "order", status, email, phone, location,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      `;

      const nameFields = formatMultiLang(item.name, 'name');
      const descFields = formatMultiLang(item.description, 'description');

      const values = [
        item.id,
        item.code,
        nameFields.name_en,
        nameFields.name_ko,
        nameFields.name_zh,
        nameFields.name_vi,
        descFields.description_en,
        descFields.description_ko,
        descFields.description_zh,
        descFields.description_vi,
        item.parentId || null,
        item.managerId || null,
        item.level || 0,
        item.order || null,
        item.status || 'active',
        item.email || null,
        item.phone || null,
        item.location || null,
        item.createdAt || new Date().toISOString(),
        item.updatedAt || new Date().toISOString()
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted department: ${item.code}`, 'verbose');
    } catch (error) {
      log(`Failed to insert department ${item.code}: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`departments: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migrateRoles(client) {
  log('Migrating roles table...');
  const data = readJsonFile('roles.json');
  if (!data || data.length === 0) {
    log('No data to migrate for roles', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  for (const item of data) {
    try {
      const query = `
        INSERT INTO roles (
          id, name, display_name, description, role_type, manager, representative,
          is_system, is_active, created_at, updated_at, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;

      const values = [
        item.id,
        item.name,
        item.displayName || null,
        item.description || null,
        item.roleType || null,
        item.manager || null,
        item.representative || null,
        item.isSystem || false,
        item.isActive !== undefined ? item.isActive : true,
        item.createdAt || new Date().toISOString(),
        item.updatedAt || new Date().toISOString(),
        item.createdBy || null,
        item.updatedBy || null
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted role: ${item.name}`, 'verbose');
    } catch (error) {
      log(`Failed to insert role ${item.name}: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`roles: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migrateUsers(client) {
  log('Migrating users table...');
  const data = readJsonFile('users.json');
  if (!data || data.length === 0) {
    log('No data to migrate for users', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  for (const item of data) {
    try {
      const query = `
        INSERT INTO users (
          id, username, password, email, name, role, department,
          mfa_enabled, sso_enabled, status, created_at, last_login, avatar_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;

      const values = [
        item.id,
        item.username,
        item.password || null,
        item.email || null,
        item.name || null,
        item.role || null,
        item.department || null,
        item.mfaEnabled || false,
        item.ssoEnabled || false,
        item.status || 'active',
        item.createdAt || new Date().toISOString(),
        item.lastLogin || null,
        item.avatarUrl || null
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted user: ${item.username}`, 'verbose');
    } catch (error) {
      log(`Failed to insert user ${item.username}: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`users: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migrateMessages(client) {
  log('Migrating messages table...');
  const data = readJsonFile('messages.json');
  if (!data || data.length === 0) {
    log('No data to migrate for messages', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  for (const item of data) {
    try {
      const query = `
        INSERT INTO messages (
          id, code, category, type, message_en, message_ko, message_zh, message_vi,
          description_en, description_ko, description_zh, description_vi,
          status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `;

      const messageFields = formatMultiLang(item.message, 'message');
      const descFields = formatMultiLang(item.description, 'description');

      const values = [
        item.id,
        item.code,
        item.category || null,
        item.type || null,
        messageFields.message_en,
        messageFields.message_ko,
        messageFields.message_zh,
        messageFields.message_vi,
        descFields.description_en,
        descFields.description_ko,
        descFields.description_zh,
        descFields.description_vi,
        item.status || 'active',
        item.createdAt || new Date().toISOString(),
        item.updatedAt || new Date().toISOString()
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted message: ${item.code}`, 'verbose');
    } catch (error) {
      log(`Failed to insert message ${item.code}: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`messages: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migrateMenus(client) {
  log('Migrating menus table...');
  const data = readJsonFile('menus.json');
  if (!data || data.length === 0) {
    log('No data to migrate for menus', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  for (const item of data) {
    try {
      const query = `
        INSERT INTO menus (
          id, code, name_en, name_ko, name_zh, name_vi,
          description_en, description_ko, description_zh, description_vi,
          path, icon, "order", parent_id, level, program_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `;

      const nameFields = formatMultiLang(item.name, 'name');
      const descFields = formatMultiLang(item.description, 'description');

      const values = [
        item.id,
        item.code,
        nameFields.name_en,
        nameFields.name_ko,
        nameFields.name_zh,
        nameFields.name_vi,
        descFields.description_en,
        descFields.description_ko,
        descFields.description_zh,
        descFields.description_vi,
        item.path || null,
        item.icon || null,
        item.order || null,
        item.parentId || null,
        item.level || 0,
        item.programId || null
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted menu: ${item.code}`, 'verbose');
    } catch (error) {
      log(`Failed to insert menu ${item.code}: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`menus: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migratePrograms(client) {
  log('Migrating programs table...');
  const data = readJsonFile('programs.json');
  if (!data || data.length === 0) {
    log('No data to migrate for programs', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  for (const item of data) {
    try {
      const query = `
        INSERT INTO programs (
          id, code, name_en, name_ko, name_zh, name_vi,
          description_en, description_ko, description_zh, description_vi,
          category, type, status, permissions, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `;

      const nameFields = formatMultiLang(item.name, 'name');
      const descFields = formatMultiLang(item.description, 'description');

      const values = [
        item.id,
        item.code,
        nameFields.name_en,
        nameFields.name_ko,
        nameFields.name_zh,
        nameFields.name_vi,
        descFields.description_en,
        descFields.description_ko,
        descFields.description_zh,
        descFields.description_vi,
        item.category || null,
        item.type || null,
        item.status || 'active',
        safeJsonStringify(item.permissions),
        item.createdAt || new Date().toISOString(),
        item.updatedAt || new Date().toISOString()
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted program: ${item.code}`, 'verbose');
    } catch (error) {
      log(`Failed to insert program ${item.code}: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`programs: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migrateHelp(client) {
  log('Migrating help table...');
  const data = readJsonFile('help.json');
  if (!data || data.length === 0) {
    log('No data to migrate for help', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  for (const item of data) {
    try {
      const query = `
        INSERT INTO help (
          id, program_id, title, content, sections, faq, tips, troubleshooting,
          video_url, related_topics, created_at, updated_at, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `;

      const values = [
        item.id,
        item.programId || null,
        item.title || null,
        item.content || null,
        safeJsonStringify(item.sections),
        safeJsonStringify(item.faq),
        safeJsonStringify(item.tips),
        safeJsonStringify(item.troubleshooting),
        item.videoUrl || null,
        safeJsonStringify(item.relatedTopics),
        item.createdAt || new Date().toISOString(),
        item.updatedAt || new Date().toISOString(),
        item.createdBy || null,
        item.updatedBy || null
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted help: ${item.id}`, 'verbose');
    } catch (error) {
      log(`Failed to insert help ${item.id}: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`help: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migratePermissions(client) {
  log('Migrating permissions table...');
  const data = readJsonFile('permissions.json');
  if (!data || data.length === 0) {
    log('No data to migrate for permissions', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  for (const item of data) {
    try {
      const query = `
        INSERT INTO permissions (
          user_id, role, permissions, menu_access, updated_at
        ) VALUES ($1, $2, $3, $4, $5)
      `;

      const values = [
        item.userId,
        item.role || null,
        safeJsonStringify(item.permissions),
        safeJsonStringify(item.menuAccess),
        item.updatedAt || new Date().toISOString()
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted permission for user: ${item.userId}`, 'verbose');
    } catch (error) {
      log(`Failed to insert permission for user ${item.userId}: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`permissions: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migrateUserRoleMappings(client) {
  log('Migrating user_role_mappings table...');
  const data = readJsonFile('userRoleMappings.json');
  if (!data || data.length === 0) {
    log('No data to migrate for user_role_mappings', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  for (const item of data) {
    try {
      const query = `
        INSERT INTO user_role_mappings (
          id, user_id, role_id, assigned_by, assigned_at, expires_at, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      const values = [
        item.id,
        item.userId,
        item.roleId,
        item.assignedBy || null,
        item.assignedAt || new Date().toISOString(),
        item.expiresAt || null,
        item.isActive !== undefined ? item.isActive : true
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted user_role_mapping: ${item.id}`, 'verbose');
    } catch (error) {
      log(`Failed to insert user_role_mapping ${item.id}: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`user_role_mappings: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migrateRoleMenuMappings(client) {
  log('Migrating role_menu_mappings table...');
  const data = readJsonFile('roleMenuMappings.json');
  if (!data || data.length === 0) {
    log('No data to migrate for role_menu_mappings', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  for (const item of data) {
    try {
      const query = `
        INSERT INTO role_menu_mappings (
          id, role_id, menu_id, can_view, can_create, can_update, can_delete,
          created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;

      const values = [
        item.id,
        item.roleId,
        item.menuId,
        item.canView || false,
        item.canCreate || false,
        item.canUpdate || false,
        item.canDelete || false,
        item.createdBy || null,
        item.createdAt || new Date().toISOString()
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted role_menu_mapping: ${item.id}`, 'verbose');
    } catch (error) {
      log(`Failed to insert role_menu_mapping ${item.id}: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`role_menu_mappings: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migrateRoleProgramMappings(client) {
  log('Migrating role_program_mappings table...');
  const data = readJsonFile('roleProgramMappings.json');
  if (!data || data.length === 0) {
    log('No data to migrate for role_program_mappings', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  for (const item of data) {
    try {
      const query = `
        INSERT INTO role_program_mappings (
          id, role_id, program_id, can_view, can_create, can_update, can_delete,
          created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;

      const values = [
        item.id,
        item.roleId,
        item.programId,
        item.canView || false,
        item.canCreate || false,
        item.canUpdate || false,
        item.canDelete || false,
        item.createdBy || null,
        item.createdAt || new Date().toISOString()
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted role_program_mapping: ${item.id}`, 'verbose');
    } catch (error) {
      log(`Failed to insert role_program_mapping ${item.id}: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`role_program_mappings: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migrateUserPreferences(client) {
  log('Migrating user_preferences table...');
  const data = readJsonFile('userPreferences.json');
  if (!data || data.length === 0) {
    log('No data to migrate for user_preferences', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  for (const item of data) {
    try {
      const query = `
        INSERT INTO user_preferences (
          user_id, favorite_menus, recent_menus, language, theme, rows_per_page,
          email_notifications, system_notifications, session_timeout, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;

      const values = [
        item.userId,
        safeJsonStringify(item.favoriteMenus),
        safeJsonStringify(item.recentMenus),
        item.language || 'en',
        item.theme || 'light',
        item.rowsPerPage || 10,
        item.emailNotifications !== undefined ? item.emailNotifications : true,
        item.systemNotifications !== undefined ? item.systemNotifications : true,
        item.sessionTimeout || 30,
        item.updatedAt || new Date().toISOString()
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted user_preference for: ${item.userId}`, 'verbose');
    } catch (error) {
      log(`Failed to insert user_preference for ${item.userId}: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`user_preferences: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migrateLogs(client) {
  log('Migrating logs table...');
  const data = readJsonFile('logs.json');
  if (!data || data.length === 0) {
    log('No data to migrate for logs', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;
  const batches = [];

  for (let i = 0; i < data.length; i += batchSize) {
    batches.push(data.slice(i, i + batchSize));
  }

  log(`Processing ${batches.length} batches of logs...`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    for (const item of batch) {
      try {
        const query = `
          INSERT INTO logs (
            id, timestamp, method, path, url, original_url, status_code, duration,
            user_id, program_id, ip, user_agent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `;

        const values = [
          item.id,
          item.timestamp || new Date().toISOString(),
          item.method || null,
          item.path || null,
          item.url || null,
          item.originalUrl || null,
          item.statusCode || null,
          item.duration || null,
          item.userId || null,
          item.programId || null,
          item.ip || null,
          item.userAgent || null
        ];

        if (!isDryRun) {
          await client.query(query, values);
        }
        success++;
      } catch (error) {
        log(`Failed to insert log ${item.id}: ${error.message}`, 'error');
        failed++;
      }
    }

    log(`Processed batch ${i + 1}/${batches.length} (${success} records)`, 'verbose');
  }

  log(`logs: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migrateTokenBlacklist(client) {
  log('Migrating token_blacklist table...');
  const data = readJsonFile('tokenBlacklist.json');
  if (!data || data.length === 0 || (Array.isArray(data) && data.length === 0)) {
    log('No data to migrate for token_blacklist', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  const items = Array.isArray(data) ? data : [data];

  for (const item of items) {
    try {
      const query = `
        INSERT INTO token_blacklist (
          token, user_id, expires_at, created_at
        ) VALUES ($1, $2, $3, $4)
      `;

      const values = [
        item.token,
        item.userId || null,
        item.expiresAt || null,
        item.createdAt || new Date().toISOString()
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted token_blacklist entry`, 'verbose');
    } catch (error) {
      log(`Failed to insert token_blacklist: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`token_blacklist: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

async function migrateMfaCodes(client) {
  log('Migrating mfa_codes table...');
  const data = readJsonFile('mfaCodes.json');
  if (!data || data.length === 0 || (Array.isArray(data) && data.length === 0)) {
    log('No data to migrate for mfa_codes', 'warn');
    return { success: 0, failed: 0 };
  }

  let success = 0, failed = 0;

  const items = Array.isArray(data) ? data : [data];

  for (const item of items) {
    try {
      const query = `
        INSERT INTO mfa_codes (
          user_id, secret, backup_codes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5)
      `;

      const values = [
        item.userId,
        item.secret || null,
        safeJsonStringify(item.backupCodes),
        item.createdAt || new Date().toISOString(),
        item.updatedAt || new Date().toISOString()
      ];

      if (!isDryRun) {
        await client.query(query, values);
      }
      success++;
      log(`Inserted mfa_code for user: ${item.userId}`, 'verbose');
    } catch (error) {
      log(`Failed to insert mfa_code: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`mfa_codes: ${success} succeeded, ${failed} failed`);
  return { success, failed };
}

// ==========================================
// Main Migration Process
// ==========================================

const migrations = {
  code_types: migrateCodeTypes,
  codes: migrateCodes,
  departments: migrateDepartments,
  roles: migrateRoles,
  users: migrateUsers,
  messages: migrateMessages,
  menus: migrateMenus,
  programs: migratePrograms,
  help: migrateHelp,
  permissions: migratePermissions,
  user_role_mappings: migrateUserRoleMappings,
  role_menu_mappings: migrateRoleMenuMappings,
  role_program_mappings: migrateRoleProgramMappings,
  user_preferences: migrateUserPreferences,
  logs: migrateLogs,
  token_blacklist: migrateTokenBlacklist,
  mfa_codes: migrateMfaCodes
};

async function runMigration() {
  const startTime = Date.now();

  log('='.repeat(60));
  log('Starting Data Migration from JSON to PostgreSQL');
  log('='.repeat(60));

  if (isDryRun) {
    log('⚠ DRY-RUN MODE: No actual database changes will be made', 'warn');
  }

  if (targetTable) {
    log(`Migrating single table: ${targetTable}`, 'info');
  }

  const client = await pool.connect();
  const results = {};

  try {
    await client.query('BEGIN');

    const tablesToMigrate = targetTable
      ? [targetTable]
      : Object.keys(migrations);

    for (const table of tablesToMigrate) {
      if (!migrations[table]) {
        log(`Unknown table: ${table}`, 'error');
        continue;
      }

      try {
        results[table] = await migrations[table](client);
      } catch (error) {
        log(`Critical error migrating ${table}: ${error.message}`, 'error');
        results[table] = { success: 0, failed: -1, error: error.message };
      }
    }

    if (isDryRun) {
      await client.query('ROLLBACK');
      log('Transaction rolled back (dry-run mode)');
    } else {
      await client.query('COMMIT');
      log('Transaction committed successfully');
    }

  } catch (error) {
    await client.query('ROLLBACK');
    log(`Migration failed: ${error.message}`, 'error');
    log(error.stack, 'error');
  } finally {
    client.release();
  }

  // Print summary
  log('='.repeat(60));
  log('Migration Summary');
  log('='.repeat(60));

  let totalSuccess = 0;
  let totalFailed = 0;

  for (const [table, result] of Object.entries(results)) {
    const status = result.failed === -1 ? '✗ ERROR' :
                   result.failed === 0 ? '✓ SUCCESS' :
                   '⚠ PARTIAL';
    log(`${status} ${table}: ${result.success} succeeded, ${result.failed} failed`);
    totalSuccess += result.success;
    totalFailed += Math.max(0, result.failed);
  }

  log('='.repeat(60));
  log(`Total: ${totalSuccess} records migrated, ${totalFailed} failed`);
  log(`Duration: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
  log('='.repeat(60));

  await pool.end();
}

// Run migration
runMigration().catch(error => {
  log(`Unhandled error: ${error.message}`, 'error');
  log(error.stack, 'error');
  process.exit(1);
});
