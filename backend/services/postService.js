/**
 * Post Service Layer
 *
 * Provides data access methods for post-related operations.
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all posts with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of post objects
 */
async function getAllPosts(options = {}) {
  const {
    boardTypeId, search, postType, status,
    authorId, tags, startDate, endDate,
    sortBy, sortOrder, limit, offset
  } = options;

  let query = `
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

  const params = [];
  let paramIndex = 1;

  if (boardTypeId) {
    query += ` AND p.board_type_id = $${paramIndex}`;
    params.push(boardTypeId);
    paramIndex++;
  }

  if (search) {
    query += ` AND (
      p.title ILIKE $${paramIndex} OR
      p.content ILIKE $${paramIndex} OR
      p.author_name ILIKE $${paramIndex} OR
      p.search_vector @@ plainto_tsquery('english', $${paramIndex})
    )`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (postType) {
    query += ` AND p.post_type = $${paramIndex}`;
    params.push(postType);
    paramIndex++;
  }

  if (status) {
    query += ` AND p.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (authorId) {
    query += ` AND p.author_id = $${paramIndex}`;
    params.push(authorId);
    paramIndex++;
  }

  if (tags && Array.isArray(tags) && tags.length > 0) {
    query += ` AND p.tags ?| $${paramIndex}`;
    params.push(tags);
    paramIndex++;
  }

  if (startDate) {
    query += ` AND p.created_at >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    query += ` AND p.created_at <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  // Sorting
  const validSortFields = ['created_at', 'updated_at', 'view_count', 'like_count', 'comment_count', 'published_at'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  query += ` ORDER BY p.is_pinned DESC, p.${sortField} ${order}`;

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
 * Get post by ID
 * @param {string} postId - Post ID
 * @returns {Promise<Object|null>} Post object or null
 */
async function getPostById(postId) {
  const query = `
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

  const result = await db.query(query, [postId]);
  return result.rows[0] || null;
}

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created post object
 */
async function createPost(postData) {
  const {
    boardTypeId, title, content,
    authorId, authorName, authorDepartment,
    postType, status, isAnonymous, isSecret,
    isPinned, pinnedUntil, showPopup, displayStartDate, displayEndDate,
    isApproved, tags, metadata, attachmentId
  } = postData;

  const id = uuidv4();

  const query = `
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
    authorId, authorName, authorDepartment, isAnonymous || false,
    postType || 'normal', status || 'published', isSecret || false,
    isPinned || false, pinnedUntil || null,
    showPopup || false, displayStartDate || null, displayEndDate || null,
    isApproved !== undefined ? isApproved : true,
    JSON.stringify(tags || []),
    JSON.stringify(metadata || {}),
    attachmentId || null
  ];

  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Update a post
 * @param {string} postId - Post ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated post object
 */
async function updatePost(postId, updates) {
  const allowedFields = [
    'title', 'content', 'post_type', 'status',
    'is_secret', 'is_pinned', 'pinned_until',
    'show_popup', 'display_start_date', 'display_end_date',
    'is_approved', 'approved_by', 'approved_at', 'tags', 'metadata',
    'attachment_id'
  ];

  const setClause = [];
  const params = [];
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

  const query = `UPDATE posts SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await db.query(query, params);
  return result.rows[0] || null;
}

/**
 * Delete a post (soft delete)
 * @param {string} postId - Post ID
 * @returns {Promise<boolean>} True if deleted
 */
async function deletePost(postId) {
  const query = `
    UPDATE posts
    SET status = 'deleted', deleted_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await db.query(query, [postId]);
  return result.rowCount > 0;
}

/**
 * Hard delete a post
 * @param {string} postId - Post ID
 * @returns {Promise<boolean>} True if deleted
 */
async function hardDeletePost(postId) {
  const query = 'DELETE FROM posts WHERE id = $1';
  const result = await db.query(query, [postId]);
  return result.rowCount > 0;
}

/**
 * Increment view count
 * @param {string} postId - Post ID
 * @returns {Promise<Object>} Updated post
 */
async function incrementViewCount(postId) {
  const query = `
    UPDATE posts
    SET view_count = view_count + 1
    WHERE id = $1
    RETURNING *
  `;

  const result = await db.query(query, [postId]);
  return result.rows[0];
}

/**
 * Get post count
 * @param {Object} filters - Filter options
 * @returns {Promise<number>} Total count
 */
async function getPostCount(filters = {}) {
  const {
    boardTypeId, search, postType, status,
    authorId, tags, startDate, endDate
  } = filters;

  let query = 'SELECT COUNT(*) FROM posts WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (boardTypeId) {
    query += ` AND board_type_id = $${paramIndex}`;
    params.push(boardTypeId);
    paramIndex++;
  }

  if (search) {
    query += ` AND (
      title ILIKE $${paramIndex} OR
      content ILIKE $${paramIndex} OR
      author_name ILIKE $${paramIndex}
    )`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (postType) {
    query += ` AND post_type = $${paramIndex}`;
    params.push(postType);
    paramIndex++;
  }

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (authorId) {
    query += ` AND author_id = $${paramIndex}`;
    params.push(authorId);
    paramIndex++;
  }

  if (tags && Array.isArray(tags) && tags.length > 0) {
    query += ` AND tags ?| $${paramIndex}`;
    params.push(tags);
    paramIndex++;
  }

  if (startDate) {
    query += ` AND created_at >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    query += ` AND created_at <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  const result = await db.query(query, params);
  return parseInt(result.rows[0].count);
}

/**
 * Pin/unpin a post
 * @param {string} postId - Post ID
 * @param {boolean} isPinned - Pin status
 * @param {Date|null} pinnedUntil - Pin expiration date
 * @returns {Promise<Object>} Updated post
 */
async function pinPost(postId, isPinned, pinnedUntil = null) {
  const query = `
    UPDATE posts
    SET is_pinned = $1, pinned_until = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;

  const result = await db.query(query, [isPinned, pinnedUntil, postId]);
  return result.rows[0];
}

/**
 * Approve a post
 * @param {string} postId - Post ID
 * @param {string} approvedBy - Approver user ID
 * @returns {Promise<Object>} Updated post
 */
async function approvePost(postId, approvedBy) {
  const query = `
    UPDATE posts
    SET is_approved = true, approved_by = $1, approved_at = NOW(), updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;

  const result = await db.query(query, [approvedBy, postId]);
  return result.rows[0];
}

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  hardDeletePost,
  incrementViewCount,
  getPostCount,
  pinPost,
  approvePost
};
