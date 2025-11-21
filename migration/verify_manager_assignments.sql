-- ==========================================
-- VERIFY MANAGER ASSIGNMENTS
-- ==========================================
-- Comprehensive verification of all manager assignments
--

-- Check for departments without managers
SELECT
    '=== DEPARTMENT MANAGER COVERAGE ===' as status;

SELECT
    'Departments without managers' as check,
    COUNT(*) as count
FROM departments
WHERE manager_id IS NULL;

-- Manager distribution by organizational level
SELECT
    '=== MANAGER DISTRIBUTION BY LEVEL ===' as section;

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
    COUNT(*) as total_departments,
    COUNT(manager_id) as with_manager,
    COUNT(CASE WHEN manager_id IS NULL THEN 1 END) as without_manager,
    ROUND(COUNT(manager_id) * 100.0 / COUNT(*), 1) as coverage_percentage
FROM departments d
GROUP BY d.level
ORDER BY d.level;

-- Manager count by position title
SELECT
    '=== MANAGER COUNT BY POSITION ===' as section;

SELECT
    u.position,
    CASE u.position
        WHEN '대표' THEN 'CEO'
        WHEN '부문장' THEN 'Division Head'
        WHEN '팀장' THEN 'Team Leader'
        WHEN '부장' THEN 'Department Head'
        WHEN '과장' THEN 'Section Chief'
        WHEN '직장' THEN 'Unit Chief'
        WHEN '반장' THEN 'Squad Leader'
    END as position_en,
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

-- Sample managers from each level
SELECT
    '=== SAMPLE MANAGERS BY LEVEL ===' as section;

WITH ranked_managers AS (
    SELECT
        d.level,
        CASE
            WHEN d.level = 0 THEN '전사'
            WHEN d.level = 1 THEN '부문'
            WHEN d.level = 2 THEN '팀'
            WHEN d.level = 3 THEN '부'
            WHEN d.level = 4 THEN '과'
            WHEN d.level = 5 THEN '직'
            WHEN d.level = 6 THEN '반'
        END as level_name,
        d.code as dept_code,
        d.name_en as dept_name,
        u.name_ko as manager_name_ko,
        u.name_en as manager_name_en,
        u.position,
        u.email,
        ROW_NUMBER() OVER (PARTITION BY d.level ORDER BY d.code) as rn
    FROM departments d
    INNER JOIN users u ON d.manager_id = u.id
)
SELECT
    level,
    level_name,
    dept_code,
    dept_name,
    manager_name_ko,
    manager_name_en,
    position,
    email
FROM ranked_managers
WHERE rn <= 3
ORDER BY level, dept_code;

-- Verify managers are in their departments
SELECT
    '=== MANAGER-DEPARTMENT CONSISTENCY CHECK ===' as section;

SELECT
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM departments d
            INNER JOIN users u ON d.manager_id = u.id
            WHERE u.department != d.id
        ) THEN '⚠️ Some managers are not in their assigned departments'
        ELSE '✅ All managers are correctly assigned to their departments'
    END as consistency_check;

-- List any inconsistent managers (if any)
SELECT
    d.code as dept_code,
    d.name_en as dept_name,
    u.name_ko as manager_name,
    u.position,
    d.id as dept_id,
    u.department as manager_dept_id,
    '✗ MISMATCH' as status
FROM departments d
INNER JOIN users u ON d.manager_id = u.id
WHERE u.department != d.id;

-- Position distribution in entire organization
SELECT
    '=== OVERALL POSITION DISTRIBUTION ===' as section;

SELECT
    COALESCE(u.position, 'No Position') as position,
    COUNT(*) as user_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
FROM users u
GROUP BY u.position
ORDER BY COUNT(*) DESC;

-- Final summary
SELECT
    '=== FINAL SUMMARY ===' as section;

SELECT
    'Total Departments' as metric,
    COUNT(*) as value
FROM departments
UNION ALL
SELECT
    'Departments with Managers',
    COUNT(*)
FROM departments
WHERE manager_id IS NOT NULL
UNION ALL
SELECT
    'Total Managers Assigned',
    COUNT(*)
FROM users
WHERE position IN ('대표', '부문장', '팀장', '부장', '과장', '직장', '반장')
UNION ALL
SELECT
    'Total Users',
    COUNT(*)
FROM users
UNION ALL
SELECT
    'Regular Employees (프로)',
    COUNT(*)
FROM users
WHERE position = '프로' OR position IS NULL
ORDER BY metric DESC;
