-- ============================================================================
-- Q&A Board Features Migration
-- ============================================================================
-- Created: 2025-11-24
-- Description: Adds Q&A specific features including answer status,
--              accepted answers, and question resolution tracking
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Add Q&A specific columns to posts table
-- ============================================================================

-- Question status: unanswered, answered, resolved
ALTER TABLE posts ADD COLUMN IF NOT EXISTS question_status VARCHAR(20) DEFAULT 'unanswered';
COMMENT ON COLUMN posts.question_status IS 'Q&A status: unanswered, answered, resolved';

-- Accepted answer (comment) ID
ALTER TABLE posts ADD COLUMN IF NOT EXISTS accepted_answer_id VARCHAR(50);
COMMENT ON COLUMN posts.accepted_answer_id IS 'ID of the accepted answer (comment)';

-- Resolved timestamp
ALTER TABLE posts ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN posts.resolved_at IS 'When the question was resolved';

-- Resolved by (user who marked as resolved, usually the question author)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS resolved_by VARCHAR(50);
COMMENT ON COLUMN posts.resolved_by IS 'User who marked the question as resolved';

-- Answer count (separate from comment count for clarity)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS answer_count INTEGER DEFAULT 0;
COMMENT ON COLUMN posts.answer_count IS 'Number of answers (top-level comments)';

-- ============================================================================
-- 2. Add answer-specific columns to comments table
-- ============================================================================

-- Is this comment marked as an accepted answer?
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_accepted BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN comments.is_accepted IS 'Whether this answer is accepted by the question author';

-- Accepted timestamp
ALTER TABLE comments ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN comments.accepted_at IS 'When this answer was accepted';

-- Helpful count (for answers that are not accepted but useful)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;
COMMENT ON COLUMN comments.helpful_count IS 'Number of users who found this answer helpful';

-- Answer quality score (calculated based on likes, helpful marks, etc.)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 0;
COMMENT ON COLUMN comments.quality_score IS 'Calculated quality score for ranking answers';

-- ============================================================================
-- 3. Create answer_helpful table (who marked answer as helpful)
-- ============================================================================

CREATE TABLE IF NOT EXISTS answer_helpful (
    id VARCHAR(50) PRIMARY KEY,
    comment_id VARCHAR(50) NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

COMMENT ON TABLE answer_helpful IS 'Tracks which users marked answers as helpful';

CREATE INDEX IF NOT EXISTS idx_answer_helpful_comment_id ON answer_helpful(comment_id);
CREATE INDEX IF NOT EXISTS idx_answer_helpful_user_id ON answer_helpful(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_helpful_created_at ON answer_helpful(created_at DESC);

-- ============================================================================
-- 4. Create indexes for Q&A features
-- ============================================================================

-- Index for question status filtering
CREATE INDEX IF NOT EXISTS idx_posts_question_status ON posts(question_status)
    WHERE question_status IS NOT NULL;

-- Index for board + question status
CREATE INDEX IF NOT EXISTS idx_posts_board_question_status ON posts(board_type_id, question_status, created_at DESC)
    WHERE question_status IS NOT NULL;

-- Index for accepted answers
CREATE INDEX IF NOT EXISTS idx_posts_accepted_answer ON posts(accepted_answer_id)
    WHERE accepted_answer_id IS NOT NULL;

-- Index for resolved questions
CREATE INDEX IF NOT EXISTS idx_posts_resolved ON posts(resolved_at DESC)
    WHERE resolved_at IS NOT NULL;

-- Index for accepted answers in comments
CREATE INDEX IF NOT EXISTS idx_comments_accepted ON comments(is_accepted, post_id)
    WHERE is_accepted = TRUE;

-- Index for answer quality ranking
CREATE INDEX IF NOT EXISTS idx_comments_quality ON comments(post_id, quality_score DESC, created_at DESC);

-- ============================================================================
-- 5. Create function to update question status
-- ============================================================================

CREATE OR REPLACE FUNCTION update_question_status()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. Create function to update helpful count (must be before trigger)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_comment_helpful_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. Create function to update answer quality score
-- ============================================================================

CREATE OR REPLACE FUNCTION update_answer_quality_score()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. Create triggers
-- ============================================================================

-- Trigger for question status updates
DROP TRIGGER IF EXISTS update_question_status_trigger ON comments;
CREATE TRIGGER update_question_status_trigger
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_question_status();

-- Trigger for quality score updates on comment changes
DROP TRIGGER IF EXISTS update_answer_quality_on_comment ON comments;
CREATE TRIGGER update_answer_quality_on_comment
    AFTER UPDATE OF like_count, helpful_count, is_accepted ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_answer_quality_score();

-- Trigger for helpful count updates
DROP TRIGGER IF EXISTS update_answer_quality_on_helpful ON answer_helpful;
CREATE TRIGGER update_answer_quality_on_helpful
    AFTER INSERT OR DELETE ON answer_helpful
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_helpful_count();

-- ============================================================================
-- 9. Grant permissions to app_user
-- ============================================================================

GRANT ALL PRIVILEGES ON TABLE answer_helpful TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================================================
-- 10. Initialize existing posts (optional - only for Q&A boards)
-- ============================================================================

-- You can manually update existing posts in Q&A boards:
/*
UPDATE posts
SET
    question_status = CASE
        WHEN comment_count > 0 THEN 'answered'
        ELSE 'unanswered'
    END,
    answer_count = (SELECT COUNT(*) FROM comments WHERE post_id = posts.id AND parent_id IS NULL AND deleted_at IS NULL)
WHERE board_type_id IN (SELECT id FROM board_types WHERE type = 'qna');
*/

COMMIT;

-- ============================================================================
-- Verification Queries
-- ============================================================================

/*
-- Check new columns in posts table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'posts'
  AND column_name IN ('question_status', 'accepted_answer_id', 'resolved_at', 'resolved_by', 'answer_count')
ORDER BY ordinal_position;

-- Check new columns in comments table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'comments'
  AND column_name IN ('is_accepted', 'accepted_at', 'helpful_count', 'quality_score')
ORDER BY ordinal_position;

-- Check answer_helpful table
SELECT * FROM answer_helpful LIMIT 5;

-- Check Q&A posts statistics
SELECT
    question_status,
    COUNT(*) as count,
    COUNT(CASE WHEN accepted_answer_id IS NOT NULL THEN 1 END) as with_accepted_answer
FROM posts
WHERE question_status IS NOT NULL
GROUP BY question_status;
*/
