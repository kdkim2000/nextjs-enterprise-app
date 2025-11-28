-- ==========================================
-- CLAUDE CODE CONVERSATIONS TABLES
-- Claude Code 대화 저장 테이블
-- ==========================================
--
-- 목적: Claude Code와 나눈 대화를 저장하여 학습 자료로 활용
-- 구조:
--   - conversations: 대화 세션
--   - conversation_messages: 개별 메시지
--   - conversation_code_changes: 코드 변경사항
--   - conversation_tags: 태그
--   - conversation_tag_mappings: 대화-태그 연결
--
-- ==========================================

-- 1. 대화 세션 테이블
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(500),                          -- 대화 제목/요약
    project_path VARCHAR(1000),                  -- 프로젝트 경로
    project_name VARCHAR(200),                   -- 프로젝트 이름
    branch_name VARCHAR(200),                    -- Git 브랜치
    summary TEXT,                                -- AI가 생성한 요약
    learning_points TEXT,                        -- 핵심 학습 포인트
    difficulty_level VARCHAR(20),                -- easy/medium/hard
    category VARCHAR(100),                       -- bug-fix, feature, refactor, learning, debugging 등
    total_messages INTEGER DEFAULT 0,            -- 총 메시지 수
    total_tokens INTEGER DEFAULT 0,              -- 총 토큰 수
    duration_minutes INTEGER,                    -- 대화 소요 시간 (분)
    status VARCHAR(20) DEFAULT 'active',         -- active, archived, starred
    source VARCHAR(50) DEFAULT 'claude-code',    -- 대화 소스 (claude-code, manual 등)
    original_session_id VARCHAR(100),            -- Claude Code 원본 세션 ID
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_conversations_project ON conversations(project_name);
CREATE INDEX IF NOT EXISTS idx_conversations_category ON conversations(category);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_started_at ON conversations(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_difficulty ON conversations(difficulty_level);

-- 전문 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_conversations_title_search ON conversations
    USING gin(to_tsvector('english', COALESCE(title, '')));
CREATE INDEX IF NOT EXISTS idx_conversations_summary_search ON conversations
    USING gin(to_tsvector('english', COALESCE(summary, '')));

-- 2. 메시지 테이블
CREATE TABLE IF NOT EXISTS conversation_messages (
    id VARCHAR(50) PRIMARY KEY,
    conversation_id VARCHAR(50) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,                   -- 'user' or 'assistant'
    content TEXT NOT NULL,                       -- 메시지 내용
    content_type VARCHAR(50) DEFAULT 'text',     -- text, code, error, command 등
    token_count INTEGER,                         -- 토큰 수
    "order" INTEGER NOT NULL,                    -- 메시지 순서
    has_code BOOLEAN DEFAULT FALSE,              -- 코드 포함 여부
    has_error BOOLEAN DEFAULT FALSE,             -- 에러 관련 여부
    tool_calls JSONB,                            -- 도구 호출 정보
    metadata JSONB,                              -- 추가 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_role ON conversation_messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_order ON conversation_messages(conversation_id, "order");
CREATE INDEX IF NOT EXISTS idx_messages_has_code ON conversation_messages(has_code) WHERE has_code = TRUE;

-- 전문 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON conversation_messages
    USING gin(to_tsvector('english', content));

-- 3. 코드 변경사항 테이블
CREATE TABLE IF NOT EXISTS conversation_code_changes (
    id VARCHAR(50) PRIMARY KEY,
    conversation_id VARCHAR(50) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_id VARCHAR(50) REFERENCES conversation_messages(id) ON DELETE SET NULL,
    file_path VARCHAR(1000) NOT NULL,            -- 파일 경로
    file_name VARCHAR(255),                      -- 파일 이름
    change_type VARCHAR(20) NOT NULL,            -- create, edit, delete, read
    language VARCHAR(50),                        -- 프로그래밍 언어
    code_before TEXT,                            -- 변경 전 코드
    code_after TEXT,                             -- 변경 후 코드
    diff_content TEXT,                           -- diff 내용
    lines_added INTEGER DEFAULT 0,               -- 추가된 라인 수
    lines_removed INTEGER DEFAULT 0,             -- 삭제된 라인 수
    explanation TEXT,                            -- 변경 이유 설명
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_code_changes_conversation ON conversation_code_changes(conversation_id);
CREATE INDEX IF NOT EXISTS idx_code_changes_file ON conversation_code_changes(file_path);
CREATE INDEX IF NOT EXISTS idx_code_changes_type ON conversation_code_changes(change_type);
CREATE INDEX IF NOT EXISTS idx_code_changes_language ON conversation_code_changes(language);

-- 4. 태그 테이블
CREATE TABLE IF NOT EXISTS conversation_tags (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,           -- 태그 이름
    name_ko VARCHAR(100),                        -- 한글 이름
    description TEXT,                            -- 태그 설명
    color VARCHAR(20) DEFAULT '#6B7280',         -- 태그 색상
    category VARCHAR(50),                        -- 태그 카테고리 (tech, topic, difficulty 등)
    usage_count INTEGER DEFAULT 0,               -- 사용 횟수
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_tags_name ON conversation_tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_category ON conversation_tags(category);

-- 5. 대화-태그 연결 테이블
CREATE TABLE IF NOT EXISTS conversation_tag_mappings (
    conversation_id VARCHAR(50) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    tag_id VARCHAR(50) NOT NULL REFERENCES conversation_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (conversation_id, tag_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_tag_mappings_conversation ON conversation_tag_mappings(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tag_mappings_tag ON conversation_tag_mappings(tag_id);

-- 6. 기본 태그 데이터 삽입
INSERT INTO conversation_tags (id, name, name_ko, description, color, category) VALUES
-- 기술 태그
('TAG-001', 'react', 'React', 'React 관련 대화', '#61DAFB', 'tech'),
('TAG-002', 'nextjs', 'Next.js', 'Next.js 관련 대화', '#000000', 'tech'),
('TAG-003', 'typescript', 'TypeScript', 'TypeScript 관련 대화', '#3178C6', 'tech'),
('TAG-004', 'nodejs', 'Node.js', 'Node.js 관련 대화', '#339933', 'tech'),
('TAG-005', 'postgresql', 'PostgreSQL', 'PostgreSQL 관련 대화', '#4169E1', 'tech'),
('TAG-006', 'css', 'CSS', 'CSS/스타일링 관련 대화', '#1572B6', 'tech'),
('TAG-007', 'api', 'API', 'API 설계/개발 관련 대화', '#FF6B6B', 'tech'),
('TAG-008', 'database', 'Database', '데이터베이스 관련 대화', '#F29111', 'tech'),
-- 주제 태그
('TAG-101', 'bug-fix', '버그 수정', '버그 수정 관련 대화', '#EF4444', 'topic'),
('TAG-102', 'feature', '기능 개발', '새 기능 개발 관련 대화', '#22C55E', 'topic'),
('TAG-103', 'refactor', '리팩토링', '코드 리팩토링 관련 대화', '#A855F7', 'topic'),
('TAG-104', 'debugging', '디버깅', '디버깅 과정 관련 대화', '#F97316', 'topic'),
('TAG-105', 'performance', '성능 최적화', '성능 최적화 관련 대화', '#06B6D4', 'topic'),
('TAG-106', 'security', '보안', '보안 관련 대화', '#DC2626', 'topic'),
('TAG-107', 'testing', '테스트', '테스트 관련 대화', '#84CC16', 'topic'),
('TAG-108', 'architecture', '아키텍처', '아키텍처 설계 관련 대화', '#8B5CF6', 'topic'),
-- 난이도 태그
('TAG-201', 'beginner', '초급', '초급 수준 대화', '#22C55E', 'difficulty'),
('TAG-202', 'intermediate', '중급', '중급 수준 대화', '#EAB308', 'difficulty'),
('TAG-203', 'advanced', '고급', '고급 수준 대화', '#EF4444', 'difficulty')
ON CONFLICT (id) DO NOTHING;

-- 7. 통계 뷰 생성
CREATE OR REPLACE VIEW conversation_stats AS
SELECT
    COUNT(*) as total_conversations,
    COUNT(*) FILTER (WHERE status = 'active') as active_conversations,
    COUNT(*) FILTER (WHERE status = 'starred') as starred_conversations,
    SUM(total_messages) as total_messages,
    SUM(total_tokens) as total_tokens,
    AVG(duration_minutes)::INTEGER as avg_duration_minutes,
    COUNT(DISTINCT category) as categories_count,
    COUNT(DISTINCT project_name) as projects_count
FROM conversations;

-- 8. 카테고리별 통계 뷰
CREATE OR REPLACE VIEW conversation_category_stats AS
SELECT
    category,
    COUNT(*) as conversation_count,
    SUM(total_messages) as total_messages,
    AVG(duration_minutes)::INTEGER as avg_duration
FROM conversations
WHERE category IS NOT NULL
GROUP BY category
ORDER BY conversation_count DESC;

-- 9. 메시지 수 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE conversations
        SET total_messages = total_messages + 1,
            updated_at = NOW()
        WHERE id = NEW.conversation_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE conversations
        SET total_messages = total_messages - 1,
            updated_at = NOW()
        WHERE id = OLD.conversation_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_message_count ON conversation_messages;
CREATE TRIGGER trigger_update_message_count
    AFTER INSERT OR DELETE ON conversation_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_message_count();

-- 10. 태그 사용 횟수 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE conversation_tags
        SET usage_count = usage_count + 1
        WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE conversation_tags
        SET usage_count = usage_count - 1
        WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tag_usage ON conversation_tag_mappings;
CREATE TRIGGER trigger_update_tag_usage
    AFTER INSERT OR DELETE ON conversation_tag_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_usage_count();

-- 11. 코멘트 추가
COMMENT ON TABLE conversations IS 'Claude Code 대화 세션 저장 테이블';
COMMENT ON TABLE conversation_messages IS '대화 메시지 저장 테이블';
COMMENT ON TABLE conversation_code_changes IS '대화 중 발생한 코드 변경사항 저장 테이블';
COMMENT ON TABLE conversation_tags IS '대화 분류용 태그 테이블';
COMMENT ON TABLE conversation_tag_mappings IS '대화-태그 연결 테이블';

-- 12. 확인 쿼리
SELECT 'conversations table created' as status, COUNT(*) as count FROM conversations;
SELECT 'conversation_messages table created' as status, COUNT(*) as count FROM conversation_messages;
SELECT 'conversation_code_changes table created' as status, COUNT(*) as count FROM conversation_code_changes;
SELECT 'conversation_tags created' as status, COUNT(*) as count FROM conversation_tags;
