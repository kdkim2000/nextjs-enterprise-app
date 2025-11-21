-- ==========================================
-- UPDATE USER DATA - Complete Overhaul
-- ==========================================
-- This script updates:
-- 1. User IDs to U + 12-digit numbers
-- 2. Employee numbers to 6-digit numbers (100001~)
-- 3. Position to "프로" for all users
-- 4. Department distribution: 팀(5%), 부(5%), 과(90%)
--

BEGIN;

-- Step 1: Add temporary column for new IDs
ALTER TABLE users ADD COLUMN IF NOT EXISTS new_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS new_employee_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS new_department VARCHAR(50);

-- Step 2: Generate new IDs and employee numbers using CTE
WITH numbered_users AS (
    SELECT
        id,
        'U' || LPAD((ROW_NUMBER() OVER (ORDER BY created_at, id))::TEXT, 12, '0') as gen_new_id,
        LPAD((100000 + ROW_NUMBER() OVER (ORDER BY created_at, id))::TEXT, 6, '0') as gen_new_emp_num
    FROM users
)
UPDATE users u
SET
    new_id = nu.gen_new_id,
    new_employee_number = nu.gen_new_emp_num
FROM numbered_users nu
WHERE u.id = nu.id;

-- Step 3: Set position to "프로" for all users
UPDATE users
SET position = '프로'
WHERE position IS NULL OR position != '프로';

-- Step 4: Assign departments based on distribution (5% 팀, 5% 부, 90% 과)
DO $$
DECLARE
    team_depts TEXT[] := ARRAY[
        'DEPT-340', 'DEPT-410', 'DEPT-420', 'DEPT-310', 'DEPT-140',
        'DEPT-110', 'DEPT-320', 'DEPT-130', 'DEPT-330', 'DEPT-210',
        'DEPT-220', 'DEPT-230', 'DEPT-240', 'DEPT-430'
    ]; -- 14 팀 (level 2)

    bu_depts TEXT[] := ARRAY[
        'DEPT-121', 'DEPT-323', 'DEPT-132', 'DEPT-321', 'DEPT-123',
        'DEPT-122', 'DEPT-312', 'DEPT-113', 'DEPT-322', 'DEPT-131',
        'DEPT-111', 'DEPT-313', 'DEPT-133', 'DEPT-311', 'DEPT-112'
    ]; -- 15 부 (level 3)

    gwa_depts TEXT[] := ARRAY[
        'DEPT-1212', 'DEPT-1211', 'DEPT-1313', 'DEPT-1111', 'DEPT-1213',
        'DEPT-1311', 'DEPT-1112', 'DEPT-3111', 'DEPT-3112', 'DEPT-3113',
        'DEPT-1312'
    ]; -- 11 과 (level 4)

    total_users INTEGER;
    target_team INTEGER;
    target_bu INTEGER;
    user_record RECORD;
    counter INTEGER := 0;
    team_count INTEGER := 0;
    bu_count INTEGER := 0;
    gwa_count INTEGER := 0;
    dept_to_assign TEXT;
    random_idx INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM users;
    target_team := FLOOR(total_users * 0.05);
    target_bu := FLOOR(total_users * 0.05);

    RAISE NOTICE 'Total: %, Team target: %, Bu target: %', total_users, target_team, target_bu;

    FOR user_record IN (SELECT id FROM users ORDER BY created_at, id) LOOP
        counter := counter + 1;

        IF team_count < target_team THEN
            random_idx := 1 + FLOOR(RANDOM() * array_length(team_depts, 1));
            dept_to_assign := team_depts[random_idx];
            team_count := team_count + 1;
        ELSIF bu_count < target_bu THEN
            random_idx := 1 + FLOOR(RANDOM() * array_length(bu_depts, 1));
            dept_to_assign := bu_depts[random_idx];
            bu_count := bu_count + 1;
        ELSE
            random_idx := 1 + FLOOR(RANDOM() * array_length(gwa_depts, 1));
            dept_to_assign := gwa_depts[random_idx];
            gwa_count := gwa_count + 1;
        END IF;

        UPDATE users
        SET new_department = dept_to_assign
        WHERE id = user_record.id;
    END LOOP;

    RAISE NOTICE 'Distribution: Team=%, Bu=%, Gwa=%', team_count, bu_count, gwa_count;
END $$;

-- Step 5: Now update the actual columns
-- First drop the unique constraint on loginid temporarily
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;

-- Update employee_number and department first
UPDATE users
SET
    employee_number = new_employee_number,
    department = new_department;

-- Step 6: Update IDs - This is the tricky part
-- We need to drop PK constraint, update, then recreate it
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey CASCADE;

-- Update the ID
UPDATE users
SET
    id = new_id,
    system_key = 'USR-' || new_id;

-- Recreate primary key
ALTER TABLE users ADD PRIMARY KEY (id);

-- Recreate unique constraint on loginid
ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (loginid);

-- Drop temporary columns
ALTER TABLE users DROP COLUMN new_id;
ALTER TABLE users DROP COLUMN new_employee_number;
ALTER TABLE users DROP COLUMN new_department;

COMMIT;

-- Verification queries
SELECT '=== UPDATE COMPLETE ===' as status;

SELECT
    'Total users' as metric,
    COUNT(*) as count
FROM users;

SELECT
    'ID format verification' as metric,
    COUNT(*) as count
FROM users
WHERE id LIKE 'U%' AND LENGTH(id) = 13;

SELECT
    'Employee number format' as metric,
    COUNT(*) as count
FROM users
WHERE LENGTH(employee_number) = 6;

SELECT
    'Position verification' as metric,
    COUNT(*) as count
FROM users
WHERE position = '프로';

SELECT
    'Department distribution' as metric,
    d.level,
    CASE
        WHEN d.level = 2 THEN '팀'
        WHEN d.level = 3 THEN '부'
        WHEN d.level = 4 THEN '과'
        ELSE 'Other'
    END as level_name,
    COUNT(u.id) as user_count,
    ROUND(COUNT(u.id) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
FROM users u
JOIN departments d ON u.department = d.id
WHERE d.level IN (2, 3, 4)
GROUP BY d.level
ORDER BY d.level;

-- Sample data
SELECT
    'Sample users' as info;
SELECT
    id,
    loginid,
    name_ko,
    employee_number,
    position,
    department,
    system_key
FROM users
ORDER BY id
LIMIT 10;
