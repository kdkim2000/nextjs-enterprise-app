/* eslint-disable no-console */
const express = require('express');
const router = express.Router();
const attachmentTypeService = require('../services/attachmentTypeService');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { transformMultiLangFields } = require('../utils/multiLangTransform');

/**
 * Transform database row to API format
 */
function transformToAPI(dbRow) {
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

// GET /api/attachment-type - Get all attachment types with pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const [attachmentTypes, totalCount] = await Promise.all([
      attachmentTypeService.getAllAttachmentTypes({ search, status, limit: limitNum, offset }),
      attachmentTypeService.getAttachmentTypeCount({ search, status })
    ]);

    res.json({
      attachmentTypes: attachmentTypes.map(transformToAPI),
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching attachment types:', error);
    res.status(500).json({ error: 'Failed to fetch attachment types' });
  }
});

// GET /api/attachment-type/all - Get all attachment types without pagination
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const attachmentTypes = await attachmentTypeService.getAllAttachmentTypes({ status });
    res.json({ attachmentTypes: attachmentTypes.map(transformToAPI) });
  } catch (error) {
    console.error('Error fetching all attachment types:', error);
    res.status(500).json({ error: 'Failed to fetch attachment types' });
  }
});

// GET /api/attachment-type/code/:code - Get attachment type by code (public endpoint for upload validation)
router.get('/code/:code', async (req, res) => {
  try {
    const attachmentType = await attachmentTypeService.getAttachmentTypeByCode(req.params.code);

    if (!attachmentType) {
      return res.status(404).json({ error: 'Attachment type not found' });
    }

    res.json({ attachmentType: transformToAPI(attachmentType) });
  } catch (error) {
    console.error('Error fetching attachment type:', error);
    res.status(500).json({ error: 'Failed to fetch attachment type' });
  }
});

// GET /api/attachment-type/:id - Get attachment type by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const attachmentType = await attachmentTypeService.getAttachmentTypeById(req.params.id);

    if (!attachmentType) {
      return res.status(404).json({ error: 'Attachment type not found' });
    }

    res.json({ attachmentType: transformToAPI(attachmentType) });
  } catch (error) {
    console.error('Error fetching attachment type:', error);
    res.status(500).json({ error: 'Failed to fetch attachment type' });
  }
});

// POST /api/attachment-type - Create a new attachment type
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Only admin can create
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin only' });
    }

    const {
      code,
      name,
      description,
      storagePath,
      maxFileCount,
      maxFileSize,
      maxTotalSize,
      allowedExtensions,
      allowedMimeTypes,
      status,
      order
    } = req.body;

    // Validate required fields
    if (!code || !name || !storagePath) {
      return res.status(400).json({ error: 'Missing required fields: code, name, storagePath' });
    }

    // Check if code already exists
    const existing = await attachmentTypeService.getAttachmentTypeByCode(code);
    if (existing) {
      return res.status(409).json({ error: 'Attachment type code already exists' });
    }

    const data = {
      id: uuidv4(),
      code,
      nameEn: name.en || '',
      nameKo: name.ko || '',
      nameZh: name.zh || '',
      nameVi: name.vi || '',
      descriptionEn: description?.en || '',
      descriptionKo: description?.ko || '',
      descriptionZh: description?.zh || '',
      descriptionVi: description?.vi || '',
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
  } catch (error) {
    console.error('Error creating attachment type:', error);
    res.status(500).json({ error: 'Failed to create attachment type', details: error.message });
  }
});

// PUT /api/attachment-type/:id - Update an attachment type
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Only admin can update
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin only' });
    }

    const existing = await attachmentTypeService.getAttachmentTypeById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Attachment type not found' });
    }

    const {
      code,
      name,
      description,
      storagePath,
      maxFileCount,
      maxFileSize,
      maxTotalSize,
      allowedExtensions,
      allowedMimeTypes,
      status,
      order
    } = req.body;

    // Check if new code conflicts
    if (code && code !== existing.code) {
      const conflict = await attachmentTypeService.getAttachmentTypeByCode(code);
      if (conflict && conflict.id !== req.params.id) {
        return res.status(409).json({ error: 'Attachment type code already exists' });
      }
    }

    const updates = {};
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
  } catch (error) {
    console.error('Error updating attachment type:', error);
    res.status(500).json({ error: 'Failed to update attachment type', details: error.message });
  }
});

// DELETE /api/attachment-type/:id - Delete an attachment type
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Only admin can delete
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin only' });
    }

    const existing = await attachmentTypeService.getAttachmentTypeById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Attachment type not found' });
    }

    const deleted = await attachmentTypeService.deleteAttachmentType(req.params.id);
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete attachment type' });
    }

    res.json({ message: 'Attachment type deleted successfully', attachmentType: transformToAPI(existing) });
  } catch (error) {
    console.error('Error deleting attachment type:', error);
    res.status(500).json({ error: 'Failed to delete attachment type' });
  }
});

module.exports = router;
