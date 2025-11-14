const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { readJSON, writeJSON } = require('../utils/fileUtils');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const router = express.Router();

const CODES_FILE = path.join(__dirname, '../data/codes.json');

/**
 * Get all codes or filter by codeType
 * GET /api/code?codeType=USER_STATUS&page=1&limit=50
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { codeType, code, status, page = 1, limit = 50 } = req.query;

    let codes = await readJSON(CODES_FILE);

    // Apply filters
    if (codeType) {
      codes = codes.filter(c =>
        c.codeType.toLowerCase().includes(codeType.toLowerCase())
      );
    }
    if (code) {
      codes = codes.filter(c =>
        c.code.toLowerCase().includes(code.toLowerCase())
      );
    }
    if (status) {
      codes = codes.filter(c => c.status === status);
    }

    // Sort by codeType, then by order
    codes.sort((a, b) => {
      if (a.codeType !== b.codeType) {
        return a.codeType.localeCompare(b.codeType);
      }
      return a.order - b.order;
    });

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedCodes = codes.slice(startIndex, endIndex);

    res.json({
      codes: paginatedCodes,
      pagination: {
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
        totalCount: codes.length,
        totalPages: Math.ceil(codes.length / parseInt(limit))
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
    const codes = await readJSON(CODES_FILE);
    const code = codes.find(c => c.id === id);

    if (!code) {
      return res.status(404).json({ error: 'Code not found' });
    }

    res.json({ code });
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
    const codes = await readJSON(CODES_FILE);
    const codeTypes = [...new Set(codes.map(c => c.codeType))].sort();

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
    const codes = await readJSON(CODES_FILE);

    const filteredCodes = codes
      .filter(c => c.codeType === codeType)
      .sort((a, b) => a.order - b.order);

    res.json({ codes: filteredCodes });
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
    const codes = await readJSON(CODES_FILE);

    // Check if code already exists in the same codeType
    const exists = codes.some(c =>
      c.codeType === req.body.codeType && c.code === req.body.code
    );

    if (exists) {
      return res.status(400).json({
        error: 'Code already exists in this code type'
      });
    }

    const newCode = {
      id: uuidv4(),
      codeType: req.body.codeType,
      code: req.body.code,
      name: req.body.name,
      description: req.body.description || { en: '', ko: '' },
      order: req.body.order || 1,
      status: req.body.status || 'active',
      parentCode: req.body.parentCode || null,
      attributes: req.body.attributes || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    codes.push(newCode);
    await writeJSON(CODES_FILE, codes);

    res.status(201).json({ code: newCode });
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
    const codes = await readJSON(CODES_FILE);
    const index = codes.findIndex(c => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Code not found' });
    }

    // Check if code already exists in the same codeType (excluding current code)
    const exists = codes.some(c =>
      c.id !== id &&
      c.codeType === req.body.codeType &&
      c.code === req.body.code
    );

    if (exists) {
      return res.status(400).json({
        error: 'Code already exists in this code type'
      });
    }

    const updatedCode = {
      ...codes[index],
      codeType: req.body.codeType,
      code: req.body.code,
      name: req.body.name,
      description: req.body.description,
      order: req.body.order,
      status: req.body.status,
      parentCode: req.body.parentCode,
      attributes: req.body.attributes || {},
      updatedAt: new Date().toISOString()
    };

    codes[index] = updatedCode;
    await writeJSON(CODES_FILE, codes);

    res.json({ code: updatedCode });
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
    const codes = await readJSON(CODES_FILE);
    const filteredCodes = codes.filter(c => c.id !== id);

    if (codes.length === filteredCodes.length) {
      return res.status(404).json({ error: 'Code not found' });
    }

    await writeJSON(CODES_FILE, filteredCodes);
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

    const codes = await readJSON(CODES_FILE);
    const filteredCodes = codes.filter(c => !ids.includes(c.id));

    await writeJSON(CODES_FILE, filteredCodes);

    res.json({
      message: `Successfully deleted ${codes.length - filteredCodes.length} code(s)`
    });
  } catch (error) {
    console.error('Bulk delete codes error:', error);
    res.status(500).json({ error: 'Failed to delete codes' });
  }
});

module.exports = router;
