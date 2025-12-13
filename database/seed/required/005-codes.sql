-- ==========================================
-- REQUIRED: System Codes
-- 시스템 코드 데이터
-- ==========================================

-- User Status Codes
INSERT INTO codes (id, code_type_id, code, name_en, name_ko, name_zh, name_vi, status, display_order, created_at, updated_at)
VALUES
    ('CODE-US-ACTIVE', 'CT-USER-STATUS', 'active', 'Active', '활성', '活跃', 'Hoạt động', 'active', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CODE-US-INACTIVE', 'CT-USER-STATUS', 'inactive', 'Inactive', '비활성', '停用', 'Không hoạt động', 'active', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CODE-US-LOCKED', 'CT-USER-STATUS', 'locked', 'Locked', '잠김', '锁定', 'Đã khóa', 'active', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CODE-US-PENDING', 'CT-USER-STATUS', 'pending', 'Pending', '대기', '待审核', 'Chờ xử lý', 'active', 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- User Category Codes
INSERT INTO codes (id, code_type_id, code, name_en, name_ko, name_zh, name_vi, status, display_order, created_at, updated_at)
VALUES
    ('CODE-UC-REGULAR', 'CT-USER-CATEGORY', 'regular', 'Regular Employee', '정규직', '正式员工', 'Nhân viên chính thức', 'active', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CODE-UC-CONTRACT', 'CT-USER-CATEGORY', 'contractor', 'Contractor', '계약직', '合同工', 'Nhân viên hợp đồng', 'active', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CODE-UC-TEMP', 'CT-USER-CATEGORY', 'temporary', 'Temporary', '임시직', '临时工', 'Lao động tạm thời', 'active', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CODE-UC-EXTERNAL', 'CT-USER-CATEGORY', 'external', 'External', '외부', '外部', 'Bên ngoài', 'active', 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CODE-UC-ADMIN', 'CT-USER-CATEGORY', 'admin', 'Administrator', '관리자', '管理员', 'Quản trị viên', 'active', 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Common Status Codes
INSERT INTO codes (id, code_type_id, code, name_en, name_ko, name_zh, name_vi, status, display_order, created_at, updated_at)
VALUES
    ('CODE-CS-ACTIVE', 'CT-COMMON-STATUS', 'active', 'Active', '활성', '活跃', 'Hoạt động', 'active', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CODE-CS-INACTIVE', 'CT-COMMON-STATUS', 'inactive', 'Inactive', '비활성', '停用', 'Không hoạt động', 'active', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CODE-CS-DELETED', 'CT-COMMON-STATUS', 'deleted', 'Deleted', '삭제됨', '已删除', 'Đã xóa', 'active', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Yes/No Codes
INSERT INTO codes (id, code_type_id, code, name_en, name_ko, name_zh, name_vi, status, display_order, created_at, updated_at)
VALUES
    ('CODE-YN-YES', 'CT-YES-NO', 'Y', 'Yes', '예', '是', 'Có', 'active', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CODE-YN-NO', 'CT-YES-NO', 'N', 'No', '아니오', '否', 'Không', 'active', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Post Status Codes
INSERT INTO codes (id, code_type_id, code, name_en, name_ko, name_zh, name_vi, status, display_order, created_at, updated_at)
VALUES
    ('CODE-PS-DRAFT', 'CT-POST-STATUS', 'draft', 'Draft', '임시저장', '草稿', 'Bản nháp', 'active', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CODE-PS-PUBLISHED', 'CT-POST-STATUS', 'published', 'Published', '게시됨', '已发布', 'Đã đăng', 'active', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CODE-PS-HIDDEN', 'CT-POST-STATUS', 'hidden', 'Hidden', '숨김', '隐藏', 'Ẩn', 'active', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CODE-PS-DELETED', 'CT-POST-STATUS', 'deleted', 'Deleted', '삭제됨', '已删除', 'Đã xóa', 'active', 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Post Type Codes
INSERT INTO codes (id, code_type_id, code, name_en, name_ko, name_zh, name_vi, status, display_order, created_at, updated_at)
VALUES
    ('CODE-PT-NORMAL', 'CT-POST-TYPE', 'normal', 'Normal', '일반', '普通', 'Bình thường', 'active', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CODE-PT-NOTICE', 'CT-POST-TYPE', 'notice', 'Notice', '공지', '公告', 'Thông báo', 'active', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CODE-PT-QNA', 'CT-POST-TYPE', 'qna', 'Q&A', '질문', '问答', 'Hỏi đáp', 'active', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
