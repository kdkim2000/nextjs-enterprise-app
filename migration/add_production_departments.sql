-- ==========================================
-- ADD PRODUCTION DIVISION DEPARTMENTS
-- ==========================================
-- Add 50 new departments under Production Division (DEPT-200)
-- Hierarchy: 부문 -> 팀 -> 부 -> 과 -> 직 -> 반
-- Structure: Division -> Team -> Department -> Section -> Unit -> Squad
--

BEGIN;

-- ===================
-- Level 2: Teams (3 new teams)
-- ===================
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-250', 'TEAM-PLANT3', '제3공장팀', 'Plant 3 Team', '第3工厂组', 'Nhóm Nhà máy 3', 2, 'DEPT-200', NULL, NOW()),
('DEPT-260', 'TEAM-PLANT4', '제4공장팀', 'Plant 4 Team', '第4工厂组', 'Nhóm Nhà máy 4', 2, 'DEPT-200', NULL, NOW()),
('DEPT-270', 'TEAM-PROD-SUP', '생산지원팀', 'Production Support Team', '生产支持组', 'Nhóm Hỗ trợ Sản xuất', 2, 'DEPT-200', NULL, NOW());

-- ===================
-- Level 3: Departments (6 departments)
-- ===================
-- Under TEAM-PLANT3
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-251', 'DEPT-P3-ASSY', '제3공장조립부', 'Plant 3 Assembly Dept', '第3工厂组装部', 'Bộ phận Lắp ráp Nhà máy 3', 3, 'DEPT-250', NULL, NOW()),
('DEPT-252', 'DEPT-P3-TEST', '제3공장시험부', 'Plant 3 Testing Dept', '第3工厂测试部', 'Bộ phận Kiểm tra Nhà máy 3', 3, 'DEPT-250', NULL, NOW());

-- Under TEAM-PLANT4
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-261', 'DEPT-P4-ASSY', '제4공장조립부', 'Plant 4 Assembly Dept', '第4工厂组装部', 'Bộ phận Lắp ráp Nhà máy 4', 3, 'DEPT-260', NULL, NOW()),
('DEPT-262', 'DEPT-P4-TEST', '제4공장시험부', 'Plant 4 Testing Dept', '第4工厂测试部', 'Bộ phận Kiểm tra Nhà máy 4', 3, 'DEPT-260', NULL, NOW());

-- Under TEAM-PROD-SUP
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-271', 'DEPT-PROD-PLAN', '생산계획부', 'Production Planning Dept', '生产计划部', 'Bộ phận Kế hoạch Sản xuất', 3, 'DEPT-270', NULL, NOW()),
('DEPT-272', 'DEPT-PROD-CTRL', '생산관리부', 'Production Control Dept', '生产管理部', 'Bộ phận Quản lý Sản xuất', 3, 'DEPT-270', NULL, NOW());

-- ===================
-- Level 4: Sections (12 sections, 2 per department)
-- ===================
-- Under DEPT-P3-ASSY
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-2511', 'SEC-P3A-LINE1', '제3공장조립1과', 'P3 Assembly Line 1 Section', '第3工厂组装1科', 'Phòng Lắp ráp 1 NM3', 4, 'DEPT-251', NULL, NOW()),
('DEPT-2512', 'SEC-P3A-LINE2', '제3공장조립2과', 'P3 Assembly Line 2 Section', '第3工厂组装2科', 'Phòng Lắp ráp 2 NM3', 4, 'DEPT-251', NULL, NOW());

-- Under DEPT-P3-TEST
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-2521', 'SEC-P3T-QA', '제3공장품질검사과', 'P3 QA Section', '第3工厂质量检验科', 'Phòng Kiểm tra Chất lượng NM3', 4, 'DEPT-252', NULL, NOW()),
('DEPT-2522', 'SEC-P3T-REL', '제3공장신뢰성과', 'P3 Reliability Section', '第3工厂可靠性科', 'Phòng Độ tin cậy NM3', 4, 'DEPT-252', NULL, NOW());

-- Under DEPT-P4-ASSY
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-2611', 'SEC-P4A-LINE1', '제4공장조립1과', 'P4 Assembly Line 1 Section', '第4工厂组装1科', 'Phòng Lắp ráp 1 NM4', 4, 'DEPT-261', NULL, NOW()),
('DEPT-2612', 'SEC-P4A-LINE2', '제4공장조립2과', 'P4 Assembly Line 2 Section', '第4工厂组装2科', 'Phòng Lắp ráp 2 NM4', 4, 'DEPT-261', NULL, NOW());

