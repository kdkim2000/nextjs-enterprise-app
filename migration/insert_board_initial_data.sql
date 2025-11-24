-- ==========================================
-- 통합 게시판 시스템 - 초기 데이터 삽입
-- ==========================================
-- Created: 2025-11-22
-- Description: 기본 게시판 종류, 프로그램, 메뉴 등록
-- ==========================================

-- ==========================================
-- 1. 기본 게시판 종류 생성
-- ==========================================

-- 공지사항 게시판
INSERT INTO board_types (
    id, code,
    name_en, name_ko, name_zh, name_vi,
    description_en, description_ko, description_zh, description_vi,
    type, category, "order", status,
    settings,
    write_roles, read_roles,
    created_at, updated_at
) VALUES (
    'BOARD-TYPE-NOTICE',
    'NOTICE',
    'Notice',
    '공지사항',
    '公告',
    'Thông báo',
    'System-wide announcements and important notices',
    '시스템 전체 공지사항 및 중요 알림',
    '系统范围的公告和重要通知',
    'Thông báo và thông tin quan trọng trên toàn hệ thống',
    'notice',
    'system',
    1,
    'active',
    '{
        "allowComments": true,
        "allowAttachments": true,
        "allowAnonymous": false,
        "requireApproval": false,
        "maxAttachments": 5,
        "maxAttachmentSize": 10485760,
        "allowedFileTypes": ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx", "zip"],
        "postsPerPage": 20,
        "allowLikes": true,
        "allowReply": true,
        "showAuthor": true,
        "notifyOnReply": false
    }'::jsonb,
    '["admin"]'::jsonb,
    '["admin", "manager", "user", "guest"]'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (code) DO NOTHING;

-- 일반 게시판
INSERT INTO board_types (
    id, code,
    name_en, name_ko, name_zh, name_vi,
    description_en, description_ko, description_zh, description_vi,
    type, category, "order", status,
    settings,
    write_roles, read_roles,
    created_at, updated_at
) VALUES (
    'BOARD-TYPE-GENERAL',
    'GENERAL',
    'General Board',
    '자유게시판',
    '自由讨论板',
    'Bảng thảo luận tự do',
    'General discussion board for all users',
    '모든 사용자를 위한 자유 토론 게시판',
    '所有用户的一般讨论板',
    'Bảng thảo luận chung cho tất cả người dùng',
    'normal',
    'general',
    2,
    'active',
    '{
        "allowComments": true,
        "allowAttachments": true,
        "allowAnonymous": false,
        "requireApproval": false,
        "maxAttachments": 5,
        "maxAttachmentSize": 10485760,
        "allowedFileTypes": ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx", "zip"],
        "postsPerPage": 20,
        "allowLikes": true,
        "allowReply": true,
        "showAuthor": true,
        "notifyOnReply": true
    }'::jsonb,
    '["admin", "manager", "user"]'::jsonb,
    '["admin", "manager", "user"]'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (code) DO NOTHING;

-- Q&A 게시판
INSERT INTO board_types (
    id, code,
    name_en, name_ko, name_zh, name_vi,
    description_en, description_ko, description_zh, description_vi,
    type, category, "order", status,
    settings,
    write_roles, read_roles,
    created_at, updated_at
) VALUES (
    'BOARD-TYPE-QNA',
    'QNA',
    'Q&A',
    '질문과 답변',
    '问答',
    'Hỏi & Đáp',
    'Questions and Answers board',
    '질문과 답변 게시판',
    '问答讨论板',
    'Bảng hỏi đáp',
    'normal',
    'support',
    3,
    'active',
    '{
        "allowComments": true,
        "allowAttachments": true,
        "allowAnonymous": false,
        "requireApproval": false,
        "maxAttachments": 3,
        "maxAttachmentSize": 5242880,
        "allowedFileTypes": ["jpg", "jpeg", "png", "gif", "pdf", "txt"],
        "postsPerPage": 20,
        "allowLikes": true,
        "allowReply": true,
        "showAuthor": true,
        "notifyOnReply": true
    }'::jsonb,
    '["admin", "manager", "user"]'::jsonb,
    '["admin", "manager", "user"]'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 2. 프로그램 등록
