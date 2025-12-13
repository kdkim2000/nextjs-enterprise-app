-- Enterprise Application Database Schema for PostgreSQL
-- Converted from Liquibase changelog
-- Version: 1.0.0

-- ==========================================
-- Code Tables (code_types, codes)
-- ==========================================

-- code_types table
CREATE TABLE IF NOT EXISTS code_types (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en TEXT,
    description_ko TEXT,
    description_zh TEXT,
    description_vi TEXT,
    display_order INT,
    status VARCHAR(20),
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- codes table
CREATE TABLE IF NOT EXISTS codes (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    code_type VARCHAR(100),
    code VARCHAR(100) NOT NULL,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en TEXT,
    description_ko TEXT,
    description_zh TEXT,
    description_vi TEXT,
    display_order INT,
    status VARCHAR(20),
    parent_code VARCHAR(100),
    attributes JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    code_type_id VARCHAR(100)
);

-- ==========================================
-- User Tables (departments, roles, users, user_role_mappings)
-- ==========================================

-- departments table
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
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
    level INT,
    display_order INT,
    status VARCHAR(20),
    email VARCHAR(100),
    phone VARCHAR(50),
    location VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- roles table
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200),
    description TEXT,
    role_type VARCHAR(50),
    manager VARCHAR(50),
    representative VARCHAR(50),
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255),
    email VARCHAR(200) UNIQUE,
    name VARCHAR(200),
    role VARCHAR(50),
    department VARCHAR(50),
    position VARCHAR(100),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    sso_enabled BOOLEAN DEFAULT FALSE,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT,
    avatar_image TEXT
);

-- user_role_mappings table
CREATE TABLE IF NOT EXISTS user_role_mappings (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    assigned_by VARCHAR(50),
    assigned_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT
);

-- ==========================================
-- Menu Tables (menus, programs, help, permissions, role mappings)
-- ==========================================

-- menus table
CREATE TABLE IF NOT EXISTS menus (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
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
    display_order INT,
    parent_id VARCHAR(50),
    level INT,
    program_id VARCHAR(50)
);

