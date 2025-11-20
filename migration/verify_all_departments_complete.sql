-- ==========================================
-- VERIFY ALL DEPARTMENTS HAVE USERS
-- ==========================================
-- Final verification that every department has at least 1 user
--

-- Check for empty departments
SELECT
    'Departments without users' as check_result,
    COUNT(*) as count
FROM departments d
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.department = d.id
);

-- Summary by level
SELECT
    'Summary by organization level' as info;

WITH dept_user_counts AS (
    SELECT
        d.id,
        d.code,
        d.name_en,
        d.level,
        COUNT(u.id) as user_count
    FROM departments d
    LEFT JOIN users u ON u.department = d.id
    GROUP BY d.id, d.code, d.name_en, d.level
)
SELECT
    level,
    CASE
        WHEN level = 0 THEN '전사 (Company)'
        WHEN level = 1 THEN '부문 (Division)'
        WHEN level = 2 THEN '팀 (Team)'
        WHEN level = 3 THEN '부 (Department)'
        WHEN level = 4 THEN '과 (Section)'
        WHEN level = 5 THEN '직 (Unit)'
        WHEN level = 6 THEN '반 (Squad)'
    END as level_name,
    COUNT(*) as total_depts,
    COUNT(CASE WHEN user_count > 0 THEN 1 END) as depts_with_users,
    COUNT(CASE WHEN user_count = 0 THEN 1 END) as empty_depts,
    SUM(user_count) as total_users,
    ROUND(AVG(user_count), 1) as avg_users_per_dept,
    MIN(user_count) as min_users,
    MAX(user_count) as max_users
FROM dept_user_counts
GROUP BY level
ORDER BY level;

-- Overall statistics
SELECT
    'Overall statistics' as summary;

SELECT
    (SELECT COUNT(*) FROM departments) as total_departments,
    (SELECT COUNT(DISTINCT department) FROM users WHERE department IS NOT NULL) as departments_with_users,
    (SELECT COUNT(*) FROM users WHERE id != 'admin') as total_users_excluding_admin,
    (SELECT COUNT(*) FROM users) as total_users_including_admin;

-- Show departments with minimum users (to verify all have at least 1)
SELECT
    'Departments with fewest users' as info;

SELECT
    d.code,
    d.name_en,
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
    COUNT(u.id) as user_count
FROM departments d
LEFT JOIN users u ON u.department = d.id
GROUP BY d.id, d.code, d.name_en, d.level
ORDER BY user_count ASC, d.level, d.code
LIMIT 20;
