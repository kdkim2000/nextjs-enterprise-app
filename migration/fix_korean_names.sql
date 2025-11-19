-- ==========================================
-- FIX KOREAN NAMES WITH VARIETY
-- ==========================================
-- Update all users with diverse Korean names

BEGIN;

-- Korean surnames (성) - 30 most common
CREATE TEMP TABLE korean_surnames (id SERIAL PRIMARY KEY, surname_ko TEXT);
INSERT INTO korean_surnames (surname_ko) VALUES
('김'), ('이'), ('박'), ('최'), ('정'),
('강'), ('조'), ('윤'), ('장'), ('임'),
('한'), ('오'), ('서'), ('신'), ('권'),
('황'), ('안'), ('송'), ('홍'), ('배'),
('유'), ('문'), ('양'), ('손'), ('백'),
('허'), ('남'), ('심'), ('고'), ('노');

-- Korean given names (이름) - 50 common names
CREATE TEMP TABLE korean_given_names (id SERIAL PRIMARY KEY, name_ko TEXT);
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

-- Update each user with a random Korean name
-- Using modulo to ensure variety
UPDATE users u
SET name_ko = (
    SELECT surname_ko
    FROM korean_surnames
    WHERE id = ((ABS(HASHTEXT(u.id)) % 30) + 1)
) || (
    SELECT name_ko
    FROM korean_given_names
    WHERE id = ((ABS(HASHTEXT(u.id || u.loginid)) % 50) + 1)
);

DROP TABLE korean_surnames;
DROP TABLE korean_given_names;

COMMIT;

-- Verification
SELECT 'Updated Korean names - sample:' as info;
SELECT
    loginid,
    name_ko,
    name_en,
    employee_number,
    phone_number,
    mobile_number
FROM users
ORDER BY RANDOM()
LIMIT 20;

SELECT 'Name distribution check:' as info;
SELECT
    LEFT(name_ko, 1) as surname,
    COUNT(*) as count
FROM users
GROUP BY LEFT(name_ko, 1)
ORDER BY count DESC
LIMIT 10;
