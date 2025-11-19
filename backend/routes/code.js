const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const codeService = require('../services/codeService');
const { transformMultiLangFields } = require('../utils/multiLangTransform');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

/**
 * Get all codes or filter by codeType
 * GET /api/code?codeType=USER_STATUS&page=1&limit=50
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { codeType, code, status, page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const codes = await codeService.getAllCodes({
      codeType,
      code,
      status,
      limit: limitNum,
      offset
    });

    const totalCount = await codeService.getCodeCount({
      codeType,
      code,
      status
    });

    // Transform multilingual fields for all codes
    const transformedCodes = codes.map(code =>
      transformMultiLangFields(code, ['name', 'description'])
    );

    res.json({
      codes: transformedCodes,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Get codes error:', error);
    res.status(500).json({ error: 'Failed to fetch codes' });
  }
});

/**
 * Get code by ID
 * GET /api/code/:id
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const code = await codeService.getCodeById(id);

    if (!code) {
      return res.status(404).json({ error: 'Code not found' });
    }

    // Transform multilingual fields
    const transformedCode = transformMultiLangFields(code, ['name', 'description']);

    res.json({ code: transformedCode });
  } catch (error) {
    console.error('Get code error:', error);
    res.status(500).json({ error: 'Failed to fetch code' });
  }
});

/**
 * Get all code types
 * GET /api/code/types/list
 */
router.get('/types/list', authenticateToken, async (req, res) => {
  try {
    const codeTypes = await codeService.getDistinctCodeTypes();
    res.json({ codeTypes });
  } catch (error) {
    console.error('Get code types error:', error);
    res.status(500).json({ error: 'Failed to fetch code types' });
  }
});

/**
 * Get codes by type
 * GET /api/code/type/:codeType
 */
router.get('/type/:codeType', authenticateToken, async (req, res) => {
  try {
    const { codeType } = req.params;
    const codes = await codeService.getCodesByType(codeType);

    // Transform multilingual fields for all codes
    const transformedCodes = codes.map(code =>
      transformMultiLangFields(code, ['name', 'description'])
    );

    res.json({ codes: transformedCodes });
  } catch (error) {
    console.error('Get codes by type error:', error);
    res.status(500).json({ error: 'Failed to fetch codes by type' });
  }
});

/**
 * Create new code
 * POST /api/code
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if code already exists in the same codeType
    const existingCode = await codeService.getCodeByTypeAndCode(
      req.body.codeType,
      req.body.code
    );

    if (existingCode) {
      return res.status(400).json({
        error: 'Code already exists in this code type'
      });
    }

    // Extract multilingual fields from request body
    const name = req.body.name || {};
    const description = req.body.description || {};

    const codeData = {
      id: uuidv4(),
      codeType: req.body.codeType,
      code: req.body.code,
      nameEn: name.en || '',
      nameKo: name.ko || '',
      nameZh: name.zh || '',
      nameVi: name.vi || '',
      descriptionEn: description.en || '',
      descriptionKo: description.ko || '',
      descriptionZh: description.zh || '',
      descriptionVi: description.vi || '',
      order: req.body.order || 1,
      status: req.body.status || 'active',
      parentCode: req.body.parentCode || null,
      attributes: req.body.attributes || {}
    };

    const newCode = await codeService.createCode(codeData);

    // Transform multilingual fields
    const transformedCode = transformMultiLangFields(newCode, ['name', 'description']);

    res.status(201).json({ code: transformedCode });
  } catch (error) {
    console.error('Create code error:', error);
    res.status(500).json({ error: 'Failed to create code' });
  }
});

/**
 * Update code
 * PUT /api/code/:id
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const existingCode = await codeService.getCodeById(id);
    if (!existingCode) {
      return res.status(404).json({ error: 'Code not found' });
    }

    // Check if code already exists in the same codeType (excluding current code)
    if (req.body.codeType && req.body.code) {
      const duplicateCode = await codeService.getCodeByTypeAndCode(
        req.body.codeType,
        req.body.code
      );

      if (duplicateCode && duplicateCode.id !== id) {
        return res.status(400).json({
          error: 'Code already exists in this code type'
        });
      }
    }

    // Extract multilingual fields from request body
    const name = req.body.name || {};
    const description = req.body.description || {};

    const updates = {
      codeType: req.body.codeType,
      code: req.body.code,
      nameEn: name.en,
      nameKo: name.ko,
      nameZh: name.zh,
      nameVi: name.vi,
      descriptionEn: description.en,
      descriptionKo: description.ko,
      descriptionZh: description.zh,
      descriptionVi: description.vi,
      order: req.body.order,
      status: req.body.status,
      parentCode: req.body.parentCode,
      attributes: req.body.attributes || {}
    };

    const updatedCode = await codeService.updateCode(id, updates);

    // Transform multilingual fields
    const transformedCode = transformMultiLangFields(updatedCode, ['name', 'description']);

    res.json({ code: transformedCode });
  } catch (error) {
    console.error('Update code error:', error);
    res.status(500).json({ error: 'Failed to update code' });
  }
});

/**
 * Delete code
 * DELETE /api/code/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const existingCode = await codeService.getCodeById(id);
    if (!existingCode) {
      return res.status(404).json({ error: 'Code not found' });
    }

    await codeService.deleteCode(id);

    res.json({ message: 'Code deleted successfully' });
  } catch (error) {
    console.error('Delete code error:', error);
    res.status(500).json({ error: 'Failed to delete code' });
  }
});

/**
 * Bulk delete codes
 * DELETE /api/code
 */
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid ids array' });
    }

    let deletedCount = 0;
    for (const id of ids) {
      try {
        await codeService.deleteCode(id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete code ${id}:`, error);
      }
    }

    res.json({
      message: `Successfully deleted ${deletedCount} code(s)`
    });
  } catch (error) {
    console.error('Bulk delete codes error:', error);
    res.status(500).json({ error: 'Failed to delete codes' });
  }
});

module.exports = router;
