-- ==========================================
-- 통합 게시판 시스템 - 데이터베이스 스키마
-- ==========================================
-- Created: 2025-11-22
-- Description: 게시판 종류, 게시글, 댓글, 첨부파일, 조회/좋아요 테이블 생성
-- ==========================================

-- ==========================================
-- 1. BOARD_TYPES TABLE (게시판 종류)
-- ==========================================
CREATE TABLE IF NOT EXISTS board_types (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,

    -- 다국어 이름
    name_en VARCHAR(200),
    name_ko VARCHAR(200),
    name_zh VARCHAR(200),
    name_vi VARCHAR(200),

    -- 다국어 설명
    description_en TEXT,
    description_ko TEXT,
    description_zh TEXT,
    description_vi TEXT,

    -- 게시판 타입 (normal: 일반, notice: 공지사항)
    type VARCHAR(20) NOT NULL DEFAULT 'normal',

    -- 게시판 설정 (JSONB)
    settings JSONB DEFAULT '{
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

    -- 권한 설정 (역할 기반)
    write_roles JSONB DEFAULT '["admin", "manager", "user"]'::jsonb,
    read_roles JSONB DEFAULT '["admin", "manager", "user", "guest"]'::jsonb,

    -- 카테고리
    category VARCHAR(50),

    -- 정렬 순서
    "order" INTEGER DEFAULT 0,

    -- 상태 (active, inactive, archived)
    status VARCHAR(20) DEFAULT 'active',

    -- 통계
    total_posts INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,

    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_board_types_code ON board_types(code);
CREATE INDEX IF NOT EXISTS idx_board_types_type ON board_types(type);
CREATE INDEX IF NOT EXISTS idx_board_types_status ON board_types(status);
CREATE INDEX IF NOT EXISTS idx_board_types_category ON board_types(category);
CREATE INDEX IF NOT EXISTS idx_board_types_settings ON board_types USING GIN (settings);

-- 코멘트 추가
COMMENT ON TABLE board_types IS '게시판 종류 테이블 - 다양한 게시판 타입 정의';
COMMENT ON COLUMN board_types.type IS '게시판 타입: normal(일반), notice(공지사항)';
COMMENT ON COLUMN board_types.settings IS '게시판 설정 (댓글, 첨부파일, 승인 등)';
COMMENT ON COLUMN board_types.write_roles IS '작성 가능한 역할 목록';
COMMENT ON COLUMN board_types.read_roles IS '읽기 가능한 역할 목록';

-- ==========================================
-- 2. POSTS TABLE (게시글)
-- ==========================================
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(50) PRIMARY KEY,

    -- 게시판 종류 연결
    board_type_id VARCHAR(50) NOT NULL,

    -- 제목 및 내용
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,

    -- 작성자 정보
    author_id VARCHAR(50) NOT NULL,
    author_name VARCHAR(200),
    author_department VARCHAR(50),
    is_anonymous BOOLEAN DEFAULT false,

    -- 게시글 타입
    post_type VARCHAR(20) DEFAULT 'normal', -- normal, notice, important

    -- 상태
    status VARCHAR(20) DEFAULT 'published', -- draft, published, archived, deleted

    -- 공지사항 고정 (상단 고정)
    is_pinned BOOLEAN DEFAULT false,
    pinned_until TIMESTAMP WITH TIME ZONE,

    -- 비밀글
    is_secret BOOLEAN DEFAULT false,

    -- 승인 관련
    is_approved BOOLEAN DEFAULT true,
    approved_by VARCHAR(50),
    approved_at TIMESTAMP WITH TIME ZONE,

    -- 조회수
    view_count INTEGER DEFAULT 0,

    -- 댓글 수
    comment_count INTEGER DEFAULT 0,

    -- 좋아요 수
    like_count INTEGER DEFAULT 0,

    -- 첨부파일 수
    attachment_count INTEGER DEFAULT 0,

    -- 태그 (JSONB 배열)
    tags JSONB DEFAULT '[]'::jsonb,

    -- 메타데이터 (추가 정보)
    metadata JSONB DEFAULT '{}'::jsonb,

    -- 검색용 (Full-Text Search)
    search_vector TSVECTOR,

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_posts_board_type_id ON posts(board_type_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON posts(is_pinned);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_posts_metadata ON posts USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING GIN (search_vector);

-- 복합 인덱스 (게시판별 + 상태 + 날짜)
CREATE INDEX IF NOT EXISTS idx_posts_board_status_date ON posts(board_type_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_board_pinned_date ON posts(board_type_id, is_pinned DESC, created_at DESC);

-- 코멘트 추가
COMMENT ON TABLE posts IS '게시글 테이블';
COMMENT ON COLUMN posts.board_type_id IS '게시판 종류 ID';
COMMENT ON COLUMN posts.post_type IS 'normal(일반), notice(공지), important(중요)';
COMMENT ON COLUMN posts.status IS 'draft(임시저장), published(게시됨), archived(보관), deleted(삭제됨)';
COMMENT ON COLUMN posts.is_pinned IS '상단 고정 여부';
COMMENT ON COLUMN posts.is_secret IS '비밀글 여부';
COMMENT ON COLUMN posts.search_vector IS 'Full-Text Search용 벡터';

-- Full-Text Search 트리거 함수
CREATE OR REPLACE FUNCTION posts_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.author_name, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS posts_search_vector_trigger ON posts;
CREATE TRIGGER posts_search_vector_trigger
    BEFORE INSERT OR UPDATE OF title, content, author_name
    ON posts
    FOR EACH ROW
    EXECUTE FUNCTION posts_search_vector_update();

-- ==========================================
-- 3. COMMENTS TABLE (댓글)
-- ==========================================
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(50) PRIMARY KEY,

    -- 게시글 연결
    post_id VARCHAR(50) NOT NULL,

    -- 부모 댓글 (대댓글용)
    parent_id VARCHAR(50),

    -- 작성자 정보
    author_id VARCHAR(50) NOT NULL,
    author_name VARCHAR(200),
    is_anonymous BOOLEAN DEFAULT false,

    -- 내용
    content TEXT NOT NULL,

    -- 상태
    status VARCHAR(20) DEFAULT 'published', -- published, deleted, reported

    -- 좋아요 수
    like_count INTEGER DEFAULT 0,

    -- 깊이 (depth: 0=댓글, 1=대댓글)
    depth INTEGER DEFAULT 0,

    -- 메타데이터
    metadata JSONB DEFAULT '{}'::jsonb,

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at ASC);

-- 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_post_status ON comments(post_id, status, created_at ASC);

-- 코멘트 추가
COMMENT ON TABLE comments IS '댓글 테이블';
COMMENT ON COLUMN comments.parent_id IS '부모 댓글 ID (대댓글인 경우)';
COMMENT ON COLUMN comments.depth IS '댓글 깊이 (0: 댓글, 1: 대댓글)';

-- ==========================================
-- 4. ATTACHMENTS TABLE (첨부파일)
-- ==========================================
CREATE TABLE IF NOT EXISTS attachments (
    id VARCHAR(50) PRIMARY KEY,

    -- 게시글 연결
    post_id VARCHAR(50) NOT NULL,

    -- 파일 정보
    original_filename VARCHAR(500) NOT NULL,
    stored_filename VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    file_extension VARCHAR(20),

    -- 이미지 메타데이터
    width INTEGER,
    height INTEGER,
    thumbnail_path VARCHAR(1000),

    -- 업로드 정보
    uploaded_by VARCHAR(50) NOT NULL,

    -- 다운로드 통계
    download_count INTEGER DEFAULT 0,

    -- 메타데이터
    metadata JSONB DEFAULT '{}'::jsonb,

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_attachments_post_id ON attachments(post_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON attachments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attachments_mime_type ON attachments(mime_type);

-- 코멘트 추가
COMMENT ON TABLE attachments IS '첨부파일 테이블';
COMMENT ON COLUMN attachments.stored_filename IS 'UUID 기반 저장 파일명';
COMMENT ON COLUMN attachments.file_path IS '실제 파일 저장 경로';

-- ==========================================
-- 5. POST_VIEWS TABLE (조회 기록)
-- ==========================================
CREATE TABLE IF NOT EXISTS post_views (
    id VARCHAR(50) PRIMARY KEY,
    post_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50),
    ip_address VARCHAR(50),
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at DESC);

-- 중복 조회 방지용 유니크 인덱스 (같은 날 같은 사용자가 같은 게시글을 여러 번 조회해도 1회만 카운트)
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_views_unique ON post_views(post_id, user_id, DATE(viewed_at))
WHERE user_id IS NOT NULL;

-- 코멘트 추가
COMMENT ON TABLE post_views IS '게시글 조회 기록 테이블';
COMMENT ON COLUMN post_views.user_id IS '사용자 ID (비로그인 시 NULL)';

-- ==========================================
-- 6. POST_LIKES TABLE (좋아요)
-- ==========================================
CREATE TABLE IF NOT EXISTS post_likes (
    id VARCHAR(50) PRIMARY KEY,
    post_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(post_id, user_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- 코멘트 추가
COMMENT ON TABLE post_likes IS '게시글 좋아요 테이블';

-- ==========================================
-- 7. COMMENT_LIKES TABLE (댓글 좋아요)
-- ==========================================
CREATE TABLE IF NOT EXISTS comment_likes (
    id VARCHAR(50) PRIMARY KEY,
    comment_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(comment_id, user_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- 코멘트 추가
COMMENT ON TABLE comment_likes IS '댓글 좋아요 테이블';

-- ==========================================
-- 8. MENUS TABLE 수정 (board_type_id 컬럼 추가)
-- ==========================================
-- 기존 menus 테이블에 board_type_id 컬럼 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'menus' AND column_name = 'board_type_id'
    ) THEN
        ALTER TABLE menus ADD COLUMN board_type_id VARCHAR(50);
        CREATE INDEX idx_menus_board_type_id ON menus(board_type_id);
        COMMENT ON COLUMN menus.board_type_id IS '게시판 종류 ID - 메뉴와 게시판 연결';
    END IF;
END $$;

-- ==========================================
-- 9. 트리거: 게시글 카운트 자동 업데이트
-- ==========================================

-- 게시글 생성/삭제 시 board_types의 total_posts 업데이트
CREATE OR REPLACE FUNCTION update_board_type_post_count() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'published') THEN
        UPDATE board_types SET total_posts = total_posts + 1
        WHERE id = NEW.board_type_id;
    ELSIF (TG_OP = 'DELETE' AND OLD.status = 'published') THEN
        UPDATE board_types SET total_posts = GREATEST(total_posts - 1, 0)
        WHERE id = OLD.board_type_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.status != 'published' AND NEW.status = 'published') THEN
            UPDATE board_types SET total_posts = total_posts + 1
            WHERE id = NEW.board_type_id;
        ELSIF (OLD.status = 'published' AND NEW.status != 'published') THEN
            UPDATE board_types SET total_posts = GREATEST(total_posts - 1, 0)
            WHERE id = NEW.board_type_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_board_type_post_count_trigger ON posts;
CREATE TRIGGER update_board_type_post_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_board_type_post_count();

-- 댓글 생성/삭제 시 posts의 comment_count 업데이트
CREATE OR REPLACE FUNCTION update_post_comment_count() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'published') THEN
        UPDATE posts SET comment_count = comment_count + 1
        WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE' AND OLD.status = 'published') THEN
        UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0)
        WHERE id = OLD.post_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.status != 'published' AND NEW.status = 'published') THEN
            UPDATE posts SET comment_count = comment_count + 1
            WHERE id = NEW.post_id;
        ELSIF (OLD.status = 'published' AND NEW.status != 'published') THEN
            UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0)
            WHERE id = NEW.post_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_comment_count_trigger ON comments;
