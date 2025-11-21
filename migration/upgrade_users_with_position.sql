-- ==========================================
-- USERS TABLE UPGRADE - Add Position Column and Update Data
-- ==========================================
-- This script:
-- 1. Adds position column
-- 2. Updates all user IDs to U + 12-digit numbers
-- 3. Updates employee_number to 6-digit numbers
-- 4. Sets all positions to "프로"
-- 5. Redistributes departments: 팀(5%), 부(5%), 과(90%)
--

BEGIN;

-- Step 1: Add position column
ALTER TABLE users ADD COLUMN IF NOT EXISTS position VARCHAR(100);

-- Add index for position
CREATE INDEX IF NOT EXISTS idx_users_position ON users(position);

-- Add comment
COMMENT ON COLUMN users.position IS 'Job position/title (직급)';

COMMIT;

-- Verification
SELECT 'Position column added successfully' as status;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'position';
