-- ==========================================
-- SAMPLE: Users
-- 샘플 사용자 데이터 (개발/테스트용)
-- Password: test123! (bcrypt hashed)
-- ==========================================

-- Sample Users
INSERT INTO users (id, username, password, email, name, role, department, position, phone, status, mfa_enabled, sso_enabled, created_at, updated_at)
VALUES
    -- Managers
    ('user-mgr-001', 'kim.manager', '$2b$10$JlyNjyv9Fq2z1EFVgUWCfu3micETTYFDkq.gnDqFvJdoSWVRVx6dG', 'kim.manager@example.com', 'Kim Chulsoo', 'manager', 'DEPT-130', 'IT Manager', '+82-2-1234-5678', 'active', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('user-mgr-002', 'lee.manager', '$2b$10$JlyNjyv9Fq2z1EFVgUWCfu3micETTYFDkq.gnDqFvJdoSWVRVx6dG', 'lee.manager@example.com', 'Lee Younghee', 'manager', 'DEPT-310', 'R&D Manager', '+82-2-1234-5679', 'active', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Regular Users
    ('user-dev-001', 'park.dev', '$2b$10$JlyNjyv9Fq2z1EFVgUWCfu3micETTYFDkq.gnDqFvJdoSWVRVx6dG', 'park.dev@example.com', 'Park Minsu', 'user', 'DEPT-132', 'Senior Developer', '+82-2-1234-5680', 'active', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('user-dev-002', 'choi.dev', '$2b$10$JlyNjyv9Fq2z1EFVgUWCfu3micETTYFDkq.gnDqFvJdoSWVRVx6dG', 'choi.dev@example.com', 'Choi Jiyeon', 'user', 'DEPT-311', 'Frontend Developer', '+82-2-1234-5681', 'active', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('user-dev-003', 'jung.dev', '$2b$10$JlyNjyv9Fq2z1EFVgUWCfu3micETTYFDkq.gnDqFvJdoSWVRVx6dG', 'jung.dev@example.com', 'Jung Woojin', 'user', 'DEPT-312', 'Backend Developer', '+82-2-1234-5682', 'active', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('user-hr-001', 'han.hr', '$2b$10$JlyNjyv9Fq2z1EFVgUWCfu3micETTYFDkq.gnDqFvJdoSWVRVx6dG', 'han.hr@example.com', 'Han Soyeon', 'user', 'DEPT-110', 'HR Specialist', '+82-2-1234-5683', 'active', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('user-fin-001', 'yoon.fin', '$2b$10$JlyNjyv9Fq2z1EFVgUWCfu3micETTYFDkq.gnDqFvJdoSWVRVx6dG', 'yoon.fin@example.com', 'Yoon Taehee', 'user', 'DEPT-120', 'Finance Analyst', '+82-2-1234-5684', 'active', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('user-sales-001', 'kang.sales', '$2b$10$JlyNjyv9Fq2z1EFVgUWCfu3micETTYFDkq.gnDqFvJdoSWVRVx6dG', 'kang.sales@example.com', 'Kang Donghyun', 'user', 'DEPT-410', 'Sales Representative', '+82-2-1234-5685', 'active', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Test User
    ('user-test-001', 'test.user', '$2b$10$JlyNjyv9Fq2z1EFVgUWCfu3micETTYFDkq.gnDqFvJdoSWVRVx6dG', 'test.user@example.com', 'Test User', 'user', 'DEPT-132', 'Tester', '+82-2-1234-9999', 'active', false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;

-- User Role Mappings
INSERT INTO user_role_mappings (id, user_id, role_id, is_active, is_primary, assigned_at)
VALUES
    ('URM-MGR-001', 'user-mgr-001', 'ROLE-MANAGER', true, true, CURRENT_TIMESTAMP),
    ('URM-MGR-002', 'user-mgr-002', 'ROLE-MANAGER', true, true, CURRENT_TIMESTAMP),
    ('URM-DEV-001', 'user-dev-001', 'ROLE-USER', true, true, CURRENT_TIMESTAMP),
    ('URM-DEV-002', 'user-dev-002', 'ROLE-USER', true, true, CURRENT_TIMESTAMP),
    ('URM-DEV-003', 'user-dev-003', 'ROLE-USER', true, true, CURRENT_TIMESTAMP),
    ('URM-HR-001', 'user-hr-001', 'ROLE-USER', true, true, CURRENT_TIMESTAMP),
    ('URM-FIN-001', 'user-fin-001', 'ROLE-USER', true, true, CURRENT_TIMESTAMP),
    ('URM-SALES-001', 'user-sales-001', 'ROLE-USER', true, true, CURRENT_TIMESTAMP),
    ('URM-TEST-001', 'user-test-001', 'ROLE-USER', true, true, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
