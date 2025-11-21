-- Add Performance Indexes (Simple Version - No Comments)
-- Run as app_user

-- LOGS table indexes
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_program_id ON logs (program_id) WHERE program_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_status_code ON logs (status_code);
CREATE INDEX IF NOT EXISTS idx_logs_user_timestamp ON logs (user_id, timestamp DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_program_timestamp ON logs (program_id, timestamp DESC) WHERE program_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_errors ON logs (timestamp DESC) WHERE status_code >= 400;
CREATE INDEX IF NOT EXISTS idx_logs_method ON logs (method);

-- USERS table indexes
CREATE INDEX IF NOT EXISTS idx_users_loginid ON users (loginid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_employee_number ON users (employee_number) WHERE employee_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
CREATE INDEX IF NOT EXISTS idx_users_department ON users (department) WHERE department IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_search_gin ON users USING gin(
  to_tsvector('simple',
    COALESCE(loginid, '') || ' ' ||
    COALESCE(email, '') || ' ' ||
    COALESCE(name_ko, '') || ' ' ||
    COALESCE(name_en, '') || ' ' ||
    COALESCE(employee_number, '')
  )
);

-- USER_ROLE_MAPPINGS table indexes
CREATE INDEX IF NOT EXISTS idx_user_role_mappings_user_id ON user_role_mappings (user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_mappings_role_id ON user_role_mappings (role_id);
CREATE INDEX IF NOT EXISTS idx_user_role_mappings_composite ON user_role_mappings (user_id, role_id);

-- ROLE_MENU_MAPPINGS table indexes
CREATE INDEX IF NOT EXISTS idx_role_menu_mappings_role_id ON role_menu_mappings (role_id);
CREATE INDEX IF NOT EXISTS idx_role_menu_mappings_menu_id ON role_menu_mappings (menu_id);

-- ROLE_PROGRAM_MAPPINGS table indexes
CREATE INDEX IF NOT EXISTS idx_role_program_mappings_role_id ON role_program_mappings (role_id);
CREATE INDEX IF NOT EXISTS idx_role_program_mappings_program_id ON role_program_mappings (program_id);

-- MENUS table indexes
CREATE INDEX IF NOT EXISTS idx_menus_parent_id ON menus (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_menus_order ON menus ("order");
CREATE INDEX IF NOT EXISTS idx_menus_path ON menus (path) WHERE path IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_menus_code ON menus (code);

-- PROGRAMS table indexes
CREATE INDEX IF NOT EXISTS idx_programs_code ON programs (code);

-- DEPARTMENTS table indexes
CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON departments (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments (code);
CREATE INDEX IF NOT EXISTS idx_departments_level ON departments (level);

-- TOKEN_BLACKLIST table indexes
CREATE INDEX IF NOT EXISTS idx_token_blacklist_token ON token_blacklist (token);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON token_blacklist (expires_at);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_user_id ON token_blacklist (user_id) WHERE user_id IS NOT NULL;

-- MFA_CODES table indexes
CREATE INDEX IF NOT EXISTS idx_mfa_codes_user_id ON mfa_codes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mfa_codes_created_at ON mfa_codes (created_at);

-- CODES table indexes
CREATE INDEX IF NOT EXISTS idx_codes_type_code ON codes (type_code);
CREATE INDEX IF NOT EXISTS idx_codes_code ON codes (code);

-- ROLES table indexes
CREATE INDEX IF NOT EXISTS idx_roles_name_en ON roles (name_en);

-- Print success message
SELECT 'Indexes created successfully!' as status;
