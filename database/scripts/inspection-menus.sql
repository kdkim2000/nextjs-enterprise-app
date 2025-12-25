-- ============================================================
-- Inspection Module - Menu & Program Registration
-- ============================================================

-- 1. Programs for Inspection Module
INSERT INTO programs (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, category, type, status, permissions, created_at, updated_at)
VALUES
-- Inspection Dashboard
('prog-insp-dashboard', 'PROG-INSP-DASHBOARD', 'Inspection Dashboard', '점검 대시보드', '检查仪表板', 'Bảng điều khiển kiểm tra',
 'Inspection module main dashboard with statistics', '점검 모듈 메인 대시보드 및 통계', '检查模块主仪表板和统计', 'Bảng điều khiển chính và thống kê mô-đun kiểm tra',
 'inspection', 'page', 'active',
 '[{"code": "READ", "name": {"en": "Read", "ko": "읽기"}, "isDefault": true, "description": {"en": "View inspection dashboard", "ko": "점검 대시보드 조회"}}]',
 NOW(), NOW()),

-- Inspection Templates
('prog-insp-templates', 'PROG-INSP-TEMPLATES', 'Inspection Templates', '점검 템플릿', '检查模板', 'Mẫu kiểm tra',
 'Manage inspection templates and items', '점검 템플릿 및 항목 관리', '管理检查模板和项目', 'Quản lý mẫu và mục kiểm tra',
 'inspection', 'page', 'active',
 '[{"code": "READ", "name": {"en": "Read", "ko": "읽기"}, "isDefault": true, "description": {"en": "View templates", "ko": "템플릿 조회"}}, {"code": "WRITE", "name": {"en": "Write", "ko": "쓰기"}, "isDefault": false, "description": {"en": "Create/Edit templates", "ko": "템플릿 생성/수정"}}, {"code": "DELETE", "name": {"en": "Delete", "ko": "삭제"}, "isDefault": false, "description": {"en": "Delete templates", "ko": "템플릿 삭제"}}]',
 NOW(), NOW()),

-- Inspection Executions
('prog-insp-executions', 'PROG-INSP-EXECUTIONS', 'Inspection Executions', '점검 실행', '检查执行', 'Thực hiện kiểm tra',
 'Execute and manage inspections', '점검 실행 및 관리', '执行和管理检查', 'Thực hiện và quản lý kiểm tra',
 'inspection', 'page', 'active',
 '[{"code": "READ", "name": {"en": "Read", "ko": "읽기"}, "isDefault": true, "description": {"en": "View inspections", "ko": "점검 조회"}}, {"code": "WRITE", "name": {"en": "Write", "ko": "쓰기"}, "isDefault": false, "description": {"en": "Execute inspections", "ko": "점검 실행"}}, {"code": "DELETE", "name": {"en": "Delete", "ko": "삭제"}, "isDefault": false, "description": {"en": "Delete inspections", "ko": "점검 삭제"}}]',
 NOW(), NOW()),

-- Inspection Results
('prog-insp-results', 'PROG-INSP-RESULTS', 'Inspection Results', '점검 결과', '检查结果', 'Kết quả kiểm tra',
 'View and analyze inspection results', '점검 결과 조회 및 분석', '查看和分析检查结果', 'Xem và phân tích kết quả kiểm tra',
 'inspection', 'page', 'active',
 '[{"code": "READ", "name": {"en": "Read", "ko": "읽기"}, "isDefault": true, "description": {"en": "View results", "ko": "결과 조회"}}, {"code": "EXPORT", "name": {"en": "Export", "ko": "내보내기"}, "isDefault": false, "description": {"en": "Export results", "ko": "결과 내보내기"}}]',
 NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ko = EXCLUDED.name_ko,
  updated_at = NOW();

-- 2. Parent Menu for Inspection Module
INSERT INTO menus (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, path, icon, "order", parent_id, level, program_id, created_at, updated_at)
VALUES
('menu-inspection', 'inspection', 'Inspection', '점검 관리', '检查管理', 'Quản lý kiểm tra',
 'Inspection management module', '점검 관리 모듈', '检查管理模块', 'Mô-đun quản lý kiểm tra',
 NULL, 'Assignment', 4, NULL, 1, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ko = EXCLUDED.name_ko,
  icon = EXCLUDED.icon,
  updated_at = NOW();

-- 3. Sub-menus for Inspection Module
INSERT INTO menus (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, path, icon, "order", parent_id, level, program_id, created_at, updated_at)
VALUES
-- Dashboard
('menu-insp-dashboard', 'insp-dashboard', 'Dashboard', '대시보드', '仪表板', 'Bảng điều khiển',
 'Inspection statistics and overview', '점검 통계 및 개요', '检查统计和概述', 'Thống kê và tổng quan kiểm tra',
 '/inspection/dashboard', 'Dashboard', 1, 'menu-inspection', 2, 'PROG-INSP-DASHBOARD', NOW(), NOW()),

-- Templates
('menu-insp-templates', 'insp-templates', 'Templates', '템플릿', '模板', 'Mẫu',
 'Manage inspection templates', '점검 템플릿 관리', '管理检查模板', 'Quản lý mẫu kiểm tra',
 '/inspection/templates', 'ListAlt', 2, 'menu-inspection', 2, 'PROG-INSP-TEMPLATES', NOW(), NOW()),

-- Executions
('menu-insp-executions', 'insp-executions', 'Executions', '점검 실행', '执行检查', 'Thực hiện',
 'Execute and manage inspections', '점검 실행 및 관리', '执行和管理检查', 'Thực hiện và quản lý kiểm tra',
 '/inspection/executions', 'PlaylistAddCheck', 3, 'menu-inspection', 2, 'PROG-INSP-EXECUTIONS', NOW(), NOW()),

-- Results
('menu-insp-results', 'insp-results', 'Results', '결과', '结果', 'Kết quả',
 'View inspection results', '점검 결과 조회', '查看检查结果', 'Xem kết quả kiểm tra',
 '/inspection/results', 'Assessment', 4, 'menu-inspection', 2, 'PROG-INSP-RESULTS', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ko = EXCLUDED.name_ko,
  path = EXCLUDED.path,
  icon = EXCLUDED.icon,
  program_id = EXCLUDED.program_id,
  updated_at = NOW();

-- 4. Role-Program Mappings (Grant access to Admin role)
INSERT INTO role_program_mappings (id, role_id, program_id, permissions, created_at, updated_at)
SELECT
  gen_random_uuid()::varchar,
  'role-001',
  p.code,
  p.permissions,
  NOW(),
  NOW()
FROM programs p
WHERE p.id IN ('prog-insp-dashboard', 'prog-insp-templates', 'prog-insp-executions', 'prog-insp-results')
ON CONFLICT DO NOTHING;

-- 5. Role-Menu Mappings (Grant menu access to Admin role)
INSERT INTO role_menu_mappings (role_id, menu_id, created_at)
SELECT 'role-001', m.id, NOW()
FROM menus m
WHERE m.id IN ('menu-inspection', 'menu-insp-dashboard', 'menu-insp-templates', 'menu-insp-executions', 'menu-insp-results')
ON CONFLICT DO NOTHING;

-- Verify inserted data
SELECT 'Programs:' as info;
SELECT id, code, name_ko FROM programs WHERE id LIKE 'prog-insp%';

SELECT 'Menus:' as info;
SELECT id, code, name_ko, path, parent_id FROM menus WHERE id LIKE 'menu-insp%' OR id = 'menu-inspection';