-- Under DEPT-P4-TEST
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-2621', 'SEC-P4T-QA', '제4공장품질검사과', 'P4 QA Section', '第4工厂质量检验科', 'Phòng Kiểm tra Chất lượng NM4', 4, 'DEPT-262', NULL, NOW()),
('DEPT-2622', 'SEC-P4T-REL', '제4공장신뢰성과', 'P4 Reliability Section', '第4工厂可靠性科', 'Phòng Độ tin cậy NM4', 4, 'DEPT-262', NULL, NOW());

-- Under DEPT-PROD-PLAN
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-2711', 'SEC-PLAN-MRP', '생산계획수립과', 'MRP Planning Section', '生产计划制定科', 'Phòng Lập kế hoạch MRP', 4, 'DEPT-271', NULL, NOW()),
('DEPT-2712', 'SEC-PLAN-SCH', '생산일정관리과', 'Scheduling Section', '生产日程管理科', 'Phòng Quản lý Lịch trình', 4, 'DEPT-271', NULL, NOW());

-- Under DEPT-PROD-CTRL
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-2721', 'SEC-CTRL-MON', '생산모니터링과', 'Production Monitoring Section', '生产监控科', 'Phòng Giám sát Sản xuất', 4, 'DEPT-272', NULL, NOW()),
('DEPT-2722', 'SEC-CTRL-IMP', '생산개선과', 'Improvement Section', '生产改进科', 'Phòng Cải tiến', 4, 'DEPT-272', NULL, NOW());

-- ===================
-- Level 5: Units (18 units)
-- ===================
-- 2 units per assembly section, 1 unit per other sections
-- Under SEC-P3A-LINE1
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-25111', 'UNIT-P3A1-A', '제3공장조립1과A직', 'P3 Assy L1 Unit A', '第3工厂组装1科A职', 'Đơn vị A P3L1', 5, 'DEPT-2511', NULL, NOW()),
('DEPT-25112', 'UNIT-P3A1-B', '제3공장조립1과B직', 'P3 Assy L1 Unit B', '第3工厂组装1科B职', 'Đơn vị B P3L1', 5, 'DEPT-2511', NULL, NOW());

-- Under SEC-P3A-LINE2
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-25121', 'UNIT-P3A2-A', '제3공장조립2과A직', 'P3 Assy L2 Unit A', '第3工厂组装2科A职', 'Đơn vị A P3L2', 5, 'DEPT-2512', NULL, NOW()),
('DEPT-25122', 'UNIT-P3A2-B', '제3공장조립2과B직', 'P3 Assy L2 Unit B', '第3工厂组装2科B职', 'Đơn vị B P3L2', 5, 'DEPT-2512', NULL, NOW());

-- Under SEC-P3T-QA
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-25211', 'UNIT-P3QA', '제3공장품질검사직', 'P3 QA Unit', '第3工厂质检职', 'Đơn vị QA P3', 5, 'DEPT-2521', NULL, NOW());

-- Under SEC-P3T-REL
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-25221', 'UNIT-P3REL', '제3공장신뢰성직', 'P3 Reliability Unit', '第3工厂可靠性职', 'Đơn vị Độ tin cậy P3', 5, 'DEPT-2522', NULL, NOW());

-- Under SEC-P4A-LINE1
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-26111', 'UNIT-P4A1-A', '제4공장조립1과A직', 'P4 Assy L1 Unit A', '第4工厂组装1科A职', 'Đơn vị A P4L1', 5, 'DEPT-2611', NULL, NOW()),
('DEPT-26112', 'UNIT-P4A1-B', '제4공장조립1과B직', 'P4 Assy L1 Unit B', '第4工厂组装1科B职', 'Đơn vị B P4L1', 5, 'DEPT-2611', NULL, NOW());

-- Under SEC-P4A-LINE2
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-26121', 'UNIT-P4A2-A', '제4공장조립2과A직', 'P4 Assy L2 Unit A', '第4工厂组装2科A职', 'Đơn vị A P4L2', 5, 'DEPT-2612', NULL, NOW()),
('DEPT-26122', 'UNIT-P4A2-B', '제4공장조립2과B직', 'P4 Assy L2 Unit B', '第4工厂组装2科B职', 'Đơn vị B P4L2', 5, 'DEPT-2612', NULL, NOW());

-- Under SEC-P4T-QA
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-26211', 'UNIT-P4QA', '제4공장품질검사직', 'P4 QA Unit', '第4工厂质检职', 'Đơn vị QA P4', 5, 'DEPT-2621', NULL, NOW());

