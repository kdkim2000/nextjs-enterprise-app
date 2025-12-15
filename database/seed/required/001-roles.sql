-- ==========================================
-- REQUIRED: System Roles
-- 시스템 기본 역할 데이터
-- ==========================================

-- System Roles (시스템 역할)
INSERT INTO roles (id, name, display_name, description, role_type, is_system, is_active, created_at, updated_at)
VALUES
    ('ROLE-ADMIN', 'admin', 'Administrator', 'System administrator with full access', 'system', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ROLE-MANAGER', 'manager', 'Manager', 'Department manager with extended permissions', 'management', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ROLE-USER', 'user', 'User', 'Regular user with standard permissions', 'user', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ROLE-GUEST', 'guest', 'Guest', 'Guest user with limited access', 'guest', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;
