-- ==========================================
-- REQUIRED: Admin User
-- 관리자 계정
-- Password: admin123! (bcrypt hashed)
-- ==========================================

-- Admin User
INSERT INTO users (id, username, password, email, name, role, department, status, mfa_enabled, sso_enabled, created_at, updated_at)
VALUES
    ('admin', 'admin', '$2b$10$JlyNjyv9Fq2z1EFVgUWCfu3micETTYFDkq.gnDqFvJdoSWVRVx6dG', 'admin@example.com', 'Administrator', 'admin', 'DEPT-000', 'active', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;

-- Admin User Role Mapping
INSERT INTO user_role_mappings (id, user_id, role_id, is_active, is_primary, assigned_at)
VALUES
    ('URM-ADMIN', 'admin', 'ROLE-ADMIN', true, true, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
