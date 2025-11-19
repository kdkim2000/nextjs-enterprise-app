-- Delete existing departments
TRUNCATE TABLE departments CASCADE;

-- Insert realistic enterprise organization structure
-- Level 0: Company-wide (전사)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, parent_id, manager_id, level, "order", status, created_at, updated_at) VALUES
('DEPT-000', 'COMPANY', 'Enterprise', '전사', '全公司', 'Toàn công ty', 'Company-wide organization', '전사 조직', '全公司组织', 'Tổ chức toàn công ty', NULL, NULL, 0, 1, 'active', NOW(), NOW());

-- Level 1: Divisions (부문)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, parent_id, manager_id, level, "order", status, created_at, updated_at) VALUES
('DEPT-100', 'DIV-MGMT', 'Management Division', '경영지원부문', '管理部门', 'Bộ phận Quản lý', 'Corporate management and support', '경영 및 지원 업무', '企业管理和支持', 'Quản lý và hỗ trợ doanh nghiệp', 'DEPT-000', NULL, 1, 1, 'active', NOW(), NOW()),
('DEPT-200', 'DIV-PROD', 'Production Division', '생산부문', '生产部门', 'Bộ phận Sản xuất', 'Manufacturing and production', '제조 및 생산', '制造和生产', 'Sản xuất và chế tạo', 'DEPT-000', NULL, 1, 2, 'active', NOW(), NOW()),
('DEPT-300', 'DIV-SALES', 'Sales Division', '영업부문', '销售部门', 'Bộ phận Kinh doanh', 'Sales and business development', '영업 및 사업 개발', '销售和业务开发', 'Kinh doanh và phát triển', 'DEPT-000', NULL, 1, 3, 'active', NOW(), NOW()),
('DEPT-400', 'DIV-RND', 'R&D Division', '연구개발부문', '研发部门', 'Bộ phận Nghiên cứu', 'Research and development', '연구 및 개발', '研究和开发', 'Nghiên cứu và phát triển', 'DEPT-000', NULL, 1, 4, 'active', NOW(), NOW());

-- Level 2: Teams under Management Division (팀)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, parent_id, manager_id, level, "order", status, created_at, updated_at) VALUES
('DEPT-110', 'TEAM-HR', 'Human Resources Team', '인사팀', '人力资源团队', 'Nhóm Nhân sự', 'HR management', '인사 관리', '人力资源管理', 'Quản lý nhân sự', 'DEPT-100', NULL, 2, 1, 'active', NOW(), NOW()),
('DEPT-120', 'TEAM-FIN', 'Finance Team', '재무팀', '财务团队', 'Nhóm Tài chính', 'Financial management', '재무 관리', '财务管理', 'Quản lý tài chính', 'DEPT-100', NULL, 2, 2, 'active', NOW(), NOW()),
('DEPT-130', 'TEAM-IT', 'IT Team', 'IT팀', 'IT团队', 'Nhóm CNTT', 'Information technology', '정보기술', '信息技术', 'Công nghệ thông tin', 'DEPT-100', NULL, 2, 3, 'active', NOW(), NOW()),
('DEPT-140', 'TEAM-GA', 'General Affairs Team', '총무팀', '总务团队', 'Nhóm Hành chính', 'General administration', '총무 업무', '总务工作', 'Công việc hành chính', 'DEPT-100', NULL, 2, 4, 'active', NOW(), NOW());

-- Level 2: Teams under Production Division (팀)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, parent_id, manager_id, level, "order", status, created_at, updated_at) VALUES
('DEPT-210', 'TEAM-PLANT1', 'Plant 1 Team', '제1공장팀', '第一工厂团队', 'Nhóm Nhà máy 1', 'First production plant', '제1 생산 공장', '第一生产工厂', 'Nhà máy sản xuất thứ nhất', 'DEPT-200', NULL, 2, 1, 'active', NOW(), NOW()),
('DEPT-220', 'TEAM-PLANT2', 'Plant 2 Team', '제2공장팀', '第二工厂团队', 'Nhóm Nhà máy 2', 'Second production plant', '제2 생산 공장', '第二生产工厂', 'Nhà máy sản xuất thứ hai', 'DEPT-200', NULL, 2, 2, 'active', NOW(), NOW()),
('DEPT-230', 'TEAM-QC', 'Quality Control Team', '품질관리팀', '质量控制团队', 'Nhóm Kiểm soát chất lượng', 'Product quality control', '제품 품질 관리', '产品质量控制', 'Kiểm soát chất lượng sản phẩm', 'DEPT-200', NULL, 2, 3, 'active', NOW(), NOW()),
('DEPT-240', 'TEAM-SCM', 'Supply Chain Team', '공급망관리팀', '供应链团队', 'Nhóm Chuỗi cung ứng', 'Supply chain management', '공급망 관리', '供应链管理', 'Quản lý chuỗi cung ứng', 'DEPT-200', NULL, 2, 4, 'active', NOW(), NOW());

