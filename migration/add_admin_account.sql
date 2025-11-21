-- ==========================================
-- ADD ADMIN ACCOUNT
-- ==========================================
-- Create admin user account
-- ID: admin
-- Login ID: admin
-- Password: admin123
-- Email: admin@samsung.com
--

BEGIN;

-- Delete existing admin account if exists
DELETE FROM users WHERE id = 'admin' OR loginid = 'admin';

-- Insert admin account
INSERT INTO users (
    id,
    loginid,
    password,
    email,
    name_ko,
    name_en,
    employee_number,
    system_key,
    phone_number,
    mobile_number,
    user_category,
    position,
    role,
    department,
    status,
    mfa_enabled,
    sso_enabled,
    last_password_changed,
    created_at
)
VALUES (
    'admin',
    'admin',
    '$2b$10$JlyNjyv9Fq2z1EFVgUWCfu3micETTYFDkq.gnDqFvJdoSWVRVx6dG', -- admin123
    'admin@samsung.com',
    '관리자',
    'Administrator',
    '000000',
    'USR-admin',
    '+82-2-2000-0000',
    '+82-10-0000-0000',
    'admin',
    '시스템관리자',
    'admin',
    'DEPT-000', -- 전사
    'active',
    false,
    false,
    NOW(),
    NOW()
);

COMMIT;

-- Verification
SELECT '=== ADMIN ACCOUNT CREATED ===' as status;

-- Show admin account details
SELECT
    'Admin account details' as info;
SELECT
    id,
    loginid,
    name_ko,
    name_en,
    email,
    employee_number,
    position,
    role,
    department,
    status,
    system_key
FROM users
WHERE id = 'admin';

-- Test password (you can verify with bcrypt.compare in Node.js)
SELECT
    'Password verification' as info,
    'Use bcrypt.compare("admin123", hash) to verify' as instruction;
