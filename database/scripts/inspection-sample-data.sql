-- ============================================================
-- Sample Inspection Templates and Items
-- ============================================================

-- 1. Templates
INSERT INTO checksheet_templates (id, code, name, description, category, version, status, created_by, created_at, updated_at)
VALUES
('tpl-001', 'TPL-SAFETY-DAILY', '일일 안전 점검', '매일 수행하는 기본 안전 점검 체크리스트', 'safety', 1, 'active', 'user-001', NOW(), NOW()),
('tpl-002', 'TPL-EQUIP-MAINT', '설비 유지보수 점검', '정기 설비 유지보수 점검 체크리스트', 'equipment', 1, 'active', 'user-001', NOW(), NOW()),
('tpl-003', 'TPL-QUALITY-AUDIT', '품질 감사 체크리스트', '제품 품질 감사용 체크리스트', 'quality', 1, 'active', 'user-001', NOW(), NOW()),
('tpl-004', 'TPL-FIRE-SAFETY', '소방 안전 점검', '월간 소방 설비 점검 체크리스트', 'safety', 1, 'active', 'user-001', NOW(), NOW()),
('tpl-005', 'TPL-CLEAN-CHECK', '청결 점검', '작업장 청결 상태 점검 체크리스트', 'environment', 1, 'active', 'user-001', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 2. Items for Daily Safety Inspection (tpl-001)
INSERT INTO checksheet_items (id, template_id, parent_id, sort_order, item_code, item_name, item_type, options, required, description, created_at)
VALUES
-- Section: Personal Protective Equipment
('item-001-01', 'tpl-001', NULL, 1, 'SEC-PPE', '개인 보호구 착용 상태', 'section', NULL, false, '개인 보호구 관련 점검 항목', NOW()),
('item-001-02', 'tpl-001', 'item-001-01', 2, 'PPE-001', '안전모 착용 여부', 'checkbox', NULL, true, '안전모 정상 착용 확인', NOW()),
('item-001-03', 'tpl-001', 'item-001-01', 3, 'PPE-002', '안전화 착용 여부', 'checkbox', NULL, true, '안전화 정상 착용 확인', NOW()),
('item-001-04', 'tpl-001', 'item-001-01', 4, 'PPE-003', '보안경 착용 여부', 'checkbox', NULL, false, '필요시 보안경 착용 확인', NOW()),
('item-001-05', 'tpl-001', 'item-001-01', 5, 'PPE-004', '안전 장갑 착용', 'select', '["양호", "보통", "불량", "해당없음"]', true, '안전 장갑 상태 확인', NOW()),
-- Section: Work Area Safety
('item-001-06', 'tpl-001', NULL, 6, 'SEC-AREA', '작업장 안전 상태', 'section', NULL, false, '작업장 안전 관련 점검 항목', NOW()),
('item-001-07', 'tpl-001', 'item-001-06', 7, 'AREA-001', '통로 정리 상태', 'select', '["양호", "보통", "불량"]', true, '통로에 장애물 없음 확인', NOW()),
('item-001-08', 'tpl-001', 'item-001-06', 8, 'AREA-002', '비상구 확보 상태', 'checkbox', NULL, true, '비상구 접근 가능 여부', NOW()),
('item-001-09', 'tpl-001', 'item-001-06', 9, 'AREA-003', '조명 상태', 'select', '["양호", "보통", "불량"]', true, '작업장 조명 밝기 확인', NOW()),
('item-001-10', 'tpl-001', 'item-001-06', 10, 'AREA-004', '환기 상태', 'select', '["양호", "보통", "불량"]', false, '환기 시설 가동 상태', NOW()),
-- Section: Comments
('item-001-11', 'tpl-001', NULL, 11, 'SEC-COMMENT', '기타 사항', 'section', NULL, false, '추가 의견 및 특이사항', NOW()),
('item-001-12', 'tpl-001', 'item-001-11', 12, 'COMMENT-001', '특이사항', 'text', NULL, false, '점검 중 발견된 특이사항 기록', NOW()),
('item-001-13', 'tpl-001', 'item-001-11', 13, 'COMMENT-002', '개선 필요 사항', 'textarea', NULL, false, '개선이 필요한 사항 상세 기록', NOW())
ON CONFLICT (id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  item_type = EXCLUDED.item_type,
  options = EXCLUDED.options;

-- 3. Items for Equipment Maintenance (tpl-002)
INSERT INTO checksheet_items (id, template_id, parent_id, sort_order, item_code, item_name, item_type, options, required, description, created_at)
VALUES
('item-002-01', 'tpl-002', NULL, 1, 'SEC-VISUAL', '외관 점검', 'section', NULL, false, '설비 외관 상태 점검', NOW()),
('item-002-02', 'tpl-002', 'item-002-01', 2, 'VIS-001', '외관 손상 여부', 'select', '["정상", "경미한 손상", "심각한 손상"]', true, '설비 외관 손상 확인', NOW()),
('item-002-03', 'tpl-002', 'item-002-01', 3, 'VIS-002', '누유 여부', 'checkbox', NULL, true, '오일 누출 확인', NOW()),
('item-002-04', 'tpl-002', 'item-002-01', 4, 'VIS-003', '이상 소음', 'checkbox', NULL, true, '비정상 소음 발생 여부', NOW()),
('item-002-05', 'tpl-002', NULL, 5, 'SEC-FUNC', '기능 점검', 'section', NULL, false, '설비 기능 상태 점검', NOW()),
('item-002-06', 'tpl-002', 'item-002-05', 6, 'FUNC-001', '정상 가동 여부', 'select', '["정상", "부분 이상", "가동 불가"]', true, '설비 정상 가동 확인', NOW()),
('item-002-07', 'tpl-002', 'item-002-05', 7, 'FUNC-002', '계기판 표시', 'select', '["정상", "이상"]', true, '계기판 정상 표시 확인', NOW()),
('item-002-08', 'tpl-002', 'item-002-05', 8, 'FUNC-003', '안전장치 작동', 'checkbox', NULL, true, '안전장치 정상 작동 확인', NOW()),
('item-002-09', 'tpl-002', NULL, 9, 'SEC-MEAS', '측정값 기록', 'section', NULL, false, '주요 측정값 기록', NOW()),
('item-002-10', 'tpl-002', 'item-002-09', 10, 'MEAS-001', '온도 (C)', 'number', NULL, false, '설비 온도 측정값', NOW()),
('item-002-11', 'tpl-002', 'item-002-09', 11, 'MEAS-002', '압력 (bar)', 'number', NULL, false, '설비 압력 측정값', NOW()),
('item-002-12', 'tpl-002', 'item-002-09', 12, 'MEAS-003', '진동 레벨', 'select', '["정상", "주의", "위험"]', false, '진동 측정 결과', NOW())
ON CONFLICT (id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  item_type = EXCLUDED.item_type,
  options = EXCLUDED.options;

-- 4. Items for Quality Audit (tpl-003)
INSERT INTO checksheet_items (id, template_id, parent_id, sort_order, item_code, item_name, item_type, options, required, description, created_at)
VALUES
('item-003-01', 'tpl-003', NULL, 1, 'SEC-DOC', '문서 관리', 'section', NULL, false, '문서 관리 상태 점검', NOW()),
('item-003-02', 'tpl-003', 'item-003-01', 2, 'DOC-001', '작업 표준서 구비', 'checkbox', NULL, true, '최신 작업 표준서 비치 여부', NOW()),
('item-003-03', 'tpl-003', 'item-003-01', 3, 'DOC-002', '품질 기록 관리', 'select', '["우수", "양호", "보통", "미흡"]', true, '품질 기록 관리 상태', NOW()),
('item-003-04', 'tpl-003', NULL, 4, 'SEC-PROC', '공정 관리', 'section', NULL, false, '공정 관리 상태 점검', NOW()),
('item-003-05', 'tpl-003', 'item-003-04', 5, 'PROC-001', '공정 조건 준수', 'select', '["준수", "일부 미준수", "미준수"]', true, '규정된 공정 조건 준수 여부', NOW()),
('item-003-06', 'tpl-003', 'item-003-04', 6, 'PROC-002', '검사 기준 적용', 'checkbox', NULL, true, '검사 기준 적용 여부', NOW()),
('item-003-07', 'tpl-003', NULL, 7, 'SEC-PROD', '제품 품질', 'section', NULL, false, '제품 품질 상태', NOW()),
('item-003-08', 'tpl-003', 'item-003-07', 8, 'PROD-001', '불량률 (%)', 'number', NULL, true, '현재 불량률 수치', NOW()),
('item-003-09', 'tpl-003', 'item-003-07', 9, 'PROD-002', '주요 불량 유형', 'text', NULL, false, '주요 불량 유형 기록', NOW())
ON CONFLICT (id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  item_type = EXCLUDED.item_type,
  options = EXCLUDED.options;

-- 5. Items for Fire Safety (tpl-004)
INSERT INTO checksheet_items (id, template_id, parent_id, sort_order, item_code, item_name, item_type, options, required, description, created_at)
VALUES
('item-004-01', 'tpl-004', NULL, 1, 'SEC-EXTG', '소화기 점검', 'section', NULL, false, '소화기 상태 점검', NOW()),
('item-004-02', 'tpl-004', 'item-004-01', 2, 'EXTG-001', '소화기 비치 상태', 'select', '["양호", "보통", "불량"]', true, '지정 위치 비치 여부', NOW()),
('item-004-03', 'tpl-004', 'item-004-01', 3, 'EXTG-002', '압력 게이지 정상', 'checkbox', NULL, true, '압력 게이지 녹색 범위 확인', NOW()),
('item-004-04', 'tpl-004', 'item-004-01', 4, 'EXTG-003', '유효 기간', 'date', NULL, true, '소화기 유효기간 확인', NOW()),
('item-004-05', 'tpl-004', NULL, 5, 'SEC-ALARM', '화재 경보 시스템', 'section', NULL, false, '화재 경보 시스템 점검', NOW()),
('item-004-06', 'tpl-004', 'item-004-05', 6, 'ALARM-001', '감지기 상태', 'select', '["정상", "점검 필요", "고장"]', true, '화재 감지기 상태', NOW()),
('item-004-07', 'tpl-004', 'item-004-05', 7, 'ALARM-002', '경보 테스트', 'checkbox', NULL, true, '경보 정상 작동 확인', NOW()),
('item-004-08', 'tpl-004', NULL, 8, 'SEC-EXIT', '피난 시설', 'section', NULL, false, '피난 시설 점검', NOW()),
('item-004-09', 'tpl-004', 'item-004-08', 9, 'EXIT-001', '비상구 표지판', 'checkbox', NULL, true, '비상구 표지판 점등 상태', NOW()),
('item-004-10', 'tpl-004', 'item-004-08', 10, 'EXIT-002', '피난 통로 확보', 'checkbox', NULL, true, '피난 통로 장애물 없음', NOW())
ON CONFLICT (id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  item_type = EXCLUDED.item_type,
  options = EXCLUDED.options;

-- 6. Items for Cleanliness Check (tpl-005)
INSERT INTO checksheet_items (id, template_id, parent_id, sort_order, item_code, item_name, item_type, options, required, description, created_at)
VALUES
('item-005-01', 'tpl-005', NULL, 1, 'SEC-FLOOR', '바닥 청결', 'section', NULL, false, '바닥 청결 상태', NOW()),
('item-005-02', 'tpl-005', 'item-005-01', 2, 'FLOOR-001', '바닥 청소 상태', 'select', '["우수", "양호", "보통", "불량"]', true, '바닥 청소 상태 확인', NOW()),
('item-005-03', 'tpl-005', 'item-005-01', 3, 'FLOOR-002', '오염 물질 제거', 'checkbox', NULL, true, '기름, 물 등 오염 제거 확인', NOW()),
('item-005-04', 'tpl-005', NULL, 4, 'SEC-WORK', '작업대 정리', 'section', NULL, false, '작업대 정리 상태', NOW()),
('item-005-05', 'tpl-005', 'item-005-04', 5, 'WORK-001', '작업대 청결', 'select', '["우수", "양호", "보통", "불량"]', true, '작업대 청결 상태', NOW()),
('item-005-06', 'tpl-005', 'item-005-04', 6, 'WORK-002', '공구 정리 정돈', 'checkbox', NULL, true, '공구 제자리 배치 확인', NOW()),
('item-005-07', 'tpl-005', NULL, 7, 'SEC-WASTE', '폐기물 관리', 'section', NULL, false, '폐기물 관리 상태', NOW()),
('item-005-08', 'tpl-005', 'item-005-07', 8, 'WASTE-001', '분리수거 상태', 'select', '["양호", "보통", "불량"]', true, '분리수거 준수 여부', NOW()),
('item-005-09', 'tpl-005', 'item-005-07', 9, 'WASTE-002', '쓰레기통 비움', 'checkbox', NULL, false, '쓰레기통 적정 용량 유지', NOW())
ON CONFLICT (id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  item_type = EXCLUDED.item_type,
  options = EXCLUDED.options;

-- Verify inserted data
SELECT '=== Templates ===' as info;
SELECT id, code, name, category, status FROM checksheet_templates ORDER BY id;

SELECT '=== Items Count by Template ===' as info;
SELECT t.code, t.name, COUNT(i.id) as item_count
FROM checksheet_templates t
LEFT JOIN checksheet_items i ON t.id = i.template_id
GROUP BY t.id, t.code, t.name
ORDER BY t.id;
