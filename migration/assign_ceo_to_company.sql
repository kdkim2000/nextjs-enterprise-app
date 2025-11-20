-- ==========================================
-- ASSIGN CEO TO COMPANY LEVEL
-- ==========================================
-- Set admin as CEO (대표) of company level (DEPT-000)
--

BEGIN;

-- Update admin user position to CEO
UPDATE users
SET position = '대표',
    department = 'DEPT-000'
WHERE id = 'admin';

-- Set admin as manager of company level
UPDATE departments
SET manager_id = 'admin'
WHERE id = 'DEPT-000';

COMMIT;

-- Verification
SELECT '=== CEO ASSIGNMENT COMPLETE ===' as status;

-- Show company level details
SELECT
    'Company level details' as info;

SELECT
    d.code,
    d.name_en,
    d.name_ko,
    d.level,
    u.name_ko as ceo_name_ko,
    u.name_en as ceo_name_en,
    u.position,
    u.id as ceo_id
FROM departments d
INNER JOIN users u ON d.manager_id = u.id
WHERE d.id = 'DEPT-000';

-- Final verification: all departments should have managers
SELECT
    'Final manager verification' as check;

SELECT
    'Departments without managers' as result,
    COUNT(*) as count
FROM departments
WHERE manager_id IS NULL;

-- Manager summary by level
SELECT
    'Complete manager distribution' as summary;

SELECT
    d.level,
    CASE
        WHEN d.level = 0 THEN '전사 (Company)'
        WHEN d.level = 1 THEN '부문 (Division)'
        WHEN d.level = 2 THEN '팀 (Team)'
        WHEN d.level = 3 THEN '부 (Department)'
        WHEN d.level = 4 THEN '과 (Section)'
        WHEN d.level = 5 THEN '직 (Unit)'
        WHEN d.level = 6 THEN '반 (Squad)'
    END as level_name,
    COUNT(*) as total_depts,
    COUNT(d.manager_id) as depts_with_manager,
    COUNT(CASE WHEN d.manager_id IS NULL THEN 1 END) as depts_without_manager
FROM departments d
GROUP BY d.level
ORDER BY d.level;

-- Manager count by position (including CEO)
SELECT
    'Manager count by position' as info;

SELECT
    u.position,
    COUNT(*) as manager_count
FROM users u
WHERE u.position IN ('대표', '부문장', '팀장', '부장', '과장', '직장', '반장')
GROUP BY u.position
ORDER BY
    CASE u.position
        WHEN '대표' THEN 0
        WHEN '부문장' THEN 1
        WHEN '팀장' THEN 2
        WHEN '부장' THEN 3
        WHEN '과장' THEN 4
        WHEN '직장' THEN 5
        WHEN '반장' THEN 6
    END;
