/**
 * Comment Service Layer
 */

import { v4 as uuidv4 } from 'uuid';
import { query } from '@enterprise/shared';
import { Comment, CommentQueryOptions } from '../types';

/**
 * Get comments by post ID
 */
export async function getCommentsByPostId(
  postId: string,
  options: CommentQueryOptions = {}
): Promise<Comment[]> {
  const { status, limit, offset } = options;

  let queryText = `
    SELECT c.*,
      u.name_ko as author_name_ko,
      u.name_en as author_name_en
    FROM comments c
    LEFT JOIN users u ON c.author_id = u.id
    WHERE c.post_id = $1
  `;

  const params: any[] = [postId];
  let paramIndex = 2;

  if (status) {
    queryText += ` AND c.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  queryText += ' ORDER BY c.created_at ASC';

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
 * Get comment by ID
 */
export async function getCommentById(commentId: string): Promise<Comment | null> {
  const queryText = `
    SELECT c.*,
      u.name_ko as author_name_ko,
      u.name_en as author_name_en
    FROM comments c
    LEFT JOIN users u ON c.author_id = u.id
    WHERE c.id = $1
  `;

  const result = await query(queryText, [commentId]);
  return result.rows[0] || null;
}

/**
 * Create a new comment
 */
export async function createComment(commentData: {
  postId: string;
  parentId?: string | null;
  content: string;
  authorId: string;
  authorName?: string;
  isAnonymous?: boolean;
  depth?: number;
  metadata?: Record<string, any>;
}): Promise<Comment> {
  const {
    postId, parentId, content,
    authorId, authorName, isAnonymous,
    depth, metadata
  } = commentData;

  const id = uuidv4();

  const queryText = `
    INSERT INTO comments (
      id, post_id, parent_id, content,
      author_id, author_name, is_anonymous,
      status, depth, metadata,
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    id, postId, parentId || null, content,
    authorId, authorName || null, isAnonymous || false,
    'published', depth || 0,
    JSON.stringify(metadata || {})
  ];

  const result = await query(queryText, params);
  return result.rows[0];
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  updates: Record<string, any>
): Promise<Comment | null> {
  const allowedFields = ['content', 'status', 'metadata'];

  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      // Handle JSON fields
      if (dbField === 'metadata') {
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
  params.push(commentId);

  const queryText = `UPDATE comments SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await query(queryText, params);
  return result.rows[0] || null;
}

/**
 * Delete a comment (soft delete)
 */
export async function deleteComment(commentId: string): Promise<boolean> {
  const queryText = `
    UPDATE comments
    SET status = 'deleted', deleted_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await query(queryText, [commentId]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Hard delete a comment
 */
export async function hardDeleteComment(commentId: string): Promise<boolean> {
  const result = await query('DELETE FROM comments WHERE id = $1', [commentId]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Get comment count by post ID
 */
export async function getCommentCount(postId: string, status: string = 'published'): Promise<number> {
  let queryText = 'SELECT COUNT(*) FROM comments WHERE post_id = $1';
  const params: any[] = [postId];

  if (status) {
    queryText += ' AND status = $2';
    params.push(status);
  }

  const result = await query(queryText, params);
  return parseInt(result.rows[0].count);
}

/**
 * Get replies for a comment
 */
export async function getReplies(parentId: string): Promise<Comment[]> {
  const queryText = `
    SELECT c.*,
      u.name_ko as author_name_ko,
      u.name_en as author_name_en
    FROM comments c
    LEFT JOIN users u ON c.author_id = u.id
    WHERE c.parent_id = $1 AND c.status = 'published'
    ORDER BY c.created_at ASC
  `;

  const result = await query(queryText, [parentId]);
  return result.rows;
}

/**
 * Accept an answer (for Q&A)
 */
export async function acceptAnswer(commentId: string): Promise<Comment | null> {
  const queryText = `
    UPDATE comments
    SET is_accepted = TRUE, accepted_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await query(queryText, [commentId]);
  return result.rows[0] || null;
}

/**
 * Unaccept an answer (for Q&A)
 */
export async function unacceptAnswer(commentId: string): Promise<Comment | null> {
  const queryText = `
    UPDATE comments
    SET is_accepted = FALSE, accepted_at = NULL
    WHERE id = $1
    RETURNING *
  `;

  const result = await query(queryText, [commentId]);
  return result.rows[0] || null;
}
