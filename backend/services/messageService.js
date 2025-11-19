/**
 * Message Service Layer
 */

const db = require('../config/database');
const { transformToAPI, transformArrayToAPI } = require('../utils/multiLangTransform');

/**
 * Get all messages
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of messages
 */
async function getAllMessages(options = {}) {
  const { search, category, type, status, limit, offset } = options;
  let query = 'SELECT * FROM messages WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (code ILIKE $${paramIndex} OR message_en ILIKE $${paramIndex} OR message_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (category) {
    query += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (type) {
    query += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  query += ' ORDER BY created_at DESC';

  if (limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(limit);
    paramIndex++;
  }

  if (offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(offset);
  }

  const result = await db.query(query, params);
  return transformArrayToAPI(result.rows, ['message', 'description']);
}

/**
 * Get message by ID
 * @param {string} id - Message ID
 * @returns {Promise<Object|null>} Message object or null
 */
async function getMessageById(id) {
  const result = await db.query('SELECT * FROM messages WHERE id = $1', [id]);
  return transformToAPI(result.rows[0], ['message', 'description']);
}

/**
 * Get message by code
 * @param {string} code - Message code
 * @returns {Promise<Object|null>} Message object or null
 */
async function getMessageByCode(code) {
  const result = await db.query('SELECT * FROM messages WHERE code = $1', [code]);
  return transformToAPI(result.rows[0], ['message', 'description']);
}

/**
 * Get messages by category
 * @param {string} category - Message category
 * @returns {Promise<Array>} Array of messages
 */
async function getMessagesByCategory(category) {
  const result = await db.query('SELECT * FROM messages WHERE category = $1 ORDER BY created_at DESC', [category]);
  return transformArrayToAPI(result.rows, ['message', 'description']);
}

/**
 * Create a new message
 * @param {Object} data - Message data
 * @returns {Promise<Object>} Created message
 */
async function createMessage(data) {
  const { code, category, type, message, description, status } = data;

  // Generate ID
  const id = `MSG-${Date.now()}`;

  const query = `
    INSERT INTO messages (
      id, code, category, type,
      message_en, message_ko, message_zh, message_vi,
      description_en, description_ko, description_zh, description_vi,
      status, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    id,
    code,
    category,
    type,
    message.en || '',
    message.ko || '',
    message.zh || '',
    message.vi || '',
    description.en || '',
    description.ko || '',
    description.zh || '',
    description.vi || '',
    status || 'active'
  ];

  const result = await db.query(query, params);
  return transformToAPI(result.rows[0], ['message', 'description']);
}

/**
 * Update a message
 * @param {string} id - Message ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated message or null
 */
async function updateMessage(id, updates) {
  const { code, category, type, message, description, status } = updates;

  const query = `
    UPDATE messages
    SET
      code = COALESCE($2, code),
      category = COALESCE($3, category),
      type = COALESCE($4, type),
      message_en = COALESCE($5, message_en),
      message_ko = COALESCE($6, message_ko),
      message_zh = COALESCE($7, message_zh),
      message_vi = COALESCE($8, message_vi),
      description_en = COALESCE($9, description_en),
      description_ko = COALESCE($10, description_ko),
      description_zh = COALESCE($11, description_zh),
      description_vi = COALESCE($12, description_vi),
      status = COALESCE($13, status),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const params = [
    id,
    code,
    category,
    type,
    message?.en,
    message?.ko,
    message?.zh,
    message?.vi,
    description?.en,
    description?.ko,
    description?.zh,
    description?.vi,
    status
  ];

  const result = await db.query(query, params);
  return transformToAPI(result.rows[0], ['message', 'description']);
}

/**
 * Delete a message
 * @param {string} id - Message ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
async function deleteMessage(id) {
  const result = await db.query('DELETE FROM messages WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = {
  getAllMessages,
  getMessageById,
  getMessageByCode,
  getMessagesByCategory,
  createMessage,
  updateMessage,
  deleteMessage,
};
