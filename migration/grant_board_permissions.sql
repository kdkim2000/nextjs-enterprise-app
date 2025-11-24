-- Grant permissions on board system tables to app_user

-- Grant permissions on board_types table
GRANT ALL PRIVILEGES ON TABLE board_types TO app_user;

-- Grant permissions on posts table
GRANT ALL PRIVILEGES ON TABLE posts TO app_user;

-- Grant permissions on comments table
GRANT ALL PRIVILEGES ON TABLE comments TO app_user;

-- Grant permissions on post_likes table
GRANT ALL PRIVILEGES ON TABLE post_likes TO app_user;

-- Grant permissions on attachments table
GRANT ALL PRIVILEGES ON TABLE attachments TO app_user;

-- Grant usage on sequences (if any)
-- Note: We're using UUIDs, so no sequences needed

COMMIT;

-- Verify permissions
SELECT
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'app_user'
AND table_name IN ('board_types', 'posts', 'comments', 'post_likes', 'attachments')
ORDER BY table_name, privilege_type;
