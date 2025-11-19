# User Table Upgrade Guide

## Overview

This guide describes the upgrade process for the users table to include more realistic fields for enterprise user management.

## Changes Summary

### Database Schema Changes

#### Renamed Columns
- `username` → `loginid` (Login ID for authentication)

#### Split Columns
- `name` → `name_ko` (Korean name) and `name_en` (English name)

#### New Columns
| Column Name | Type | Description |
|------------|------|-------------|
| `employee_number` | VARCHAR(50) | Employee number (사번) |
| `system_key` | VARCHAR(100) UNIQUE | System internal unique key |
| `last_password_changed` | TIMESTAMP | Last password change timestamp |
| `phone_number` | VARCHAR(50) | Office phone number (전화번호) |
| `mobile_number` | VARCHAR(50) | Mobile phone number (휴대전화번호) |
| `user_category` | VARCHAR(50) | User category (사용자구분) |

#### User Categories
- `regular` - Regular Employee (정규직)
- `contractor` - Contractor (계약직)
- `temporary` - Temporary Worker (임시직)
- `external` - External User (외부 사용자)
- `admin` - Administrator (관리직)

## Upgrade Steps

### 1. Backup Current Data

Before applying any changes, create a backup of your database:

```bash
# PostgreSQL backup
pg_dump -h localhost -U your_user -d your_db > backup_$(date +%Y%m%d).sql

# Or use your preferred backup method
```

### 2. Run Database Migrations

Execute the following SQL scripts in order:

```bash
# Add USER_CATEGORY codes
psql -h localhost -U your_user -d your_db -f migration/add_user_category_codes.sql

# Upgrade users table schema
psql -h localhost -U your_user -d your_db -f migration/upgrade_users_realistic.sql
```

### 3. Apply Code Changes

Run the upgrade script for your platform:

#### Linux/Mac:
```bash
chmod +x migration/apply_user_upgrade.sh
./migration/apply_user_upgrade.sh
```

#### Windows:
```cmd
migration\apply_user_upgrade.bat
```

The script will:
1. Backup original files to `backup/user-upgrade-[timestamp]/`
2. Replace original files with .NEW versions
3. Provide instructions for database migration

### 4. Manual File Updates (if needed)

If the script fails, manually copy the .NEW files:

```bash
# Backend
cp backend/services/userService.js.NEW backend/services/userService.js

# Frontend Types
cp src/app/[locale]/admin/users/types.ts.NEW src/app/[locale]/admin/users/types.ts
cp src/types/auth.ts.NEW src/types/auth.ts

# Frontend Components
cp src/components/admin/UserFormFields.tsx.NEW src/components/admin/UserFormFields.tsx
cp src/app/[locale]/admin/users/constants.tsx.NEW src/app/[locale]/admin/users/constants.tsx
```

### 5. Test the Application

1. Start the backend server:
```bash
npm run dev:backend
```

2. Start the frontend server:
```bash
npm run dev
```

3. Test the following:
   - User login with loginid
   - User list displays all new fields
   - User create/edit forms show all new fields
   - Search functionality works with new fields
   - Department assignment still works

## Backward Compatibility

The upgrade maintains backward compatibility:

### Backend (`userService.js`)
- `getUserByUsername()` now calls `getUserByLoginId()`
- `usernameExists()` now calls `loginidExists()`
- `createUser()` accepts both `loginid` and `username` (for backward compatibility)
- `updateUser()` maps `username` → `loginid` and `name` → `name_ko`

### Frontend
- User types include both old (`username`, `name`) and new (`loginid`, `name_ko`, `name_en`) fields
- Components check for both old and new field names
- Forms display new fields but maintain compatibility with old data

## Data Migration

The migration script automatically:

1. **Renames** `username` column to `loginid`
2. **Migrates** existing `name` data to `name_ko`
3. **Generates** `system_key` as `USR-{id}` for all existing users
4. **Sets** `last_password_changed` to `created_at` for existing users
5. **Defaults** `user_category` to `'regular'` for all existing users

## Rollback Procedure

If you need to rollback:

1. Restore database from backup:
```bash
psql -h localhost -U your_user -d your_db < backup_YYYYMMDD.sql
```

2. Restore code files from backup:
```bash
BACKUP_DIR=backup/user-upgrade-[timestamp]
cp $BACKUP_DIR/userService.js.backup backend/services/userService.js
cp $BACKUP_DIR/users-types.ts.backup src/app/[locale]/admin/users/types.ts
cp $BACKUP_DIR/auth.ts.backup src/types/auth.ts
cp $BACKUP_DIR/UserFormFields.tsx.backup src/components/admin/UserFormFields.tsx
cp $BACKUP_DIR/constants.tsx.backup src/app/[locale]/admin/users/constants.tsx
```

## Files Changed

### Database
- `migration/upgrade_users_realistic.sql` - Main schema upgrade
- `migration/add_user_category_codes.sql` - Add USER_CATEGORY codes

### Backend
- `backend/services/userService.js` - Updated to use new field names

### Frontend
- `src/app/[locale]/admin/users/types.ts` - Updated User interface
- `src/types/auth.ts` - Updated User interface
- `src/components/admin/UserFormFields.tsx` - Updated form fields
- `src/app/[locale]/admin/users/constants.tsx` - Updated grid columns

### Scripts
- `migration/apply_user_upgrade.sh` - Linux/Mac upgrade script
- `migration/apply_user_upgrade.bat` - Windows upgrade script

## New Features

### User Form
- Organized into sections (Basic Information, Contact Info, etc.)
- Korean and English name fields
- Employee number field
- Phone and mobile number fields
- User category selection
- System key (read-only) for existing users
- Last password changed (read-only) for existing users

### User Grid
- Login ID column (replaces Username)
- Employee Number column
- Korean Name column
- English Name column
- Phone and Mobile columns
- User Category column

### Search
- Search now includes:
  - Login ID
  - Employee Number
  - Korean Name
  - English Name
  - Email

## Troubleshooting

### Issue: Migration fails with "column already exists"
**Solution:** The migration script includes safeguards, but if you've partially run it before, you may need to manually adjust the SQL or restore from backup.

### Issue: Frontend shows undefined for new fields
**Solution:** Clear browser cache and ensure the frontend code has been updated. The backend returns all new fields after migration.

### Issue: Login fails after migration
**Solution:** Ensure the authentication code is using `loginid` field. The backward compatibility layer should handle this, but check `backend/routes/auth.js` if needed.

### Issue: Departments not showing in dropdown
**Solution:** The department functionality hasn't changed. Verify `allDepartments` is being loaded correctly in the user management page.

## Support

If you encounter any issues:
1. Check the backup files in `backup/user-upgrade-[timestamp]/`
2. Review the migration logs
3. Test with a small subset of data first
4. Contact the development team if issues persist

## Next Steps

After successful upgrade:
1. Update any custom reports or exports that use user data
2. Update API documentation if you have external consumers
3. Train users on new fields (employee number, user category, etc.)
4. Consider adding validation rules for employee numbers
5. Update any external integrations that use the user API

## Changelog

### Version 1.0 (2025-01-20)
- Initial user table upgrade
- Added employee number, system key, phone numbers, user category
- Split name into Korean and English
- Renamed username to loginid
- Added last password changed tracking
