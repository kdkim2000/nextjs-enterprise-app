/**
 * Post Routes
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getLogger, authenticateToken, query } from '@enterprise/shared';
import { checkPostEditPermission, checkSecretPostAccess, checkPostApprovalPermission } from '../middleware/boardAccessControl';
import * as postService from '../services/postService';
import * as boardTypeService from '../services/boardTypeService';
import * as attachmentService from '../services/attachmentService';
import { Post, PostApiResponse } from '../types';

const router = Router();
const logger = getLogger('app-service:content:post-routes');

/**
 * Transform database row to API format
 */
function transformPostToAPI(dbPost: Post): PostApiResponse | null {
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
    viewCount: dbPost.view_count || 0,
    commentCount: dbPost.comment_count || 0,
    likeCount: dbPost.like_count || 0,
    attachmentCount: dbPost.attachment_count || 0,
    tags,
    metadata,
    attachmentId: dbPost.attachment_id,
    createdAt: dbPost.created_at,
    updatedAt: dbPost.updated_at,
    publishedAt: dbPost.published_at,
    deletedAt: dbPost.deleted_at
  };
}

/**
 * GET /content/posts/board/:boardTypeId - Get posts by board type
 */
router.get('/board/:boardTypeId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      search, postType, status, authorId, tags,
      startDate, endDate, sortBy, sortOrder,
      page = '1', limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const dbPosts = await postService.getAllPosts({
      boardTypeId: req.params.boardTypeId,
      search: search as string,
      postType: postType as string,
      status: (status as string) || 'published',
      authorId: authorId as string,
      tags: tags ? (tags as string).split(',') : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
      limit: limitNum,
      offset
    });

    // Transform to API format
    const posts = dbPosts
      .map(transformPostToAPI)
      .filter((p): p is PostApiResponse => p !== null);

    // Get total count for pagination
    const totalCount = await postService.getPostCount({
      boardTypeId: req.params.boardTypeId,
      search: search as string,
      postType: postType as string,
      status: (status as string) || 'published',
      authorId: authorId as string,
      tags: tags ? (tags as string).split(',') : undefined,
      startDate: startDate as string,
      endDate: endDate as string
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
    logger.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

/**
 * GET /content/posts/my-posts - Get posts by current user
 */
router.get('/my-posts', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      boardTypeId, search, postType, status,
      startDate, endDate, sortBy, sortOrder,
      page = '1', limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const dbPosts = await postService.getAllPosts({
      boardTypeId: boardTypeId as string,
      authorId: req.user!.userId,
      search: search as string,
      postType: postType as string,
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
      limit: limitNum,
      offset
    });

    const posts = dbPosts
      .map(transformPostToAPI)
      .filter((p): p is PostApiResponse => p !== null);

    const totalCount = await postService.getPostCount({
      boardTypeId: boardTypeId as string,
      authorId: req.user!.userId,
      search: search as string,
      postType: postType as string,
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string
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
    logger.error('Error fetching my posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

/**
 * GET /content/posts/popup-notifications - Get active popup notifications
 */
router.get('/popup-notifications', authenticateToken, async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const queryText = `
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

    const result = await query(queryText, [now]);
    const notifications = result.rows
      .map(transformPostToAPI)
      .filter((p): p is PostApiResponse => p !== null);

    res.json({
      success: true,
      data: {
        notifications
      }
    });
  } catch (error) {
    logger.error('Error fetching popup notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popup notifications'
    });
  }
});

/**
 * GET /content/posts/:id - Get a specific post by ID
 */
router.get('/:id', authenticateToken, checkSecretPostAccess(), async (req: Request, res: Response) => {
  try {
    const dbPost = req.post!; // Injected by checkSecretPostAccess middleware
    const post = transformPostToAPI(dbPost) as any;

    // Get attachments
    if (dbPost.attachment_id) {
      try {
        const attachment = await attachmentService.getAttachmentById(dbPost.attachment_id);
        if (attachment) {
          post.attachment = {
            id: attachment.id,
            attachmentTypeId: attachment.attachment_type_id,
            fileCount: attachment.file_count,
            totalSize: attachment.total_size,
            files: attachment.files ? attachment.files.map((f: any) => ({
              id: f.id,
              originalFilename: f.original_filename,
              storedFilename: f.stored_filename,
              fileExtension: f.file_extension,
              mimeType: f.mime_type,
              fileSize: f.file_size,
              isImage: f.is_image,
              downloadCount: f.download_count,
              createdAt: f.created_at
            })) : []
          };
        }
      } catch (attachError) {
        logger.error('Error fetching attachment:', attachError);
      }
    } else {
      // Fallback to legacy attachment system
      const attachments = await attachmentService.getAttachmentsByPostId(req.params.id);
      post.attachments = attachments;
    }

    res.json({ post });
  } catch (error) {
    logger.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

/**
 * POST /content/posts - Create a new post
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      boardTypeId, title, content,
      postType, status, isSecret, isPinned, pinnedUntil,
      showPopup, displayStartDate, displayEndDate,
      tags, metadata, attachmentId
    } = req.body;

    // Validate required fields
    if (!boardTypeId || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields: boardTypeId, title, content' });
    }

    // Check board write permission
    const boardType = await boardTypeService.getBoardTypeById(boardTypeId);

    if (!boardType) {
      return res.status(404).json({ error: 'Board type not found' });
    }

    // Check write permission
    const writeRoles = typeof boardType.write_roles === 'string'
      ? JSON.parse(boardType.write_roles)
      : boardType.write_roles || [];

    if (boardType.type === 'notice' && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can write to notice boards' });
    }

    if (!writeRoles.includes(req.user!.role)) {
      return res.status(403).json({ error: 'You do not have permission to write to this board' });
    }

    // Get user info
    const user = await postService.getUserById(req.user!.userId);

    const postData = {
      boardTypeId,
      title,
      content,
      authorId: req.user!.userId,
      authorName: user?.name_ko || user?.name_en || req.user!.loginid,
      authorDepartment: user?.department,
      postType: postType || 'normal',
      status: status || 'published',
      isSecret: isSecret || false,
      isPinned: (req.user!.role === 'admin' && isPinned) || false,
      pinnedUntil: (req.user!.role === 'admin' && pinnedUntil) || null,
      showPopup: (req.user!.role === 'admin' && showPopup) || false,
      displayStartDate: (req.user!.role === 'admin' && displayStartDate) || null,
      displayEndDate: (req.user!.role === 'admin' && displayEndDate) || null,
      isApproved: true,
      tags,
      metadata,
      attachmentId: attachmentId || null
    };

    const dbPost = await postService.createPost(postData);

    // Update attachment reference if attachmentId provided
    if (attachmentId) {
      try {
        await attachmentService.updateAttachmentReference(attachmentId, 'post', dbPost.id);
      } catch (attachError) {
        logger.error('Failed to update attachment reference:', attachError);
      }
    }

    const newPost = transformPostToAPI(dbPost);

    res.status(201).json({ post: newPost });
  } catch (error) {
    logger.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

/**
 * PUT /content/posts/:id - Update a post
 */
router.put('/:id', authenticateToken, checkPostEditPermission(), async (req: Request, res: Response) => {
  try {
    const {
      title, content, postType, status,
      isSecret, isPinned, pinnedUntil,
      showPopup, displayStartDate, displayEndDate,
      tags, metadata, attachmentId
    } = req.body;

    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (postType !== undefined) updates.postType = postType;
    if (status !== undefined) updates.status = status;
    if (isSecret !== undefined) updates.isSecret = isSecret;
    if (tags !== undefined) updates.tags = tags;
    if (metadata !== undefined) updates.metadata = metadata;
    if (attachmentId !== undefined) updates.attachmentId = attachmentId;

    // Only admin can pin posts and manage popup notifications
    if (req.user!.role === 'admin') {
      if (isPinned !== undefined) updates.isPinned = isPinned;
      if (pinnedUntil !== undefined) updates.pinnedUntil = pinnedUntil;
      if (showPopup !== undefined) updates.showPopup = showPopup;
      if (displayStartDate !== undefined) updates.displayStartDate = displayStartDate;
      if (displayEndDate !== undefined) updates.displayEndDate = displayEndDate;
    }

    const dbPost = await postService.updatePost(req.params.id, updates);

    // Update attachment reference if attachmentId provided
    if (attachmentId) {
      try {
        await attachmentService.updateAttachmentReference(attachmentId, 'post', req.params.id);
      } catch (attachError) {
        logger.error('Failed to update attachment reference:', attachError);
      }
    }

    const updatedPost = transformPostToAPI(dbPost!);

    res.json({ post: updatedPost });
  } catch (error) {
    logger.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

/**
 * DELETE /content/posts/:id - Delete a post
 */
router.delete('/:id', authenticateToken, checkPostEditPermission(), async (req: Request, res: Response) => {
  try {
    await postService.deletePost(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
});

/**
 * POST /content/posts/:id/pin - Pin a post
 */
router.post('/:id/pin', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can pin posts' });
    }

    const { pinnedUntil } = req.body;
    const dbPost = await postService.pinPost(req.params.id, true, pinnedUntil);
    const post = transformPostToAPI(dbPost!);

    res.json({ post });
  } catch (error) {
    logger.error('Error pinning post:', error);
    res.status(500).json({ error: 'Failed to pin post' });
  }
});

/**
 * DELETE /content/posts/:id/pin - Unpin a post
 */
router.delete('/:id/pin', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can unpin posts' });
    }

    const dbPost = await postService.pinPost(req.params.id, false, null);
    const post = transformPostToAPI(dbPost!);

    res.json({ post });
  } catch (error) {
    logger.error('Error unpinning post:', error);
    res.status(500).json({ error: 'Failed to unpin post' });
  }
});

/**
 * POST /content/posts/:id/approve - Approve a post
 */
router.post('/:id/approve', authenticateToken, checkPostApprovalPermission(), async (req: Request, res: Response) => {
  try {
    const dbPost = await postService.approvePost(req.params.id, req.user!.userId);
    const post = transformPostToAPI(dbPost!);

    res.json({ post });
  } catch (error) {
    logger.error('Error approving post:', error);
    res.status(500).json({ error: 'Failed to approve post' });
  }
});

/**
 * GET /content/posts/:id/view - Increment view count
 */
router.get('/:id/view', authenticateToken, async (req: Request, res: Response) => {
  try {
    const viewId = uuidv4();

    // Check if already viewed today
    const checkResult = await query(`
      SELECT id FROM post_views
      WHERE post_id = $1
        AND user_id = $2
        AND DATE(viewed_at) = CURRENT_DATE
      LIMIT 1
    `, [req.params.id, req.user!.userId]);

    if (checkResult.rows.length === 0) {
      // Not viewed today - record new view
      await query(`
        INSERT INTO post_views (id, post_id, user_id, ip_address, user_agent, viewed_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [viewId, req.params.id, req.user!.userId, req.ip, req.get('user-agent')]);

      // Increment view count
      await postService.incrementViewCount(req.params.id);

      // Get updated post to return new view count
      const updatedPost = await postService.getPostById(req.params.id);
      res.json({
        success: true,
        viewCount: updatedPost?.view_count || 0,
        message: 'View count incremented'
      });
    } else {
      // Already viewed today
      const currentPost = await postService.getPostById(req.params.id);
      res.json({
        success: true,
        viewCount: currentPost?.view_count || 0,
        message: 'Already viewed today'
      });
    }
  } catch (error) {
    logger.error('Error recording view:', error);
    res.status(500).json({ error: 'Failed to record view' });
  }
});

/**
 * POST /content/posts/:id/like - Like a post
 */
router.post('/:id/like', authenticateToken, async (req: Request, res: Response) => {
  try {
    const likeId = uuidv4();

    // Insert like
    await query(`
      INSERT INTO post_likes (id, post_id, user_id, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (post_id, user_id) DO NOTHING
    `, [likeId, req.params.id, req.user!.userId]);

    // Update like count
    await query(`
      UPDATE posts
      SET like_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = $1)
      WHERE id = $1
    `, [req.params.id]);

    // Get updated post
    const dbPost = await postService.getPostById(req.params.id);
    const post = transformPostToAPI(dbPost!);

    res.json({ post });
  } catch (error) {
    logger.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

/**
 * DELETE /content/posts/:id/like - Unlike a post
 */
router.delete('/:id/like', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Delete like
    await query(`
      DELETE FROM post_likes
      WHERE post_id = $1 AND user_id = $2
    `, [req.params.id, req.user!.userId]);

    // Update like count
    await query(`
      UPDATE posts
      SET like_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = $1)
      WHERE id = $1
    `, [req.params.id]);

    // Get updated post
    const dbPost = await postService.getPostById(req.params.id);
    const post = transformPostToAPI(dbPost!);

    res.json({ post });
  } catch (error) {
    logger.error('Error unliking post:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

export default router;
