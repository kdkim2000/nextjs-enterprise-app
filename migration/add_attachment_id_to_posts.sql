-- ==========================================
-- ADD ATTACHMENT_ID TO POSTS TABLE
-- 게시글에 첨부파일 연결
-- ==========================================

-- 1. posts 테이블에 attachment_id 컬럼 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'attachment_id'
    ) THEN
        ALTER TABLE posts ADD COLUMN attachment_id VARCHAR(50);

        -- 인덱스 생성
        CREATE INDEX idx_posts_attachment_id ON posts(attachment_id);

        -- 코멘트 추가
        COMMENT ON COLUMN posts.attachment_id IS '첨부파일 그룹 ID (attachments.id 참조)';

        RAISE NOTICE 'Column attachment_id added to posts table';
    ELSE
        RAISE NOTICE 'Column attachment_id already exists in posts table';
    END IF;
END $$;

-- 2. 확인 쿼리
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts' AND column_name = 'attachment_id';
