-- ==========================================
-- UPDATE LOGIN ID FROM EMAIL
-- ==========================================
-- Set loginid as email prefix (before @)
-- Example: seungu.nam.1@samsung.com -> seungu.nam.1
--

BEGIN;

-- Step 1: Drop unique constraint on loginid temporarily
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;

-- Step 2: Update loginid from email
UPDATE users
SET loginid = SPLIT_PART(email, '@', 1)
WHERE email IS NOT NULL AND email LIKE '%@%';

-- Step 3: Recreate unique constraint on loginid
ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (loginid);

COMMIT;

-- Verification
SELECT '=== LOGIN ID UPDATE COMPLETE ===' as status;

-- Check sample data
SELECT
    'Sample updated loginids' as info;
SELECT
    id,
    loginid,
    name_ko,
    name_en,
    email
FROM users
ORDER BY id
LIMIT 15;

-- Verify all loginids match email prefix
SELECT
    'Verification: loginid matches email' as metric,
    COUNT(*) as matched_count
FROM users
WHERE loginid = SPLIT_PART(email, '@', 1);

-- Check if all loginids are unique
SELECT
    'Unique loginids' as metric,
    COUNT(DISTINCT loginid) as count
FROM users;

-- Show some examples
SELECT
    'Sample loginid formats' as info;
SELECT DISTINCT
    loginid,
    email
FROM users
ORDER BY loginid
LIMIT 10;
