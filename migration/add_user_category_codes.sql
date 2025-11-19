-- ==========================================
-- ADD USER_CATEGORY CODE TYPE AND CODES
-- ==========================================
-- This script adds the USER_CATEGORY code type and its associated codes
-- for the user_category field in the users table

BEGIN;

-- Step 1: Delete existing USER_CATEGORY entries if they exist
DELETE FROM codes WHERE code_type = 'USER_CATEGORY';
DELETE FROM code_types WHERE code = 'USER_CATEGORY';

-- Step 2: Add CODE_TYPE for USER_CATEGORY
INSERT INTO code_types (
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
  "order",
  status,
  category,
  created_at,
  updated_at
) VALUES (
  'CT-USER-CATEGORY',
  'USER_CATEGORY',
  'User Category',
  '사용자 구분',
  '用户类别',
  'Loại người dùng',
  'User category types for employee classification',
  '직원 분류를 위한 사용자 구분 유형',
  '员工分类的用户类别类型',
  'Loại phân loại người dùng cho phân loại nhân viên',
  100,
  'active',
  'USER',
  NOW(),
  NOW()
);

-- Step 3: Add CODES for USER_CATEGORY
-- Regular (정규직)
INSERT INTO codes (
  id,
  code_type,
  code,
  name_en,
  name_ko,
  name_zh,
  name_vi,
  description_en,
  description_ko,
  description_zh,
  description_vi,
  "order",
  status,
  created_at,
  updated_at
) VALUES (
  'UC-REGULAR',
  'USER_CATEGORY',
  'regular',
  'Regular Employee',
  '정규직',
  '正式员工',
  'Nhân viên chính thức',
  'Full-time regular employee',
  '정규 정직원',
  '全职正式员工',
  'Nhân viên chính thức toàn thời gian',
  10,
  'active',
  NOW(),
  NOW()
);

-- Contractor (계약직)
INSERT INTO codes (
  id,
  code_type,
  code,
  name_en,
  name_ko,
  name_zh,
  name_vi,
  description_en,
  description_ko,
  description_zh,
  description_vi,
  "order",
  status,
  created_at,
  updated_at
) VALUES (
  'UC-CONTRACTOR',
  'USER_CATEGORY',
  'contractor',
  'Contractor',
  '계약직',
  '合同工',
  'Nhân viên hợp đồng',
  'Contract-based employee',
  '계약 기반 직원',
  '合同制员工',
  'Nhân viên theo hợp đồng',
  20,
  'active',
  NOW(),
  NOW()
);

-- Temporary (임시직)
INSERT INTO codes (
  id,
  code_type,
  code,
  name_en,
  name_ko,
  name_zh,
  name_vi,
  description_en,
  description_ko,
  description_zh,
  description_vi,
  "order",
  status,
  created_at,
  updated_at
) VALUES (
  'UC-TEMPORARY',
  'USER_CATEGORY',
  'temporary',
  'Temporary Worker',
  '임시직',
  '临时工',
  'Lao động tạm thời',
  'Temporary or seasonal worker',
  '임시 또는 계절 근로자',
  '临时或季节性工人',
  'Công nhân tạm thời hoặc theo mùa',
  30,
  'active',
  NOW(),
  NOW()
);

-- External (외부직)
INSERT INTO codes (
  id,
  code_type,
  code,
  name_en,
  name_ko,
  name_zh,
  name_vi,
  description_en,
  description_ko,
  description_zh,
  description_vi,
  "order",
  status,
  created_at,
  updated_at
) VALUES (
  'UC-EXTERNAL',
  'USER_CATEGORY',
  'external',
  'External User',
  '외부 사용자',
  '外部用户',
  'Người dùng bên ngoài',
  'External consultant or partner',
  '외부 컨설턴트 또는 파트너',
  '外部顾问或合作伙伴',
  'Cố vấn hoặc đối tác bên ngoài',
  40,
  'active',
  NOW(),
  NOW()
);

-- Admin (관리직)
INSERT INTO codes (
  id,
  code_type,
  code,
  name_en,
  name_ko,
  name_zh,
  name_vi,
  description_en,
  description_ko,
  description_zh,
  description_vi,
  "order",
  status,
  created_at,
  updated_at
) VALUES (
  'UC-ADMIN',
  'USER_CATEGORY',
  'admin',
  'Administrator',
  '관리직',
  '管理员',
  'Quản trị viên',
  'System administrator',
  '시스템 관리직',
  '系统管理员',
  'Quản trị viên hệ thống',
  50,
  'active',
  NOW(),
  NOW()
);

COMMIT;

-- Verification query
SELECT
  'User category codes:' as info;
SELECT
  code,
  name_en,
  name_ko,
  "order",
  status
FROM codes
WHERE code_type = 'USER_CATEGORY'
ORDER BY "order";
