-- ==========================================
-- 공지사항 팝업 알림 기능 추가
-- ==========================================
-- Created: 2025-11-24
-- Description: posts 테이블에 팝업 알림 관련 필드 추가
-- ==========================================

-- 1. 팝업 알림 여부 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS show_popup BOOLEAN DEFAULT false;

-- 2. 게시글 시작일 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS display_start_date TIMESTAMP WITH TIME ZONE;

-- 3. 게시글 종료일 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS display_end_date TIMESTAMP WITH TIME ZONE;

-- 4. 인덱스 생성 (팝업 알림 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_posts_popup_notification
ON posts(show_popup, display_start_date, display_end_date)
WHERE show_popup = true AND status = 'published';

-- 5. 코멘트 추가
COMMENT ON COLUMN posts.show_popup IS '로그인 시 팝업으로 표시할지 여부';
COMMENT ON COLUMN posts.display_start_date IS '게시글 표시 시작일 (팝업 알림용)';
COMMENT ON COLUMN posts.display_end_date IS '게시글 표시 종료일 (팝업 알림용)';

-- 6. 확인 메시지
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE '공지사항 팝업 알림 기능 추가 완료';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '추가된 컬럼:';
    RAISE NOTICE '  - show_popup: 팝업 알림 여부 (BOOLEAN)';
    RAISE NOTICE '  - display_start_date: 게시글 시작일 (TIMESTAMP)';
    RAISE NOTICE '  - display_end_date: 게시글 종료일 (TIMESTAMP)';
    RAISE NOTICE '===========================================';
END $$;
