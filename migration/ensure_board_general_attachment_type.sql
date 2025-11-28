-- ==========================================
-- ENSURE BOARD_GENERAL ATTACHMENT TYPE EXISTS
-- 게시판 첨부파일 타입이 존재하는지 확인하고 없으면 생성
-- ==========================================

-- Check if attachment_types table exists, create if not
CREATE TABLE IF NOT EXISTS attachment_types (
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
    storage_path VARCHAR(500) NOT NULL,
    max_file_count INTEGER DEFAULT 5,
    max_file_size BIGINT DEFAULT 10485760,
    max_total_size BIGINT DEFAULT 52428800,
    allowed_extensions TEXT[],
    allowed_mime_types TEXT[],
    status VARCHAR(20) DEFAULT 'active',
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert BOARD_GENERAL if it doesn't exist
INSERT INTO attachment_types (
    id, code, name_en, name_ko, name_zh, name_vi,
    description_en, description_ko, description_zh, description_vi,
    storage_path, max_file_count, max_file_size, max_total_size,
    allowed_extensions, allowed_mime_types, status, "order"
) VALUES (
    'ATT-TYPE-001', 'BOARD_GENERAL', 'Board Attachment', '게시판 첨부', '公告板附件', 'Tệp đính kèm bảng tin',
    'General board attachments', '일반 게시판 첨부파일', '一般公告板附件', 'Tệp đính kèm bảng tin chung',
    '/board', 10, 10485760, 104857600,
    ARRAY['jpg','jpeg','png','gif','pdf','doc','docx','xls','xlsx','ppt','pptx','zip','txt'],
    ARRAY['image/jpeg','image/png','image/gif','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/zip','text/plain'],
    'active', 1
) ON CONFLICT (code) DO NOTHING;

-- Also ensure attachments and attachment_files tables exist
CREATE TABLE IF NOT EXISTS attachments (
    id VARCHAR(50) PRIMARY KEY,
    attachment_type_id VARCHAR(50) NOT NULL,
    reference_type VARCHAR(100),
    reference_id VARCHAR(100),
    title VARCHAR(500),
    description TEXT,
    file_count INTEGER DEFAULT 0,
    total_size BIGINT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_attachments_type FOREIGN KEY (attachment_type_id)
        REFERENCES attachment_types(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS attachment_files (
    id VARCHAR(50) PRIMARY KEY,
    attachment_id VARCHAR(50) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    stored_filename VARCHAR(500) NOT NULL,
    file_extension VARCHAR(50),
    mime_type VARCHAR(200),
    file_size BIGINT NOT NULL,
    storage_path VARCHAR(1000) NOT NULL,
    full_path VARCHAR(1500),
    checksum VARCHAR(100),
    is_image BOOLEAN DEFAULT FALSE,
    image_width INTEGER,
    image_height INTEGER,
    thumbnail_path VARCHAR(1000),
    download_count INTEGER DEFAULT 0,
    "order" INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_attachment_files_attachment FOREIGN KEY (attachment_id)
        REFERENCES attachments(id) ON DELETE CASCADE
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_attachment_types_code ON attachment_types(code);
CREATE INDEX IF NOT EXISTS idx_attachments_type ON attachments(attachment_type_id);
CREATE INDEX IF NOT EXISTS idx_attachments_reference ON attachments(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_attachment_files_attachment ON attachment_files(attachment_id);

-- Verify
SELECT 'BOARD_GENERAL exists' as status, id, code FROM attachment_types WHERE code = 'BOARD_GENERAL';
SELECT 'Total attachment types' as status, COUNT(*) as count FROM attachment_types;
