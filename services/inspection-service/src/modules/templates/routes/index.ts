/**
 * Template Routes - Checksheet Template Management
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '@enterprise/shared';
import * as templateService from '../services/templateService';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('inspection-service:templates');

/**
 * GET /inspection/templates
 * List all templates with pagination and filtering
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      category,
      status,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const [templates, totalCount] = await Promise.all([
      templateService.getAllTemplates({
        limit: limitNum,
        offset,
        search: search as string,
        category: category as string,
        status: status as string,
      }),
      templateService.getTemplateCount({
        search: search as string,
        category: category as string,
        status: status as string,
      }),
    ]);

    res.json({
      templates,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    logger.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

/**
 * GET /inspection/templates/:id
 * Get template by ID with items
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const includeItems = req.query.includeItems === 'true';

    const template = await templateService.getTemplateById(id, includeItems);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    logger.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

/**
 * POST /inspection/templates
 * Create new template
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const templateData = {
      ...req.body,
      created_by: userId,
    };

    // Validate required fields
    if (!templateData.code || !templateData.name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }

    // Check for duplicate code
    const existingTemplate = await templateService.getTemplateByCode(templateData.code);
    if (existingTemplate) {
      return res.status(409).json({ error: 'Template code already exists' });
    }

    const template = await templateService.createTemplate(templateData);
    res.status(201).json(template);
  } catch (error) {
    logger.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

/**
 * PUT /inspection/templates/:id
 * Update template
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if template exists
    const existingTemplate = await templateService.getTemplateById(id);
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check for duplicate code if code is being updated
    if (updates.code && updates.code !== existingTemplate.code) {
      const duplicateTemplate = await templateService.getTemplateByCode(updates.code);
      if (duplicateTemplate) {
        return res.status(409).json({ error: 'Template code already exists' });
      }
    }

    const template = await templateService.updateTemplate(id, updates);
    res.json({ template });
  } catch (error) {
    logger.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

/**
 * DELETE /inspection/templates/:id
 * Delete template (soft delete by setting status to 'archived')
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hardDelete = req.query.hard === 'true';

    const existingTemplate = await templateService.getTemplateById(id);
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (hardDelete) {
      await templateService.deleteTemplate(id);
    } else {
      await templateService.archiveTemplate(id);
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    logger.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

/**
 * POST /inspection/templates/:id/clone
 * Clone template with items
 */
router.post('/:id/clone', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newCode, newName } = req.body;
    const userId = (req as any).user?.userId;

    const existingTemplate = await templateService.getTemplateById(id, true);
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Auto-generate code and name if not provided
    const timestamp = Date.now().toString(36).toUpperCase();
    const cloneCode = newCode || `${existingTemplate.code}_COPY_${timestamp}`;
    const cloneName = newName || `${existingTemplate.name} (Copy)`;

    const clonedTemplate = await templateService.cloneTemplate(id, cloneCode, cloneName, userId);
    res.status(201).json(clonedTemplate);
  } catch (error) {
    logger.error('Clone template error:', error);
    res.status(500).json({ error: 'Failed to clone template' });
  }
});

/**
 * GET /inspection/templates/:id/items
 * Get items for a template
 */
router.get('/:id/items', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const template = await templateService.getTemplateById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const items = await templateService.getTemplateItems(id);
    res.json(items);
  } catch (error) {
    logger.error('Get template items error:', error);
    res.status(500).json({ error: 'Failed to fetch template items' });
  }
});

export default router;
