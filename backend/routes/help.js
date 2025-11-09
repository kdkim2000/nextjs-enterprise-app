const express = require('express');
const router = express.Router();
const path = require('path');
const { readJSON, writeJSON } = require('../utils/fileUtils');

const HELP_FILE = path.join(__dirname, '../data/help.json');

// GET /api/help - Get help content(s)
router.get('/', async (req, res) => {
  try {
    const { programId, language, page = 1, limit = 50 } = req.query;

    let helps = await readJSON(HELP_FILE);

    // If programId is provided, return single help content
    if (programId) {
      const help = helps.find(h => h.programId === programId && h.language === (language || 'en'));
      return res.json({ help: help || null });
    }

    // Otherwise, return list of helps with filtering
    let filteredHelps = helps;

    // Apply filters
    if (language) {
      filteredHelps = filteredHelps.filter(h => h.language === language);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedHelps = filteredHelps.slice(startIndex, endIndex);

    res.json({
      helps: paginatedHelps,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredHelps.length,
        totalPages: Math.ceil(filteredHelps.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Get help error:', error);
    res.status(500).json({ error: 'Failed to fetch help content' });
  }
});

// POST /api/help - Create new help content
router.post('/', async (req, res) => {
  try {
    const helps = await readJSON(HELP_FILE);

    const newHelp = {
      id: `help-${Date.now()}`,
      ...req.body,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    helps.push(newHelp);
    await writeJSON(HELP_FILE, helps);

    res.json({ help: newHelp });
  } catch (error) {
    console.error('Create help error:', error);
    res.status(500).json({ error: 'Failed to create help content' });
  }
});

// PUT /api/help - Update help content
router.put('/', async (req, res) => {
  try {
    const helps = await readJSON(HELP_FILE);
    const { id } = req.body;

    const index = helps.findIndex(h => h.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Help content not found' });
    }

    const updatedHelp = {
      ...helps[index],
      ...req.body,
      version: (helps[index].version || 1) + 1,
      updatedAt: new Date().toISOString()
    };

    helps[index] = updatedHelp;
    await writeJSON(HELP_FILE, helps);

    res.json({ help: updatedHelp });
  } catch (error) {
    console.error('Update help error:', error);
    res.status(500).json({ error: 'Failed to update help content' });
  }
});

// DELETE /api/help - Delete help content
router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    const helps = await readJSON(HELP_FILE);

    const filteredHelps = helps.filter(h => h.id !== id);

    if (filteredHelps.length === helps.length) {
      return res.status(404).json({ error: 'Help content not found' });
    }

    await writeJSON(HELP_FILE, filteredHelps);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete help error:', error);
    res.status(500).json({ error: 'Failed to delete help content' });
  }
});

module.exports = router;