-- programs table
CREATE TABLE IF NOT EXISTS programs (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
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

-- help table
CREATE TABLE IF NOT EXISTS help (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
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

-- permissions table
CREATE TABLE IF NOT EXISTS permissions (
    user_id VARCHAR(50) PRIMARY KEY NOT NULL,
    role VARCHAR(50),
    permissions JSONB,
    menu_access JSONB,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- role_menu_mappings table
CREATE TABLE IF NOT EXISTS role_menu_mappings (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    menu_id VARCHAR(50) NOT NULL,
    can_view BOOLEAN DEFAULT FALSE,
    can_create BOOLEAN DEFAULT FALSE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE
);

-- role_program_mappings table
CREATE TABLE IF NOT EXISTS role_program_mappings (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    program_id VARCHAR(50) NOT NULL,
    can_view BOOLEAN DEFAULT FALSE,
    can_create BOOLEAN DEFAULT FALSE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- Content Tables (board_types, posts, comments, attachments)
-- ==========================================

-- attachment_types table
CREATE TABLE IF NOT EXISTS attachment_types (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en TEXT,
    description_ko TEXT,
    description_zh TEXT,
    description_vi TEXT,
    allowed_extensions JSONB,
    max_file_size BIGINT,
    max_files INT,
    storage_path VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    attachment_type_id VARCHAR(50),
    original_name VARCHAR(500) NOT NULL,
    stored_name VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT,
    file_path VARCHAR(1000),
    download_count INT DEFAULT 0,
    uploaded_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE
);

-- board_types table
CREATE TABLE IF NOT EXISTS board_types (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en TEXT,
    description_ko TEXT,
    description_zh TEXT,
    description_vi TEXT,
    type VARCHAR(20) DEFAULT 'normal',
    settings JSONB,
    write_roles JSONB,
    read_roles JSONB,
    category VARCHAR(50),
    display_order INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    total_posts INT DEFAULT 0,
    total_views INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- posts table
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    board_type_id VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    author_id VARCHAR(50) NOT NULL,
    author_name VARCHAR(200),
    author_department VARCHAR(50),
    is_anonymous BOOLEAN DEFAULT FALSE,
    post_type VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'published',
    is_pinned BOOLEAN DEFAULT FALSE,
    pinned_until TIMESTAMP WITH TIME ZONE,
    is_secret BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    approved_by VARCHAR(50),
    approved_at TIMESTAMP WITH TIME ZONE,
    view_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    attachment_count INT DEFAULT 0,
    attachment_id VARCHAR(50),
    tags JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- comments table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    post_id VARCHAR(50) NOT NULL,
    parent_id VARCHAR(50),
    content TEXT NOT NULL,
    author_id VARCHAR(50) NOT NULL,
    author_name VARCHAR(200),
    is_anonymous BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    like_count INT DEFAULT 0,
    reply_count INT DEFAULT 0,
    depth INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- Communication Tables (mail, messages)
-- ==========================================

-- mail_messages table
CREATE TABLE IF NOT EXISTS mail_messages (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    sender_id VARCHAR(50) NOT NULL,
    subject VARCHAR(500),
    body TEXT,
    body_html TEXT,
    attachment_id VARCHAR(50),
    send_external BOOLEAN DEFAULT FALSE,
    external_status VARCHAR(20),
    external_sent_at TIMESTAMP WITH TIME ZONE,
    external_error TEXT,
    is_draft BOOLEAN DEFAULT TRUE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- mail_recipients table
CREATE TABLE IF NOT EXISTS mail_recipients (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    message_id VARCHAR(50) NOT NULL,
    recipient_id VARCHAR(50) NOT NULL,
    recipient_type VARCHAR(10) DEFAULT 'to',
    created_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_mail_recipients UNIQUE (message_id, recipient_id)
);

-- mail_user_messages table
CREATE TABLE IF NOT EXISTS mail_user_messages (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    message_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    role VARCHAR(10) NOT NULL,
    folder VARCHAR(20) DEFAULT 'inbox',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_starred BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
);

-- messages table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
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

-- ==========================================
-- System Tables (app_settings, logs, preferences, tokens, conversations)
-- ==========================================

-- app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(100) PRIMARY KEY NOT NULL,
    value TEXT,
    value_type VARCHAR(20) DEFAULT 'string',
    category VARCHAR(50) NOT NULL,
    is_ready BOOLEAN DEFAULT FALSE,
    is_applied BOOLEAN DEFAULT FALSE,
    description_en TEXT,
    description_ko TEXT,
    description_zh TEXT,
    description_vi TEXT,
    display_order INT DEFAULT 0,
    is_sensitive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(50)
);

-- user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id VARCHAR(50) PRIMARY KEY NOT NULL,
    favorite_menus JSONB,
    recent_menus JSONB,
    language VARCHAR(10),
    theme VARCHAR(20),
    rows_per_page INT,
    email_notifications BOOLEAN DEFAULT TRUE,
    system_notifications BOOLEAN DEFAULT TRUE,
    session_timeout INT,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- logs table
CREATE TABLE IF NOT EXISTS logs (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE,
    method VARCHAR(10),
    path TEXT,
    url TEXT,
    original_url TEXT,
    status_code INT,
    duration VARCHAR(20),
    user_id VARCHAR(50),
    program_id VARCHAR(50),
    ip VARCHAR(50),
    user_agent TEXT
);

-- token_blacklist table
CREATE TABLE IF NOT EXISTS token_blacklist (
    token VARCHAR(500) PRIMARY KEY NOT NULL,
    user_id VARCHAR(50),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
);

-- mfa_codes table
CREATE TABLE IF NOT EXISTS mfa_codes (
    user_id VARCHAR(50) PRIMARY KEY NOT NULL,
    secret VARCHAR(255),
    backup_codes JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    title TEXT,
    project_path VARCHAR(1000),
    project_name VARCHAR(200),
    branch_name VARCHAR(200),
    summary TEXT,
    learning_points TEXT,
    difficulty_level VARCHAR(20),
    category VARCHAR(50),
    total_messages INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    duration_minutes INT,
    status VARCHAR(20),
    source VARCHAR(50),
    original_session_id VARCHAR(100),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    tags JSONB
);

-- conversation_messages table
CREATE TABLE IF NOT EXISTS conversation_messages (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    conversation_id VARCHAR(50) NOT NULL,
    role VARCHAR(20),
    content TEXT,
    content_type VARCHAR(20),
    has_code BOOLEAN DEFAULT FALSE,
    has_error BOOLEAN DEFAULT FALSE,
    tool_calls JSONB,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE
);

-- conversation_code_changes table
CREATE TABLE IF NOT EXISTS conversation_code_changes (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    conversation_id VARCHAR(50) NOT NULL,
    file_path VARCHAR(1000),
    change_type VARCHAR(20),
    lines_added INT DEFAULT 0,
    lines_removed INT DEFAULT 0,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE
);
