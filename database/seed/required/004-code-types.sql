-- ==========================================
-- REQUIRED: Code Types
-- 시스템 코드 유형
-- ==========================================

-- Code Types (코드 유형)
INSERT INTO code_types (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, status, category, display_order, created_at, updated_at)
VALUES
    -- User related
    ('CT-USER-STATUS', 'USER_STATUS', 'User Status', '사용자 상태', '用户状态', 'Trạng thái người dùng', 'User account status', '사용자 계정 상태', 'active', 'USER', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CT-USER-CATEGORY', 'USER_CATEGORY', 'User Category', '사용자 구분', '用户类别', 'Loại người dùng', 'User category types', '사용자 구분 유형', 'active', 'USER', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CT-POSITION', 'POSITION', 'Position', '직위', '职位', 'Chức vụ', 'Employee positions', '직원 직위', 'active', 'USER', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- System related
    ('CT-COMMON-STATUS', 'COMMON_STATUS', 'Common Status', '공통 상태', '通用状态', 'Trạng thái chung', 'Common status values', '공통 상태 값', 'active', 'SYSTEM', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CT-YES-NO', 'YES_NO', 'Yes/No', '예/아니오', '是/否', 'Có/Không', 'Boolean options', '불리언 옵션', 'active', 'SYSTEM', 110, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Board related
    ('CT-POST-STATUS', 'POST_STATUS', 'Post Status', '게시물 상태', '帖子状态', 'Trạng thái bài viết', 'Board post status', '게시판 게시물 상태', 'active', 'BOARD', 200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CT-POST-TYPE', 'POST_TYPE', 'Post Type', '게시물 유형', '帖子类型', 'Loại bài viết', 'Board post types', '게시판 게시물 유형', 'active', 'BOARD', 210, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;
