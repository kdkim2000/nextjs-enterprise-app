-- ==========================================
-- USERS TABLE UPGRADE - Realistic Fields
-- ==========================================
-- This script upgrades the users table to include realistic fields
-- for enterprise user management
--
-- Changes:
-- 1. Rename username to loginid
-- 2. Split name into name_ko and name_en
-- 3. Add employee_number (사번)
-- 4. Add system_key (시스템 내부 고유 key)
-- 5. Add last_password_changed (최종 비밀번호 변경일시)
-- 6. Add phone_number (전화번호)
-- 7. Add mobile_number (휴대전화번호)
-- 8. Add user_category (사용자구분)

BEGIN;

-- Step 1: Rename username column to loginid
ALTER TABLE users RENAME COLUMN username TO loginid;

-- Step 2: Add new name columns (name_ko, name_en)
ALTER TABLE users ADD COLUMN name_ko VARCHAR(200);
ALTER TABLE users ADD COLUMN name_en VARCHAR(200);

-- Step 3: Migrate existing name data to name_ko
-- Assuming existing names are in Korean format
UPDATE users SET name_ko = name WHERE name IS NOT NULL;

-- Step 4: Add new columns
ALTER TABLE users ADD COLUMN employee_number VARCHAR(50);
ALTER TABLE users ADD COLUMN system_key VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN last_password_changed TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN phone_number VARCHAR(50);
ALTER TABLE users ADD COLUMN mobile_number VARCHAR(50);
ALTER TABLE users ADD COLUMN user_category VARCHAR(50) DEFAULT 'regular';

-- Step 5: Drop old name column
ALTER TABLE users DROP COLUMN name;

-- Step 6: Update indexes
DROP INDEX IF EXISTS idx_users_username;
CREATE INDEX idx_users_loginid ON users(loginid);
CREATE INDEX idx_users_employee_number ON users(employee_number);
CREATE INDEX idx_users_system_key ON users(system_key);
CREATE INDEX idx_users_user_category ON users(user_category);
CREATE INDEX idx_users_name_ko ON users(name_ko);
CREATE INDEX idx_users_name_en ON users(name_en);

-- Step 7: Set initial values for new fields
-- Set system_key as a unique identifier (using id as base)
UPDATE users
SET system_key = 'USR-' || id
WHERE system_key IS NULL;

-- Set last_password_changed to created_at if not set
UPDATE users
SET last_password_changed = created_at
WHERE last_password_changed IS NULL AND created_at IS NOT NULL;

-- Step 8: Add comments for documentation
COMMENT ON COLUMN users.loginid IS 'Login ID for authentication';
COMMENT ON COLUMN users.name_ko IS 'Korean name of the user';
COMMENT ON COLUMN users.name_en IS 'English name of the user';
COMMENT ON COLUMN users.employee_number IS 'Employee number (사번)';
COMMENT ON COLUMN users.system_key IS 'System internal unique key';
COMMENT ON COLUMN users.last_password_changed IS 'Last password change timestamp';
COMMENT ON COLUMN users.phone_number IS 'Office phone number';
COMMENT ON COLUMN users.mobile_number IS 'Mobile phone number';
COMMENT ON COLUMN users.user_category IS 'User category/type';

-- Step 9: Add constraints
ALTER TABLE users ADD CONSTRAINT chk_user_category
  CHECK (user_category IN ('regular', 'contractor', 'temporary', 'external', 'admin'));

COMMIT;

-- Verification queries
SELECT
  'Total users:' as info,
  COUNT(*) as count
FROM users;

SELECT
  'Users with system_key:' as info,
  COUNT(*) as count
FROM users
WHERE system_key IS NOT NULL;

SELECT
  'Sample user data:' as info;
SELECT
  id,
  loginid,
  name_ko,
  name_en,
  employee_number,
  system_key,
  email,
  user_category,
  phone_number,
  mobile_number,
  last_password_changed,
  department,
  status
FROM users
LIMIT 5;
