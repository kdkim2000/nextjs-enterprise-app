const express = require('express');
const router = express.Router();
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { readJSON, writeJSON } = require('../utils/fileUtils');

const MESSAGES_FILE = path.join(__dirname, '../data/messages.json');

// Get all messages
router.get('/', authenticateToken, async (req, res) => {
  try {
    const messages = await readJSON(MESSAGES_FILE);
    res.json({ messages });
  } catch (error) {
    console.error('Error reading messages:', error);
    res.status(500).json({ error: 'Failed to read messages' });
  }
});

// Get message by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await readJSON(MESSAGES_FILE);
    const message = messages.find(m => m.id === id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error reading message:', error);
    res.status(500).json({ error: 'Failed to read message' });
  }
});

// Get messages by category
router.get('/category/:category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;
    const messages = await readJSON(MESSAGES_FILE);
    const filteredMessages = messages.filter(m => m.category === category);
    res.json({ messages: filteredMessages });
  } catch (error) {
    console.error('Error reading messages by category:', error);
    res.status(500).json({ error: 'Failed to read messages' });
  }
});

// Get message by code
router.get('/code/:code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;
    const messages = await readJSON(MESSAGES_FILE);
    const message = messages.find(m => m.code === code);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error reading message by code:', error);
    res.status(500).json({ error: 'Failed to read message' });
  }
});

// Create new message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const messages = await readJSON(MESSAGES_FILE);

    // Check if code already exists
    const existingMessage = messages.find(m => m.code === req.body.code);
    if (existingMessage) {
      return res.status(400).json({ error: 'Message code already exists' });
    }

    // Generate new ID
    const maxId = messages.reduce((max, m) => {
      const num = parseInt(m.id.split('-')[1]);
      return num > max ? num : max;
    }, 0);
    const newId = `msg-${String(maxId + 1).padStart(3, '0')}`;

    const newMessage = {
      id: newId,
      code: req.body.code,
      category: req.body.category,
      type: req.body.type,
      message: req.body.message,
      description: req.body.description,
      status: req.body.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    messages.push(newMessage);
    await writeJSON(MESSAGES_FILE, messages);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Update message
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await readJSON(MESSAGES_FILE);
    const index = messages.findIndex(m => m.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if code is being changed and already exists
    if (req.body.code !== messages[index].code) {
      const existingMessage = messages.find(m => m.code === req.body.code);
      if (existingMessage) {
        return res.status(400).json({ error: 'Message code already exists' });
      }
    }

    messages[index] = {
      ...messages[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await writeJSON(MESSAGES_FILE, messages);
    res.json(messages[index]);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Delete message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await readJSON(MESSAGES_FILE);
    const filteredMessages = messages.filter(m => m.id !== id);

    if (filteredMessages.length === messages.length) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await writeJSON(MESSAGES_FILE, filteredMessages);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
