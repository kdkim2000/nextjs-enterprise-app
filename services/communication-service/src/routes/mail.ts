/**
 * Mail Routes
 * Multi-recipient Support Mail API
 */

import { Router, Request, Response } from 'express';
import * as mailService from '../services/mailService';
import { authenticateToken } from '../middleware';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('communication-service:routes:mail');

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /mail/messages - Get messages by folder
 */
router.get('/messages', async (req: Request, res: Response): Promise<void> => {
  try {
    const { folder = 'inbox', page, limit, search } = req.query;
    const result = await mailService.getMessages(
      req.user!.userId,
      folder as string,
      {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 50,
        search: search as string
      }
    );
    res.json(result);
  } catch (error: any) {
    logger.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

/**
 * GET /mail/messages/:id - Get single message
 */
router.get('/messages/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { folder } = req.query;
    const message = await mailService.getMessage(
      req.params.id,
      req.user!.userId,
      folder as string
    );
    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    res.json({ data: message });
  } catch (error: any) {
    logger.error('Get message error:', error);
    res.status(500).json({ error: 'Failed to get message' });
  }
});

/**
 * POST /mail/draft - Create draft
 */
router.post('/draft', async (req: Request, res: Response): Promise<void> => {
  try {
    const draft = await mailService.createDraft(req.user!.userId, req.body);
    res.status(201).json({ data: draft });
  } catch (error: any) {
    logger.error('Create draft error:', error);
    res.status(500).json({ error: 'Failed to create draft' });
  }
});

/**
 * PUT /mail/draft/:id - Update draft
 */
router.put('/draft/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const draft = await mailService.updateDraft(
      req.params.id,
      req.user!.userId,
      req.body
    );
    if (!draft) {
      res.status(404).json({ error: 'Draft not found' });
      return;
    }
    res.json({ data: draft });
  } catch (error: any) {
    logger.error('Update draft error:', error);
    res.status(500).json({ error: 'Failed to update draft' });
  }
});

/**
 * DELETE /mail/draft/:id - Delete draft permanently
 */
router.delete('/draft/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await mailService.deleteDraft(req.params.id, req.user!.userId);
    if (!deleted) {
      res.status(404).json({ error: 'Draft not found' });
      return;
    }
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Delete draft error:', error);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
});

/**
 * POST /mail/send - Send message
 */
router.post('/send', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await mailService.sendMessage(req.user!.userId, req.body);
    res.json({ data: result });
  } catch (error: any) {
    logger.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * PUT /mail/messages/:id/trash - Move to trash
 */
router.put('/messages/:id/trash', async (req: Request, res: Response): Promise<void> => {
  try {
    const message = await mailService.moveToTrash(req.params.id, req.user!.userId);
    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    res.json({ data: message });
  } catch (error: any) {
    logger.error('Move to trash error:', error);
    res.status(500).json({ error: 'Failed to move to trash' });
  }
});

/**
 * PUT /mail/messages/:id/restore - Restore from trash
 */
router.put('/messages/:id/restore', async (req: Request, res: Response): Promise<void> => {
  try {
    const message = await mailService.restoreFromTrash(req.params.id, req.user!.userId);
    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    res.json({ data: message });
  } catch (error: any) {
    logger.error('Restore error:', error);
    res.status(500).json({ error: 'Failed to restore' });
  }
});

/**
 * DELETE /mail/messages/:id - Delete permanently
 */
router.delete('/messages/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await mailService.deletePermanently(req.params.id, req.user!.userId);
    if (!deleted) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

/**
 * PUT /mail/messages/:id/read - Mark as read/unread
 */
router.put('/messages/:id/read', async (req: Request, res: Response): Promise<void> => {
  try {
    const message = await mailService.markAsRead(
      req.params.id,
      req.user!.userId,
      req.body.isRead !== false
    );
    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    res.json({ data: message });
  } catch (error: any) {
    logger.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to update' });
  }
});

/**
 * GET /mail/counts - Get folder counts
 */
router.get('/counts', async (req: Request, res: Response): Promise<void> => {
  try {
    const counts = await mailService.getFolderCounts(req.user!.userId);
    res.json({ data: counts });
  } catch (error: any) {
    logger.error('Get counts error:', error);
    res.status(500).json({ error: 'Failed to get counts' });
  }
});

/**
 * POST /mail/bulk - Bulk action
 */
router.post('/bulk', async (req: Request, res: Response): Promise<void> => {
  try {
    const { messageIds, action } = req.body;
    if (!messageIds || !action) {
      res.status(400).json({ error: 'messageIds and action required' });
      return;
    }
    await mailService.bulkAction(req.user!.userId, messageIds, action);
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Bulk action error:', error);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
});

export default router;