CREATE TRIGGER update_post_comment_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comment_count();

-- 첨부파일 생성/삭제 시 posts의 attachment_count 업데이트
CREATE OR REPLACE FUNCTION update_post_attachment_count() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE posts SET attachment_count = attachment_count + 1
        WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE posts SET attachment_count = GREATEST(attachment_count - 1, 0)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_attachment_count_trigger ON attachments;
CREATE TRIGGER update_post_attachment_count_trigger
    AFTER INSERT OR DELETE ON attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_attachment_count();

-- ==========================================
-- 완료 메시지
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE '통합 게시판 시스템 스키마 생성 완료';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '생성된 테이블:';
    RAISE NOTICE '  - board_types (게시판 종류)';
    RAISE NOTICE '  - posts (게시글)';
    RAISE NOTICE '  - comments (댓글)';
    RAISE NOTICE '  - attachments (첨부파일)';
    RAISE NOTICE '  - post_views (조회 기록)';
    RAISE NOTICE '  - post_likes (게시글 좋아요)';
    RAISE NOTICE '  - comment_likes (댓글 좋아요)';
    RAISE NOTICE '수정된 테이블:';
    RAISE NOTICE '  - menus (board_type_id 컬럼 추가)';
    RAISE NOTICE '===========================================';
END $$;
