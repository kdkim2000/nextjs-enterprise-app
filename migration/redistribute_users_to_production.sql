-- ==========================================
-- REDISTRIBUTE USERS TO PRODUCTION DIVISION
-- ==========================================
-- Allocate 50% of users to production division
-- Ratio - Team:Dept:Section:Unit:Squad = 2:5:20:2:20
-- All organizations must have at least 1 person
--

BEGIN;

-- Step 1: Get production division departments by level
DROP TABLE IF EXISTS temp_prod_depts;
CREATE TEMPORARY TABLE temp_prod_depts AS
WITH RECURSIVE prod_tree AS (
    SELECT id, code, level, parent_id
    FROM departments
    WHERE id = 'DEPT-200'

    UNION ALL

    SELECT d.id, d.code, d.level, d.parent_id
    FROM departments d
    INNER JOIN prod_tree pt ON d.parent_id = pt.id
)
SELECT id, code, level
FROM prod_tree
WHERE level >= 2  -- Only teams and below
ORDER BY level, id;

-- Step 2: Get statistics
DO $$
DECLARE
    total_users INTEGER;
    prod_users INTEGER;
    team_count INTEGER;
    dept_count INTEGER;
    section_count INTEGER;
    unit_count INTEGER;
    squad_count INTEGER;

    team_allocation INTEGER;
    dept_allocation INTEGER;
    section_allocation INTEGER;
    unit_allocation INTEGER;
    squad_allocation INTEGER;

    users_per_team INTEGER;
    users_per_dept INTEGER;
    users_per_section INTEGER;
    users_per_unit INTEGER;
    users_per_squad INTEGER;
BEGIN
    -- Get total regular users (excluding admin)
    SELECT COUNT(*) INTO total_users FROM users WHERE id != 'admin';

    -- 50% to production
    prod_users := FLOOR(total_users * 0.5);

    -- Count departments by level
    SELECT COUNT(*) INTO team_count FROM temp_prod_depts WHERE level = 2;
    SELECT COUNT(*) INTO dept_count FROM temp_prod_depts WHERE level = 3;
    SELECT COUNT(*) INTO section_count FROM temp_prod_depts WHERE level = 4;
    SELECT COUNT(*) INTO unit_count FROM temp_prod_depts WHERE level = 5;
    SELECT COUNT(*) INTO squad_count FROM temp_prod_depts WHERE level = 6;

    RAISE NOTICE 'Total users: %, Production allocation: %', total_users, prod_users;
    RAISE NOTICE 'Teams: %, Depts: %, Sections: %, Units: %, Squads: %',
        team_count, dept_count, section_count, unit_count, squad_count;

    -- Calculate allocation by ratio 2:5:20:2:20 (total = 49)
    team_allocation := FLOOR(prod_users * 2.0 / 49.0);
    dept_allocation := FLOOR(prod_users * 5.0 / 49.0);
    section_allocation := FLOOR(prod_users * 20.0 / 49.0);
    unit_allocation := FLOOR(prod_users * 2.0 / 49.0);
    squad_allocation := prod_users - team_allocation - dept_allocation - section_allocation - unit_allocation;

    RAISE NOTICE 'Allocation - Teams: %, Depts: %, Sections: %, Units: %, Squads: %',
        team_allocation, dept_allocation, section_allocation, unit_allocation, squad_allocation;

    -- Calculate users per organization (ensuring at least 1)
    users_per_team := GREATEST(1, FLOOR(team_allocation::NUMERIC / team_count));
    users_per_dept := GREATEST(1, FLOOR(dept_allocation::NUMERIC / dept_count));
    users_per_section := GREATEST(1, FLOOR(section_allocation::NUMERIC / section_count));
    users_per_unit := GREATEST(1, FLOOR(unit_allocation::NUMERIC / unit_count));
    users_per_squad := GREATEST(1, FLOOR(squad_allocation::NUMERIC / squad_count));

    RAISE NOTICE 'Per org - Team: %, Dept: %, Section: %, Unit: %, Squad: %',
        users_per_team, users_per_dept, users_per_section, users_per_unit, users_per_squad;
END $$;

