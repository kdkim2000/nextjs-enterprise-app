const express = require('express');
const router = express.Router();
const helpService = require('../services/helpService');

// GET /api/help - Get help content(s)
router.get('/', async (req, res) => {
  try {
    const { programId, language, page = 1, limit = 50, includeAll } = req.query;

    // If programId is provided, return single help content
    if (programId) {
      // For single help query, only return published content unless includeAll is true (for admin)
      const includeUnpublished = includeAll === 'true';

      const help = await helpService.getHelpByProgram(
        programId,
        language || 'en',
        includeUnpublished
      );

      return res.json({ help });
    }

    // Otherwise, return list of helps with filtering
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const { search, status } = req.query;

    const helps = await helpService.getAllHelp({
      search,
      language,
      status,
      limit: limitNum,
      offset
    });

    const totalCount = await helpService.getHelpCount({ search, language, status });

    res.json({
      helps,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
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
    // Generate unique ID if not provided
    const id = req.body.id || `help-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const helpData = {
      id,
      programId: req.body.programId,
      language: req.body.language,
      title: req.body.title,
      content: req.body.content,
      sections: req.body.sections,
      faq: req.body.faqs,
      tips: req.body.tips,
      troubleshooting: req.body.troubleshooting,
      videoUrl: req.body.videoUrl,
      relatedTopics: req.body.relatedLinks,
      status: req.body.status || 'draft',
      createdBy: req.user?.id || req.body.createdBy
    };

    const newHelp = await helpService.createHelp(helpData);

    res.json({ help: newHelp });
  } catch (error) {
    console.error('Create help error:', error);
    res.status(500).json({ error: 'Failed to create help content' });
  }
});

// PUT /api/help - Update help content
router.put('/', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Help ID is required' });
    }

    const existingHelp = await helpService.getHelpById(id);
    if (!existingHelp) {
      return res.status(404).json({ error: 'Help content not found' });
    }

    const updates = {
      programId: req.body.programId,
      language: req.body.language,
      title: req.body.title,
      content: req.body.content,
      sections: req.body.sections,
      faq: req.body.faqs,
      tips: req.body.tips,
      troubleshooting: req.body.troubleshooting,
      videoUrl: req.body.videoUrl,
      relatedTopics: req.body.relatedLinks,
      status: req.body.status,
      updatedBy: req.user?.id || req.body.updatedBy
    };

    const updatedHelp = await helpService.updateHelp(id, updates);

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

    if (!id) {
      return res.status(400).json({ error: 'Help ID is required' });
    }

    const existingHelp = await helpService.getHelpById(id);
    if (!existingHelp) {
      return res.status(404).json({ error: 'Help content not found' });
    }

    await helpService.deleteHelp(id);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete help error:', error);
    res.status(500).json({ error: 'Failed to delete help content' });
  }
});

module.exports = router;
