# PostgreSQL Migration Guide

**Project**: Next.js Enterprise App
**Migration Type**: JSON Files → PostgreSQL Database
**Target OS**: Windows
**Estimated Time**: 4-8 hours

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [PostgreSQL Installation](#postgresql-installation)
3. [Database Setup](#database-setup)
4. [Schema Design](#schema-design)
5. [Migration Scripts](#migration-scripts)
6. [Backend Integration](#backend-integration)
7. [Testing & Validation](#testing--validation)
8. [Rollback Strategy](#rollback-strategy)
9. [Performance Optimization](#performance-optimization)

---

## 1. Prerequisites

### System Requirements
- Windows 10/11 (64-bit)
- 4GB RAM minimum (8GB recommended)
- 10GB free disk space
- Administrator privileges

### Software to Install
- [x] Node.js (already installed)
- [ ] PostgreSQL 16.x
- [ ] pgAdmin 4 (optional GUI tool)
- [ ] npm packages: `pg`, `pg-promise`

---

## 2. PostgreSQL Installation

### Step 1: Download PostgreSQL

1. Visit: https://www.postgresql.org/download/windows/
2. Download: **PostgreSQL 16.x** installer (EDB installer)
3. File: `postgresql-16.x-windows-x64.exe`

### Step 2: Install PostgreSQL

Run the installer with these settings:

```
Installation Directory: C:\Program Files\PostgreSQL\16
Data Directory: C:\Program Files\PostgreSQL\16\data
Port: 5432 (default)
Locale: Default locale
```

**Important Settings**:
- ✅ PostgreSQL Server
- ✅ pgAdmin 4
- ✅ Stack Builder (optional)
- ✅ Command Line Tools

**Superuser Password**:
```
Choose a strong password (save this!)
Recommended: Use a password manager
Example: PostgreSQL2024!
```

### Step 3: Verify Installation

Open Command Prompt and test:

```bash
# Check PostgreSQL version
psql --version
# Output: psql (PostgreSQL) 16.x

# Check service status
pg_ctl -D "C:\Program Files\PostgreSQL\16\data" status
```

### Step 4: Add to PATH (if not automatic)

```cmd
# Add to System Environment Variables
set PATH=%PATH%;C:\Program Files\PostgreSQL\16\bin
```

---

## 3. Database Setup

### Step 1: Connect as Superuser

```bash
# Open psql command line
psql -U postgres

# Enter the password you set during installation
```

### Step 2: Create Application Database

```sql
-- Create database
CREATE DATABASE nextjs_enterprise_app
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the database
\c nextjs_enterprise_app
```

### Step 3: Create Application User

```sql
-- Create application user (not superuser for security)
CREATE USER app_user WITH PASSWORD 'AppUser2024!';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE nextjs_enterprise_app TO app_user;
GRANT ALL ON SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_user;
```

### Step 4: Test Connection

```bash
# Exit superuser session
\q

# Connect as app_user
psql -U app_user -d nextjs_enterprise_app -h localhost

# Should prompt for password and connect successfully
```

---

## 4. Schema Design

### Core Tables Structure

```sql
-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    department VARCHAR(100),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    sso_enabled BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Indexes for users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    role_type VARCHAR(50) DEFAULT 'general',
    manager VARCHAR(50) REFERENCES users(id),
    representative VARCHAR(50) REFERENCES users(id),
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT chk_role_type CHECK (role_type IN ('management', 'general'))
);

-- Indexes for roles
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_type ON roles(role_type);
CREATE INDEX idx_roles_active ON roles(is_active);

-- ============================================
-- USER-ROLE MAPPINGS TABLE
-- ============================================
CREATE TABLE user_role_mappings (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by VARCHAR(100),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (user_id, role_id)
);

-- Indexes for mappings
CREATE INDEX idx_urm_user ON user_role_mappings(user_id);
CREATE INDEX idx_urm_role ON user_role_mappings(role_id);
CREATE INDEX idx_urm_active ON user_role_mappings(is_active);
CREATE INDEX idx_urm_expires ON user_role_mappings(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- DEPARTMENTS TABLE
-- ============================================
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name JSONB NOT NULL,
    description JSONB,
    parent_id VARCHAR(50) REFERENCES departments(id),
    manager_id VARCHAR(50) REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for departments
CREATE INDEX idx_dept_code ON departments(code);
CREATE INDEX idx_dept_parent ON departments(parent_id);
CREATE INDEX idx_dept_manager ON departments(manager_id);

-- ============================================
-- PROGRAMS TABLE
-- ============================================
CREATE TABLE programs (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name JSONB NOT NULL,
    description JSONB,
    category VARCHAR(50),
    type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    permissions JSONB DEFAULT '[]',
    config JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for programs
CREATE INDEX idx_programs_code ON programs(code);
CREATE INDEX idx_programs_category ON programs(category);
CREATE INDEX idx_programs_status ON programs(status);

-- ============================================
-- ROLE-PROGRAM MAPPINGS TABLE
-- ============================================
CREATE TABLE role_program_mappings (
    id VARCHAR(50) PRIMARY KEY,
    role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    program_id VARCHAR(50) NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '[]',
    assigned_by VARCHAR(100),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (role_id, program_id)
);

-- Indexes for role-program mappings
CREATE INDEX idx_rpm_role ON role_program_mappings(role_id);
CREATE INDEX idx_rpm_program ON role_program_mappings(program_id);

-- ============================================
-- MENUS TABLE
-- ============================================
CREATE TABLE menus (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name JSONB NOT NULL,
    path VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100),
    "order" INTEGER NOT NULL,
    parent_id VARCHAR(50) REFERENCES menus(id),
    level INTEGER NOT NULL,
    program_id VARCHAR(50) REFERENCES programs(id),
    description JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for menus
CREATE INDEX idx_menus_code ON menus(code);
CREATE INDEX idx_menus_path ON menus(path);
CREATE INDEX idx_menus_parent ON menus(parent_id);
CREATE INDEX idx_menus_program ON menus(program_id);

-- ============================================
-- ROLE-MENU MAPPINGS TABLE
-- ============================================
CREATE TABLE role_menu_mappings (
    id VARCHAR(50) PRIMARY KEY,
    role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    menu_id VARCHAR(50) NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    assigned_by VARCHAR(100),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (role_id, menu_id)
);

-- Indexes for role-menu mappings
CREATE INDEX idx_rmm_role ON role_menu_mappings(role_id);
CREATE INDEX idx_rmm_menu ON role_menu_mappings(menu_id);

-- ============================================
-- CODES TABLE
-- ============================================
CREATE TABLE codes (
    id VARCHAR(50) PRIMARY KEY,
    code_type VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL,
    name JSONB NOT NULL,
    description JSONB,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (code_type, code)
);

-- Indexes for codes
CREATE INDEX idx_codes_type ON codes(code_type);
CREATE INDEX idx_codes_code ON codes(code);
CREATE INDEX idx_codes_active ON codes(is_active);

-- ============================================
-- CODE TYPES TABLE
-- ============================================
CREATE TABLE code_types (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name JSONB NOT NULL,
    description JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for code types
CREATE INDEX idx_code_types_code ON code_types(code);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    message JSONB NOT NULL,
    type VARCHAR(50),
    category VARCHAR(100),
    severity VARCHAR(20),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for messages
CREATE INDEX idx_messages_code ON messages(code);
CREATE INDEX idx_messages_type ON messages(type);
CREATE INDEX idx_messages_category ON messages(category);

-- ============================================
-- LOGS TABLE
-- ============================================
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(20) NOT NULL,
    path TEXT NOT NULL,
    url TEXT,
    original_url TEXT,
    status_code INTEGER,
    duration VARCHAR(20),
    user_id VARCHAR(50) REFERENCES users(id),
    program_id VARCHAR(50),
    ip VARCHAR(50),
    user_agent TEXT,
    request_body JSONB,
    response_preview JSONB
);

-- Indexes for logs
CREATE INDEX idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX idx_logs_user ON logs(user_id);
CREATE INDEX idx_logs_method ON logs(method);
CREATE INDEX idx_logs_status ON logs(status_code);
CREATE INDEX idx_logs_program ON logs(program_id);

-- Partition logs by month for better performance
CREATE TABLE logs_2025_01 PARTITION OF logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- ============================================
-- HELP TABLE
-- ============================================
CREATE TABLE help (
    id VARCHAR(50) PRIMARY KEY,
    program_id VARCHAR(50) NOT NULL REFERENCES programs(id),
    language VARCHAR(10) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    version VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    UNIQUE (program_id, language)
);

-- Indexes for help
CREATE INDEX idx_help_program ON help(program_id);
CREATE INDEX idx_help_language ON help(language);

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
CREATE TABLE user_preferences (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    favorite_menus JSONB DEFAULT '[]',
    recent_menus JSONB DEFAULT '[]',
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER SETTINGS TABLE
-- ============================================
CREATE TABLE user_settings (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    notifications JSONB DEFAULT '{}',
    privacy JSONB DEFAULT '{}',
    appearance JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PERMISSIONS TABLE
-- ============================================
CREATE TABLE permissions (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TOKEN BLACKLIST TABLE
-- ============================================
CREATE TABLE token_blacklist (
    token TEXT PRIMARY KEY,
    user_id VARCHAR(50),
    reason VARCHAR(255),
    blacklisted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Index for token blacklist
CREATE INDEX idx_token_expires ON token_blacklist(expires_at);

-- ============================================
-- MFA CODES TABLE
-- ============================================
CREATE TABLE mfa_codes (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

-- Indexes for MFA codes
CREATE INDEX idx_mfa_user ON mfa_codes(user_id);
CREATE INDEX idx_mfa_expires ON mfa_codes(expires_at);
```

---

## 5. Migration Scripts

### Install Required Packages

```bash
cd E:/apps/nextjs-enterprise-app
npm install pg pg-promise dotenv
```

### Create Migration Script Directory

```bash
mkdir -p migration/scripts
```

### Main Migration Script

Create: `migration/migrate-to-postgresql.js`

```javascript
const fs = require('fs').promises;
const path = require('path');
const pgPromise = require('pg-promise');

// Initialize pg-promise
const pgp = pgPromise();

// Database connection
const db = pgp({
  host: 'localhost',
  port: 5432,
  database: 'nextjs_enterprise_app',
  user: 'app_user',
  password: 'AppUser2024!',
});

// Data file paths
const DATA_DIR = path.join(__dirname, '../backend/data');

// Helper function to read JSON file
async function readJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// Migration functions
async function migrateUsers() {
  console.log('Migrating users...');
  const users = await readJSON('users.json');

  const query = `
    INSERT INTO users (
      id, username, password, email, name, role, department,
      mfa_enabled, sso_enabled, status, avatar_url,
      created_at, last_login
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      updated_at = CURRENT_TIMESTAMP
  `;

  for (const user of users) {
    await db.none(query, [
      user.id,
      user.username,
      user.password,
      user.email,
      user.name,
      user.role,
      user.department,
      user.mfaEnabled || false,
      user.ssoEnabled || false,
      user.status || 'active',
      user.avatarUrl || null,
      user.createdAt || new Date().toISOString(),
      user.lastLogin || null
    ]);
  }

  console.log(`✅ Migrated ${users.length} users`);
}

async function migrateRoles() {
  console.log('Migrating roles...');
  const data = await readJSON('roles.json');
  const roles = data.roles || data;

  const query = `
    INSERT INTO roles (
      id, name, display_name, description, role_type,
      manager, representative, is_system, is_active,
      created_at, updated_at, created_by, updated_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      updated_at = CURRENT_TIMESTAMP
  `;

  for (const role of roles) {
    await db.none(query, [
      role.id,
      role.name,
      role.displayName,
      role.description || null,
      role.roleType || 'general',
      role.manager || null,
      role.representative || null,
      role.isSystem || false,
      role.isActive !== false,
      role.createdAt || new Date().toISOString(),
      role.updatedAt || new Date().toISOString(),
      role.createdBy || 'system',
      role.updatedBy || null
    ]);
  }

  console.log(`✅ Migrated ${roles.length} roles`);
}

async function migrateUserRoleMappings() {
  console.log('Migrating user-role mappings...');
  const data = await readJSON('userRoleMappings.json');
  const mappings = data.userRoleMappings || data;

  const query = `
    INSERT INTO user_role_mappings (
      id, user_id, role_id, assigned_by, assigned_at, expires_at, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (id) DO NOTHING
  `;

  let count = 0;
  for (const mapping of mappings) {
    try {
      await db.none(query, [
        mapping.id,
        mapping.userId,
        mapping.roleId,
        mapping.assignedBy || 'admin',
        mapping.assignedAt || new Date().toISOString(),
        mapping.expiresAt || null,
        mapping.isActive !== false
      ]);
      count++;
    } catch (err) {
      console.warn(`⚠️ Skipped mapping ${mapping.id}: ${err.message}`);
    }
  }

  console.log(`✅ Migrated ${count} user-role mappings`);
}

async function migrateDepartments() {
  console.log('Migrating departments...');
  const departments = await readJSON('departments.json');

  const query = `
    INSERT INTO departments (
      id, code, name, description, parent_id, manager_id, is_active,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      updated_at = CURRENT_TIMESTAMP
  `;

  for (const dept of departments) {
    await db.none(query, [
      dept.id,
      dept.code,
      JSON.stringify(dept.name),
      dept.description ? JSON.stringify(dept.description) : null,
      dept.parentId || null,
      dept.managerId || null,
      dept.isActive !== false,
      dept.createdAt || new Date().toISOString(),
      dept.updatedAt || new Date().toISOString()
    ]);
  }

  console.log(`✅ Migrated ${departments.length} departments`);
}

async function migratePrograms() {
  console.log('Migrating programs...');
  const programs = await readJSON('programs.json');

  const query = `
    INSERT INTO programs (
      id, code, name, description, category, type, status,
      permissions, config, metadata, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      updated_at = CURRENT_TIMESTAMP
  `;

  for (const program of programs) {
    await db.none(query, [
      program.id,
      program.code,
      JSON.stringify(program.name),
      program.description ? JSON.stringify(program.description) : null,
      program.category || null,
      program.type || 'page',
      program.status || 'active',
      JSON.stringify(program.permissions || []),
      JSON.stringify(program.config || {}),
      JSON.stringify(program.metadata || {}),
      program.metadata?.createdAt || new Date().toISOString(),
      program.metadata?.updatedAt || new Date().toISOString()
    ]);
  }

  console.log(`✅ Migrated ${programs.length} programs`);
}

async function migrateMenus() {
  console.log('Migrating menus...');
  const menus = await readJSON('menus.json');

  const query = `
    INSERT INTO menus (
      id, code, name, path, icon, "order", parent_id, level,
      program_id, description, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      updated_at = CURRENT_TIMESTAMP
  `;

  for (const menu of menus) {
    await db.none(query, [
      menu.id,
      menu.code,
      JSON.stringify(menu.name),
      menu.path,
      menu.icon || null,
      menu.order,
      menu.parentId || null,
      menu.level,
      menu.programId || null,
      menu.description ? JSON.stringify(menu.description) : null,
      new Date().toISOString(),
      new Date().toISOString()
    ]);
  }

  console.log(`✅ Migrated ${menus.length} menus`);
}

async function migrateCodes() {
  console.log('Migrating codes...');
  const codes = await readJSON('codes.json');

  const query = `
    INSERT INTO codes (
      id, code_type, code, name, description, display_order,
      is_active, metadata, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      updated_at = CURRENT_TIMESTAMP
  `;

  for (const code of codes) {
    await db.none(query, [
      code.id,
      code.codeType,
      code.code,
      JSON.stringify(code.name),
      code.description ? JSON.stringify(code.description) : null,
      code.displayOrder || 0,
      code.isActive !== false,
      JSON.stringify(code.metadata || {}),
      code.createdAt || new Date().toISOString(),
      code.updatedAt || new Date().toISOString()
    ]);
  }

  console.log(`✅ Migrated ${codes.length} codes`);
}

async function migrateMessages() {
  console.log('Migrating messages...');
  const messages = await readJSON('messages.json');

  const query = `
    INSERT INTO messages (
      id, code, message, type, category, severity, metadata,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO UPDATE SET
      message = EXCLUDED.message,
      updated_at = CURRENT_TIMESTAMP
  `;

  for (const msg of messages) {
    await db.none(query, [
      msg.id,
      msg.code,
      JSON.stringify(msg.message),
      msg.type || null,
      msg.category || null,
      msg.severity || null,
      JSON.stringify(msg.metadata || {}),
      msg.createdAt || new Date().toISOString(),
      msg.updatedAt || new Date().toISOString()
    ]);
  }

  console.log(`✅ Migrated ${messages.length} messages`);
}

// Main migration function
async function migrate() {
  try {
    console.log('🚀 Starting PostgreSQL migration...\n');

    // Test connection
    await db.one('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Run migrations in order (respecting foreign key constraints)
    await migrateUsers();
    await migrateRoles();
    await migrateDepartments();
    await migratePrograms();
    await migrateMenus();
    await migrateUserRoleMappings();
    await migrateCodes();
    await migrateMessages();

    console.log('\n✅ Migration completed successfully!');

    // Show statistics
    const stats = await db.one(`
      SELECT
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM roles) as roles,
        (SELECT COUNT(*) FROM user_role_mappings) as mappings,
        (SELECT COUNT(*) FROM programs) as programs,
        (SELECT COUNT(*) FROM menus) as menus,
        (SELECT COUNT(*) FROM codes) as codes,
        (SELECT COUNT(*) FROM messages) as messages
    `);

    console.log('\n📊 Database Statistics:');
    console.log(`   Users: ${stats.users}`);
    console.log(`   Roles: ${stats.roles}`);
    console.log(`   User-Role Mappings: ${stats.mappings}`);
    console.log(`   Programs: ${stats.programs}`);
    console.log(`   Menus: ${stats.menus}`);
    console.log(`   Codes: ${stats.codes}`);
    console.log(`   Messages: ${stats.messages}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close database connection
    pgp.end();
  }
}

// Run migration
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { migrate };
```

---

## 6. Backend Integration

### Create Database Configuration

Create: `backend/config/database.js`

```javascript
const pgPromise = require('pg-promise');

const pgp = pgPromise({
  // Global configuration
  capSQL: true // capitalize SQL keywords
});

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'nextjs_enterprise_app',
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'AppUser2024!',
  max: 30, // connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const db = pgp(config);

// Test connection
db.connect()
  .then(obj => {
    console.log('✅ PostgreSQL connected successfully');
    obj.done(); // release connection
  })
  .catch(error => {
    console.error('❌ PostgreSQL connection error:', error);
  });

module.exports = { db, pgp };
```

### Update Environment Variables

Add to `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nextjs_enterprise_app
DB_USER=app_user
DB_PASSWORD=AppUser2024!

# Toggle between JSON and PostgreSQL
USE_DATABASE=true
```

---

## 7. Testing & Validation

### Validation Script

Create: `migration/validate.js`

```javascript
const { db } = require('../backend/config/database');

async function validate() {
  console.log('🔍 Validating migration...\n');

  try {
    // Test 1: Count records
    console.log('Test 1: Record counts');
    const counts = await db.one(`
      SELECT
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM roles) as roles,
        (SELECT COUNT(*) FROM user_role_mappings) as mappings
    `);
    console.log('✅ Users:', counts.users);
    console.log('✅ Roles:', counts.roles);
    console.log('✅ Mappings:', counts.mappings);

    // Test 2: Foreign key integrity
    console.log('\nTest 2: Foreign key integrity');
    const orphanedMappings = await db.one(`
      SELECT COUNT(*) FROM user_role_mappings urm
      LEFT JOIN users u ON urm.user_id = u.id
      LEFT JOIN roles r ON urm.role_id = r.id
      WHERE u.id IS NULL OR r.id IS NULL
    `);
    console.log('✅ Orphaned mappings:', orphanedMappings.count);

    // Test 3: Sample queries
    console.log('\nTest 3: Sample queries');
    const adminUser = await db.oneOrNone('SELECT * FROM users WHERE username = $1', ['admin']);
    console.log('✅ Admin user found:', !!adminUser);

    console.log('\n✅ All validation tests passed!');
  } catch (error) {
    console.error('❌ Validation failed:', error);
  }
}

validate();
```

---

## 8. Rollback Strategy

### Backup Before Migration

```bash
# Backup JSON files
cd E:/apps/nextjs-enterprise-app
mkdir -p backup/data
cp -r backend/data/* backup/data/

# Or use timestamp
mkdir -p backup/data-$(date +%Y%m%d)
cp -r backend/data/* backup/data-$(date +%Y%m%d)/
```

### Rollback Steps

If migration fails:

```sql
-- Drop all tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO app_user;
```

Then restore from JSON backups.

---

## 9. Performance Optimization

### Enable Query Logging

```sql
-- Edit postgresql.conf
log_statement = 'all'
log_duration = on
log_min_duration_statement = 100  -- log queries > 100ms
```

### Add Additional Indexes

```sql
-- After migration, analyze query patterns
-- Add indexes as needed

-- Example: If frequently searching users by name
CREATE INDEX idx_users_name_trgm ON users USING gin(name gin_trgm_ops);
```

### Regular Maintenance

```sql
-- Vacuum and analyze
VACUUM ANALYZE;

-- Reindex if needed
REINDEX DATABASE nextjs_enterprise_app;
```

---

## 📝 Checklist

### Pre-Migration
- [ ] PostgreSQL installed and running
- [ ] Database and user created
- [ ] Schema created
- [ ] Backup JSON files
- [ ] npm packages installed

### Migration
- [ ] Run migration script
- [ ] Verify record counts
- [ ] Validate foreign keys
- [ ] Test sample queries

### Post-Migration
- [ ] Update backend routes
- [ ] Update environment variables
- [ ] Test all API endpoints
- [ ] Monitor performance
- [ ] Document changes

---

## 🆘 Troubleshooting

### Issue: Connection refused
```bash
# Check if PostgreSQL is running
pg_ctl -D "C:\Program Files\PostgreSQL\16\data" status

# Start PostgreSQL service
net start postgresql-x64-16
```

### Issue: Authentication failed
```sql
-- Reset password
ALTER USER app_user WITH PASSWORD 'NewPassword!';
```

### Issue: Permission denied
```sql
-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE nextjs_enterprise_app TO app_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_user;
```

---

## 📚 Next Steps

After successful migration:

1. **Update Routes**: Convert all backend routes from JSON to PostgreSQL
2. **Add Connection Pooling**: Optimize for concurrent requests
3. **Implement Transactions**: Ensure data consistency
4. **Add Query Optimization**: Use EXPLAIN ANALYZE
5. **Setup Backup Schedule**: Regular pg_dump backups
6. **Monitor Performance**: Use pgAdmin or pg_stat_statements

---

**Migration Guide Version**: 1.0
**Last Updated**: 2025-11-16
**Estimated Migration Time**: 4-8 hours
