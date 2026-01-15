-- Additional Sample Data for checksheet_items and inspections
-- 신규 27개 템플릿에 대한 점검 항목 및 점검 실시 샘플 데이터

-- ==========================================
-- ENV-001: 작업환경 측정 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0001-0001-0001-000000000001', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 1, 'ENV1-001', '온도 측정 (°C)', 'number', true, '작업장 온도 측정', '{"min": -10, "max": 50, "unit": "°C"}'::jsonb),
    ('44444444-0001-0001-0001-000000000002', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 2, 'ENV1-002', '습도 측정 (%)', 'number', true, '작업장 습도 측정', '{"min": 0, "max": 100, "unit": "%"}'::jsonb),
    ('44444444-0001-0001-0001-000000000003', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 3, 'ENV1-003', '소음 측정 (dB)', 'number', true, '작업장 소음 측정', '{"min": 0, "max": 150, "unit": "dB"}'::jsonb),
    ('44444444-0001-0001-0001-000000000004', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 4, 'ENV1-004', '조도 측정 (lux)', 'number', true, '작업장 조도 측정', '{"min": 0, "max": 2000, "unit": "lux"}'::jsonb),
    ('44444444-0001-0001-0001-000000000005', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 5, 'ENV1-005', '환기 상태', 'select', true, '환기 시설 작동 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "fair", "label": "보통"}, {"value": "poor", "label": "불량"}]}'::jsonb),
    ('44444444-0001-0001-0001-000000000006', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 6, 'ENV1-006', '측정 위치 사진', 'photo', false, '측정 위치 촬영', '{"maxPhotos": 3}'::jsonb),
    ('44444444-0001-0001-0001-000000000007', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 7, 'ENV1-007', '비고', 'text', false, '특이사항 기록', NULL)
ON CONFLICT DO NOTHING;

