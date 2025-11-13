@echo off
REM ==============================================================================
REM Environment Configuration Checker
REM ==============================================================================

setlocal enabledelayedexpansion

echo ======================================
echo Environment Configuration Checker
echo ======================================
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo [ERROR] .env.local not found!
    echo.
    echo This file is required for the application to run.
    echo.
    echo [FIX] Creating .env.local from Next.js API Routes template...
    copy env.api-routes.template .env.local >nul
    echo [OK] Created .env.local
    echo.
    echo [INFO] You can now run: npm run dev
    echo.
    pause
    exit /b 0
)

echo [OK] .env.local exists
echo.

REM Check NEXT_PUBLIC_API_URL
findstr /C:"NEXT_PUBLIC_API_URL=/api" .env.local >nul
if %errorlevel% equ 0 (
    echo [OK] Mode: Next.js API Routes
    echo [INFO] API URL: /api
    echo [INFO] Backend: Next.js API Routes ^(port 3000^)
    echo.
    echo [INFO] Start server with:
    echo   npm run dev
    echo.
    echo [INFO] Access at:
    echo   http://localhost:3000
) else (
    findstr /C:"NEXT_PUBLIC_API_URL=http://localhost:3001/api" .env.local >nul
    if %errorlevel% equ 0 (
        echo [WARNING] Mode: Express Backend
        echo [INFO] API URL: http://localhost:3001/api
        echo [INFO] Backend: Express ^(port 3001^)
        echo.
        echo [INFO] Start server with:
        echo   npm run dev:express
        echo.
        echo [INFO] Or switch to Next.js API Routes mode:
        echo   switch-mode.bat
        echo.
        echo [WARNING] Make sure Express backend is running on port 3001!
    ) else (
        echo [ERROR] Invalid NEXT_PUBLIC_API_URL configuration
        echo.
        echo [FIX] Switching to Next.js API Routes mode...
        copy /Y env.api-routes.template .env.local >nul
        echo [OK] Configuration fixed
        echo.
        echo [INFO] Run: npm run dev
    )
)

echo.
echo ======================================
echo Configuration Check Complete
echo ======================================

pause
