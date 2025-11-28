/* eslint-disable no-console */
const express = require('express');
const router = express.Router();
const attachmentService = require('../services/attachmentService');
const attachmentTypeService = require('../services/attachmentTypeService');
const { authenticateToken } = require('../middleware/auth');
const { uploadMultipleBuffer } = require('../middleware/fileUploadBuffer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Transform attachment for API response
 */
function transformAttachment(attachment) {
  if (!attachment) return null;

  return {
    id: attachment.id,
    attachmentTypeId: attachment.attachment_type_id,
    attachmentTypeCode: attachment.attachment_type_code,
    referenceType: attachment.reference_type,
    referenceId: attachment.reference_id,
    title: attachment.title,
    description: attachment.description,
    fileCount: attachment.file_count,
    totalSize: attachment.total_size,
    status: attachment.status,
    createdBy: attachment.created_by,
    createdAt: attachment.created_at,
    updatedAt: attachment.updated_at,
    files: attachment.files ? attachment.files.map(transformFile) : []
  };
}

/**
 * Transform file for API response
 */
function transformFile(file) {
  if (!file) return null;

  return {
    id: file.id,
    attachmentId: file.attachment_id,
    originalFilename: file.original_filename,
    storedFilename: file.stored_filename,
    fileExtension: file.file_extension,
    mimeType: file.mime_type,
    fileSize: file.file_size,
    storagePath: file.storage_path,
    checksum: file.checksum,
    isImage: file.is_image,
    imageWidth: file.image_width,
    imageHeight: file.image_height,
    thumbnailPath: file.thumbnail_path,
    downloadCount: file.download_count,
    order: file.order,
    status: file.status,
    createdBy: file.created_by,
    createdAt: file.created_at,
    updatedAt: file.updated_at
  };
}

// ==========================================
// ATTACHMENT GROUP ROUTES
// ==========================================

/**
 * POST /api/attachment/upload - Upload files
 * Creates a new attachment group (or adds to existing) and uploads files
 */
router.post('/upload', authenticateToken, ...uploadMultipleBuffer('files', 20), async (req, res) => {
  try {
    const {
      attachmentTypeCode,
      attachmentId,
      referenceType,
      referenceId,
      title,
      description
    } = req.body;

    console.log('[ATTACHMENT UPLOAD] Request received:', {
      attachmentTypeCode,
      attachmentId,
      referenceType,
      referenceId,
      filesCount: req.files?.length || 0,
      userId: req.user?.userId
    });

    if (!attachmentTypeCode) {
      console.error('[ATTACHMENT UPLOAD] Missing attachmentTypeCode');
      return res.status(400).json({ error: 'Missing required field: attachmentTypeCode' });
    }

    if (!req.files || req.files.length === 0) {
      console.error('[ATTACHMENT UPLOAD] No files in request');
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log('[ATTACHMENT UPLOAD] Files received:', req.files.map(f => ({
      name: f.originalname,
      size: f.size,
      mimetype: f.mimetype
    })));

    // Upload files using the service
    const result = await attachmentService.uploadFiles(attachmentTypeCode, req.files, {
      attachmentId,
      referenceType,
      referenceId,
      title,
      description,
      createdBy: req.user.userId
    });

    console.log('[ATTACHMENT UPLOAD] Upload result:', {
      attachmentId: result.attachment?.id,
      filesUploaded: result.files?.length || 0,
      errors: result.errors
    });

    // Check for errors
    if (result.errors && result.errors.length > 0) {
      console.warn('[ATTACHMENT UPLOAD] Some files failed to upload:', result.errors);
    }

    res.status(201).json({
      attachment: transformAttachment(result.attachment),
      uploadedFiles: result.files.map(transformFile),
      errors: result.errors
    });
  } catch (error) {
    console.error('[ATTACHMENT UPLOAD] Error:', error.message);
    console.error('[ATTACHMENT UPLOAD] Stack:', error.stack);
    res.status(500).json({ error: error.message || 'Failed to upload files' });
  }
});

/**
 * POST /api/attachment - Create an empty attachment group
 * Useful for creating attachment before having files (e.g., for drag-drop UI)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      attachmentTypeCode,
      referenceType,
      referenceId,
      title,
      description
    } = req.body;

    if (!attachmentTypeCode) {
      return res.status(400).json({ error: 'Missing required field: attachmentTypeCode' });
    }

    // Get attachment type
    const attachmentType = await attachmentTypeService.getAttachmentTypeByCode(attachmentTypeCode);
    if (!attachmentType) {
      return res.status(404).json({ error: `Attachment type '${attachmentTypeCode}' not found` });
    }

    // Create attachment group
    const attachment = await attachmentService.createAttachment({
      attachmentTypeId: attachmentType.id,
      referenceType,
      referenceId,
      title,
      description,
      createdBy: req.user.userId
    });

    res.status(201).json({ attachment: transformAttachment(attachment) });
  } catch (error) {
    console.error('Error creating attachment:', error);
    res.status(500).json({ error: 'Failed to create attachment' });
  }
});

/**
 * GET /api/attachment/reference/:type/:id - Get attachments by reference
 */
router.get('/reference/:type/:id', authenticateToken, async (req, res) => {
  try {
    const attachments = await attachmentService.getAttachmentsByReference(
      req.params.type,
      req.params.id
    );

    res.json({ attachments: attachments.map(transformAttachment) });
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
});

/**
 * GET /api/attachment/:id - Get attachment by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const attachment = await attachmentService.getAttachmentById(req.params.id);

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    res.json({ attachment: transformAttachment(attachment) });
  } catch (error) {
    console.error('Error fetching attachment:', error);
    res.status(500).json({ error: 'Failed to fetch attachment' });
  }
});

/**
 * PUT /api/attachment/:id/reference - Update attachment reference
 */
router.put('/:id/reference', authenticateToken, async (req, res) => {
  try {
    const { referenceType, referenceId } = req.body;

    if (!referenceType || !referenceId) {
      return res.status(400).json({ error: 'Missing required fields: referenceType, referenceId' });
    }

    const attachment = await attachmentService.getAttachmentById(req.params.id, false);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const updated = await attachmentService.updateAttachmentReference(
      req.params.id,
      referenceType,
      referenceId
    );

    res.json({ attachment: transformAttachment(updated) });
  } catch (error) {
    console.error('Error updating attachment reference:', error);
    res.status(500).json({ error: 'Failed to update attachment reference' });
  }
});

/**
 * DELETE /api/attachment/:id - Delete attachment group
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const attachment = await attachmentService.getAttachmentById(req.params.id, false);

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Check permission: only admin or creator can delete
    if (req.user.role !== 'admin' && attachment.created_by !== req.user.userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this attachment' });
    }

    await attachmentService.deleteAttachment(req.params.id, true);

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

// ==========================================
// ATTACHMENT FILE ROUTES
// ==========================================

/**
 * GET /api/attachment/file/:fileId - Get file info
 */
router.get('/file/:fileId', authenticateToken, async (req, res) => {
  try {
    const file = await attachmentService.getFileById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ file: transformFile(file) });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

/**
 * GET /api/attachment/file/:fileId/download - Download file
 */
router.get('/file/:fileId/download', authenticateToken, async (req, res) => {
  try {
    const file = await attachmentService.getFileById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Determine full path
    let fullPath;
    if (file.full_path) {
      fullPath = file.full_path;
    } else {
      fullPath = path.join(process.cwd(), 'uploads', file.storage_path, file.stored_filename);
    }

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Increment download count
    await attachmentService.incrementDownloadCount(req.params.fileId);

    // Send file with original filename
    res.download(fullPath, file.original_filename);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

/**
 * GET /api/attachment/file/:fileId/view - View file (inline)
 */
router.get('/file/:fileId/view', authenticateToken, async (req, res) => {
  try {
    const file = await attachmentService.getFileById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Determine full path
    let fullPath;
    if (file.full_path) {
      fullPath = file.full_path;
    } else {
      fullPath = path.join(process.cwd(), 'uploads', file.storage_path, file.stored_filename);
    }

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Set content type for inline display
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.original_filename)}"`);

    // Stream file
    const fileStream = require('fs').createReadStream(fullPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error viewing file:', error);
    res.status(500).json({ error: 'Failed to view file' });
  }
});

/**
 * PUT /api/attachment/file/:fileId/order - Update file order
 */
router.put('/file/:fileId/order', authenticateToken, async (req, res) => {
  try {
    const { order } = req.body;

    if (order === undefined || order === null) {
      return res.status(400).json({ error: 'Missing required field: order' });
    }

    const file = await attachmentService.getFileById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const updated = await attachmentService.updateFileOrder(req.params.fileId, order);
    res.json({ file: transformFile(updated) });
  } catch (error) {
    console.error('Error updating file order:', error);
    res.status(500).json({ error: 'Failed to update file order' });
  }
});

/**
 * DELETE /api/attachment/file/:fileId - Delete single file
 */
router.delete('/file/:fileId', authenticateToken, async (req, res) => {
  try {
    const file = await attachmentService.getFileById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get attachment to check permission
    const attachment = await attachmentService.getAttachmentById(file.attachment_id, false);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Check permission: only admin or creator can delete
    if (req.user.role !== 'admin' && attachment.created_by !== req.user.userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this file' });
    }

    await attachmentService.deleteFile(req.params.fileId, true);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// ==========================================
// BACKWARD COMPATIBILITY ROUTES (for posts)
// ==========================================

/**
 * GET /api/attachment/post/:postId - Get attachments for a post
 * @deprecated Use /api/attachment/reference/post/:postId instead
 */
router.get('/post/:postId', authenticateToken, async (req, res) => {
  try {
    const files = await attachmentService.getAttachmentsByPostId(req.params.postId);
    res.json({ attachments: files.map(transformFile) });
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
});

module.exports = router;
