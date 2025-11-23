/**
 * Attachment Service Layer
 *
 * Provides data access methods for attachment-related operations.
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

/**
 * Get attachments by post ID
 * @param {string} postId - Post ID
 * @returns {Promise<Array>} Array of attachment objects
 */
async function getAttachmentsByPostId(postId) {
  const query = `
    SELECT *
    FROM attachments
    WHERE post_id = $1
    ORDER BY created_at ASC
  `;

  const result = await db.query(query, [postId]);
  return result.rows;
}

/**
 * Get attachment by ID
 * @param {string} attachmentId - Attachment ID
 * @returns {Promise<Object|null>} Attachment object or null
 */
async function getAttachmentById(attachmentId) {
  const query = 'SELECT * FROM attachments WHERE id = $1';
  const result = await db.query(query, [attachmentId]);
  return result.rows[0] || null;
}

/**
 * Create a new attachment
 * @param {Object} attachmentData - Attachment data
 * @returns {Promise<Object>} Created attachment object
 */
async function createAttachment(attachmentData) {
  const {
    postId, originalFilename, storedFilename, filePath,
    fileSize, mimeType, fileExtension,
    width, height, thumbnailPath,
    uploadedBy, metadata
  } = attachmentData;

  const id = uuidv4();

  const query = `
    INSERT INTO attachments (
      id, post_id,
      original_filename, stored_filename, file_path,
      file_size, mime_type, file_extension,
      width, height, thumbnail_path,
      uploaded_by, metadata,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
    RETURNING *
  `;

  const params = [
    id, postId,
    originalFilename, storedFilename, filePath,
    fileSize, mimeType, fileExtension,
    width || null, height || null, thumbnailPath || null,
    uploadedBy,
    JSON.stringify(metadata || {})
  ];

  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Delete an attachment
 * @param {string} attachmentId - Attachment ID
 * @param {boolean} deleteFile - Whether to delete the physical file
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteAttachment(attachmentId, deleteFile = true) {
  // Get attachment info first
  const attachment = await getAttachmentById(attachmentId);

  if (!attachment) {
    return false;
  }

  // Delete from database
  const query = 'DELETE FROM attachments WHERE id = $1';
  const result = await db.query(query, [attachmentId]);

  // Delete physical file if requested
  if (deleteFile && result.rowCount > 0) {
    try {
      const fullPath = path.join(process.cwd(), 'public', attachment.file_path);
      await fs.unlink(fullPath);

      // Delete thumbnail if exists
      if (attachment.thumbnail_path) {
        const thumbnailPath = path.join(process.cwd(), 'public', attachment.thumbnail_path);
        await fs.unlink(thumbnailPath).catch(() => {});
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue even if file deletion fails
    }
  }

  return result.rowCount > 0;
}

/**
 * Increment download count
 * @param {string} attachmentId - Attachment ID
 * @returns {Promise<Object>} Updated attachment
 */
async function incrementDownloadCount(attachmentId) {
  const query = `
    UPDATE attachments
    SET download_count = download_count + 1
    WHERE id = $1
    RETURNING *
  `;

  const result = await db.query(query, [attachmentId]);
  return result.rows[0];
}

/**
 * Get attachment count by post ID
 * @param {string} postId - Post ID
 * @returns {Promise<number>} Total count
 */
async function getAttachmentCount(postId) {
  const query = 'SELECT COUNT(*) FROM attachments WHERE post_id = $1';
  const result = await db.query(query, [postId]);
  return parseInt(result.rows[0].count);
}

/**
 * Get total size of attachments for a post
 * @param {string} postId - Post ID
 * @returns {Promise<number>} Total size in bytes
 */
async function getTotalAttachmentSize(postId) {
  const query = 'SELECT COALESCE(SUM(file_size), 0) as total_size FROM attachments WHERE post_id = $1';
  const result = await db.query(query, [postId]);
  return parseInt(result.rows[0].total_size);
}

/**
 * Delete all attachments for a post
 * @param {string} postId - Post ID
 * @param {boolean} deleteFiles - Whether to delete physical files
 * @returns {Promise<number>} Number of attachments deleted
 */
async function deleteAttachmentsByPostId(postId, deleteFiles = true) {
  // Get all attachments first
  const attachments = await getAttachmentsByPostId(postId);

  // Delete physical files if requested
  if (deleteFiles) {
    for (const attachment of attachments) {
      try {
        const fullPath = path.join(process.cwd(), 'public', attachment.file_path);
        await fs.unlink(fullPath);

        if (attachment.thumbnail_path) {
          const thumbnailPath = path.join(process.cwd(), 'public', attachment.thumbnail_path);
          await fs.unlink(thumbnailPath).catch(() => {});
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        // Continue even if file deletion fails
      }
    }
  }

  // Delete from database
  const query = 'DELETE FROM attachments WHERE post_id = $1';
  const result = await db.query(query, [postId]);
  return result.rowCount;
}

module.exports = {
  getAttachmentsByPostId,
  getAttachmentById,
  createAttachment,
  deleteAttachment,
  incrementDownloadCount,
  getAttachmentCount,
  getTotalAttachmentSize,
  deleteAttachmentsByPostId
};
