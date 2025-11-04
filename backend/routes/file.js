const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken } = require('../middleware/auth');
const { ensureDir } = require('../utils/fileUtils');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    await ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Allowed file types (whitelist)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
];

const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.txt', '.csv'
];

/**
 * Validate filename to prevent path traversal attacks
 * @param {string} filename - The filename to validate
 * @returns {boolean} True if filename is safe
 */
function isValidFilename(filename) {
  // Check for null or empty
  if (!filename || typeof filename !== 'string') {
    return false;
  }

  // Check for path traversal patterns
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }

  // Check for hidden files
  if (filename.startsWith('.')) {
    return false;
  }

  // Check filename length
  if (filename.length > 255) {
    return false;
  }

  // Validate characters (alphanumeric, dash, underscore, dot only)
  const validPattern = /^[a-zA-Z0-9._-]+$/;
  if (!validPattern.test(filename)) {
    return false;
  }

  return true;
}

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }

    // Validate file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error(`File extension ${ext} is not allowed`), false);
    }

    cb(null, true);
  }
});

/**
 * Upload single file
 */
router.post('/upload', uploadLimiter, authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`,
        url: `http://localhost:3001/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

/**
 * Upload multiple files
 */
router.post('/upload-multiple', uploadLimiter, authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`,
      url: `http://localhost:3001/uploads/${file.filename}`
    }));

    res.json({
      message: 'Files uploaded successfully',
      files
    });
  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

/**
 * Download file
 */
router.get('/download/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;

    // Validate filename to prevent path traversal
    if (!isValidFilename(filename)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const uploadDir = path.join(__dirname, '../../public/uploads');
    const filePath = path.join(uploadDir, filename);

    // Ensure the resolved path is within the upload directory
    const normalizedPath = path.normalize(filePath);
    const normalizedUploadDir = path.normalize(uploadDir);

    if (!normalizedPath.startsWith(normalizedUploadDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ error: 'File download failed' });
  }
});

/**
 * Delete file
 */
router.delete('/delete/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;

    // Validate filename to prevent path traversal
    if (!isValidFilename(filename)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const uploadDir = path.join(__dirname, '../../public/uploads');
    const filePath = path.join(uploadDir, filename);

    // Ensure the resolved path is within the upload directory
    const normalizedPath = path.normalize(filePath);
    const normalizedUploadDir = path.normalize(uploadDir);

    if (!normalizedPath.startsWith(normalizedUploadDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'File not found' });
    }

    await fs.unlink(filePath);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({ error: 'File deletion failed' });
  }
});

/**
 * List uploaded files
 */
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../../public/uploads');

    try {
      await ensureDir(uploadDir);
      const files = await fs.readdir(uploadDir);

      const fileDetails = await Promise.all(
        files.map(async (filename) => {
          const filePath = path.join(uploadDir, filename);
          const stats = await fs.stat(filePath);

          return {
            filename,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            url: `http://localhost:3001/uploads/${filename}`
          };
        })
      );

      res.json({ files: fileDetails });
    } catch (error) {
      res.json({ files: [] });
    }
  } catch (error) {
    console.error('File list error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

module.exports = router;
