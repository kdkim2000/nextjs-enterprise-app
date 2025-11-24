@echo off
REM Board Pages Refactoring Script for Windows
REM This script refactors write and edit pages to use the new PostFormPage component

echo =========================================
echo Board Pages Refactoring Script
echo =========================================
echo.

REM Paths
set "WRITE_PAGE=src\app\[locale]\boards\[boardTypeId]\write\page.tsx"
set "EDIT_PAGE=src\app\[locale]\boards\[boardTypeId]\[postId]\edit\page.tsx"
set "BACKUP_DIR=backup\%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "BACKUP_DIR=%BACKUP_DIR: =0%"

REM Step 1: Create backup directory
echo Step 1: Creating backup directory...
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
echo [OK] Backup directory created: %BACKUP_DIR%
echo.

REM Step 2: Backup existing files
echo Step 2: Backing up existing files...
if exist "%WRITE_PAGE%" (
  copy "%WRITE_PAGE%" "%BACKUP_DIR%\write-page.tsx.backup" > nul
  echo [OK] Backed up: %WRITE_PAGE%
) else (
  echo [ERROR] File not found: %WRITE_PAGE%
)

if exist "%EDIT_PAGE%" (
  copy "%EDIT_PAGE%" "%BACKUP_DIR%\edit-page.tsx.backup" > nul
  echo [OK] Backed up: %EDIT_PAGE%
) else (
  echo [ERROR] File not found: %EDIT_PAGE%
)
echo.

REM Step 3: Refactor write page
echo Step 3: Refactoring write page...
(
echo 'use client';
echo.
echo import React from 'react';
echo import { useParams } from 'next/navigation';
echo import PostFormPage from '@/components/boards/PostFormPage';
echo.
echo export default function PostWritePage^(^) {
echo   const params = useParams^(^);
echo   const boardTypeId = params.boardTypeId as string;
echo.
echo   return ^(
echo     ^<PostFormPage
echo       boardTypeId={boardTypeId}
echo       mode="create"
echo       basePath="/boards"
echo     /^>
echo   ^);
echo }
) > "%WRITE_PAGE%"
echo [OK] Write page refactored
echo.

REM Step 4: Refactor edit page
echo Step 4: Refactoring edit page...
(
echo 'use client';
echo.
echo import React from 'react';
echo import { useParams } from 'next/navigation';
echo import PostFormPage from '@/components/boards/PostFormPage';
echo.
echo export default function PostEditPage^(^) {
echo   const params = useParams^(^);
echo   const boardTypeId = params.boardTypeId as string;
echo   const postId = params.postId as string;
echo.
echo   return ^(
echo     ^<PostFormPage
echo       boardTypeId={boardTypeId}
echo       postId={postId}
echo       mode="edit"
echo       basePath="/boards"
echo     /^>
echo   ^);
echo }
) > "%EDIT_PAGE%"
echo [OK] Edit page refactored
echo.

REM Step 5: Summary
echo =========================================
echo Refactoring Complete!
echo =========================================
echo.
echo Summary:
echo   - Write page: %WRITE_PAGE%
echo   - Edit page: %EDIT_PAGE%
echo   - Backup location: %BACKUP_DIR%
echo.
echo Next steps:
echo   1. Test the refactored pages
echo   2. Check for any TypeScript errors
echo   3. Run the application and verify functionality
echo.
echo To rollback:
echo   copy "%BACKUP_DIR%\write-page.tsx.backup" "%WRITE_PAGE%"
echo   copy "%BACKUP_DIR%\edit-page.tsx.backup" "%EDIT_PAGE%"
echo.
pause
