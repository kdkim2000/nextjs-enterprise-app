-- ==========================================
-- SAMPLE: Departments
-- 샘플 조직 데이터 (개발/테스트용)
-- ==========================================

-- Level 1: Divisions (부문)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, level, parent_id, status, display_order, created_at, updated_at)
VALUES
    ('DEPT-100', 'DIV-CORP', 'Corporate Division', '경영지원부문', '企业部门', 'Khoi Doanh nghiep', 1, 'DEPT-000', 'active', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DEPT-200', 'DIV-PROD', 'Production Division', '생산부문', '生产部门', 'Khoi San xuat', 1, 'DEPT-000', 'active', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DEPT-300', 'DIV-RND', 'R&D Division', '연구개발부문', '研发部门', 'Khoi Nghien cuu', 1, 'DEPT-000', 'active', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DEPT-400', 'DIV-SALES', 'Sales Division', '영업부문', '销售部门', 'Khoi Kinh doanh', 1, 'DEPT-000', 'active', 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- Level 2: Teams (팀)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, level, parent_id, status, display_order, created_at, updated_at)
VALUES
    -- Corporate Division Teams
    ('DEPT-110', 'TEAM-HR', 'HR Team', '인사팀', '人事组', 'Nhom Nhan su', 2, 'DEPT-100', 'active', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DEPT-120', 'TEAM-FIN', 'Finance Team', '재무팀', '财务组', 'Nhom Tai chinh', 2, 'DEPT-100', 'active', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DEPT-130', 'TEAM-IT', 'IT Team', 'IT팀', 'IT组', 'Nhom CNTT', 2, 'DEPT-100', 'active', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Production Division Teams
    ('DEPT-210', 'TEAM-PLANT1', 'Plant 1 Team', '제1공장팀', '第1工厂组', 'Nhom Nha may 1', 2, 'DEPT-200', 'active', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DEPT-220', 'TEAM-PLANT2', 'Plant 2 Team', '제2공장팀', '第2工厂组', 'Nhom Nha may 2', 2, 'DEPT-200', 'active', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DEPT-230', 'TEAM-QC', 'Quality Control Team', '품질관리팀', '质量管理组', 'Nhom Kiem soat CL', 2, 'DEPT-200', 'active', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- R&D Division Teams
    ('DEPT-310', 'TEAM-SWDEV', 'SW Development Team', 'SW개발팀', '软件开发组', 'Nhom Phat trien PM', 2, 'DEPT-300', 'active', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DEPT-320', 'TEAM-HWDEV', 'HW Development Team', 'HW개발팀', '硬件开发组', 'Nhom Phat trien HW', 2, 'DEPT-300', 'active', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Sales Division Teams
    ('DEPT-410', 'TEAM-DOMESTIC', 'Domestic Sales Team', '국내영업팀', '国内销售组', 'Nhom BH Noi dia', 2, 'DEPT-400', 'active', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DEPT-420', 'TEAM-OVERSEAS', 'Overseas Sales Team', '해외영업팀', '海外销售组', 'Nhom BH Quoc te', 2, 'DEPT-400', 'active', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- Level 3: Departments (부)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, level, parent_id, status, display_order, created_at, updated_at)
VALUES
    -- IT Team Departments
    ('DEPT-131', 'DEPT-INFRA', 'Infrastructure Dept', '인프라부', '基础设施部', 'Phong Ha tang', 3, 'DEPT-130', 'active', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DEPT-132', 'DEPT-DEV', 'Development Dept', '개발부', '开发部', 'Phong Phat trien', 3, 'DEPT-130', 'active', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- SW Development Departments
    ('DEPT-311', 'DEPT-FRONTEND', 'Frontend Dept', '프론트엔드부', '前端部', 'Phong Frontend', 3, 'DEPT-310', 'active', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DEPT-312', 'DEPT-BACKEND', 'Backend Dept', '백엔드부', '后端部', 'Phong Backend', 3, 'DEPT-310', 'active', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DEPT-313', 'DEPT-MOBILE', 'Mobile Dept', '모바일부', '移动端部', 'Phong Di dong', 3, 'DEPT-310', 'active', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;