-- Under SEC-P4T-REL
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-26221', 'UNIT-P4REL', '제4공장신뢰성직', 'P4 Reliability Unit', '第4工厂可靠性职', 'Đơn vị Độ tin cậy P4', 5, 'DEPT-2622', NULL, NOW());

-- Under SEC-PLAN-MRP
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-27111', 'UNIT-MRP', '생산계획수립직', 'MRP Planning Unit', '计划制定职', 'Đơn vị Lập kế hoạch', 5, 'DEPT-2711', NULL, NOW());

-- Under SEC-PLAN-SCH
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-27121', 'UNIT-SCH', '생산일정관리직', 'Scheduling Unit', '日程管理职', 'Đơn vị Lịch trình', 5, 'DEPT-2712', NULL, NOW());

-- Under SEC-CTRL-MON
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-27211', 'UNIT-MON', '생산모니터링직', 'Monitoring Unit', '监控职', 'Đơn vị Giám sát', 5, 'DEPT-2721', NULL, NOW());

-- Under SEC-CTRL-IMP
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-27221', 'UNIT-IMP', '생산개선직', 'Improvement Unit', '改进职', 'Đơn vị Cải tiến', 5, 'DEPT-2722', NULL, NOW());

-- ===================
-- Level 6: Squads (17 squads)
-- ===================
-- Under assembly units only
-- Under UNIT-P3A1-A
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-251111', 'SQUAD-P3A1A1', '제3공장조립1과A-1반', 'P3 Assy L1-A Squad 1', '第3工厂组装1科A-1班', 'Tổ 1 P3L1-A', 6, 'DEPT-25111', NULL, NOW()),
('DEPT-251112', 'SQUAD-P3A1A2', '제3공장조립1과A-2반', 'P3 Assy L1-A Squad 2', '第3工厂组装1科A-2班', 'Tổ 2 P3L1-A', 6, 'DEPT-25111', NULL, NOW());

-- Under UNIT-P3A1-B
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-251121', 'SQUAD-P3A1B1', '제3공장조립1과B-1반', 'P3 Assy L1-B Squad 1', '第3工厂组装1科B-1班', 'Tổ 1 P3L1-B', 6, 'DEPT-25112', NULL, NOW()),
('DEPT-251122', 'SQUAD-P3A1B2', '제3공장조립1과B-2반', 'P3 Assy L1-B Squad 2', '第3工厂组装1科B-2班', 'Tổ 2 P3L1-B', 6, 'DEPT-25112', NULL, NOW());

-- Under UNIT-P3A2-A
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-251211', 'SQUAD-P3A2A1', '제3공장조립2과A-1반', 'P3 Assy L2-A Squad 1', '第3工厂组装2科A-1班', 'Tổ 1 P3L2-A', 6, 'DEPT-25121', NULL, NOW()),
('DEPT-251212', 'SQUAD-P3A2A2', '제3공장조립2과A-2반', 'P3 Assy L2-A Squad 2', '第3工厂组装2科A-2班', 'Tổ 2 P3L2-A', 6, 'DEPT-25121', NULL, NOW());

-- Under UNIT-P3A2-B
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-251221', 'SQUAD-P3A2B1', '제3공장조립2과B-1반', 'P3 Assy L2-B Squad 1', '第3工厂组装2科B-1班', 'Tổ 1 P3L2-B', 6, 'DEPT-25122', NULL, NOW());

-- Under UNIT-P4A1-A
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-261111', 'SQUAD-P4A1A1', '제4공장조립1과A-1반', 'P4 Assy L1-A Squad 1', '第4工厂组装1科A-1班', 'Tổ 1 P4L1-A', 6, 'DEPT-26111', NULL, NOW()),
('DEPT-261112', 'SQUAD-P4A1A2', '제4공장조립1과A-2반', 'P4 Assy L1-A Squad 2', '第4工厂组装1科A-2班', 'Tổ 2 P4L1-A', 6, 'DEPT-26111', NULL, NOW());

-- Under UNIT-P4A1-B
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-261121', 'SQUAD-P4A1B1', '제4공장조립1과B-1반', 'P4 Assy L1-B Squad 1', '第4工厂组装1科B-1班', 'Tổ 1 P4L1-B', 6, 'DEPT-26112', NULL, NOW()),
('DEPT-261122', 'SQUAD-P4A1B2', '제4공장조립1과B-2반', 'P4 Assy L1-B Squad 2', '第4工厂组装1科B-2班', 'Tổ 2 P4L1-B', 6, 'DEPT-26112', NULL, NOW());

