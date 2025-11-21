-- Verify User Name Deduplication Migration
-- Check that all users have unique names and proper data

-- 1. Check total user count
SELECT '=== Total User Count ===' as section;
SELECT COUNT(*) as total_users FROM users;

-- 2. Check unique names
SELECT '=== Unique Name Statistics ===' as section;
SELECT
    COUNT(*) as total_users,
    COUNT(DISTINCT name_ko) as unique_korean_names,
    COUNT(DISTINCT name_en) as unique_english_names,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(DISTINCT loginid) as unique_loginids
FROM users
WHERE loginid != 'admin';

-- 3. Check for duplicate Korean names
SELECT '=== Duplicate Korean Names Check ===' as section;
SELECT name_ko, COUNT(*) as count
FROM users
WHERE loginid != 'admin'
GROUP BY name_ko
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 20;

-- 4. Check for duplicate emails
SELECT '=== Duplicate Emails Check ===' as section;
SELECT email, COUNT(*) as count
FROM users
WHERE loginid != 'admin'
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 20;

-- 5. Sample of updated users (random 20)
SELECT '=== Random Sample of Updated Users ===' as section;
SELECT
    loginid,
    name_ko,
    name_en,
    email,
    phone_number,
    mobile_number,
    employee_number,
    position
FROM users
WHERE loginid != 'admin'
ORDER BY RANDOM()
LIMIT 20;

-- 6. Check admin account (should not be changed)
SELECT '=== Admin Account Verification ===' as section;
SELECT
    loginid,
    name_ko,
    name_en,
    email,
    phone_number,
    mobile_number
FROM users
WHERE loginid = 'admin';

-- 7. Email format verification (@samsung.com)
SELECT '=== Email Format Check ===' as section;
SELECT
    COUNT(*) as total_users,
    COUNT(CASE WHEN email LIKE '%@samsung.com' THEN 1 END) as samsung_emails,
    COUNT(CASE WHEN email NOT LIKE '%@samsung.com' THEN 1 END) as non_samsung_emails
FROM users
WHERE loginid != 'admin';

-- 8. Phone number format verification (international format)
SELECT '=== Phone Number Format Check ===' as section;
SELECT
    COUNT(*) as total_users,
    COUNT(CASE WHEN phone_number LIKE '+82-%' THEN 1 END) as international_phone,
    COUNT(CASE WHEN mobile_number LIKE '+82-10-%' THEN 1 END) as international_mobile
FROM users
WHERE loginid != 'admin';

-- 9. Name statistics
SELECT '=== Name Length Statistics ===' as section;
SELECT
    MIN(LENGTH(name_ko)) as min_korean_length,
    MAX(LENGTH(name_ko)) as max_korean_length,
    AVG(LENGTH(name_ko))::numeric(10,2) as avg_korean_length,
    MIN(LENGTH(name_en)) as min_english_length,
    MAX(LENGTH(name_en)) as max_english_length,
    AVG(LENGTH(name_en))::numeric(10,2) as avg_english_length
FROM users
WHERE loginid != 'admin' AND name_ko IS NOT NULL;

-- 10. Most common family names (top 10)
SELECT '=== Top 10 Family Names ===' as section;
SELECT
    SUBSTRING(name_ko, 1, 1) as family_name,
    COUNT(*) as count
FROM users
WHERE loginid != 'admin' AND name_ko IS NOT NULL
GROUP BY family_name
ORDER BY count DESC
LIMIT 10;
