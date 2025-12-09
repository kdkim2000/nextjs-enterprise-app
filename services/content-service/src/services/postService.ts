/**
 * Post Service Layer
 */

import { v4 as uuidv4 } from 'uuid';
import { query } from '../utils/database';
import { Post, PostQueryOptions } from '../types';

/**
 * Get all posts with pagination and filtering
 */
export async function getAllPosts(options: PostQueryOptions = {}): Promise<Post[]> {
  const {
    boardTypeId, search, postType, status,
    authorId, tags, startDate, endDate,
    sortBy, sortOrder, limit, offset
  } = options;

  let queryText = `
    SELECT p.*,
      u.name_ko as author_name_ko,
      u.name_en as author_name_en,
      d.name_ko as department_name_ko,
      d.name_en as department_name_en
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN departments d ON u.department = d.id
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (boardTypeId) {
    queryText += ` AND p.board_type_id = $${paramIndex}`;
    params.push(boardTypeId);
    paramIndex++;
  }

  if (search) {
    queryText += ` AND (
      p.title ILIKE $${paramIndex} OR
      p.content ILIKE $${paramIndex} OR
      p.author_name ILIKE $${paramIndex}
    )`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (postType) {
    queryText += ` AND p.post_type = $${paramIndex}`;
    params.push(postType);
    paramIndex++;
  }

  if (status) {
    queryText += ` AND p.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (authorId) {
    queryText += ` AND p.author_id = $${paramIndex}`;
    params.push(authorId);
    paramIndex++;
  }

  if (tags && Array.isArray(tags) && tags.length > 0) {
    queryText += ` AND p.tags ?| $${paramIndex}`;
    params.push(tags);
    paramIndex++;
  }

  if (startDate) {
    queryText += ` AND p.created_at >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    queryText += ` AND p.created_at <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  // Sorting
  const validSortFields = ['created_at', 'updated_at', 'view_count', 'like_count', 'comment_count', 'published_at'];
  const sortField = validSortFields.includes(sortBy || '') ? sortBy : 'created_at';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  queryText += ` ORDER BY p.is_pinned DESC, p.${sortField} ${order}`;

  if (limit) {
    queryText += ` LIMIT $${paramIndex}`;
    params.push(limit);
    paramIndex++;
  }

  if (offset) {
    queryText += ` OFFSET $${paramIndex}`;
    params.push(offset);
  }

  const result = await query(queryText, params);
  return result.rows;
}

/**
 * Get post by ID
 */
export async function getPostById(postId: string): Promise<Post | null> {
  const queryText = `
    SELECT p.*,
      u.name_ko as author_name_ko,
      u.name_en as author_name_en,
      d.name_ko as department_name_ko,
      d.name_en as department_name_en
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN departments d ON u.department = d.id
    WHERE p.id = $1
  `;

  const result = await query(queryText, [postId]);
  return result.rows[0] || null;
}

/**
 * Create a new post
 */
export async function createPost(postData: {
  boardTypeId: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorDepartment?: string;
  postType?: string;
  status?: string;
  isAnonymous?: boolean;
  isSecret?: boolean;
  isPinned?: boolean;
  pinnedUntil?: Date | null;
  showPopup?: boolean;
  displayStartDate?: Date | null;
  displayEndDate?: Date | null;
  isApproved?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  attachmentId?: string | null;
}): Promise<Post> {
  const {
    boardTypeId, title, content,
    authorId, authorName, authorDepartment,
    postType, status, isAnonymous, isSecret,
    isPinned, pinnedUntil, showPopup, displayStartDate, displayEndDate,
    isApproved, tags, metadata, attachmentId
  } = postData;

  const id = uuidv4();

  const queryText = `
    INSERT INTO posts (
      id, board_type_id, title, content,
      author_id, author_name, author_department, is_anonymous,
      post_type, status, is_secret, is_pinned, pinned_until,
      show_popup, display_start_date, display_end_date,
      is_approved, tags, metadata, attachment_id,
      created_at, updated_at, published_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW(), NOW())
    RETURNING *
  `;

  const params = [
    id, boardTypeId, title, content,
    authorId, authorName || null, authorDepartment || null, isAnonymous || false,
    postType || 'normal', status || 'published', isSecret || false,
    isPinned || false, pinnedUntil || null,
    showPopup || false, displayStartDate || null, displayEndDate || null,
    isApproved !== undefined ? isApproved : true,
    JSON.stringify(tags || []),
    JSON.stringify(metadata || {}),
    attachmentId || null
  ];

  const result = await query(queryText, params);
  return result.rows[0];
}

/**
 * Update a post
 */
export async function updatePost(
  postId: string,
  updates: Record<string, any>
): Promise<Post | null> {
  const allowedFields = [
    'title', 'content', 'post_type', 'status',
    'is_secret', 'is_pinned', 'pinned_until',
    'show_popup', 'display_start_date', 'display_end_date',
    'is_approved', 'approved_by', 'approved_at', 'tags', 'metadata',
    'attachment_id'
  ];

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      // Handle JSON fields
      if (['tags', 'metadata'].includes(dbField)) {
        setClause.push(`${dbField} = $${paramIndex}`);
        params.push(JSON.stringify(value));
      } else {
        setClause.push(`${dbField} = $${paramIndex}`);
        params.push(value);
      }
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  setClause.push(`updated_at = NOW()`);
  params.push(postId);

  const queryText = `UPDATE posts SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(queryText, params);
  return result.rows[0] || null;
}

/**
 * Delete a post (soft delete)
 */
export async function deletePost(postId: string): Promise<boolean> {
  const queryText = `
    UPDATE posts
    SET status = 'deleted', deleted_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await query(queryText, [postId]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Hard delete a post
 */
export async function hardDeletePost(postId: string): Promise<boolean> {
  const result = await query('DELETE FROM posts WHERE id = $1', [postId]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Increment view count
 */
export async function incrementViewCount(postId: string): Promise<Post | null> {
  const queryText = `
    UPDATE posts
    SET view_count = view_count + 1
    WHERE id = $1
    RETURNING *
  `;

  const result = await query(queryText, [postId]);
  return result.rows[0] || null;
}

/**
 * Get post count
 */
export async function getPostCount(filters: PostQueryOptions = {}): Promise<number> {
  const {
    boardTypeId, search, postType, status,
    authorId, tags, startDate, endDate
  } = filters;

  let queryText = 'SELECT COUNT(*) FROM posts WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (boardTypeId) {
    queryText += ` AND board_type_id = $${paramIndex}`;
    params.push(boardTypeId);
    paramIndex++;
  }

  if (search) {
    queryText += ` AND (
      title ILIKE $${paramIndex} OR
      content ILIKE $${paramIndex} OR
      author_name ILIKE $${paramIndex}
    )`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (postType) {
    queryText += ` AND post_type = $${paramIndex}`;
    params.push(postType);
    paramIndex++;
  }

  if (status) {
    queryText += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (authorId) {
    queryText += ` AND author_id = $${paramIndex}`;
    params.push(authorId);
    paramIndex++;
  }

  if (tags && Array.isArray(tags) && tags.length > 0) {
    queryText += ` AND tags ?| $${paramIndex}`;
    params.push(tags);
    paramIndex++;
  }

  if (startDate) {
    queryText += ` AND created_at >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    queryText += ` AND created_at <= $${paramIndex}`;
    params.push(endDate);
  }

  const result = await query(queryText, params);
  return parseInt(result.rows[0].count);
}

/**
 * Pin/unpin a post
 */
export async function pinPost(
  postId: string,
  isPinned: boolean,
  pinnedUntil: Date | null = null
): Promise<Post | null> {
  const queryText = `
    UPDATE posts
    SET is_pinned = $1, pinned_until = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;

  const result = await query(queryText, [isPinned, pinnedUntil, postId]);
  return result.rows[0] || null;
}

/**
 * Approve a post
 */
export async function approvePost(postId: string, approvedBy: string): Promise<Post | null> {
  const queryText = `
    UPDATE posts
    SET is_approved = true, approved_by = $1, approved_at = NOW(), updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;

  const result = await query(queryText, [approvedBy, postId]);
  return result.rows[0] || null;
}

/**
 * Get user info by ID (for notifications)
 */
export async function getUserById(userId: string): Promise<any | null> {
  const result = await query('SELECT id, loginid, name_ko, name_en, department FROM users WHERE id = $1', [userId]);
  return result.rows[0] || null;
}