-- ==========================================
-- ENV-002: 대기질 점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0002-0001-0001-000000000001', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8b', 1, 'ENV2-001', 'CO2 농도 (ppm)', 'number', true, '이산화탄소 농도 측정', '{"min": 0, "max": 5000, "unit": "ppm"}'::jsonb),
    ('44444444-0002-0001-0001-000000000002', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8b', 2, 'ENV2-002', 'CO 농도 (ppm)', 'number', true, '일산화탄소 농도 측정', '{"min": 0, "max": 100, "unit": "ppm"}'::jsonb),
    ('44444444-0002-0001-0001-000000000003', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8b', 3, 'ENV2-003', '미세먼지 PM10 (㎍/㎥)', 'number', true, 'PM10 농도 측정', '{"min": 0, "max": 500, "unit": "㎍/㎥"}'::jsonb),
    ('44444444-0002-0001-0001-000000000004', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8b', 4, 'ENV2-004', '미세먼지 PM2.5 (㎍/㎥)', 'number', true, 'PM2.5 농도 측정', '{"min": 0, "max": 500, "unit": "㎍/㎥"}'::jsonb),
    ('44444444-0002-0001-0001-000000000005', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8b', 5, 'ENV2-005', '포름알데히드 (㎍/㎥)', 'number', false, '포름알데히드 농도 측정', '{"min": 0, "max": 200, "unit": "㎍/㎥"}'::jsonb),
    ('44444444-0002-0001-0001-000000000006', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8b', 6, 'ENV2-006', '종합 판정', 'select', true, '대기질 종합 판정', '{"choices": [{"value": "good", "label": "적합"}, {"value": "caution", "label": "주의"}, {"value": "fail", "label": "부적합"}]}'::jsonb)
ON CONFLICT DO NOTHING;

-- ==========================================
-- HYG-001: 식품위생 점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0003-0001-0001-000000000001', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 1, 'HYG1-001', '냉장고 온도 (°C)', 'number', true, '냉장고 내부 온도 확인', '{"min": -5, "max": 10, "unit": "°C"}'::jsonb),
    ('44444444-0003-0001-0001-000000000002', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 2, 'HYG1-002', '냉동고 온도 (°C)', 'number', true, '냉동고 내부 온도 확인', '{"min": -25, "max": -10, "unit": "°C"}'::jsonb),
    ('44444444-0003-0001-0001-000000000003', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 3, 'HYG1-003', '조리대 청결 상태', 'select', true, '조리대 청결 상태 확인', '{"choices": [{"value": "clean", "label": "청결"}, {"value": "normal", "label": "보통"}, {"value": "dirty", "label": "오염"}]}'::jsonb),
    ('44444444-0003-0001-0001-000000000004', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 4, 'HYG1-004', '식재료 유통기한 확인', 'checkbox', true, '유통기한 경과 식재료 유무', NULL),
    ('44444444-0003-0001-0001-000000000005', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 5, 'HYG1-005', '해충 방제 상태', 'select', true, '해충 방제 상태 확인', '{"choices": [{"value": "good", "label": "양호"}, {"value": "found", "label": "발견"}, {"value": "infestation", "label": "심각"}]}'::jsonb),
    ('44444444-0003-0001-0001-000000000006', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 6, 'HYG1-006', '세척제/소독제 비치', 'checkbox', true, '세척제 및 소독제 비치 확인', NULL),
    ('44444444-0003-0001-0001-000000000007', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 7, 'HYG1-007', '위생 상태 사진', 'photo', false, '위생 상태 촬영', '{"maxPhotos": 5}'::jsonb)
ON CONFLICT DO NOTHING;

-- ==========================================
-- HYG-002: 개인위생 점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0004-0001-0001-000000000001', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9c', 1, 'HYG2-001', '위생복 착용', 'checkbox', true, '위생복 착용 상태 확인', NULL),
    ('44444444-0004-0001-0001-000000000002', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9c', 2, 'HYG2-002', '위생모 착용', 'checkbox', true, '위생모 착용 상태 확인', NULL),
    ('44444444-0004-0001-0001-000000000003', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9c', 3, 'HYG2-003', '위생장갑 착용', 'checkbox', true, '위생장갑 착용 상태 확인', NULL),
    ('44444444-0004-0001-0001-000000000004', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9c', 4, 'HYG2-004', '손 세척 상태', 'select', true, '손 세척 상태 확인', '{"choices": [{"value": "clean", "label": "청결"}, {"value": "normal", "label": "보통"}, {"value": "dirty", "label": "불량"}]}'::jsonb),
    ('44444444-0004-0001-0001-000000000005', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9c', 5, 'HYG2-005', '손톱 상태', 'checkbox', true, '손톱 짧게 정리 여부', NULL),
    ('44444444-0004-0001-0001-000000000006', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9c', 6, 'HYG2-006', '악세사리 미착용', 'checkbox', true, '반지, 시계 등 악세사리 미착용 확인', NULL)
ON CONFLICT DO NOTHING;

-- ==========================================
-- FIRE-001: 소방시설 점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0005-0001-0001-000000000001', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 1, 'FIRE1-001', '소화기 비치 상태', 'select', true, '소화기 비치 및 상태 확인', '{"choices": [{"value": "good", "label": "양호"}, {"value": "expired", "label": "유효기간만료"}, {"value": "missing", "label": "미비치"}]}'::jsonb),
    ('44444444-0005-0001-0001-000000000002', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 2, 'FIRE1-002', '소화기 수량', 'number', true, '소화기 비치 수량', '{"min": 0, "max": 100, "unit": "개"}'::jsonb),
    ('44444444-0005-0001-0001-000000000003', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 3, 'FIRE1-003', '스프링클러 작동 상태', 'select', true, '스프링클러 작동 상태', '{"choices": [{"value": "normal", "label": "정상"}, {"value": "abnormal", "label": "이상"}, {"value": "na", "label": "해당없음"}]}'::jsonb),
    ('44444444-0005-0001-0001-000000000004', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 4, 'FIRE1-004', '화재감지기 상태', 'select', true, '화재감지기 작동 상태', '{"choices": [{"value": "normal", "label": "정상"}, {"value": "abnormal", "label": "이상"}]}'::jsonb),
    ('44444444-0005-0001-0001-000000000005', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 5, 'FIRE1-005', '비상벨 작동 확인', 'checkbox', true, '비상벨 작동 테스트', NULL),
    ('44444444-0005-0001-0001-000000000006', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 6, 'FIRE1-006', '소방시설 사진', 'photo', false, '소방시설 상태 촬영', '{"maxPhotos": 5}'::jsonb)
ON CONFLICT DO NOTHING;

-- ==========================================
-- FIRE-002: 피난시설 점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0006-0001-0001-000000000001', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0d', 1, 'FIRE2-001', '비상구 통로 확보', 'checkbox', true, '비상구 통로 장애물 유무', NULL),
    ('44444444-0006-0001-0001-000000000002', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0d', 2, 'FIRE2-002', '비상구 표지판 상태', 'select', true, '비상구 표지판 상태', '{"choices": [{"value": "visible", "label": "잘보임"}, {"value": "dim", "label": "어두움"}, {"value": "broken", "label": "고장"}]}'::jsonb),
    ('44444444-0006-0001-0001-000000000003', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0d', 3, 'FIRE2-003', '유도등 점등 상태', 'select', true, '유도등 점등 상태', '{"choices": [{"value": "on", "label": "정상점등"}, {"value": "off", "label": "소등"}, {"value": "flicker", "label": "깜빡임"}]}'::jsonb),
    ('44444444-0006-0001-0001-000000000004', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0d', 4, 'FIRE2-004', '피난계단 상태', 'select', true, '피난계단 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "blocked", "label": "장애물"}, {"value": "damaged", "label": "파손"}]}'::jsonb),
    ('44444444-0006-0001-0001-000000000005', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0d', 5, 'FIRE2-005', '피난 안내도 비치', 'checkbox', true, '피난 안내도 비치 여부', NULL)
ON CONFLICT DO NOTHING;

-- ==========================================
-- ELEC-001: 전기설비 안전점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0007-0001-0001-000000000001', 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 1, 'ELEC1-001', '전원 케이블 상태', 'select', true, '전원 케이블 피복 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "worn", "label": "마모"}, {"value": "damaged", "label": "손상"}]}'::jsonb),
    ('44444444-0007-0001-0001-000000000002', 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 2, 'ELEC1-002', '콘센트 상태', 'select', true, '콘센트 상태 확인', '{"choices": [{"value": "good", "label": "양호"}, {"value": "loose", "label": "헐거움"}, {"value": "damaged", "label": "손상"}]}'::jsonb),
    ('44444444-0007-0001-0001-000000000003', 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 3, 'ELEC1-003', '접지 상태', 'checkbox', true, '접지 연결 상태 확인', NULL),
    ('44444444-0007-0001-0001-000000000004', 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 4, 'ELEC1-004', '누전차단기 작동', 'checkbox', true, '누전차단기 작동 테스트', NULL),
    ('44444444-0007-0001-0001-000000000005', 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 5, 'ELEC1-005', '전압 측정 (V)', 'number', false, '전압 측정', '{"min": 0, "max": 500, "unit": "V"}'::jsonb),
    ('44444444-0007-0001-0001-000000000006', 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 6, 'ELEC1-006', '절연저항 (MΩ)', 'number', false, '절연저항 측정', '{"min": 0, "max": 1000, "unit": "MΩ"}'::jsonb)
ON CONFLICT DO NOTHING;

-- ==========================================
-- ELEC-002: 배전반 점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0008-0001-0001-000000000001', 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1e', 1, 'ELEC2-001', '배전반 외관 상태', 'select', true, '배전반 외관 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "rust", "label": "녹발생"}, {"value": "damaged", "label": "손상"}]}'::jsonb),
    ('44444444-0008-0001-0001-000000000002', 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1e', 2, 'ELEC2-002', '배전반 내부 청결', 'select', true, '배전반 내부 청결 상태', '{"choices": [{"value": "clean", "label": "청결"}, {"value": "dusty", "label": "먼지"}, {"value": "dirty", "label": "오염"}]}'::jsonb),
    ('44444444-0008-0001-0001-000000000003', 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1e', 3, 'ELEC2-003', '차단기 동작 상태', 'checkbox', true, '차단기 정상 동작 확인', NULL),
    ('44444444-0008-0001-0001-000000000004', 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1e', 4, 'ELEC2-004', '단자 조임 상태', 'checkbox', true, '단자 조임 상태 확인', NULL),
    ('44444444-0008-0001-0001-000000000005', 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1e', 5, 'ELEC2-005', '이상 발열 유무', 'checkbox', true, '이상 발열 여부 확인', NULL),
    ('44444444-0008-0001-0001-000000000006', 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1e', 6, 'ELEC2-006', '배전반 사진', 'photo', false, '배전반 상태 촬영', '{"maxPhotos": 3}'::jsonb)
ON CONFLICT DO NOTHING;

-- ==========================================
-- EQUIP-002: 공조설비 점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0009-0001-0001-000000000001', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 1, 'EQUIP2-001', '에어컨 작동 상태', 'select', true, '에어컨 작동 상태', '{"choices": [{"value": "normal", "label": "정상"}, {"value": "weak", "label": "약함"}, {"value": "broken", "label": "고장"}]}'::jsonb),
    ('44444444-0009-0001-0001-000000000002', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 2, 'EQUIP2-002', '에어컨 필터 상태', 'select', true, '에어컨 필터 청결 상태', '{"choices": [{"value": "clean", "label": "청결"}, {"value": "dusty", "label": "먼지"}, {"value": "replace", "label": "교체필요"}]}'::jsonb),
    ('44444444-0009-0001-0001-000000000003', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 3, 'EQUIP2-003', '난방기 작동 상태', 'select', true, '난방기 작동 상태', '{"choices": [{"value": "normal", "label": "정상"}, {"value": "weak", "label": "약함"}, {"value": "broken", "label": "고장"}]}'::jsonb),
    ('44444444-0009-0001-0001-000000000004', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 4, 'EQUIP2-004', '환기팬 작동', 'checkbox', true, '환기팬 정상 작동 확인', NULL),
    ('44444444-0009-0001-0001-000000000005', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 5, 'EQUIP2-005', '덕트 상태', 'select', false, '덕트 상태 확인', '{"choices": [{"value": "good", "label": "양호"}, {"value": "leak", "label": "누기"}, {"value": "damaged", "label": "손상"}]}'::jsonb)
ON CONFLICT DO NOTHING;

-- ==========================================
-- EQUIP-003: 배관설비 점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0010-0001-0001-000000000001', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2f', 1, 'EQUIP3-001', '급수배관 누수', 'checkbox', true, '급수배관 누수 여부', NULL),
    ('44444444-0010-0001-0001-000000000002', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2f', 2, 'EQUIP3-002', '배수배관 막힘', 'checkbox', true, '배수배관 막힘 여부', NULL),
    ('44444444-0010-0001-0001-000000000003', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2f', 3, 'EQUIP3-003', '가스배관 상태', 'select', true, '가스배관 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "rust", "label": "부식"}, {"value": "leak", "label": "누출"}]}'::jsonb),
    ('44444444-0010-0001-0001-000000000004', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2f', 4, 'EQUIP3-004', '밸브 작동 상태', 'select', true, '밸브 작동 상태', '{"choices": [{"value": "normal", "label": "정상"}, {"value": "stiff", "label": "뻑뻑함"}, {"value": "broken", "label": "고장"}]}'::jsonb),
    ('44444444-0010-0001-0001-000000000005', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2f', 5, 'EQUIP3-005', '수압 (bar)', 'number', false, '수압 측정', '{"min": 0, "max": 10, "unit": "bar"}'::jsonb)
ON CONFLICT DO NOTHING;

-- ==========================================
-- EQUIP-004: 승강기 점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0011-0001-0001-000000000001', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d30', 1, 'EQUIP4-001', '승강기 작동 상태', 'select', true, '승강기 작동 상태', '{"choices": [{"value": "normal", "label": "정상"}, {"value": "noise", "label": "소음"}, {"value": "broken", "label": "고장"}]}'::jsonb),
    ('44444444-0011-0001-0001-000000000002', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d30', 2, 'EQUIP4-002', '문 개폐 상태', 'select', true, '문 개폐 상태', '{"choices": [{"value": "normal", "label": "정상"}, {"value": "slow", "label": "느림"}, {"value": "stuck", "label": "걸림"}]}'::jsonb),
    ('44444444-0011-0001-0001-000000000003', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d30', 3, 'EQUIP4-003', '비상정지 버튼', 'checkbox', true, '비상정지 버튼 작동 확인', NULL),
    ('44444444-0011-0001-0001-000000000004', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d30', 4, 'EQUIP4-004', '비상통화 장치', 'checkbox', true, '비상통화 장치 작동 확인', NULL),
    ('44444444-0011-0001-0001-000000000005', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d30', 5, 'EQUIP4-005', '층수 표시', 'checkbox', true, '층수 표시 정상 확인', NULL),
    ('44444444-0011-0001-0001-000000000006', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d30', 6, 'EQUIP4-006', '내부 조명', 'checkbox', true, '내부 조명 정상 확인', NULL)
ON CONFLICT DO NOTHING;

-- ==========================================
-- DAILY-001: 일일점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0012-0001-0001-000000000001', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 1, 'DAILY1-001', '출입문 잠금상태', 'checkbox', true, '출입문 잠금 확인', NULL),
    ('44444444-0012-0001-0001-000000000002', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 2, 'DAILY1-002', '창문 시건상태', 'checkbox', true, '창문 시건 확인', NULL),
    ('44444444-0012-0001-0001-000000000003', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 3, 'DAILY1-003', '조명 점등상태', 'checkbox', true, '조명 정상 점등 확인', NULL),
    ('44444444-0012-0001-0001-000000000004', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 4, 'DAILY1-004', '냉난방 가동상태', 'select', false, '냉난방 가동 상태', '{"choices": [{"value": "on", "label": "가동중"}, {"value": "off", "label": "정지"}, {"value": "auto", "label": "자동"}]}'::jsonb),
    ('44444444-0012-0001-0001-000000000005', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 5, 'DAILY1-005', '화장실 상태', 'select', true, '화장실 청결 상태', '{"choices": [{"value": "clean", "label": "청결"}, {"value": "normal", "label": "보통"}, {"value": "dirty", "label": "오염"}]}'::jsonb),
    ('44444444-0012-0001-0001-000000000006', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 6, 'DAILY1-006', '점검 시간', 'time', true, '점검 실시 시간', NULL)
ON CONFLICT DO NOTHING;

-- ==========================================
-- DAILY-002: 청소상태 점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0013-0001-0001-000000000001', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e40', 1, 'DAILY2-001', '바닥 청소상태', 'select', true, '바닥 청소 상태', '{"choices": [{"value": "clean", "label": "청결"}, {"value": "normal", "label": "보통"}, {"value": "dirty", "label": "오염"}]}'::jsonb),
    ('44444444-0013-0001-0001-000000000002', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e40', 2, 'DAILY2-002', '책상/테이블 정리', 'select', true, '책상/테이블 정리 상태', '{"choices": [{"value": "tidy", "label": "정돈"}, {"value": "normal", "label": "보통"}, {"value": "messy", "label": "어수선"}]}'::jsonb),
    ('44444444-0013-0001-0001-000000000003', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e40', 3, 'DAILY2-003', '쓰레기통 비움', 'checkbox', true, '쓰레기통 비움 확인', NULL),
    ('44444444-0013-0001-0001-000000000004', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e40', 4, 'DAILY2-004', '유리창 상태', 'select', false, '유리창 청결 상태', '{"choices": [{"value": "clean", "label": "청결"}, {"value": "smudged", "label": "얼룩"}, {"value": "dirty", "label": "오염"}]}'::jsonb),
    ('44444444-0013-0001-0001-000000000005', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e40', 5, 'DAILY2-005', '청소 완료 사진', 'photo', false, '청소 완료 상태 촬영', '{"maxPhotos": 3}'::jsonb)
ON CONFLICT DO NOTHING;

-- ==========================================
-- MONTHLY-001: 월간점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0014-0001-0001-000000000001', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f40', 1, 'MONTHLY-001', '소화기 점검', 'checkbox', true, '소화기 상태 점검', NULL),
    ('44444444-0014-0001-0001-000000000002', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f40', 2, 'MONTHLY-002', '비상구 점검', 'checkbox', true, '비상구 상태 점검', NULL),
    ('44444444-0014-0001-0001-000000000003', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f40', 3, 'MONTHLY-003', '전기시설 점검', 'checkbox', true, '전기시설 상태 점검', NULL),
    ('44444444-0014-0001-0001-000000000004', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f40', 4, 'MONTHLY-004', '공조시설 점검', 'checkbox', true, '공조시설 상태 점검', NULL),
    ('44444444-0014-0001-0001-000000000005', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f40', 5, 'MONTHLY-005', '위생시설 점검', 'checkbox', true, '위생시설 상태 점검', NULL),
    ('44444444-0014-0001-0001-000000000006', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f40', 6, 'MONTHLY-006', '종합 평가', 'select', true, '월간 종합 평가', '{"choices": [{"value": "excellent", "label": "우수"}, {"value": "good", "label": "양호"}, {"value": "fair", "label": "보통"}, {"value": "poor", "label": "미흡"}]}'::jsonb),
    ('44444444-0014-0001-0001-000000000007', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f40', 7, 'MONTHLY-007', '점검자 서명', 'signature', true, '점검 완료 서명', NULL)
ON CONFLICT DO NOTHING;

-- ==========================================
-- QUARTERLY-001: 분기점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0015-0001-0001-000000000001', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f41', 1, 'QUARTER-001', '건물 외관 점검', 'select', true, '건물 외관 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "fair", "label": "보통"}, {"value": "repair", "label": "보수필요"}]}'::jsonb),
    ('44444444-0015-0001-0001-000000000002', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f41', 2, 'QUARTER-002', '지붕/옥상 점검', 'select', true, '지붕/옥상 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "leak", "label": "누수"}, {"value": "damaged", "label": "손상"}]}'::jsonb),
    ('44444444-0015-0001-0001-000000000003', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f41', 3, 'QUARTER-003', '배수시설 점검', 'checkbox', true, '배수시설 점검 완료', NULL),
    ('44444444-0015-0001-0001-000000000004', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f41', 4, 'QUARTER-004', '소방시설 점검', 'checkbox', true, '소방시설 점검 완료', NULL),
    ('44444444-0015-0001-0001-000000000005', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f41', 5, 'QUARTER-005', '승강기 점검', 'checkbox', true, '승강기 점검 완료', NULL),
    ('44444444-0015-0001-0001-000000000006', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f41', 6, 'QUARTER-006', '개선 필요사항', 'text', false, '개선이 필요한 사항 기록', NULL)
ON CONFLICT DO NOTHING;

-- ==========================================
-- ANNUAL-001: 연간점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0016-0001-0001-000000000001', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f42', 1, 'ANNUAL-001', '구조안전점검', 'select', true, '건물 구조 안전 상태', '{"choices": [{"value": "safe", "label": "안전"}, {"value": "caution", "label": "주의"}, {"value": "danger", "label": "위험"}]}'::jsonb),
    ('44444444-0016-0001-0001-000000000002', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f42', 2, 'ANNUAL-002', '전기안전점검', 'select', true, '전기 안전 상태', '{"choices": [{"value": "pass", "label": "적합"}, {"value": "fail", "label": "부적합"}]}'::jsonb),
    ('44444444-0016-0001-0001-000000000003', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f42', 3, 'ANNUAL-003', '가스안전점검', 'select', true, '가스 안전 상태', '{"choices": [{"value": "pass", "label": "적합"}, {"value": "fail", "label": "부적합"}]}'::jsonb),
    ('44444444-0016-0001-0001-000000000004', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f42', 4, 'ANNUAL-004', '소방안전점검', 'select', true, '소방 안전 상태', '{"choices": [{"value": "pass", "label": "적합"}, {"value": "fail", "label": "부적합"}]}'::jsonb),
    ('44444444-0016-0001-0001-000000000005', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f42', 5, 'ANNUAL-005', '종합 판정', 'select', true, '연간 종합 판정', '{"choices": [{"value": "excellent", "label": "우수"}, {"value": "good", "label": "양호"}, {"value": "fair", "label": "보통"}, {"value": "poor", "label": "미흡"}]}'::jsonb),
    ('44444444-0016-0001-0001-000000000006', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f42', 6, 'ANNUAL-006', '점검 보고서', 'photo', true, '점검 보고서 첨부', '{"maxPhotos": 10}'::jsonb),
    ('44444444-0016-0001-0001-000000000007', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f42', 7, 'ANNUAL-007', '점검자 서명', 'signature', true, '점검 완료 서명', NULL)
ON CONFLICT DO NOTHING;

-- ==========================================
-- QUAL-002: 입고검사 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0017-0001-0001-000000000001', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a50', 1, 'QUAL2-001', '포장 상태', 'select', true, '포장 상태 확인', '{"choices": [{"value": "good", "label": "양호"}, {"value": "damaged", "label": "손상"}, {"value": "opened", "label": "개봉됨"}]}'::jsonb),
    ('44444444-0017-0001-0001-000000000002', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a50', 2, 'QUAL2-002', '수량 확인', 'number', true, '입고 수량', '{"min": 0, "max": 99999, "unit": "개"}'::jsonb),
    ('44444444-0017-0001-0001-000000000003', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a50', 3, 'QUAL2-003', '외관 검사', 'select', true, '외관 상태 확인', '{"choices": [{"value": "pass", "label": "합격"}, {"value": "fail", "label": "불합격"}]}'::jsonb),
    ('44444444-0017-0001-0001-000000000004', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a50', 4, 'QUAL2-004', '성적서 확인', 'checkbox', true, '성적서/인증서 확인', NULL),
    ('44444444-0017-0001-0001-000000000005', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a50', 5, 'QUAL2-005', '입고 판정', 'select', true, '최종 입고 판정', '{"choices": [{"value": "accept", "label": "합격"}, {"value": "conditional", "label": "조건부합격"}, {"value": "reject", "label": "불합격"}]}'::jsonb)
ON CONFLICT DO NOTHING;

-- ==========================================
-- QUAL-003: 공정검사 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0018-0001-0001-000000000001', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a51', 1, 'QUAL3-001', '공정명', 'text', true, '검사 공정명', NULL),
    ('44444444-0018-0001-0001-000000000002', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a51', 2, 'QUAL3-002', '작업 표준 준수', 'checkbox', true, '작업 표준 준수 여부', NULL),
    ('44444444-0018-0001-0001-000000000003', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a51', 3, 'QUAL3-003', '치수 검사', 'select', true, '치수 검사 결과', '{"choices": [{"value": "pass", "label": "합격"}, {"value": "fail", "label": "불합격"}]}'::jsonb),
    ('44444444-0018-0001-0001-000000000004', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a51', 4, 'QUAL3-004', '외관 검사', 'select', true, '외관 검사 결과', '{"choices": [{"value": "pass", "label": "합격"}, {"value": "fail", "label": "불합격"}]}'::jsonb),
    ('44444444-0018-0001-0001-000000000005', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a51', 5, 'QUAL3-005', '불량수량', 'number', false, '불량 발생 수량', '{"min": 0, "max": 9999, "unit": "개"}'::jsonb),
    ('44444444-0018-0001-0001-000000000006', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a51', 6, 'QUAL3-006', '공정 판정', 'select', true, '공정 검사 판정', '{"choices": [{"value": "pass", "label": "합격"}, {"value": "fail", "label": "불합격"}]}'::jsonb)
ON CONFLICT DO NOTHING;

-- ==========================================
-- QUAL-004: 출하검사 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0019-0001-0001-000000000001', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a52', 1, 'QUAL4-001', '제품명', 'text', true, '출하 제품명', NULL),
    ('44444444-0019-0001-0001-000000000002', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a52', 2, 'QUAL4-002', '출하 수량', 'number', true, '출하 수량', '{"min": 0, "max": 99999, "unit": "개"}'::jsonb),
    ('44444444-0019-0001-0001-000000000003', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a52', 3, 'QUAL4-003', '외관 검사', 'select', true, '외관 최종 검사', '{"choices": [{"value": "pass", "label": "합격"}, {"value": "fail", "label": "불합격"}]}'::jsonb),
    ('44444444-0019-0001-0001-000000000004', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a52', 4, 'QUAL4-004', '기능 검사', 'select', true, '기능 최종 검사', '{"choices": [{"value": "pass", "label": "합격"}, {"value": "fail", "label": "불합격"}]}'::jsonb),
    ('44444444-0019-0001-0001-000000000005', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a52', 5, 'QUAL4-005', '포장 상태', 'select', true, '포장 상태 확인', '{"choices": [{"value": "good", "label": "양호"}, {"value": "poor", "label": "불량"}]}'::jsonb),
    ('44444444-0019-0001-0001-000000000006', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a52', 6, 'QUAL4-006', '출하 승인', 'select', true, '최종 출하 승인', '{"choices": [{"value": "approved", "label": "승인"}, {"value": "hold", "label": "보류"}, {"value": "rejected", "label": "반려"}]}'::jsonb),
    ('44444444-0019-0001-0001-000000000007', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a52', 7, 'QUAL4-007', '검사자 서명', 'signature', true, '검사 완료 서명', NULL)
ON CONFLICT DO NOTHING;

-- ==========================================
-- SAFETY-002: 위험물 저장소 점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0020-0001-0001-000000000001', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b60', 1, 'SAFETY2-001', '저장소 시건 상태', 'checkbox', true, '저장소 잠금 상태 확인', NULL),
    ('44444444-0020-0001-0001-000000000002', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b60', 2, 'SAFETY2-002', '경고 표지판', 'checkbox', true, '경고 표지판 부착 확인', NULL),
    ('44444444-0020-0001-0001-000000000003', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b60', 3, 'SAFETY2-003', '환기 상태', 'select', true, '환기 시설 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "poor", "label": "불량"}]}'::jsonb),
    ('44444444-0020-0001-0001-000000000004', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b60', 4, 'SAFETY2-004', '누출 여부', 'checkbox', true, '위험물 누출 여부 확인', NULL),
    ('44444444-0020-0001-0001-000000000005', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b60', 5, 'SAFETY2-005', '소화기 비치', 'checkbox', true, '소화기 비치 확인', NULL),
    ('44444444-0020-0001-0001-000000000006', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b60', 6, 'SAFETY2-006', 'MSDS 비치', 'checkbox', true, 'MSDS 비치 확인', NULL)
ON CONFLICT DO NOTHING;

-- ==========================================
-- SAFETY-003: 고소작업 안전점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0021-0001-0001-000000000001', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b61', 1, 'SAFETY3-001', '작업 높이 (m)', 'number', true, '작업 높이', '{"min": 0, "max": 100, "unit": "m"}'::jsonb),
    ('44444444-0021-0001-0001-000000000002', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b61', 2, 'SAFETY3-002', '안전대 착용', 'checkbox', true, '안전대 착용 확인', NULL),
    ('44444444-0021-0001-0001-000000000003', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b61', 3, 'SAFETY3-003', '안전모 착용', 'checkbox', true, '안전모 착용 확인', NULL),
    ('44444444-0021-0001-0001-000000000004', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b61', 4, 'SAFETY3-004', '발판 상태', 'select', true, '발판/비계 상태', '{"choices": [{"value": "stable", "label": "안정"}, {"value": "unstable", "label": "불안정"}]}'::jsonb),
    ('44444444-0021-0001-0001-000000000005', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b61', 5, 'SAFETY3-005', '추락방지망', 'checkbox', true, '추락방지망 설치 확인', NULL),
    ('44444444-0021-0001-0001-000000000006', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b61', 6, 'SAFETY3-006', '날씨 조건', 'select', true, '작업 날씨 조건', '{"choices": [{"value": "clear", "label": "맑음"}, {"value": "windy", "label": "강풍"}, {"value": "rain", "label": "비"}]}'::jsonb)
ON CONFLICT DO NOTHING;

-- ==========================================
-- SAFETY-004: 밀폐공간 작업 점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0022-0001-0001-000000000001', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b62', 1, 'SAFETY4-001', '산소농도 (%)', 'number', true, '산소 농도 측정', '{"min": 0, "max": 25, "unit": "%"}'::jsonb),
    ('44444444-0022-0001-0001-000000000002', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b62', 2, 'SAFETY4-002', '유해가스 농도', 'select', true, '유해가스 농도', '{"choices": [{"value": "safe", "label": "안전"}, {"value": "caution", "label": "주의"}, {"value": "danger", "label": "위험"}]}'::jsonb),
    ('44444444-0022-0001-0001-000000000003', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b62', 3, 'SAFETY4-003', '환기 실시', 'checkbox', true, '환기 실시 여부', NULL),
    ('44444444-0022-0001-0001-000000000004', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b62', 4, 'SAFETY4-004', '감시인 배치', 'checkbox', true, '감시인 배치 확인', NULL),
    ('44444444-0022-0001-0001-000000000005', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b62', 5, 'SAFETY4-005', '구조장비 준비', 'checkbox', true, '구조장비 준비 확인', NULL),
    ('44444444-0022-0001-0001-000000000006', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b62', 6, 'SAFETY4-006', '출입허가증', 'checkbox', true, '출입허가증 발급 확인', NULL)
ON CONFLICT DO NOTHING;

-- ==========================================
-- SAFETY-005: 화기작업 안전점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0023-0001-0001-000000000001', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b63', 1, 'SAFETY5-001', '작업 유형', 'select', true, '화기작업 유형', '{"choices": [{"value": "welding", "label": "용접"}, {"value": "cutting", "label": "절단"}, {"value": "grinding", "label": "연마"}]}'::jsonb),
    ('44444444-0023-0001-0001-000000000002', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b63', 2, 'SAFETY5-002', '가연물 제거', 'checkbox', true, '주변 가연물 제거 확인', NULL),
    ('44444444-0023-0001-0001-000000000003', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b63', 3, 'SAFETY5-003', '소화기 준비', 'checkbox', true, '소화기 준비 확인', NULL),
    ('44444444-0023-0001-0001-000000000004', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b63', 4, 'SAFETY5-004', '화기감시인', 'checkbox', true, '화기감시인 배치 확인', NULL),
    ('44444444-0023-0001-0001-000000000005', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b63', 5, 'SAFETY5-005', '보호구 착용', 'checkbox', true, '보호구 착용 확인', NULL),
    ('44444444-0023-0001-0001-000000000006', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b63', 6, 'SAFETY5-006', '화기작업 허가서', 'checkbox', true, '화기작업 허가서 발급 확인', NULL)
ON CONFLICT DO NOTHING;

-- ==========================================
-- VEH-001: 차량 일상점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0024-0001-0001-000000000001', 'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c70', 1, 'VEH1-001', '엔진오일 상태', 'select', true, '엔진오일 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "low", "label": "부족"}, {"value": "dirty", "label": "오염"}]}'::jsonb),
    ('44444444-0024-0001-0001-000000000002', 'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c70', 2, 'VEH1-002', '냉각수 상태', 'select', true, '냉각수 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "low", "label": "부족"}]}'::jsonb),
    ('44444444-0024-0001-0001-000000000003', 'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c70', 3, 'VEH1-003', '타이어 상태', 'select', true, '타이어 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "worn", "label": "마모"}, {"value": "flat", "label": "펑크"}]}'::jsonb),
    ('44444444-0024-0001-0001-000000000004', 'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c70', 4, 'VEH1-004', '브레이크 작동', 'checkbox', true, '브레이크 정상 작동 확인', NULL),
    ('44444444-0024-0001-0001-000000000005', 'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c70', 5, 'VEH1-005', '등화장치', 'checkbox', true, '등화장치 정상 작동 확인', NULL),
    ('44444444-0024-0001-0001-000000000006', 'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c70', 6, 'VEH1-006', '주행거리 (km)', 'number', true, '현재 주행거리', '{"min": 0, "max": 999999, "unit": "km"}'::jsonb)
ON CONFLICT DO NOTHING;

-- ==========================================
-- VEH-002: 지게차 점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0025-0001-0001-000000000001', 'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c71', 1, 'VEH2-001', '포크 상태', 'select', true, '포크 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "bent", "label": "휨"}, {"value": "cracked", "label": "균열"}]}'::jsonb),
    ('44444444-0025-0001-0001-000000000002', 'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c71', 2, 'VEH2-002', '마스트 작동', 'checkbox', true, '마스트 정상 작동 확인', NULL),
    ('44444444-0025-0001-0001-000000000003', 'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c71', 3, 'VEH2-003', '유압장치', 'select', true, '유압장치 상태', '{"choices": [{"value": "normal", "label": "정상"}, {"value": "leak", "label": "누유"}]}'::jsonb),
    ('44444444-0025-0001-0001-000000000004', 'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c71', 4, 'VEH2-004', '경적/경광등', 'checkbox', true, '경적/경광등 작동 확인', NULL),
    ('44444444-0025-0001-0001-000000000005', 'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c71', 5, 'VEH2-005', '안전벨트', 'checkbox', true, '안전벨트 상태 확인', NULL),
    ('44444444-0025-0001-0001-000000000006', 'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c71', 6, 'VEH2-006', '헤드가드', 'checkbox', true, '헤드가드 상태 확인', NULL)
ON CONFLICT DO NOTHING;

-- ==========================================
-- BLDG-001: 건물외관 점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0026-0001-0001-000000000001', 'b4c5d6e7-f8a9-7b8c-1d2e-3f4a5b6c7d80', 1, 'BLDG1-001', '외벽 상태', 'select', true, '외벽 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "crack", "label": "균열"}, {"value": "peeling", "label": "박리"}]}'::jsonb),
    ('44444444-0026-0001-0001-000000000002', 'b4c5d6e7-f8a9-7b8c-1d2e-3f4a5b6c7d80', 2, 'BLDG1-002', '창호 상태', 'select', true, '창호 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "damaged", "label": "손상"}, {"value": "broken", "label": "파손"}]}'::jsonb),
    ('44444444-0026-0001-0001-000000000003', 'b4c5d6e7-f8a9-7b8c-1d2e-3f4a5b6c7d80', 3, 'BLDG1-003', '간판/사인물', 'select', true, '간판/사인물 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "faded", "label": "탈색"}, {"value": "loose", "label": "흔들림"}]}'::jsonb),
    ('44444444-0026-0001-0001-000000000004', 'b4c5d6e7-f8a9-7b8c-1d2e-3f4a5b6c7d80', 4, 'BLDG1-004', '우수관 상태', 'checkbox', true, '우수관 정상 확인', NULL),
    ('44444444-0026-0001-0001-000000000005', 'b4c5d6e7-f8a9-7b8c-1d2e-3f4a5b6c7d80', 5, 'BLDG1-005', '외관 사진', 'photo', false, '건물 외관 촬영', '{"maxPhotos": 5}'::jsonb)
ON CONFLICT DO NOTHING;

-- ==========================================
-- BLDG-002: 옥상 점검 체크리스트 항목
-- ==========================================
INSERT INTO checksheet_items (id, template_id, sort_order, item_code, item_name, item_type, required, description, options)
VALUES
    ('44444444-0027-0001-0001-000000000001', 'b4c5d6e7-f8a9-7b8c-1d2e-3f4a5b6c7d81', 1, 'BLDG2-001', '방수층 상태', 'select', true, '방수층 상태', '{"choices": [{"value": "good", "label": "양호"}, {"value": "crack", "label": "균열"}, {"value": "leak", "label": "누수"}]}'::jsonb),
    ('44444444-0027-0001-0001-000000000002', 'b4c5d6e7-f8a9-7b8c-1d2e-3f4a5b6c7d81', 2, 'BLDG2-002', '배수구 상태', 'select', true, '배수구 상태', '{"choices": [{"value": "clear", "label": "원활"}, {"value": "blocked", "label": "막힘"}]}'::jsonb),
    ('44444444-0027-0001-0001-000000000003', 'b4c5d6e7-f8a9-7b8c-1d2e-3f4a5b6c7d81', 3, 'BLDG2-003', '안전난간', 'checkbox', true, '안전난간 상태 확인', NULL),
    ('44444444-0027-0001-0001-000000000004', 'b4c5d6e7-f8a9-7b8c-1d2e-3f4a5b6c7d81', 4, 'BLDG2-004', '출입문 잠금', 'checkbox', true, '옥상 출입문 잠금 확인', NULL),
    ('44444444-0027-0001-0001-000000000005', 'b4c5d6e7-f8a9-7b8c-1d2e-3f4a5b6c7d81', 5, 'BLDG2-005', '옥상 사진', 'photo', false, '옥상 상태 촬영', '{"maxPhotos": 5}'::jsonb)
ON CONFLICT DO NOTHING;


-- ==========================================
-- 점검 실시 샘플 데이터 (inspections)
-- ==========================================

-- 안전점검 실시 샘플
INSERT INTO inspections (id, template_id, inspection_code, target_name, target_id, status, started_at, completed_at, location, notes, sync_status)
VALUES
    ('55555555-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'INS-2024-0001', 'A동 1층', 'AREA-A1', 'completed', '2024-12-01 09:00:00+09', '2024-12-01 10:30:00+09', '본사 A동 1층', '정기 안전점검 완료', 'synced'),
    ('55555555-0001-0001-0001-000000000002', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'INS-2024-0002', 'A동 2층', 'AREA-A2', 'completed', '2024-12-01 11:00:00+09', '2024-12-01 12:00:00+09', '본사 A동 2층', NULL, 'synced'),
    ('55555555-0001-0001-0001-000000000003', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'INS-2024-0003', 'B동 1층', 'AREA-B1', 'in_progress', '2024-12-15 09:00:00+09', NULL, '본사 B동 1층', '점검 진행 중', 'pending')
ON CONFLICT (inspection_code) DO NOTHING;

-- 설비점검 실시 샘플
INSERT INTO inspections (id, template_id, inspection_code, target_name, target_id, status, started_at, completed_at, location, notes, sync_status)
VALUES
    ('55555555-0002-0001-0001-000000000001', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'INS-2024-0004', 'CNC 선반 #1', 'EQ-CNC-001', 'completed', '2024-12-02 08:00:00+09', '2024-12-02 09:30:00+09', '생산동 1라인', '정기 설비점검 완료', 'synced'),
    ('55555555-0002-0001-0001-000000000002', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'INS-2024-0005', 'CNC 선반 #2', 'EQ-CNC-002', 'completed', '2024-12-02 10:00:00+09', '2024-12-02 11:30:00+09', '생산동 1라인', NULL, 'synced'),
    ('55555555-0002-0001-0001-000000000003', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'INS-2024-0006', '프레스 #1', 'EQ-PRESS-001', 'draft', NULL, NULL, '생산동 2라인', '점검 예정', 'synced')
ON CONFLICT (inspection_code) DO NOTHING;

-- 품질검사 실시 샘플
INSERT INTO inspections (id, template_id, inspection_code, target_name, target_id, status, started_at, completed_at, location, notes, sync_status)
VALUES
    ('55555555-0003-0001-0001-000000000001', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'INS-2024-0007', '부품 A-100', 'PROD-A100-001', 'completed', '2024-12-03 14:00:00+09', '2024-12-03 14:30:00+09', '품질검사실', '합격 처리', 'synced'),
    ('55555555-0003-0001-0001-000000000002', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'INS-2024-0008', '부품 A-100', 'PROD-A100-002', 'completed', '2024-12-03 15:00:00+09', '2024-12-03 15:30:00+09', '품질검사실', '불합격 - 치수 불량', 'synced'),
    ('55555555-0003-0001-0001-000000000003', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'INS-2024-0009', '부품 B-200', 'PROD-B200-001', 'submitted', '2024-12-04 09:00:00+09', '2024-12-04 09:45:00+09', '품질검사실', '검사 완료, 승인 대기', 'synced')
ON CONFLICT (inspection_code) DO NOTHING;

-- 환경점검 실시 샘플
INSERT INTO inspections (id, template_id, inspection_code, target_name, target_id, status, started_at, completed_at, location, notes, sync_status)
VALUES
    ('55555555-0004-0001-0001-000000000001', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'INS-2024-0010', '생산동 작업환경', 'AREA-PROD', 'completed', '2024-12-05 10:00:00+09', '2024-12-05 11:00:00+09', '생산동', '작업환경 측정 완료', 'synced'),
    ('55555555-0004-0001-0001-000000000002', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8b', 'INS-2024-0011', '사무동 대기질', 'AREA-OFFICE', 'completed', '2024-12-05 14:00:00+09', '2024-12-05 15:00:00+09', '사무동', '대기질 측정 완료', 'synced')
ON CONFLICT (inspection_code) DO NOTHING;

-- 소방점검 실시 샘플
INSERT INTO inspections (id, template_id, inspection_code, target_name, target_id, status, started_at, completed_at, location, notes, sync_status)
VALUES
    ('55555555-0005-0001-0001-000000000001', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'INS-2024-0012', '본사 소방시설', 'FIRE-HQ', 'completed', '2024-12-06 09:00:00+09', '2024-12-06 12:00:00+09', '본사 전체', '월간 소방점검 완료', 'synced'),
    ('55555555-0005-0001-0001-000000000002', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0d', 'INS-2024-0013', '본사 피난시설', 'EVAC-HQ', 'completed', '2024-12-06 14:00:00+09', '2024-12-06 16:00:00+09', '본사 전체', '피난시설 점검 완료', 'synced')
ON CONFLICT (inspection_code) DO NOTHING;

-- 일상점검 실시 샘플
INSERT INTO inspections (id, template_id, inspection_code, target_name, target_id, status, started_at, completed_at, location, notes, sync_status)
VALUES
    ('55555555-0006-0001-0001-000000000001', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'INS-2024-0014', '12월 10일 일일점검', 'DAILY-1210', 'completed', '2024-12-10 08:00:00+09', '2024-12-10 08:30:00+09', '본사', '일일점검 완료', 'synced'),
    ('55555555-0006-0001-0001-000000000002', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'INS-2024-0015', '12월 11일 일일점검', 'DAILY-1211', 'completed', '2024-12-11 08:00:00+09', '2024-12-11 08:30:00+09', '본사', '일일점검 완료', 'synced'),
    ('55555555-0006-0001-0001-000000000003', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'INS-2024-0016', '12월 12일 일일점검', 'DAILY-1212', 'completed', '2024-12-12 08:00:00+09', '2024-12-12 08:30:00+09', '본사', NULL, 'synced'),
    ('55555555-0006-0001-0001-000000000004', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'INS-2024-0017', '12월 13일 일일점검', 'DAILY-1213', 'in_progress', '2024-12-13 08:00:00+09', NULL, '본사', '점검 진행 중', 'pending')
ON CONFLICT (inspection_code) DO NOTHING;

-- 차량점검 실시 샘플
INSERT INTO inspections (id, template_id, inspection_code, target_name, target_id, status, started_at, completed_at, location, notes, sync_status)
VALUES
    ('55555555-0007-0001-0001-000000000001', 'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c70', 'INS-2024-0018', '업무용 차량 01호', 'VEH-001', 'completed', '2024-12-08 07:30:00+09', '2024-12-08 07:45:00+09', '주차장', '출발 전 점검 완료', 'synced'),
    ('55555555-0007-0001-0001-000000000002', 'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c71', 'INS-2024-0019', '지게차 #1', 'FORK-001', 'completed', '2024-12-09 08:00:00+09', '2024-12-09 08:15:00+09', '창고', '작업 전 점검 완료', 'synced'),
    ('55555555-0007-0001-0001-000000000003', 'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c71', 'INS-2024-0020', '지게차 #2', 'FORK-002', 'completed', '2024-12-09 08:20:00+09', '2024-12-09 08:35:00+09', '창고', NULL, 'synced')
ON CONFLICT (inspection_code) DO NOTHING;

-- 위생점검 실시 샘플
INSERT INTO inspections (id, template_id, inspection_code, target_name, target_id, status, started_at, completed_at, location, notes, sync_status)
VALUES
    ('55555555-0008-0001-0001-000000000001', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'INS-2024-0021', '구내식당 위생점검', 'CAFE-001', 'completed', '2024-12-07 11:00:00+09', '2024-12-07 12:00:00+09', '구내식당', '식품위생 점검 완료', 'synced'),
    ('55555555-0008-0001-0001-000000000002', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9c', 'INS-2024-0022', '조리원 개인위생', 'STAFF-COOK', 'completed', '2024-12-07 10:00:00+09', '2024-12-07 10:30:00+09', '구내식당', '개인위생 점검 완료', 'synced')
ON CONFLICT (inspection_code) DO NOTHING;

-- 안전점검(특수) 실시 샘플
INSERT INTO inspections (id, template_id, inspection_code, target_name, target_id, status, started_at, completed_at, location, notes, sync_status)
VALUES
    ('55555555-0009-0001-0001-000000000001', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b60', 'INS-2024-0023', '위험물 저장소', 'HAZ-001', 'completed', '2024-12-10 14:00:00+09', '2024-12-10 15:00:00+09', '위험물 저장소', '위험물 저장소 점검 완료', 'synced'),
    ('55555555-0009-0001-0001-000000000002', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b61', 'INS-2024-0024', '옥상 방수공사', 'WORK-HIGH-001', 'completed', '2024-12-11 09:00:00+09', '2024-12-11 09:30:00+09', '본사 옥상', '고소작업 전 안전점검', 'synced'),
    ('55555555-0009-0001-0001-000000000003', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b62', 'INS-2024-0025', '정화조 점검', 'CONFINED-001', 'completed', '2024-12-12 10:00:00+09', '2024-12-12 10:30:00+09', '지하', '밀폐공간 작업 전 점검', 'synced'),
    ('55555555-0009-0001-0001-000000000004', 'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b63', 'INS-2024-0026', '배관 용접작업', 'HOT-WORK-001', 'completed', '2024-12-13 08:00:00+09', '2024-12-13 08:30:00+09', '기계실', '화기작업 전 안전점검', 'synced')
ON CONFLICT (inspection_code) DO NOTHING;

-- 건물점검 실시 샘플
INSERT INTO inspections (id, template_id, inspection_code, target_name, target_id, status, started_at, completed_at, location, notes, sync_status)
VALUES
    ('55555555-0010-0001-0001-000000000001', 'b4c5d6e7-f8a9-7b8c-1d2e-3f4a5b6c7d80', 'INS-2024-0027', '본사 건물외관', 'BLDG-HQ', 'completed', '2024-12-14 09:00:00+09', '2024-12-14 11:00:00+09', '본사', '건물외관 정기점검', 'synced'),
    ('55555555-0010-0001-0001-000000000002', 'b4c5d6e7-f8a9-7b8c-1d2e-3f4a5b6c7d81', 'INS-2024-0028', '본사 옥상', 'ROOF-HQ', 'completed', '2024-12-14 14:00:00+09', '2024-12-14 15:00:00+09', '본사 옥상', '옥상 정기점검', 'synced')
ON CONFLICT (inspection_code) DO NOTHING;

-- 정기점검 실시 샘플
INSERT INTO inspections (id, template_id, inspection_code, target_name, target_id, status, started_at, completed_at, location, notes, sync_status)
VALUES
    ('55555555-0011-0001-0001-000000000001', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f40', 'INS-2024-0029', '12월 월간점검', 'MONTHLY-DEC', 'completed', '2024-12-15 09:00:00+09', '2024-12-15 17:00:00+09', '본사 전체', '12월 월간 종합점검 완료', 'synced'),
    ('55555555-0011-0001-0001-000000000002', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f41', 'INS-2024-0030', '4분기 분기점검', 'QUARTERLY-Q4', 'in_progress', '2024-12-20 09:00:00+09', NULL, '본사 전체', '4분기 분기점검 진행 중', 'pending')
ON CONFLICT (inspection_code) DO NOTHING;
