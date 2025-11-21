-- ==========================================
-- UPDATE USER ID TO RANDOM 12-DIGIT NUMBER
-- ==========================================
-- Change ID from sequential to random 12-digit numbers
-- Format: U + 12 random digits (e.g., U384729561038)
--

BEGIN;

-- Step 1: Add temporary column for new random IDs
ALTER TABLE users ADD COLUMN IF NOT EXISTS new_id VARCHAR(50);

-- Step 2: Generate random 12-digit IDs and ensure uniqueness
DO $$
DECLARE
    user_record RECORD;
    random_id TEXT;
    id_exists BOOLEAN;
BEGIN
    FOR user_record IN (SELECT id FROM users ORDER BY id) LOOP
        -- Generate unique random ID
        LOOP
            -- Generate random 12-digit number (100000000000 to 999999999999)
            random_id := 'U' || LPAD(FLOOR(RANDOM() * 900000000000 + 100000000000)::BIGINT::TEXT, 12, '0');

            -- Check if this ID already exists in new_id column
            SELECT EXISTS(SELECT 1 FROM users WHERE new_id = random_id) INTO id_exists;

            -- If unique, exit loop
            EXIT WHEN NOT id_exists;
        END LOOP;

        -- Assign the unique random ID
        UPDATE users
        SET new_id = random_id
        WHERE id = user_record.id;
    END LOOP;

    RAISE NOTICE 'Random IDs generated successfully';
END $$;

-- Step 3: Drop primary key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey CASCADE;

-- Step 4: Update ID column with new random IDs
UPDATE users
SET id = new_id,
    system_key = 'USR-' || new_id;

-- Step 5: Drop temporary column
ALTER TABLE users DROP COLUMN new_id;

-- Step 6: Recreate primary key
ALTER TABLE users ADD PRIMARY KEY (id);

COMMIT;

-- Verification
SELECT '=== USER ID UPDATE COMPLETE ===' as status;

-- Check ID format
SELECT
    'ID format verification' as metric,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE id LIKE 'U%' AND LENGTH(id) = 13) as correct_format,
    COUNT(DISTINCT id) as unique_ids
FROM users;

-- Show sample data
SELECT
    'Sample updated user IDs' as info;
SELECT
    id,
    loginid,
    name_ko,
    name_en,
    employee_number,
    system_key
FROM users
ORDER BY RANDOM()
LIMIT 10;

-- Verify no sequential patterns
SELECT
    'Random distribution check' as info;
SELECT
    SUBSTRING(id, 2, 1) as first_digit,
    COUNT(*) as count
FROM users
GROUP BY first_digit
ORDER BY first_digit;
