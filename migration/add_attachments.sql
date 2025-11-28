-- ==========================================
-- ATTACHMENTS MANAGEMENT TABLES
-- 첨부파일 관리 테이블
-- ==========================================

-- 1. attachments 테이블 (첨부 그룹)
-- 하나의 첨부에 여러 파일이 있을 수 있으므로 그룹 단위로 관리
CREATE TABLE IF NOT EXISTS attachments (
    id VARCHAR(50) PRIMARY KEY,                     -- 첨부 그룹 ID (UUID)
    attachment_type_id VARCHAR(50) NOT NULL,        -- 첨부파일 종류 ID (FK: attachment_types.id)
    reference_type VARCHAR(100),                    -- 참조 대상 타입 (예: 'post', 'comment', 'user')
    reference_id VARCHAR(100),                      -- 참조 대상 ID (예: 게시글 ID, 사용자 ID)
    title VARCHAR(500),                             -- 첨부 제목 (선택)
    description TEXT,                               -- 첨부 설명 (선택)
    file_count INTEGER DEFAULT 0,                   -- 파일 개수
    total_size BIGINT DEFAULT 0,                    -- 총 파일 크기 (바이트)
    status VARCHAR(20) DEFAULT 'active',            -- 상태 (active, deleted, pending)
    created_by VARCHAR(50),                         -- 생성자 ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,            -- 소프트 삭제
    CONSTRAINT fk_attachments_type FOREIGN KEY (attachment_type_id)
        REFERENCES attachment_types(id) ON DELETE RESTRICT
);

-- 2. attachment_files 테이블 (개별 파일)
-- 실제 파일 정보 저장
CREATE TABLE IF NOT EXISTS attachment_files (
    id VARCHAR(50) PRIMARY KEY,                     -- 파일 ID (UUID)
    attachment_id VARCHAR(50) NOT NULL,             -- 첨부 그룹 ID (FK: attachments.id)
    original_filename VARCHAR(500) NOT NULL,        -- 원본 파일명 (다운로드 시 사용)
    stored_filename VARCHAR(500) NOT NULL,          -- 저장된 파일명 (난수로 생성된 고유 파일명)
    file_extension VARCHAR(50),                     -- 파일 확장자 (예: jpg, pdf, xlsx)
    mime_type VARCHAR(200),                         -- MIME 타입 (예: image/jpeg, application/pdf)
    file_size BIGINT NOT NULL,                      -- 파일 크기 (바이트)
    storage_path VARCHAR(1000) NOT NULL,            -- 실제 저장 경로 (상대 경로)
    full_path VARCHAR(1500),                        -- 전체 경로 (base_path + storage_path + stored_filename)
    checksum VARCHAR(100),                          -- 파일 체크섬 (MD5 또는 SHA256, 중복 체크용)
    is_image BOOLEAN DEFAULT FALSE,                 -- 이미지 파일 여부
    image_width INTEGER,                            -- 이미지 너비 (이미지인 경우)
    image_height INTEGER,                           -- 이미지 높이 (이미지인 경우)
    thumbnail_path VARCHAR(1000),                   -- 썸네일 경로 (이미지인 경우)
    download_count INTEGER DEFAULT 0,               -- 다운로드 횟수
    "order" INTEGER DEFAULT 0,                      -- 정렬 순서
    status VARCHAR(20) DEFAULT 'active',            -- 상태 (active, deleted, pending)
    created_by VARCHAR(50),                         -- 업로드한 사용자 ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,            -- 소프트 삭제
    CONSTRAINT fk_attachment_files_attachment FOREIGN KEY (attachment_id)
        REFERENCES attachments(id) ON DELETE CASCADE
);

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_attachments_type ON attachments(attachment_type_id);
CREATE INDEX IF NOT EXISTS idx_attachments_reference ON attachments(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_attachments_status ON attachments(status);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON attachments(created_at);

CREATE INDEX IF NOT EXISTS idx_attachment_files_attachment ON attachment_files(attachment_id);
CREATE INDEX IF NOT EXISTS idx_attachment_files_stored_filename ON attachment_files(stored_filename);
CREATE INDEX IF NOT EXISTS idx_attachment_files_checksum ON attachment_files(checksum);
CREATE INDEX IF NOT EXISTS idx_attachment_files_status ON attachment_files(status);
CREATE INDEX IF NOT EXISTS idx_attachment_files_extension ON attachment_files(file_extension);

-- 4. 파일 개수 및 크기 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_attachment_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE attachments
        SET file_count = file_count + 1,
            total_size = total_size + NEW.file_size,
            updated_at = NOW()
        WHERE id = NEW.attachment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE attachments
        SET file_count = file_count - 1,
            total_size = total_size - OLD.file_size,
            updated_at = NOW()
        WHERE id = OLD.attachment_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        IF NEW.status = 'deleted' THEN
            UPDATE attachments
            SET file_count = file_count - 1,
                total_size = total_size - NEW.file_size,
                updated_at = NOW()
            WHERE id = NEW.attachment_id;
        ELSIF OLD.status = 'deleted' AND NEW.status = 'active' THEN
            UPDATE attachments
            SET file_count = file_count + 1,
                total_size = total_size + NEW.file_size,
                updated_at = NOW()
            WHERE id = NEW.attachment_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_attachment_stats ON attachment_files;
CREATE TRIGGER trigger_update_attachment_stats
    AFTER INSERT OR DELETE OR UPDATE OF status ON attachment_files
    FOR EACH ROW
    EXECUTE FUNCTION update_attachment_stats();

-- 5. 기본 첨부파일 종류 데이터 (필요시)
INSERT INTO attachment_types (id, code, name_en, name_ko, name_zh, name_vi, storage_path, max_file_count, max_file_size, allowed_extensions, status, "order")
VALUES
    ('ATTACH-TYPE-BOARD', 'BOARD_ATTACH', 'Board Attachment', '게시판 첨부', '公告板附件', 'Tệp đính kèm bảng tin', '/board', 10, 52428800, ARRAY['jpg','jpeg','png','gif','pdf','doc','docx','xls','xlsx','ppt','pptx','zip','txt'], 'active', 1),
    ('ATTACH-TYPE-PROFILE', 'PROFILE_IMAGE', 'Profile Image', '프로필 이미지', '头像图片', 'Ảnh hồ sơ', '/profile', 1, 5242880, ARRAY['jpg','jpeg','png','gif'], 'active', 2),
    ('ATTACH-TYPE-DOCUMENT', 'DOCUMENT', 'Document', '문서', '文档', 'Tài liệu', '/documents', 20, 104857600, ARRAY['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','csv'], 'active', 3)
ON CONFLICT (id) DO NOTHING;

-- 6. 확인 쿼리
SELECT 'attachments table created' as status, COUNT(*) as count FROM attachments;
SELECT 'attachment_files table created' as status, COUNT(*) as count FROM attachment_files;
SELECT 'attachment_types count' as status, COUNT(*) as count FROM attachment_types;
