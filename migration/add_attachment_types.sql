-- ==========================================
-- ATTACHMENT TYPES TABLE
-- 첨부파일 종류 관리 테이블
-- ==========================================

-- Drop table if exists
DROP TABLE IF EXISTS attachment_types CASCADE;

-- Create attachment_types table
CREATE TABLE attachment_types (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,          -- 첨부파일 종류 코드 (예: BOARD_ATTACH, PROFILE_IMAGE, DOCUMENT)
    name_en VARCHAR(200),                        -- 영문 이름
    name_ko VARCHAR(200),                        -- 한글 이름
    name_zh VARCHAR(200),                        -- 중문 이름
    name_vi VARCHAR(200),                        -- 베트남어 이름
    description_en TEXT,                         -- 영문 설명
    description_ko TEXT,                         -- 한글 설명
    description_zh TEXT,                         -- 중문 설명
    description_vi TEXT,                         -- 베트남어 설명
    storage_path VARCHAR(500) NOT NULL,          -- 저장 경로 (예: /uploads/board, /uploads/profile)
    max_file_count INTEGER DEFAULT 5,            -- 최대 첨부 파일 개수
    max_file_size BIGINT DEFAULT 10485760,       -- 최대 파일 크기 (바이트, 기본 10MB)
    max_total_size BIGINT DEFAULT 52428800,      -- 최대 총 용량 (바이트, 기본 50MB)
    allowed_extensions TEXT[],                   -- 허용 확장자 배열 (예: {jpg,png,pdf,docx})
    allowed_mime_types TEXT[],                   -- 허용 MIME 타입 배열
    status VARCHAR(20) DEFAULT 'active',         -- 상태 (active, inactive)
    "order" INTEGER DEFAULT 0,                   -- 정렬 순서
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_attachment_types_code ON attachment_types(code);
CREATE INDEX idx_attachment_types_status ON attachment_types(status);
CREATE INDEX idx_attachment_types_order ON attachment_types("order");

-- Insert default attachment types
-- Note: storage_path is relative to the 'uploads' directory (e.g., '/board' becomes 'uploads/board')
INSERT INTO attachment_types (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, storage_path, max_file_count, max_file_size, max_total_size, allowed_extensions, allowed_mime_types, status, "order") VALUES
('ATT-TYPE-001', 'BOARD_GENERAL', 'Board Attachment', '게시판 첨부', '公告板附件', 'Tệp đính kèm bảng tin', 'General board attachments', '일반 게시판 첨부파일', '一般公告板附件', 'Tệp đính kèm bảng tin chung', '/board', 10, 10485760, 104857600, ARRAY['jpg','jpeg','png','gif','pdf','doc','docx','xls','xlsx','ppt','pptx','zip','txt'], ARRAY['image/jpeg','image/png','image/gif','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/zip','text/plain'], 'active', 1),
('ATT-TYPE-002', 'PROFILE_IMAGE', 'Profile Image', '프로필 이미지', '头像图片', 'Ảnh hồ sơ', 'User profile images', '사용자 프로필 이미지', '用户头像图片', 'Ảnh hồ sơ người dùng', '/profile', 1, 5242880, 5242880, ARRAY['jpg','jpeg','png','gif'], ARRAY['image/jpeg','image/png','image/gif'], 'active', 2),
('ATT-TYPE-003', 'DOCUMENT', 'Document', '문서', '文档', 'Tài liệu', 'Document attachments', '문서 첨부파일', '文档附件', 'Tệp đính kèm tài liệu', '/documents', 20, 52428800, 524288000, ARRAY['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','hwp'], ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','text/plain','application/x-hwp'], 'active', 3),
('ATT-TYPE-004', 'IMAGE_ONLY', 'Image Only', '이미지 전용', '仅图片', 'Chỉ hình ảnh', 'Image only attachments', '이미지 전용 첨부파일', '仅图片附件', 'Chỉ tệp đính kèm hình ảnh', '/images', 10, 10485760, 104857600, ARRAY['jpg','jpeg','png','gif','bmp','webp','svg'], ARRAY['image/jpeg','image/png','image/gif','image/bmp','image/webp','image/svg+xml'], 'active', 4),
('ATT-TYPE-005', 'TEMP_UPLOAD', 'Temporary Upload', '임시 업로드', '临时上传', 'Tải lên tạm thời', 'Temporary file uploads', '임시 파일 업로드', '临时文件上传', 'Tải tệp lên tạm thời', '/temp', 5, 10485760, 52428800, ARRAY['jpg','jpeg','png','gif','pdf','doc','docx','xls','xlsx','zip'], ARRAY['image/jpeg','image/png','image/gif','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/zip'], 'active', 5);

-- Comments
COMMENT ON TABLE attachment_types IS '첨부파일 종류 관리 테이블';
COMMENT ON COLUMN attachment_types.code IS '첨부파일 종류 코드';
COMMENT ON COLUMN attachment_types.storage_path IS '파일 저장 경로';
COMMENT ON COLUMN attachment_types.max_file_count IS '최대 첨부 파일 개수';
COMMENT ON COLUMN attachment_types.max_file_size IS '최대 파일 크기 (바이트)';
COMMENT ON COLUMN attachment_types.max_total_size IS '최대 총 용량 (바이트)';
COMMENT ON COLUMN attachment_types.allowed_extensions IS '허용 파일 확장자 배열';
COMMENT ON COLUMN attachment_types.allowed_mime_types IS '허용 MIME 타입 배열';
