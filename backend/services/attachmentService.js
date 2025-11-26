/**
 * Attachment Service Layer
 *
 * Provides data access methods for attachment-related operations.
 * Supports the new schema with attachments (groups) and attachment_files (individual files).
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Generate a unique stored filename with UUID
 * @param {string} originalFilename - Original filename
 * @returns {string} Unique stored filename
 */
function generateStoredFilename(originalFilename) {
  const ext = path.extname(originalFilename).toLowerCase();
  const uuid = uuidv4();
  return `${uuid}${ext}`;
}

/**
 * Calculate file checksum (MD5)
 * @param {Buffer} buffer - File buffer
 * @returns {string} MD5 checksum
 */
function calculateChecksum(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Check if file is an image based on MIME type
 * @param {string} mimeType - MIME type
 * @returns {boolean} True if image
 */
function isImageFile(mimeType) {
  return mimeType && mimeType.startsWith('image/');
}

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} File extension without dot
 */
function getFileExtension(filename) {
  const ext = path.extname(filename);
  return ext ? ext.substring(1).toLowerCase() : '';
}

/**
 * Validate file against attachment type settings
 * @param {Object} file - File object
 * @param {Object} attachmentType - Attachment type settings
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateFile(file, attachmentType) {
  // Check file size
  if (file.size > attachmentType.max_file_size) {
    return {
      valid: false,
      error: `File size (${file.size}) exceeds maximum allowed size (${attachmentType.max_file_size})`
    };
  }

  // Check file extension
  const ext = getFileExtension(file.originalname);
  const allowedExtensions = attachmentType.allowed_extensions || [];

  if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension (.${ext}) is not allowed. Allowed: ${allowedExtensions.join(', ')}`
    };
  }

  return { valid: true };
}

// ==========================================
// ATTACHMENT GROUP FUNCTIONS
// ==========================================

/**
 * Create a new attachment group
 * @param {Object} data - Attachment group data
 * @returns {Promise<Object>} Created attachment object
 */
async function createAttachment(data) {
  const {
    attachmentTypeId,
    referenceType,
    referenceId,
    title,
    description,
    createdBy
  } = data;

  const id = uuidv4();

  const query = `
    INSERT INTO attachments (
      id, attachment_type_id, reference_type, reference_id,
      title, description, file_count, total_size,
      status, created_by, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 'active', $7, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    id,
    attachmentTypeId,
    referenceType || null,
    referenceId || null,
    title || null,
    description || null,
    createdBy || null
  ];

  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Get attachment by ID with files
 * @param {string} attachmentId - Attachment ID
 * @param {boolean} includeFiles - Whether to include files
 * @returns {Promise<Object|null>} Attachment object with files or null
 */
async function getAttachmentById(attachmentId, includeFiles = true) {
  const query = `
    SELECT a.*, at.code as attachment_type_code, at.storage_path
    FROM attachments a
    LEFT JOIN attachment_types at ON a.attachment_type_id = at.id
    WHERE a.id = $1 AND a.status != 'deleted'
  `;

  const result = await db.query(query, [attachmentId]);
  const attachment = result.rows[0];

  if (!attachment) return null;

  if (includeFiles) {
    attachment.files = await getFilesByAttachmentId(attachmentId);
  }

  return attachment;
}

/**
 * Get attachments by reference
 * @param {string} referenceType - Reference type (e.g., 'post', 'comment')
 * @param {string} referenceId - Reference ID
 * @param {boolean} includeFiles - Whether to include files
 * @returns {Promise<Array>} Array of attachment objects
 */
async function getAttachmentsByReference(referenceType, referenceId, includeFiles = true) {
  const query = `
    SELECT a.*, at.code as attachment_type_code, at.storage_path
    FROM attachments a
    LEFT JOIN attachment_types at ON a.attachment_type_id = at.id
    WHERE a.reference_type = $1 AND a.reference_id = $2 AND a.status != 'deleted'
    ORDER BY a.created_at ASC
  `;

  const result = await db.query(query, [referenceType, referenceId]);
  const attachments = result.rows;

  if (includeFiles) {
    for (const attachment of attachments) {
      attachment.files = await getFilesByAttachmentId(attachment.id);
    }
  }

  return attachments;
}

/**
 * Update attachment reference (link attachment to a record after creation)
 * @param {string} attachmentId - Attachment ID
 * @param {string} referenceType - Reference type
 * @param {string} referenceId - Reference ID
 * @returns {Promise<Object>} Updated attachment
 */
async function updateAttachmentReference(attachmentId, referenceType, referenceId) {
  const query = `
    UPDATE attachments
    SET reference_type = $1, reference_id = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;

  const result = await db.query(query, [referenceType, referenceId, attachmentId]);
  return result.rows[0];
}

