-- ==========================================
-- 공지사항 게시판을 Admin 영역으로 이동
-- ==========================================
-- Created: 2025-11-22
-- Description: 공지사항 게시판 메뉴를 admin 영역으로 이동하고
--              admin 권한만 작성할 수 있도록 설정
-- ==========================================

-- 1. 관리자 메뉴의 parent_id 찾기
DO $$
DECLARE
    admin_parent_id VARCHAR(50);
    notice_menu_id VARCHAR(50);
BEGIN
    -- 관리자 부모 메뉴 찾기 (level 1인 Admin 메뉴)
    SELECT id INTO admin_parent_id
    FROM menus
    WHERE code = 'ADMIN' OR path LIKE '/admin%'
    ORDER BY level ASC, "order" ASC
    LIMIT 1;

    -- 공지사항 메뉴 ID 찾기
    SELECT id INTO notice_menu_id
    FROM menus
    WHERE code = 'MENU-BOARD-NOTICE' OR board_type_id = 'BOARD-TYPE-NOTICE'
    LIMIT 1;

    IF admin_parent_id IS NOT NULL AND notice_menu_id IS NOT NULL THEN
        -- 공지사항 메뉴를 admin 영역으로 이동
        UPDATE menus
        SET
            path = '/admin/boards/BOARD-TYPE-NOTICE',
            parent_id = admin_parent_id,
            level = 2,
            "order" = 101,  -- 게시판 관리(100) 다음에 위치
            updated_at = NOW()
        WHERE id = notice_menu_id;

        RAISE NOTICE '공지사항 메뉴가 admin 영역으로 이동되었습니다.';
        RAISE NOTICE '  - Menu ID: %', notice_menu_id;
        RAISE NOTICE '  - New Path: /admin/boards/BOARD-TYPE-NOTICE';
        RAISE NOTICE '  - Parent ID: %', admin_parent_id;
    ELSE
        IF admin_parent_id IS NULL THEN
            RAISE NOTICE '관리자 메뉴를 찾을 수 없습니다.';
        END IF;
        IF notice_menu_id IS NULL THEN
            RAISE NOTICE '공지사항 메뉴를 찾을 수 없습니다.';
        END IF;
    END IF;
END $$;

-- 2. 공지사항 게시판 타입의 권한 확인 (이미 admin만 작성 가능하도록 설정되어 있어야 함)
DO $$
DECLARE
    notice_board_type RECORD;
BEGIN
    SELECT * INTO notice_board_type
    FROM board_types
    WHERE id = 'BOARD-TYPE-NOTICE' OR code = 'NOTICE'
    LIMIT 1;

    IF notice_board_type.id IS NOT NULL THEN
        RAISE NOTICE '공지사항 게시판 타입 설정:';
        RAISE NOTICE '  - ID: %', notice_board_type.id;
        RAISE NOTICE '  - Type: %', notice_board_type.type;
        RAISE NOTICE '  - Write Roles: %', notice_board_type.write_roles;
        RAISE NOTICE '  - Read Roles: %', notice_board_type.read_roles;

        -- write_roles가 admin만 포함하는지 확인
        IF notice_board_type.write_roles::text = '["admin"]' THEN
            RAISE NOTICE '✓ 작성 권한이 admin으로만 제한되어 있습니다.';
        ELSE
            RAISE NOTICE '⚠ 작성 권한이 admin으로만 제한되어 있지 않습니다. 업데이트가 필요합니다.';

            -- admin만 작성할 수 있도록 업데이트
            UPDATE board_types
            SET
                write_roles = '["admin"]'::jsonb,
                updated_at = NOW()
            WHERE id = notice_board_type.id;

            RAISE NOTICE '✓ 작성 권한이 admin으로 업데이트되었습니다.';
        END IF;
    ELSE
        RAISE NOTICE '공지사항 게시판 타입을 찾을 수 없습니다.';
    END IF;
END $$;

-- 3. 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE '공지사항 게시판 Admin 영역 이동 완료';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '변경사항:';
    RAISE NOTICE '  1. 메뉴 경로: /boards/BOARD-TYPE-NOTICE → /admin/boards/BOARD-TYPE-NOTICE';
    RAISE NOTICE '  2. 메뉴 위치: 사용자 영역 → Admin 영역';
    RAISE NOTICE '  3. 작성 권한: Admin만 작성 가능';
    RAISE NOTICE '  4. 읽기 권한: 모든 사용자 읽기 가능';
    RAISE NOTICE '===========================================';
END $$;