-- ==========================================

-- 게시판 종류 관리 프로그램
INSERT INTO programs (
    id, code,
    name_en, name_ko, name_zh, name_vi,
    description_en, description_ko, description_zh, description_vi,
    category, type, status,
    created_at, updated_at
) VALUES (
    'PROG-BOARD-TYPE',
    'PROG-BOARD-TYPE',
    'Board Type Management',
    '게시판 종류 관리',
    '讨论板类型管理',
    'Quản lý loại bảng',
    'Manage board types and their settings',
    '게시판 종류 및 설정 관리',
    '管理讨论板类型及其设置',
    'Quản lý các loại bảng và cài đặt của chúng',
    'board',
    'admin',
    'active',
    NOW(),
    NOW()
) ON CONFLICT (code) DO NOTHING;

-- 사용자용 게시판 프로그램
INSERT INTO programs (
    id, code,
    name_en, name_ko, name_zh, name_vi,
    description_en, description_ko, description_zh, description_vi,
    category, type, status,
    created_at, updated_at
) VALUES (
    'PROG-BOARD-USER',
    'PROG-BOARD-USER',
    'Board',
    '게시판',
    '讨论板',
    'Bảng',
    'User board for reading and writing posts',
    '게시글 읽기 및 작성을 위한 사용자 게시판',
    '用户讨论板用于阅读和撰写帖子',
    'Bảng người dùng để đọc và viết bài',
    'board',
    'user',
    'active',
    NOW(),
    NOW()
) ON CONFLICT (code) DO NOTHING;

