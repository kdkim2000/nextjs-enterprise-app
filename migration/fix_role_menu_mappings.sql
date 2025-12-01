-- =============================================
-- Fix Missing Role Menu Mappings
-- 누락된 메뉴-역할 매핑 추가
-- =============================================

-- 1. admin 역할(role-001)에 모든 메뉴 접근 권한 부여
INSERT INTO role_menu_mappings (id, role_id, menu_id, can_view, can_create, can_update, can_delete, created_by, created_at)
SELECT
    'rmm-a-' || LEFT(md5(m.id), 10),
    'role-001',
    m.id,
    true, true, true, true,
    'system',
    NOW()
FROM menus m
WHERE NOT EXISTS (
    SELECT 1 FROM role_menu_mappings rmm
    WHERE rmm.menu_id = m.id AND rmm.role_id = 'role-001'
);

-- 2. manager 역할(role-002)에 관리자 메뉴 제외한 접근 권한 부여
INSERT INTO role_menu_mappings (id, role_id, menu_id, can_view, can_create, can_update, can_delete, created_by, created_at)
SELECT
    'rmm-m-' || LEFT(md5(m.id), 10),
    'role-002',
    m.id,
    true, true, true, false,
    'system',
    NOW()
FROM menus m
WHERE m.path NOT LIKE '/admin%'
AND NOT EXISTS (
    SELECT 1 FROM role_menu_mappings rmm
    WHERE rmm.menu_id = m.id AND rmm.role_id = 'role-002'
);

-- 3. user 역할(role-003)에 일반 메뉴 접근 권한 부여
INSERT INTO role_menu_mappings (id, role_id, menu_id, can_view, can_create, can_update, can_delete, created_by, created_at)
SELECT
    'rmm-u-' || LEFT(md5(m.id), 10),
    'role-003',
    m.id,
    true, true, false, false,
    'system',
    NOW()
FROM menus m
WHERE m.path NOT LIKE '/admin%'
AND m.path NOT LIKE '/dev%'
AND NOT EXISTS (
    SELECT 1 FROM role_menu_mappings rmm
    WHERE rmm.menu_id = m.id AND rmm.role_id = 'role-003'
);

-- 4. 결과 확인
SELECT
    'Before' as status,
    (SELECT COUNT(*) FROM role_menu_mappings) as total_mappings,
    (SELECT COUNT(DISTINCT menu_id) FROM role_menu_mappings) as unique_menus;

-- 5. 역할별 매핑 현황
SELECT
    r.name as role_name,
    COUNT(rmm.id) as menu_count
FROM roles r
LEFT JOIN role_menu_mappings rmm ON r.id = rmm.role_id
WHERE r.name IN ('admin', 'manager', 'user')
GROUP BY r.name
ORDER BY r.name;

-- 6. 매핑되지 않은 메뉴 확인 (있으면 안됨)
SELECT m.code, m.name_ko, m.path
FROM menus m
WHERE NOT EXISTS (
    SELECT 1 FROM role_menu_mappings rmm WHERE rmm.menu_id = m.id
);
