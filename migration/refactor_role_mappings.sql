-- =============================================
-- REFACTOR: Role Mappings Table Cleanup
-- 1. Drop role_menu_mappings table (no longer needed)
-- 2. Rename role_program_mappings.program_id to program_code
-- =============================================

-- Step 1: Drop role_menu_mappings table
-- This table is no longer used - permissions are managed through role_program_mappings
DROP TABLE IF EXISTS role_menu_mappings CASCADE;

-- Step 2: Rename program_id column to program_code in role_program_mappings
-- This column stores programs.code value, not programs.id
ALTER TABLE role_program_mappings
RENAME COLUMN program_id TO program_code;

-- Step 3: Update indexes
DROP INDEX IF EXISTS idx_role_program_mappings_program_id;
CREATE INDEX IF NOT EXISTS idx_role_program_mappings_program_code ON role_program_mappings(program_code);

-- Step 4: Update comments
COMMENT ON COLUMN role_program_mappings.program_code IS 'Program code (references programs.code)';

-- Step 5: Verify changes
SELECT 'role_program_mappings columns:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'role_program_mappings'
ORDER BY ordinal_position;

SELECT 'Sample data:' as info;
SELECT id, role_id, program_code, can_view FROM role_program_mappings LIMIT 5;
