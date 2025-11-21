-- ==========================================
-- ADD AVATAR_IMAGE COLUMN TO USERS TABLE
-- ==========================================
-- Add avatar_image column to store images directly in database
-- Format: Base64 encoded image string with data URI scheme
-- Example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
--
-- Usage Priority:
--   1. avatar_image (if exists, use this)
--   2. avatar_url (fallback to URL)
--

BEGIN;

-- Add avatar_image column (TEXT type for Base64 encoded images)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_image TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN users.avatar_image IS 'Base64 encoded avatar image with data URI scheme (e.g., data:image/png;base64,...)';

-- Create index for quick lookup (optional, since images can be large)
-- Only index users who have avatar_image set
CREATE INDEX IF NOT EXISTS idx_users_has_avatar_image ON users(id) WHERE avatar_image IS NOT NULL;

COMMIT;

-- Verification
SELECT '=== AVATAR_IMAGE COLUMN ADDED ===' as status;

-- Show table structure
SELECT
    'Users table structure with avatar_image' as info;

SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
    AND column_name IN ('avatar_url', 'avatar_image')
ORDER BY ordinal_position;

-- Show statistics
SELECT
    'Avatar statistics' as stats;

SELECT
    COUNT(*) as total_users,
    COUNT(avatar_url) as users_with_url,
    COUNT(avatar_image) as users_with_image,
    COUNT(*) - COUNT(avatar_url) - COUNT(avatar_image) as users_without_avatar
FROM users;

-- Sample usage demonstration
SELECT
    'Sample: How to insert avatar image' as example;

-- Example INSERT query (commented out)
/*
UPDATE users
SET avatar_image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
WHERE id = 'USER-123';
*/

SELECT 'Use Base64 encoded image with data URI scheme' as instruction;
SELECT 'Format: data:image/[png|jpeg|jpg|gif];base64,[base64-encoded-data]' as format;
