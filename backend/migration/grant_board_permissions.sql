-- Grant permissions for board-related tables to app_user
-- This script should be run as the postgres superuser

-- Grant SELECT, INSERT, UPDATE, DELETE on board_types table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE board_types TO app_user;

-- Grant SELECT, INSERT, UPDATE, DELETE on posts table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE posts TO app_user;

-- Grant SELECT, INSERT, UPDATE, DELETE on comments table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE comments TO app_user;

-- Grant SELECT, INSERT, UPDATE, DELETE on attachments table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE attachments TO app_user;

-- Grant SELECT, INSERT, UPDATE, DELETE on post_likes table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE post_likes TO app_user;

-- Grant USAGE on sequences (for auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Verify grants
SELECT grantee, table_name, privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'app_user'
  AND table_name IN ('board_types', 'posts', 'comments', 'attachments', 'post_likes')
ORDER BY table_name, privilege_type;
