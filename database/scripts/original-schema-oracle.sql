-- ============================================
-- CoreNext Enterprise Application
-- Oracle Database Schema
-- ============================================

-- Drop existing tables
BEGIN
  FOR t IN (SELECT table_name FROM user_tables) LOOP
    EXECUTE IMMEDIATE 'DROP TABLE "' || t.table_name || '" CASCADE CONSTRAINTS';
  END LOOP;
END;
/

-- 1. ANSWER_HELPFUL
CREATE TABLE answer_helpful (
    id VARCHAR2(50) NOT NULL,
    comment_id VARCHAR2(50) NOT NULL,
    user_id VARCHAR2(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_answer_helpful PRIMARY KEY (id),
    CONSTRAINT uk_answer_helpful UNIQUE (comment_id, user_id)
);

-- 2. APP_SETTINGS
CREATE TABLE app_settings (
    key VARCHAR2(100) NOT NULL,
    value CLOB,
    value_type VARCHAR2(50) DEFAULT 'string',
    category VARCHAR2(100),
    is_ready NUMBER(1) DEFAULT 1,
    description_en CLOB,
    description_ko CLOB,
    description_zh CLOB,
    description_vi CLOB,
    display_order NUMBER(10) DEFAULT 0,
    is_sensitive NUMBER(1) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_by VARCHAR2(50),
    is_applied NUMBER(1) DEFAULT 0,
    CONSTRAINT pk_app_settings PRIMARY KEY (key)
);

-- 3. ATTACHMENT_FILES
CREATE TABLE attachment_files (
    id VARCHAR2(50) NOT NULL,
    attachment_id VARCHAR2(50) NOT NULL,
    original_filename VARCHAR2(500) NOT NULL,
    stored_filename VARCHAR2(500) NOT NULL,
    file_extension VARCHAR2(20),
    mime_type VARCHAR2(100),
    file_size NUMBER(19) NOT NULL,
    storage_path VARCHAR2(1000) NOT NULL,
    full_path VARCHAR2(1500),
    checksum VARCHAR2(100),
    is_image NUMBER(1) DEFAULT 0,
    image_width NUMBER(10),
    image_height NUMBER(10),
    thumbnail_path VARCHAR2(1000),
    download_count NUMBER(10) DEFAULT 0,
    "order" NUMBER(10) DEFAULT 0,
    status VARCHAR2(20) DEFAULT 'active',
    created_by VARCHAR2(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT pk_attachment_files PRIMARY KEY (id)
);

-- 4. ATTACHMENT_TYPES
CREATE TABLE attachment_types (
    id VARCHAR2(50) NOT NULL,
    code VARCHAR2(50) NOT NULL,
    name_en VARCHAR2(200),
    name_ko VARCHAR2(200),
    name_zh VARCHAR2(200),
    name_vi VARCHAR2(200),
    description_en CLOB,
    description_ko CLOB,
    description_zh CLOB,
    description_vi CLOB,
    storage_path VARCHAR2(500),
    max_file_count NUMBER(10) DEFAULT 10,
    max_file_size NUMBER(19) DEFAULT 10485760,
    max_total_size NUMBER(19) DEFAULT 104857600,
    allowed_extensions CLOB,
    allowed_mime_types CLOB,
    status VARCHAR2(20) DEFAULT 'active',
    "order" NUMBER(10) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_attachment_types PRIMARY KEY (id),
    CONSTRAINT uk_attachment_types_code UNIQUE (code)
);

-- 5. ATTACHMENTS
CREATE TABLE attachments (
    id VARCHAR2(50) NOT NULL,
    attachment_type_id VARCHAR2(50) NOT NULL,
    reference_type VARCHAR2(50),
    reference_id VARCHAR2(50),
    title VARCHAR2(500),
    description CLOB,
    file_count NUMBER(10) DEFAULT 0,
    total_size NUMBER(19) DEFAULT 0,
    status VARCHAR2(20) DEFAULT 'active',
    created_by VARCHAR2(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT pk_attachments PRIMARY KEY (id)
);

-- 6. BOARD_TYPES
CREATE TABLE board_types (
    id VARCHAR2(50) NOT NULL,
    code VARCHAR2(50) NOT NULL,
    name_en VARCHAR2(200),
    name_ko VARCHAR2(200),
    name_zh VARCHAR2(200),
    name_vi VARCHAR2(200),
    description_en CLOB,
    description_ko CLOB,
    description_zh CLOB,
    description_vi CLOB,
    "type" VARCHAR2(50) DEFAULT 'general',
    settings CLOB,
    write_roles CLOB,
    read_roles CLOB,
    category VARCHAR2(100),
    "order" NUMBER(10) DEFAULT 0,
    status VARCHAR2(20) DEFAULT 'active',
    total_posts NUMBER(10) DEFAULT 0,
    total_views NUMBER(10) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    created_by VARCHAR2(50),
    updated_by VARCHAR2(50),
    CONSTRAINT pk_board_types PRIMARY KEY (id),
    CONSTRAINT uk_board_types_code UNIQUE (code)
);

-- 7. CODE_TYPES
CREATE TABLE code_types (
    id VARCHAR2(50) NOT NULL,
    code VARCHAR2(100) NOT NULL,
    name_en VARCHAR2(200),
    name_ko VARCHAR2(200),
    name_zh VARCHAR2(200),
    name_vi VARCHAR2(200),
    description_en CLOB,
    description_ko CLOB,
    description_zh CLOB,
    description_vi CLOB,
    "order" NUMBER(10) DEFAULT 0,
    status VARCHAR2(20) DEFAULT 'active',
    category VARCHAR2(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_code_types PRIMARY KEY (id),
    CONSTRAINT uk_code_types_code UNIQUE (code)
);

-- 8. CODES
CREATE TABLE codes (
    id VARCHAR2(50) NOT NULL,
    code_type VARCHAR2(100),
    code VARCHAR2(100) NOT NULL,
    name_en VARCHAR2(200),
    name_ko VARCHAR2(200),
    name_zh VARCHAR2(200),
    name_vi VARCHAR2(200),
    description_en CLOB,
    description_ko CLOB,
    description_zh CLOB,
    description_vi CLOB,
    "order" NUMBER(10) DEFAULT 0,
    status VARCHAR2(20) DEFAULT 'active',
    parent_code VARCHAR2(100),
    attributes CLOB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_codes PRIMARY KEY (id)
);

-- 9. COMMENT_LIKES
CREATE TABLE comment_likes (
    id VARCHAR2(50) NOT NULL,
    comment_id VARCHAR2(50) NOT NULL,
    user_id VARCHAR2(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_comment_likes PRIMARY KEY (id),
    CONSTRAINT uk_comment_likes UNIQUE (comment_id, user_id)
);

-- 10. COMMENTS
CREATE TABLE comments (
    id VARCHAR2(50) NOT NULL,
    post_id VARCHAR2(50) NOT NULL,
    parent_id VARCHAR2(50),
    author_id VARCHAR2(50) NOT NULL,
    author_name VARCHAR2(200),
    is_anonymous NUMBER(1) DEFAULT 0,
    content CLOB NOT NULL,
    status VARCHAR2(20) DEFAULT 'published',
    like_count NUMBER(10) DEFAULT 0,
    depth NUMBER(10) DEFAULT 0,
    metadata CLOB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_accepted NUMBER(1) DEFAULT 0,
    accepted_at TIMESTAMP WITH TIME ZONE,
    helpful_count NUMBER(10) DEFAULT 0,
    quality_score NUMBER(10) DEFAULT 0,
    CONSTRAINT pk_comments PRIMARY KEY (id)
);

-- 11. CONVERSATIONS
CREATE TABLE conversations (
    id VARCHAR2(50) NOT NULL,
    title VARCHAR2(500),
    project_path VARCHAR2(1000),
    project_name VARCHAR2(200),
    branch_name VARCHAR2(200),
    summary CLOB,
    learning_points CLOB,
    difficulty_level VARCHAR2(20),
    category VARCHAR2(100),
    total_messages NUMBER(10) DEFAULT 0,
    total_tokens NUMBER(10) DEFAULT 0,
    duration_minutes NUMBER(10),
    status VARCHAR2(20) DEFAULT 'active',
    source VARCHAR2(50) DEFAULT 'claude-code',
    original_session_id VARCHAR2(100),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_conversations PRIMARY KEY (id)
);

-- 12. CONVERSATION_CODE_CHANGES
CREATE TABLE conversation_code_changes (
    id VARCHAR2(50) NOT NULL,
    conversation_id VARCHAR2(50) NOT NULL,
    message_id VARCHAR2(50),
    file_path VARCHAR2(1000) NOT NULL,
    file_name VARCHAR2(255),
    change_type VARCHAR2(20) NOT NULL,
    language VARCHAR2(50),
    code_before CLOB,
    code_after CLOB,
    diff_content CLOB,
    lines_added NUMBER(10) DEFAULT 0,
    lines_removed NUMBER(10) DEFAULT 0,
    explanation CLOB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_conv_code_changes PRIMARY KEY (id)
);

-- 13. CONVERSATION_MESSAGES
CREATE TABLE conversation_messages (
    id VARCHAR2(50) NOT NULL,
    conversation_id VARCHAR2(50) NOT NULL,
    role VARCHAR2(20) NOT NULL,
    content CLOB NOT NULL,
    content_type VARCHAR2(50) DEFAULT 'text',
    token_count NUMBER(10),
    "order" NUMBER(10) NOT NULL,
    has_code NUMBER(1) DEFAULT 0,
    has_error NUMBER(1) DEFAULT 0,
    tool_calls CLOB,
    metadata CLOB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_conv_messages PRIMARY KEY (id)
);

-- 14. CONVERSATION_TAG_MAPPINGS
CREATE TABLE conversation_tag_mappings (
    conversation_id VARCHAR2(50) NOT NULL,
    tag_id VARCHAR2(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_conv_tag_mappings PRIMARY KEY (conversation_id, tag_id)
);

-- 15. CONVERSATION_TAGS
CREATE TABLE conversation_tags (
    id VARCHAR2(50) NOT NULL,
    name VARCHAR2(100) NOT NULL,
    name_ko VARCHAR2(100),
    description CLOB,
    color VARCHAR2(20) DEFAULT '#6B7280',
    category VARCHAR2(50),
    usage_count NUMBER(10) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_conv_tags PRIMARY KEY (id)
);

-- 16. DEPARTMENTS
CREATE TABLE departments (
    id VARCHAR2(50) NOT NULL,
    code VARCHAR2(50) NOT NULL,
    name_en VARCHAR2(200),
    name_ko VARCHAR2(200),
    name_zh VARCHAR2(200),
    name_vi VARCHAR2(200),
    description_en CLOB,
    description_ko CLOB,
    description_zh CLOB,
    description_vi CLOB,
    parent_id VARCHAR2(50),
    manager_id VARCHAR2(50),
    "level" NUMBER(10) DEFAULT 0,
    "order" NUMBER(10) DEFAULT 0,
    status VARCHAR2(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_departments PRIMARY KEY (id),
    CONSTRAINT uk_departments_code UNIQUE (code)
);

-- 17. HELP
CREATE TABLE help (
    id VARCHAR2(50) NOT NULL,
    program_id VARCHAR2(50),
    title VARCHAR2(500),
    content CLOB,
    sections CLOB,
    faq CLOB,
    tips CLOB,
    troubleshooting CLOB,
    video_url VARCHAR2(1000),
    related_topics CLOB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    created_by VARCHAR2(50),
    updated_by VARCHAR2(50),
    language VARCHAR2(10),
    status VARCHAR2(20) DEFAULT 'active',
    CONSTRAINT pk_help PRIMARY KEY (id)
);

-- 18. LOGS
CREATE TABLE logs (
    id VARCHAR2(50) NOT NULL,
    log_type VARCHAR2(50) NOT NULL,
    log_level VARCHAR2(20) DEFAULT 'info',
    user_id VARCHAR2(50),
    user_ip VARCHAR2(50),
    user_agent CLOB,
    action VARCHAR2(100),
    resource_type VARCHAR2(50),
    resource_id VARCHAR2(50),
    details CLOB,
    error_message CLOB,
    error_stack CLOB,
    request_path VARCHAR2(500),
    request_method VARCHAR2(10),
    response_status NUMBER(10),
    duration_ms NUMBER(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_logs PRIMARY KEY (id)
);

-- 19. MAIL_MESSAGES
CREATE TABLE mail_messages (
    id VARCHAR2(50) NOT NULL,
    sender_id VARCHAR2(50) NOT NULL,
    subject VARCHAR2(500),
    body CLOB,
    body_type VARCHAR2(20) DEFAULT 'html',
    priority VARCHAR2(20) DEFAULT 'normal',
    has_attachments NUMBER(1) DEFAULT 0,
    attachment_count NUMBER(10) DEFAULT 0,
    attachment_id VARCHAR2(50),
    read_receipt NUMBER(1) DEFAULT 0,
    importance VARCHAR2(20) DEFAULT 'normal',
    metadata CLOB,
    thread_id VARCHAR2(50),
    in_reply_to VARCHAR2(50),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_mail_messages PRIMARY KEY (id)
);

-- 20. MAIL_RECIPIENTS
CREATE TABLE mail_recipients (
    id VARCHAR2(50) NOT NULL,
    message_id VARCHAR2(50) NOT NULL,
    recipient_id VARCHAR2(50) NOT NULL,
    recipient_type VARCHAR2(10) DEFAULT 'to',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_mail_recipients PRIMARY KEY (id)
);

-- 21. MAIL_USER_MESSAGES
CREATE TABLE mail_user_messages (
    id VARCHAR2(50) NOT NULL,
    message_id VARCHAR2(50) NOT NULL,
    user_id VARCHAR2(50) NOT NULL,
    folder VARCHAR2(50) DEFAULT 'inbox',
    is_read NUMBER(1) DEFAULT 0,
    is_starred NUMBER(1) DEFAULT 0,
    is_important NUMBER(1) DEFAULT 0,
    labels CLOB,
    read_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_mail_user_messages PRIMARY KEY (id)
);

-- 22. MENUS
CREATE TABLE menus (
    id VARCHAR2(50) NOT NULL,
    code VARCHAR2(100) NOT NULL,
    name_en VARCHAR2(200),
    name_ko VARCHAR2(200),
    name_zh VARCHAR2(200),
    name_vi VARCHAR2(200),
    description_en CLOB,
    description_ko CLOB,
    description_zh CLOB,
    description_vi CLOB,
    path VARCHAR2(500),
    icon VARCHAR2(100),
    "order" NUMBER(10) DEFAULT 0,
    parent_id VARCHAR2(50),
    "level" NUMBER(10) DEFAULT 0,
    program_id VARCHAR2(50),
    board_type_id VARCHAR2(50),
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_menus PRIMARY KEY (id),
    CONSTRAINT uk_menus_code UNIQUE (code)
);

-- 23. MESSAGES
CREATE TABLE messages (
    id VARCHAR2(50) NOT NULL,
    code VARCHAR2(100) NOT NULL,
    category VARCHAR2(50),
    "type" VARCHAR2(50),
    message_en CLOB,
    message_ko CLOB,
    message_zh CLOB,
    message_vi CLOB,
    description_en CLOB,
    description_ko CLOB,
    description_zh CLOB,
    description_vi CLOB,
    status VARCHAR2(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_messages PRIMARY KEY (id),
    CONSTRAINT uk_messages_code UNIQUE (code)
);

-- 24. MFA_CODES
CREATE TABLE mfa_codes (
    id VARCHAR2(50) NOT NULL,
    user_id VARCHAR2(50) NOT NULL,
    code VARCHAR2(10) NOT NULL,
    mfa_type VARCHAR2(20) DEFAULT 'email',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_mfa_codes PRIMARY KEY (id)
);

-- 25. PERMISSIONS
CREATE TABLE permissions (
    id VARCHAR2(50) NOT NULL,
    role_program_mapping_id VARCHAR2(50) NOT NULL,
    permission_type VARCHAR2(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    created_by VARCHAR2(50),
    CONSTRAINT pk_permissions PRIMARY KEY (id)
);

-- 26. POST_LIKES
CREATE TABLE post_likes (
    id VARCHAR2(50) NOT NULL,
    post_id VARCHAR2(50) NOT NULL,
    user_id VARCHAR2(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_post_likes PRIMARY KEY (id),
    CONSTRAINT uk_post_likes UNIQUE (post_id, user_id)
);

-- 27. POST_VIEWS
CREATE TABLE post_views (
    id VARCHAR2(50) NOT NULL,
    post_id VARCHAR2(50) NOT NULL,
    user_id VARCHAR2(50),
    ip_address VARCHAR2(50),
    user_agent CLOB,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_post_views PRIMARY KEY (id)
);

-- 28. POSTS
CREATE TABLE posts (
    id VARCHAR2(50) NOT NULL,
    board_type_id VARCHAR2(50) NOT NULL,
    title VARCHAR2(500) NOT NULL,
    content CLOB NOT NULL,
    author_id VARCHAR2(50) NOT NULL,
    author_name VARCHAR2(200),
    author_department VARCHAR2(50),
    is_anonymous NUMBER(1) DEFAULT 0,
    post_type VARCHAR2(20) DEFAULT 'normal',
    status VARCHAR2(20) DEFAULT 'published',
    is_pinned NUMBER(1) DEFAULT 0,
    pinned_until TIMESTAMP WITH TIME ZONE,
    is_secret NUMBER(1) DEFAULT 0,
    is_approved NUMBER(1) DEFAULT 1,
    approved_by VARCHAR2(50),
    approved_at TIMESTAMP WITH TIME ZONE,
    view_count NUMBER(10) DEFAULT 0,
    comment_count NUMBER(10) DEFAULT 0,
    like_count NUMBER(10) DEFAULT 0,
    attachment_count NUMBER(10) DEFAULT 0,
    tags CLOB,
    metadata CLOB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    show_popup NUMBER(1) DEFAULT 0,
    display_start_date TIMESTAMP WITH TIME ZONE,
    display_end_date TIMESTAMP WITH TIME ZONE,
    question_status VARCHAR2(20),
    accepted_answer_id VARCHAR2(50),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR2(50),
    answer_count NUMBER(10) DEFAULT 0,
    attachment_id VARCHAR2(50),
    CONSTRAINT pk_posts PRIMARY KEY (id)
);

-- 29. PROGRAMS
CREATE TABLE programs (
    id VARCHAR2(50) NOT NULL,
    code VARCHAR2(100) NOT NULL,
    name_en VARCHAR2(200),
    name_ko VARCHAR2(200),
    name_zh VARCHAR2(200),
    name_vi VARCHAR2(200),
    description_en CLOB,
    description_ko CLOB,
    description_zh CLOB,
    description_vi CLOB,
    category VARCHAR2(100),
    "type" VARCHAR2(50),
    status VARCHAR2(20) DEFAULT 'active',
    permissions CLOB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_programs PRIMARY KEY (id),
    CONSTRAINT uk_programs_code UNIQUE (code)
);

-- 30. ROLE_PROGRAM_MAPPINGS
CREATE TABLE role_program_mappings (
    id VARCHAR2(50) NOT NULL,
    role_id VARCHAR2(50) NOT NULL,
    program_id VARCHAR2(50) NOT NULL,
    can_create NUMBER(1) DEFAULT 0,
    can_read NUMBER(1) DEFAULT 1,
    can_update NUMBER(1) DEFAULT 0,
    can_delete NUMBER(1) DEFAULT 0,
    can_export NUMBER(1) DEFAULT 0,
    can_import NUMBER(1) DEFAULT 0,
    custom_permissions CLOB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    created_by VARCHAR2(50),
    updated_by VARCHAR2(50),
    CONSTRAINT pk_role_program_mappings PRIMARY KEY (id),
    CONSTRAINT uk_role_program_map UNIQUE (role_id, program_id)
);

-- 31. ROLES
CREATE TABLE roles (
    id VARCHAR2(50) NOT NULL,
    name VARCHAR2(100) NOT NULL,
    display_name VARCHAR2(200),
    description CLOB,
    role_type VARCHAR2(50) DEFAULT 'custom',
    manager VARCHAR2(50),
    representative VARCHAR2(50),
    is_system NUMBER(1) DEFAULT 0,
    is_active NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    created_by VARCHAR2(50),
    updated_by VARCHAR2(50),
    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT uk_roles_name UNIQUE (name)
);

-- 32. TOKEN_BLACKLIST
CREATE TABLE token_blacklist (
    id VARCHAR2(50) NOT NULL,
    token_hash VARCHAR2(255) NOT NULL,
    user_id VARCHAR2(50),
    token_type VARCHAR2(20) DEFAULT 'access',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    blacklisted_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    reason VARCHAR2(100),
    CONSTRAINT pk_token_blacklist PRIMARY KEY (id)
);

-- 33. USER_PREFERENCES
CREATE TABLE user_preferences (
    id VARCHAR2(50) NOT NULL,
    user_id VARCHAR2(50) NOT NULL,
    category VARCHAR2(50) NOT NULL,
    preferences CLOB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_user_preferences PRIMARY KEY (id),
    CONSTRAINT uk_user_preferences UNIQUE (user_id, category)
);

-- 34. USER_ROLE_MAPPINGS
CREATE TABLE user_role_mappings (
    id VARCHAR2(50) NOT NULL,
    user_id VARCHAR2(50) NOT NULL,
    role_id VARCHAR2(50) NOT NULL,
    assigned_by VARCHAR2(50),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active NUMBER(1) DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_by VARCHAR2(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_user_role_mappings PRIMARY KEY (id)
);

-- 35. USERS
CREATE TABLE users (
    id VARCHAR2(50) NOT NULL,
    loginid VARCHAR2(100) NOT NULL,
    password VARCHAR2(255),
    email VARCHAR2(200),
    role VARCHAR2(50),
    department VARCHAR2(50),
    mfa_enabled NUMBER(1) DEFAULT 0,
    sso_enabled NUMBER(1) DEFAULT 0,
    status VARCHAR2(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    avatar_url CLOB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    name_ko VARCHAR2(200),
    name_en VARCHAR2(200),
    employee_number VARCHAR2(50),
    system_key VARCHAR2(100),
    last_password_changed TIMESTAMP WITH TIME ZONE,
    phone_number VARCHAR2(50),
    mobile_number VARCHAR2(50),
    user_category VARCHAR2(50),
    "position" VARCHAR2(100),
    avatar_image CLOB,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_loginid UNIQUE (loginid),
    CONSTRAINT uk_users_email UNIQUE (email)
);

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
