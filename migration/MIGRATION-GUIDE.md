# PostgreSQL Migration Guide

This directory contains the complete migration solution for converting backend/data JSON files to PostgreSQL database.

## Files

- **schema.sql** - Complete PostgreSQL schema with all tables and indexes
- **migrate.js** - Node.js migration script
- **migrate.config.json.example** - Example configuration file
- **package.json** - Dependencies for migration script

## Features

### Schema Design
- ✅ **No Foreign Key Constraints** - As requested, no CASCADE or FK constraints
- ✅ **Separate Language Columns** - Each language (en, ko, zh, vi) has its own column
- ✅ **Comprehensive Indexing** - Optimized indexes for common queries
- ✅ **JSONB Support** - Complex nested data stored as JSONB for flexibility
- ✅ **Proper Data Types** - VARCHAR, TEXT, INTEGER, BOOLEAN, TIMESTAMP WITH TIME ZONE

### Migration Script
- ✅ **Dry-Run Mode** - Test migration without database changes
- ✅ **Selective Migration** - Migrate specific tables only
- ✅ **Batch Processing** - Efficient bulk inserts for large datasets
- ✅ **Error Handling** - Comprehensive error reporting and recovery
- ✅ **Transaction Support** - All-or-nothing migration with rollback
- ✅ **Progress Tracking** - Detailed logging with success/failure counts

## Prerequisites

1. **PostgreSQL 12+** installed and running
2. **Node.js 14+** and npm
3. **Database created**: `CREATE DATABASE enterprise_app;`

## Setup

### 1. Install Dependencies

```bash
cd migration
npm install
```

### 2. Configure Database Connection

Copy the example config and update with your database credentials:

```bash
cp migrate.config.json.example migrate.config.json
```

Edit `migrate.config.json`:

```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "database": "enterprise_app",
    "user": "postgres",
    "password": "your_password"
  },
  "dataPath": "../backend/data"
}
```

### 3. Create Database Schema

Connect to PostgreSQL and run the schema:

```bash
psql -U postgres -d enterprise_app -f schema.sql
```

Or using pgAdmin or any PostgreSQL client, execute the `schema.sql` file.

## Usage

### Basic Migration (All Tables)

```bash
node migrate.js
```

### Dry-Run Mode (Test Without Changes)

```bash
node migrate.js --dry-run
```

### Migrate Specific Table

```bash
node migrate.js --table users
node migrate.js --table codes
node migrate.js --table menus
```

### Verbose Logging

```bash
node migrate.js --verbose
```

### Custom Batch Size (for large tables)

```bash
node migrate.js --batch 5000
```

### Combined Options

```bash
node migrate.js --dry-run --verbose --table logs
```

## Migration Order

The script automatically migrates tables in the correct order to avoid reference issues:

1. **code_types** - Code type definitions
2. **codes** - System codes with multi-language support
3. **departments** - Department hierarchy
4. **roles** - User roles
5. **users** - User accounts
6. **messages** - System messages
7. **menus** - Menu structure
8. **programs** - Program definitions
9. **help** - Help documentation
10. **permissions** - User permissions
11. **user_role_mappings** - User-to-role mappings
12. **role_menu_mappings** - Role-to-menu access
13. **role_program_mappings** - Role-to-program access
14. **user_preferences** - User preferences
15. **logs** - System logs (uses batch processing)
16. **token_blacklist** - Blacklisted tokens
17. **mfa_codes** - MFA secrets

## Multi-Language Data Handling

The migration script automatically converts JSON multi-language fields to separate columns:

**JSON Format:**
```json
{
  "name": {
    "en": "User Management",
    "ko": "사용자 관리",
    "zh": "用户管理",
    "vi": "Quản lý người dùng"
  }
}
```

**PostgreSQL Columns:**
```sql
name_en VARCHAR(200)
name_ko VARCHAR(200)
name_zh VARCHAR(200)
name_vi VARCHAR(200)
```

## Tables Reference

### Core Master Data
- **code_types** - Code type categories with multi-language names/descriptions
- **codes** - System codes (USER_STATUS, DEPT_STATUS, etc.) with multi-language support
- **departments** - Department hierarchy with multi-language names
- **messages** - System messages with multi-language translations

