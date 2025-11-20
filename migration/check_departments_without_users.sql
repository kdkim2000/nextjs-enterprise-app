-- ==========================================
-- CHECK DEPARTMENTS WITHOUT USERS
-- ==========================================
-- Find all departments that have no users assigned
--

-- Departments without users
SELECT
    'Departments without users' as info;

SELECT
    d.id,
    d.code,
    d.name_en,
    d.name_ko,
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
    COUNT(u.id) as user_count
FROM departments d
LEFT JOIN users u ON u.department = d.id
GROUP BY d.id, d.code, d.name_en, d.name_ko, d.level
HAVING COUNT(u.id) = 0
ORDER BY d.level, d.code;

-- Summary by level
SELECT
    'Empty departments by level' as summary;

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
    COUNT(*) as empty_dept_count
FROM departments d
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.department = d.id
)
GROUP BY d.level
ORDER BY d.level;

-- Total counts
SELECT
    'Overall statistics' as stats;

SELECT
    (SELECT COUNT(*) FROM departments) as total_departments,
    (SELECT COUNT(DISTINCT department) FROM users WHERE department IS NOT NULL) as departments_with_users,
    (SELECT COUNT(*) FROM departments WHERE NOT EXISTS (
        SELECT 1 FROM users u WHERE u.department = departments.id
    )) as empty_departments;
