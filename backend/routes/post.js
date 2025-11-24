/* eslint-disable no-console */
const express = require('express');
const router = express.Router();
const postService = require('../services/postService');
const commentService = require('../services/commentService');
const attachmentService = require('../services/attachmentService');
const { authenticateToken } = require('../middleware/auth');
const {
  checkBoardWritePermission,
  checkBoardReadPermission,
  checkPostEditPermission,
  checkSecretPostAccess,
  checkPostApprovalPermission
} = require('../middleware/boardAccessControl');
const { v4: uuidv4 } = require('uuid');

// Helper function to transform database row to API format
function transformPostToAPI(dbPost) {
  if (!dbPost) return null;

  // Parse JSON fields
  const tags = typeof dbPost.tags === 'string'
    ? JSON.parse(dbPost.tags)
    : dbPost.tags;

  const metadata = typeof dbPost.metadata === 'string'
    ? JSON.parse(dbPost.metadata)
    : dbPost.metadata;

  return {
    id: dbPost.id,
    boardTypeId: dbPost.board_type_id,
    title: dbPost.title,
    content: dbPost.content,
    authorId: dbPost.author_id,
    authorName: dbPost.author_name || dbPost.author_name_ko || dbPost.author_name_en,
    authorDepartment: dbPost.author_department,
    departmentName: dbPost.department_name_ko || dbPost.department_name_en,
    isAnonymous: dbPost.is_anonymous,
    postType: dbPost.post_type,
    status: dbPost.status,
    isSecret: dbPost.is_secret,
    isPinned: dbPost.is_pinned,
    pinnedUntil: dbPost.pinned_until,
    showPopup: dbPost.show_popup,
    displayStartDate: dbPost.display_start_date,
    displayEndDate: dbPost.display_end_date,
    isApproved: dbPost.is_approved,
    approvedBy: dbPost.approved_by,
    approvedAt: dbPost.approved_at,
    viewCount: dbPost.view_count,
    commentCount: dbPost.comment_count,
    likeCount: dbPost.like_count,
    attachmentCount: dbPost.attachment_count,
    tags,
    metadata,
    createdAt: dbPost.created_at,
    updatedAt: dbPost.updated_at,
    publishedAt: dbPost.published_at,
    deletedAt: dbPost.deleted_at
  };
}

/**
 * GET /api/post/board/:boardTypeId - Get posts by board type
 */