/**
 * Soft delete an attachment group and all its files
 * @param {string} attachmentId - Attachment ID
 * @param {boolean} deletePhysicalFiles - Whether to delete physical files
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteAttachment(attachmentId, deletePhysicalFiles = true) {
  const attachment = await getAttachmentById(attachmentId, true);

  if (!attachment) return false;

  // Delete physical files if requested
  if (deletePhysicalFiles && attachment.files) {
    for (const file of attachment.files) {
      await deletePhysicalFile(file);
    }
  }

  // Soft delete the attachment and its files
  await db.query(
    `UPDATE attachment_files SET status = 'deleted', deleted_at = NOW() WHERE attachment_id = $1`,
    [attachmentId]
  );

  const result = await db.query(
    `UPDATE attachments SET status = 'deleted', deleted_at = NOW() WHERE id = $1`,
    [attachmentId]
  );

  return result.rowCount > 0;
}

/**
 * Hard delete an attachment (permanent)
 * @param {string} attachmentId - Attachment ID
 * @returns {Promise<boolean>} True if deleted
 */
async function hardDeleteAttachment(attachmentId) {
  const attachment = await getAttachmentById(attachmentId, true);

  if (!attachment) return false;

  // Delete physical files
  if (attachment.files) {
    for (const file of attachment.files) {
      await deletePhysicalFile(file);
    }
  }

  // Delete from database (files will cascade delete)
  const result = await db.query('DELETE FROM attachments WHERE id = $1', [attachmentId]);

  return result.rowCount > 0;
}

// ==========================================
// ATTACHMENT FILE FUNCTIONS
// ==========================================

/**
 * Add a file to an attachment group
 * @param {Object} data - File data
 * @returns {Promise<Object>} Created file object
 */
async function addFileToAttachment(data) {
  const {
    attachmentId,
    originalFilename,
    storedFilename,
    fileExtension,
    mimeType,
    fileSize,
    storagePath,
    fullPath,
    checksum,
    isImage,
    imageWidth,
    imageHeight,
    thumbnailPath,
    order,
    createdBy
  } = data;

  const id = uuidv4();

  const query = `
    INSERT INTO attachment_files (
      id, attachment_id, original_filename, stored_filename,
      file_extension, mime_type, file_size, storage_path, full_path,
      checksum, is_image, image_width, image_height, thumbnail_path,
      download_count, "order", status, created_by, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 0, $15, 'active', $16, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    id,
    attachmentId,
    originalFilename,
    storedFilename,
    fileExtension || getFileExtension(originalFilename),
    mimeType || 'application/octet-stream',
    fileSize,
    storagePath,
    fullPath || null,
    checksum || null,
    isImage || false,
    imageWidth || null,
    imageHeight || null,
    thumbnailPath || null,
    order || 0,
    createdBy || null
  ];

  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Get file by ID
 * @param {string} fileId - File ID
 * @returns {Promise<Object|null>} File object or null
 */
async function getFileById(fileId) {
  const query = `
    SELECT af.*, a.attachment_type_id, at.storage_path as type_storage_path
    FROM attachment_files af
    JOIN attachments a ON af.attachment_id = a.id
    LEFT JOIN attachment_types at ON a.attachment_type_id = at.id
    WHERE af.id = $1 AND af.status != 'deleted'
  `;

  const result = await db.query(query, [fileId]);
  return result.rows[0] || null;
}

/**
 * Get files by attachment ID
 * @param {string} attachmentId - Attachment ID
 * @returns {Promise<Array>} Array of file objects
 */
async function getFilesByAttachmentId(attachmentId) {
  const query = `
    SELECT *
    FROM attachment_files
    WHERE attachment_id = $1 AND status != 'deleted'
    ORDER BY "order", created_at ASC
  `;

  const result = await db.query(query, [attachmentId]);
  return result.rows;
}

/**
 * Update file order
 * @param {string} fileId - File ID
 * @param {number} order - New order
 * @returns {Promise<Object>} Updated file
 */
async function updateFileOrder(fileId, order) {
  const query = `
    UPDATE attachment_files
    SET "order" = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;

  const result = await db.query(query, [order, fileId]);
  return result.rows[0];
}

