/**
 * Help Routes
 */

import { Router, Request, Response } from 'express';
import { getLogger, authenticateToken } from '@enterprise/shared';
import * as helpService from '../services/helpService';

const router = Router();
const logger = getLogger('app-service:content:help-routes');

/**
 * GET /content/help - Get help content(s)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { programId, language, page = '1', limit = '50', includeAll } = req.query;

    // If programId is provided, return single help content
    if (programId) {
      // For single help query, only return published content unless includeAll is true (for admin)
      const includeUnpublished = includeAll === 'true';

      const help = await helpService.getHelpByProgram(
        programId as string,
        (language as string) || 'en',
        includeUnpublished
      );

      return res.json({ help });
    }

    // Otherwise, return list of helps with filtering
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const { search, status } = req.query;

    const helps = await helpService.getAllHelp({
      search: search as string,
      language: language as string,
      status: status as string,
      limit: limitNum,
      offset
    });

    const totalCount = await helpService.getHelpCount({
      search: search as string,
      language: language as string,
      status: status as string
    });

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
    logger.error('Get help error:', error);
    res.status(500).json({ error: 'Failed to fetch help content' });
  }
});

/**
 * GET /content/help/:id - Get help by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const help = await helpService.getHelpById(req.params.id);

    if (!help) {
      return res.status(404).json({ error: 'Help content not found' });
    }

    res.json({ help });
  } catch (error) {
    logger.error('Get help by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch help content' });
  }
});

/**
 * POST /content/help - Create new help content
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
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
      createdBy: req.user?.userId || req.body.createdBy
    };

    const newHelp = await helpService.createHelp(helpData);

    res.json({ help: newHelp });
  } catch (error) {
    logger.error('Create help error:', error);
    res.status(500).json({ error: 'Failed to create help content' });
  }
});

/**
 * PUT /content/help - Update help content (using body.id)
 */
router.put('/', authenticateToken, async (req: Request, res: Response) => {
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
      updatedBy: req.user?.userId || req.body.updatedBy
    };

    const updatedHelp = await helpService.updateHelp(id, updates);

    res.json({ help: updatedHelp });
  } catch (error) {
    logger.error('Update help error:', error);
    res.status(500).json({ error: 'Failed to update help content' });
  }
});

/**
 * PUT /content/help/:id - Update help content by ID
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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
      updatedBy: req.user?.userId || req.body.updatedBy
    };

    const updatedHelp = await helpService.updateHelp(id, updates);

    res.json({ help: updatedHelp });
  } catch (error) {
    logger.error('Update help error:', error);
    res.status(500).json({ error: 'Failed to update help content' });
  }
});

/**
 * DELETE /content/help - Delete help content (using query.id)
 */
router.delete('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Help ID is required' });
    }

    const existingHelp = await helpService.getHelpById(id as string);
    if (!existingHelp) {
      return res.status(404).json({ error: 'Help content not found' });
    }

    await helpService.deleteHelp(id as string);

    res.json({ success: true });
  } catch (error) {
    logger.error('Delete help error:', error);
    res.status(500).json({ error: 'Failed to delete help content' });
  }
});

/**
 * DELETE /content/help/:id - Delete help content by ID
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingHelp = await helpService.getHelpById(id);
    if (!existingHelp) {
      return res.status(404).json({ error: 'Help content not found' });
    }

    await helpService.deleteHelp(id);

    res.json({ success: true });
  } catch (error) {
    logger.error('Delete help error:', error);
    res.status(500).json({ error: 'Failed to delete help content' });
  }
});

export default router;