router.get('/board/:boardTypeId', authenticateToken, async (req, res) => {
  try {
    const {
      search, postType, status, authorId, tags,
      startDate, endDate, sortBy, sortOrder,
      page = 1, limit = 20
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const dbPosts = await postService.getAllPosts({
      boardTypeId: req.params.boardTypeId,
      search, postType, status: status || 'published', authorId,
      tags: tags ? tags.split(',') : undefined,
      startDate, endDate, sortBy, sortOrder,
      limit: limitNum,
      offset
    });

    // Transform to API format
    const posts = dbPosts.map(transformPostToAPI);

    // Get total count for pagination
    const totalCount = await postService.getPostCount({
      boardTypeId: req.params.boardTypeId,
      search, postType, status: status || 'published', authorId,
      tags: tags ? tags.split(',') : undefined,
      startDate, endDate
    });

    res.json({
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

/**
 * GET /api/post/my-posts - Get posts by current user
 */
router.get('/my-posts', authenticateToken, async (req, res) => {
  try {
    const {
      boardTypeId, search, postType, status,
      startDate, endDate, sortBy, sortOrder,
      page = 1, limit = 20
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const dbPosts = await postService.getAllPosts({
      boardTypeId,
      authorId: req.user.userId,
      search, postType, status,
      startDate, endDate, sortBy, sortOrder,
      limit: limitNum,
      offset
    });

    const posts = dbPosts.map(transformPostToAPI);

    const totalCount = await postService.getPostCount({
      boardTypeId,
      authorId: req.user.userId,
      search, postType, status,
      startDate, endDate
    });

    res.json({
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching my posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

/**
 * GET /api/post/popup-notifications - Get active popup notifications
 * IMPORTANT: This must come before /:id route to avoid matching issues
 */
router.get('/popup-notifications', authenticateToken, async (req, res) => {
  try {
    const now = new Date();

    const query = `
      SELECT p.*,
        u.name_ko as author_name_ko,
        u.name_en as author_name_en,
        d.name_ko as department_name_ko,
        d.name_en as department_name_en
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN departments d ON u.department = d.id
      WHERE p.show_popup = true
        AND p.status = 'published'
        AND (p.display_start_date IS NULL OR p.display_start_date <= $1)
        AND (p.display_end_date IS NULL OR p.display_end_date >= $1)
      ORDER BY p.created_at DESC
      LIMIT 10
    `;

    const result = await require('../config/database').query(query, [now]);
    const notifications = result.rows.map(transformPostToAPI);

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching popup notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popup notifications'
    });
  }
});

/**
 * GET /api/post/:id - Get a specific post by ID
 */
router.get('/:id', authenticateToken, checkSecretPostAccess(), async (req, res) => {
  try {
    const dbPost = req.post; // Injected by checkSecretPostAccess middleware

    // Get attachments
    const attachments = await attachmentService.getAttachmentsByPostId(req.params.id);

    const post = transformPostToAPI(dbPost);
    post.attachments = attachments;

    res.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

/**
 * POST /api/post - Create a new post
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      boardTypeId, title, content,
      postType, status, isSecret, isPinned, pinnedUntil,
      showPopup, displayStartDate, displayEndDate,
      tags, metadata
    } = req.body;

    // Validate required fields
    if (!boardTypeId || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields: boardTypeId, title, content' });
    }

    // Check board write permission
    const boardTypeService = require('../services/boardTypeService');
    const boardType = await boardTypeService.getBoardTypeById(boardTypeId);

    if (!boardType) {
      return res.status(404).json({ error: 'Board type not found' });
    }

    // Check write permission
    const writeRoles = typeof boardType.write_roles === 'string'
      ? JSON.parse(boardType.write_roles)
      : boardType.write_roles;

    if (boardType.type === 'notice' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can write to notice boards' });
    }

    if (!writeRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to write to this board' });
    }

    // Get user info
    const userService = require('../services/userService');
    const user = await userService.getUserById(req.user.userId);

    // Debug: Log content before saving
    console.log('[POST /api/post] Received content length:', content?.length);
    console.log('[POST /api/post] Content preview:', content?.substring(0, 200));

    const postData = {
      boardTypeId,
      title,
      content,
      authorId: req.user.userId,
      authorName: user?.name_ko || user?.name_en || req.user.username,
      authorDepartment: user?.department,
      postType: postType || 'normal',
      status: status || 'published',
      isSecret: isSecret || false,
      isPinned: (req.user.role === 'admin' && isPinned) || false,
      pinnedUntil: (req.user.role === 'admin' && pinnedUntil) || null,
      showPopup: (req.user.role === 'admin' && showPopup) || false,
      displayStartDate: (req.user.role === 'admin' && displayStartDate) || null,
      displayEndDate: (req.user.role === 'admin' && displayEndDate) || null,
      isApproved: true,
      tags,
      metadata
    };

    const dbPost = await postService.createPost(postData);
    const newPost = transformPostToAPI(dbPost);

    res.status(201).json({ post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

/**
 * PUT /api/post/:id - Update a post
 */
router.put('/:id', authenticateToken, checkPostEditPermission(), async (req, res) => {
  try {
    const {
      title, content, postType, status,
      isSecret, isPinned, pinnedUntil,
      showPopup, displayStartDate, displayEndDate,
      tags, metadata
    } = req.body;

    // Debug: Log content before updating
    if (content !== undefined) {
      console.log('[PUT /api/post/:id] Received content length:', content?.length);
      console.log('[PUT /api/post/:id] Content preview:', content?.substring(0, 200));
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (postType !== undefined) updates.postType = postType;
    if (status !== undefined) updates.status = status;
    if (isSecret !== undefined) updates.isSecret = isSecret;
    if (tags !== undefined) updates.tags = tags;
    if (metadata !== undefined) updates.metadata = metadata;

    // Only admin can pin posts and manage popup notifications
    if (req.user.role === 'admin') {
      if (isPinned !== undefined) updates.isPinned = isPinned;
      if (pinnedUntil !== undefined) updates.pinnedUntil = pinnedUntil;
      if (showPopup !== undefined) updates.showPopup = showPopup;
      if (displayStartDate !== undefined) updates.displayStartDate = displayStartDate;
      if (displayEndDate !== undefined) updates.displayEndDate = displayEndDate;
    }

    const dbPost = await postService.updatePost(req.params.id, updates);
    const updatedPost = transformPostToAPI(dbPost);

    res.json({ post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

/**
 * DELETE /api/post/:id - Delete a post
 */
router.delete('/:id', authenticateToken, checkPostEditPermission(), async (req, res) => {
  try {
    console.log('[DELETE /api/post/:id] Deleting post:', req.params.id);

    // Soft delete by default
    const result = await postService.deletePost(req.params.id);

    console.log('[DELETE /api/post/:id] Delete result:', result);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
});

/**
 * POST /api/post/:id/pin - Pin a post
 */
router.post('/:id/pin', authenticateToken, async (req, res) => {
  try {
    // Only admin can pin posts
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can pin posts' });
    }

    const { pinnedUntil } = req.body;

    const dbPost = await postService.pinPost(req.params.id, true, pinnedUntil);
    const post = transformPostToAPI(dbPost);

    res.json({ post });
  } catch (error) {
    console.error('Error pinning post:', error);
    res.status(500).json({ error: 'Failed to pin post' });
  }
});

/**
 * DELETE /api/post/:id/pin - Unpin a post
 */
router.delete('/:id/pin', authenticateToken, async (req, res) => {
  try {
    // Only admin can unpin posts
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can unpin posts' });
    }

    const dbPost = await postService.pinPost(req.params.id, false, null);
    const post = transformPostToAPI(dbPost);

    res.json({ post });
  } catch (error) {
    console.error('Error unpinning post:', error);
    res.status(500).json({ error: 'Failed to unpin post' });
  }
});

/**
 * POST /api/post/:id/approve - Approve a post
 */
router.post('/:id/approve', authenticateToken, checkPostApprovalPermission(), async (req, res) => {
  try {
    const dbPost = await postService.approvePost(req.params.id, req.user.userId);
    const post = transformPostToAPI(dbPost);

    res.json({ post });
  } catch (error) {
    console.error('Error approving post:', error);
    res.status(500).json({ error: 'Failed to approve post' });
  }
});

/**
 * GET /api/post/:id/view - Increment view count
 */
router.get('/:id/view', authenticateToken, async (req, res) => {
  try {
    const db = require('../config/database');
    const viewId = uuidv4();

    console.log('[POST VIEW] Recording view for post:', req.params.id, 'by user:', req.user.userId);

    // Check if already viewed today
    const checkResult = await db.query(`
      SELECT id FROM post_views
      WHERE post_id = $1
        AND user_id = $2
        AND DATE(viewed_at) = CURRENT_DATE
      LIMIT 1
    `, [req.params.id, req.user.userId]);

    if (checkResult.rows.length === 0) {
      // Not viewed today - record new view
      await db.query(`
        INSERT INTO post_views (id, post_id, user_id, ip_address, user_agent, viewed_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [viewId, req.params.id, req.user.userId, req.ip, req.get('user-agent')]);

      // Increment view count
      console.log('[POST VIEW] New view recorded, incrementing count');
      await postService.incrementViewCount(req.params.id);

      // Get updated post to return new view count
      const updatedPost = await postService.getPostById(req.params.id);
      res.json({
        success: true,
        viewCount: updatedPost.view_count,
        message: 'View count incremented'
      });
    } else {
      console.log('[POST VIEW] Already viewed today, not incrementing');
      // Already viewed today, return current count without incrementing
      const currentPost = await postService.getPostById(req.params.id);
      res.json({
        success: true,
        viewCount: currentPost.view_count,
        message: 'Already viewed today'
      });
    }
  } catch (error) {
    console.error('[POST VIEW] Error recording view:', error);
    res.status(500).json({ error: 'Failed to record view' });
  }
});

/**
 * POST /api/post/:id/like - Like a post
 */
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const db = require('../config/database');
    const likeId = uuidv4();

    // Insert like
    await db.query(`
      INSERT INTO post_likes (id, post_id, user_id, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (post_id, user_id) DO NOTHING
    `, [likeId, req.params.id, req.user.userId]);

    // Update like count
    await db.query(`
      UPDATE posts
      SET like_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = $1)
      WHERE id = $1
    `, [req.params.id]);

    // Get updated post
    const dbPost = await postService.getPostById(req.params.id);
    const post = transformPostToAPI(dbPost);

    // Send notification to post author if not the same user
    if (dbPost.author_id !== req.user.userId) {
      try {
        const messageService = require('../services/messageService');
        const userService = require('../services/userService');
        const user = await userService.getUserById(req.user.userId);

        await messageService.createMessage({
          senderId: req.user.userId,
          receiverId: dbPost.author_id,
          subject: 'Someone liked your post',
          content: `${user?.name_ko || user?.name_en || req.user.username} liked your post: "${dbPost.title}"`,
          type: 'notification',
          relatedId: dbPost.id,
          relatedType: 'post'
        });
      } catch (notifError) {
        console.error('Error sending like notification:', notifError);
        // Don't fail the request if notification fails
      }
    }

    res.json({ post });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

/**
 * DELETE /api/post/:id/like - Unlike a post
 */
router.delete('/:id/like', authenticateToken, async (req, res) => {
  try {
    const db = require('../config/database');

    // Delete like
    await db.query(`
      DELETE FROM post_likes
      WHERE post_id = $1 AND user_id = $2
    `, [req.params.id, req.user.userId]);

    // Update like count
    await db.query(`
      UPDATE posts
      SET like_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = $1)
      WHERE id = $1
    `, [req.params.id]);

    // Get updated post
    const dbPost = await postService.getPostById(req.params.id);
    const post = transformPostToAPI(dbPost);

    res.json({ post });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

module.exports = router;