-- Level 2: Teams under Sales Division (팀)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, parent_id, manager_id, level, "order", status, created_at, updated_at) VALUES
('DEPT-310', 'TEAM-DOM', 'Domestic Sales Team', '국내영업팀', '国内销售团队', 'Nhóm Kinh doanh nội địa', 'Domestic market sales', '국내 시장 영업', '国内市场销售', 'Kinh doanh thị trường nội địa', 'DEPT-300', NULL, 2, 1, 'active', NOW(), NOW()),
('DEPT-320', 'TEAM-INTL', 'International Sales Team', '해외영업팀', '国际销售团队', 'Nhóm Kinh doanh quốc tế', 'International market sales', '해외 시장 영업', '国际市场销售', 'Kinh doanh thị trường quốc tế', 'DEPT-300', NULL, 2, 2, 'active', NOW(), NOW()),
('DEPT-330', 'TEAM-MKTG', 'Marketing Team', '마케팅팀', '营销团队', 'Nhóm Tiếp thị', 'Marketing and promotion', '마케팅 및 홍보', '营销和推广', 'Tiếp thị và quảng bá', 'DEPT-300', NULL, 2, 3, 'active', NOW(), NOW()),
('DEPT-340', 'TEAM-CS', 'Customer Service Team', '고객서비스팀', '客户服务团队', 'Nhóm Dịch vụ khách hàng', 'Customer support', '고객 지원', '客户支持', 'Hỗ trợ khách hàng', 'DEPT-300', NULL, 2, 4, 'active', NOW(), NOW());

-- Level 2: Teams under R&D Division (팀)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, parent_id, manager_id, level, "order", status, created_at, updated_at) VALUES
('DEPT-410', 'TEAM-DESIGN', 'Design Team', '설계팀', '设计团队', 'Nhóm Thiết kế', 'Product design', '제품 설계', '产品设计', 'Thiết kế sản phẩm', 'DEPT-400', NULL, 2, 1, 'active', NOW(), NOW()),
('DEPT-420', 'TEAM-DEV', 'Development Team', '개발팀', '开发团队', 'Nhóm Phát triển', 'Product development', '제품 개발', '产品开发', 'Phát triển sản phẩm', 'DEPT-400', NULL, 2, 2, 'active', NOW(), NOW()),
('DEPT-430', 'TEAM-TEST', 'Testing Team', '시험팀', '测试团队', 'Nhóm Kiểm thử', 'Product testing', '제품 시험', '产品测试', 'Kiểm thử sản phẩm', 'DEPT-400', NULL, 2, 3, 'active', NOW(), NOW());

-- Level 3: Departments under HR Team (부)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, parent_id, manager_id, level, "order", status, created_at, updated_at) VALUES
('DEPT-111', 'DEPT-RECRUIT', 'Recruitment Department', '채용부', '招聘部', 'Phòng Tuyển dụng', 'Talent acquisition', '인재 채용', '人才招聘', 'Thu hút nhân tài', 'DEPT-110', NULL, 3, 1, 'active', NOW(), NOW()),
('DEPT-112', 'DEPT-TRAIN', 'Training Department', '교육부', '培训部', 'Phòng Đào tạo', 'Employee training', '직원 교육', '员工培训', 'Đào tạo nhân viên', 'DEPT-110', NULL, 3, 2, 'active', NOW(), NOW()),
('DEPT-113', 'DEPT-COMP', 'Compensation Department', '보상부', '薪酬部', 'Phòng Lương thưởng', 'Compensation management', '보상 관리', '薪酬管理', 'Quản lý lương thưởng', 'DEPT-110', NULL, 3, 3, 'active', NOW(), NOW());

