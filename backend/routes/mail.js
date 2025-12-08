/**
 * Mail Routes v2
 * Multi-recipient Support Mail API
 */
const express = require('express');
const router = express.Router();
const mailService = require('../services/mailService');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/mail/messages - Get messages by folder
router.get('/messages', async (req, res) => {
  try {
    const { folder = 'inbox', page, limit, search } = req.query;
    const result = await mailService.getMessages(req.user.userId, folder, { page: parseInt(page) || 1, limit: parseInt(limit) || 50, search });
    res.json(result);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// GET /api/mail/messages/:id - Get single message
router.get('/messages/:id', async (req, res) => {
  try {
    const { folder } = req.query;
    const message = await mailService.getMessage(req.params.id, req.user.userId, folder);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json({ data: message });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ error: 'Failed to get message' });
  }
});

// POST /api/mail/draft - Create draft
router.post('/draft', async (req, res) => {
  try {
    const draft = await mailService.createDraft(req.user.userId, req.body);
    res.status(201).json({ data: draft });
  } catch (error) {
    console.error('Create draft error:', error);
    res.status(500).json({ error: 'Failed to create draft' });
  }
});

// PUT /api/mail/draft/:id - Update draft
router.put('/draft/:id', async (req, res) => {
  try {
    const draft = await mailService.updateDraft(req.params.id, req.user.userId, req.body);
    if (!draft) return res.status(404).json({ error: 'Draft not found' });
    res.json({ data: draft });
  } catch (error) {
    console.error('Update draft error:', error);
    res.status(500).json({ error: 'Failed to update draft' });
  }
});

// DELETE /api/mail/draft/:id - Delete draft permanently
router.delete('/draft/:id', async (req, res) => {
  try {
    const deleted = await mailService.deleteDraft(req.params.id, req.user.userId);
    if (!deleted) return res.status(404).json({ error: 'Draft not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete draft error:', error);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
});

// POST /api/mail/send - Send message
router.post('/send', async (req, res) => {
  try {
    const result = await mailService.sendMessage(req.user.userId, req.body);
    res.json({ data: result });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// PUT /api/mail/messages/:id/trash - Move to trash
router.put('/messages/:id/trash', async (req, res) => {
  try {
    const message = await mailService.moveToTrash(req.params.id, req.user.userId);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json({ data: message });
  } catch (error) {
    console.error('Move to trash error:', error);
    res.status(500).json({ error: 'Failed to move to trash' });
  }
});

// PUT /api/mail/messages/:id/restore - Restore from trash
router.put('/messages/:id/restore', async (req, res) => {
  try {
    const message = await mailService.restoreFromTrash(req.params.id, req.user.userId);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json({ data: message });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ error: 'Failed to restore' });
  }
});

// DELETE /api/mail/messages/:id - Delete permanently
router.delete('/messages/:id', async (req, res) => {
  try {
    const deleted = await mailService.deletePermanently(req.params.id, req.user.userId);
    if (!deleted) return res.status(404).json({ error: 'Message not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// PUT /api/mail/messages/:id/read - Mark as read/unread
router.put('/messages/:id/read', async (req, res) => {
  try {
    const message = await mailService.markAsRead(req.params.id, req.user.userId, req.body.isRead !== false);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json({ data: message });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to update' });
  }
});

// GET /api/mail/counts - Get folder counts
router.get('/counts', async (req, res) => {
  try {
    const counts = await mailService.getFolderCounts(req.user.userId);
    res.json({ data: counts });
  } catch (error) {
    console.error('Get counts error:', error);
    res.status(500).json({ error: 'Failed to get counts' });
  }
});

// POST /api/mail/bulk - Bulk action
router.post('/bulk', async (req, res) => {
  try {
    const { messageIds, action } = req.body;
    if (!messageIds || !action) return res.status(400).json({ error: 'messageIds and action required' });
    await mailService.bulkAction(req.user.userId, messageIds, action);
    res.json({ success: true });
  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
});

module.exports = router;
