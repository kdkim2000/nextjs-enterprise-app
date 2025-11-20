-- ==========================================
-- INSERT SAMPLE AVATAR IMAGES
-- ==========================================
-- Add sample avatar images to some users
-- Using simple geometric patterns in different colors
--

BEGIN;

-- Sample avatar images (Base64 encoded small PNG images)
-- These are 32x32 pixel colored squares

-- Red avatar (32x32 red square)
UPDATE users
SET avatar_image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAARklEQVR42mP8z8DwHwYYGBgYmBjGAKMVMFoBEAWMjIwM/xkZGf4zMjL8Z2Rk+M/IyPCfkZHhPyMjw39GRob/jIwM/8cGAACMxwX9sbu6YQAAAABJRU5ErkJggg=='
WHERE id IN (SELECT id FROM users WHERE position = '대표' LIMIT 1);

-- Blue avatar (32x32 blue square)
UPDATE users
SET avatar_image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAARklEQVR42mNgGAXDEjAyMjL8Z2Rk+M/IyPCfkZHhPyMjw39GRob/jIwM/xkZGf4zMjL8Z2Rk+M/IyPD/PwMDA8MoGA4AAKtTBf2vDle6AAAAAElFTkSuQmCC'
WHERE id IN (SELECT id FROM users WHERE position = '부문장' LIMIT 4);

-- Green avatar (32x32 green square)
UPDATE users
SET avatar_image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAARklEQVR42mNgGAWDFjAyMjL8Z2Rk+M/IyPCfkZHhPyMjw39GRob/jIwM/xkZGf4zMjL8Z2Rk+M8w+AADA8MoGBIAALFTBf2hDks9AAAAAElFTkSuQmCC'
WHERE id IN (SELECT id FROM users WHERE position = '팀장' LIMIT 5);

-- Orange avatar (32x32 orange square)
UPDATE users
SET avatar_image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAARklEQVR42mP4z8DwnwECGBgYmBgwASMjI8N/RkYGdMDIyMiADhgZGRnQASMjIwM6YGRkZEAHjIyMDOiAkZGR4T8DAwMDAwMAqFMF/bXOSz0AAAAASUVORK5CYII='
WHERE id IN (SELECT id FROM users WHERE position = '부장' LIMIT 5);

-- Purple avatar (32x32 purple square)
UPDATE users
SET avatar_image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAARklEQVR42mP4z8DwnwEKGBgYmBgwASMjI8N/RkaGfwyMjAz/GRgYGP4zMDAwMDAwMPxnYGD4z8DAwMDAwMDwn4GBgYEBAADuUwX9s85LPQAAAAAElFTkSuQmCC'
WHERE id IN (SELECT id FROM users WHERE position = '과장' LIMIT 5);

-- Pink avatar (32x32 pink square)
UPDATE users
SET avatar_image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAARklEQVR42mP4z8Dwn4EBChgYGJgYMAEjIyPDf0ZGhn8MjIwM/xkYGBj+MzAwMDAwMDD8Z2Bg+M/AwMDAwMDA8J+BgYGBAQAA7lMF/bPOSz0AAAAASUVORK5CYII='
WHERE id IN (SELECT id FROM users WHERE position = '직장' LIMIT 5);

-- Cyan avatar (32x32 cyan square)
UPDATE users
SET avatar_image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAARklEQVR42mNgGAWjYBQMV8DIyMjwn5GR4T8jI8N/RkaG/4yMDP8ZGRn+MzIy/GdkZPjPyMjwn5GR4f9/BgYGhlEwjAAA7VMF/bHOSz0AAAAASUVORK5CYII='
WHERE id IN (SELECT id FROM users WHERE position = '반장' LIMIT 5);

COMMIT;

-- Verification
SELECT '=== SAMPLE AVATAR IMAGES INSERTED ===' as status;

-- Show users with avatar images
SELECT
    'Users with avatar images by position' as info;

SELECT
    position,
    COUNT(*) as users_with_avatar,
    SUBSTRING(avatar_image, 1, 50) || '...' as sample_image_preview
FROM users
WHERE avatar_image IS NOT NULL
GROUP BY position, avatar_image
ORDER BY position;

-- Overall statistics
SELECT
    'Avatar statistics after insertion' as stats;

SELECT
    COUNT(*) as total_users,
    COUNT(avatar_url) as users_with_url,
    COUNT(avatar_image) as users_with_image,
    COUNT(*) - COUNT(avatar_url) - COUNT(avatar_image) as users_without_avatar,
    ROUND(COUNT(avatar_image) * 100.0 / COUNT(*), 2) as percentage_with_image
FROM users;

-- Sample users with avatars
SELECT
    'Sample users with avatar images' as sample;

SELECT
    loginid,
    name_ko,
    position,
    CASE
        WHEN avatar_image IS NOT NULL THEN 'Has DB Image'
        WHEN avatar_url IS NOT NULL THEN 'Has URL'
        ELSE 'No Avatar'
    END as avatar_status,
    LENGTH(avatar_image) as image_size_bytes
FROM users
WHERE avatar_image IS NOT NULL
ORDER BY position, loginid
LIMIT 20;
