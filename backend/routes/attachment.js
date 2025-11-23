/* eslint-disable no-console */
const express = require('express');
const router = express.Router();
const attachmentService = require('../services/attachmentService');
const postService = require('../services/postService');
const { authenticateToken } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/fileUpload');
const path = require('path');
const fs = require('fs').promises;

/**
 * POST /api/attachment - Upload files
 */
router.post('/', authenticateToken, ...uploadMultiple('files', 5), async (req, res) => {
  try {
    const { postId } = req.body;

    if (!postId) {
      // Clean up uploaded files
      if (req.files) {
        for (const file of req.files) {
          await fs.unlink(file.path).catch(() => {});
        }
      }
      return res.status(400).json({ error: 'Missing required field: postId' });
    }

    // Verify post exists
    const post = await postService.getPostById(postId);
    if (!post) {
      // Clean up uploaded files
      if (req.files) {
        for (const file of req.files) {
          await fs.unlink(file.path).catch(() => {});
        }
      }
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create attachment records
    const attachments = [];

    for (const file of req.files) {
      // Get relative path
      const relativePath = file.path.replace(/\\/g, '/').split('public/')[1] || file.path;

      const attachmentData = {
        postId,
        originalFilename: file.originalname,
        storedFilename: file.filename,
        filePath: `/${relativePath}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileExtension: path.extname(file.originalname).toLowerCase(),
        uploadedBy: req.user.userId
      };

      // For images, could add width/height/thumbnail here
      // For now, just create the basic attachment

      const attachment = await attachmentService.createAttachment(attachmentData);
      attachments.push(attachment);
    }

    res.status(201).json({ attachments });
  } catch (error) {
    console.error('Error uploading files:', error);

    // Clean up uploaded files on error
    if (req.files) {
      for (const file of req.files) {
        await fs.unlink(file.path).catch(() => {});
      }
    }

    res.status(500).json({ error: 'Failed to upload files' });
  }
});

/**
 * GET /api/attachment/post/:postId - Get attachments for a post
 */
router.get('/post/:postId', authenticateToken, async (req, res) => {
  try {
    const attachments = await attachmentService.getAttachmentsByPostId(req.params.postId);
    res.json({ attachments });
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
});

/**
 * GET /api/attachment/:id - Get attachment by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const attachment = await attachmentService.getAttachmentById(req.params.id);

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    res.json({ attachment });
  } catch (error) {
    console.error('Error fetching attachment:', error);
    res.status(500).json({ error: 'Failed to fetch attachment' });
  }
});

/**
 * GET /api/attachment/:id/download - Download attachment
 */
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const attachment = await attachmentService.getAttachmentById(req.params.id);

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Check if user has access to the post
    const post = await postService.getPostById(attachment.post_id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // If it's a secret post, check access
    if (post.is_secret) {
      if (req.user.role !== 'admin' && post.author_id !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied to secret post' });
      }
    }

    // Increment download count
    await attachmentService.incrementDownloadCount(req.params.id);

    // Send file
    const filePath = path.join(process.cwd(), 'public', attachment.file_path);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(filePath, attachment.original_filename);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({ error: 'Failed to download attachment' });
  }
});

/**
 * DELETE /api/attachment/:id - Delete attachment
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const attachment = await attachmentService.getAttachmentById(req.params.id);

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Check if user has permission to delete
    const post = await postService.getPostById(attachment.post_id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only admin or post author can delete attachments
    if (req.user.role !== 'admin' && post.author_id !== req.user.userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this attachment' });
    }

    // Delete attachment (will also delete physical file)
    await attachmentService.deleteAttachment(req.params.id, true);

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

module.exports = router;
