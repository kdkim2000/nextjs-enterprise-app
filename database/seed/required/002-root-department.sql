-- ==========================================
-- REQUIRED: Root Department
-- 최상위 조직 데이터
-- ==========================================

-- Root Department (최상위 조직)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, level, parent_id, status, created_at, updated_at)
VALUES
    ('DEPT-000', 'ROOT', 'Company', '전사', '公司', 'Công ty', 0, NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;
