@echo off
REM ==============================================================================
REM Development Mode Switcher for Windows
REM ==============================================================================

setlocal enabledelayedexpansion

echo ======================================
echo Development Mode Switcher
echo ======================================
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo [WARNING] .env.local not found. Creating from template...
    copy env.api-routes.template .env.local >nul
    echo [OK] Created .env.local
)

echo Select development mode:
echo.
echo   1^) Next.js API Routes ^(권장^)
echo      - Frontend: http://localhost:3000
echo      - Backend: http://localhost:3000/api/*
echo      - Single process
echo      - Vercel과 동일한 환경
echo.
echo   2^) Express Backend ^(레거시^)
echo      - Frontend: http://localhost:3000
echo      - Backend: http://localhost:3001/api/*
echo      - Two processes
echo      - Express 서버 사용
echo.

set /p choice="Enter choice [1-2]: "

if "%choice%"=="1" (
    echo [INFO] Switching to Next.js API Routes mode...
    copy /Y env.api-routes.template .env.local >nul
    echo [OK] Configuration updated
    echo.
    echo [INFO] Start development server with:
    echo   npm run dev
    echo.
    echo [INFO] Access application at:
    echo   http://localhost:3000
) else if "%choice%"=="2" (
    echo [INFO] Switching to Express Backend mode...
    copy /Y env.express.template .env.local >nul
    echo [OK] Configuration updated
    echo.
    echo [INFO] Start development server with:
    echo   npm run dev:express
    echo.
    echo [INFO] Access application at:
    echo   Frontend: http://localhost:3000
    echo   Backend:  http://localhost:3001
) else (
    echo [WARNING] Invalid choice. No changes made.
    exit /b 1
)

echo.
echo [OK] Mode switched successfully!
echo.
pause
