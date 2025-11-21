-- ==========================================
-- POPULATE REALISTIC USER DATA
-- ==========================================
-- This script populates realistic data for users table:
-- - employee_number (사번): E{year}-{sequential}
-- - phone_number (전화번호): 02-XXXX-XXXX format
-- - mobile_number (휴대전화번호): 010-XXXX-XXXX format
-- - name_ko (한글 이름): Korean names
-- - name_en (영문 이름): Based on existing names

BEGIN;

-- ==========================================
-- Step 1: Update employee_number (사번)
-- ==========================================
-- Generate employee numbers based on user creation date
-- Format: E{year}-{sequential number}

WITH numbered_users AS (
    SELECT
        id,
        CONCAT(
            'E',
            EXTRACT(YEAR FROM created_at)::TEXT,
            '-',
            LPAD(
                (ROW_NUMBER() OVER (ORDER BY created_at, id))::TEXT,
                5,
                '0'
            )
        ) as new_emp_number
    FROM users
)
UPDATE users u
SET employee_number = nu.new_emp_number
FROM numbered_users nu
WHERE u.id = nu.id;

-- ==========================================
-- Step 2: Update phone_number (전화번호)
-- ==========================================
-- Generate office phone numbers
-- Format: 02-XXXX-XXXX (Seoul area code)

UPDATE users
SET phone_number = CONCAT(
    '02-',
    LPAD((FLOOR(RANDOM() * 9000) + 1000)::TEXT, 4, '0'),
    '-',
    LPAD((FLOOR(RANDOM() * 9000) + 1000)::TEXT, 4, '0')
);

-- ==========================================
-- Step 3: Update mobile_number (휴대전화번호)
-- ==========================================
-- Generate mobile phone numbers
-- Format: 010-XXXX-XXXX

UPDATE users
SET mobile_number = CONCAT(
    '010-',
    LPAD((FLOOR(RANDOM() * 9000) + 1000)::TEXT, 4, '0'),
    '-',
    LPAD((FLOOR(RANDOM() * 9000) + 1000)::TEXT, 4, '0')
);

-- ==========================================
-- Step 4: Update name_en (영문 이름)
-- ==========================================
-- Copy existing name_ko to name_en if name_en is null

UPDATE users
SET name_en = name_ko
WHERE name_en IS NULL;

-- ==========================================
-- Step 5: Generate Korean names (한글 이름)
-- ==========================================
-- Create realistic Korean names using common surnames and given names

-- Korean surnames (성) - 30 most common
CREATE TEMP TABLE korean_surnames (id SERIAL, surname_ko TEXT, surname_en TEXT);
INSERT INTO korean_surnames (surname_ko, surname_en) VALUES
('김', 'Kim'), ('이', 'Lee'), ('박', 'Park'), ('최', 'Choi'), ('정', 'Jung'),
('강', 'Kang'), ('조', 'Cho'), ('윤', 'Yoon'), ('장', 'Jang'), ('임', 'Lim'),
('한', 'Han'), ('오', 'Oh'), ('서', 'Seo'), ('신', 'Shin'), ('권', 'Kwon'),
('황', 'Hwang'), ('안', 'Ahn'), ('송', 'Song'), ('홍', 'Hong'), ('배', 'Bae'),
('유', 'Yoo'), ('문', 'Moon'), ('양', 'Yang'), ('손', 'Son'), ('백', 'Baek'),
('허', 'Huh'), ('남', 'Nam'), ('심', 'Shim'), ('고', 'Go'), ('노', 'Roh');

-- Korean given names (이름) - Common components
CREATE TEMP TABLE korean_given_names (id SERIAL, name_ko TEXT);
INSERT INTO korean_given_names (name_ko) VALUES
('민준'), ('서준'), ('예준'), ('도윤'), ('시우'),
('주원'), ('하준'), ('지호'), ('준서'), ('건우'),
('우진'), ('현우'), ('선우'), ('연우'), ('유준'),
('지후'), ('승우'), ('승현'), ('시윤'), ('준혁'),
('은우'), ('지환'), ('민성'), ('지훈'), ('승민'),
('지안'), ('수현'), ('민서'), ('서연'), ('지우'),
('서윤'), ('채원'), ('지유'), ('수아'), ('예은'),
('하은'), ('윤서'), ('채은'), ('다은'), ('예서'),
('수빈'), ('소율'), ('민지'), ('예린'), ('지원'),
('유나'), ('채윤'), ('소윤'), ('은서'), ('가은');

-- Update Korean names with random combinations
WITH random_korean_names AS (
    SELECT
        u.id,
        (SELECT surname_ko FROM korean_surnames ORDER BY RANDOM() LIMIT 1) ||
        (SELECT name_ko FROM korean_given_names ORDER BY RANDOM() LIMIT 1) as korean_name
    FROM users u
)
UPDATE users u
SET name_ko = rkn.korean_name
FROM random_korean_names rkn
WHERE u.id = rkn.id;

-- ==========================================
-- Step 6: Ensure all users have valid data
-- ==========================================

-- Set default values for any remaining NULL fields
UPDATE users
SET
    name_ko = COALESCE(name_ko, name_en, 'Unknown'),
    name_en = COALESCE(name_en, 'Unknown'),
    employee_number = COALESCE(employee_number, CONCAT('E', EXTRACT(YEAR FROM NOW())::TEXT, '-00000')),
    phone_number = COALESCE(phone_number, '02-0000-0000'),
    mobile_number = COALESCE(mobile_number, '010-0000-0000'),
    user_category = COALESCE(user_category, 'regular')
WHERE
    name_ko IS NULL
    OR name_en IS NULL
    OR employee_number IS NULL
    OR phone_number IS NULL
    OR mobile_number IS NULL
    OR user_category IS NULL;

-- ==========================================
-- Step 7: Diversify user categories
-- ==========================================
-- Assign different user categories to create realistic distribution
-- 80% regular, 10% contractor, 5% temporary, 4% external, 1% admin

UPDATE users
SET user_category = CASE
    WHEN RANDOM() < 0.80 THEN 'regular'
    WHEN RANDOM() < 0.90 THEN 'contractor'
    WHEN RANDOM() < 0.95 THEN 'temporary'
    WHEN RANDOM() < 0.99 THEN 'external'
    ELSE 'admin'
END;

-- Clean up temp tables
DROP TABLE IF EXISTS korean_surnames;
DROP TABLE IF EXISTS korean_given_names;

COMMIT;

-- ==========================================
-- Verification Queries
-- ==========================================

-- Count users with complete data
SELECT
    'Users with complete data:' as info,
    COUNT(*) as count
FROM users
WHERE
    employee_number IS NOT NULL
    AND phone_number IS NOT NULL
    AND mobile_number IS NOT NULL
    AND name_ko IS NOT NULL
    AND name_en IS NOT NULL;

-- Sample data verification
SELECT
    'Sample user data (most recent):' as info;

SELECT
    id,
    loginid,
    name_ko,
    name_en,
    employee_number,
    phone_number,
    mobile_number,
    user_category,
    department,
    status
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- Statistics by user category
SELECT
    'Users by category:' as info;

SELECT
    user_category,
    COUNT(*) as count,
    ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM users) * 100, 2) as percentage
FROM users
GROUP BY user_category
ORDER BY count DESC;

-- Sample Korean names
SELECT
    'Sample Korean names:' as info;

SELECT
    loginid,
    name_ko,
    name_en,
    employee_number
FROM users
LIMIT 20;
