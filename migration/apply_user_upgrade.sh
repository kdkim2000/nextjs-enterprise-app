#!/bin/bash
# ==========================================
# Apply User Table Upgrade
# ==========================================
# This script applies the user table upgrade by:
# 1. Running database migrations
# 2. Replacing .NEW files with originals
# 3. Backing up original files

set -e  # Exit on error

echo "=========================================="
echo "User Table Upgrade Script"
echo "=========================================="
echo ""

# Step 1: Backup original files
echo "Step 1: Backing up original files..."
mkdir -p backup/user-upgrade-$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="backup/user-upgrade-$(date +%Y%m%d-%H%M%S)"

if [ -f "backend/services/userService.js" ]; then
  cp "backend/services/userService.js" "$BACKUP_DIR/userService.js.backup"
  echo "  ✓ Backed up userService.js"
fi

if [ -f "src/app/[locale]/admin/users/types.ts" ]; then
  cp "src/app/[locale]/admin/users/types.ts" "$BACKUP_DIR/users-types.ts.backup"
  echo "  ✓ Backed up users/types.ts"
fi

if [ -f "src/types/auth.ts" ]; then
  cp "src/types/auth.ts" "$BACKUP_DIR/auth.ts.backup"
  echo "  ✓ Backed up auth.ts"
fi

if [ -f "src/components/admin/UserFormFields.tsx" ]; then
  cp "src/components/admin/UserFormFields.tsx" "$BACKUP_DIR/UserFormFields.tsx.backup"
  echo "  ✓ Backed up UserFormFields.tsx"
fi

if [ -f "src/app/[locale]/admin/users/constants.tsx" ]; then
  cp "src/app/[locale]/admin/users/constants.tsx" "$BACKUP_DIR/constants.tsx.backup"
  echo "  ✓ Backed up constants.tsx"
fi

echo ""

# Step 2: Replace files with .NEW versions
echo "Step 2: Replacing files with .NEW versions..."

if [ -f "backend/services/userService.js.NEW" ]; then
  cp "backend/services/userService.js.NEW" "backend/services/userService.js"
  echo "  ✓ Replaced userService.js"
fi

if [ -f "src/app/[locale]/admin/users/types.ts.NEW" ]; then
  cp "src/app/[locale]/admin/users/types.ts.NEW" "src/app/[locale]/admin/users/types.ts"
  echo "  ✓ Replaced users/types.ts"
fi

if [ -f "src/types/auth.ts.NEW" ]; then
  cp "src/types/auth.ts.NEW" "src/types/auth.ts"
  echo "  ✓ Replaced auth.ts"
fi

if [ -f "src/components/admin/UserFormFields.tsx.NEW" ]; then
  cp "src/components/admin/UserFormFields.tsx.NEW" "src/components/admin/UserFormFields.tsx"
  echo "  ✓ Replaced UserFormFields.tsx"
fi

if [ -f "src/app/[locale]/admin/users/constants.tsx.NEW" ]; then
  cp "src/app/[locale]/admin/users/constants.tsx.NEW" "src/app/[locale]/admin/users/constants.tsx"
  echo "  ✓ Replaced constants.tsx"
fi

echo ""

# Step 3: Database migrations (if psql is available)
echo "Step 3: Running database migrations..."
if command -v psql &> /dev/null; then
  echo "  PostgreSQL client found. Ready to run migrations."
  echo ""
  echo "  Please run the following SQL scripts manually:"
  echo "  1. migration/add_user_category_codes.sql - Add USER_CATEGORY codes"
  echo "  2. migration/upgrade_users_realistic.sql - Upgrade users table schema"
  echo ""
  echo "  Example: psql -h localhost -U your_user -d your_db -f migration/add_user_category_codes.sql"
  echo "           psql -h localhost -U your_user -d your_db -f migration/upgrade_users_realistic.sql"
else
  echo "  PostgreSQL client not found. Please run migrations manually."
  echo ""
  echo "  SQL files to run:"
  echo "  1. migration/add_user_category_codes.sql"
  echo "  2. migration/upgrade_users_realistic.sql"
fi

echo ""
echo "=========================================="
echo "User Table Upgrade Complete!"
echo "=========================================="
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Run the database migration SQL scripts"
echo "2. Test the application"
echo "3. If everything works, you can delete the .NEW files"
echo ""
