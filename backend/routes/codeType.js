const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { readJSON, writeJSON } = require('../utils/fileUtils');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const router = express.Router();

const CODE_TYPES_FILE = path.join(__dirname, '../data/codeTypes.json');

/**
 * Get all code types
 * GET /api/code-type
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, status } = req.query;
    let codeTypes = await readJSON(CODE_TYPES_FILE);

    // Apply filters
    if (category) {
      codeTypes = codeTypes.filter(ct =>
        ct.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    if (status) {
      codeTypes = codeTypes.filter(ct => ct.status === status);
    }

    // Sort by order
    codeTypes.sort((a, b) => a.order - b.order);

    res.json({ codeTypes });
  } catch (error) {
    console.error('Get code types error:', error);
    res.status(500).json({ error: 'Failed to fetch code types' });
  }
});

/**
 * Get code type by ID
 * GET /api/code-type/:id
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const codeTypes = await readJSON(CODE_TYPES_FILE);
    const codeType = codeTypes.find(ct => ct.id === id);

    if (!codeType) {
      return res.status(404).json({ error: 'Code type not found' });
    }

    res.json({ codeType });
  } catch (error) {
    console.error('Get code type error:', error);
    res.status(500).json({ error: 'Failed to fetch code type' });
  }
});

/**
 * Get code type by code
 * GET /api/code-type/by-code/:code
 */
router.get('/by-code/:code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;
    const codeTypes = await readJSON(CODE_TYPES_FILE);
    const codeType = codeTypes.find(ct => ct.code === code);

    if (!codeType) {
      return res.status(404).json({ error: 'Code type not found' });
    }

    res.json({ codeType });
  } catch (error) {
    console.error('Get code type by code error:', error);
    res.status(500).json({ error: 'Failed to fetch code type' });
  }
});

/**
 * Create new code type
 * POST /api/code-type
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const codeTypes = await readJSON(CODE_TYPES_FILE);

    // Check if code type already exists
    const exists = codeTypes.some(ct => ct.code === req.body.code);
    if (exists) {
      return res.status(400).json({ error: 'Code type already exists' });
    }

    const newCodeType = {
      id: uuidv4(),
      code: req.body.code,
      name: req.body.name,
      description: req.body.description || { en: '', ko: '' },
      order: req.body.order || 1,
      status: req.body.status || 'active',
      category: req.body.category || 'common',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    codeTypes.push(newCodeType);
    await writeJSON(CODE_TYPES_FILE, codeTypes);

    res.status(201).json({ codeType: newCodeType });
  } catch (error) {
    console.error('Create code type error:', error);
    res.status(500).json({ error: 'Failed to create code type' });
  }
});

/**
 * Update code type
 * PUT /api/code-type/:id
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const codeTypes = await readJSON(CODE_TYPES_FILE);
    const index = codeTypes.findIndex(ct => ct.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Code type not found' });
    }

    // Check if code type code already exists (excluding current)
    const exists = codeTypes.some(ct => ct.id !== id && ct.code === req.body.code);
    if (exists) {
      return res.status(400).json({ error: 'Code type code already exists' });
    }

    const updatedCodeType = {
      ...codeTypes[index],
      code: req.body.code,
      name: req.body.name,
      description: req.body.description,
      order: req.body.order,
      status: req.body.status,
      category: req.body.category,
      updatedAt: new Date().toISOString()
    };

    codeTypes[index] = updatedCodeType;
    await writeJSON(CODE_TYPES_FILE, codeTypes);

    res.json({ codeType: updatedCodeType });
  } catch (error) {
    console.error('Update code type error:', error);
    res.status(500).json({ error: 'Failed to update code type' });
  }
});

/**
 * Delete code type (cascade delete related codes)
 * DELETE /api/code-type/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const codeTypes = await readJSON(CODE_TYPES_FILE);

    const codeType = codeTypes.find(ct => ct.id === id);
    if (!codeType) {
      return res.status(404).json({ error: 'Code type not found' });
    }

    // Delete all related codes (cascade delete)
    const CODES_FILE = path.join(__dirname, '../data/codes.json');
    const codes = await readJSON(CODES_FILE);
    const relatedCodesCount = codes.filter(c => c.codeType === codeType.code).length;
    const filteredCodes = codes.filter(c => c.codeType !== codeType.code);
    await writeJSON(CODES_FILE, filteredCodes);

    // Delete the code type
    const filteredCodeTypes = codeTypes.filter(ct => ct.id !== id);
    await writeJSON(CODE_TYPES_FILE, filteredCodeTypes);

    res.json({
      message: 'Code type deleted successfully',
      deletedCodesCount: relatedCodesCount
    });
  } catch (error) {
    console.error('Delete code type error:', error);
    res.status(500).json({ error: 'Failed to delete code type' });
  }
});

module.exports = router;
