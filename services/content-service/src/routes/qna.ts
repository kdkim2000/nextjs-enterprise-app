/**
 * Q&A Routes
 *
 * Handles Q&A specific features:
 * - Accept/unaccept answers
 * - Mark answers as helpful
 * - Resolve/unresolve questions
 * - Get Q&A statistics
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getLogger } from '@enterprise/shared';
import { authenticateToken } from '../middleware/authMiddleware';
import { query } from '../utils/database';

const router = Router();
const logger = getLogger('content-service:qna-routes');

/**
 * POST /content/qna/accept-answer - Accept an answer for a question
 */
router.post('/accept-answer', authenticateToken, async (req: Request, res: Response) => {
  const { postId, commentId } = req.body;

  try {
    // Validate required fields
    if (!postId || !commentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: postId, commentId'
      });
    }

    // Get the post
    const postResult = await query('SELECT * FROM posts WHERE id = $1', [postId]);
    const post = postResult.rows[0];

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Check if user is the post author or admin
    if (post.author_id !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only the question author or admin can accept answers'
      });
    }

    // Get the comment
    const commentResult = await query(
      'SELECT * FROM comments WHERE id = $1 AND post_id = $2',
      [commentId, postId]
    );
    const comment = commentResult.rows[0];

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    // Check if it's a top-level comment (answer, not a reply)
    if (comment.parent_id) {
      return res.status(400).json({
        success: false,
        error: 'Only top-level answers can be accepted, not replies'
      });
    }

    // Unaccept previous accepted answer if exists
    if (post.accepted_answer_id && post.accepted_answer_id !== commentId) {
      await query(
        'UPDATE comments SET is_accepted = FALSE, accepted_at = NULL WHERE id = $1',
        [post.accepted_answer_id]
      );
    }

    // Accept the answer
    await query(
      'UPDATE comments SET is_accepted = TRUE, accepted_at = NOW() WHERE id = $1',
      [commentId]
    );

    // Update post
    await query(
      `UPDATE posts
       SET accepted_answer_id = $1,
           question_status = 'resolved',
           resolved_at = NOW(),
           resolved_by = $2
       WHERE id = $3`,
      [commentId, req.user!.userId, postId]
    );

    res.json({
      success: true,
      message: 'Answer accepted successfully'
    });
  } catch (error) {
    logger.error('Error accepting answer:', error);
    res.status(500).json({ success: false, error: 'Failed to accept answer' });
  }
});

/**
 * POST /content/qna/unaccept-answer - Unaccept an answer for a question
 */
router.post('/unaccept-answer', authenticateToken, async (req: Request, res: Response) => {
  const { postId, commentId } = req.body;

  try {
    if (!postId || !commentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: postId, commentId'
      });
    }

    // Get the post
    const postResult = await query('SELECT * FROM posts WHERE id = $1', [postId]);
    const post = postResult.rows[0];

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Check if user is the post author or admin
    if (post.author_id !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only the question author or admin can unaccept answers'
      });
    }

    // Unaccept the answer
    await query(
      'UPDATE comments SET is_accepted = FALSE, accepted_at = NULL WHERE id = $1',
      [commentId]
    );

    // Update post - check if there are other answers
    const answerCountResult = await query(
      'SELECT COUNT(*) as count FROM comments WHERE post_id = $1 AND parent_id IS NULL AND deleted_at IS NULL',
      [postId]
    );
    const answerCount = parseInt(answerCountResult.rows[0].count);

    const newStatus = answerCount > 0 ? 'answered' : 'unanswered';

    await query(
      `UPDATE posts
       SET accepted_answer_id = NULL,
           question_status = $1,
           resolved_at = NULL,
           resolved_by = NULL
       WHERE id = $2`,
      [newStatus, postId]
    );

    res.json({
      success: true,
      message: 'Answer unaccepted successfully'
    });
  } catch (error) {
    logger.error('Error unaccepting answer:', error);
    res.status(500).json({ success: false, error: 'Failed to unaccept answer' });
  }
});

