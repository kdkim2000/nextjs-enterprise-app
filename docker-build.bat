@echo off
REM ==============================================================================
REM Docker Build and Test Script for Windows
REM ==============================================================================

setlocal enabledelayedexpansion

echo ======================================
echo Docker Build and Test Script
echo ======================================
echo.

REM Configuration
set IMAGE_NAME=nextjs-enterprise-app
set IMAGE_TAG=latest
set CONTAINER_NAME=nextjs-enterprise-app-test
set PORT=3000

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

echo [OK] Docker is installed
docker --version
echo.

REM Clean up previous container if exists
docker ps -aq -f name=%CONTAINER_NAME% >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Removing existing container...
    docker rm -f %CONTAINER_NAME% >nul 2>&1
)

REM Build Docker image
echo ======================================
echo Building Docker image...
echo ======================================
docker build -t %IMAGE_NAME%:%IMAGE_TAG% .

if %errorlevel% neq 0 (
    echo [ERROR] Docker image build failed
    exit /b 1
)

echo [OK] Docker image built successfully
echo.

REM Check image size
echo ======================================
echo Image Information
echo ======================================
docker images | findstr %IMAGE_NAME%
echo.

REM Run container
echo ======================================
echo Starting Docker container...
echo ======================================
docker run -d ^
  --name %CONTAINER_NAME% ^
  -p %PORT%:3000 ^
  -e NEXT_PUBLIC_API_URL=/api ^
  -e JWT_SECRET=test-secret-key-for-development-only-32chars ^
  -e JWT_REFRESH_SECRET=test-refresh-secret-key-for-development-32ch ^
  %IMAGE_NAME%:%IMAGE_TAG%

if %errorlevel% neq 0 (
    echo [ERROR] Container failed to start
    exit /b 1
)

echo [OK] Container started successfully
echo.

REM Wait for application to start
echo Waiting for application to start...
timeout /t 10 /nobreak >nul

REM Check container status
echo ======================================
echo Container Status
echo ======================================
docker ps -f name=%CONTAINER_NAME%
echo.

REM Check logs
echo ======================================
echo Container Logs (last 20 lines)
echo ======================================
docker logs --tail 20 %CONTAINER_NAME%
echo.

REM Health check
echo ======================================
echo Health Check
echo ======================================
curl -f http://localhost:%PORT%/api/health 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Health check failed or curl not available
)
echo.
echo.

REM Instructions
echo ======================================
echo Docker Container Running!
echo ======================================
echo [OK] Application is available at: http://localhost:%PORT%
echo.
echo Useful commands:
echo   - View logs:       docker logs -f %CONTAINER_NAME%
echo   - Stop container:  docker stop %CONTAINER_NAME%
echo   - Start container: docker start %CONTAINER_NAME%
echo   - Remove container: docker rm -f %CONTAINER_NAME%
echo   - Access shell:    docker exec -it %CONTAINER_NAME% sh
echo.
echo To stop and clean up:
echo   docker stop %CONTAINER_NAME% ^&^& docker rm %CONTAINER_NAME%
echo.

pause
