-- Sample Data for Inspection Service
-- This file contains sample checksheet templates and items for testing

-- ==========================================
-- Sample Checksheet Template: Safety Inspection
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'SAFETY-001',
    '안전점검 체크리스트',
    '작업장 안전 상태를 점검하기 위한 체크리스트입니다.',
    '안전점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- Safety Inspection Items
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 1, 'S-001', '소화기 비치 상태', 'checkbox', true, '소화기가 지정된 위치에 비치되어 있는지 확인'),
    ('11111111-1111-1111-1111-111111111112', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 2, 'S-002', '비상구 통로 확보', 'checkbox', true, '비상구까지 통로가 확보되어 있는지 확인'),
    ('11111111-1111-1111-1111-111111111113', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 3, 'S-003', '안전표지판 상태', 'select', true, '안전표지판이 잘 보이는지 확인'),
    ('11111111-1111-1111-1111-111111111114', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 4, 'S-004', '조도 측정값 (lux)', 'number', false, '작업장 조명 조도를 측정'),
    ('11111111-1111-1111-1111-111111111115', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 5, 'S-005', '현장 사진', 'photo', false, '점검 현장 사진 촬영'),
    ('11111111-1111-1111-1111-111111111116', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 6, 'S-006', '비고', 'text', false, '추가 의견이나 특이사항 기록')
ON CONFLICT DO NOTHING;

-- Update options for select item
UPDATE checksheet_items
SET options = '{"choices": [{"value": "good", "label": "양호"}, {"value": "fair", "label": "보통"}, {"value": "poor", "label": "불량"}]}'::jsonb
WHERE id = '11111111-1111-1111-1111-111111111113';

-- Update options for number item
UPDATE checksheet_items
SET options = '{"min": 0, "max": 2000, "unit": "lux"}'::jsonb
WHERE id = '11111111-1111-1111-1111-111111111114';

-- Update options for photo item
UPDATE checksheet_items
SET options = '{"maxPhotos": 5}'::jsonb
WHERE id = '11111111-1111-1111-1111-111111111115';

-- ==========================================
-- Sample Checksheet Template: Equipment Inspection
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
    'EQUIP-001',
    '설비점검 체크리스트',
    '생산 설비의 상태를 점검하기 위한 체크리스트입니다.',
    '설비점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- Equipment Inspection Items - Section 1: 전기 설비
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description)
VALUES
    ('22222222-2222-2222-2222-222222222221', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 1, 'E-SEC-1', '1. 전기 설비', 'checkbox', false, '전기 설비 점검 섹션'),
    ('22222222-2222-2222-2222-222222222222', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 2, 'E-001', '전원 차단기 정상 여부', 'checkbox', true, NULL),
    ('22222222-2222-2222-2222-222222222223', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 3, 'E-002', '접지 상태 확인', 'checkbox', true, NULL),
    ('22222222-2222-2222-2222-222222222224', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 4, 'E-003', '절연 저항 측정', 'number', true, NULL)
ON CONFLICT DO NOTHING;

-- Set parent for sub-items
UPDATE checksheet_items
SET parent_id = '22222222-2222-2222-2222-222222222221'
WHERE id IN ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222224');

-- Update options for number item
UPDATE checksheet_items
SET options = '{"min": 0, "max": 100, "unit": "MΩ"}'::jsonb
WHERE id = '22222222-2222-2222-2222-222222222224';

-- Equipment Inspection Items - Section 2: 기계 설비
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description)
VALUES
    ('22222222-2222-2222-2222-222222222231', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 5, 'M-SEC-1', '2. 기계 설비', 'checkbox', false, '기계 설비 점검 섹션'),
    ('22222222-2222-2222-2222-222222222232', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 6, 'M-001', '윤활유 상태', 'select', true, NULL),
    ('22222222-2222-2222-2222-222222222233', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 7, 'M-002', '진동 측정', 'number', false, NULL),
    ('22222222-2222-2222-2222-222222222234', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 8, 'M-003', '외관 상태', 'select', true, NULL),
    ('22222222-2222-2222-2222-222222222235', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 9, 'M-004', '설비 사진', 'photo', false, NULL)
