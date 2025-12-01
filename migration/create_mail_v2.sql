-- =============================================
-- Mail System v2 - Multi-recipient Support
-- =============================================
-- Features:
--   1. Multiple recipients (To, CC, BCC)
--   2. External mail integration option
--   3. Attachment support (using common attachment system)
-- =============================================

BEGIN;

-- Drop existing simple mail tables
DROP TABLE IF EXISTS mail_user_messages CASCADE;
DROP TABLE IF EXISTS mail_recipients CASCADE;
DROP TABLE IF EXISTS mail_messages CASCADE;

-- =============================================
-- 1. mail_messages: Mail original (1 record per mail)
-- =============================================
CREATE TABLE mail_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,

    -- Sender
    sender_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Content
    subject VARCHAR(500),
    body TEXT,
    body_html TEXT,

    -- Attachment (common attachment system, type=MAIL)
    attachment_id VARCHAR(50) REFERENCES attachments(id) ON DELETE SET NULL,

    -- External mail option
    send_external BOOLEAN DEFAULT false,
    external_status VARCHAR(20) DEFAULT NULL,
    external_sent_at TIMESTAMPTZ,
    external_error TEXT,

    -- Status
    is_draft BOOLEAN DEFAULT true,
    sent_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_external_status CHECK (
        external_status IS NULL OR
        external_status IN ('pending', 'sent', 'failed')
    )
);

COMMENT ON TABLE mail_messages IS 'Mail original - 1 record per sent mail';
COMMENT ON COLUMN mail_messages.attachment_id IS 'Attachment ID (references attachments table, type=MAIL)';
COMMENT ON COLUMN mail_messages.send_external IS 'Whether to send to external email';
COMMENT ON COLUMN mail_messages.external_status IS 'External mail status: pending, sent, failed';

-- =============================================
-- 2. mail_recipients: Recipients list (N records per mail)
-- =============================================
CREATE TABLE mail_recipients (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    message_id VARCHAR(36) NOT NULL REFERENCES mail_messages(id) ON DELETE CASCADE,
    recipient_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_type VARCHAR(10) NOT NULL DEFAULT 'to',
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_recipient_type CHECK (recipient_type IN ('to', 'cc', 'bcc')),
    UNIQUE(message_id, recipient_id)
);

COMMENT ON TABLE mail_recipients IS 'Mail recipients list';
COMMENT ON COLUMN mail_recipients.recipient_type IS 'Recipient type: to, cc, bcc';

-- =============================================
-- 3. mail_user_messages: User mailbox view (sender + each recipient)
-- =============================================
CREATE TABLE mail_user_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    message_id VARCHAR(36) NOT NULL REFERENCES mail_messages(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Role: user's role in this mail
    role VARCHAR(10) NOT NULL,

    -- Folder
    folder VARCHAR(20) NOT NULL DEFAULT 'inbox',

    -- Read status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,

    -- Delete status
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_folder CHECK (folder IN ('inbox', 'sent', 'draft', 'trash')),
    CONSTRAINT valid_role CHECK (role IN ('sender', 'to', 'cc', 'bcc')),
    UNIQUE(message_id, user_id)
);

COMMENT ON TABLE mail_user_messages IS 'User mailbox view - each user''s mail view';
COMMENT ON COLUMN mail_user_messages.role IS 'Role in mail: sender, to, cc, bcc';
COMMENT ON COLUMN mail_user_messages.folder IS 'Folder: inbox, sent, draft, trash';

-- =============================================
-- Indexes
-- =============================================

-- mail_messages indexes
CREATE INDEX idx_mail_messages_sender ON mail_messages(sender_id);
CREATE INDEX idx_mail_messages_draft ON mail_messages(is_draft) WHERE is_draft = true;
CREATE INDEX idx_mail_messages_external ON mail_messages(send_external, external_status)
    WHERE send_external = true;
CREATE INDEX idx_mail_messages_attachment ON mail_messages(attachment_id)
    WHERE attachment_id IS NOT NULL;
CREATE INDEX idx_mail_messages_sent_at ON mail_messages(sent_at DESC)
    WHERE sent_at IS NOT NULL;

-- mail_recipients indexes
CREATE INDEX idx_mail_recipients_message ON mail_recipients(message_id);
CREATE INDEX idx_mail_recipients_user ON mail_recipients(recipient_id);
CREATE INDEX idx_mail_recipients_type ON mail_recipients(message_id, recipient_type);

-- mail_user_messages indexes
CREATE INDEX idx_mail_user_messages_user_folder ON mail_user_messages(user_id, folder)
    WHERE is_deleted = false;
CREATE INDEX idx_mail_user_messages_message ON mail_user_messages(message_id);
CREATE INDEX idx_mail_user_messages_unread ON mail_user_messages(user_id, folder)
    WHERE is_read = false AND is_deleted = false;

COMMIT;

-- =============================================
-- Verification
-- =============================================
SELECT 'mail_messages' as table_name, COUNT(*) as count FROM mail_messages
UNION ALL
SELECT 'mail_recipients', COUNT(*) FROM mail_recipients
UNION ALL
SELECT 'mail_user_messages', COUNT(*) FROM mail_user_messages;