### User & Security
- **users** - User accounts with authentication info
- **roles** - Role definitions
- **user_role_mappings** - User-to-role assignments
- **permissions** - User permissions and menu access
- **mfa_codes** - MFA authentication secrets
- **token_blacklist** - Invalidated JWT tokens

### Menu & Programs
- **menus** - Menu hierarchy with multi-language labels
- **programs** - Program definitions with permissions
- **role_menu_mappings** - Role-based menu access control
- **role_program_mappings** - Role-based program access control

### System
- **help** - Help documentation with HTML content
- **user_preferences** - User preferences and settings
- **logs** - System access and operation logs

## Verification Queries

After migration, verify the data:

```sql
-- Check row counts
SELECT
  'code_types' as table_name, COUNT(*) FROM code_types
UNION ALL
SELECT 'codes', COUNT(*) FROM codes
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'roles', COUNT(*) FROM roles
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'menus', COUNT(*) FROM menus
UNION ALL
SELECT 'programs', COUNT(*) FROM programs
UNION ALL
SELECT 'user_role_mappings', COUNT(*) FROM user_role_mappings
UNION ALL
SELECT 'logs', COUNT(*) FROM logs;

-- Check multi-language data
SELECT id, code, name_en, name_ko, name_zh, name_vi
FROM departments
LIMIT 5;

-- Check JSONB fields
SELECT id, code, attributes
FROM codes
WHERE attributes IS NOT NULL
LIMIT 5;

-- Check user data
SELECT id, username, email, role, department, status
FROM users
LIMIT 5;
```

## Troubleshooting

### Connection Refused
- Verify PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or check Services (Windows)
- Check connection settings in `migrate.config.json`
- Verify database exists: `psql -U postgres -l`

### Permission Denied
- Ensure the database user has proper permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE enterprise_app TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

### Duplicate Key Errors
- If re-running migration, first truncate tables:
```sql
TRUNCATE TABLE
  logs, user_preferences, role_program_mappings, role_menu_mappings,
  user_role_mappings, permissions, help, programs, menus, messages,
  users, roles, departments, codes, code_types, token_blacklist, mfa_codes
CASCADE;
```

### Large File Processing (logs, userRoleMappings)
- Use batch processing: `node migrate.js --batch 5000`
- Migrate large tables separately: `node migrate.js --table logs`
- Increase Node.js memory: `node --max-old-space-size=4096 migrate.js`

### Character Encoding Issues
- Ensure database uses UTF-8:
```sql
CREATE DATABASE enterprise_app
WITH ENCODING='UTF8'
LC_COLLATE='en_US.UTF-8'
LC_CTYPE='en_US.UTF-8';
```

## Performance Tips

1. **Disable Indexes During Migration** (for very large datasets):
   - Drop indexes before migration
   - Run migration
   - Recreate indexes after migration

2. **Increase Batch Size** for large tables:
   ```bash
   node migrate.js --table logs --batch 10000
   ```

3. **Tune PostgreSQL** for bulk inserts:
   ```sql
   -- Temporarily increase these values
   SET maintenance_work_mem = '1GB';
   SET max_wal_size = '4GB';
   ```

## Rollback

If migration fails and you need to start over:

```sql
-- Drop all tables and recreate
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then re-run schema.sql
\i schema.sql
```

## Next Steps

After successful migration:

1. **Update Backend Code** - Modify backend to use PostgreSQL instead of JSON files
2. **Install pg Driver** - `npm install pg` in backend directory
3. **Create Connection Pool** - Set up PostgreSQL connection in backend
4. **Update API Routes** - Change file operations to database queries
5. **Test Thoroughly** - Verify all CRUD operations work correctly
6. **Backup Database** - Create regular backups using `pg_dump`

## Support

For issues or questions:
- Check PostgreSQL logs: `/var/log/postgresql/` (Linux) or Event Viewer (Windows)
- Review migration logs for detailed error messages
- Verify JSON file formats match expected structure
- Test with `--dry-run --verbose` for debugging

## License

This migration solution is part of the enterprise application project.