ON CONFLICT DO NOTHING;

-- Set parent for sub-items
UPDATE checksheet_items
SET parent_id = '22222222-2222-2222-2222-222222222231'
WHERE id IN ('22222222-2222-2222-2222-222222222232', '22222222-2222-2222-2222-222222222233', '22222222-2222-2222-2222-222222222234', '22222222-2222-2222-2222-222222222235');

-- Update options for select items
UPDATE checksheet_items
SET options = '{"choices": [{"value": "sufficient", "label": "충분"}, {"value": "low", "label": "부족"}, {"value": "dirty", "label": "오염"}]}'::jsonb
WHERE id = '22222222-2222-2222-2222-222222222232';

UPDATE checksheet_items
SET options = '{"choices": [{"value": "good", "label": "양호"}, {"value": "fair", "label": "보통"}, {"value": "poor", "label": "불량"}, {"value": "repair", "label": "수리필요"}]}'::jsonb
WHERE id = '22222222-2222-2222-2222-222222222234';

-- Update options for number item
UPDATE checksheet_items
SET options = '{"min": 0, "max": 10, "unit": "mm/s"}'::jsonb
WHERE id = '22222222-2222-2222-2222-222222222233';

-- Signature and completion
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description)
VALUES
    ('22222222-2222-2222-2222-222222222240', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 10, 'SIG-001', '점검자 서명', 'signature', true, '점검 완료 후 서명'),
    ('22222222-2222-2222-2222-222222222241', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 11, 'NOTE-001', '종합 의견', 'text', false, '점검 결과에 대한 종합 의견')
ON CONFLICT DO NOTHING;

-- ==========================================
-- Sample Checksheet Template: Quality Inspection
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
    'QUAL-001',
    '품질검사 체크리스트',
    '제품 품질 검사를 위한 체크리스트입니다.',
    '품질검사',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- Quality Inspection Items
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description)
VALUES
    ('33333333-3333-3333-3333-333333333331', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 1, 'Q-001', '외관 검사', 'select', true, '제품 외관 상태 확인'),
    ('33333333-3333-3333-3333-333333333332', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 2, 'Q-002', '치수 측정 - 길이 (mm)', 'number', true, '제품 길이 측정'),
    ('33333333-3333-3333-3333-333333333333', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 3, 'Q-003', '치수 측정 - 폭 (mm)', 'number', true, '제품 폭 측정'),
    ('33333333-3333-3333-3333-333333333334', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 4, 'Q-004', '치수 측정 - 높이 (mm)', 'number', true, '제품 높이 측정'),
    ('33333333-3333-3333-3333-333333333335', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 5, 'Q-005', '무게 측정 (g)', 'number', false, '제품 무게 측정'),
    ('33333333-3333-3333-3333-333333333336', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 6, 'Q-006', '기능 테스트', 'checkbox', true, '제품 기능 정상 작동 여부'),
    ('33333333-3333-3333-3333-333333333337', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 7, 'Q-007', '검사 결과', 'select', true, '최종 검사 결과'),
    ('33333333-3333-3333-3333-333333333338', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 8, 'Q-008', '불량 사진', 'photo', false, '불량 발견 시 사진 촬영'),
    ('33333333-3333-3333-3333-333333333339', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 9, 'Q-009', '검사 일시', 'date', true, '검사 실시 일자'),
    ('33333333-3333-3333-3333-333333333340', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 10, 'Q-010', '비고', 'text', false, '추가 의견')
ON CONFLICT DO NOTHING;

-- Update options for select items
UPDATE checksheet_items
SET options = '{"choices": [{"value": "pass", "label": "양품"}, {"value": "minor", "label": "경결함"}, {"value": "major", "label": "중결함"}, {"value": "fail", "label": "불량"}]}'::jsonb
WHERE id IN ('33333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333337');

-- Update options for number items
UPDATE checksheet_items
SET options = '{"min": 0, "max": 1000, "unit": "mm"}'::jsonb
WHERE id IN ('33333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333334');

UPDATE checksheet_items
SET options = '{"min": 0, "max": 10000, "unit": "g"}'::jsonb
WHERE id = '33333333-3333-3333-3333-333333333335';
