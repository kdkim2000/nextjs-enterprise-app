@echo off
REM Test Migration Script for Windows
REM This script helps you test the migration before running it

echo ========================================
echo PostgreSQL Migration Test
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if config file exists
if not exist migrate.config.json (
    echo ERROR: migrate.config.json not found
    echo Please copy migrate.config.json.example to migrate.config.json
    echo and update with your database credentials
    pause
    exit /b 1
)

echo Config file found: migrate.config.json
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo ========================================
echo Running Dry-Run Migration Test
echo ========================================
echo.
echo This will simulate the migration without making any changes to the database.
echo.

node migrate.js --dry-run --verbose

echo.
echo ========================================
echo Test Complete
echo ========================================
echo.
echo If the dry-run looks good, you can run the actual migration with:
echo   node migrate.js
echo.
echo Or use the verification script after migration:
echo   node verify.js
echo.

pause
