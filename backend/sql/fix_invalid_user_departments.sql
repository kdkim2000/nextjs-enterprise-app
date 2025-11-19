-- Fix invalid department IDs in users table
-- This script updates users with invalid department IDs to valid department IDs from departments table

-- First, let's see how many users have invalid departments
-- SELECT COUNT(*) as invalid_count
-- FROM users u
-- LEFT JOIN departments d ON u.department = d.id
-- WHERE d.id IS NULL;

-- Update all users with invalid department IDs to a default department (DEPT-131 - IT Infrastructure)
UPDATE users
SET department = 'DEPT-131'
WHERE department NOT IN (SELECT id FROM departments)
AND department IS NOT NULL;

-- Alternatively, distribute users with invalid departments across multiple departments
-- UPDATE users
-- SET department = CASE
--     WHEN MOD(CAST(SUBSTRING(id FROM 6) AS INTEGER), 5) = 0 THEN 'DEPT-131'  -- IT Infrastructure
--     WHEN MOD(CAST(SUBSTRING(id FROM 6) AS INTEGER), 5) = 1 THEN 'DEPT-121'  -- Finance Accounting
--     WHEN MOD(CAST(SUBSTRING(id FROM 6) AS INTEGER), 5) = 2 THEN 'DEPT-111'  -- HR Recruitment
--     WHEN MOD(CAST(SUBSTRING(id FROM 6) AS INTEGER), 5) = 3 THEN 'DEPT-311'  -- Sales Seoul
--     ELSE 'DEPT-330'  -- Marketing Team
-- END
-- WHERE department NOT IN (SELECT id FROM departments)
-- AND department IS NOT NULL;

-- Verify the fix
SELECT
    COUNT(*) as total_users,
    COUNT(CASE WHEN d.id IS NULL THEN 1 END) as invalid_departments
FROM users u
LEFT JOIN departments d ON u.department = d.id;
