-- ==========================================
-- UPDATE EMAIL FORMAT
-- ==========================================
-- Remove random suffix from emails
-- Format: firstname.lastname@samsung.com
-- If duplicate, add sequential number: firstname.lastname.2@samsung.com
--

BEGIN;

-- Step 1: Drop unique constraint on email
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Step 2: Create temporary table to store new emails
DROP TABLE IF EXISTS temp_email_mapping;
CREATE TEMPORARY TABLE temp_email_mapping AS
SELECT
    u.id,
    u.name_en,
    LOWER(SPLIT_PART(u.name_en, ' ', 2)) || '.' || LOWER(SPLIT_PART(u.name_en, ' ', 1)) || '@samsung.com' as base_email
FROM users u
WHERE u.name_en IS NOT NULL AND u.name_en != '';

-- Step 3: Add final email column with sequential numbering for duplicates
ALTER TABLE temp_email_mapping ADD COLUMN final_email VARCHAR(255);

-- Step 4: Generate unique emails with sequential numbering
WITH email_counts AS (
    SELECT
        base_email,
        COUNT(*) as cnt,
        ARRAY_AGG(id ORDER BY id) as user_ids
    FROM temp_email_mapping
    GROUP BY base_email
),
numbered_emails AS (
    SELECT
        unnest(user_ids) as id,
        base_email,
        ROW_NUMBER() OVER (PARTITION BY base_email ORDER BY unnest(user_ids)) as rn,
        cnt
    FROM email_counts
)
UPDATE temp_email_mapping tem
SET final_email = CASE
    WHEN ne.rn = 1 AND ne.cnt = 1 THEN ne.base_email
    ELSE REPLACE(ne.base_email, '@samsung.com', '.' || ne.rn::text || '@samsung.com')
END
FROM numbered_emails ne
WHERE tem.id = ne.id;

-- Step 5: Update users table with new emails
UPDATE users u
SET email = tem.final_email
FROM temp_email_mapping tem
WHERE u.id = tem.id;

COMMIT;

-- Verification queries
SELECT '=== EMAIL UPDATE COMPLETE ===' as status;

SELECT
    'Total users' as metric,
    COUNT(*) as count
FROM users
WHERE email LIKE '%@samsung.com';

SELECT
    'Emails with numbers (duplicates)' as metric,
    COUNT(*) as count
FROM users
WHERE email ~ '\.[0-9]+@samsung\.com';

SELECT
    'Unique emails' as metric,
    COUNT(DISTINCT email) as count
FROM users;

-- Show sample of users with same base email
SELECT
    'Sample duplicate names' as info;
SELECT
    name_ko,
    name_en,
    email
FROM users
WHERE email ~ '\.[0-9]+@samsung\.com'
ORDER BY email
LIMIT 10;

-- Show distribution
SELECT
    'Email format distribution' as info;
SELECT
    CASE
        WHEN email ~ '\.[0-9]+@samsung\.com' THEN 'With number (duplicate)'
        ELSE 'Without number (unique)'
    END as format_type,
    COUNT(*) as count
FROM users
GROUP BY format_type;
