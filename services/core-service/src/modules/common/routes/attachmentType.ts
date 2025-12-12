/**
 * Attachment Type Routes - Common Module
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as attachmentTypeService from '../services/attachmentTypeService';
import { authenticateToken, requireAdmin } from '../../../middleware/authMiddleware';
import { transformMultiLangFields } from '../utils/multiLangTransform';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('core-service:common:attachmentType');

function transformToAPI(dbRow: any) {
  if (!dbRow) return null;
  const transformed = transformMultiLangFields(dbRow, ['name', 'description']);
  return {
    id: dbRow.id,
    code: dbRow.code,
    name: transformed.name,
    description: transformed.description,
    storagePath: dbRow.storage_path,
    maxFileCount: dbRow.max_file_count,
    maxFileSize: dbRow.max_file_size,
    maxTotalSize: dbRow.max_total_size,
    allowedExtensions: dbRow.allowed_extensions || [],
    allowedMimeTypes: dbRow.allowed_mime_types || [],
    status: dbRow.status,
    order: dbRow.order,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at
  };
}

router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const [attachmentTypes, totalCount] = await Promise.all([
      attachmentTypeService.getAllAttachmentTypes({ search: search as string, status: status as string, limit: limitNum, offset }),
      attachmentTypeService.getAttachmentTypeCount({ search: search as string, status: status as string })
    ]);

    res.json({
      attachmentTypes: attachmentTypes.map(transformToAPI),
      pagination: { page: pageNum, limit: limitNum, totalCount, totalPages: Math.ceil(totalCount / limitNum) }
    });
  } catch (error: any) {
    logger.error('Error fetching attachment types:', error);
    res.status(500).json({ error: 'Failed to fetch attachment types' });
  }
});

router.get('/all', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const attachmentTypes = await attachmentTypeService.getAllAttachmentTypes({ status: status as string });
    res.json({ attachmentTypes: attachmentTypes.map(transformToAPI) });
  } catch (error: any) {
    logger.error('Error fetching all attachment types:', error);
    res.status(500).json({ error: 'Failed to fetch attachment types' });
  }
});

router.get('/code/:code', async (req: Request, res: Response): Promise<void> => {
  try {
    const attachmentType = await attachmentTypeService.getAttachmentTypeByCode(req.params.code);
    if (!attachmentType) {
      res.status(404).json({ error: 'Attachment type not found' });
      return;
    }
    res.json({ attachmentType: transformToAPI(attachmentType) });
  } catch (error: any) {
    logger.error('Error fetching attachment type:', error);
    res.status(500).json({ error: 'Failed to fetch attachment type' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const attachmentType = await attachmentTypeService.getAttachmentTypeById(req.params.id);
    if (!attachmentType) {
      res.status(404).json({ error: 'Attachment type not found' });
      return;
    }
    res.json({ attachmentType: transformToAPI(attachmentType) });
  } catch (error: any) {
    logger.error('Error fetching attachment type:', error);
    res.status(500).json({ error: 'Failed to fetch attachment type' });
  }
});

router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, name, description, storagePath, maxFileCount, maxFileSize, maxTotalSize, allowedExtensions, allowedMimeTypes, status, order } = req.body;

    if (!code || !name || !storagePath) {
      res.status(400).json({ error: 'Missing required fields: code, name, storagePath' });
      return;
    }

    const existing = await attachmentTypeService.getAttachmentTypeByCode(code);
    if (existing) {
      res.status(409).json({ error: 'Attachment type code already exists' });
      return;
    }

    const data = {
      id: uuidv4(), code,
      nameEn: name.en || '', nameKo: name.ko || '', nameZh: name.zh || '', nameVi: name.vi || '',
      descriptionEn: description?.en || '', descriptionKo: description?.ko || '',
      descriptionZh: description?.zh || '', descriptionVi: description?.vi || '',
      storagePath,
      maxFileCount: maxFileCount || 5,
      maxFileSize: maxFileSize || 10485760,
      maxTotalSize: maxTotalSize || 52428800,
      allowedExtensions: allowedExtensions || [],
      allowedMimeTypes: allowedMimeTypes || [],
      status: status || 'active',
      order: order || 0
    };

    const created = await attachmentTypeService.createAttachmentType(data);
    res.status(201).json({ attachmentType: transformToAPI(created) });
  } catch (error: any) {
    logger.error('Error creating attachment type:', error);
    res.status(500).json({ error: 'Failed to create attachment type', details: error.message });
  }
});

router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await attachmentTypeService.getAttachmentTypeById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Attachment type not found' });
      return;
    }

    const { code, name, description, storagePath, maxFileCount, maxFileSize, maxTotalSize, allowedExtensions, allowedMimeTypes, status, order } = req.body;

    if (code && code !== existing.code) {
      const conflict = await attachmentTypeService.getAttachmentTypeByCode(code);
      if (conflict && conflict.id !== req.params.id) {
        res.status(409).json({ error: 'Attachment type code already exists' });
        return;
      }
    }

    const updates: any = {};
    if (code) updates.code = code;
    if (name) {
      if (name.en !== undefined) updates.nameEn = name.en;
      if (name.ko !== undefined) updates.nameKo = name.ko;
      if (name.zh !== undefined) updates.nameZh = name.zh;
      if (name.vi !== undefined) updates.nameVi = name.vi;
    }
    if (description) {
      if (description.en !== undefined) updates.descriptionEn = description.en;
      if (description.ko !== undefined) updates.descriptionKo = description.ko;
      if (description.zh !== undefined) updates.descriptionZh = description.zh;
      if (description.vi !== undefined) updates.descriptionVi = description.vi;
    }
    if (storagePath !== undefined) updates.storagePath = storagePath;
    if (maxFileCount !== undefined) updates.maxFileCount = maxFileCount;
    if (maxFileSize !== undefined) updates.maxFileSize = maxFileSize;
    if (maxTotalSize !== undefined) updates.maxTotalSize = maxTotalSize;
    if (allowedExtensions !== undefined) updates.allowedExtensions = allowedExtensions;
    if (allowedMimeTypes !== undefined) updates.allowedMimeTypes = allowedMimeTypes;
    if (status !== undefined) updates.status = status;
    if (order !== undefined) updates.order = order;

    const updated = await attachmentTypeService.updateAttachmentType(req.params.id, updates);
    res.json({ attachmentType: transformToAPI(updated) });
  } catch (error: any) {
    logger.error('Error updating attachment type:', error);
    res.status(500).json({ error: 'Failed to update attachment type', details: error.message });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await attachmentTypeService.getAttachmentTypeById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Attachment type not found' });
      return;
    }

    const deleted = await attachmentTypeService.deleteAttachmentType(req.params.id);
    if (!deleted) {
      res.status(500).json({ error: 'Failed to delete attachment type' });
      return;
    }

    res.json({ message: 'Attachment type deleted successfully', attachmentType: transformToAPI(existing) });
  } catch (error: any) {
    logger.error('Error deleting attachment type:', error);
    res.status(500).json({ error: 'Failed to delete attachment type' });
  }
});

export default router;