/**
 * Soft delete a file
 * @param {string} fileId - File ID
 * @param {boolean} deletePhysical - Whether to delete physical file
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteFile(fileId, deletePhysical = true) {
  const file = await getFileById(fileId);

  if (!file) return false;

  // Delete physical file if requested
  if (deletePhysical) {
    await deletePhysicalFile(file);
  }

  // Soft delete from database
  const result = await db.query(
    `UPDATE attachment_files SET status = 'deleted', deleted_at = NOW() WHERE id = $1`,
    [fileId]
  );

  return result.rowCount > 0;
}

/**
 * Increment download count for a file
 * @param {string} fileId - File ID
 * @returns {Promise<Object>} Updated file
 */
async function incrementDownloadCount(fileId) {
  const query = `
    UPDATE attachment_files
    SET download_count = download_count + 1, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await db.query(query, [fileId]);
  return result.rows[0];
}

/**
 * Find files by checksum (for duplicate detection)
 * @param {string} checksum - File checksum
 * @returns {Promise<Array>} Array of files with same checksum
 */
async function findFilesByChecksum(checksum) {
  const query = `
    SELECT *
    FROM attachment_files
    WHERE checksum = $1 AND status = 'active'
  `;

  const result = await db.query(query, [checksum]);
  return result.rows;
}

// ==========================================
// PHYSICAL FILE OPERATIONS
// ==========================================

/**
 * Delete physical file from storage
 * @param {Object} file - File object with storage_path and stored_filename
 * @returns {Promise<void>}
 */
async function deletePhysicalFile(file) {
  try {
    if (file.full_path) {
      await fs.unlink(file.full_path);
    } else if (file.storage_path && file.stored_filename) {
      const fullPath = path.join(process.cwd(), 'uploads', file.storage_path, file.stored_filename);
      await fs.unlink(fullPath);
    }

    // Delete thumbnail if exists
    if (file.thumbnail_path) {
      try {
        await fs.unlink(file.thumbnail_path);
      } catch (e) {
        // Ignore thumbnail deletion errors
      }
    }
  } catch (error) {
    console.error('Error deleting physical file:', error);
    // Don't throw - continue even if file deletion fails
  }
}

/**
 * Generate date-based storage path (YYYY/YYYYMM/YYYYMMDD)
 * @param {Date} date - Date to use for path generation (defaults to now)
 * @returns {string} Date-based path like '2025/202511/20251127'
 */
function getDateBasedPath(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${year}${month}/${year}${month}${day}`;
}

/**
 * Ensure storage directory exists
 * @param {string} storagePath - Relative storage path
 * @returns {Promise<string>} Full directory path
 */
async function ensureStorageDirectory(storagePath) {
  const fullPath = path.join(process.cwd(), 'uploads', storagePath);
  await fs.mkdir(fullPath, { recursive: true });
  return fullPath;
}

/**
 * Save file to storage with date-based organization
 * @param {Buffer} buffer - File buffer
 * @param {string} baseStoragePath - Base storage path from attachment type (e.g., '/board')
 * @param {string} storedFilename - Stored filename (UUID-based)
 * @returns {Promise<{fullPath: string, relativePath: string}>} Full file path and relative storage path
 */
async function saveFileToStorage(buffer, baseStoragePath, storedFilename) {
  // Create date-based subdirectory: /board/2025/11/27/
  const datePath = getDateBasedPath();
  const relativePath = path.join(baseStoragePath, datePath).replace(/\\/g, '/');

  const dirPath = await ensureStorageDirectory(relativePath);
  const fullPath = path.join(dirPath, storedFilename);
  await fs.writeFile(fullPath, buffer);

  return {
    fullPath,
    relativePath  // e.g., '/board/2025/11/27'
  };
}

// ==========================================
// HIGH-LEVEL FILE UPLOAD FUNCTION
// ==========================================

/**
 * Upload files to an attachment group
 * @param {string} attachmentTypeCode - Attachment type code
 * @param {Array} files - Array of file objects from multer
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} { attachment, files, errors }
 */
