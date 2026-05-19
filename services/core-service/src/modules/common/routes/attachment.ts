/**
 * Attachment Routes - Common Module
 */

import { Router, Request, Response } from 'express';
import * as attachmentService from '../services/attachmentService';
import * as attachmentTypeService from '../services/attachmentTypeService';
import { authenticateToken } from '../../../middleware/authMiddleware';
import { uploadMultipleBuffer } from '../utils/fileUpload';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('core-service:common:attachment');

function transformAttachment(attachment: any) {
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

function transformFile(file: any) {
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

router.post('/upload', authenticateToken, uploadMultipleBuffer('files', 20), async (req: Request, res: Response): Promise<void> => {
  try {
    const { attachmentTypeCode, attachmentId, referenceType, referenceId, title, description } = req.body;

    if (!attachmentTypeCode) {
      res.status(400).json({ error: 'Missing required field: attachmentTypeCode' });
      return;
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const result = await attachmentService.uploadFiles(
      attachmentTypeCode,
      req.files as Express.Multer.File[],
      { attachmentId, referenceType, referenceId, title, description, createdBy: req.user!.userId }
    );

    res.status(201).json({
      attachment: transformAttachment(result.attachment),
      uploadedFiles: result.files.map(transformFile),
      errors: result.errors
    });
  } catch (error: any) {
    logger.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload files' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { attachmentTypeCode, referenceType, referenceId, title, description } = req.body;

    if (!attachmentTypeCode) {
      res.status(400).json({ error: 'Missing required field: attachmentTypeCode' });
      return;
    }

    const attachmentType = await attachmentTypeService.getAttachmentTypeByCode(attachmentTypeCode);
    if (!attachmentType) {
      res.status(404).json({ error: `Attachment type '${attachmentTypeCode}' not found` });
      return;
    }

    const attachment = await attachmentService.createAttachment({
      attachmentTypeId: attachmentType.id,
      referenceType, referenceId, title, description, createdBy: req.user!.userId
    });

    res.status(201).json({ attachment: transformAttachment(attachment) });
  } catch (error: any) {
    logger.error('Create attachment error:', error);
    res.status(500).json({ error: 'Failed to create attachment' });
  }
});

router.get('/reference/:type/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const attachments = await attachmentService.getAttachmentsByReference(req.params.type, req.params.id);
    res.json({ attachments: attachments.map(transformAttachment) });
  } catch (error: any) {
    logger.error('Get attachments error:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const attachment = await attachmentService.getAttachmentById(req.params.id);
    if (!attachment) {
      res.status(404).json({ error: 'Attachment not found' });
      return;
    }
    res.json({ attachment: transformAttachment(attachment) });
  } catch (error: any) {
    logger.error('Get attachment error:', error);
    res.status(500).json({ error: 'Failed to fetch attachment' });
  }
});

router.put('/:id/reference', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { referenceType, referenceId } = req.body;
    if (!referenceType || !referenceId) {
      res.status(400).json({ error: 'Missing required fields: referenceType, referenceId' });
      return;
    }

    const attachment = await attachmentService.getAttachmentById(req.params.id, false);
    if (!attachment) {
      res.status(404).json({ error: 'Attachment not found' });
      return;
    }

    const updated = await attachmentService.updateAttachmentReference(req.params.id, referenceType, referenceId);
    res.json({ attachment: transformAttachment(updated) });
  } catch (error: any) {
    logger.error('Update attachment reference error:', error);
    res.status(500).json({ error: 'Failed to update attachment reference' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const attachment = await attachmentService.getAttachmentById(req.params.id, false);
    if (!attachment) {
      res.status(404).json({ error: 'Attachment not found' });
      return;
    }

    if (req.user!.role !== 'admin' && attachment.created_by !== req.user!.userId) {
      res.status(403).json({ error: 'You do not have permission to delete this attachment' });
      return;
    }

    await attachmentService.deleteAttachment(req.params.id, true);
    res.json({ message: 'Attachment deleted successfully' });
  } catch (error: any) {
    logger.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

router.get('/file/:fileId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const file = await attachmentService.getFileById(req.params.fileId);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }
    res.json({ file: transformFile(file) });
  } catch (error: any) {
    logger.error('Get file error:', error);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

router.get('/file/:fileId/view', async (req: Request, res: Response): Promise<void> => {
  try {
    const file = await attachmentService.getFileById(req.params.fileId);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // full_path stores the Supabase public URL; redirect the client there
    const publicUrl = file.full_path;
    if (!publicUrl) {
      res.status(404).json({ error: 'File not found in storage' });
      return;
    }

    res.redirect(publicUrl);
  } catch (error: any) {
    logger.error('View file error:', error);
    res.status(500).json({ error: 'Failed to view file' });
  }
});

router.get('/file/:fileId/download', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const file = await attachmentService.getFileById(req.params.fileId);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // full_path stores the Supabase public URL; redirect the client there
    const publicUrl = file.full_path;
    if (!publicUrl) {
      res.status(404).json({ error: 'File not found in storage' });
      return;
    }

    await attachmentService.incrementDownloadCount(req.params.fileId);

    // Redirect with Content-Disposition hint via query param (Supabase supports ?download=)
    const downloadUrl = publicUrl.includes('?')
      ? `${publicUrl}&download=${encodeURIComponent(file.original_filename)}`
      : `${publicUrl}?download=${encodeURIComponent(file.original_filename)}`;
    res.redirect(downloadUrl);
  } catch (error: any) {
    logger.error('Download file error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

router.delete('/file/:fileId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const file = await attachmentService.getFileById(req.params.fileId);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const attachment = await attachmentService.getAttachmentById(file.attachment_id, false);
    if (!attachment) {
      res.status(404).json({ error: 'Attachment not found' });
      return;
    }

    if (req.user!.role !== 'admin' && attachment.created_by !== req.user!.userId) {
      res.status(403).json({ error: 'You do not have permission to delete this file' });
      return;
    }

    await attachmentService.deleteFile(req.params.fileId, true);
    res.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    logger.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
