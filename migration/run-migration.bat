@echo off
chcp 65001 >nul
echo Starting PostgreSQL migration...
echo.

echo Step 1: Recreating database with UTF8 encoding...
set PGPASSWORD=PostgreSQL2024!
psql -U postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'nextjs_enterprise_app' AND pid <> pg_backend_pid();"
psql -U postgres -c "DROP DATABASE IF EXISTS nextjs_enterprise_app;"
psql -U postgres -c "DROP USER IF EXISTS app_user;"
psql -U postgres -c "CREATE USER app_user WITH PASSWORD 'AppUser2024!';"
psql -U postgres -c "CREATE DATABASE nextjs_enterprise_app WITH ENCODING = 'UTF8' LC_COLLATE = 'C' LC_CTYPE = 'C' TEMPLATE = template0 CONNECTION LIMIT = -1;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE nextjs_enterprise_app TO app_user;"
echo Done!
echo.

echo Step 2: Granting schema privileges...
psql -U postgres -d nextjs_enterprise_app -c "GRANT ALL ON SCHEMA public TO app_user;"
psql -U postgres -d nextjs_enterprise_app -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user;"
psql -U postgres -d nextjs_enterprise_app -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_user;"
psql -U postgres -d nextjs_enterprise_app -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO app_user;"
echo Done!
echo.

echo Step 3: Creating schema...
set PGPASSWORD=AppUser2024!
psql -U app_user -d nextjs_enterprise_app -f migration\sql\01-schema.sql
echo Done!
echo.

echo Step 4: Running migration script...
node migration\migrate-to-postgresql.js
echo.

echo Step 5: Validating migration...
node migration\validate.js
echo.

echo Migration completed!
pause
