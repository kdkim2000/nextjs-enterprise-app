/**
 * Message Routes (System Messages)
 * CRUD API for System Messages
 */

import { Router, Request, Response } from 'express';
import * as messageService from '../services/messageService';
import { authenticateToken } from '../middleware';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('communication-service:routes:message');

/**
 * GET /messages - Get all messages
 */
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, type, status, limit, offset } = req.query;
    const messages = await messageService.getAllMessages({
      search: search as string,
      category: category as string,
      type: type as string,
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    });
    res.json({ messages });
  } catch (error: any) {
    logger.error('Error reading messages:', error);
    res.status(500).json({ error: 'Failed to read messages' });
  }
});

/**
 * GET /messages/category/:category - Get messages by category
 */
router.get('/category/:category', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const messages = await messageService.getMessagesByCategory(category);
    res.json({ messages });
  } catch (error: any) {
    logger.error('Error reading messages by category:', error);
    res.status(500).json({ error: 'Failed to read messages' });
  }
});

/**
 * GET /messages/code/:code - Get message by code
 */
router.get('/code/:code', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const message = await messageService.getMessageByCode(code);

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    res.json(message);
  } catch (error: any) {
    logger.error('Error reading message by code:', error);
    res.status(500).json({ error: 'Failed to read message' });
  }
});

/**
 * GET /messages/:id - Get message by ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const message = await messageService.getMessageById(id);

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    res.json(message);
  } catch (error: any) {
    logger.error('Error reading message:', error);
    res.status(500).json({ error: 'Failed to read message' });
  }
});

/**
 * POST /messages - Create new message
 */
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if code already exists
    const existingMessage = await messageService.getMessageByCode(req.body.code);
    if (existingMessage) {
      res.status(400).json({ error: 'Message code already exists' });
      return;
    }

    const messageData = {
      code: req.body.code,
      category: req.body.category,
      type: req.body.type,
      message: req.body.message,
      description: req.body.description,
      status: req.body.status || 'active'
    };

    const newMessage = await messageService.createMessage(messageData);

    res.status(201).json(newMessage);
  } catch (error: any) {
    logger.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

/**
 * PUT /messages/:id - Update message
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingMessage = await messageService.getMessageById(id);
    if (!existingMessage) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    // Check if code is being changed and already exists
    if (req.body.code && req.body.code !== existingMessage.code) {
      const codeExists = await messageService.getMessageByCode(req.body.code);
      if (codeExists) {
        res.status(400).json({ error: 'Message code already exists' });
        return;
      }
    }

    const updates = {
      code: req.body.code,
      category: req.body.category,
      type: req.body.type,
      message: req.body.message,
      description: req.body.description,
      status: req.body.status
    };

    const updatedMessage = await messageService.updateMessage(id, updates);

    res.json(updatedMessage);
  } catch (error: any) {
    logger.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

/**
 * DELETE /messages/:id - Delete message
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingMessage = await messageService.getMessageById(id);
    if (!existingMessage) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    await messageService.deleteMessage(id);

    res.json({ message: 'Message deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
