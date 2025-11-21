const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const {
  uploadSingle,
  uploadMultiple,
  validateFileDownload,
  virusScanMiddleware,
} = require('../middleware/fileUpload');
const { NotFoundError } = require('../utils/ApiError');
const { ErrorCodes } = require('../constants/errorCodes');

const router = express.Router();

/**
 * Upload single file
 * Enhanced with magic number validation and virus scanning
 */
router.post(
  '/upload',
  uploadLimiter,
  authenticateToken,
  ...uploadSingle('file'),
  virusScanMiddleware,
  async (req, res, next) => {
    try {
      res.success({
        message: 'File uploaded successfully',
        file: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: `/uploads/${req.file.filename}`,
          url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Upload multiple files
 * Enhanced with magic number validation and virus scanning
 */
router.post(
  '/upload-multiple',
  uploadLimiter,
  authenticateToken,
  ...uploadMultiple('files', 10),
  virusScanMiddleware,
  async (req, res, next) => {
    try {
      const files = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`,
        url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
      }));

      res.success({
        message: 'Files uploaded successfully',
        files,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Download file
 * Enhanced with path traversal protection
 */
router.get(
  '/download/:filename',
  authenticateToken,
  validateFileDownload,
  async (req, res, next) => {
    try {
      const { validatedFilename, uploadDir } = req;
      const filePath = path.join(uploadDir, validatedFilename);

      // Ensure the resolved path is within the upload directory
      const normalizedPath = path.normalize(filePath);
      const normalizedUploadDir = path.normalize(uploadDir);

      if (!normalizedPath.startsWith(normalizedUploadDir)) {
        throw new NotFoundError(ErrorCodes.FILE_NOT_FOUND);
      }

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        throw new NotFoundError(ErrorCodes.FILE_NOT_FOUND);
      }

      res.download(filePath);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Delete file
 * Enhanced with path traversal protection
 */
router.delete(
  '/delete/:filename',
  authenticateToken,
  validateFileDownload,
  async (req, res, next) => {
    try {
      const { validatedFilename, uploadDir } = req;
      const filePath = path.join(uploadDir, validatedFilename);

      // Ensure the resolved path is within the upload directory
      const normalizedPath = path.normalize(filePath);
      const normalizedUploadDir = path.normalize(uploadDir);

      if (!normalizedPath.startsWith(normalizedUploadDir)) {
        throw new NotFoundError(ErrorCodes.FILE_NOT_FOUND);
      }

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        throw new NotFoundError(ErrorCodes.FILE_NOT_FOUND);
      }

      await fs.unlink(filePath);

      res.success({ message: 'File deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * List uploaded files
 */
router.get('/list', authenticateToken, async (req, res, next) => {
  try {
    const uploadDir = path.join(__dirname, '../../public/uploads');

    // Ensure directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

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
          url: `${req.protocol}://${req.get('host')}/uploads/${filename}`,
        };
      })
    );

    res.success({ files: fileDetails });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
