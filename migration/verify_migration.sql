-- =============================================
-- DB Migration Verification Script
-- Run this after migration to verify data integrity
-- =============================================

-- 1. 테이블 수 확인
SELECT 'Table Count' as check_type,
       COUNT(*)::text as result,
       CASE WHEN COUNT(*) >= 40 THEN 'PASS' ELSE 'FAIL' END as status
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- 2. 주요 테이블 row count
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL SELECT 'departments', COUNT(*) FROM departments
UNION ALL SELECT 'roles', COUNT(*) FROM roles
UNION ALL SELECT 'menus', COUNT(*) FROM menus
UNION ALL SELECT 'programs', COUNT(*) FROM programs
UNION ALL SELECT 'role_program_mappings', COUNT(*) FROM role_program_mappings
UNION ALL SELECT 'user_role_mappings', COUNT(*) FROM user_role_mappings
UNION ALL SELECT 'codes', COUNT(*) FROM codes
UNION ALL SELECT 'board_types', COUNT(*) FROM board_types
UNION ALL SELECT 'posts', COUNT(*) FROM posts
UNION ALL SELECT 'app_settings', COUNT(*) FROM app_settings;

-- 3. admin 사용자 존재 확인
SELECT 'Admin User' as check_type,
       CASE WHEN EXISTS (SELECT 1 FROM users WHERE loginid = 'admin')
            THEN 'EXISTS' ELSE 'MISSING' END as result;

-- 4. admin 역할 권한 확인
SELECT 'Admin Role Mappings' as check_type,
       COUNT(*)::text as result
FROM role_program_mappings
WHERE role_id = 'role-001';

-- 5. 인덱스 확인
SELECT 'Indexes' as check_type,
       COUNT(*)::text as result
FROM pg_indexes
WHERE schemaname = 'public';

-- 6. 외래키 제약조건 확인
SELECT 'Foreign Keys' as check_type,
       COUNT(*)::text as result
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';

-- 7. DB 크기
SELECT 'Database Size' as check_type,
       pg_size_pretty(pg_database_size(current_database())) as result;
