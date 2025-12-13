-- Enterprise Application Database Indexes for PostgreSQL
-- Converted from Liquibase changelog
-- Version: 1.0.0

-- ==========================================
-- Code Tables Indexes
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_codes_code_type ON codes(code_type);
CREATE INDEX IF NOT EXISTS idx_codes_code_type_id ON codes(code_type_id);
CREATE INDEX IF NOT EXISTS idx_codes_parent_code ON codes(parent_code);
CREATE INDEX IF NOT EXISTS idx_codes_status ON codes(status);

-- ==========================================
-- User Tables Indexes
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON departments(parent_id);
CREATE INDEX IF NOT EXISTS idx_departments_status ON departments(status);
CREATE INDEX IF NOT EXISTS idx_departments_manager_id ON departments(manager_id);

CREATE INDEX IF NOT EXISTS idx_roles_role_type ON roles(role_type);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON roles(is_active);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_user_role_mappings_user_id ON user_role_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_mappings_role_id ON user_role_mappings(role_id);
CREATE INDEX IF NOT EXISTS idx_user_role_mappings_is_active ON user_role_mappings(is_active);

-- ==========================================
-- Menu Tables Indexes
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_menus_parent_id ON menus(parent_id);
CREATE INDEX IF NOT EXISTS idx_menus_program_id ON menus(program_id);

CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);

CREATE INDEX IF NOT EXISTS idx_help_program_id ON help(program_id);

CREATE INDEX IF NOT EXISTS idx_role_menu_mappings_role_id ON role_menu_mappings(role_id);
CREATE INDEX IF NOT EXISTS idx_role_menu_mappings_menu_id ON role_menu_mappings(menu_id);

CREATE INDEX IF NOT EXISTS idx_role_program_mappings_role_id ON role_program_mappings(role_id);
CREATE INDEX IF NOT EXISTS idx_role_program_mappings_program_id ON role_program_mappings(program_id);

-- ==========================================
-- Content Tables Indexes
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_attachments_attachment_type_id ON attachments(attachment_type_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_board_types_category ON board_types(category);
CREATE INDEX IF NOT EXISTS idx_board_types_status ON board_types(status);

CREATE INDEX IF NOT EXISTS idx_posts_board_type_id ON posts(board_type_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON posts(is_pinned);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);

-- ==========================================
-- Communication Tables Indexes
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_mail_messages_sender_id ON mail_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_mail_messages_is_draft ON mail_messages(is_draft);
CREATE INDEX IF NOT EXISTS idx_mail_messages_sent_at ON mail_messages(sent_at);

CREATE INDEX IF NOT EXISTS idx_mail_recipients_message_id ON mail_recipients(message_id);
CREATE INDEX IF NOT EXISTS idx_mail_recipients_recipient_id ON mail_recipients(recipient_id);

CREATE INDEX IF NOT EXISTS idx_mail_user_messages_message_id ON mail_user_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_mail_user_messages_user_id ON mail_user_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_mail_user_messages_folder ON mail_user_messages(folder);
CREATE INDEX IF NOT EXISTS idx_mail_user_messages_is_read ON mail_user_messages(is_read);

CREATE INDEX IF NOT EXISTS idx_messages_category ON messages(category);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- ==========================================
-- System Tables Indexes
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);
CREATE INDEX IF NOT EXISTS idx_app_settings_is_ready ON app_settings(is_ready);

CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_program_id ON logs(program_id);
CREATE INDEX IF NOT EXISTS idx_logs_status_code ON logs(status_code);

CREATE INDEX IF NOT EXISTS idx_token_blacklist_user_id ON token_blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON token_blacklist(expires_at);

CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_category ON conversations(category);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_source ON conversations(source);

CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_role ON conversation_messages(role);

CREATE INDEX IF NOT EXISTS idx_conversation_code_changes_conversation_id ON conversation_code_changes(conversation_id);
