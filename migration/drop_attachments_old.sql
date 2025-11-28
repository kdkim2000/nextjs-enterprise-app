-- ==========================================
-- DROP attachments_old TABLE
-- 이전 첨부파일 테이블 삭제
-- ==========================================
--
-- 이 스크립트는 더 이상 사용하지 않는 이전 attachments 테이블(attachments_old)을 삭제합니다.
-- 새로운 첨부파일 시스템은 다음 테이블들을 사용합니다:
--   - attachments (첨부 그룹)
--   - attachment_files (개별 파일)
--   - attachment_types (첨부파일 종류)
--
-- 실행 전 확인사항:
--   1. 기존 데이터 백업 완료 여부
--   2. 새 attachments 시스템으로 마이그레이션 완료 여부
--   3. 이 테이블을 참조하는 코드가 없는지 확인
--
-- ==========================================

-- 1. 테이블 존재 여부 확인
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attachments_old') THEN
        RAISE NOTICE 'attachments_old 테이블이 존재합니다. 삭제를 진행합니다.';
    ELSE
        RAISE NOTICE 'attachments_old 테이블이 존재하지 않습니다.';
    END IF;
END $$;

-- 2. 삭제 전 데이터 개수 확인 (선택적)
DO $$
DECLARE
    row_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attachments_old') THEN
        EXECUTE 'SELECT COUNT(*) FROM attachments_old' INTO row_count;
        RAISE NOTICE 'attachments_old 테이블 레코드 수: %', row_count;
    END IF;
END $$;

-- 3. attachments_old 테이블 삭제
DROP TABLE IF EXISTS attachments_old CASCADE;

-- 4. 삭제 확인
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attachments_old') THEN
        RAISE NOTICE 'attachments_old 테이블이 성공적으로 삭제되었습니다.';
    ELSE
        RAISE WARNING 'attachments_old 테이블 삭제에 실패했습니다.';
    END IF;
END $$;

-- 5. 관련 인덱스 정리 (CASCADE로 자동 삭제되지만 명시적으로 확인)
-- DROP INDEX IF EXISTS idx_attachments_old_post_id;
-- DROP INDEX IF EXISTS idx_attachments_old_uploaded_by;
-- DROP INDEX IF EXISTS idx_attachments_old_created_at;
-- DROP INDEX IF EXISTS idx_attachments_old_mime_type;

-- 6. 결과 확인
SELECT 'Migration completed' as status,
       'attachments_old table dropped' as action,
       NOW() as executed_at;
