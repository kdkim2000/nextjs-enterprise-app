# Oracle Database Migration Guide

**Project**: Next.js Enterprise App
**Target**: Oracle Database 19c/21c
**Platform**: Windows
**Estimated Time**: 8-12 hours

---

## 📋 Overview

This guide covers migration from JSON files to Oracle Database, the industry-leading enterprise database management system.

### Why Oracle?

- ✅ **Enterprise-Grade**: Maximum reliability and performance
- ✅ **Advanced Features**: RAC, Data Guard, Real Application Testing
- ✅ **24/7 Support**: Enterprise support contracts available
- ✅ **Scalability**: Proven to handle billions of transactions
- ✅ **Security**: Advanced security features (TDE, VPD, Audit Vault)

### Cost Consideration

⚠️ **Important**: Oracle Database requires licensing

- **Standard Edition 2**: $17,500 per socket (max 2 sockets)
- **Enterprise Edition**: $47,500 per processor
- **Annual Support**: 22% of license cost
- **Free Option**: Oracle XE (Express Edition) - Limited to 12GB RAM, 2GB database

**For Development**: Oracle XE is free and sufficient

---

## 1. Prerequisites

### System Requirements

- Windows 10/11 (64-bit) or Windows Server
- 8GB RAM minimum (16GB recommended for Enterprise Edition)
- 20GB free disk space
- Administrator privileges

### Download Options

**Option 1: Oracle Express Edition (XE) - FREE**
- Download: https://www.oracle.com/database/technologies/xe-downloads.html
- Version: Oracle Database 21c Express Edition
- File: OracleXE213_Win64.zip
- Suitable for: Development, Testing, <12GB data

**Option 2: Enterprise Edition - LICENSED**
- Download: https://www.oracle.com/database/technologies/oracle-database-software-downloads.html
- Version: Oracle Database 19c/21c
- Requires: Oracle account and license agreement

---

## 2. Oracle Installation

### Installing Oracle XE (Free)

1. **Download and Extract**
   ```cmd
   # Extract OracleXE213_Win64.zip
   # Run setup.exe
   ```

2. **Installation Wizard**
   ```
   Destination: C:\app\oracle\product\21c\dbhomeXE
   Password for SYS/SYSTEM: (Choose strong password)
   Example: OracleXE2024!

   Port: 1521 (default)
   Global Database Name: XE
   ```

3. **Wait for Installation** (10-20 minutes)

4. **Verify Installation**
   ```cmd
   # Check Oracle service
   sc query OracleServiceXE

   # Should show: STATE: RUNNING
   ```

### Post-Installation Setup

1. **Set Environment Variables**
   ```cmd
   setx ORACLE_HOME "C:\app\oracle\product\21c\dbhomeXE"
   setx ORACLE_SID "XE"
   setx PATH "%PATH%;C:\app\oracle\product\21c\dbhomeXE\bin"
   ```

2. **Test Connection**
   ```cmd
   # Open SQL*Plus
   sqlplus sys/OracleXE2024!@XE as sysdba

   # Should connect successfully
   SQL> SELECT * FROM v$version;
   ```

---

## 3. Database Setup

### Step 1: Create Tablespace

```sql
-- Connect as SYSDBA
sqlplus sys/OracleXE2024!@XE as sysdba

-- Create tablespace for application data
CREATE TABLESPACE app_data
  DATAFILE 'C:\app\oracle\product\21c\dbhomeXE\oradata\XE\app_data01.dbf'
  SIZE 1G
  AUTOEXTEND ON
  NEXT 100M
  MAXSIZE UNLIMITED
  EXTENT MANAGEMENT LOCAL
  SEGMENT SPACE MANAGEMENT AUTO;

-- Create tablespace for indexes
CREATE TABLESPACE app_index
  DATAFILE 'C:\app\oracle\product\21c\dbhomeXE\oradata\XE\app_index01.dbf'
  SIZE 500M
  AUTOEXTEND ON
  NEXT 50M
  MAXSIZE UNLIMITED
  EXTENT MANAGEMENT LOCAL
  SEGMENT SPACE MANAGEMENT AUTO;
```

### Step 2: Create Application User

