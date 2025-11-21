-- ==========================================
-- FIX EMAIL FORMAT - Remove numbers for unique names
-- ==========================================
-- If only one person has that name, remove the number
-- Keep numbers only for actual duplicates
--

BEGIN;

-- Create temporary table with proper sequencing
DROP TABLE IF EXISTS temp_email_fix;
CREATE TEMPORARY TABLE temp_email_fix AS
WITH base_emails AS (
    SELECT
        id,
        name_ko,
        name_en,
        LOWER(SPLIT_PART(name_en, ' ', 2)) || '.' || LOWER(SPLIT_PART(name_en, ' ', 1)) || '@samsung.com' as base_email
    FROM users
    WHERE name_en IS NOT NULL AND name_en != ''
),
email_groups AS (
    SELECT
        id,
        name_ko,
        name_en,
        base_email,
        COUNT(*) OVER (PARTITION BY base_email) as name_count,
        ROW_NUMBER() OVER (PARTITION BY base_email ORDER BY id) as row_num
    FROM base_emails
)
SELECT
    id,
    name_ko,
    name_en,
    base_email,
    CASE
        WHEN name_count = 1 THEN base_email
        ELSE REPLACE(base_email, '@samsung.com', '.' || row_num::text || '@samsung.com')
    END as final_email,
    name_count
FROM email_groups;

-- Update users table
UPDATE users u
SET email = tef.final_email
FROM temp_email_fix tef
WHERE u.id = tef.id;

COMMIT;

-- Verification
SELECT '=== EMAIL FORMAT FIXED ===' as status;

-- Count unique names vs duplicates
WITH email_stats AS (
    SELECT
        CASE
            WHEN email ~ '\.[0-9]+@samsung\.com' THEN 'With number (duplicate)'
            ELSE 'Simple format (unique name)'
        END as email_type,
        COUNT(*) as user_count
    FROM users
    WHERE email LIKE '%@samsung.com'
    GROUP BY email_type
)
SELECT * FROM email_stats;

-- Show sample unique emails (no numbers)
SELECT 'Sample unique name emails' as info;
SELECT name_ko, name_en, email
FROM users
WHERE email LIKE '%@samsung.com'
  AND email NOT LIKE '%.1@%'
  AND email NOT LIKE '%.2@%'
  AND email NOT LIKE '%.3@%'
  AND email NOT LIKE '%.4@%'
  AND email NOT LIKE '%.5@%'
  AND email NOT LIKE '%.6@%'
  AND email NOT LIKE '%.7@%'
  AND email NOT LIKE '%.8@%'
  AND email NOT LIKE '%.9@%'
  AND email NOT LIKE '%.10@%'
ORDER BY id
LIMIT 10;

-- Show sample duplicate emails (with numbers)
SELECT 'Sample duplicate name emails' as info;
SELECT name_ko, name_en, email
FROM users
WHERE email ~ '\.[0-9]+@samsung\.com'
ORDER BY email
LIMIT 10;

-- Verify all emails are unique
SELECT
    'Total emails' as metric,
    COUNT(*) as count,
    'Unique emails' as metric2,
    COUNT(DISTINCT email) as count2
FROM users;
