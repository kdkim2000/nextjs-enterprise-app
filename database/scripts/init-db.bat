@echo off
REM DB 초기화 스크립트 (Windows)
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set DATABASE_DIR=%SCRIPT_DIR%..

REM 기본값
if "%DB_TYPE%"=="" set DB_TYPE=postgres
if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_PORT%"=="" set DB_PORT=5432
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

echo DB Configuration:
echo   Type: %DB_TYPE%
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   Database: %DB_NAME%
echo   User: %DB_USER%

REM Liquibase 실행
echo.
echo Running Liquibase migration...

cd /d "%DATABASE_DIR%"

where liquibase >nul 2>nul
if %errorlevel%==0 (
    liquibase --defaults-file=liquibase-%DB_TYPE%.properties update
) else (
    where docker >nul 2>nul
    if %errorlevel%==0 (
        docker run --rm ^
            -v "%DATABASE_DIR%:/liquibase/changelog" ^
            -e DB_HOST=%DB_HOST% ^
            -e DB_PORT=%DB_PORT% ^
            -e DB_NAME=%DB_NAME% ^
            -e DB_USER=%DB_USER% ^
            -e DB_PASSWORD=%DB_PASSWORD% ^
            liquibase/liquibase ^
            --defaults-file=/liquibase/changelog/liquibase-%DB_TYPE%.properties ^
            update
    ) else (
        echo Error: Neither liquibase nor docker is installed
        exit /b 1
    )
)

if %errorlevel% neq 0 (
    echo Migration failed!
    exit /b 1
)

echo Migration completed successfully!

REM Seed 데이터 적재 (PostgreSQL)
if "%DB_TYPE%"=="postgres" (
    echo.
    echo Loading required seed data...

    for %%f in ("%DATABASE_DIR%\seed\required\*.sql") do (
        echo   Executing: %%~nxf
        set PGPASSWORD=%DB_PASSWORD%
        psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%%f" -q
    )

    if "%INCLUDE_SAMPLE%"=="true" (
        echo.
        echo Loading sample seed data...
        for %%f in ("%DATABASE_DIR%\seed\sample\*.sql") do (
            echo   Executing: %%~nxf
            psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%%f" -q
        )
    )
)

echo.
echo ==================================
echo   DB Initialization Complete!
echo ==================================

endlocal
