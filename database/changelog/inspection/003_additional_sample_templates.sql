-- Additional Sample Data for checksheet_templates
-- 30건의 샘플 템플릿 데이터 (기존 3건 + 신규 27건)

-- ==========================================
-- 4. 환경점검 - 작업환경 측정
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
    'ENV-001',
    '작업환경 측정 체크리스트',
    '작업장 환경(온도, 습도, 소음 등)을 측정하기 위한 체크리스트입니다.',
    '환경점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 5. 환경점검 - 대기질 점검
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8b',
    'ENV-002',
    '대기질 점검 체크리스트',
    '실내 공기질 및 유해물질 농도를 점검하기 위한 체크리스트입니다.',
    '환경점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 6. 위생점검 - 식품위생
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b',
    'HYG-001',
    '식품위생 점검 체크리스트',
    '식품 취급 시설의 위생 상태를 점검하기 위한 체크리스트입니다.',
    '위생점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 7. 위생점검 - 개인위생
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9c',
    'HYG-002',
    '개인위생 점검 체크리스트',
    '작업자 개인위생 상태를 점검하기 위한 체크리스트입니다.',
    '위생점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 8. 소방점검 - 소방시설
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c',
    'FIRE-001',
    '소방시설 점검 체크리스트',
    '소방시설(소화기, 스프링클러, 비상벨 등)을 점검하기 위한 체크리스트입니다.',
    '소방점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 9. 소방점검 - 피난시설
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0d',
    'FIRE-002',
    '피난시설 점검 체크리스트',
    '피난시설(비상구, 유도등, 피난계단 등)을 점검하기 위한 체크리스트입니다.',
    '소방점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 10. 전기점검 - 전기설비 안전
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d',
    'ELEC-001',
    '전기설비 안전점검 체크리스트',
    '전기설비의 안전 상태를 점검하기 위한 체크리스트입니다.',
    '전기점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 11. 전기점검 - 배전반 점검
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1e',
    'ELEC-002',
    '배전반 점검 체크리스트',
    '배전반 및 수배전설비 상태를 점검하기 위한 체크리스트입니다.',
    '전기점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 12. 설비점검 - 공조설비
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e',
    'EQUIP-002',
    '공조설비 점검 체크리스트',
    '냉난방 및 환기 설비를 점검하기 위한 체크리스트입니다.',
    '설비점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 13. 설비점검 - 배관설비
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2f',
    'EQUIP-003',
    '배관설비 점검 체크리스트',
    '급수, 배수, 가스 배관 상태를 점검하기 위한 체크리스트입니다.',
    '설비점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 14. 설비점검 - 승강기
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d30',
    'EQUIP-004',
    '승강기 점검 체크리스트',
    '엘리베이터 및 에스컬레이터 안전 상태를 점검하기 위한 체크리스트입니다.',
    '설비점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 15. 일상점검 - 일일점검
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f',
    'DAILY-001',
    '일일점검 체크리스트',
    '매일 실시하는 기본 시설점검 체크리스트입니다.',
    '일상점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 16. 일상점검 - 청소상태
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e40',
    'DAILY-002',
    '청소상태 점검 체크리스트',
    '시설 청소 및 정리정돈 상태를 점검하기 위한 체크리스트입니다.',
    '일상점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 17. 정기점검 - 월간점검
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f40',
    'MONTHLY-001',
    '월간점검 체크리스트',
    '매월 실시하는 정기 시설점검 체크리스트입니다.',
    '정기점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 18. 정기점검 - 분기점검
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f41',
    'QUARTERLY-001',
    '분기점검 체크리스트',
    '분기별로 실시하는 정기 시설점검 체크리스트입니다.',
    '정기점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 19. 정기점검 - 연간점검
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f42',
    'ANNUAL-001',
    '연간점검 체크리스트',
    '연간 실시하는 종합 시설점검 체크리스트입니다.',
    '정기점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 20. 품질검사 - 입고검사
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a50',
    'QUAL-002',
    '입고검사 체크리스트',
    '자재 및 부품 입고 시 품질검사를 위한 체크리스트입니다.',
    '품질검사',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 21. 품질검사 - 공정검사
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a51',
    'QUAL-003',
    '공정검사 체크리스트',
    '생산 공정 중 품질검사를 위한 체크리스트입니다.',
    '품질검사',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 22. 품질검사 - 출하검사
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a52',
    'QUAL-004',
    '출하검사 체크리스트',
    '제품 출하 전 최종 품질검사를 위한 체크리스트입니다.',
    '품질검사',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 23. 안전점검 - 위험물 저장소
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b60',
    'SAFETY-002',
    '위험물 저장소 점검 체크리스트',
    '위험물 저장시설의 안전 상태를 점검하기 위한 체크리스트입니다.',
    '안전점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 24. 안전점검 - 고소작업
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b61',
    'SAFETY-003',
    '고소작업 안전점검 체크리스트',
    '고소작업 전 안전 상태를 점검하기 위한 체크리스트입니다.',
    '안전점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 25. 안전점검 - 밀폐공간
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b62',
    'SAFETY-004',
    '밀폐공간 작업 점검 체크리스트',
    '밀폐공간 진입 전 안전 상태를 점검하기 위한 체크리스트입니다.',
    '안전점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 26. 안전점검 - 화기작업
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b63',
    'SAFETY-005',
    '화기작업 안전점검 체크리스트',
    '용접, 절단 등 화기작업 전 안전 상태를 점검하기 위한 체크리스트입니다.',
    '안전점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 27. 차량점검 - 차량 일상점검
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c70',
    'VEH-001',
    '차량 일상점검 체크리스트',
    '업무용 차량의 일상 점검을 위한 체크리스트입니다.',
    '차량점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 28. 차량점검 - 지게차 점검
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c71',
    'VEH-002',
    '지게차 점검 체크리스트',
    '지게차 운행 전 안전점검을 위한 체크리스트입니다.',
    '차량점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 29. 건물점검 - 건물외관 점검
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'b4c5d6e7-f8a9-7b8c-1d2e-3f4a5b6c7d80',
    'BLDG-001',
    '건물외관 점검 체크리스트',
    '건물 외벽, 지붕, 창호 등 외관 상태를 점검하기 위한 체크리스트입니다.',
    '건물점검',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 30. 건물점검 - 옥상 점검
-- ==========================================
INSERT INTO checksheet_templates (id, code, name, description, category, status)
VALUES (
    'b4c5d6e7-f8a9-7b8c-1d2e-3f4a5b6c7d81',
    'BLDG-002',
    '옥상 점검 체크리스트',
    '옥상 방수, 배수, 안전시설 상태를 점검하기 위한 체크리스트입니다.',
    '건물점검',
    'active'
) ON CONFLICT (code) DO NOTHING;
