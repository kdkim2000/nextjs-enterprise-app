/**
 * Attachment Type Service Layer
 *
 * Provides data access methods for attachment type operations.
 * Manages file upload configurations by type.
 */

const db = require('../config/database');

/**
 * Get all attachment types with optional filtering and pagination
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of attachment type objects
 */
async function getAllAttachmentTypes(options = {}) {
  const { search, status, limit, offset } = options;

  let query = 'SELECT * FROM attachment_types WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (code ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  query += ' ORDER BY "order", code';

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
  return result.rows;
}

/**
 * Get attachment type by ID
 * @param {string} id - Attachment type ID
 * @returns {Promise<Object|null>} Attachment type object or null
 */
async function getAttachmentTypeById(id) {
  const query = 'SELECT * FROM attachment_types WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}

/**
 * Get attachment type by code
 * @param {string} code - Attachment type code
 * @returns {Promise<Object|null>} Attachment type object or null
 */
async function getAttachmentTypeByCode(code) {
  const query = 'SELECT * FROM attachment_types WHERE code = $1';
  const result = await db.query(query, [code]);
  return result.rows[0] || null;
}

/**
 * Create a new attachment type
 * @param {Object} data - Attachment type data
 * @returns {Promise<Object>} Created attachment type object
 */
async function createAttachmentType(data) {
  const {
    id,
    code,
    nameEn,
    nameKo,
    nameZh,
    nameVi,
    descriptionEn,
    descriptionKo,
    descriptionZh,
    descriptionVi,
    storagePath,
    maxFileCount,
    maxFileSize,
    maxTotalSize,
    allowedExtensions,
    allowedMimeTypes,
    status,
    order
  } = data;

  const query = `
    INSERT INTO attachment_types (
      id, code, name_en, name_ko, name_zh, name_vi,
      description_en, description_ko, description_zh, description_vi,
      storage_path, max_file_count, max_file_size, max_total_size,
      allowed_extensions, allowed_mime_types, status, "order",
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    id,
    code,
    nameEn || '',
    nameKo || '',
    nameZh || '',
    nameVi || '',
    descriptionEn || '',
    descriptionKo || '',
    descriptionZh || '',
    descriptionVi || '',
    storagePath,
    maxFileCount || 5,
    maxFileSize || 10485760,
    maxTotalSize || 52428800,
    allowedExtensions || [],
    allowedMimeTypes || [],
    status || 'active',
    order || 0
  ];

  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Update an attachment type
 * @param {string} id - Attachment type ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated attachment type object
 */
async function updateAttachmentType(id, updates) {
  const allowedFields = [
    'code', 'name_en', 'name_ko', 'name_zh', 'name_vi',
    'description_en', 'description_ko', 'description_zh', 'description_vi',
    'storage_path', 'max_file_count', 'max_file_size', 'max_total_size',
    'allowed_extensions', 'allowed_mime_types', 'status', 'order'
  ];

  const setClause = [];
  const params = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    // Convert camelCase to snake_case
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      setClause.push(`${dbField} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }

  setClause.push(`updated_at = NOW()`);
  params.push(id);

  const query = `UPDATE attachment_types SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await db.query(query, params);
  return result.rows[0] || null;
}

/**
 * Delete an attachment type
 * @param {string} id - Attachment type ID
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteAttachmentType(id) {
  const query = 'DELETE FROM attachment_types WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rowCount > 0;
}

/**
 * Get total count of attachment types
 * @param {Object} options - Filter options
 * @returns {Promise<number>} Total count
 */
async function getAttachmentTypeCount(options = {}) {
  const { search, status } = options;

  let query = 'SELECT COUNT(*) FROM attachment_types WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (code ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR name_ko ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
  }

  const result = await db.query(query, params);
  return parseInt(result.rows[0].count, 10);
}

module.exports = {
  getAllAttachmentTypes,
  getAttachmentTypeById,
  getAttachmentTypeByCode,
  createAttachmentType,
  updateAttachmentType,
  deleteAttachmentType,
  getAttachmentTypeCount
};
