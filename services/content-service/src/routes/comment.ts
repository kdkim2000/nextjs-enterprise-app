/**
 * Comment Routes
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getLogger } from '@enterprise/shared';
import { authenticateToken } from '../middleware/authMiddleware';
import { checkCommentEditPermission } from '../middleware/boardAccessControl';
import * as commentService from '../services/commentService';
import * as postService from '../services/postService';
import { query } from '../utils/database';
import { Comment, CommentApiResponse } from '../types';

const router = Router();
const logger = getLogger('content-service:comment-routes');

/**
 * Transform database row to API format
 */
function transformCommentToAPI(dbComment: Comment): CommentApiResponse | null {
  if (!dbComment) return null;

  // Parse JSON fields
  const metadata = typeof dbComment.metadata === 'string'
    ? JSON.parse(dbComment.metadata)
    : dbComment.metadata;

  return {
    id: dbComment.id,
    postId: dbComment.post_id,
    parentId: dbComment.parent_id,
    authorId: dbComment.author_id,
    authorName: dbComment.author_name || dbComment.author_name_ko || dbComment.author_name_en,
    isAnonymous: dbComment.is_anonymous,
    content: dbComment.content,
    status: dbComment.status,
    likeCount: dbComment.like_count || 0,
    helpfulCount: dbComment.helpful_count,
    depth: dbComment.depth || 0,
    isAccepted: dbComment.is_accepted,
    acceptedAt: dbComment.accepted_at,
    metadata,
    createdAt: dbComment.created_at,
    updatedAt: dbComment.updated_at,
    deletedAt: dbComment.deleted_at
  };
}

/**
 * Build comment tree structure
 */
function buildCommentTree(comments: CommentApiResponse[]): CommentApiResponse[] {
  const commentMap = new Map<string, CommentApiResponse & { replies: CommentApiResponse[] }>();
  const tree: CommentApiResponse[] = [];

  // Create map
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Build tree
  comments.forEach(comment => {
    const node = commentMap.get(comment.id)!;
    if (comment.parentId && commentMap.has(comment.parentId)) {
      commentMap.get(comment.parentId)!.replies.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
}

/**
 * GET /content/comments/post/:postId - Get comments by post ID
 */
router.get('/post/:postId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { status, page, limit } = req.query;

    const options: { status?: string; limit?: number; offset?: number } = {
      status: (status as string) || 'published'
    };

    if (page && limit) {
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      options.limit = limitNum;
      options.offset = (pageNum - 1) * limitNum;
    }

    const dbComments = await commentService.getCommentsByPostId(req.params.postId, options);

    // Transform to API format
    const comments = dbComments
      .map(transformCommentToAPI)
      .filter((c): c is CommentApiResponse => c !== null);

    // Build tree structure
    const commentTree = buildCommentTree(comments);

    // Get total count
    const totalCount = await commentService.getCommentCount(
      req.params.postId,
      (status as string) || 'published'
    );

    res.json({
      comments: commentTree,
      totalCount
    });
  } catch (error) {
    logger.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

/**
 * GET /content/comments/:id - Get a specific comment by ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const dbComment = await commentService.getCommentById(req.params.id);

    if (!dbComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Get replies
    const replies = await commentService.getReplies(req.params.id);

    const comment = transformCommentToAPI(dbComment) as CommentApiResponse & { replies: CommentApiResponse[] };
    comment.replies = replies
      .map(transformCommentToAPI)
      .filter((c): c is CommentApiResponse => c !== null);

    res.json({ comment });
  } catch (error) {
    logger.error('Error fetching comment:', error);
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
});

/**
 * POST /content/comments - Create a new comment
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { postId, parentId, content, metadata } = req.body;

    // Validate required fields
    if (!postId || !content) {
      return res.status(400).json({ error: 'Missing required fields: postId, content' });
    }

    // Verify post exists
    const post = await postService.getPostById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get user info
    const user = await postService.getUserById(req.user!.userId);

    // Determine depth
    let depth = 0;
    if (parentId) {
      const parentComment = await commentService.getCommentById(parentId);
      if (parentComment) {
        depth = (parentComment.depth || 0) + 1;
        // Limit depth to 1 (comment and reply only)
        if (depth > 1) {
          return res.status(400).json({ error: 'Maximum comment depth exceeded' });
        }
      }
    }

    const commentData = {
      postId,
      parentId: parentId || null,
      content,
      authorId: req.user!.userId,
      authorName: user?.name_ko || user?.name_en || req.user!.loginid,
      isAnonymous: false,
      depth,
      metadata
    };

    const dbComment = await commentService.createComment(commentData);
    const newComment = transformCommentToAPI(dbComment);

    res.status(201).json({ comment: newComment });
  } catch (error) {
    logger.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

/**
 * PUT /content/comments/:id - Update a comment
 */
router.put('/:id', authenticateToken, checkCommentEditPermission(), async (req: Request, res: Response) => {
  try {
    const { content, metadata } = req.body;

    const updates: Record<string, any> = {};
    if (content !== undefined) updates.content = content;
    if (metadata !== undefined) updates.metadata = metadata;

    const dbComment = await commentService.updateComment(req.params.id, updates);
    const updatedComment = transformCommentToAPI(dbComment!);

    res.json({ comment: updatedComment });
  } catch (error) {
    logger.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

/**
 * DELETE /content/comments/:id - Delete a comment
 */
router.delete('/:id', authenticateToken, checkCommentEditPermission(), async (req: Request, res: Response) => {
  try {
    await commentService.deleteComment(req.params.id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    logger.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

/**
 * POST /content/comments/:id/like - Like a comment
 */
router.post('/:id/like', authenticateToken, async (req: Request, res: Response) => {
  try {
    const likeId = uuidv4();

    // Insert like
    await query(`
      INSERT INTO comment_likes (id, comment_id, user_id, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (comment_id, user_id) DO NOTHING
    `, [likeId, req.params.id, req.user!.userId]);

    // Update like count
    await query(`
      UPDATE comments
      SET like_count = (SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1)
      WHERE id = $1
    `, [req.params.id]);

    // Get updated comment
    const dbComment = await commentService.getCommentById(req.params.id);
    const comment = transformCommentToAPI(dbComment!);

    res.json({ comment });
  } catch (error) {
    logger.error('Error liking comment:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

/**
 * DELETE /content/comments/:id/like - Unlike a comment
 */
router.delete('/:id/like', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Delete like
    await query(`
      DELETE FROM comment_likes
      WHERE comment_id = $1 AND user_id = $2
    `, [req.params.id, req.user!.userId]);

    // Update like count
    await query(`
      UPDATE comments
      SET like_count = (SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1)
      WHERE id = $1
    `, [req.params.id]);

    // Get updated comment
    const dbComment = await commentService.getCommentById(req.params.id);
    const comment = transformCommentToAPI(dbComment!);

    res.json({ comment });
  } catch (error) {
    logger.error('Error unliking comment:', error);
    res.status(500).json({ error: 'Failed to unlike comment' });
  }
});

export default router;