```sql
-- Create user
CREATE USER app_user IDENTIFIED BY AppUser2024!
  DEFAULT TABLESPACE app_data
  TEMPORARY TABLESPACE temp
  QUOTA UNLIMITED ON app_data
  QUOTA UNLIMITED ON app_index;

-- Grant necessary privileges
GRANT CREATE SESSION TO app_user;
GRANT CREATE TABLE TO app_user;
GRANT CREATE SEQUENCE TO app_user;
GRANT CREATE VIEW TO app_user;
GRANT CREATE PROCEDURE TO app_user;
GRANT CREATE TRIGGER TO app_user;
GRANT CREATE TYPE TO app_user;

-- Grant additional privileges for JSON support
GRANT EXECUTE ON DBMS_JSON TO app_user;

-- Exit
EXIT;
```

### Step 3: Test Connection

```cmd
# Test as app_user
sqlplus app_user/AppUser2024!@XE

SQL> SELECT * FROM USER_USERS;
# Should show app_user details
```

---

## 4. Schema Design

### Oracle-Specific Features

Oracle provides advanced features we'll leverage:

1. **ROWID**: Unique physical identifier (faster than UUID)
2. **JSON Support**: Native JSON datatype (21c)
3. **Virtual Columns**: Computed columns for JSON extraction
4. **Partitioning**: Table partitioning for logs
5. **Advanced Indexes**: B-tree, Bitmap, Function-based

### Create Schema

Save as `migration/sql/oracle-schema.sql`:

