-- =========================================
-- Simplified Mail System
-- 단순 사내 메일 시스템 (발신/수신/임시저장/휴지통)
-- =========================================

-- Drop old complex tables if exist
DROP TABLE IF EXISTS mail_message_labels CASCADE;
DROP TABLE IF EXISTS mail_labels CASCADE;
DROP TABLE IF EXISTS mail_attachments CASCADE;
DROP TABLE IF EXISTS mail_recipients CASCADE;
DROP TABLE IF EXISTS mail_folders CASCADE;
DROP TABLE IF EXISTS mail_messages CASCADE;
DROP TABLE IF EXISTS mail_settings CASCADE;

-- Simple mail messages table
CREATE TABLE mail_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,

    -- Owner (who sees this record in their mailbox)
    owner_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Sender info
    sender_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(100),
    sender_email VARCHAR(255),

    -- Recipient info (1:1 simple mail)
    recipient_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    recipient_name VARCHAR(100),
    recipient_email VARCHAR(255),

    -- Message content
    subject VARCHAR(500),
    body TEXT,
    body_html TEXT,

    -- Folder: inbox, sent, draft, trash
    folder VARCHAR(20) NOT NULL DEFAULT 'draft',

    -- Status
    is_read BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,

    -- Timestamps
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_folder CHECK (folder IN ('inbox', 'sent', 'draft', 'trash'))
);

-- Indexes
CREATE INDEX idx_mail_messages_owner ON mail_messages(owner_id);
CREATE INDEX idx_mail_messages_folder ON mail_messages(owner_id, folder);
CREATE INDEX idx_mail_messages_sender ON mail_messages(sender_id);
CREATE INDEX idx_mail_messages_recipient ON mail_messages(recipient_id);
CREATE INDEX idx_mail_messages_created ON mail_messages(created_at DESC);

-- Comments
COMMENT ON TABLE mail_messages IS '단순 사내 메일 메시지';
COMMENT ON COLUMN mail_messages.owner_id IS '이 레코드의 소유자 (메일함 주인)';
COMMENT ON COLUMN mail_messages.folder IS '폴더: inbox(받은편지함), sent(보낸편지함), draft(임시보관함), trash(휴지통)';

-- =========================================
-- 설명:
-- 메일 발송 시:
--   1. sender용 레코드: owner_id=sender, folder='sent'
--   2. recipient용 레코드: owner_id=recipient, folder='inbox'
--
-- 삭제 시: folder='trash'로 변경
-- 영구 삭제: 레코드 삭제 또는 is_deleted=true
-- =========================================
