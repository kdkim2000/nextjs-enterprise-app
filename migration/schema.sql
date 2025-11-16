-- PostgreSQL Schema for Enterprise Application
-- Migration from JSON files to PostgreSQL
-- Language columns: en, ko, zh, vi are stored as separate columns
-- No foreign key constraints (as per requirements)

-- ==========================================
-- DROP TABLES (if exists)
-- ==========================================
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS role_program_mappings CASCADE;
DROP TABLE IF EXISTS role_menu_mappings CASCADE;
DROP TABLE IF EXISTS user_role_mappings CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS help CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS menus CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS codes CASCADE;
DROP TABLE IF EXISTS code_types CASCADE;
DROP TABLE IF EXISTS token_blacklist CASCADE;
DROP TABLE IF EXISTS mfa_codes CASCADE;

-- ==========================================
-- CODE TYPES TABLE
-- ==========================================
CREATE TABLE code_types (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en TEXT,
    description_ko TEXT,
    description_zh TEXT,
    description_vi TEXT,
    "order" INTEGER,
    status VARCHAR(20),
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_code_types_code ON code_types(code);
CREATE INDEX idx_code_types_status ON code_types(status);
CREATE INDEX idx_code_types_category ON code_types(category);

-- ==========================================
-- CODES TABLE
-- ==========================================
CREATE TABLE codes (
    id VARCHAR(50) PRIMARY KEY,
    code_type VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en TEXT,
    description_ko TEXT,
    description_zh TEXT,
    description_vi TEXT,
    "order" INTEGER,
    status VARCHAR(20),
    parent_code VARCHAR(100),
    attributes JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_codes_code_type ON codes(code_type);
CREATE INDEX idx_codes_code ON codes(code);
CREATE INDEX idx_codes_status ON codes(status);
CREATE INDEX idx_codes_parent_code ON codes(parent_code);
CREATE INDEX idx_codes_attributes ON codes USING GIN (attributes);

-- ==========================================
-- DEPARTMENTS TABLE
-- ==========================================
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en TEXT,
    description_ko TEXT,
    description_zh TEXT,
    description_vi TEXT,
    parent_id VARCHAR(50),
    manager_id VARCHAR(50),
    level INTEGER,
    "order" INTEGER,
    status VARCHAR(20),
    email VARCHAR(100),
    phone VARCHAR(50),
    location VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_departments_code ON departments(code);
CREATE INDEX idx_departments_parent_id ON departments(parent_id);
CREATE INDEX idx_departments_manager_id ON departments(manager_id);
CREATE INDEX idx_departments_status ON departments(status);

-- ==========================================
-- ROLES TABLE
-- ==========================================
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200),
    description TEXT,
    role_type VARCHAR(50),
    manager VARCHAR(50),
    representative VARCHAR(50),
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_is_active ON roles(is_active);
CREATE INDEX idx_roles_role_type ON roles(role_type);

-- ==========================================
-- USERS TABLE
-- ==========================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255),
    email VARCHAR(200) UNIQUE,
    name VARCHAR(200),
    role VARCHAR(50),
    department VARCHAR(50),
    mfa_enabled BOOLEAN DEFAULT false,
    sso_enabled BOOLEAN DEFAULT false,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_status ON users(status);