```sql
-- ============================================
-- ORACLE SCHEMA FOR NEXT.JS ENTERPRISE APP
-- Version: 1.0
-- Oracle Database: 19c/21c
-- ============================================

-- Connect as app_user
-- sqlplus app_user/AppUser2024!@XE

-- Enable JSON support
ALTER SESSION SET NLS_LENGTH_SEMANTICS = CHAR;

-- ============================================
-- SEQUENCES
-- ============================================

-- Create sequences for auto-increment IDs (if needed)
CREATE SEQUENCE seq_log_id START WITH 1 INCREMENT BY 1;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id VARCHAR2(50) PRIMARY KEY,
    username VARCHAR2(100) UNIQUE NOT NULL,
    password VARCHAR2(255) NOT NULL,
    email VARCHAR2(255) UNIQUE NOT NULL,
    name VARCHAR2(255) NOT NULL,
    role VARCHAR2(50) DEFAULT 'user' NOT NULL,
    department VARCHAR2(100),
    mfa_enabled NUMBER(1) DEFAULT 0,
    sso_enabled NUMBER(1) DEFAULT 0,
    status VARCHAR2(20) DEFAULT 'active',
    avatar_url CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    CONSTRAINT chk_users_status CHECK (status IN ('active', 'inactive', 'suspended')),
    CONSTRAINT chk_users_mfa CHECK (mfa_enabled IN (0, 1)),
    CONSTRAINT chk_users_sso CHECK (sso_enabled IN (0, 1))
) TABLESPACE app_data;

-- Indexes
CREATE INDEX idx_users_username ON users(username) TABLESPACE app_index;
CREATE INDEX idx_users_email ON users(email) TABLESPACE app_index;
CREATE INDEX idx_users_status ON users(status) TABLESPACE app_index;
CREATE INDEX idx_users_department ON users(department) TABLESPACE app_index;
CREATE INDEX idx_users_role ON users(role) TABLESPACE app_index;

-- Text index for name search
CREATE INDEX idx_users_name_text ON users(name)
  INDEXTYPE IS CTXSYS.CONTEXT
  PARAMETERS ('SYNC (ON COMMIT)');

-- Comments
COMMENT ON TABLE users IS 'System users with authentication';
COMMENT ON COLUMN users.mfa_enabled IS '0=disabled, 1=enabled';

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE roles (
    id VARCHAR2(50) PRIMARY KEY,
    name VARCHAR2(100) UNIQUE NOT NULL,
    display_name VARCHAR2(255) NOT NULL,
    description CLOB,
    role_type VARCHAR2(50) DEFAULT 'general',
    manager VARCHAR2(50),
    representative VARCHAR2(50),
    is_system NUMBER(1) DEFAULT 0,
    is_active NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR2(100),
    updated_by VARCHAR2(100),
    CONSTRAINT chk_roles_type CHECK (role_type IN ('management', 'general')),
    CONSTRAINT chk_roles_system CHECK (is_system IN (0, 1)),
    CONSTRAINT chk_roles_active CHECK (is_active IN (0, 1))
) TABLESPACE app_data;

-- Foreign keys (added after users populated)
-- ALTER TABLE roles ADD CONSTRAINT fk_roles_manager FOREIGN KEY (manager) REFERENCES users(id);
-- ALTER TABLE roles ADD CONSTRAINT fk_roles_representative FOREIGN KEY (representative) REFERENCES users(id);

-- Indexes
CREATE INDEX idx_roles_name ON roles(name) TABLESPACE app_index;
CREATE INDEX idx_roles_type ON roles(role_type) TABLESPACE app_index;
CREATE INDEX idx_roles_active ON roles(is_active) TABLESPACE app_index;

-- ============================================
-- USER-ROLE MAPPINGS TABLE
-- ============================================
CREATE TABLE user_role_mappings (
    id VARCHAR2(50) PRIMARY KEY,
    user_id VARCHAR2(50) NOT NULL,
    role_id VARCHAR2(50) NOT NULL,
    assigned_by VARCHAR2(100),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active NUMBER(1) DEFAULT 1,
    CONSTRAINT fk_urm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_urm_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT uq_urm_user_role UNIQUE (user_id, role_id),
    CONSTRAINT chk_urm_active CHECK (is_active IN (0, 1))
) TABLESPACE app_data;

-- Indexes
CREATE INDEX idx_urm_user ON user_role_mappings(user_id) TABLESPACE app_index;
CREATE INDEX idx_urm_role ON user_role_mappings(role_id) TABLESPACE app_index;
CREATE INDEX idx_urm_active ON user_role_mappings(is_active) TABLESPACE app_index;
CREATE INDEX idx_urm_expires ON user_role_mappings(expires_at) TABLESPACE app_index;

-- ============================================
-- PROGRAMS TABLE (with JSON support)
-- ============================================
CREATE TABLE programs (
    id VARCHAR2(50) PRIMARY KEY,
    code VARCHAR2(100) UNIQUE NOT NULL,
    name_json CLOB CONSTRAINT name_json_check CHECK (name_json IS JSON),
    description_json CLOB CONSTRAINT desc_json_check CHECK (description_json IS JSON),
    category VARCHAR2(50),
    type VARCHAR2(50),
    status VARCHAR2(20) DEFAULT 'active',
    permissions_json CLOB CONSTRAINT perm_json_check CHECK (permissions_json IS JSON) DEFAULT '[]',
    config_json CLOB CONSTRAINT config_json_check CHECK (config_json IS JSON) DEFAULT '{}',
    metadata_json CLOB CONSTRAINT meta_json_check CHECK (metadata_json IS JSON) DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) TABLESPACE app_data;

-- Indexes
CREATE INDEX idx_programs_code ON programs(code) TABLESPACE app_index;
CREATE INDEX idx_programs_category ON programs(category) TABLESPACE app_index;
CREATE INDEX idx_programs_status ON programs(status) TABLESPACE app_index;

-- ============================================
-- CODES TABLE
-- ============================================
CREATE TABLE codes (
    id VARCHAR2(50) PRIMARY KEY,
    code_type VARCHAR2(100) NOT NULL,
    code VARCHAR2(100) NOT NULL,
    name_json CLOB CONSTRAINT codes_name_json CHECK (name_json IS JSON) NOT NULL,
    description_json CLOB CONSTRAINT codes_desc_json CHECK (description_json IS JSON),
    display_order NUMBER DEFAULT 0,
    is_active NUMBER(1) DEFAULT 1,
    metadata_json CLOB CONSTRAINT codes_meta_json CHECK (metadata_json IS JSON) DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_codes_type_code UNIQUE (code_type, code),
    CONSTRAINT chk_codes_active CHECK (is_active IN (0, 1))
) TABLESPACE app_data;

-- Indexes
CREATE INDEX idx_codes_type ON codes(code_type) TABLESPACE app_index;
CREATE INDEX idx_codes_code ON codes(code) TABLESPACE app_index;

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
    id VARCHAR2(50) PRIMARY KEY,
    code VARCHAR2(100) UNIQUE NOT NULL,
    message_json CLOB CONSTRAINT msg_json_check CHECK (message_json IS JSON) NOT NULL,
    type VARCHAR2(50),
    category VARCHAR2(100),
    severity VARCHAR2(20),
    metadata_json CLOB CONSTRAINT msg_meta_json CHECK (metadata_json IS JSON) DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) TABLESPACE app_data;

-- Indexes
CREATE INDEX idx_messages_code ON messages(code) TABLESPACE app_index;
CREATE INDEX idx_messages_type ON messages(type) TABLESPACE app_index;

-- ============================================
-- LOGS TABLE (Partitioned by month)
-- ============================================
CREATE TABLE logs (
    id NUMBER PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR2(20) NOT NULL,
    path VARCHAR2(4000) NOT NULL,
    url VARCHAR2(4000),
    status_code NUMBER,
    duration VARCHAR2(20),
    user_id VARCHAR2(50),
    program_id VARCHAR2(50),
    ip VARCHAR2(50),
    user_agent VARCHAR2(4000),
    request_body_json CLOB CONSTRAINT req_json_check CHECK (request_body_json IS JSON),
    response_preview_json CLOB CONSTRAINT resp_json_check CHECK (response_preview_json IS JSON),
    CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) TABLESPACE app_data
PARTITION BY RANGE (timestamp) INTERVAL (NUMTOYMINTERVAL(1, 'MONTH'))
(
  PARTITION logs_initial VALUES LESS THAN (TO_TIMESTAMP('2025-01-01', 'YYYY-MM-DD'))
);

-- Indexes
CREATE INDEX idx_logs_timestamp ON logs(timestamp) LOCAL TABLESPACE app_index;
CREATE INDEX idx_logs_user ON logs(user_id) LOCAL TABLESPACE app_index;
CREATE INDEX idx_logs_method ON logs(method) LOCAL TABLESPACE app_index;

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Users trigger
CREATE OR REPLACE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Roles trigger
CREATE OR REPLACE TRIGGER trg_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Programs trigger
CREATE OR REPLACE TRIGGER trg_programs_updated_at
BEFORE UPDATE ON programs
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Logs ID trigger
CREATE OR REPLACE TRIGGER trg_logs_id
BEFORE INSERT ON logs
FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
    SELECT seq_log_id.NEXTVAL INTO :NEW.id FROM DUAL;
END;
/

-- ============================================
-- VIEWS
-- ============================================

-- View: Users with role names
CREATE OR REPLACE VIEW v_users_with_roles AS
SELECT
    u.id,
    u.username,
    u.email,
    u.name,
    u.department,
    u.status,
    LISTAGG(r.name, ',') WITHIN GROUP (ORDER BY r.name) as role_names,
    LISTAGG(r.display_name, ',') WITHIN GROUP (ORDER BY r.display_name) as role_display_names
FROM users u
LEFT JOIN user_role_mappings urm ON u.id = urm.user_id AND urm.is_active = 1
LEFT JOIN roles r ON urm.role_id = r.id
GROUP BY u.id, u.username, u.email, u.name, u.department, u.status;

-- View: Role counts
CREATE OR REPLACE VIEW v_roles_with_counts AS
SELECT
    r.*,
    COUNT(DISTINCT urm.user_id) as user_count
FROM roles r
LEFT JOIN user_role_mappings urm ON r.id = urm.role_id AND urm.is_active = 1
GROUP BY r.id, r.name, r.display_name, r.description, r.role_type,
         r.manager, r.representative, r.is_system, r.is_active,
         r.created_at, r.updated_at, r.created_by, r.updated_by;

-- ============================================
-- COMPLETION
-- ============================================

PROMPT
PROMPT ✅ Oracle schema created successfully!
PROMPT
PROMPT Tables created. Run the following to see them:
PROMPT SELECT table_name FROM user_tables;
PROMPT
```

