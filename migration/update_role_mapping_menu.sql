-- =============================================
-- UPDATE: Role Mapping Menu Path and Name
-- Update the menu from role-menu-mapping to role-program-mapping
-- =============================================

-- Step 1: Update menu path and code
UPDATE menus
SET
  code = 'MENU-ROLE-PROG-MAP',
  path = '/admin/role-program-mapping',
  name_en = 'Role Program Mapping',
  name_ko = '역할-프로그램 매핑',
  name_zh = '角色程序映射',
  name_vi = 'Ánh xạ vai trò chương trình',
  updated_at = NOW()
WHERE code = 'MENU-ROLE-MENU-MAP' OR path = '/admin/role-menu-mapping';

-- Step 2: Verify the update
SELECT id, code, path, name_en, name_ko
FROM menus
WHERE code LIKE '%ROLE%MAP%' OR path LIKE '%role%mapping%';

-- Step 3: Update program if exists
UPDATE programs
SET
  code = 'PROG-ROLE-PROG-MAP',
  name_en = 'Role Program Mapping',
  name_ko = '역할-프로그램 매핑',
  updated_at = NOW()
WHERE code = 'PROG-ROLE-MENU-MAP' OR name_en LIKE '%Role Menu%';

-- Step 4: Update role_program_mappings if program_code changed
UPDATE role_program_mappings
SET program_code = 'PROG-ROLE-PROG-MAP'
WHERE program_code = 'PROG-ROLE-MENU-MAP';
