-- =============================================
-- Add MAIL Attachment Type
-- =============================================

-- Insert MAIL attachment type
INSERT INTO attachment_types (
    id,
    code,
    name_en,
    name_ko,
    name_zh,
    name_vi,
    description_en,
    description_ko,
    description_zh,
    description_vi,
    storage_path,
    allowed_extensions,
    max_file_size,
    max_file_count,
    max_total_size,
    status,
    "order"
)
VALUES (
    gen_random_uuid()::text,
    'MAIL',
    'Mail Attachments',
    '메일 첨부파일',
    '邮件附件',
    'Tệp đính kèm email',
    'Attachments for internal mail system',
    '내부 메일 시스템용 첨부파일',
    '内部邮件系统附件',
    'Tệp đính kèm cho hệ thống thư nội bộ',
    'uploads/mail',
    ARRAY[
        -- Documents
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        'txt', 'rtf', 'csv', 'hwp', 'hwpx',
        -- Images
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg',
        -- Archives
        'zip', 'rar', '7z', 'tar', 'gz',
        -- Others
        'json', 'xml', 'html', 'md'
    ],
    26214400,   -- 25MB max file size
    10,         -- Max 10 files per mail
    104857600,  -- 100MB max total size
    'active',
    100
)
ON CONFLICT (code) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ko = EXCLUDED.name_ko,
    name_zh = EXCLUDED.name_zh,
    name_vi = EXCLUDED.name_vi,
    description_en = EXCLUDED.description_en,
    description_ko = EXCLUDED.description_ko,
    description_zh = EXCLUDED.description_zh,
    description_vi = EXCLUDED.description_vi,
    storage_path = EXCLUDED.storage_path,
    allowed_extensions = EXCLUDED.allowed_extensions,
    max_file_size = EXCLUDED.max_file_size,
    max_file_count = EXCLUDED.max_file_count,
    max_total_size = EXCLUDED.max_total_size,
    updated_at = NOW();

-- Verify
SELECT
    id,
    code,
    name_en,
    name_ko,
    allowed_extensions,
    max_file_size,
    max_file_count,
    status
FROM attachment_types
WHERE code = 'MAIL';