---

## 5. Migration Script

Install required package:

```cmd
npm install oracledb
```

Create `migration/migrate-to-oracle.js`:

```javascript
const oracledb = require('oracledb');
const fs = require('fs').promises;
const path = require('path');

// Oracle configuration
const dbConfig = {
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'AppUser2024!',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XE'
};

// Data directory
const DATA_DIR = path.join(__dirname, '../backend/data');

// Helper to read JSON
async function readJSON(filename) {
  const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf8');
  return JSON.parse(data);
}

// Migration functions
async function migrateUsers(connection) {
  console.log('Migrating users...');
  const users = await readJSON('users.json');

  const sql = `
    INSERT INTO users (
      id, username, password, email, name, role, department,
      mfa_enabled, sso_enabled, status, avatar_url, created_at, last_login
    ) VALUES (
      :id, :username, :password, :email, :name, :role, :department,
      :mfaEnabled, :ssoEnabled, :status, :avatarUrl,
      TO_TIMESTAMP(:createdAt, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'),
      TO_TIMESTAMP(:lastLogin, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"')
    )
  `;

  const options = {
    autoCommit: false,
    bindDefs: {
      id: { type: oracledb.STRING, maxSize: 50 },
      username: { type: oracledb.STRING, maxSize: 100 },
      password: { type: oracledb.STRING, maxSize: 255 },
      email: { type: oracledb.STRING, maxSize: 255 },
      name: { type: oracledb.STRING, maxSize: 255 },
      role: { type: oracledb.STRING, maxSize: 50 },
      department: { type: oracledb.STRING, maxSize: 100 },
      mfaEnabled: { type: oracledb.NUMBER },
      ssoEnabled: { type: oracledb.NUMBER },
      status: { type: oracledb.STRING, maxSize: 20 },
      avatarUrl: { type: oracledb.STRING, maxSize: 4000 },
      createdAt: { type: oracledb.STRING },
      lastLogin: { type: oracledb.STRING }
    }
  };

  const binds = users.map(user => ({
    id: user.id,
    username: user.username,
    password: user.password,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department || null,
    mfaEnabled: user.mfaEnabled ? 1 : 0,
    ssoEnabled: user.ssoEnabled ? 1 : 0,
    status: user.status || 'active',
    avatarUrl: user.avatarUrl || null,
    createdAt: user.createdAt || new Date().toISOString(),
    lastLogin: user.lastLogin || null
  }));

  await connection.executeMany(sql, binds, options);
  await connection.commit();

  console.log(`✅ Migrated ${users.length} users`);
}

// Main migration
async function migrate() {
  let connection;

  try {
    console.log('🚀 Starting Oracle migration...\n');

    // Connect to Oracle
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Connected to Oracle Database\n');

    // Run migrations
    await migrateUsers(connection);

    // Add other migrations here...

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
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

## 6. Oracle-Specific Optimizations

### Enable Result Cache

```sql
ALTER SYSTEM SET result_cache_mode = FORCE;
ALTER SYSTEM SET result_cache_max_size = 1G;
```

### Enable SQL Plan Management

```sql
ALTER SYSTEM SET optimizer_capture_sql_plan_baselines = TRUE;
```

### Gather Statistics

```sql
EXEC DBMS_STATS.GATHER_SCHEMA_STATS('APP_USER');
```

---

## 7. Performance Tips

1. **Use Bind Variables**: Prevents SQL parsing overhead
2. **Connection Pooling**: Use `oracledb.createPool()`
3. **Batch Operations**: Use `executeMany()` for inserts
4. **Partitioning**: Partition large tables (logs)
5. **Compression**: Enable table compression for large tables

---

## 📊 Oracle vs PostgreSQL

| Feature | Oracle | PostgreSQL |
|---------|--------|------------|
| Cost | $$$$ | Free |
| Performance | 10/10 | 9/10 |
| Features | 10/10 | 8/10 |
| Community | 7/10 | 10/10 |
| Learning Curve | Hard | Medium |

---

**Guide Version**: 1.0
**Last Updated**: 2025-11-16
**Recommended For**: Enterprise deployments with budget
