--
-- PostgreSQL database dump
--


-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: posts_search_vector_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.posts_search_vector_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.author_name, '')), 'C');
    RETURN NEW;
END;
$$;


--
-- Name: update_answer_quality_score(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_answer_quality_score() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update quality score based on likes and helpful marks
    -- Score = (likes * 2) + (helpful_count * 3) + (is_accepted * 100)
    UPDATE comments
    SET quality_score =
        (like_count * 2) +
        (helpful_count * 3) +
        (CASE WHEN is_accepted THEN 100 ELSE 0 END)
    WHERE id = COALESCE(NEW.id, OLD.id);

    RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: update_attachment_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_attachment_stats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE attachments SET file_count = file_count + 1, total_size = total_size + NEW.file_size, updated_at = NOW() WHERE id = NEW.attachment_id;
          RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE attachments SET file_count = file_count - 1, total_size = total_size - OLD.file_size, updated_at = NOW() WHERE id = OLD.attachment_id;
          RETURN OLD;
        END IF;
        RETURN NULL;
      END;
      $$;


--
-- Name: update_board_type_post_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_board_type_post_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: update_comment_helpful_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_comment_helpful_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments
        SET helpful_count = helpful_count + 1
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments
        SET helpful_count = GREATEST(0, helpful_count - 1)
        WHERE id = OLD.comment_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: update_conversation_message_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_conversation_message_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: update_mail_folder_counts(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_mail_folder_counts() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update old folder counts
    IF TG_OP = 'UPDATE' AND OLD.folder_id IS NOT NULL THEN
        UPDATE mail_folders SET
            message_count = (SELECT COUNT(*) FROM mail_recipients WHERE folder_id = OLD.folder_id AND is_deleted = false),
            unread_count = (SELECT COUNT(*) FROM mail_recipients WHERE folder_id = OLD.folder_id AND is_read = false AND is_deleted = false)
        WHERE id = OLD.folder_id;
    END IF;

    -- Update new folder counts
    IF NEW.folder_id IS NOT NULL THEN
        UPDATE mail_folders SET
            message_count = (SELECT COUNT(*) FROM mail_recipients WHERE folder_id = NEW.folder_id AND is_deleted = false),
            unread_count = (SELECT COUNT(*) FROM mail_recipients WHERE folder_id = NEW.folder_id AND is_read = false AND is_deleted = false)
        WHERE id = NEW.folder_id;
    END IF;

    RETURN NEW;
END;
$$;


--
-- Name: update_mail_message_preview(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_mail_message_preview() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.body IS NOT NULL AND (OLD.body IS DISTINCT FROM NEW.body OR TG_OP = 'INSERT') THEN
        NEW.preview := LEFT(REGEXP_REPLACE(NEW.body, E'<[^>]+>', '', 'g'), 200);
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: update_post_attachment_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_post_attachment_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: update_post_comment_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_post_comment_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: update_question_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_question_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- When a new top-level comment (answer) is added
    IF TG_OP = 'INSERT' AND NEW.parent_id IS NULL THEN
        UPDATE posts
        SET
            question_status = CASE
                WHEN question_status = 'unanswered' THEN 'answered'
                ELSE question_status
            END,
            answer_count = answer_count + 1
        WHERE id = NEW.post_id;
    END IF;

    -- When a comment is deleted
    IF TG_OP = 'DELETE' AND OLD.parent_id IS NULL THEN
        UPDATE posts p
        SET
            answer_count = GREATEST(0, answer_count - 1),
            question_status = CASE
                WHEN (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND parent_id IS NULL AND deleted_at IS NULL) = 1
                THEN 'unanswered'
                ELSE question_status
            END
        WHERE id = OLD.post_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: update_tag_usage_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_tag_usage_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: FUNCTION update_updated_at_column(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates the updated_at column to current timestamp';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: answer_helpful; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answer_helpful (
    id character varying(50) NOT NULL,
    comment_id character varying(50) NOT NULL,
    user_id character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE answer_helpful; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.answer_helpful IS 'Tracks which users marked answers as helpful';


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_settings (
    key character varying(100) NOT NULL,
    value text,
    value_type character varying(20) DEFAULT 'string'::character varying NOT NULL,
    category character varying(50) NOT NULL,
    is_ready boolean DEFAULT false NOT NULL,
    description_en text,
    description_ko text,
    description_zh text,
    description_vi text,
    display_order integer DEFAULT 0,
    is_sensitive boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    updated_by character varying(50),
    is_applied boolean DEFAULT false
);


--
-- Name: COLUMN app_settings.is_sensitive; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.app_settings.is_sensitive IS 'Whether this setting contains sensitive information (passwords, keys)';


--
-- Name: attachment_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attachment_files (
    id character varying(50) NOT NULL,
    attachment_id character varying(50) NOT NULL,
    original_filename character varying(500) NOT NULL,
    stored_filename character varying(500) NOT NULL,
    file_extension character varying(50),
    mime_type character varying(200),
    file_size bigint NOT NULL,
    storage_path character varying(1000) NOT NULL,
    full_path character varying(1500),
    checksum character varying(100),
    is_image boolean DEFAULT false,
    image_width integer,
    image_height integer,
    thumbnail_path character varying(1000),
    download_count integer DEFAULT 0,
    "order" integer DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying,
    created_by character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


--
-- Name: attachment_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attachment_types (
    id character varying(50) NOT NULL,
    code character varying(100) NOT NULL,
    name_en character varying(200),
    name_ko character varying(200),
    name_zh character varying(200),
    name_vi character varying(200),
    description_en text,
    description_ko text,
    description_zh text,
    description_vi text,
    storage_path character varying(500) NOT NULL,
    max_file_count integer DEFAULT 5,
    max_file_size bigint DEFAULT 10485760,
    max_total_size bigint DEFAULT 52428800,
    allowed_extensions text[],
    allowed_mime_types text[],
    status character varying(20) DEFAULT 'active'::character varying,
    "order" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE attachment_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.attachment_types IS '첨부파일 종류 관리 테이블';


--
-- Name: COLUMN attachment_types.code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.attachment_types.code IS '첨부파일 종류 코드';


--
-- Name: COLUMN attachment_types.storage_path; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.attachment_types.storage_path IS '파일 저장 경로';


--
-- Name: COLUMN attachment_types.max_file_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.attachment_types.max_file_count IS '최대 첨부 파일 개수';


--
-- Name: COLUMN attachment_types.max_file_size; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.attachment_types.max_file_size IS '최대 파일 크기 (바이트)';


--
-- Name: COLUMN attachment_types.max_total_size; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.attachment_types.max_total_size IS '최대 총 용량 (바이트)';


--
-- Name: COLUMN attachment_types.allowed_extensions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.attachment_types.allowed_extensions IS '허용 파일 확장자 배열';


--
-- Name: COLUMN attachment_types.allowed_mime_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.attachment_types.allowed_mime_types IS '허용 MIME 타입 배열';


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attachments (
    id character varying(50) NOT NULL,
    attachment_type_id character varying(50) NOT NULL,
    reference_type character varying(100),
    reference_id character varying(100),
    title character varying(500),
    description text,
    file_count integer DEFAULT 0,
    total_size bigint DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying,
    created_by character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


--
-- Name: board_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.board_types (
    id character varying(50) NOT NULL,
    code character varying(100) NOT NULL,
    name_en character varying(200),
    name_ko character varying(200),
    name_zh character varying(200),
    name_vi character varying(200),
    description_en text,
    description_ko text,
    description_zh text,
    description_vi text,
    type character varying(20) DEFAULT 'normal'::character varying NOT NULL,
    settings jsonb DEFAULT '{"allowLikes": true, "allowReply": true, "showAuthor": true, "postsPerPage": 20, "allowComments": true, "notifyOnReply": true, "allowAnonymous": false, "maxAttachments": 5, "requireApproval": false, "allowAttachments": true, "allowedFileTypes": ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx", "zip"], "maxAttachmentSize": 10485760}'::jsonb,
    write_roles jsonb DEFAULT '["admin", "manager", "user"]'::jsonb,
    read_roles jsonb DEFAULT '["admin", "manager", "user", "guest"]'::jsonb,
    category character varying(50),
    "order" integer DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying,
    total_posts integer DEFAULT 0,
    total_views integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by character varying(50),
    updated_by character varying(50)
);


--
-- Name: TABLE board_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.board_types IS '게시판 종류 테이블 - 다양한 게시판 타입 정의';


--
-- Name: COLUMN board_types.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.board_types.type IS '게시판 타입: normal(일반), notice(공지사항)';


--
-- Name: COLUMN board_types.settings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.board_types.settings IS '게시판 설정 (댓글, 첨부파일, 승인 등)';


--
-- Name: COLUMN board_types.write_roles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.board_types.write_roles IS '작성 가능한 역할 목록';


--
-- Name: COLUMN board_types.read_roles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.board_types.read_roles IS '읽기 가능한 역할 목록';


--
-- Name: checksheet_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checksheet_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    parent_id uuid,
    sort_order integer DEFAULT 0 NOT NULL,
    item_code character varying(50),
    item_name character varying(200) NOT NULL,
    item_type character varying(30) NOT NULL,
    options jsonb,
    required boolean DEFAULT false,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT checksheet_items_item_type_check CHECK (((item_type)::text = ANY (ARRAY[('checkbox'::character varying)::text, ('text'::character varying)::text, ('number'::character varying)::text, ('select'::character varying)::text, ('photo'::character varying)::text, ('signature'::character varying)::text, ('date'::character varying)::text, ('time'::character varying)::text])))
);


--
-- Name: checksheet_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checksheet_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    category character varying(100),
    version integer DEFAULT 1,
    status character varying(20) DEFAULT 'active'::character varying,
    created_by character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT checksheet_templates_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text, ('archived'::character varying)::text])))
);


--
-- Name: code_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.code_types (
    id character varying(50) NOT NULL,
    code character varying(100) NOT NULL,
    name_en character varying(200),
    name_ko character varying(200),
    name_zh character varying(200),
    name_vi character varying(200),
    description_en text,
    description_ko text,
    description_zh text,
    description_vi text,
    "order" integer,
    status character varying(20),
    category character varying(50),
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE code_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.code_types IS 'Code type master data with multi-language support';


--
-- Name: codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.codes (
    id character varying(50) NOT NULL,
    code_type character varying(100) NOT NULL,
    code character varying(100) NOT NULL,
    name_en character varying(200),
    name_ko character varying(200),
    name_zh character varying(200),
    name_vi character varying(200),
    description_en text,
    description_ko text,
    description_zh text,
    description_vi text,
    "order" integer,
    status character varying(20),
    parent_code character varying(100),
    attributes jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE codes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.codes IS 'Code master data with multi-language support';


--
-- Name: comment_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment_likes (
    id character varying(50) NOT NULL,
    comment_id character varying(50) NOT NULL,
    user_id character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE comment_likes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.comment_likes IS '댓글 좋아요 테이블';


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id character varying(50) NOT NULL,
    post_id character varying(50) NOT NULL,
    parent_id character varying(50),
    author_id character varying(50) NOT NULL,
    author_name character varying(200),
    is_anonymous boolean DEFAULT false,
    content text NOT NULL,
    status character varying(20) DEFAULT 'published'::character varying,
    like_count integer DEFAULT 0,
    depth integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    is_accepted boolean DEFAULT false,
    accepted_at timestamp with time zone,
    helpful_count integer DEFAULT 0,
    quality_score integer DEFAULT 0
);


--
-- Name: TABLE comments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.comments IS '댓글 테이블';


--
-- Name: COLUMN comments.parent_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.comments.parent_id IS '부모 댓글 ID (대댓글인 경우)';


--
-- Name: COLUMN comments.depth; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.comments.depth IS '댓글 깊이 (0: 댓글, 1: 대댓글)';


--
-- Name: COLUMN comments.is_accepted; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.comments.is_accepted IS 'Whether this answer is accepted by the question author';


--
-- Name: COLUMN comments.accepted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.comments.accepted_at IS 'When this answer was accepted';


--
-- Name: COLUMN comments.helpful_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.comments.helpful_count IS 'Number of users who found this answer helpful';


--
-- Name: COLUMN comments.quality_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.comments.quality_score IS 'Calculated quality score for ranking answers';


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id character varying(50) NOT NULL,
    title character varying(500),
    project_path character varying(1000),
    project_name character varying(200),
    branch_name character varying(200),
    summary text,
    learning_points text,
    difficulty_level character varying(20),
    category character varying(100),
    total_messages integer DEFAULT 0,
    total_tokens integer DEFAULT 0,
    duration_minutes integer,
    status character varying(20) DEFAULT 'active'::character varying,
    source character varying(50) DEFAULT 'claude-code'::character varying,
    original_session_id character varying(100),
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE conversations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.conversations IS 'Claude Code 대화 세션 저장 테이블';


--
-- Name: conversation_category_stats; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.conversation_category_stats AS
 SELECT category,
    count(*) AS conversation_count,
    sum(total_messages) AS total_messages,
    (avg(duration_minutes))::integer AS avg_duration
   FROM public.conversations
  WHERE (category IS NOT NULL)
  GROUP BY category
  ORDER BY (count(*)) DESC;


--
-- Name: conversation_code_changes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_code_changes (
    id character varying(50) NOT NULL,
    conversation_id character varying(50) NOT NULL,
    message_id character varying(50),
    file_path character varying(1000) NOT NULL,
    file_name character varying(255),
    change_type character varying(20) NOT NULL,
    language character varying(50),
    code_before text,
    code_after text,
    diff_content text,
    lines_added integer DEFAULT 0,
    lines_removed integer DEFAULT 0,
    explanation text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE conversation_code_changes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.conversation_code_changes IS '대화 중 발생한 코드 변경사항 저장 테이블';


--
-- Name: conversation_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_messages (
    id character varying(50) NOT NULL,
    conversation_id character varying(50) NOT NULL,
    role character varying(20) NOT NULL,
    content text NOT NULL,
    content_type character varying(50) DEFAULT 'text'::character varying,
    token_count integer,
    "order" integer NOT NULL,
    has_code boolean DEFAULT false,
    has_error boolean DEFAULT false,
    tool_calls jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE conversation_messages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.conversation_messages IS '대화 메시지 저장 테이블';


--
-- Name: conversation_stats; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.conversation_stats AS
 SELECT count(*) AS total_conversations,
    count(*) FILTER (WHERE ((status)::text = 'active'::text)) AS active_conversations,
    count(*) FILTER (WHERE ((status)::text = 'starred'::text)) AS starred_conversations,
    sum(total_messages) AS total_messages,
    sum(total_tokens) AS total_tokens,
    (avg(duration_minutes))::integer AS avg_duration_minutes,
    count(DISTINCT category) AS categories_count,
    count(DISTINCT project_name) AS projects_count
   FROM public.conversations;


--
-- Name: conversation_tag_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_tag_mappings (
    conversation_id character varying(50) NOT NULL,
    tag_id character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE conversation_tag_mappings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.conversation_tag_mappings IS '대화-태그 연결 테이블';


--
-- Name: conversation_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_tags (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    name_ko character varying(100),
    description text,
    color character varying(20) DEFAULT '#6B7280'::character varying,
    category character varying(50),
    usage_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE conversation_tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.conversation_tags IS '대화 분류용 태그 테이블';


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id character varying(50) NOT NULL,
    code character varying(50) NOT NULL,
    name_en character varying(200),
    name_ko character varying(200),
    name_zh character varying(200),
    name_vi character varying(200),
    description_en text,
    description_ko text,
    description_zh text,
    description_vi text,
    parent_id character varying(50),
    manager_id character varying(50),
    level integer,
    "order" integer,
    status character varying(20),
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE departments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.departments IS 'Department hierarchy with multi-language support';


--
-- Name: help; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.help (
    id character varying(50) NOT NULL,
    program_id character varying(50),
    title text,
    content text,
    sections jsonb,
    faq jsonb,
    tips jsonb,
    troubleshooting jsonb,
    video_url character varying(500),
    related_topics jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_by character varying(50),
    updated_by character varying(50),
    language character varying(10) DEFAULT 'en'::character varying,
    status character varying(20) DEFAULT 'draft'::character varying
);


--
-- Name: TABLE help; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.help IS 'Help documentation for programs';


--
-- Name: inspection_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inspection_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inspection_id uuid NOT NULL,
    item_id uuid NOT NULL,
    value text,
    value_type character varying(30) DEFAULT 'text'::character varying,
    is_passed boolean,
    remarks text,
    photo_urls jsonb,
    recorded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    offline_created_at timestamp with time zone,
    sync_version integer DEFAULT 1,
    CONSTRAINT inspection_results_value_type_check CHECK (((value_type)::text = ANY (ARRAY[('text'::character varying)::text, ('number'::character varying)::text, ('boolean'::character varying)::text, ('json'::character varying)::text])))
);


--
-- Name: inspections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inspections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    inspection_code character varying(50) NOT NULL,
    target_name character varying(200),
    target_id character varying(100),
    inspector_id character varying(50),
    status character varying(20) DEFAULT 'draft'::character varying,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    submitted_at timestamp with time zone,
    location character varying(200),
    notes text,
    sync_status character varying(20) DEFAULT 'synced'::character varying,
    client_id character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    inspection_date date,
    title character varying(200),
    CONSTRAINT inspections_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('in_progress'::character varying)::text, ('completed'::character varying)::text, ('submitted'::character varying)::text]))),
    CONSTRAINT inspections_sync_status_check CHECK (((sync_status)::text = ANY (ARRAY[('synced'::character varying)::text, ('pending'::character varying)::text, ('conflict'::character varying)::text])))
);


--
-- Name: COLUMN inspections.inspection_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inspections.inspection_date IS 'Actual inspection date (when physical inspection occurred)';


--
-- Name: COLUMN inspections.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inspections.title IS 'Inspection title/name';


--
-- Name: logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logs (
    id character varying(50) DEFAULT (gen_random_uuid())::character varying(50) NOT NULL,
    "timestamp" timestamp with time zone,
    method character varying(10),
    path text,
    url text,
    original_url text,
    status_code integer,
    duration character varying(20),
    user_id character varying(50),
    program_id character varying(50),
    ip character varying(50),
    user_agent text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: TABLE logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.logs IS 'System access and operation logs';


--
-- Name: COLUMN logs.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.logs.created_at IS 'Timestamp when the log entry was created';


--
-- Name: COLUMN logs.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.logs.updated_at IS 'Timestamp when the log entry was last updated';


--
-- Name: mail_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mail_messages (
    id character varying(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    sender_id character varying(36) NOT NULL,
    subject character varying(500),
    body text,
    body_html text,
    attachment_id character varying(50),
    send_external boolean DEFAULT false,
    external_status character varying(20) DEFAULT NULL::character varying,
    external_sent_at timestamp with time zone,
    external_error text,
    is_draft boolean DEFAULT true,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT valid_external_status CHECK (((external_status IS NULL) OR ((external_status)::text = ANY (ARRAY[('pending'::character varying)::text, ('sent'::character varying)::text, ('failed'::character varying)::text]))))
);


--
-- Name: TABLE mail_messages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mail_messages IS 'Mail original - 1 record per sent mail';


--
-- Name: COLUMN mail_messages.attachment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mail_messages.attachment_id IS 'Attachment ID (references attachments table, type=MAIL)';


--
-- Name: COLUMN mail_messages.send_external; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mail_messages.send_external IS 'Whether to send to external email';


--
-- Name: COLUMN mail_messages.external_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mail_messages.external_status IS 'External mail status: pending, sent, failed';


--
-- Name: mail_recipients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mail_recipients (
    id character varying(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    message_id character varying(36) NOT NULL,
    recipient_id character varying(36) NOT NULL,
    recipient_type character varying(10) DEFAULT 'to'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT valid_recipient_type CHECK (((recipient_type)::text = ANY (ARRAY[('to'::character varying)::text, ('cc'::character varying)::text, ('bcc'::character varying)::text])))
);


--
-- Name: TABLE mail_recipients; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mail_recipients IS 'Mail recipients list';


--
-- Name: COLUMN mail_recipients.recipient_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mail_recipients.recipient_type IS 'Recipient type: to, cc, bcc';


--
-- Name: mail_user_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mail_user_messages (
    id character varying(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    message_id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    role character varying(10) NOT NULL,
    folder character varying(20) DEFAULT 'inbox'::character varying NOT NULL,
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT valid_folder CHECK (((folder)::text = ANY (ARRAY[('inbox'::character varying)::text, ('sent'::character varying)::text, ('draft'::character varying)::text, ('trash'::character varying)::text]))),
    CONSTRAINT valid_role CHECK (((role)::text = ANY (ARRAY[('sender'::character varying)::text, ('to'::character varying)::text, ('cc'::character varying)::text, ('bcc'::character varying)::text])))
);


--
-- Name: TABLE mail_user_messages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mail_user_messages IS 'User mailbox view - each user''s mail view';


--
-- Name: COLUMN mail_user_messages.role; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mail_user_messages.role IS 'Role in mail: sender, to, cc, bcc';


--
-- Name: COLUMN mail_user_messages.folder; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mail_user_messages.folder IS 'Folder: inbox, sent, draft, trash';


--
-- Name: menus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menus (
    id character varying(50) NOT NULL,
    code character varying(100) NOT NULL,
    name_en character varying(200),
    name_ko character varying(200),
    name_zh character varying(200),
    name_vi character varying(200),
    description_en text,
    description_ko text,
    description_zh text,
    description_vi text,
    path character varying(500),
    icon character varying(100),
    "order" integer,
    parent_id character varying(50),
    level integer,
    program_id character varying(50),
    board_type_id character varying(50),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    mobile_enabled boolean DEFAULT true,
    desktop_enabled boolean DEFAULT true
);


--
-- Name: TABLE menus; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.menus IS 'Menu structure with multi-language support';


--
-- Name: COLUMN menus.board_type_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.board_type_id IS '게시판 종류 ID - 메뉴와 게시판 연결';


--
-- Name: COLUMN menus.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.created_at IS 'Timestamp when the menu was created';


--
-- Name: COLUMN menus.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.updated_at IS 'Timestamp when the menu was last updated';


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id character varying(50) NOT NULL,
    code character varying(100) NOT NULL,
    category character varying(50),
    type character varying(50),
    message_en text,
    message_ko text,
    message_zh text,
    message_vi text,
    description_en text,
    description_ko text,
    description_zh text,
    description_vi text,
    status character varying(20),
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE messages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.messages IS 'System messages with multi-language support';


--
-- Name: mfa_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mfa_codes (
    user_id character varying(50) NOT NULL,
    secret character varying(255),
    backup_codes jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE mfa_codes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mfa_codes IS 'Multi-factor authentication codes';


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    user_id character varying(50) NOT NULL,
    role character varying(50),
    permissions jsonb,
    menu_access jsonb,
    updated_at timestamp with time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: TABLE permissions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.permissions IS 'User permissions and menu access';


--
-- Name: COLUMN permissions.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.permissions.created_at IS 'Timestamp when the permission was created';


--
-- Name: post_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_likes (
    id character varying(50) NOT NULL,
    post_id character varying(50) NOT NULL,
    user_id character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: TABLE post_likes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.post_likes IS '게시글 좋아요 테이블';


--
-- Name: COLUMN post_likes.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.post_likes.updated_at IS 'Timestamp when the like was last updated';


--
-- Name: post_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_views (
    id character varying(50) NOT NULL,
    post_id character varying(50) NOT NULL,
    user_id character varying(50),
    ip_address character varying(50),
    user_agent text,
    viewed_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE post_views; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.post_views IS '게시글 조회 기록 테이블';


--
-- Name: COLUMN post_views.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.post_views.user_id IS '사용자 ID (비로그인 시 NULL)';


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id character varying(50) NOT NULL,
    board_type_id character varying(50) NOT NULL,
    title character varying(500) NOT NULL,
    content text NOT NULL,
    author_id character varying(50) NOT NULL,
    author_name character varying(200),
    author_department character varying(50),
    is_anonymous boolean DEFAULT false,
    post_type character varying(20) DEFAULT 'normal'::character varying,
    status character varying(20) DEFAULT 'published'::character varying,
    is_pinned boolean DEFAULT false,
    pinned_until timestamp with time zone,
    is_secret boolean DEFAULT false,
    is_approved boolean DEFAULT true,
    approved_by character varying(50),
    approved_at timestamp with time zone,
    view_count integer DEFAULT 0,
    comment_count integer DEFAULT 0,
    like_count integer DEFAULT 0,
    attachment_count integer DEFAULT 0,
    tags jsonb DEFAULT '[]'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    search_vector tsvector,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    published_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    show_popup boolean DEFAULT false,
    display_start_date timestamp with time zone,
    display_end_date timestamp with time zone,
    question_status character varying(20) DEFAULT 'unanswered'::character varying,
    accepted_answer_id character varying(50),
    resolved_at timestamp with time zone,
    resolved_by character varying(50),
    answer_count integer DEFAULT 0,
    attachment_id character varying(50)
);


--
-- Name: TABLE posts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.posts IS '게시글 테이블';


--
-- Name: COLUMN posts.board_type_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.board_type_id IS '게시판 종류 ID';


--
-- Name: COLUMN posts.post_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.post_type IS 'normal(일반), notice(공지), important(중요)';


--
-- Name: COLUMN posts.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.status IS 'draft(임시저장), published(게시됨), archived(보관), deleted(삭제됨)';


--
-- Name: COLUMN posts.is_pinned; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.is_pinned IS '상단 고정 여부';


--
-- Name: COLUMN posts.is_secret; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.is_secret IS '비밀글 여부';


--
-- Name: COLUMN posts.search_vector; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.search_vector IS 'Full-Text Search용 벡터';


--
-- Name: COLUMN posts.show_popup; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.show_popup IS '로그인 시 팝업으로 표시할지 여부';


--
-- Name: COLUMN posts.display_start_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.display_start_date IS '게시글 표시 시작일 (팝업 알림용)';


--
-- Name: COLUMN posts.display_end_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.display_end_date IS '게시글 표시 종료일 (팝업 알림용)';


--
-- Name: COLUMN posts.question_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.question_status IS 'Q&A status: unanswered, answered, resolved';


--
-- Name: COLUMN posts.accepted_answer_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.accepted_answer_id IS 'ID of the accepted answer (comment)';


--
-- Name: COLUMN posts.resolved_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.resolved_at IS 'When the question was resolved';


--
-- Name: COLUMN posts.resolved_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.resolved_by IS 'User who marked the question as resolved';


--
-- Name: COLUMN posts.answer_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.answer_count IS 'Number of answers (top-level comments)';


--
-- Name: COLUMN posts.attachment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.attachment_id IS '첨부파일 그룹 ID (attachments.id 참조)';


--
-- Name: programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.programs (
    id character varying(50) NOT NULL,
    code character varying(100) NOT NULL,
    name_en character varying(200),
    name_ko character varying(200),
    name_zh character varying(200),
    name_vi character varying(200),
    description_en text,
    description_ko text,
    description_zh text,
    description_vi text,
    category character varying(50),
    type character varying(50),
    status character varying(20),
    permissions jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE programs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.programs IS 'Program definitions with multi-language support';


--
-- Name: role_program_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_program_mappings (
    id character varying(50) NOT NULL,
    role_id character varying(50) NOT NULL,
    program_code character varying(50) NOT NULL,
    can_view boolean DEFAULT false,
    can_create boolean DEFAULT false,
    can_update boolean DEFAULT false,
    can_delete boolean DEFAULT false,
    created_by character varying(50),
    created_at timestamp with time zone,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: TABLE role_program_mappings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.role_program_mappings IS 'Role to program access mappings';


--
-- Name: COLUMN role_program_mappings.program_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.role_program_mappings.program_code IS 'Program code (references programs.code)';


--
-- Name: COLUMN role_program_mappings.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.role_program_mappings.updated_at IS 'Timestamp when the mapping was last updated';


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(200),
    description text,
    role_type character varying(50),
    manager character varying(50),
    representative character varying(50),
    is_system boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_by character varying(50),
    updated_by character varying(50)
);


--
-- Name: TABLE roles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.roles IS 'User roles and permissions';


--
-- Name: sync_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sync_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id character varying(100) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    operation character varying(20) NOT NULL,
    payload jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    synced_at timestamp with time zone,
    sync_status character varying(20) DEFAULT 'pending'::character varying,
    error_message text,
    retry_count integer DEFAULT 0,
    CONSTRAINT sync_queue_operation_check CHECK (((operation)::text = ANY (ARRAY[('create'::character varying)::text, ('update'::character varying)::text, ('delete'::character varying)::text]))),
    CONSTRAINT sync_queue_sync_status_check CHECK (((sync_status)::text = ANY (ARRAY[('pending'::character varying)::text, ('synced'::character varying)::text, ('failed'::character varying)::text])))
);


--
-- Name: token_blacklist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.token_blacklist (
    token character varying(500) NOT NULL,
    user_id character varying(50),
    expires_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: TABLE token_blacklist; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.token_blacklist IS 'Blacklisted JWT tokens';


--
-- Name: COLUMN token_blacklist.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.token_blacklist.updated_at IS 'Timestamp when the token was last updated';


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_preferences (
    user_id character varying(50) NOT NULL,
    favorite_menus jsonb,
    recent_menus jsonb,
    language character varying(10),
    theme character varying(20),
    rows_per_page integer,
    email_notifications boolean DEFAULT true,
    system_notifications boolean DEFAULT true,
    session_timeout integer,
    updated_at timestamp with time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: TABLE user_preferences; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.user_preferences IS 'User preferences and settings';


--
-- Name: COLUMN user_preferences.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_preferences.created_at IS 'Timestamp when the preference was created';


--
-- Name: user_role_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_role_mappings (
    id character varying(50) NOT NULL,
    user_id character varying(50) NOT NULL,
    role_id character varying(50) NOT NULL,
    assigned_by character varying(50),
    assigned_at timestamp with time zone,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by character varying(50),
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: TABLE user_role_mappings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.user_role_mappings IS 'User to role mappings';


--
-- Name: COLUMN user_role_mappings.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_role_mappings.created_at IS 'Timestamp when the mapping was created';


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying(50) NOT NULL,
    loginid character varying(100) NOT NULL,
    password character varying(255),
    email character varying(200),
    role character varying(50),
    department character varying(50),
    mfa_enabled boolean DEFAULT false,
    sso_enabled boolean DEFAULT false,
    status character varying(20),
    created_at timestamp with time zone,
    last_login timestamp with time zone,
    avatar_url text,
    updated_at timestamp with time zone,
    name_ko character varying(200),
    name_en character varying(200),
    employee_number character varying(50),
    system_key character varying(100),
    last_password_changed timestamp with time zone,
    phone_number character varying(50),
    mobile_number character varying(50),
    user_category character varying(50) DEFAULT 'regular'::character varying,
    "position" character varying(100),
    avatar_image text,
    CONSTRAINT chk_user_category CHECK (((user_category)::text = ANY (ARRAY[('regular'::character varying)::text, ('contractor'::character varying)::text, ('temporary'::character varying)::text, ('external'::character varying)::text, ('admin'::character varying)::text])))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.users IS 'System users';


--
-- Name: COLUMN users.loginid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.loginid IS 'Login ID for authentication';


--
-- Name: COLUMN users.name_ko; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.name_ko IS 'Korean name of the user';


--
-- Name: COLUMN users.name_en; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.name_en IS 'English name of the user';


--
-- Name: COLUMN users.employee_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.employee_number IS 'Employee number (사번)';


--
-- Name: COLUMN users.system_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.system_key IS 'System internal unique key';


--
-- Name: COLUMN users.last_password_changed; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.last_password_changed IS 'Last password change timestamp';


--
-- Name: COLUMN users.phone_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.phone_number IS 'Office phone number';


--
-- Name: COLUMN users.mobile_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.mobile_number IS 'Mobile phone number';


--
-- Name: COLUMN users.user_category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.user_category IS 'User category/type';


--
-- Name: COLUMN users."position"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users."position" IS 'Job position/title (직급)';


--
-- Name: COLUMN users.avatar_image; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.avatar_image IS 'Base64 encoded avatar image with data URI scheme (e.g., data:image/png;base64,...)';


--
-- Name: answer_helpful answer_helpful_comment_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_helpful
    ADD CONSTRAINT answer_helpful_comment_id_user_id_key UNIQUE (comment_id, user_id);


--
-- Name: answer_helpful answer_helpful_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_helpful
    ADD CONSTRAINT answer_helpful_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (key);


--
-- Name: attachment_files attachment_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachment_files
    ADD CONSTRAINT attachment_files_pkey PRIMARY KEY (id);


--
-- Name: attachment_types attachment_types_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachment_types
    ADD CONSTRAINT attachment_types_code_key UNIQUE (code);


--
-- Name: attachment_types attachment_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachment_types
    ADD CONSTRAINT attachment_types_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey1 PRIMARY KEY (id);


--
-- Name: board_types board_types_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_types
    ADD CONSTRAINT board_types_code_key UNIQUE (code);


--
-- Name: board_types board_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_types
    ADD CONSTRAINT board_types_pkey PRIMARY KEY (id);


--
-- Name: checksheet_items checksheet_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checksheet_items
    ADD CONSTRAINT checksheet_items_pkey PRIMARY KEY (id);


--
-- Name: checksheet_templates checksheet_templates_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checksheet_templates
    ADD CONSTRAINT checksheet_templates_code_key UNIQUE (code);


--
-- Name: checksheet_templates checksheet_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checksheet_templates
    ADD CONSTRAINT checksheet_templates_pkey PRIMARY KEY (id);


--
-- Name: code_types code_types_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.code_types
    ADD CONSTRAINT code_types_code_key UNIQUE (code);


--
-- Name: code_types code_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.code_types
    ADD CONSTRAINT code_types_pkey PRIMARY KEY (id);


--
-- Name: codes codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codes
    ADD CONSTRAINT codes_pkey PRIMARY KEY (id);


--
-- Name: comment_likes comment_likes_comment_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_comment_id_user_id_key UNIQUE (comment_id, user_id);


--
-- Name: comment_likes comment_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: conversation_code_changes conversation_code_changes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_code_changes
    ADD CONSTRAINT conversation_code_changes_pkey PRIMARY KEY (id);


--
-- Name: conversation_messages conversation_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT conversation_messages_pkey PRIMARY KEY (id);


--
-- Name: conversation_tag_mappings conversation_tag_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_tag_mappings
    ADD CONSTRAINT conversation_tag_mappings_pkey PRIMARY KEY (conversation_id, tag_id);


--
-- Name: conversation_tags conversation_tags_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_tags
    ADD CONSTRAINT conversation_tags_name_key UNIQUE (name);


--
-- Name: conversation_tags conversation_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_tags
    ADD CONSTRAINT conversation_tags_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: departments departments_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_key UNIQUE (code);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: help help_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.help
    ADD CONSTRAINT help_pkey PRIMARY KEY (id);


--
-- Name: inspection_results inspection_results_inspection_id_item_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspection_results
    ADD CONSTRAINT inspection_results_inspection_id_item_id_key UNIQUE (inspection_id, item_id);


--
-- Name: inspection_results inspection_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspection_results
    ADD CONSTRAINT inspection_results_pkey PRIMARY KEY (id);


--
-- Name: inspections inspections_inspection_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_inspection_code_key UNIQUE (inspection_code);


--
-- Name: inspections inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_pkey PRIMARY KEY (id);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- Name: mail_messages mail_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_messages
    ADD CONSTRAINT mail_messages_pkey PRIMARY KEY (id);


--
-- Name: mail_recipients mail_recipients_message_id_recipient_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_recipients
    ADD CONSTRAINT mail_recipients_message_id_recipient_id_key UNIQUE (message_id, recipient_id);


--
-- Name: mail_recipients mail_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_recipients
    ADD CONSTRAINT mail_recipients_pkey PRIMARY KEY (id);


--
-- Name: mail_user_messages mail_user_messages_message_id_user_id_folder_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_user_messages
    ADD CONSTRAINT mail_user_messages_message_id_user_id_folder_key UNIQUE (message_id, user_id, folder);


--
-- Name: mail_user_messages mail_user_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_user_messages
    ADD CONSTRAINT mail_user_messages_pkey PRIMARY KEY (id);


--
-- Name: menus menus_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_code_key UNIQUE (code);


--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- Name: messages messages_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_code_key UNIQUE (code);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: mfa_codes mfa_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mfa_codes
    ADD CONSTRAINT mfa_codes_pkey PRIMARY KEY (user_id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (user_id);


--
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (id);


--
-- Name: post_likes post_likes_post_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_user_id_key UNIQUE (post_id, user_id);


--
-- Name: post_views post_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_views
    ADD CONSTRAINT post_views_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: programs programs_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_code_key UNIQUE (code);


--
-- Name: programs programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (id);


--
-- Name: role_program_mappings role_program_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_program_mappings
    ADD CONSTRAINT role_program_mappings_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sync_queue sync_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sync_queue
    ADD CONSTRAINT sync_queue_pkey PRIMARY KEY (id);


--
-- Name: token_blacklist token_blacklist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_blacklist
    ADD CONSTRAINT token_blacklist_pkey PRIMARY KEY (token);


--
-- Name: user_role_mappings unique_user_role_active; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_role_mappings
    ADD CONSTRAINT unique_user_role_active UNIQUE (user_id, role_id);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id);


--
-- Name: user_role_mappings user_role_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_role_mappings
    ADD CONSTRAINT user_role_mappings_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_system_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_system_key_key UNIQUE (system_key);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (loginid);


--
-- Name: idx_answer_helpful_comment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_answer_helpful_comment_id ON public.answer_helpful USING btree (comment_id);


--
-- Name: idx_answer_helpful_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_answer_helpful_created_at ON public.answer_helpful USING btree (created_at DESC);


--
-- Name: idx_answer_helpful_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_answer_helpful_user_id ON public.answer_helpful USING btree (user_id);


--
-- Name: idx_app_settings_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_app_settings_category ON public.app_settings USING btree (category);


--
-- Name: idx_app_settings_is_ready; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_app_settings_is_ready ON public.app_settings USING btree (is_ready);


--
-- Name: idx_app_settings_value_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_app_settings_value_type ON public.app_settings USING btree (value_type);


--
-- Name: idx_attachment_files_attachment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attachment_files_attachment ON public.attachment_files USING btree (attachment_id);


--
-- Name: idx_attachment_files_checksum; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attachment_files_checksum ON public.attachment_files USING btree (checksum);


--
-- Name: idx_attachment_types_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attachment_types_code ON public.attachment_types USING btree (code);


--
-- Name: idx_attachment_types_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attachment_types_order ON public.attachment_types USING btree ("order");


--
-- Name: idx_attachment_types_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attachment_types_status ON public.attachment_types USING btree (status);


--
-- Name: idx_attachments_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attachments_reference ON public.attachments USING btree (reference_type, reference_id);


--
-- Name: idx_attachments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attachments_status ON public.attachments USING btree (status);


--
-- Name: idx_attachments_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attachments_type ON public.attachments USING btree (attachment_type_id);


--
-- Name: idx_board_types_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_board_types_category ON public.board_types USING btree (category);


--
-- Name: idx_board_types_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_board_types_code ON public.board_types USING btree (code);


--
-- Name: idx_board_types_settings; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_board_types_settings ON public.board_types USING gin (settings);


--
-- Name: idx_board_types_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_board_types_status ON public.board_types USING btree (status);


--
-- Name: idx_board_types_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_board_types_type ON public.board_types USING btree (type);


--
-- Name: idx_checksheet_items_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_checksheet_items_sort_order ON public.checksheet_items USING btree (template_id, sort_order);


--
-- Name: idx_checksheet_items_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_checksheet_items_template_id ON public.checksheet_items USING btree (template_id);


--
-- Name: idx_checksheet_templates_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_checksheet_templates_category ON public.checksheet_templates USING btree (category);


--
-- Name: idx_checksheet_templates_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_checksheet_templates_code ON public.checksheet_templates USING btree (code);


--
-- Name: idx_checksheet_templates_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_checksheet_templates_status ON public.checksheet_templates USING btree (status);


--
-- Name: idx_code_changes_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_code_changes_conversation ON public.conversation_code_changes USING btree (conversation_id);


--
-- Name: idx_code_changes_file; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_code_changes_file ON public.conversation_code_changes USING btree (file_path);


--
-- Name: idx_code_changes_language; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_code_changes_language ON public.conversation_code_changes USING btree (language);


--
-- Name: idx_code_changes_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_code_changes_type ON public.conversation_code_changes USING btree (change_type);


--
-- Name: idx_code_types_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_code_types_category ON public.code_types USING btree (category);


--
-- Name: idx_code_types_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_code_types_code ON public.code_types USING btree (code);


--
-- Name: idx_code_types_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_code_types_status ON public.code_types USING btree (status);


--
-- Name: idx_codes_attributes; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_codes_attributes ON public.codes USING gin (attributes);


--
-- Name: idx_codes_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_codes_code ON public.codes USING btree (code);


--
-- Name: idx_codes_code_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_codes_code_type ON public.codes USING btree (code_type);


--
-- Name: idx_codes_parent_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_codes_parent_code ON public.codes USING btree (parent_code);


--
-- Name: idx_codes_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_codes_status ON public.codes USING btree (status);


--
-- Name: idx_comment_likes_comment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comment_likes_comment_id ON public.comment_likes USING btree (comment_id);


--
-- Name: idx_comment_likes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comment_likes_user_id ON public.comment_likes USING btree (user_id);


--
-- Name: idx_comments_accepted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_accepted ON public.comments USING btree (is_accepted, post_id) WHERE (is_accepted = true);


--
-- Name: idx_comments_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_author_id ON public.comments USING btree (author_id);


--
-- Name: idx_comments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_created_at ON public.comments USING btree (created_at);


--
-- Name: idx_comments_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_parent_id ON public.comments USING btree (parent_id);


--
-- Name: idx_comments_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_post_id ON public.comments USING btree (post_id);


--
-- Name: idx_comments_post_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_post_status ON public.comments USING btree (post_id, status, created_at);


--
-- Name: idx_comments_quality; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_quality ON public.comments USING btree (post_id, quality_score DESC, created_at DESC);


--
-- Name: idx_comments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_status ON public.comments USING btree (status);


--
-- Name: idx_conversations_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_category ON public.conversations USING btree (category);


--
-- Name: idx_conversations_difficulty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_difficulty ON public.conversations USING btree (difficulty_level);


--
-- Name: idx_conversations_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_project ON public.conversations USING btree (project_name);


--
-- Name: idx_conversations_started_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_started_at ON public.conversations USING btree (started_at DESC);


--
-- Name: idx_conversations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_status ON public.conversations USING btree (status);


--
-- Name: idx_conversations_summary_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_summary_search ON public.conversations USING gin (to_tsvector('english'::regconfig, COALESCE(summary, ''::text)));


--
-- Name: idx_conversations_title_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_title_search ON public.conversations USING gin (to_tsvector('english'::regconfig, (COALESCE(title, ''::character varying))::text));


--
-- Name: idx_departments_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_departments_code ON public.departments USING btree (code);


--
-- Name: idx_departments_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_departments_level ON public.departments USING btree (level);


--
-- Name: idx_departments_manager_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_departments_manager_id ON public.departments USING btree (manager_id);


--
-- Name: idx_departments_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_departments_parent_id ON public.departments USING btree (parent_id);


--
-- Name: idx_departments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_departments_status ON public.departments USING btree (status);


--
-- Name: idx_help_program_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_help_program_id ON public.help USING btree (program_id);


--
-- Name: idx_help_sections; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_help_sections ON public.help USING gin (sections);


--
-- Name: idx_inspection_results_inspection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inspection_results_inspection_id ON public.inspection_results USING btree (inspection_id);


--
-- Name: idx_inspections_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inspections_created_at ON public.inspections USING btree (created_at DESC);


--
-- Name: idx_inspections_inspector_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inspections_inspector_id ON public.inspections USING btree (inspector_id);


--
-- Name: idx_inspections_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inspections_status ON public.inspections USING btree (status);


--
-- Name: idx_inspections_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inspections_template_id ON public.inspections USING btree (template_id);


--
-- Name: idx_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_created_at ON public.logs USING btree (created_at);


--
-- Name: idx_logs_errors; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_errors ON public.logs USING btree ("timestamp" DESC) WHERE (status_code >= 400);


--
-- Name: idx_logs_method; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_method ON public.logs USING btree (method);


--
-- Name: idx_logs_program_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_program_id ON public.logs USING btree (program_id);


--
-- Name: idx_logs_program_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_program_timestamp ON public.logs USING btree (program_id, "timestamp" DESC) WHERE (program_id IS NOT NULL);


--
-- Name: idx_logs_status_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_status_code ON public.logs USING btree (status_code);


--
-- Name: idx_logs_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_timestamp ON public.logs USING btree ("timestamp");


--
-- Name: idx_logs_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_updated_at ON public.logs USING btree (updated_at);


--
-- Name: idx_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_user_id ON public.logs USING btree (user_id);


--
-- Name: idx_logs_user_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_user_timestamp ON public.logs USING btree (user_id, "timestamp" DESC) WHERE (user_id IS NOT NULL);


--
-- Name: idx_mail_messages_attachment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_messages_attachment ON public.mail_messages USING btree (attachment_id) WHERE (attachment_id IS NOT NULL);


--
-- Name: idx_mail_messages_draft; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_messages_draft ON public.mail_messages USING btree (is_draft) WHERE (is_draft = true);


--
-- Name: idx_mail_messages_external; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_messages_external ON public.mail_messages USING btree (send_external, external_status) WHERE (send_external = true);


--
-- Name: idx_mail_messages_sender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_messages_sender ON public.mail_messages USING btree (sender_id);


--
-- Name: idx_mail_messages_sent_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_messages_sent_at ON public.mail_messages USING btree (sent_at DESC) WHERE (sent_at IS NOT NULL);


--
-- Name: idx_mail_recipients_message; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_recipients_message ON public.mail_recipients USING btree (message_id);


--
-- Name: idx_mail_recipients_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_recipients_type ON public.mail_recipients USING btree (message_id, recipient_type);


--
-- Name: idx_mail_recipients_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_recipients_user ON public.mail_recipients USING btree (recipient_id);


--
-- Name: idx_mail_user_messages_message; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_user_messages_message ON public.mail_user_messages USING btree (message_id);


--
-- Name: idx_mail_user_messages_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_user_messages_unread ON public.mail_user_messages USING btree (user_id, folder) WHERE ((is_read = false) AND (is_deleted = false));


--
-- Name: idx_mail_user_messages_user_folder; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mail_user_messages_user_folder ON public.mail_user_messages USING btree (user_id, folder) WHERE (is_deleted = false);


--
-- Name: idx_menus_board_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menus_board_type_id ON public.menus USING btree (board_type_id);


--
-- Name: idx_menus_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menus_code ON public.menus USING btree (code);


--
-- Name: idx_menus_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menus_created_at ON public.menus USING btree (created_at);


--
-- Name: idx_menus_desktop_enabled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menus_desktop_enabled ON public.menus USING btree (desktop_enabled);


--
-- Name: idx_menus_mobile_enabled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menus_mobile_enabled ON public.menus USING btree (mobile_enabled);


--
-- Name: idx_menus_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menus_order ON public.menus USING btree ("order");


--
-- Name: idx_menus_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menus_parent_id ON public.menus USING btree (parent_id);


--
-- Name: idx_menus_path; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menus_path ON public.menus USING btree (path) WHERE (path IS NOT NULL);


--
-- Name: idx_menus_program_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menus_program_id ON public.menus USING btree (program_id);


--
-- Name: idx_menus_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menus_updated_at ON public.menus USING btree (updated_at);


--
-- Name: idx_messages_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_category ON public.messages USING btree (category);


--
-- Name: idx_messages_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_code ON public.messages USING btree (code);


--
-- Name: idx_messages_content_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_content_search ON public.conversation_messages USING gin (to_tsvector('english'::regconfig, content));


--
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation ON public.conversation_messages USING btree (conversation_id);


--
-- Name: idx_messages_has_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_has_code ON public.conversation_messages USING btree (has_code) WHERE (has_code = true);


--
-- Name: idx_messages_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_order ON public.conversation_messages USING btree (conversation_id, "order");


--
-- Name: idx_messages_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_role ON public.conversation_messages USING btree (role);


--
-- Name: idx_messages_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_status ON public.messages USING btree (status);


--
-- Name: idx_messages_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_type ON public.messages USING btree (type);


--
-- Name: idx_mfa_codes_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mfa_codes_created_at ON public.mfa_codes USING btree (created_at);


--
-- Name: idx_mfa_codes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mfa_codes_user_id ON public.mfa_codes USING btree (user_id, created_at DESC);


--
-- Name: idx_permissions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_permissions_created_at ON public.permissions USING btree (created_at);


--
-- Name: idx_permissions_menu_access; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_permissions_menu_access ON public.permissions USING gin (menu_access);


--
-- Name: idx_permissions_permissions; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_permissions_permissions ON public.permissions USING gin (permissions);


--
-- Name: idx_permissions_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_permissions_role ON public.permissions USING btree (role);


--
-- Name: idx_post_likes_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_post_likes_post_id ON public.post_likes USING btree (post_id);


--
-- Name: idx_post_likes_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_post_likes_updated_at ON public.post_likes USING btree (updated_at);


--
-- Name: idx_post_likes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_post_likes_user_id ON public.post_likes USING btree (user_id);


--
-- Name: idx_post_views_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_post_views_post_id ON public.post_views USING btree (post_id);


--
-- Name: idx_post_views_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_post_views_user_id ON public.post_views USING btree (user_id);


--
-- Name: idx_post_views_viewed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_post_views_viewed_at ON public.post_views USING btree (viewed_at DESC);


--
-- Name: idx_posts_accepted_answer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_accepted_answer ON public.posts USING btree (accepted_answer_id) WHERE (accepted_answer_id IS NOT NULL);


--
-- Name: idx_posts_attachment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_attachment_id ON public.posts USING btree (attachment_id);


--
-- Name: idx_posts_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_author_id ON public.posts USING btree (author_id);


--
-- Name: idx_posts_board_pinned_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_board_pinned_date ON public.posts USING btree (board_type_id, is_pinned DESC, created_at DESC);


--
-- Name: idx_posts_board_question_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_board_question_status ON public.posts USING btree (board_type_id, question_status, created_at DESC) WHERE (question_status IS NOT NULL);


--
-- Name: idx_posts_board_status_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_board_status_date ON public.posts USING btree (board_type_id, status, created_at DESC);


--
-- Name: idx_posts_board_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_board_type_id ON public.posts USING btree (board_type_id);


--
-- Name: idx_posts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_created_at ON public.posts USING btree (created_at DESC);


--
-- Name: idx_posts_is_pinned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_is_pinned ON public.posts USING btree (is_pinned);


--
-- Name: idx_posts_metadata; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_metadata ON public.posts USING gin (metadata);


--
-- Name: idx_posts_popup_notification; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_popup_notification ON public.posts USING btree (show_popup, display_start_date, display_end_date) WHERE ((show_popup = true) AND ((status)::text = 'published'::text));


--
-- Name: idx_posts_post_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_post_type ON public.posts USING btree (post_type);


--
-- Name: idx_posts_published_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_published_at ON public.posts USING btree (published_at DESC);


--
-- Name: idx_posts_question_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_question_status ON public.posts USING btree (question_status) WHERE (question_status IS NOT NULL);


--
-- Name: idx_posts_resolved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_resolved ON public.posts USING btree (resolved_at DESC) WHERE (resolved_at IS NOT NULL);


--
-- Name: idx_posts_search_vector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_search_vector ON public.posts USING gin (search_vector);


--
-- Name: idx_posts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_status ON public.posts USING btree (status);


--
-- Name: idx_posts_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_tags ON public.posts USING gin (tags);


--
-- Name: idx_programs_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_programs_category ON public.programs USING btree (category);


--
-- Name: idx_programs_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_programs_code ON public.programs USING btree (code);


--
-- Name: idx_programs_permissions; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_programs_permissions ON public.programs USING gin (permissions);


--
-- Name: idx_programs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_programs_status ON public.programs USING btree (status);


--
-- Name: idx_programs_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_programs_type ON public.programs USING btree (type);


--
-- Name: idx_role_program_mappings_program_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_role_program_mappings_program_code ON public.role_program_mappings USING btree (program_code);


--
-- Name: idx_role_program_mappings_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_role_program_mappings_role_id ON public.role_program_mappings USING btree (role_id);


--
-- Name: idx_role_program_mappings_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_role_program_mappings_updated_at ON public.role_program_mappings USING btree (updated_at);


--
-- Name: idx_roles_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roles_is_active ON public.roles USING btree (is_active);


--
-- Name: idx_roles_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roles_name ON public.roles USING btree (name);


--
-- Name: idx_roles_role_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roles_role_type ON public.roles USING btree (role_type);


--
-- Name: idx_sync_queue_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sync_queue_client_id ON public.sync_queue USING btree (client_id);


--
-- Name: idx_sync_queue_sync_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sync_queue_sync_status ON public.sync_queue USING btree (sync_status);


--
-- Name: idx_tag_mappings_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tag_mappings_conversation ON public.conversation_tag_mappings USING btree (conversation_id);


--
-- Name: idx_tag_mappings_tag; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tag_mappings_tag ON public.conversation_tag_mappings USING btree (tag_id);


--
-- Name: idx_tags_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tags_category ON public.conversation_tags USING btree (category);


--
-- Name: idx_tags_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tags_name ON public.conversation_tags USING btree (name);


--
-- Name: idx_token_blacklist_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_token_blacklist_expires_at ON public.token_blacklist USING btree (expires_at);


--
-- Name: idx_token_blacklist_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_token_blacklist_token ON public.token_blacklist USING btree (token);


--
-- Name: idx_token_blacklist_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_token_blacklist_updated_at ON public.token_blacklist USING btree (updated_at);


--
-- Name: idx_token_blacklist_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_token_blacklist_user_id ON public.token_blacklist USING btree (user_id);


--
-- Name: idx_user_preferences_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_preferences_created_at ON public.user_preferences USING btree (created_at);


--
-- Name: idx_user_preferences_language; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_preferences_language ON public.user_preferences USING btree (language);


--
-- Name: idx_user_preferences_theme; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_preferences_theme ON public.user_preferences USING btree (theme);


--
-- Name: idx_user_role_mappings_composite; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_role_mappings_composite ON public.user_role_mappings USING btree (user_id, role_id);


--
-- Name: idx_user_role_mappings_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_role_mappings_created_at ON public.user_role_mappings USING btree (created_at);


--
-- Name: idx_user_role_mappings_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_role_mappings_is_active ON public.user_role_mappings USING btree (is_active);


--
-- Name: idx_user_role_mappings_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_role_mappings_role_id ON public.user_role_mappings USING btree (role_id);


--
-- Name: idx_user_role_mappings_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_role_mappings_user_id ON public.user_role_mappings USING btree (user_id);


--
-- Name: idx_users_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_created_at ON public.users USING btree (created_at DESC);


--
-- Name: idx_users_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_department ON public.users USING btree (department);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_employee_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_employee_number ON public.users USING btree (employee_number);


--
-- Name: idx_users_has_avatar_image; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_has_avatar_image ON public.users USING btree (id) WHERE (avatar_image IS NOT NULL);


--
-- Name: idx_users_loginid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_loginid ON public.users USING btree (loginid);


--
-- Name: idx_users_name_en; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_name_en ON public.users USING btree (name_en);


--
-- Name: idx_users_name_ko; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_name_ko ON public.users USING btree (name_ko);


--
-- Name: idx_users_position; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_position ON public.users USING btree ("position");


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_search_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_search_gin ON public.users USING gin (to_tsvector('simple'::regconfig, (((((((((COALESCE(loginid, ''::character varying))::text || ' '::text) || (COALESCE(email, ''::character varying))::text) || ' '::text) || (COALESCE(name_ko, ''::character varying))::text) || ' '::text) || (COALESCE(name_en, ''::character varying))::text) || ' '::text) || (COALESCE(employee_number, ''::character varying))::text)));


--
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- Name: idx_users_system_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_system_key ON public.users USING btree (system_key);


--
-- Name: idx_users_user_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_user_category ON public.users USING btree (user_category);


--
-- Name: posts posts_search_vector_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER posts_search_vector_trigger BEFORE INSERT OR UPDATE OF title, content, author_name ON public.posts FOR EACH ROW EXECUTE FUNCTION public.posts_search_vector_update();


--
-- Name: attachment_files trigger_update_attachment_stats; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_attachment_stats AFTER INSERT OR DELETE ON public.attachment_files FOR EACH ROW EXECUTE FUNCTION public.update_attachment_stats();


--
-- Name: conversation_messages trigger_update_message_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_message_count AFTER INSERT OR DELETE ON public.conversation_messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_message_count();


--
-- Name: conversation_tag_mappings trigger_update_tag_usage; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_tag_usage AFTER INSERT OR DELETE ON public.conversation_tag_mappings FOR EACH ROW EXECUTE FUNCTION public.update_tag_usage_count();


--
-- Name: comments update_answer_quality_on_comment; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_answer_quality_on_comment AFTER UPDATE OF like_count, helpful_count, is_accepted ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_answer_quality_score();


--
-- Name: answer_helpful update_answer_quality_on_helpful; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_answer_quality_on_helpful AFTER INSERT OR DELETE ON public.answer_helpful FOR EACH ROW EXECUTE FUNCTION public.update_comment_helpful_count();


--
-- Name: posts update_board_type_post_count_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_board_type_post_count_trigger AFTER INSERT OR DELETE OR UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_board_type_post_count();


--
-- Name: board_types update_board_types_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_board_types_updated_at BEFORE UPDATE ON public.board_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: checksheet_templates update_checksheet_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_checksheet_templates_updated_at BEFORE UPDATE ON public.checksheet_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: code_types update_code_types_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_code_types_updated_at BEFORE UPDATE ON public.code_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: codes update_codes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_codes_updated_at BEFORE UPDATE ON public.codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: comments update_comments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: departments update_departments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: help update_help_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_help_updated_at BEFORE UPDATE ON public.help FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: inspections update_inspections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON public.inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: logs update_logs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_logs_updated_at BEFORE UPDATE ON public.logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: menus update_menus_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON public.menus FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: messages update_messages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: mfa_codes update_mfa_codes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_mfa_codes_updated_at BEFORE UPDATE ON public.mfa_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: permissions update_permissions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: comments update_post_comment_count_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_post_comment_count_trigger AFTER INSERT OR DELETE OR UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();


--
-- Name: post_likes update_post_likes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_post_likes_updated_at BEFORE UPDATE ON public.post_likes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: posts update_posts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: programs update_programs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: comments update_question_status_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_question_status_trigger AFTER INSERT OR DELETE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_question_status();


--
-- Name: role_program_mappings update_role_program_mappings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_role_program_mappings_updated_at BEFORE UPDATE ON public.role_program_mappings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: roles update_roles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: token_blacklist update_token_blacklist_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_token_blacklist_updated_at BEFORE UPDATE ON public.token_blacklist FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_preferences update_user_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_role_mappings update_user_role_mappings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_role_mappings_updated_at BEFORE UPDATE ON public.user_role_mappings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: answer_helpful answer_helpful_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_helpful
    ADD CONSTRAINT answer_helpful_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: checksheet_items checksheet_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checksheet_items
    ADD CONSTRAINT checksheet_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.checksheet_items(id) ON DELETE SET NULL;


--
-- Name: checksheet_items checksheet_items_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checksheet_items
    ADD CONSTRAINT checksheet_items_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.checksheet_templates(id) ON DELETE CASCADE;


--
-- Name: checksheet_templates checksheet_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checksheet_templates
    ADD CONSTRAINT checksheet_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: conversation_code_changes conversation_code_changes_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_code_changes
    ADD CONSTRAINT conversation_code_changes_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversation_code_changes conversation_code_changes_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_code_changes
    ADD CONSTRAINT conversation_code_changes_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.conversation_messages(id) ON DELETE SET NULL;


--
-- Name: conversation_messages conversation_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT conversation_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversation_tag_mappings conversation_tag_mappings_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_tag_mappings
    ADD CONSTRAINT conversation_tag_mappings_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversation_tag_mappings conversation_tag_mappings_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_tag_mappings
    ADD CONSTRAINT conversation_tag_mappings_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.conversation_tags(id) ON DELETE CASCADE;


--
-- Name: attachment_files fk_attachment_files_attachment; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachment_files
    ADD CONSTRAINT fk_attachment_files_attachment FOREIGN KEY (attachment_id) REFERENCES public.attachments(id) ON DELETE CASCADE;


--
-- Name: attachments fk_attachments_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT fk_attachments_type FOREIGN KEY (attachment_type_id) REFERENCES public.attachment_types(id) ON DELETE RESTRICT;


--
-- Name: inspection_results inspection_results_inspection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspection_results
    ADD CONSTRAINT inspection_results_inspection_id_fkey FOREIGN KEY (inspection_id) REFERENCES public.inspections(id) ON DELETE CASCADE;


--
-- Name: inspection_results inspection_results_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspection_results
    ADD CONSTRAINT inspection_results_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.checksheet_items(id) ON DELETE RESTRICT;


--
-- Name: inspections inspections_inspector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_inspector_id_fkey FOREIGN KEY (inspector_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: inspections inspections_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.checksheet_templates(id) ON DELETE RESTRICT;


--
-- Name: mail_messages mail_messages_attachment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_messages
    ADD CONSTRAINT mail_messages_attachment_id_fkey FOREIGN KEY (attachment_id) REFERENCES public.attachments(id) ON DELETE SET NULL;


--
-- Name: mail_messages mail_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_messages
    ADD CONSTRAINT mail_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mail_recipients mail_recipients_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_recipients
    ADD CONSTRAINT mail_recipients_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.mail_messages(id) ON DELETE CASCADE;


--
-- Name: mail_recipients mail_recipients_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_recipients
    ADD CONSTRAINT mail_recipients_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mail_user_messages mail_user_messages_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_user_messages
    ADD CONSTRAINT mail_user_messages_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.mail_messages(id) ON DELETE CASCADE;


--
-- Name: mail_user_messages mail_user_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail_user_messages
    ADD CONSTRAINT mail_user_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


