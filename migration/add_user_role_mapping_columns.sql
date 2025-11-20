-- Add updated_at and updated_by columns to user_role_mappings table
-- This enhances the audit trail for user-role assignments

-- Add updated_at column
ALTER TABLE user_role_mappings
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_by column
ALTER TABLE user_role_mappings
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(50);

-- Update existing rows to have updated_at same as assigned_at
UPDATE user_role_mappings
SET updated_at = assigned_at
WHERE updated_at IS NULL;

-- Add unique constraint on user_id and role_id combination
-- This prevents duplicate active role assignments
ALTER TABLE user_role_mappings
ADD CONSTRAINT unique_user_role_active UNIQUE (user_id, role_id);

-- Verify the changes
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_role_mappings'
ORDER BY ordinal_position;