-- Under UNIT-P4A2-A
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-261211', 'SQUAD-P4A2A1', '제4공장조립2과A-1반', 'P4 Assy L2-A Squad 1', '第4工厂组装2科A-1班', 'Tổ 1 P4L2-A', 6, 'DEPT-26121', NULL, NOW()),
('DEPT-261212', 'SQUAD-P4A2A2', '제4공장조립2과A-2반', 'P4 Assy L2-A Squad 2', '第4工厂组装2科A-2班', 'Tổ 2 P4L2-A', 6, 'DEPT-26121', NULL, NOW());

-- Under UNIT-P4A2-B
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-261221', 'SQUAD-P4A2B1', '제4공장조립2과B-1반', 'P4 Assy L2-B Squad 1', '第4工厂组装2科B-1班', 'Tổ 1 P4L2-B', 6, 'DEPT-26122', NULL, NOW()),
('DEPT-261222', 'SQUAD-P4A2B2', '제4공장조립2과B-2반', 'P4 Assy L2-B Squad 2', '第4工厂组装2科B-2班', 'Tổ 2 P4L2-B', 6, 'DEPT-26122', NULL, NOW());

-- Under UNIT-P3QA
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-252111', 'SQUAD-P3QA1', '제3공장품질검사1반', 'P3 QA Squad 1', '第3工厂质检1班', 'Tổ QA 1 P3', 6, 'DEPT-25211', NULL, NOW());

-- Under UNIT-P4QA
INSERT INTO departments (id, code, name_ko, name_en, name_zh, name_vi, level, parent_id, manager_id, created_at) VALUES
('DEPT-262111', 'SQUAD-P4QA1', '제4공장품질검사1반', 'P4 QA Squad 1', '第4工厂质检1班', 'Tổ QA 1 P4', 6, 'DEPT-26211', NULL, NOW());

COMMIT;

-- ===================
-- Verification
-- ===================
SELECT '=== PRODUCTION DEPARTMENTS ADDED ===' as status;

-- Count new departments by level
SELECT
    'New departments by level' as info;
SELECT
    level,
    CASE
        WHEN level = 2 THEN '팀 (Team)'
        WHEN level = 3 THEN '부 (Department)'
        WHEN level = 4 THEN '과 (Section)'
        WHEN level = 5 THEN '직 (Unit)'
        WHEN level = 6 THEN '반 (Squad)'
    END as level_name,
    COUNT(*) as count
FROM departments
WHERE parent_id IN (
    SELECT id FROM departments
    WHERE id = 'DEPT-200'
       OR parent_id = 'DEPT-200'
       OR parent_id IN (SELECT id FROM departments WHERE parent_id = 'DEPT-200')
       OR parent_id IN (SELECT id FROM departments WHERE parent_id IN (SELECT id FROM departments WHERE parent_id = 'DEPT-200'))
       OR parent_id IN (SELECT id FROM departments WHERE parent_id IN (SELECT id FROM departments WHERE parent_id IN (SELECT id FROM departments WHERE parent_id = 'DEPT-200')))
)
AND level >= 2
GROUP BY level
ORDER BY level;

-- Total count under production division
SELECT
    'Total production org units' as metric,
    COUNT(*) as count
FROM departments
WHERE id = 'DEPT-200'
   OR parent_id = 'DEPT-200'
   OR parent_id IN (SELECT id FROM departments WHERE parent_id = 'DEPT-200')
   OR parent_id IN (SELECT id FROM departments WHERE parent_id IN (SELECT id FROM departments WHERE parent_id = 'DEPT-200'))
   OR parent_id IN (SELECT id FROM departments WHERE parent_id IN (SELECT id FROM departments WHERE parent_id IN (SELECT id FROM departments WHERE parent_id = 'DEPT-200')))
   OR parent_id IN (SELECT id FROM departments WHERE parent_id IN (SELECT id FROM departments WHERE parent_id IN (SELECT id FROM departments WHERE parent_id IN (SELECT id FROM departments WHERE parent_id = 'DEPT-200'))));

-- Show hierarchy tree sample
SELECT
    'Production division hierarchy sample' as info;
SELECT
    REPEAT('  ', level) || name_en as hierarchy,
    level,
    id,
    code
FROM departments
WHERE id = 'DEPT-200'
   OR parent_id = 'DEPT-200'
   OR parent_id IN ('DEPT-250', 'DEPT-251', 'DEPT-2511', 'DEPT-25111', 'DEPT-251111')
ORDER BY id;
