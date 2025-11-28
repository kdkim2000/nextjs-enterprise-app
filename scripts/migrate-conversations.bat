@echo off
REM ============================================
REM Claude Code Conversation Migration Batch
REM Windows Task Scheduler용 배치 파일
REM ============================================

REM 프로젝트 디렉토리로 이동
cd /d E:\apps\nextjs-enterprise-app

REM 로그 파일 설정
set LOG_DIR=logs\migration
set LOG_FILE=%LOG_DIR%\migration_%date:~0,4%%date:~5,2%%date:~8,2%.log

REM 로그 디렉토리 생성
if not exist %LOG_DIR% mkdir %LOG_DIR%

REM 마이그레이션 실행 (증분 모드)
echo [%date% %time%] Starting conversation migration... >> %LOG_FILE%
node scripts/migrate-conversations.js >> %LOG_FILE% 2>&1

REM SQL 파일이 생성되었는지 확인하고 DB에 적용
for /f %%i in ('dir /b /o-d migration\insert_conversations_*.sql 2^>nul') do (
    echo [%date% %time%] Applying SQL: %%i >> %LOG_FILE%
    set PGPASSWORD=AppUser2024!
    psql -h localhost -U app_user -d app_db -f migration\%%i >> %LOG_FILE% 2>&1
    goto :done_sql
)
:done_sql

echo [%date% %time%] Migration completed. >> %LOG_FILE%