-- Level 3: Departments under Finance Team (부)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, parent_id, manager_id, level, "order", status, created_at, updated_at) VALUES
('DEPT-121', 'DEPT-ACCT', 'Accounting Department', '회계부', '会计部', 'Phòng Kế toán', 'Financial accounting', '재무 회계', '财务会计', 'Kế toán tài chính', 'DEPT-120', NULL, 3, 1, 'active', NOW(), NOW()),
('DEPT-122', 'DEPT-BUDGET', 'Budget Department', '예산부', '预算部', 'Phòng Ngân sách', 'Budget planning', '예산 계획', '预算规划', 'Lập kế hoạch ngân sách', 'DEPT-120', NULL, 3, 2, 'active', NOW(), NOW()),
('DEPT-123', 'DEPT-AUDIT', 'Audit Department', '감사부', '审计部', 'Phòng Kiểm toán', 'Internal audit', '내부 감사', '内部审计', 'Kiểm toán nội bộ', 'DEPT-120', NULL, 3, 3, 'active', NOW(), NOW());

-- Level 3: Departments under IT Team (부)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, parent_id, manager_id, level, "order", status, created_at, updated_at) VALUES
('DEPT-131', 'DEPT-INFRA', 'Infrastructure Department', '인프라부', '基础设施部', 'Phòng Hạ tầng', 'IT infrastructure', 'IT 인프라', 'IT基础设施', 'Hạ tầng CNTT', 'DEPT-130', NULL, 3, 1, 'active', NOW(), NOW()),
('DEPT-132', 'DEPT-APP', 'Application Department', '응용개발부', '应用开发部', 'Phòng Ứng dụng', 'Application development', '응용 개발', '应用开发', 'Phát triển ứng dụng', 'DEPT-130', NULL, 3, 2, 'active', NOW(), NOW()),
('DEPT-133', 'DEPT-SEC', 'Security Department', '보안부', '安全部', 'Phòng An ninh', 'Information security', '정보 보안', '信息安全', 'An ninh thông tin', 'DEPT-130', NULL, 3, 3, 'active', NOW(), NOW());

-- Level 3: Departments under Domestic Sales Team (부)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, parent_id, manager_id, level, "order", status, created_at, updated_at) VALUES
('DEPT-311', 'DEPT-SEOUL', 'Seoul Sales Department', '서울영업부', '首尔销售部', 'Phòng Kinh doanh Seoul', 'Seoul region sales', '서울 지역 영업', '首尔地区销售', 'Kinh doanh khu vực Seoul', 'DEPT-310', NULL, 3, 1, 'active', NOW(), NOW()),
('DEPT-312', 'DEPT-BUSAN', 'Busan Sales Department', '부산영업부', '釜山销售部', 'Phòng Kinh doanh Busan', 'Busan region sales', '부산 지역 영업', '釜山地区销售', 'Kinh doanh khu vực Busan', 'DEPT-310', NULL, 3, 2, 'active', NOW(), NOW()),
('DEPT-313', 'DEPT-REGION', 'Regional Sales Department', '지방영업부', '地方销售部', 'Phòng Kinh doanh khu vực', 'Regional sales', '지방 영업', '地方销售', 'Kinh doanh khu vực', 'DEPT-310', NULL, 3, 3, 'active', NOW(), NOW());

-- Level 3: Departments under International Sales Team (부)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, parent_id, manager_id, level, "order", status, created_at, updated_at) VALUES
('DEPT-321', 'DEPT-ASIA', 'Asia Sales Department', '아시아영업부', '亚洲销售部', 'Phòng Kinh doanh châu Á', 'Asian market sales', '아시아 시장 영업', '亚洲市场销售', 'Kinh doanh thị trường châu Á', 'DEPT-320', NULL, 3, 1, 'active', NOW(), NOW()),
('DEPT-322', 'DEPT-EUROPE', 'Europe Sales Department', '유럽영업부', '欧洲销售部', 'Phòng Kinh doanh châu Âu', 'European market sales', '유럽 시장 영업', '欧洲市场销售', 'Kinh doanh thị trường châu Âu', 'DEPT-320', NULL, 3, 2, 'active', NOW(), NOW()),
('DEPT-323', 'DEPT-AMERICAS', 'Americas Sales Department', '미주영업부', '美洲销售部', 'Phòng Kinh doanh châu Mỹ', 'Americas market sales', '미주 시장 영업', '美洲市场销售', 'Kinh doanh thị trường châu Mỹ', 'DEPT-320', NULL, 3, 3, 'active', NOW(), NOW());

