@echo off
REM ==========================================
REM Apply User Table Upgrade (Windows)
REM ==========================================
REM This script applies the user table upgrade by:
REM 1. Running database migrations
REM 2. Replacing .NEW files with originals
REM 3. Backing up original files

echo ==========================================
echo User Table Upgrade Script (Windows)
echo ==========================================
echo.

REM Step 1: Backup original files
echo Step 1: Backing up original files...
set BACKUP_DIR=backup\user-upgrade-%date:~10,4%%date:~4,2%%date:~7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
mkdir "%BACKUP_DIR%" 2>nul

if exist "backend\services\userService.js" (
  copy "backend\services\userService.js" "%BACKUP_DIR%\userService.js.backup" >nul
  echo   [OK] Backed up userService.js
)

if exist "src\app\[locale]\admin\users\types.ts" (
  copy "src\app\[locale]\admin\users\types.ts" "%BACKUP_DIR%\users-types.ts.backup" >nul
  echo   [OK] Backed up users/types.ts
)

if exist "src\types\auth.ts" (
  copy "src\types\auth.ts" "%BACKUP_DIR%\auth.ts.backup" >nul
  echo   [OK] Backed up auth.ts
)

if exist "src\components\admin\UserFormFields.tsx" (
  copy "src\components\admin\UserFormFields.tsx" "%BACKUP_DIR%\UserFormFields.tsx.backup" >nul
  echo   [OK] Backed up UserFormFields.tsx
)

if exist "src\app\[locale]\admin\users\constants.tsx" (
  copy "src\app\[locale]\admin\users\constants.tsx" "%BACKUP_DIR%\constants.tsx.backup" >nul
  echo   [OK] Backed up constants.tsx
)

echo.

REM Step 2: Replace files with .NEW versions
echo Step 2: Replacing files with .NEW versions...

if exist "backend\services\userService.js.NEW" (
  copy "backend\services\userService.js.NEW" "backend\services\userService.js" >nul
  echo   [OK] Replaced userService.js
)

if exist "src\app\[locale]\admin\users\types.ts.NEW" (
  copy "src\app\[locale]\admin\users\types.ts.NEW" "src\app\[locale]\admin\users\types.ts" >nul
  echo   [OK] Replaced users/types.ts
)

if exist "src\types\auth.ts.NEW" (
  copy "src\types\auth.ts.NEW" "src\types\auth.ts" >nul
  echo   [OK] Replaced auth.ts
)

if exist "src\components\admin\UserFormFields.tsx.NEW" (
  copy "src\components\admin\UserFormFields.tsx.NEW" "src\components\admin\UserFormFields.tsx" >nul
  echo   [OK] Replaced UserFormFields.tsx
)

if exist "src\app\[locale]\admin\users\constants.tsx.NEW" (
  copy "src\app\[locale]\admin\users\constants.tsx.NEW" "src\app\[locale]\admin\users\constants.tsx" >nul
  echo   [OK] Replaced constants.tsx
)

echo.

REM Step 3: Database migrations
echo Step 3: Running database migrations...
where psql >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  echo   PostgreSQL client found. Ready to run migrations.
  echo.
  echo   Please run the following SQL scripts manually:
  echo   1. migration\add_user_category_codes.sql - Add USER_CATEGORY codes
  echo   2. migration\upgrade_users_realistic.sql - Upgrade users table schema
  echo.
  echo   Example: psql -h localhost -U your_user -d your_db -f migration\add_user_category_codes.sql
  echo            psql -h localhost -U your_user -d your_db -f migration\upgrade_users_realistic.sql
) else (
  echo   PostgreSQL client not found. Please run migrations manually.
  echo.
  echo   SQL files to run:
  echo   1. migration\add_user_category_codes.sql
  echo   2. migration\upgrade_users_realistic.sql
)

echo.
echo ==========================================
echo User Table Upgrade Complete!
echo ==========================================
echo.
echo Backup location: %BACKUP_DIR%
echo.
echo Next steps:
echo 1. Run the database migration SQL scripts
echo 2. Test the application
echo 3. If everything works, you can delete the .NEW files
echo.
pause
