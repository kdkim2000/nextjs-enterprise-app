-- ============================================================================
-- Add missing created_at and updated_at columns to all tables
-- ============================================================================
-- Created: 2025-11-24
-- Description: Ensures all tables have proper timestamp tracking columns
-- ============================================================================

-- Set timezone
SET TIME ZONE 'UTC';

BEGIN;

-- ============================================================================
-- Add created_at column where missing
-- ============================================================================

-- logs table: Add created_at
ALTER TABLE logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
COMMENT ON COLUMN logs.created_at IS 'Timestamp when the log entry was created';

-- menus table: Add created_at
ALTER TABLE menus ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
COMMENT ON COLUMN menus.created_at IS 'Timestamp when the menu was created';

-- permissions table: Add created_at
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
COMMENT ON COLUMN permissions.created_at IS 'Timestamp when the permission was created';

-- user_preferences table: Add created_at
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
COMMENT ON COLUMN user_preferences.created_at IS 'Timestamp when the preference was created';

-- user_role_mappings table: Add created_at
ALTER TABLE user_role_mappings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
COMMENT ON COLUMN user_role_mappings.created_at IS 'Timestamp when the mapping was created';

-- ============================================================================
-- Add updated_at column where missing
-- ============================================================================

-- attachments table: Add updated_at
ALTER TABLE attachments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
COMMENT ON COLUMN attachments.updated_at IS 'Timestamp when the attachment was last updated';

-- logs table: Add updated_at
ALTER TABLE logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
COMMENT ON COLUMN logs.updated_at IS 'Timestamp when the log entry was last updated';

-- menus table: Add updated_at
ALTER TABLE menus ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
COMMENT ON COLUMN menus.updated_at IS 'Timestamp when the menu was last updated';

-- post_likes table: Add updated_at
ALTER TABLE post_likes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
COMMENT ON COLUMN post_likes.updated_at IS 'Timestamp when the like was last updated';

-- role_menu_mappings table: Add updated_at
ALTER TABLE role_menu_mappings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
COMMENT ON COLUMN role_menu_mappings.updated_at IS 'Timestamp when the mapping was last updated';

-- role_program_mappings table: Add updated_at
ALTER TABLE role_program_mappings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
COMMENT ON COLUMN role_program_mappings.updated_at IS 'Timestamp when the mapping was last updated';

-- token_blacklist table: Add updated_at
ALTER TABLE token_blacklist ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
COMMENT ON COLUMN token_blacklist.updated_at IS 'Timestamp when the token was last updated';

-- ============================================================================
-- Create function to automatically update updated_at column
-- ============================================================================

-- Drop function if exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at column to current timestamp';

-- ============================================================================
-- Create triggers for all tables with updated_at column
-- ============================================================================

-- attachments
DROP TRIGGER IF EXISTS update_attachments_updated_at ON attachments;
CREATE TRIGGER update_attachments_updated_at
    BEFORE UPDATE ON attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- board_types
DROP TRIGGER IF EXISTS update_board_types_updated_at ON board_types;
CREATE TRIGGER update_board_types_updated_at
    BEFORE UPDATE ON board_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- code_types
DROP TRIGGER IF EXISTS update_code_types_updated_at ON code_types;
CREATE TRIGGER update_code_types_updated_at
    BEFORE UPDATE ON code_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- codes
DROP TRIGGER IF EXISTS update_codes_updated_at ON codes;
CREATE TRIGGER update_codes_updated_at
    BEFORE UPDATE ON codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- comments
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- departments
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- help
DROP TRIGGER IF EXISTS update_help_updated_at ON help;
CREATE TRIGGER update_help_updated_at
    BEFORE UPDATE ON help
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- logs
DROP TRIGGER IF EXISTS update_logs_updated_at ON logs;
CREATE TRIGGER update_logs_updated_at
    BEFORE UPDATE ON logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- menus
DROP TRIGGER IF EXISTS update_menus_updated_at ON menus;
CREATE TRIGGER update_menus_updated_at
    BEFORE UPDATE ON menus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- messages
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- mfa_codes
DROP TRIGGER IF EXISTS update_mfa_codes_updated_at ON mfa_codes;
CREATE TRIGGER update_mfa_codes_updated_at
    BEFORE UPDATE ON mfa_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- permissions
DROP TRIGGER IF EXISTS update_permissions_updated_at ON permissions;
CREATE TRIGGER update_permissions_updated_at
    BEFORE UPDATE ON permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- post_likes
DROP TRIGGER IF EXISTS update_post_likes_updated_at ON post_likes;
CREATE TRIGGER update_post_likes_updated_at
    BEFORE UPDATE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- posts
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- programs
DROP TRIGGER IF EXISTS update_programs_updated_at ON programs;
CREATE TRIGGER update_programs_updated_at
    BEFORE UPDATE ON programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- role_menu_mappings
DROP TRIGGER IF EXISTS update_role_menu_mappings_updated_at ON role_menu_mappings;
CREATE TRIGGER update_role_menu_mappings_updated_at
    BEFORE UPDATE ON role_menu_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- role_program_mappings
DROP TRIGGER IF EXISTS update_role_program_mappings_updated_at ON role_program_mappings;
CREATE TRIGGER update_role_program_mappings_updated_at
    BEFORE UPDATE ON role_program_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- roles
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- token_blacklist
DROP TRIGGER IF EXISTS update_token_blacklist_updated_at ON token_blacklist;
CREATE TRIGGER update_token_blacklist_updated_at
    BEFORE UPDATE ON token_blacklist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- user_preferences
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- user_role_mappings
DROP TRIGGER IF EXISTS update_user_role_mappings_updated_at ON user_role_mappings;
CREATE TRIGGER update_user_role_mappings_updated_at
    BEFORE UPDATE ON user_role_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Create indexes for timestamp columns (for performance)
-- ============================================================================

-- created_at indexes
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
CREATE INDEX IF NOT EXISTS idx_menus_created_at ON menus(created_at);
CREATE INDEX IF NOT EXISTS idx_permissions_created_at ON permissions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_created_at ON user_preferences(created_at);
CREATE INDEX IF NOT EXISTS idx_user_role_mappings_created_at ON user_role_mappings(created_at);

-- updated_at indexes
CREATE INDEX IF NOT EXISTS idx_attachments_updated_at ON attachments(updated_at);
CREATE INDEX IF NOT EXISTS idx_logs_updated_at ON logs(updated_at);
CREATE INDEX IF NOT EXISTS idx_menus_updated_at ON menus(updated_at);
CREATE INDEX IF NOT EXISTS idx_post_likes_updated_at ON post_likes(updated_at);
CREATE INDEX IF NOT EXISTS idx_role_menu_mappings_updated_at ON role_menu_mappings(updated_at);
CREATE INDEX IF NOT EXISTS idx_role_program_mappings_updated_at ON role_program_mappings(updated_at);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_updated_at ON token_blacklist(updated_at);

COMMIT;

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify all tables have timestamp columns:
/*
SELECT
  t.table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = t.table_name
    AND column_name = 'created_at'
  ) THEN '✓' ELSE '✗' END as created_at,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = t.table_name
    AND column_name = 'updated_at'
  ) THEN '✓' ELSE '✗' END as updated_at
FROM information_schema.tables t
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;
*/
