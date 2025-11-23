/* eslint-disable no-console */
const express = require('express');
const router = express.Router();
const commentService = require('../services/commentService');
const { authenticateToken } = require('../middleware/auth');
const { checkCommentEditPermission } = require('../middleware/boardAccessControl');
const { v4: uuidv4 } = require('uuid');

// Helper function to transform database row to API format
function transformCommentToAPI(dbComment) {
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
    likeCount: dbComment.like_count,
    depth: dbComment.depth,
    metadata,
    createdAt: dbComment.created_at,
    updatedAt: dbComment.updated_at,
    deletedAt: dbComment.deleted_at
  };
}

/**
 * GET /api/comment/post/:postId - Get comments by post ID
 */
router.get('/post/:postId', authenticateToken, async (req, res) => {
  try {
    const { status, page, limit } = req.query;

    const options = { status: status || 'published' };

    if (page && limit) {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      options.limit = limitNum;
      options.offset = (pageNum - 1) * limitNum;
    }

    const dbComments = await commentService.getCommentsByPostId(req.params.postId, options);

    // Transform to API format
    const comments = dbComments.map(transformCommentToAPI);

    // Build tree structure
    const commentTree = buildCommentTree(comments);

    // Get total count
    const totalCount = await commentService.getCommentCount(req.params.postId, status || 'published');

    res.json({
      comments: commentTree,
      totalCount
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

/**
 * Helper function to build comment tree
 */
function buildCommentTree(comments) {
  const commentMap = new Map();
  const tree = [];

  // Create map
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Build tree
  comments.forEach(comment => {
    const node = commentMap.get(comment.id);
    if (comment.parentId && commentMap.has(comment.parentId)) {
      commentMap.get(comment.parentId).replies.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
}

/**
 * GET /api/comment/:id - Get a specific comment by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const dbComment = await commentService.getCommentById(req.params.id);

    if (!dbComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Get replies
    const replies = await commentService.getReplies(req.params.id);

    const comment = transformCommentToAPI(dbComment);
    comment.replies = replies.map(transformCommentToAPI);

    res.json({ comment });
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
});

/**
 * POST /api/comment - Create a new comment
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { postId, parentId, content, metadata } = req.body;

    // Validate required fields
    if (!postId || !content) {
      return res.status(400).json({ error: 'Missing required fields: postId, content' });
    }

    // Verify post exists
    const postService = require('../services/postService');
    const post = await postService.getPostById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get user info
    const userService = require('../services/userService');
    const user = await userService.getUserById(req.user.userId);

    // Determine depth
    let depth = 0;
    if (parentId) {
      const parentComment = await commentService.getCommentById(parentId);
      if (parentComment) {
        depth = parentComment.depth + 1;
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
      authorId: req.user.userId,
      authorName: user?.name_ko || user?.name_en || req.user.username,
      isAnonymous: false,
      depth,
      metadata
    };

    const dbComment = await commentService.createComment(commentData);
    const newComment = transformCommentToAPI(dbComment);

    // Send notification to post author if not the same user
    if (post.author_id !== req.user.userId) {
      try {
        const messageService = require('../services/messageService');
        await messageService.createMessage({
          senderId: req.user.userId,
          receiverId: post.author_id,
          subject: 'New comment on your post',
          content: `${user?.name_ko || user?.name_en || req.user.username} commented on your post: "${post.title}"`,
          type: 'notification',
          relatedId: post.id,
          relatedType: 'post'
        });
      } catch (notifError) {
        console.error('Error sending comment notification:', notifError);
        // Don't fail the request if notification fails
      }
    }

    res.status(201).json({ comment: newComment });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

/**
 * PUT /api/comment/:id - Update a comment
 */
router.put('/:id', authenticateToken, checkCommentEditPermission(), async (req, res) => {
  try {
    const { content, metadata } = req.body;

    const updates = {};
    if (content !== undefined) updates.content = content;
    if (metadata !== undefined) updates.metadata = metadata;

    const dbComment = await commentService.updateComment(req.params.id, updates);
    const updatedComment = transformCommentToAPI(dbComment);

    res.json({ comment: updatedComment });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

/**
 * DELETE /api/comment/:id - Delete a comment
 */
router.delete('/:id', authenticateToken, checkCommentEditPermission(), async (req, res) => {
  try {
    // Soft delete by default
    await commentService.deleteComment(req.params.id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

/**
 * POST /api/comment/:id/like - Like a comment
 */
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const db = require('../config/database');
    const likeId = uuidv4();

    // Insert like
    await db.query(`
      INSERT INTO comment_likes (id, comment_id, user_id, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (comment_id, user_id) DO NOTHING
    `, [likeId, req.params.id, req.user.userId]);

    // Update like count
    await db.query(`
      UPDATE comments
      SET like_count = (SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1)
      WHERE id = $1
    `, [req.params.id]);

    // Get updated comment
    const dbComment = await commentService.getCommentById(req.params.id);
    const comment = transformCommentToAPI(dbComment);

    res.json({ comment });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

/**
 * DELETE /api/comment/:id/like - Unlike a comment
 */
router.delete('/:id/like', authenticateToken, async (req, res) => {
  try {
    const db = require('../config/database');

    // Delete like
    await db.query(`
      DELETE FROM comment_likes
      WHERE comment_id = $1 AND user_id = $2
    `, [req.params.id, req.user.userId]);

    // Update like count
    await db.query(`
      UPDATE comments
      SET like_count = (SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1)
      WHERE id = $1
    `, [req.params.id]);

    // Get updated comment
    const dbComment = await commentService.getCommentById(req.params.id);
    const comment = transformCommentToAPI(dbComment);

    res.json({ comment });
  } catch (error) {
    console.error('Error unliking comment:', error);
    res.status(500).json({ error: 'Failed to unlike comment' });
  }
});

module.exports = router;
