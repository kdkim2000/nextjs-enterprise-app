-- ============================================
-- CoreNext Enterprise Application
-- MySQL/MariaDB Database Schema
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables
DROP TABLE IF EXISTS answer_helpful;
DROP TABLE IF EXISTS app_settings;
DROP TABLE IF EXISTS attachment_files;
DROP TABLE IF EXISTS attachment_types;
DROP TABLE IF EXISTS attachments;
DROP TABLE IF EXISTS board_types;
DROP TABLE IF EXISTS code_types;
DROP TABLE IF EXISTS codes;
DROP TABLE IF EXISTS comment_likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS conversation_code_changes;
DROP TABLE IF EXISTS conversation_messages;
DROP TABLE IF EXISTS conversation_tag_mappings;
DROP TABLE IF EXISTS conversation_tags;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS help;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS mail_messages;
DROP TABLE IF EXISTS mail_recipients;
DROP TABLE IF EXISTS mail_user_messages;
DROP TABLE IF EXISTS menus;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS mfa_codes;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS post_likes;
DROP TABLE IF EXISTS post_views;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS role_program_mappings;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS token_blacklist;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS user_role_mappings;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. ANSWER_HELPFUL
CREATE TABLE answer_helpful (
    id VARCHAR(50) NOT NULL,
    comment_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_answer_helpful (comment_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. APP_SETTINGS
CREATE TABLE app_settings (
    `key` VARCHAR(100) NOT NULL,
    `value` LONGTEXT,
    value_type VARCHAR(50) DEFAULT 'string',
    category VARCHAR(100),
    is_ready TINYINT(1) DEFAULT 1,
    description_en LONGTEXT,
    description_ko LONGTEXT,
    description_zh LONGTEXT,
    description_vi LONGTEXT,
    display_order INT DEFAULT 0,
    is_sensitive TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    is_applied TINYINT(1) DEFAULT 0,
    PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ATTACHMENT_FILES
CREATE TABLE attachment_files (
    id VARCHAR(50) NOT NULL,
    attachment_id VARCHAR(50) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    stored_filename VARCHAR(500) NOT NULL,
    file_extension VARCHAR(20),
    mime_type VARCHAR(100),
    file_size BIGINT NOT NULL,
    storage_path VARCHAR(1000) NOT NULL,
    full_path VARCHAR(1500),
    checksum VARCHAR(100),
    is_image TINYINT(1) DEFAULT 0,
    image_width INT,
    image_height INT,
    thumbnail_path VARCHAR(1000),
    download_count INT DEFAULT 0,
    `order` INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_by VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ATTACHMENT_TYPES
CREATE TABLE attachment_types (
    id VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en LONGTEXT,
    description_ko LONGTEXT,
    description_zh LONGTEXT,
    description_vi LONGTEXT,
    storage_path VARCHAR(500),
    max_file_count INT DEFAULT 10,
    max_file_size BIGINT DEFAULT 10485760,
    max_total_size BIGINT DEFAULT 104857600,
    allowed_extensions LONGTEXT,
    allowed_mime_types LONGTEXT,
    status VARCHAR(20) DEFAULT 'active',
    `order` INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_attachment_types_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ATTACHMENTS
CREATE TABLE attachments (
    id VARCHAR(50) NOT NULL,
    attachment_type_id VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(50),
    title VARCHAR(500),
    description LONGTEXT,
    file_count INT DEFAULT 0,
    total_size BIGINT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_by VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BOARD_TYPES
CREATE TABLE board_types (
    id VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en LONGTEXT,
    description_ko LONGTEXT,
    description_zh LONGTEXT,
    description_vi LONGTEXT,
    `type` VARCHAR(50) DEFAULT 'general',
    settings LONGTEXT,
    write_roles LONGTEXT,
    read_roles LONGTEXT,
    category VARCHAR(100),
    `order` INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    total_posts INT DEFAULT 0,
    total_views INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    PRIMARY KEY (id),
    UNIQUE KEY uk_board_types_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. CODE_TYPES
CREATE TABLE code_types (
    id VARCHAR(50) NOT NULL,
    code VARCHAR(100) NOT NULL,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en LONGTEXT,
    description_ko LONGTEXT,
    description_zh LONGTEXT,
    description_vi LONGTEXT,
    `order` INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    category VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_code_types_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. CODES
CREATE TABLE codes (
    id VARCHAR(50) NOT NULL,
    code_type VARCHAR(100),
    code VARCHAR(100) NOT NULL,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en LONGTEXT,
    description_ko LONGTEXT,
    description_zh LONGTEXT,
    description_vi LONGTEXT,
    `order` INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    parent_code VARCHAR(100),
    attributes LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. COMMENT_LIKES
CREATE TABLE comment_likes (
    id VARCHAR(50) NOT NULL,
    comment_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_comment_likes (comment_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. COMMENTS
CREATE TABLE comments (
    id VARCHAR(50) NOT NULL,
    post_id VARCHAR(50) NOT NULL,
    parent_id VARCHAR(50),
    author_id VARCHAR(50) NOT NULL,
    author_name VARCHAR(200),
    is_anonymous TINYINT(1) DEFAULT 0,
    content LONGTEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'published',
    like_count INT DEFAULT 0,
    depth INT DEFAULT 0,
    metadata LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    is_accepted TINYINT(1) DEFAULT 0,
    accepted_at DATETIME,
    helpful_count INT DEFAULT 0,
    quality_score INT DEFAULT 0,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. CONVERSATIONS
CREATE TABLE conversations (
    id VARCHAR(50) NOT NULL,
    title VARCHAR(500),
    project_path VARCHAR(1000),
    project_name VARCHAR(200),
    branch_name VARCHAR(200),
    summary LONGTEXT,
    learning_points LONGTEXT,
    difficulty_level VARCHAR(20),
    category VARCHAR(100),
    total_messages INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    duration_minutes INT,
    status VARCHAR(20) DEFAULT 'active',
    source VARCHAR(50) DEFAULT 'claude-code',
    original_session_id VARCHAR(100),
    started_at DATETIME,
    ended_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. CONVERSATION_CODE_CHANGES
CREATE TABLE conversation_code_changes (
    id VARCHAR(50) NOT NULL,
    conversation_id VARCHAR(50) NOT NULL,
    message_id VARCHAR(50),
    file_path VARCHAR(1000) NOT NULL,
    file_name VARCHAR(255),
    change_type VARCHAR(20) NOT NULL,
    language VARCHAR(50),
    code_before LONGTEXT,
    code_after LONGTEXT,
    diff_content LONGTEXT,
    lines_added INT DEFAULT 0,
    lines_removed INT DEFAULT 0,
    explanation LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. CONVERSATION_MESSAGES
CREATE TABLE conversation_messages (
    id VARCHAR(50) NOT NULL,
    conversation_id VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL,
    content LONGTEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text',
    token_count INT,
    `order` INT NOT NULL,
    has_code TINYINT(1) DEFAULT 0,
    has_error TINYINT(1) DEFAULT 0,
    tool_calls LONGTEXT,
    metadata LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. CONVERSATION_TAG_MAPPINGS
CREATE TABLE conversation_tag_mappings (
    conversation_id VARCHAR(50) NOT NULL,
    tag_id VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. CONVERSATION_TAGS
CREATE TABLE conversation_tags (
    id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_ko VARCHAR(100),
    description LONGTEXT,
    color VARCHAR(20) DEFAULT '#6B7280',
    category VARCHAR(50),
    usage_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. DEPARTMENTS
CREATE TABLE departments (
    id VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en LONGTEXT,
    description_ko LONGTEXT,
    description_zh LONGTEXT,
    description_vi LONGTEXT,
    parent_id VARCHAR(50),
    manager_id VARCHAR(50),
    `level` INT DEFAULT 0,
    `order` INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_departments_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. HELP
CREATE TABLE help (
    id VARCHAR(50) NOT NULL,
    program_id VARCHAR(50),
    title VARCHAR(500),
    content LONGTEXT,
    sections LONGTEXT,
    faq LONGTEXT,
    tips LONGTEXT,
    troubleshooting LONGTEXT,
    video_url VARCHAR(1000),
    related_topics LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    language VARCHAR(10),
    status VARCHAR(20) DEFAULT 'active',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. LOGS
CREATE TABLE logs (
    id VARCHAR(50) NOT NULL,
    log_type VARCHAR(50) NOT NULL,
    log_level VARCHAR(20) DEFAULT 'info',
    user_id VARCHAR(50),
    user_ip VARCHAR(50),
    user_agent LONGTEXT,
    action VARCHAR(100),
    resource_type VARCHAR(50),
    resource_id VARCHAR(50),
    details LONGTEXT,
    error_message LONGTEXT,
    error_stack LONGTEXT,
    request_path VARCHAR(500),
    request_method VARCHAR(10),
    response_status INT,
    duration_ms INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. MAIL_MESSAGES
CREATE TABLE mail_messages (
    id VARCHAR(50) NOT NULL,
    sender_id VARCHAR(50) NOT NULL,
    subject VARCHAR(500),
    body LONGTEXT,
    body_type VARCHAR(20) DEFAULT 'html',
    priority VARCHAR(20) DEFAULT 'normal',
    has_attachments TINYINT(1) DEFAULT 0,
    attachment_count INT DEFAULT 0,
    attachment_id VARCHAR(50),
    read_receipt TINYINT(1) DEFAULT 0,
    importance VARCHAR(20) DEFAULT 'normal',
    metadata LONGTEXT,
    thread_id VARCHAR(50),
    in_reply_to VARCHAR(50),
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. MAIL_RECIPIENTS
CREATE TABLE mail_recipients (
    id VARCHAR(50) NOT NULL,
    message_id VARCHAR(50) NOT NULL,
    recipient_id VARCHAR(50) NOT NULL,
    recipient_type VARCHAR(10) DEFAULT 'to',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. MAIL_USER_MESSAGES
CREATE TABLE mail_user_messages (
    id VARCHAR(50) NOT NULL,
    message_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    folder VARCHAR(50) DEFAULT 'inbox',
    is_read TINYINT(1) DEFAULT 0,
    is_starred TINYINT(1) DEFAULT 0,
    is_important TINYINT(1) DEFAULT 0,
    labels LONGTEXT,
    read_at DATETIME,
    archived_at DATETIME,
    deleted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. MENUS
CREATE TABLE menus (
    id VARCHAR(50) NOT NULL,
    code VARCHAR(100) NOT NULL,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en LONGTEXT,
    description_ko LONGTEXT,
    description_zh LONGTEXT,
    description_vi LONGTEXT,
    path VARCHAR(500),
    icon VARCHAR(100),
    `order` INT DEFAULT 0,
    parent_id VARCHAR(50),
    `level` INT DEFAULT 0,
    program_id VARCHAR(50),
    board_type_id VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_menus_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. MESSAGES
CREATE TABLE messages (
    id VARCHAR(50) NOT NULL,
    code VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    `type` VARCHAR(50),
    message_en LONGTEXT,
    message_ko LONGTEXT,
    message_zh LONGTEXT,
    message_vi LONGTEXT,
    description_en LONGTEXT,
    description_ko LONGTEXT,
    description_zh LONGTEXT,
    description_vi LONGTEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_messages_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. MFA_CODES
CREATE TABLE mfa_codes (
    id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    code VARCHAR(10) NOT NULL,
    mfa_type VARCHAR(20) DEFAULT 'email',
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. PERMISSIONS
CREATE TABLE permissions (
    id VARCHAR(50) NOT NULL,
    role_program_mapping_id VARCHAR(50) NOT NULL,
    permission_type VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. POST_LIKES
CREATE TABLE post_likes (
    id VARCHAR(50) NOT NULL,
    post_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_post_likes (post_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. POST_VIEWS
CREATE TABLE post_views (
    id VARCHAR(50) NOT NULL,
    post_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50),
    ip_address VARCHAR(50),
    user_agent LONGTEXT,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 28. POSTS
CREATE TABLE posts (
    id VARCHAR(50) NOT NULL,
    board_type_id VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content LONGTEXT NOT NULL,
    author_id VARCHAR(50) NOT NULL,
    author_name VARCHAR(200),
    author_department VARCHAR(50),
    is_anonymous TINYINT(1) DEFAULT 0,
    post_type VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'published',
    is_pinned TINYINT(1) DEFAULT 0,
    pinned_until DATETIME,
    is_secret TINYINT(1) DEFAULT 0,
    is_approved TINYINT(1) DEFAULT 1,
    approved_by VARCHAR(50),
    approved_at DATETIME,
    view_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    attachment_count INT DEFAULT 0,
    tags LONGTEXT,
    metadata LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at DATETIME,
    deleted_at DATETIME,
    show_popup TINYINT(1) DEFAULT 0,
    display_start_date DATETIME,
    display_end_date DATETIME,
    question_status VARCHAR(20),
    accepted_answer_id VARCHAR(50),
    resolved_at DATETIME,
    resolved_by VARCHAR(50),
    answer_count INT DEFAULT 0,
    attachment_id VARCHAR(50),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. PROGRAMS
CREATE TABLE programs (
    id VARCHAR(50) NOT NULL,
    code VARCHAR(100) NOT NULL,
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),
    description_en LONGTEXT,
    description_ko LONGTEXT,
    description_zh LONGTEXT,
    description_vi LONGTEXT,
    category VARCHAR(100),
    `type` VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    permissions LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_programs_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30. ROLE_PROGRAM_MAPPINGS
CREATE TABLE role_program_mappings (
    id VARCHAR(50) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    program_id VARCHAR(50) NOT NULL,
    can_create TINYINT(1) DEFAULT 0,
    can_read TINYINT(1) DEFAULT 1,
    can_update TINYINT(1) DEFAULT 0,
    can_delete TINYINT(1) DEFAULT 0,
    can_export TINYINT(1) DEFAULT 0,
    can_import TINYINT(1) DEFAULT 0,
    custom_permissions LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    PRIMARY KEY (id),
    UNIQUE KEY uk_role_program_map (role_id, program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 31. ROLES
CREATE TABLE roles (
    id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200),
    description LONGTEXT,
    role_type VARCHAR(50) DEFAULT 'custom',
    manager VARCHAR(50),
    representative VARCHAR(50),
    is_system TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    PRIMARY KEY (id),
    UNIQUE KEY uk_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 32. TOKEN_BLACKLIST
CREATE TABLE token_blacklist (
    id VARCHAR(50) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    user_id VARCHAR(50),
    token_type VARCHAR(20) DEFAULT 'access',
    expires_at DATETIME NOT NULL,
    blacklisted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(100),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 33. USER_PREFERENCES
CREATE TABLE user_preferences (
    id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    preferences LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_preferences (user_id, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 34. USER_ROLE_MAPPINGS
CREATE TABLE user_role_mappings (
    id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    assigned_by VARCHAR(50),
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    is_active TINYINT(1) DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 35. USERS
CREATE TABLE users (
    id VARCHAR(50) NOT NULL,
    loginid VARCHAR(100) NOT NULL,
    password VARCHAR(255),
    email VARCHAR(200),
    role VARCHAR(50),
    department VARCHAR(50),
    mfa_enabled TINYINT(1) DEFAULT 0,
    sso_enabled TINYINT(1) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    avatar_url LONGTEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    name_ko VARCHAR(200),
    name_en VARCHAR(200),
    employee_number VARCHAR(50),
    system_key VARCHAR(100),
    last_password_changed DATETIME,
    phone_number VARCHAR(50),
    mobile_number VARCHAR(50),
    user_category VARCHAR(50),
    `position` VARCHAR(100),
    avatar_image LONGTEXT,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_loginid (loginid),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_answer_helpful_comment ON answer_helpful(comment_id);
CREATE INDEX idx_answer_helpful_user ON answer_helpful(user_id);
CREATE INDEX idx_attachment_files_attach ON attachment_files(attachment_id);
CREATE INDEX idx_attachment_files_status ON attachment_files(status);
CREATE INDEX idx_attachments_type ON attachments(attachment_type_id);
CREATE INDEX idx_attachments_ref ON attachments(reference_type, reference_id);
CREATE INDEX idx_attachments_status ON attachments(status);
CREATE INDEX idx_board_types_status ON board_types(status);
CREATE INDEX idx_codes_type ON codes(code_type);
CREATE INDEX idx_codes_parent ON codes(parent_code);
CREATE INDEX idx_codes_status ON codes(status);
CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON comment_likes(user_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_category ON conversations(category);
CREATE INDEX idx_conversations_created ON conversations(created_at);
CREATE INDEX idx_conv_changes_conv ON conversation_code_changes(conversation_id);
CREATE INDEX idx_conv_msg_conv ON conversation_messages(conversation_id);
CREATE INDEX idx_conv_msg_role ON conversation_messages(role);
CREATE INDEX idx_conv_tag_map_tag ON conversation_tag_mappings(tag_id);
CREATE INDEX idx_departments_parent ON departments(parent_id);
CREATE INDEX idx_departments_status ON departments(status);
CREATE INDEX idx_help_program ON help(program_id);
CREATE INDEX idx_logs_type ON logs(log_type);
CREATE INDEX idx_logs_user ON logs(user_id);
CREATE INDEX idx_logs_created ON logs(created_at);
CREATE INDEX idx_logs_resource ON logs(resource_type, resource_id);
CREATE INDEX idx_mail_msg_sender ON mail_messages(sender_id);
CREATE INDEX idx_mail_msg_thread ON mail_messages(thread_id);
CREATE INDEX idx_mail_msg_sent ON mail_messages(sent_at);
CREATE INDEX idx_mail_recip_msg ON mail_recipients(message_id);
CREATE INDEX idx_mail_recip_user ON mail_recipients(recipient_id);
CREATE INDEX idx_mail_user_msg_msg ON mail_user_messages(message_id);
CREATE INDEX idx_mail_user_msg_user ON mail_user_messages(user_id);
CREATE INDEX idx_mail_user_msg_folder ON mail_user_messages(folder);
CREATE INDEX idx_menus_parent ON menus(parent_id);
CREATE INDEX idx_menus_program ON menus(program_id);
CREATE INDEX idx_messages_category ON messages(category);
CREATE INDEX idx_mfa_codes_user ON mfa_codes(user_id);
CREATE INDEX idx_mfa_codes_expires ON mfa_codes(expires_at);
CREATE INDEX idx_permissions_mapping ON permissions(role_program_mapping_id);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);
CREATE INDEX idx_post_views_post ON post_views(post_id);
CREATE INDEX idx_post_views_user ON post_views(user_id);
CREATE INDEX idx_posts_board_type ON posts(board_type_id);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created ON posts(created_at);
CREATE INDEX idx_posts_pinned ON posts(is_pinned);
CREATE INDEX idx_role_prog_role ON role_program_mappings(role_id);
CREATE INDEX idx_role_prog_program ON role_program_mappings(program_id);
CREATE INDEX idx_roles_type ON roles(role_type);
CREATE INDEX idx_roles_active ON roles(is_active);
CREATE INDEX idx_token_bl_hash ON token_blacklist(token_hash);
CREATE INDEX idx_token_bl_expires ON token_blacklist(expires_at);
CREATE INDEX idx_user_prefs_user ON user_preferences(user_id);
CREATE INDEX idx_user_role_user ON user_role_mappings(user_id);
CREATE INDEX idx_user_role_role ON user_role_mappings(role_id);
CREATE INDEX idx_user_role_active ON user_role_mappings(is_active);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_dept ON users(department);
CREATE INDEX idx_users_status ON users(status);

-- End of Schema