-- ==========================================
-- MESSAGES TABLE
-- ==========================================
CREATE TABLE messages (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    type VARCHAR(50),
    message_en TEXT,
    message_ko TEXT,
    message_zh TEXT,
    message_vi TEXT,
    description_en TEXT,
    description_ko TEXT,
    description_zh TEXT,
    description_vi TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_messages_code ON messages(code);
CREATE INDEX idx_messages_category ON messages(category);
CREATE INDEX idx_messages_type ON messages(type);
CREATE INDEX idx_messages_status ON messages(status);

-- ==========================================
-- MENUS TABLE
-- ==========================================
CREATE TABLE menus (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en TEXT,
    description_ko TEXT,
    description_zh TEXT,
    description_vi TEXT,
    path VARCHAR(500),
    icon VARCHAR(100),
    "order" INTEGER,
    parent_id VARCHAR(50),
    level INTEGER,
    program_id VARCHAR(50)
);

CREATE INDEX idx_menus_code ON menus(code);
CREATE INDEX idx_menus_parent_id ON menus(parent_id);
CREATE INDEX idx_menus_program_id ON menus(program_id);
CREATE INDEX idx_menus_order ON menus("order");

-- ==========================================
-- PROGRAMS TABLE
-- ==========================================
CREATE TABLE programs (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en TEXT,
    description_ko TEXT,
    description_zh TEXT,
    description_vi TEXT,
    category VARCHAR(50),
    type VARCHAR(50),
    status VARCHAR(20),
    permissions JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_programs_code ON programs(code);
CREATE INDEX idx_programs_category ON programs(category);
CREATE INDEX idx_programs_type ON programs(type);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_permissions ON programs USING GIN (permissions);

-- ==========================================
-- HELP TABLE
-- ==========================================
CREATE TABLE help (
    id VARCHAR(50) PRIMARY KEY,
    program_id VARCHAR(50),
    title TEXT,
    content TEXT,
    sections JSONB,
    faq JSONB,
    tips JSONB,
    troubleshooting JSONB,
    video_url VARCHAR(500),
    related_topics JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE INDEX idx_help_program_id ON help(program_id);
CREATE INDEX idx_help_sections ON help USING GIN (sections);

-- ==========================================
-- PERMISSIONS TABLE
-- ==========================================
CREATE TABLE permissions (
    user_id VARCHAR(50) PRIMARY KEY,
    role VARCHAR(50),
    permissions JSONB,
    menu_access JSONB,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_permissions_role ON permissions(role);
CREATE INDEX idx_permissions_permissions ON permissions USING GIN (permissions);
CREATE INDEX idx_permissions_menu_access ON permissions USING GIN (menu_access);

-- ==========================================
-- USER ROLE MAPPINGS TABLE
-- ==========================================
CREATE TABLE user_role_mappings (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    assigned_by VARCHAR(50),
    assigned_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_user_role_mappings_user_id ON user_role_mappings(user_id);
CREATE INDEX idx_user_role_mappings_role_id ON user_role_mappings(role_id);
CREATE INDEX idx_user_role_mappings_is_active ON user_role_mappings(is_active);

-- ==========================================
-- ROLE MENU MAPPINGS TABLE
-- ==========================================
CREATE TABLE role_menu_mappings (
    id VARCHAR(50) PRIMARY KEY,
    role_id VARCHAR(50) NOT NULL,
    menu_id VARCHAR(50) NOT NULL,
    can_view BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_role_menu_mappings_role_id ON role_menu_mappings(role_id);
CREATE INDEX idx_role_menu_mappings_menu_id ON role_menu_mappings(menu_id);

-- ==========================================
-- ROLE PROGRAM MAPPINGS TABLE
-- ==========================================
CREATE TABLE role_program_mappings (
    id VARCHAR(50) PRIMARY KEY,
    role_id VARCHAR(50) NOT NULL,
    program_id VARCHAR(50) NOT NULL,
    can_view BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_role_program_mappings_role_id ON role_program_mappings(role_id);
CREATE INDEX idx_role_program_mappings_program_id ON role_program_mappings(program_id);

-- ==========================================
-- USER PREFERENCES TABLE
-- ==========================================
CREATE TABLE user_preferences (
    user_id VARCHAR(50) PRIMARY KEY,
    favorite_menus JSONB,
    recent_menus JSONB,
    language VARCHAR(10),
    theme VARCHAR(20),
    rows_per_page INTEGER,
    email_notifications BOOLEAN DEFAULT true,
    system_notifications BOOLEAN DEFAULT true,
    session_timeout INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_user_preferences_language ON user_preferences(language);
CREATE INDEX idx_user_preferences_theme ON user_preferences(theme);

-- ==========================================
-- LOGS TABLE
-- ==========================================
CREATE TABLE logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE,
    method VARCHAR(10),
    path TEXT,
    url TEXT,
    original_url TEXT,
    status_code INTEGER,
    duration VARCHAR(20),
    user_id VARCHAR(50),
    program_id VARCHAR(50),
    ip VARCHAR(50),
    user_agent TEXT
);

CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_program_id ON logs(program_id);
CREATE INDEX idx_logs_status_code ON logs(status_code);
CREATE INDEX idx_logs_method ON logs(method);

-- ==========================================
-- TOKEN BLACKLIST TABLE
-- ==========================================
CREATE TABLE token_blacklist (
    token VARCHAR(500) PRIMARY KEY,
    user_id VARCHAR(50),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_token_blacklist_user_id ON token_blacklist(user_id);
CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- ==========================================
-- MFA CODES TABLE
-- ==========================================
CREATE TABLE mfa_codes (
    user_id VARCHAR(50) PRIMARY KEY,
    secret VARCHAR(255),
    backup_codes JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- COMMENTS
-- ==========================================
COMMENT ON TABLE code_types IS 'Code type master data with multi-language support';
COMMENT ON TABLE codes IS 'Code master data with multi-language support';
COMMENT ON TABLE departments IS 'Department hierarchy with multi-language support';
COMMENT ON TABLE roles IS 'User roles and permissions';
COMMENT ON TABLE users IS 'System users';
COMMENT ON TABLE messages IS 'System messages with multi-language support';
COMMENT ON TABLE menus IS 'Menu structure with multi-language support';
COMMENT ON TABLE programs IS 'Program definitions with multi-language support';
COMMENT ON TABLE help IS 'Help documentation for programs';
COMMENT ON TABLE permissions IS 'User permissions and menu access';
COMMENT ON TABLE user_role_mappings IS 'User to role mappings';
COMMENT ON TABLE role_menu_mappings IS 'Role to menu access mappings';
COMMENT ON TABLE role_program_mappings IS 'Role to program access mappings';
COMMENT ON TABLE user_preferences IS 'User preferences and settings';
COMMENT ON TABLE logs IS 'System access and operation logs';
COMMENT ON TABLE token_blacklist IS 'Blacklisted JWT tokens';
COMMENT ON TABLE mfa_codes IS 'Multi-factor authentication codes';
