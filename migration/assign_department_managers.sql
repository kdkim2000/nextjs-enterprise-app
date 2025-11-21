-- ==========================================
-- ASSIGN MANAGERS TO ALL DEPARTMENTS
-- ==========================================
-- Select one user from each department as manager
-- Update their position based on organization level:
--   Level 0 (Company): 대표 (CEO)
--   Level 1 (Division): 부문장 (Division Head)
--   Level 2 (Team): 팀장 (Team Leader)
--   Level 3 (Department): 부장 (Department Head)
--   Level 4 (Section): 과장 (Section Chief)
--   Level 5 (Unit): 직장 (Unit Chief)
--   Level 6 (Squad): 반장 (Squad Leader)
--

BEGIN;

-- Step 1: Create temporary table with one random user per department
DROP TABLE IF EXISTS temp_dept_managers;
CREATE TEMPORARY TABLE temp_dept_managers AS
WITH dept_users AS (
    SELECT
        d.id as dept_id,
        d.code as dept_code,
        d.name_en as dept_name,
        d.level,
        u.id as user_id,
        u.name_ko,
        u.name_en,
        ROW_NUMBER() OVER (PARTITION BY d.id ORDER BY RANDOM()) as rn
    FROM departments d
    INNER JOIN users u ON u.department = d.id
    WHERE u.id != 'admin'  -- Don't make admin a department manager
)
SELECT
    dept_id,
    dept_code,
    dept_name,
    level,
    user_id,
    name_ko,
    name_en,
    CASE
        WHEN level = 0 THEN '대표'
        WHEN level = 1 THEN '부문장'
        WHEN level = 2 THEN '팀장'
        WHEN level = 3 THEN '부장'
        WHEN level = 4 THEN '과장'
        WHEN level = 5 THEN '직장'
        WHEN level = 6 THEN '반장'
    END as position_title
FROM dept_users
WHERE rn = 1
ORDER BY level, dept_id;

-- Step 2: Show manager assignments before execution
SELECT '=== MANAGER ASSIGNMENTS PREVIEW ===' as status;

SELECT
    dept_code,
    dept_name,
    level,
    CASE
        WHEN level = 0 THEN '전사'
        WHEN level = 1 THEN '부문'
        WHEN level = 2 THEN '팀'
        WHEN level = 3 THEN '부'
        WHEN level = 4 THEN '과'
        WHEN level = 5 THEN '직'
        WHEN level = 6 THEN '반'
    END as level_name,
    position_title,
    name_ko,
    name_en,
    user_id
FROM temp_dept_managers
ORDER BY level, dept_code
LIMIT 30;

-- Step 3: Update users table with manager positions
UPDATE users u
SET position = tdm.position_title
FROM temp_dept_managers tdm
WHERE u.id = tdm.user_id;

SELECT '=== USERS POSITIONS UPDATED ===' as status;
SELECT
    'Users updated with manager positions' as info,
    COUNT(*) as count
FROM temp_dept_managers;

-- Step 4: Update departments table with manager_id
UPDATE departments d
SET manager_id = tdm.user_id
FROM temp_dept_managers tdm
WHERE d.id = tdm.dept_id;

SELECT '=== DEPARTMENTS MANAGER_ID UPDATED ===' as status;
SELECT
    'Departments updated with manager_id' as info,
    COUNT(*) as count
FROM temp_dept_managers;

COMMIT;

-- Verification
SELECT '=== VERIFICATION ===' as status;

-- Count departments without managers
SELECT
    'Departments without managers' as check_result,
    COUNT(*) as count
FROM departments
WHERE manager_id IS NULL;

-- Summary by level
SELECT
    'Manager distribution by level' as summary;

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

-- Count managers by position
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

-- Sample manager details
SELECT
    'Sample manager details' as info;

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
    u.id as manager_id
FROM departments d
INNER JOIN users u ON d.manager_id = u.id
ORDER BY d.level, d.code
LIMIT 25;

-- Verify managers are actually in their departments
SELECT
    'Manager department verification' as check;

SELECT
    d.code as dept_code,
    d.name_en as dept_name,
    u.name_ko as manager_name,
    u.position,
    CASE
        WHEN u.department = d.id THEN '✓ OK'
        ELSE '✗ MISMATCH'
    END as verification_status
FROM departments d
INNER JOIN users u ON d.manager_id = u.id
WHERE u.department != d.id;

-- If above returns no rows, all managers are in correct departments
SELECT
    CASE
        WHEN NOT EXISTS (
            SELECT 1
            FROM departments d
            INNER JOIN users u ON d.manager_id = u.id
            WHERE u.department != d.id
        ) THEN '✅ All managers are in their assigned departments'
        ELSE '⚠️ Some managers are not in their assigned departments'
    END as final_verification;
