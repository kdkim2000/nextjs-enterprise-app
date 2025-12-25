/**
 * Item Routes - Checksheet Item Management
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '@enterprise/shared';
import * as itemService from '../services/itemService';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('inspection-service:items');

/**
 * GET /inspection/items
 * List items by template_id
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { template_id } = req.query;

    if (!template_id) {
      return res.status(400).json({ error: 'template_id query parameter is required' });
    }

    const items = await itemService.getItemsByTemplateId(template_id as string);
    res.json({ items });
  } catch (error) {
    logger.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

/**
 * GET /inspection/items/:id
 * Get item by ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await itemService.getItemById(id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    logger.error('Get item error:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

/**
 * POST /inspection/items
 * Create new item
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const itemData = req.body;

    // Validate required fields
    if (!itemData.template_id || !itemData.item_name || !itemData.item_type) {
      return res.status(400).json({ error: 'template_id, item_name, and item_type are required' });
    }

    // Validate item type
    const validTypes = ['checkbox', 'text', 'number', 'select', 'photo', 'signature', 'date', 'time'];
    if (!validTypes.includes(itemData.item_type)) {
      return res.status(400).json({ error: `Invalid item_type. Must be one of: ${validTypes.join(', ')}` });
    }

    const item = await itemService.createItem(itemData);
    res.status(201).json({ item });
  } catch (error) {
    logger.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

/**
 * PUT /inspection/items/:id
 * Update item
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingItem = await itemService.getItemById(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Validate item type if being updated
    if (updates.item_type) {
      const validTypes = ['checkbox', 'text', 'number', 'select', 'photo', 'signature', 'date', 'time'];
      if (!validTypes.includes(updates.item_type)) {
        return res.status(400).json({ error: `Invalid item_type. Must be one of: ${validTypes.join(', ')}` });
      }
    }

    const item = await itemService.updateItem(id, updates);
    res.json({ item });
  } catch (error) {
    logger.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

/**
 * DELETE /inspection/items/:id
 * Delete item
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingItem = await itemService.getItemById(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await itemService.deleteItem(id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    logger.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

/**
 * PUT /inspection/items/reorder
 * Reorder items within a template
 */
router.put('/reorder', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { template_id, items } = req.body;

    if (!template_id || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'template_id and items array are required' });
    }

    await itemService.reorderItems(template_id, items);
    res.json({ message: 'Items reordered successfully' });
  } catch (error) {
    logger.error('Reorder items error:', error);
    res.status(500).json({ error: 'Failed to reorder items' });
  }
});

/**
 * POST /inspection/items/bulk
 * Bulk create items for a template
 */
router.post('/bulk', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { template_id, items } = req.body;

    if (!template_id || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'template_id and items array are required' });
    }

    const createdItems = await itemService.bulkCreateItems(template_id, items);
    res.status(201).json(createdItems);
  } catch (error) {
    logger.error('Bulk create items error:', error);
    res.status(500).json({ error: 'Failed to create items' });
  }
});

export default router;
