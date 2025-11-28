-- ==========================================
-- ADD ATTACHMENT TYPE PROGRAM AND PERMISSIONS
-- 첨부파일 종류 관리 프로그램 및 권한 추가
-- ==========================================

-- 1. Insert program
INSERT INTO programs (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, category, type, status, permissions, created_at, updated_at)
VALUES (
    'PROG-ATTACHMENT-TYPE',
    'PROG-ATTACHMENT-TYPE',
    'Attachment Type Management',
    '첨부파일 종류 관리',
    '附件类型管理',
    'Quản lý loại tệp đính kèm',
    'Manage attachment types and file upload configurations',
    '첨부파일 종류 및 파일 업로드 설정 관리',
    '管理附件类型和文件上传配置',
    'Quản lý loại tệp đính kèm và cấu hình tải lên',
    'admin',
    'program',
    'active',
    '["view","create","update","delete"]',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ko = EXCLUDED.name_ko,
    name_zh = EXCLUDED.name_zh,
    name_vi = EXCLUDED.name_vi,
    updated_at = NOW();

-- 2. Grant all permissions to admin role
INSERT INTO role_program_mappings (id, role_id, program_id, can_view, can_create, can_update, can_delete, created_at)
VALUES (
    'RPM-ADMIN-ATTACH-TYPE',
    'ROLE-ADMIN',
    'PROG-ATTACHMENT-TYPE',
    true,
    true,
    true,
    true,
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    can_view = true,
    can_create = true,
    can_update = true,
    can_delete = true;

-- 3. Grant view permission to user role (optional)
INSERT INTO role_program_mappings (id, role_id, program_id, can_view, can_create, can_update, can_delete, created_at)
VALUES (
    'RPM-USER-ATTACH-TYPE',
    'ROLE-USER',
    'PROG-ATTACHMENT-TYPE',
    true,
    false,
    false,
    false,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT 'Program created:' as status, id, code, name_ko FROM programs WHERE id = 'PROG-ATTACHMENT-TYPE';
SELECT 'Permissions granted:' as status, id, role_id, program_id, can_view, can_create, can_update, can_delete FROM role_program_mappings WHERE program_id = 'PROG-ATTACHMENT-TYPE';