-- Step 3: Create allocation table
DROP TABLE IF EXISTS temp_user_allocation;
CREATE TEMPORARY TABLE temp_user_allocation AS
WITH dept_with_allocation AS (
    SELECT
        id,
        level,
        CASE
            WHEN level = 2 THEN FLOOR(14998 * 2.0 / 49.0 / 7)  -- ~87 per team
            WHEN level = 3 THEN FLOOR(14998 * 5.0 / 49.0 / 6)  -- ~255 per dept
            WHEN level = 4 THEN FLOOR(14998 * 20.0 / 49.0 / 12) -- ~510 per section
            WHEN level = 5 THEN FLOOR(14998 * 2.0 / 49.0 / 16) -- ~38 per unit
            WHEN level = 6 THEN FLOOR(14998 * 20.0 / 49.0 / 17) -- ~360 per squad
        END as target_users,
        ROW_NUMBER() OVER (PARTITION BY level ORDER BY id) as dept_seq
    FROM temp_prod_depts
)
SELECT
    id,
    level,
    -- Ensure at least 1 user per org, adjust last org in each level to match exact total
    CASE
        WHEN level = 2 AND dept_seq = 7 THEN 88  -- Last team gets remainder
        WHEN level = 3 AND dept_seq = 6 THEN 255 -- Last dept gets remainder
        WHEN level = 4 AND dept_seq = 12 THEN 514 -- Last section gets remainder
        WHEN level = 5 AND dept_seq = 16 THEN 42  -- Last unit gets remainder
        WHEN level = 6 AND dept_seq = 17 THEN 361 -- Last squad gets remainder
        ELSE target_users
    END as target_users
FROM dept_with_allocation;

-- Step 4: Assign users to production departments
DROP TABLE IF EXISTS temp_user_dept_assignment;
CREATE TEMPORARY TABLE temp_user_dept_assignment AS
WITH numbered_users AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY RANDOM()) as user_seq
    FROM users
    WHERE id != 'admin'
    LIMIT 14998
),
dept_ranges AS (
    SELECT
        id as dept_id,
        level,
        target_users,
        SUM(target_users) OVER (ORDER BY level, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as end_seq,
        SUM(target_users) OVER (ORDER BY level, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) - target_users + 1 as start_seq
    FROM temp_user_allocation
)
SELECT
    nu.id as user_id,
    dr.dept_id
FROM numbered_users nu
INNER JOIN dept_ranges dr ON nu.user_seq BETWEEN dr.start_seq AND dr.end_seq;

-- Step 5: Update users table
UPDATE users u
SET department = tuda.dept_id
FROM temp_user_dept_assignment tuda
WHERE u.id = tuda.user_id;

COMMIT;

-- Verification
SELECT '=== USER REDISTRIBUTION COMPLETE ===' as status;

-- Count users by level in production division
SELECT
    'Users by level in production' as info;
SELECT
    d.level,
    CASE
        WHEN d.level = 2 THEN '팀 (Team)'
        WHEN d.level = 3 THEN '부 (Department)'
        WHEN d.level = 4 THEN '과 (Section)'
        WHEN d.level = 5 THEN '직 (Unit)'
        WHEN d.level = 6 THEN '반 (Squad)'
    END as level_name,
    COUNT(u.id) as user_count,
    ROUND(COUNT(u.id) * 100.0 / (SELECT COUNT(*) FROM users WHERE id != 'admin'), 2) as percentage
FROM users u
INNER JOIN departments d ON u.department = d.id
WHERE d.id IN (SELECT id FROM temp_prod_depts)
GROUP BY d.level
ORDER BY d.level;

-- Total production users
SELECT
    'Total users in production' as metric,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE id != 'admin'), 2) as percentage
FROM users
WHERE department IN (SELECT id FROM temp_prod_depts);

-- Check all orgs have users
SELECT
    'Organizations without users' as check_result,
    COUNT(*) as count
FROM temp_prod_depts tpd
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.department = tpd.id
);

-- Sample distribution
SELECT
    'Sample user distribution' as info;
SELECT
    d.level,
    d.code,
    COUNT(u.id) as user_count
FROM temp_prod_depts d
LEFT JOIN users u ON u.department = d.id
GROUP BY d.level, d.code, d.id
ORDER BY d.level, d.id
LIMIT 20;