-- 게시글 관리 프로그램 (관리자)
INSERT INTO programs (
    id, code,
    name_en, name_ko, name_zh, name_vi,
    description_en, description_ko, description_zh, description_vi,
    category, type, status,
    created_at, updated_at
) VALUES (
    'PROG-POST-ADMIN',
    'PROG-POST-ADMIN',
    'Post Management',
    '게시글 관리',
    '帖子管理',
    'Quản lý bài đăng',
    'Manage all posts across all boards',
    '모든 게시판의 게시글 관리',
    '管理所有讨论板的所有帖子',
    'Quản lý tất cả bài đăng trên tất cả các bảng',
    'board',
    'admin',
    'active',
    NOW(),
    NOW()
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 3. 메뉴 등록
-- ==========================================

-- 관리자 메뉴의 부모 ID 찾기 (시스템 관리 또는 관리자 메뉴)
DO $$
DECLARE
    admin_parent_id VARCHAR(50);
    user_parent_id VARCHAR(50);
BEGIN
    -- 관리자 부모 메뉴 찾기 (level 1인 Admin 메뉴)
    SELECT id INTO admin_parent_id
    FROM menus
    WHERE code = 'ADMIN' OR path LIKE '/admin%'
    ORDER BY level ASC, "order" ASC
    LIMIT 1;

    -- 사용자 부모 메뉴 찾기 (커뮤니티 또는 게시판 그룹)
    -- 없으면 NULL로 처리 (최상위 메뉴)
    SELECT id INTO user_parent_id
    FROM menus
    WHERE code = 'COMMUNITY' OR name_en = 'Community'
    LIMIT 1;

    -- 관리자 메뉴: 게시판 종류 관리
    INSERT INTO menus (
        id, code,
        name_en, name_ko, name_zh, name_vi,
        description_en, description_ko, description_zh, description_vi,
        path, icon, "order",
        parent_id, level,
        program_id
    ) VALUES (
        'MENU-BOARD-TYPE-ADMIN',
        'MENU-BOARD-TYPE-ADMIN',
        'Board Types',
        '게시판 관리',
        '讨论板管理',
        'Quản lý bảng',
        'Manage board types',
        '게시판 종류 관리',
        '管理讨论板类型',
        'Quản lý các loại bảng',
        '/admin/board-types',
        'Dashboard',
        100,
        admin_parent_id,
        CASE WHEN admin_parent_id IS NOT NULL THEN 2 ELSE 1 END,
        'PROG-BOARD-TYPE'
    ) ON CONFLICT (code) DO NOTHING;

    -- 사용자 메뉴: 공지사항
    INSERT INTO menus (
        id, code,
        name_en, name_ko, name_zh, name_vi,
        description_en, description_ko, description_zh, description_vi,
        path, icon, "order",
        parent_id, level,
        program_id, board_type_id
    ) VALUES (
        'MENU-BOARD-NOTICE',
        'MENU-BOARD-NOTICE',
        'Notice',
        '공지사항',
        '公告',
        'Thông báo',
        'System notices and announcements',
        '시스템 공지사항 및 알림',
        '系统公告和通知',
        'Thông báo và công bố hệ thống',
        '/boards/BOARD-TYPE-NOTICE',
        'Announcement',
        10,
        user_parent_id,
        CASE WHEN user_parent_id IS NOT NULL THEN 2 ELSE 1 END,
        'PROG-BOARD-USER',
        'BOARD-TYPE-NOTICE'
    ) ON CONFLICT (code) DO NOTHING;

    -- 사용자 메뉴: 자유게시판
    INSERT INTO menus (
        id, code,
        name_en, name_ko, name_zh, name_vi,
        description_en, description_ko, description_zh, description_vi,
        path, icon, "order",
        parent_id, level,
        program_id, board_type_id
    ) VALUES (
        'MENU-BOARD-GENERAL',
        'MENU-BOARD-GENERAL',
        'General Board',
        '자유게시판',
        '自由讨论板',
        'Bảng tự do',
        'General discussion board',
        '자유 토론 게시판',
        '一般讨论板',
        'Bảng thảo luận chung',
        '/boards/BOARD-TYPE-GENERAL',
        'Forum',
        11,
        user_parent_id,
        CASE WHEN user_parent_id IS NOT NULL THEN 2 ELSE 1 END,
        'PROG-BOARD-USER',
        'BOARD-TYPE-GENERAL'
    ) ON CONFLICT (code) DO NOTHING;

    -- 사용자 메뉴: Q&A
    INSERT INTO menus (
        id, code,
        name_en, name_ko, name_zh, name_vi,
        description_en, description_ko, description_zh, description_vi,
        path, icon, "order",
        parent_id, level,
        program_id, board_type_id
    ) VALUES (
        'MENU-BOARD-QNA',
        'MENU-BOARD-QNA',
        'Q&A',
        '질문과 답변',
        '问答',
        'Hỏi & Đáp',
        'Questions and answers',
        '질문과 답변',
        '问答',
        'Câu hỏi và trả lời',
        '/boards/BOARD-TYPE-QNA',
        'Help',
        12,
        user_parent_id,
        CASE WHEN user_parent_id IS NOT NULL THEN 2 ELSE 1 END,
        'PROG-BOARD-USER',
        'BOARD-TYPE-QNA'
    ) ON CONFLICT (code) DO NOTHING;

    RAISE NOTICE '메뉴 등록 완료: admin_parent_id=%, user_parent_id=%', admin_parent_id, user_parent_id;
END $$;

-- ==========================================
-- 4. 역할-프로그램 매핑 (관리자에게 권한 부여)
-- ==========================================

-- admin 역할 찾기
DO $$
DECLARE
    admin_role_id VARCHAR(50);
    board_type_program_id VARCHAR(50);
    board_user_program_id VARCHAR(50);
    post_admin_program_id VARCHAR(50);
BEGIN
    -- admin 역할 ID 찾기
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin' LIMIT 1;

    -- 프로그램 ID 찾기
    SELECT id INTO board_type_program_id FROM programs WHERE code = 'PROG-BOARD-TYPE';
    SELECT id INTO board_user_program_id FROM programs WHERE code = 'PROG-BOARD-USER';
    SELECT id INTO post_admin_program_id FROM programs WHERE code = 'PROG-POST-ADMIN';

    IF admin_role_id IS NOT NULL THEN
        -- 게시판 종류 관리 권한
        IF board_type_program_id IS NOT NULL THEN
            INSERT INTO role_program_mappings (
                id, role_id, program_id,
                can_view, can_create, can_update, can_delete,
                created_at
            ) VALUES (
                'RPM-ADMIN-BOARD-TYPE',
                admin_role_id,
                board_type_program_id,
                true, true, true, true,
                NOW()
            ) ON CONFLICT (id) DO NOTHING;
        END IF;

        -- 게시판 사용 권한
        IF board_user_program_id IS NOT NULL THEN
            INSERT INTO role_program_mappings (
                id, role_id, program_id,
                can_view, can_create, can_update, can_delete,
                created_at
            ) VALUES (
                'RPM-ADMIN-BOARD-USER',
                admin_role_id,
                board_user_program_id,
                true, true, true, true,
                NOW()
            ) ON CONFLICT (id) DO NOTHING;
        END IF;

        -- 게시글 관리 권한
        IF post_admin_program_id IS NOT NULL THEN
            INSERT INTO role_program_mappings (
                id, role_id, program_id,
                can_view, can_create, can_update, can_delete,
                created_at
            ) VALUES (
                'RPM-ADMIN-POST-ADMIN',
                admin_role_id,
                post_admin_program_id,
                true, true, true, true,
                NOW()
            ) ON CONFLICT (id) DO NOTHING;
        END IF;

        RAISE NOTICE '관리자 권한 부여 완료';
    ELSE
        RAISE NOTICE '관리자 역할을 찾을 수 없습니다';
    END IF;
END $$;

-- ==========================================
-- 5. 샘플 게시글 생성 (선택사항)
-- ==========================================

-- 관리자 사용자 ID 찾기
DO $$
DECLARE
    admin_user_id VARCHAR(50);
    admin_user_name VARCHAR(200);
BEGIN
    SELECT id, COALESCE(name_ko, name_en, 'Admin') INTO admin_user_id, admin_user_name
    FROM users
    WHERE role = 'admin' OR loginid = 'admin'
    LIMIT 1;

    IF admin_user_id IS NOT NULL THEN
        -- 샘플 공지사항
        INSERT INTO posts (
            id, board_type_id,
            title, content,
            author_id, author_name,
            post_type, status, is_pinned,
            created_at, updated_at, published_at
        ) VALUES (
            'POST-WELCOME',
            'BOARD-TYPE-NOTICE',
            'Welcome to the Board System',
            '<p>Welcome to our new integrated board system!</p><p>You can now create and manage posts easily.</p><p>Features:</p><ul><li>Multiple board types</li><li>Rich text editing</li><li>File attachments</li><li>Comments and likes</li></ul>',
            admin_user_id,
            admin_user_name,
            'notice',
            'published',
            true,
            NOW(),
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;

        -- 샘플 일반 게시글
        INSERT INTO posts (
            id, board_type_id,
            title, content,
            author_id, author_name,
            post_type, status,
            created_at, updated_at, published_at
        ) VALUES (
            'POST-SAMPLE-1',
            'BOARD-TYPE-GENERAL',
            'First Post in General Board',
            '<p>This is the first post in the general board.</p><p>Feel free to share your thoughts and ideas here!</p>',
            admin_user_id,
            admin_user_name,
            'normal',
            'published',
            NOW(),
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;

        RAISE NOTICE '샘플 게시글 생성 완료';
    ELSE
        RAISE NOTICE '관리자 사용자를 찾을 수 없어 샘플 게시글을 생성하지 않았습니다';
    END IF;
END $$;

-- ==========================================
-- 완료 메시지
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE '통합 게시판 시스템 초기 데이터 삽입 완료';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '생성된 게시판 종류:';
    RAISE NOTICE '  - NOTICE (공지사항)';
    RAISE NOTICE '  - GENERAL (자유게시판)';
    RAISE NOTICE '  - QNA (질문과 답변)';
    RAISE NOTICE '등록된 프로그램:';
    RAISE NOTICE '  - PROG-BOARD-TYPE (게시판 종류 관리)';
    RAISE NOTICE '  - PROG-BOARD-USER (사용자 게시판)';
    RAISE NOTICE '  - PROG-POST-ADMIN (게시글 관리)';
    RAISE NOTICE '등록된 메뉴:';
    RAISE NOTICE '  - 게시판 관리 (관리자)';
    RAISE NOTICE '  - 공지사항 (사용자)';
    RAISE NOTICE '  - 자유게시판 (사용자)';
    RAISE NOTICE '  - Q&A (사용자)';
    RAISE NOTICE '===========================================';
END $$;