-- Level 4: Sections under Recruitment Department (과)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, parent_id, manager_id, level, "order", status, created_at, updated_at) VALUES
('DEPT-1111', 'SECT-EXP', 'Experienced Hire Section', '경력채용과', '经验招聘科', 'Phần Tuyển dụng có kinh nghiệm', 'Experienced talent recruitment', '경력 인재 채용', '经验人才招聘', 'Tuyển dụng nhân tài có kinh nghiệm', 'DEPT-111', NULL, 4, 1, 'active', NOW(), NOW()),
('DEPT-1112', 'SECT-NEW', 'New Graduate Section', '신입채용과', '新人招聘科', 'Phần Tuyển dụng tân binh', 'New graduate recruitment', '신입 사원 채용', '新人招聘', 'Tuyển dụng sinh viên mới tốt nghiệp', 'DEPT-111', NULL, 4, 2, 'active', NOW(), NOW());

-- Level 4: Sections under Accounting Department (과)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, parent_id, manager_id, level, "order", status, created_at, updated_at) VALUES
('DEPT-1211', 'SECT-AR', 'Accounts Receivable Section', '채권관리과', '应收账款科', 'Phần Khoản phải thu', 'Receivables management', '채권 관리', '应收账款管理', 'Quản lý khoản phải thu', 'DEPT-121', NULL, 4, 1, 'active', NOW(), NOW()),
('DEPT-1212', 'SECT-AP', 'Accounts Payable Section', '채무관리과', '应付账款科', 'Phần Khoản phải trả', 'Payables management', '채무 관리', '应付账款管理', 'Quản lý khoản phải trả', 'DEPT-121', NULL, 4, 2, 'active', NOW(), NOW()),
('DEPT-1213', 'SECT-GL', 'General Ledger Section', '총계정원장과', '总账科', 'Phần Sổ cái', 'General ledger management', '총계정원장 관리', '总账管理', 'Quản lý sổ cái', 'DEPT-121', NULL, 4, 3, 'active', NOW(), NOW());

-- Level 4: Sections under Infrastructure Department (과)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, parent_id, manager_id, level, "order", status, created_at, updated_at) VALUES
('DEPT-1311', 'SECT-NET', 'Network Section', '네트워크과', '网络科', 'Phần Mạng', 'Network operations', '네트워크 운영', '网络运营', 'Vận hành mạng', 'DEPT-131', NULL, 4, 1, 'active', NOW(), NOW()),
('DEPT-1312', 'SECT-SERVER', 'Server Section', '서버과', '服务器科', 'Phần Máy chủ', 'Server operations', '서버 운영', '服务器运营', 'Vận hành máy chủ', 'DEPT-131', NULL, 4, 2, 'active', NOW(), NOW()),
('DEPT-1313', 'SECT-DB', 'Database Section', '데이터베이스과', '数据库科', 'Phần Cơ sở dữ liệu', 'Database management', '데이터베이스 관리', '数据库管理', 'Quản lý cơ sở dữ liệu', 'DEPT-131', NULL, 4, 3, 'active', NOW(), NOW());

-- Level 4: Sections under Seoul Sales Department (과)
INSERT INTO departments (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, parent_id, manager_id, level, "order", status, created_at, updated_at) VALUES
('DEPT-3111', 'SECT-SEO1', 'Seoul Section 1', '서울1과', '首尔第一科', 'Phần Seoul 1', 'Seoul area 1 sales', '서울 1지역 영업', '首尔第一区域销售', 'Kinh doanh khu vực Seoul 1', 'DEPT-311', NULL, 4, 1, 'active', NOW(), NOW()),
('DEPT-3112', 'SECT-SEO2', 'Seoul Section 2', '서울2과', '首尔第二科', 'Phần Seoul 2', 'Seoul area 2 sales', '서울 2지역 영업', '首尔第二区域销售', 'Kinh doanh khu vực Seoul 2', 'DEPT-311', NULL, 4, 2, 'active', NOW(), NOW()),
('DEPT-3113', 'SECT-SEO3', 'Seoul Section 3', '서울3과', '首尔第三科', 'Phần Seoul 3', 'Seoul area 3 sales', '서울 3지역 영업', '首尔第三区域销售', 'Kinh doanh khu vực Seoul 3', 'DEPT-311', NULL, 4, 3, 'active', NOW(), NOW());
