/**
 * Comment Service Layer
 *
 * Provides data access methods for comment-related operations.
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Get comments by post ID
 * @param {string} postId - Post ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of comment objects
 */
async function getCommentsByPostId(postId, options = {}) {
  const { status, limit, offset } = options;

  let query = `
    SELECT c.*,
      u.name_ko as author_name_ko,
      u.name_en as author_name_en
    FROM comments c
    LEFT JOIN users u ON c.author_id = u.id
    WHERE c.post_id = $1
  `;

  const params = [postId];
  let paramIndex = 2;

  if (status) {
    query += ` AND c.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  query += ' ORDER BY c.created_at ASC';

  if (limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(limit);
    paramIndex++;
  }

  if (offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(offset);
    paramIndex++;
  }

  const result = await db.query(query, params);
  return result.rows;
}

/**
 * Get comment by ID
 * @param {string} commentId - Comment ID
 * @returns {Promise<Object|null>} Comment object or null
 */
async function getCommentById(commentId) {
  const query = `
    SELECT c.*,
      u.name_ko as author_name_ko,
      u.name_en as author_name_en
    FROM comments c
    LEFT JOIN users u ON c.author_id = u.id
    WHERE c.id = $1
  `;

  const result = await db.query(query, [commentId]);
  return result.rows[0] || null;
}

/**
 * Create a new comment
 * @param {Object} commentData - Comment data
 * @returns {Promise<Object>} Created comment object
 */
async function createComment(commentData) {
  const {
    postId, parentId, content,
    authorId, authorName, isAnonymous,
    depth, metadata
  } = commentData;

  const id = uuidv4();

  const query = `
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
    authorId, authorName, isAnonymous || false,
    'published', depth || 0,
    JSON.stringify(metadata || {})
  ];

  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Update a comment
 * @param {string} commentId - Comment ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated comment object
 */
async function updateComment(commentId, updates) {
  const allowedFields = ['content', 'status', 'metadata'];

  const setClause = [];
  const params = [];
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

  const query = `UPDATE comments SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await db.query(query, params);
  return result.rows[0] || null;
}

/**
 * Delete a comment (soft delete)
 * @param {string} commentId - Comment ID
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteComment(commentId) {
  const query = `
    UPDATE comments
    SET status = 'deleted', deleted_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await db.query(query, [commentId]);
  return result.rowCount > 0;
}

/**
 * Hard delete a comment
 * @param {string} commentId - Comment ID
 * @returns {Promise<boolean>} True if deleted
 */
async function hardDeleteComment(commentId) {
  const query = 'DELETE FROM comments WHERE id = $1';
  const result = await db.query(query, [commentId]);
  return result.rowCount > 0;
}

/**
 * Get comment count by post ID
 * @param {string} postId - Post ID
 * @param {string} status - Comment status filter
 * @returns {Promise<number>} Total count
 */
async function getCommentCount(postId, status = 'published') {
  let query = 'SELECT COUNT(*) FROM comments WHERE post_id = $1';
  const params = [postId];

  if (status) {
    query += ' AND status = $2';
    params.push(status);
  }

  const result = await db.query(query, params);
  return parseInt(result.rows[0].count);
}

/**
 * Get replies for a comment
 * @param {string} parentId - Parent comment ID
 * @returns {Promise<Array>} Array of reply comment objects
 */
async function getReplies(parentId) {
  const query = `
    SELECT c.*,
      u.name_ko as author_name_ko,
      u.name_en as author_name_en
    FROM comments c
    LEFT JOIN users u ON c.author_id = u.id
    WHERE c.parent_id = $1 AND c.status = 'published'
    ORDER BY c.created_at ASC
  `;

  const result = await db.query(query, [parentId]);
  return result.rows;
}

module.exports = {
  getCommentsByPostId,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  hardDeleteComment,
  getCommentCount,
  getReplies
};
