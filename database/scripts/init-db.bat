@echo off
REM DB 초기화 스크립트 (Windows)
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0

REM 기본값
if "%DB_TYPE%"=="" set DB_TYPE=postgres
if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_NAME%"=="" set DB_NAME=corenextdb
if "%DB_USER%"=="" set DB_USER=corenext

echo ==================================
echo   DB Initialization Script
echo ==================================

REM 환경변수 확인
if "%DB_PASSWORD%"=="" (
    echo Error: DB_PASSWORD is required
    exit /b 1
)

REM DB 타입별 포트 설정
if "%DB_TYPE%"=="oracle" (
    if "%DB_PORT%"=="" set DB_PORT=1521
    if "%DB_SERVICE%"=="" set DB_SERVICE=ORCL
) else if "%DB_TYPE%"=="mysql" (
    if "%DB_PORT%"=="" set DB_PORT=3306
) else (
    if "%DB_PORT%"=="" set DB_PORT=5432
)

echo DB Config: %DB_TYPE% @ %DB_HOST%:%DB_PORT%

if "%DB_TYPE%"=="postgres" (
    echo.
    echo Applying PostgreSQL schema...
    set PGPASSWORD=%DB_PASSWORD%
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%SCRIPT_DIR%original-schema.sql" -q

    echo Loading master data...
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%SCRIPT_DIR%master-data.sql" -q

    if "%INCLUDE_SAMPLE%"=="true" (
        echo Loading content data...
        psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%SCRIPT_DIR%content-data.sql" -q
    )

    if "%INCLUDE_COMM%"=="true" (
        echo Loading communication data...
        psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%SCRIPT_DIR%comm-data.sql" -q
    )
)

if "%DB_TYPE%"=="oracle" (
    echo.
    echo Applying Oracle schema...
    echo exit | sqlplus -s %DB_USER%/%DB_PASSWORD%@//%DB_HOST%:%DB_PORT%/%DB_SERVICE% @"%SCRIPT_DIR%original-schema-oracle.sql"

    if exist "%SCRIPT_DIR%master-data-oracle.sql" (
        echo Loading master data...
        echo exit | sqlplus -s %DB_USER%/%DB_PASSWORD%@//%DB_HOST%:%DB_PORT%/%DB_SERVICE% @"%SCRIPT_DIR%master-data-oracle.sql"
    )
)

if "%DB_TYPE%"=="mysql" (
    echo.
    echo Applying MySQL/MariaDB schema...
    mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < "%SCRIPT_DIR%original-schema-mysql.sql"

    echo Loading data via Node.js script...
    cd /d "%SCRIPT_DIR%"
    set DATA_OPTS=--master
    if "%INCLUDE_SAMPLE%"=="true" set DATA_OPTS=%DATA_OPTS% --content
    if "%INCLUDE_COMM%"=="true" set DATA_OPTS=%DATA_OPTS% --comm
    node load-mysql-data.js %DATA_OPTS%
)

echo.
echo ==================================
echo   DB Initialization Complete!
echo ==================================

endlocal
