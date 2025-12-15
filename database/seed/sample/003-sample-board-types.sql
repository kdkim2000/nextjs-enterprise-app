-- ==========================================
-- SAMPLE: Board Types
-- 샘플 게시판 데이터 (개발/테스트용)
-- ==========================================

-- Board Types
INSERT INTO board_types (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, type, category, display_order, status, created_at, updated_at)
VALUES
    ('BOARD-001', 'NOTICE', 'Notice Board', '공지사항', '公告', 'Thong bao',
     'Company-wide announcements', '전사 공지사항 게시판',
     'notice', 'general', 10, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('BOARD-002', 'FREE', 'Free Board', '자유게시판', '自由帖', 'Dien dan tu do',
     'Free discussion board', '자유로운 의견 교환을 위한 게시판',
     'normal', 'general', 20, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('BOARD-003', 'QNA', 'Q&A Board', '질문답변', '问答', 'Hoi dap',
     'Questions and Answers', '질문과 답변을 위한 게시판',
     'qna', 'general', 30, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('BOARD-004', 'TECH', 'Tech Blog', '기술블로그', '技术博客', 'Blog Ky thuat',
     'Technical articles and knowledge sharing', '기술 문서 및 지식 공유',
     'normal', 'tech', 40, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('BOARD-005', 'HR-NOTICE', 'HR Notice', '인사공지', '人事公告', 'Thong bao Nhan su',
     'HR announcements', '인사 관련 공지사항',
     'notice', 'hr', 50, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;
