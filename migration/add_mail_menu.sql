-- =============================================
-- Add Mail Menu and Program
-- =============================================

-- 1. Create Mail Program
INSERT INTO programs (
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
    category,
    type,
    status,
    permissions
)
VALUES (
    'prog-mail',
    'PROG-MAIL',
    'Mail',
    '메일',
    '邮件',
    'Thư',
    'Internal mail system',
    '내부 메일 시스템',
    '内部邮件系统',
    'Hệ thống thư nội bộ',
    'communication',
    'page',
    'active',
    '[{"code": "READ", "name": {"en": "Read", "ko": "읽기"}, "isDefault": true}, {"code": "WRITE", "name": {"en": "Write", "ko": "쓰기"}, "isDefault": true}, {"code": "DELETE", "name": {"en": "Delete", "ko": "삭제"}, "isDefault": false}]'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ko = EXCLUDED.name_ko,
    updated_at = NOW();

-- 2. Create Mail Menu
INSERT INTO menus (
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
    path,
    icon,
    "order",
    parent_id,
    level,
    program_id
)
VALUES (
    'menu-mail',
    'mail',
    'Mail',
    '메일',
    '邮件',
    'Thư',
    'Internal mail system',
    '내부 메일 시스템',
    '内部邮件系统',
    'Hệ thống thư nội bộ',
    '/mail',
    'Mail',
    3,  -- After dashboard and admin
    NULL,
    1,
    'prog-mail'
)
ON CONFLICT (code) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ko = EXCLUDED.name_ko,
    name_zh = EXCLUDED.name_zh,
    name_vi = EXCLUDED.name_vi,
    icon = EXCLUDED.icon,
    program_id = EXCLUDED.program_id,
    updated_at = NOW();

-- 3. Grant mail access to all roles (admin, manager, user)
INSERT INTO role_menu_mappings (id, role_id, menu_id, can_view, can_create, can_update, can_delete, created_by, created_at)
SELECT
    'rmm-mail-' || REPLACE(r.id, 'role-', ''),
    r.id,
    'menu-mail',
    true, true, true, true,
    'system',
    NOW()
FROM roles r
WHERE r.name IN ('admin', 'manager', 'user')
ON CONFLICT (id) DO NOTHING;

-- 4. Grant program access to all roles
INSERT INTO role_program_mappings (id, role_id, program_id, can_view, can_create, can_update, can_delete, created_by, created_at)
SELECT
    'rpm-mail-' || REPLACE(r.id, 'role-', ''),
    r.id,
    'prog-mail',
    true, true, true, true,
    'system',
    NOW()
FROM roles r
WHERE r.name IN ('admin', 'manager', 'user')
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT 'Menu' as type, id, code, name_ko, path FROM menus WHERE code = 'mail'
UNION ALL
SELECT 'Program', id, code, name_ko, '' as path FROM programs WHERE code = 'PROG-MAIL';
