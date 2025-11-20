-- ==========================================
-- ASSIGN USERS TO EMPTY DEPARTMENTS
-- ==========================================
-- Randomly assign users to departments that have no users
-- Ensure every department has at least 1 user
--

BEGIN;

-- Step 1: Create temporary table with empty departments
DROP TABLE IF EXISTS temp_empty_depts;
CREATE TEMPORARY TABLE temp_empty_depts AS
SELECT d.id, d.code, d.name_en, d.level
FROM departments d
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.department = d.id
)
ORDER BY d.level, d.id;

-- Step 2: Show empty departments
SELECT '=== EMPTY DEPARTMENTS BEFORE ASSIGNMENT ===' as status;
SELECT * FROM temp_empty_depts;

-- Step 3: Assign 1-2 users to each empty department randomly
-- We'll pick users from populated departments and reassign them

DROP TABLE IF EXISTS temp_user_reassignment;
CREATE TEMPORARY TABLE temp_user_reassignment AS
WITH empty_dept_with_allocation AS (
    SELECT
        id as dept_id,
        code,
        name_en,
        level,
        -- Assign 1-2 users per empty dept (divisions get 2, others get 1)
        CASE WHEN level = 1 THEN 2 ELSE 1 END as users_needed,
        ROW_NUMBER() OVER (ORDER BY level, id) as dept_seq
    FROM temp_empty_depts
),
users_to_reassign AS (
    -- Get random users from departments that have multiple users
    SELECT DISTINCT ON (u.id)
        u.id as user_id,
        u.department as current_dept,
        (SELECT COUNT(*) FROM users u2 WHERE u2.department = u.department) as dept_user_count
    FROM users u
    WHERE u.id != 'admin'
        AND u.department IS NOT NULL
        AND (SELECT COUNT(*) FROM users u2 WHERE u2.department = u.department) > 1
    ORDER BY u.id, RANDOM()
),
numbered_users AS (
    SELECT
        user_id,
        current_dept,
        dept_user_count,
        ROW_NUMBER() OVER (ORDER BY RANDOM()) as user_seq
    FROM users_to_reassign
),
dept_ranges AS (
    SELECT
        dept_id,
        code,
        name_en,
        users_needed,
        SUM(users_needed) OVER (ORDER BY dept_seq ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as end_seq,
        SUM(users_needed) OVER (ORDER BY dept_seq ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) - users_needed + 1 as start_seq
    FROM empty_dept_with_allocation
)
SELECT
    nu.user_id,
    nu.current_dept,
    dr.dept_id as new_dept,
    dr.code as new_dept_code,
    dr.name_en as new_dept_name
FROM numbered_users nu
INNER JOIN dept_ranges dr ON nu.user_seq BETWEEN dr.start_seq AND dr.end_seq
ORDER BY dr.dept_id, nu.user_id;

-- Step 4: Show reassignment plan
SELECT '=== USER REASSIGNMENT PLAN ===' as status;
SELECT
    user_id,
    current_dept,
    new_dept,
    new_dept_code,
    new_dept_name
FROM temp_user_reassignment
ORDER BY new_dept, user_id;

-- Step 5: Execute reassignment
UPDATE users u
SET department = tur.new_dept
FROM temp_user_reassignment tur
WHERE u.id = tur.user_id;

-- Step 6: Show results
SELECT '=== REASSIGNMENT COMPLETE ===' as status;

-- Count updated users
SELECT
    'Total users reassigned' as metric,
    COUNT(*) as count
FROM temp_user_reassignment;

COMMIT;

-- Verification: Check if any departments are still empty
SELECT '=== VERIFICATION ===' as status;

SELECT
    'Departments still without users' as check_result,
    COUNT(*) as count
FROM departments d
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.department = d.id
);

-- Show all departments with user counts
SELECT
    'Department user distribution' as info;

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
    COUNT(d.id) as total_depts,
    COUNT(CASE WHEN user_count > 0 THEN 1 END) as depts_with_users,
    COUNT(CASE WHEN user_count = 0 THEN 1 END) as empty_depts,
    COALESCE(SUM(user_count), 0) as total_users,
    ROUND(AVG(user_count), 1) as avg_users_per_dept
FROM (
    SELECT
        d.id,
        d.level,
        COUNT(u.id) as user_count
    FROM departments d
    LEFT JOIN users u ON u.department = d.id
    GROUP BY d.id, d.level
) dept_stats
GROUP BY d.level
ORDER BY d.level;

-- Sample departments from each level
SELECT
    'Sample distribution by department' as info;

SELECT
    d.code,
    d.name_en,
    d.level,
    COUNT(u.id) as user_count
FROM departments d
LEFT JOIN users u ON u.department = d.id
GROUP BY d.id, d.code, d.name_en, d.level
ORDER BY d.level, user_count DESC, d.code
LIMIT 30;
