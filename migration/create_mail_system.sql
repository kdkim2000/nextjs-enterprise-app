-- =============================================
-- Mail System Database Schema
-- Phase 1: Core tables for internal mail
-- =============================================

-- 1. Mail Folders (메일함)
CREATE TABLE IF NOT EXISTS mail_folders (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_ko VARCHAR(100),
    name_zh VARCHAR(100),
    name_vi VARCHAR(100),
    type VARCHAR(20) NOT NULL DEFAULT 'custom',  -- inbox, sent, draft, trash, spam, starred, custom
    parent_id VARCHAR(36) REFERENCES mail_folders(id) ON DELETE CASCADE,
    icon VARCHAR(50),
    color VARCHAR(20),
    sort_order INT DEFAULT 0,
    is_system BOOLEAN DEFAULT false,
    message_count INT DEFAULT 0,
    unread_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Mail Messages (메일 메시지)
CREATE TABLE IF NOT EXISTS mail_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,

    -- Sender info
    sender_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    sender_email VARCHAR(255),
    sender_name VARCHAR(100),

    -- Content
    subject VARCHAR(500) NOT NULL,
    body TEXT,
    body_html TEXT,
    preview VARCHAR(200),  -- First 200 chars for list view

    -- Type and status
    message_type VARCHAR(20) DEFAULT 'internal',  -- internal, external_in, external_out
    priority VARCHAR(10) DEFAULT 'normal',  -- low, normal, high, urgent

    -- Draft and scheduling
    is_draft BOOLEAN DEFAULT false,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,

    -- External mail integration
    external_message_id VARCHAR(255),
    external_thread_id VARCHAR(255),
    reply_to_id VARCHAR(36) REFERENCES mail_messages(id) ON DELETE SET NULL,
    thread_id VARCHAR(36),  -- Group replies together

    -- Counts (denormalized for performance)
    recipient_count INT DEFAULT 0,
    attachment_count INT DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Mail Recipients (메일 수신자)
CREATE TABLE IF NOT EXISTS mail_recipients (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    message_id VARCHAR(36) NOT NULL REFERENCES mail_messages(id) ON DELETE CASCADE,

    -- Recipient info
    recipient_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255),
    recipient_name VARCHAR(100),
    recipient_type VARCHAR(10) NOT NULL,  -- to, cc, bcc

    -- Per-recipient status
    folder_id VARCHAR(36) REFERENCES mail_folders(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    is_starred BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    permanently_deleted BOOLEAN DEFAULT false,

    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Mail Attachments (메일 첨부 - 기존 attachments 연결)
CREATE TABLE IF NOT EXISTS mail_attachments (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    message_id VARCHAR(36) NOT NULL REFERENCES mail_messages(id) ON DELETE CASCADE,
    attachment_id VARCHAR(36) NOT NULL REFERENCES attachments(id) ON DELETE CASCADE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, attachment_id)
);

-- 5. Mail Labels (메일 라벨)
CREATE TABLE IF NOT EXISTS mail_labels (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    name_ko VARCHAR(50),
    color VARCHAR(20) DEFAULT '#1976d2',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- 6. Mail Message Labels (메시지-라벨 매핑)
CREATE TABLE IF NOT EXISTS mail_message_labels (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    recipient_id VARCHAR(36) NOT NULL REFERENCES mail_recipients(id) ON DELETE CASCADE,
    label_id VARCHAR(36) NOT NULL REFERENCES mail_labels(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(recipient_id, label_id)
);

-- 7. Mail Settings (사용자별 메일 설정)
CREATE TABLE IF NOT EXISTS mail_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Signature
    signature TEXT,
    signature_html TEXT,
    use_signature BOOLEAN DEFAULT true,

    -- Notification
    notify_new_mail BOOLEAN DEFAULT true,
    notify_sound BOOLEAN DEFAULT true,
    desktop_notification BOOLEAN DEFAULT true,

    -- Auto reply
    auto_reply_enabled BOOLEAN DEFAULT false,
    auto_reply_subject VARCHAR(255),
    auto_reply_body TEXT,
    auto_reply_start TIMESTAMPTZ,
    auto_reply_end TIMESTAMPTZ,

    -- Display
    messages_per_page INT DEFAULT 50,
    default_font VARCHAR(50) DEFAULT 'Arial',
    show_preview BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Mail Queue (외부 발송 큐 - Phase 3용이지만 테이블 미리 생성)
CREATE TABLE IF NOT EXISTS mail_queue (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    message_id VARCHAR(36) NOT NULL REFERENCES mail_messages(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,

    status VARCHAR(20) DEFAULT 'pending',  -- pending, processing, sent, failed, cancelled
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,

    error_message TEXT,
    sent_at TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================

-- Folders
CREATE INDEX IF NOT EXISTS idx_mail_folders_user ON mail_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_mail_folders_type ON mail_folders(user_id, type);

-- Messages
CREATE INDEX IF NOT EXISTS idx_mail_messages_sender ON mail_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_mail_messages_sent_at ON mail_messages(sent_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_mail_messages_thread ON mail_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_mail_messages_draft ON mail_messages(sender_id, is_draft) WHERE is_draft = true;

-- Recipients
CREATE INDEX IF NOT EXISTS idx_mail_recipients_message ON mail_recipients(message_id);
CREATE INDEX IF NOT EXISTS idx_mail_recipients_user ON mail_recipients(recipient_id);
CREATE INDEX IF NOT EXISTS idx_mail_recipients_folder ON mail_recipients(recipient_id, folder_id);
CREATE INDEX IF NOT EXISTS idx_mail_recipients_unread ON mail_recipients(recipient_id, is_read) WHERE is_read = false AND is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_mail_recipients_starred ON mail_recipients(recipient_id, is_starred) WHERE is_starred = true;

-- Labels
CREATE INDEX IF NOT EXISTS idx_mail_labels_user ON mail_labels(user_id);
CREATE INDEX IF NOT EXISTS idx_mail_message_labels_recipient ON mail_message_labels(recipient_id);

-- Queue
CREATE INDEX IF NOT EXISTS idx_mail_queue_status ON mail_queue(status, next_retry_at) WHERE status IN ('pending', 'failed');

-- =============================================
-- Functions and Triggers
-- =============================================

-- Function to create default folders for new users
CREATE OR REPLACE FUNCTION create_default_mail_folders()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO mail_folders (user_id, name, name_ko, name_zh, name_vi, type, icon, is_system, sort_order)
    VALUES
        (NEW.id, 'Inbox', '받은편지함', '收件箱', 'Hộp thư đến', 'inbox', 'Inbox', true, 1),
        (NEW.id, 'Sent', '보낸편지함', '已发送', 'Đã gửi', 'sent', 'Send', true, 2),
        (NEW.id, 'Drafts', '임시보관함', '草稿箱', 'Bản nháp', 'draft', 'Drafts', true, 3),
        (NEW.id, 'Starred', '중요편지함', '已加星标', 'Đã gắn sao', 'starred', 'Star', true, 4),
        (NEW.id, 'Trash', '휴지통', '废纸篓', 'Thùng rác', 'trash', 'Delete', true, 5);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_create_mail_folders ON users;

-- Create trigger for new users
CREATE TRIGGER trigger_create_mail_folders
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_default_mail_folders();

-- Function to update message preview
CREATE OR REPLACE FUNCTION update_mail_message_preview()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.body IS NOT NULL AND (OLD.body IS DISTINCT FROM NEW.body OR TG_OP = 'INSERT') THEN
        NEW.preview := LEFT(REGEXP_REPLACE(NEW.body, E'<[^>]+>', '', 'g'), 200);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mail_message_preview ON mail_messages;
CREATE TRIGGER trigger_mail_message_preview
BEFORE INSERT OR UPDATE ON mail_messages
FOR EACH ROW EXECUTE FUNCTION update_mail_message_preview();

-- Function to update folder counts
CREATE OR REPLACE FUNCTION update_mail_folder_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update old folder counts
    IF TG_OP = 'UPDATE' AND OLD.folder_id IS NOT NULL THEN
        UPDATE mail_folders SET
            message_count = (SELECT COUNT(*) FROM mail_recipients WHERE folder_id = OLD.folder_id AND is_deleted = false),
            unread_count = (SELECT COUNT(*) FROM mail_recipients WHERE folder_id = OLD.folder_id AND is_read = false AND is_deleted = false)
        WHERE id = OLD.folder_id;
    END IF;

    -- Update new folder counts
    IF NEW.folder_id IS NOT NULL THEN
        UPDATE mail_folders SET
            message_count = (SELECT COUNT(*) FROM mail_recipients WHERE folder_id = NEW.folder_id AND is_deleted = false),
            unread_count = (SELECT COUNT(*) FROM mail_recipients WHERE folder_id = NEW.folder_id AND is_read = false AND is_deleted = false)
        WHERE id = NEW.folder_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mail_folder_counts ON mail_recipients;
CREATE TRIGGER trigger_mail_folder_counts
AFTER INSERT OR UPDATE OF folder_id, is_read, is_deleted ON mail_recipients
FOR EACH ROW EXECUTE FUNCTION update_mail_folder_counts();

-- =============================================
-- Create default folders for existing users
-- =============================================
INSERT INTO mail_folders (user_id, name, name_ko, name_zh, name_vi, type, icon, is_system, sort_order)
SELECT
    u.id,
    f.name,
    f.name_ko,
    f.name_zh,
    f.name_vi,
    f.type,
    f.icon,
    true,
    f.sort_order
FROM users u
CROSS JOIN (
    VALUES
        ('Inbox', '받은편지함', '收件箱', 'Hộp thư đến', 'inbox', 'Inbox', 1),
        ('Sent', '보낸편지함', '已发送', 'Đã gửi', 'sent', 'Send', 2),
        ('Drafts', '임시보관함', '草稿箱', 'Bản nháp', 'draft', 'Drafts', 3),
        ('Starred', '중요편지함', '已加星标', 'Đã gắn sao', 'starred', 'Star', 4),
        ('Trash', '휴지통', '废纸篓', 'Thùng rác', 'trash', 'Delete', 5)
) AS f(name, name_ko, name_zh, name_vi, type, icon, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM mail_folders mf
    WHERE mf.user_id = u.id AND mf.type = f.type
);

-- =============================================
-- Verification
-- =============================================
SELECT 'mail_folders' as table_name, COUNT(*) as count FROM mail_folders
UNION ALL
SELECT 'mail_messages', COUNT(*) FROM mail_messages
UNION ALL
SELECT 'mail_recipients', COUNT(*) FROM mail_recipients
UNION ALL
SELECT 'mail_attachments', COUNT(*) FROM mail_attachments
UNION ALL
SELECT 'mail_labels', COUNT(*) FROM mail_labels
UNION ALL
SELECT 'mail_settings', COUNT(*) FROM mail_settings;
