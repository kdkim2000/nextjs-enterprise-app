-- ==========================================
-- UPDATE USER ROLE MAPPINGS
-- ==========================================
-- Assign roles based on user position:
--   admin user -> role-001 (admin)
--   Department managers -> role-002 (manager)
--   All other users -> role-003 (user)
-- Delete all existing mappings and create new ones
--

BEGIN;

-- Step 1: Delete all existing user role mappings
DELETE FROM user_role_mappings;

SELECT '=== EXISTING MAPPINGS DELETED ===' as status;

-- Step 2: Create temporary table with all users and their assigned roles
DROP TABLE IF EXISTS temp_user_roles;
CREATE TEMPORARY TABLE temp_user_roles AS
WITH manager_users AS (
    -- Get all users who are managers of departments
    SELECT DISTINCT manager_id as user_id
    FROM departments
    WHERE manager_id IS NOT NULL
        AND manager_id != 'admin'
)
SELECT
    u.id as user_id,
    CASE
        WHEN u.id = 'admin' THEN 'role-001'  -- Admin role
        WHEN EXISTS (SELECT 1 FROM manager_users mu WHERE mu.user_id = u.id) THEN 'role-002'  -- Manager role
        ELSE 'role-003'  -- User role
    END as role_id,
    CASE
        WHEN u.id = 'admin' THEN 'admin'
        WHEN EXISTS (SELECT 1 FROM manager_users mu WHERE mu.user_id = u.id) THEN 'manager'
        ELSE 'user'
    END as role_name
FROM users u;

-- Step 3: Show role distribution before insertion
SELECT '=== ROLE DISTRIBUTION PREVIEW ===' as status;

SELECT
    role_id,
    role_name,
    COUNT(*) as user_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
FROM temp_user_roles
GROUP BY role_id, role_name
ORDER BY role_id;

-- Step 4: Insert new user role mappings
INSERT INTO user_role_mappings (
    id,
    user_id,
    role_id,
    assigned_by,
    assigned_at,
    expires_at,
    is_active
)
SELECT
    'URM-' || user_id || '-' || role_id as id,
    user_id,
    role_id,
    'system',
    NOW(),
    NULL,  -- No expiration
    true
FROM temp_user_roles;

SELECT '=== USER ROLE MAPPINGS CREATED ===' as status;

SELECT
    'Total mappings created' as info,
    COUNT(*) as count
FROM user_role_mappings;

COMMIT;

-- Verification
SELECT '=== VERIFICATION ===' as status;

-- Role assignment counts
SELECT
    'Role assignment summary' as section;

SELECT
    r.id as role_id,
    r.name as role_name,
    r.display_name,
    COUNT(urm.user_id) as assigned_users
FROM roles r
LEFT JOIN user_role_mappings urm ON r.id = urm.role_id
WHERE r.id IN ('role-001', 'role-002', 'role-003')
GROUP BY r.id, r.name, r.display_name
ORDER BY r.id;

-- Verify admin has admin role
SELECT
    'Admin role verification' as check;

SELECT
    u.id,
    u.loginid,
    u.name_en,
    u.position,
    r.name as role_name,
    r.display_name as role_display_name
FROM users u
INNER JOIN user_role_mappings urm ON u.id = urm.user_id
INNER JOIN roles r ON urm.role_id = r.id
WHERE u.id = 'admin';

-- Verify managers have manager role
SELECT
    'Manager role verification (sample)' as check;

SELECT
    u.id,
    u.name_ko,
    u.name_en,
    u.position,
    d.code as manages_dept,
    d.name_en as dept_name,
    r.name as role_name
FROM users u
INNER JOIN user_role_mappings urm ON u.id = urm.user_id
INNER JOIN roles r ON urm.role_id = r.id
INNER JOIN departments d ON u.id = d.manager_id
WHERE r.id = 'role-002'
ORDER BY d.level, d.code
LIMIT 15;

-- Verify regular users have user role
SELECT
    'Regular user role verification (sample)' as check;

SELECT
    u.id,
    u.name_ko,
    u.name_en,
    u.position,
    r.name as role_name
FROM users u
INNER JOIN user_role_mappings urm ON u.id = urm.user_id
INNER JOIN roles r ON urm.role_id = r.id
WHERE r.id = 'role-003'
ORDER BY u.id
LIMIT 10;

-- Check for users without role mappings
SELECT
    'Users without role mappings' as check;

SELECT
    COUNT(*) as count
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_role_mappings urm WHERE urm.user_id = u.id
);

-- Position vs Role correlation
SELECT
    'Position vs Role distribution' as analysis;

SELECT
    u.position,
    r.name as role_name,
    COUNT(*) as user_count
FROM users u
INNER JOIN user_role_mappings urm ON u.id = urm.user_id
INNER JOIN roles r ON urm.role_id = r.id
WHERE r.id IN ('role-001', 'role-002', 'role-003')
GROUP BY u.position, r.name
ORDER BY
    CASE u.position
        WHEN '대표' THEN 0
        WHEN '부문장' THEN 1
        WHEN '팀장' THEN 2
        WHEN '부장' THEN 3
        WHEN '과장' THEN 4
        WHEN '직장' THEN 5
        WHEN '반장' THEN 6
        WHEN '프로' THEN 7
    END,
    r.name;

-- Final summary
SELECT
    '=== FINAL SUMMARY ===' as status;

SELECT
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM user_role_mappings) as total_role_mappings,
    (SELECT COUNT(*) FROM user_role_mappings WHERE role_id = 'role-001') as admin_users,
    (SELECT COUNT(*) FROM user_role_mappings WHERE role_id = 'role-002') as manager_users,
    (SELECT COUNT(*) FROM user_role_mappings WHERE role_id = 'role-003') as regular_users;