async function uploadFiles(attachmentTypeCode, files, options = {}) {
  const {
    referenceType,
    referenceId,
    attachmentId: existingAttachmentId,
    title,
    description,
    createdBy
  } = options;

  // Get attachment type settings
  const attachmentTypeService = require('./attachmentTypeService');
  const attachmentType = await attachmentTypeService.getAttachmentTypeByCode(attachmentTypeCode);

  if (!attachmentType) {
    throw new Error(`Attachment type '${attachmentTypeCode}' not found`);
  }

  // Create or get attachment group
  let attachment;
  if (existingAttachmentId) {
    attachment = await getAttachmentById(existingAttachmentId, false);
    if (!attachment) {
      throw new Error(`Attachment '${existingAttachmentId}' not found`);
    }
  } else {
    attachment = await createAttachment({
      attachmentTypeId: attachmentType.id,
      referenceType,
      referenceId,
      title,
      description,
      createdBy
    });
  }

  // Check file count limit
  const currentFileCount = await db.query(
    `SELECT COUNT(*) FROM attachment_files WHERE attachment_id = $1 AND status = 'active'`,
    [attachment.id]
  );
  const existingCount = parseInt(currentFileCount.rows[0].count);

  if (existingCount + files.length > attachmentType.max_file_count) {
    throw new Error(
      `File count limit exceeded. Max: ${attachmentType.max_file_count}, Current: ${existingCount}, Adding: ${files.length}`
    );
  }

  const uploadedFiles = [];
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    try {
      // Validate file
      const validation = validateFile(file, attachmentType);
      if (!validation.valid) {
        errors.push({ file: file.originalname, error: validation.error });
        continue;
      }

      // Generate stored filename
      const storedFilename = generateStoredFilename(file.originalname);
      const fileExtension = getFileExtension(file.originalname);
      const baseStoragePath = attachmentType.storage_path;

      // Calculate checksum
      const checksum = calculateChecksum(file.buffer);

      // Save physical file (with date-based directory structure)
      const { fullPath, relativePath } = await saveFileToStorage(file.buffer, baseStoragePath, storedFilename);

      // Check if image
      const isImage = isImageFile(file.mimetype);

      // Add to database (storagePath includes date path: /board/2025/11/27)
      const savedFile = await addFileToAttachment({
        attachmentId: attachment.id,
        originalFilename: file.originalname,
        storedFilename,
        fileExtension,
        mimeType: file.mimetype,
        fileSize: file.size,
        storagePath: relativePath,  // Now includes date path
        fullPath,
        checksum,
        isImage,
        order: existingCount + i,
        createdBy
      });

      uploadedFiles.push(savedFile);
    } catch (error) {
      errors.push({ file: file.originalname, error: error.message });
    }
  }

  // Refresh attachment with updated stats
  const updatedAttachment = await getAttachmentById(attachment.id, true);

  return {
    attachment: updatedAttachment,
    files: uploadedFiles,
    errors
  };
}

// ==========================================
// BACKWARD COMPATIBILITY FUNCTIONS
// (for existing post attachment functionality)
// ==========================================

/**
 * Get attachments by post ID (backward compatible)
 * @param {string} postId - Post ID
 * @returns {Promise<Array>} Array of file objects
 */
async function getAttachmentsByPostId(postId) {
  const attachments = await getAttachmentsByReference('post', postId, true);

  // Flatten files for backward compatibility
  const files = [];
  for (const attachment of attachments) {
    if (attachment.files) {
      for (const file of attachment.files) {
        files.push({
          ...file,
          post_id: postId,
          attachment_group_id: attachment.id
        });
      }
    }
  }

  return files;
}

/**
 * Delete all attachments for a post (backward compatible)
 * @param {string} postId - Post ID
 * @param {boolean} deleteFiles - Whether to delete physical files
 * @returns {Promise<number>} Number of attachments deleted
 */
async function deleteAttachmentsByPostId(postId, deleteFiles = true) {
  const attachments = await getAttachmentsByReference('post', postId, false);
  let count = 0;

  for (const attachment of attachments) {
    const deleted = await deleteAttachment(attachment.id, deleteFiles);
    if (deleted) count++;
  }

  return count;
}

module.exports = {
  // Utility functions
  generateStoredFilename,
  calculateChecksum,
  isImageFile,
  getFileExtension,
  validateFile,

  // Attachment group functions
  createAttachment,
  getAttachmentById,
  getAttachmentsByReference,
  updateAttachmentReference,
  deleteAttachment,
  hardDeleteAttachment,

  // Attachment file functions
  addFileToAttachment,
  getFileById,
  getFilesByAttachmentId,
  updateFileOrder,
  deleteFile,
  incrementDownloadCount,
  findFilesByChecksum,

  // Physical file operations
  deletePhysicalFile,
  ensureStorageDirectory,
  saveFileToStorage,

  // High-level upload function
  uploadFiles,

  // Backward compatibility
  getAttachmentsByPostId,
  deleteAttachmentsByPostId
};
