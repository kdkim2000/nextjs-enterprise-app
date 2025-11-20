-- Update avatar_url for users with null avatar_image
-- Uses Dicebear API with loginid as seed

-- First, let's check how many users need to be updated
SELECT COUNT(*) as users_with_null_avatar_image
FROM users
WHERE avatar_image IS NULL;

-- Show some examples of what will be updated
SELECT id, loginid, username, name, avatar_url, avatar_image
FROM users
WHERE avatar_image IS NULL
LIMIT 10;

-- Update avatar_url for users with null avatar_image
UPDATE users
SET avatar_url = 'https://api.dicebear.com/7.x/thumbs/svg?seed=' || loginid
WHERE avatar_image IS NULL;

-- Verify the update
SELECT COUNT(*) as updated_users
FROM users
WHERE avatar_image IS NULL
  AND avatar_url LIKE 'https://api.dicebear.com/7.x/thumbs/svg?seed=%';

-- Show some examples of updated users
SELECT id, loginid, username, name, avatar_url, avatar_image
FROM users
WHERE avatar_image IS NULL
  AND avatar_url LIKE 'https://api.dicebear.com/7.x/thumbs/svg?seed=%'
LIMIT 20;