/**
 * POST /content/qna/helpful/:commentId - Mark an answer as helpful
 */
router.post('/helpful/:commentId', authenticateToken, async (req: Request, res: Response) => {
  const { commentId } = req.params;

  try {
    // Check if comment exists
    const commentResult = await query('SELECT * FROM comments WHERE id = $1', [commentId]);
    if (commentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    // Check if already marked as helpful
    const existingResult = await query(
      'SELECT id FROM answer_helpful WHERE comment_id = $1 AND user_id = $2',
      [commentId, req.user!.userId]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'You have already marked this answer as helpful'
      });
    }

    // Insert helpful mark
    const helpfulId = uuidv4();
    await query(
      'INSERT INTO answer_helpful (id, comment_id, user_id) VALUES ($1, $2, $3)',
      [helpfulId, commentId, req.user!.userId]
    );

    // Get updated helpful count
    const updatedComment = await query(
      'SELECT helpful_count FROM comments WHERE id = $1',
      [commentId]
    );

    res.json({
      success: true,
      message: 'Marked as helpful',
      helpfulCount: updatedComment.rows[0]?.helpful_count || 0
    });
  } catch (error) {
    logger.error('Error marking answer as helpful:', error);
    res.status(500).json({ success: false, error: 'Failed to mark as helpful' });
  }
});

/**
 * DELETE /content/qna/helpful/:commentId - Unmark an answer as helpful
 */
router.delete('/helpful/:commentId', authenticateToken, async (req: Request, res: Response) => {
  const { commentId } = req.params;

  try {
    // Delete helpful mark
    const result = await query(
      'DELETE FROM answer_helpful WHERE comment_id = $1 AND user_id = $2',
      [commentId, req.user!.userId]
    );

    if ((result.rowCount ?? 0) === 0) {
      return res.status(404).json({
        success: false,
        error: 'Helpful mark not found'
      });
    }

    // Get updated helpful count
    const updatedComment = await query(
      'SELECT helpful_count FROM comments WHERE id = $1',
      [commentId]
    );

    res.json({
      success: true,
      message: 'Unmarked as helpful',
      helpfulCount: updatedComment.rows[0]?.helpful_count || 0
    });
  } catch (error) {
    logger.error('Error unmarking answer as helpful:', error);
    res.status(500).json({ success: false, error: 'Failed to unmark as helpful' });
  }
});

/**
 * GET /content/qna/stats/:boardTypeId - Get Q&A statistics for a board
 */
router.get('/stats/:boardTypeId', authenticateToken, async (req: Request, res: Response) => {
  const { boardTypeId } = req.params;

  try {
    const stats = await query(`
      SELECT
        COUNT(*) as total_questions,
        COUNT(CASE WHEN question_status = 'unanswered' THEN 1 END) as unanswered,
        COUNT(CASE WHEN question_status = 'answered' THEN 1 END) as answered,
        COUNT(CASE WHEN question_status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN accepted_answer_id IS NOT NULL THEN 1 END) as with_accepted_answer,
        AVG(answer_count) as avg_answers_per_question
      FROM posts
      WHERE board_type_id = $1
        AND deleted_at IS NULL
        AND question_status IS NOT NULL
    `, [boardTypeId]);

    res.json({
      success: true,
      stats: stats.rows[0]
    });
  } catch (error) {
    logger.error('Error getting Q&A stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get statistics' });
  }
});

/**
 * GET /content/qna/post/:postId - Get Q&A specific data for a post
 */
router.get('/post/:postId', authenticateToken, async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const result = await query(`
      SELECT
        question_status,
        accepted_answer_id,
        resolved_at,
        resolved_by,
        answer_count
      FROM posts
      WHERE id = $1
    `, [postId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error getting Q&A post data:', error);
    res.status(500).json({ success: false, error: 'Failed to get post data' });
  }
});

export default router;
