/**
 * Enhanced File Upload Security Middleware
 *
 * Features:
 * - Magic number validation (file signature check)
 * - MIME type and extension validation
 * - File size limits per type
 * - UUID-based filenames
 * - Path traversal prevention
 * - Dangerous file detection
 * - Optional virus scanning integration
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const {
  validateFileMagicNumber,
  validateFilename,
  generateSafeFilename,
  validateFileSize,
} = require('../utils/fileValidation');
const { ValidationError } = require('../utils/ApiError');
const { ErrorCodes } = require('../constants/errorCodes');

/**
 * Allowed MIME types whitelist
 */
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
  'text/csv',
];

/**
 * Allowed file extensions whitelist
 */
const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.txt', '.csv',
];

/**
 * Get upload directory path
 */
function getUploadDir() {
  return path.join(__dirname, '../../public/uploads');
}

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir() {
  const uploadDir = getUploadDir();
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

/**
 * Configure multer storage with UUID filenames
 */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadDir = await ensureUploadDir();
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    // Generate UUID-based filename
    const safeFilename = generateSafeFilename(file.originalname);
    cb(null, safeFilename);
  },
});

/**
 * Multer file filter
 * Validates MIME type and extension before saving
 */
const fileFilter = (req, file, cb) => {
  // Validate original filename
  const filenameValidation = validateFilename(file.originalname);
  if (!filenameValidation.valid) {
    return cb(
      new ValidationError(
        ErrorCodes.FILE_INVALID_NAME,
        filenameValidation.error
      ),
      false
    );
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new ValidationError(
        ErrorCodes.FILE_INVALID_TYPE,
        `File type ${file.mimetype} is not allowed`
      ),
      false
    );
  }

  // Validate file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new ValidationError(
        ErrorCodes.FILE_INVALID_TYPE,
        `File extension ${ext} is not allowed`
      ),
      false
    );
  }

  cb(null, true);
};

/**
 * Create multer upload instance
 */
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max (will be further validated per type)
    files: 10, // Max 10 files in one request
  },
  fileFilter,
});

/**
 * Validate file after upload
 * Checks magic numbers and performs additional security checks
 */
async function validateUploadedFile(file) {
  if (!file) {
    throw new ValidationError(
      ErrorCodes.FILE_REQUIRED,
      'No file uploaded'
    );
  }

  // Validate file size for the specific MIME type
  const sizeValidation = validateFileSize(file.size, file.mimetype);
  if (!sizeValidation.valid) {
    // Delete the uploaded file
    await fs.unlink(file.path).catch(() => {});
    throw new ValidationError(
      ErrorCodes.FILE_TOO_LARGE,
      sizeValidation.error
    );
  }

  // Validate file content using magic numbers
  const magicNumberValidation = await validateFileMagicNumber(
    file.path,
    file.mimetype,
    file.originalname
  );

  if (!magicNumberValidation.valid) {
    // Delete the uploaded file (it's malicious or corrupted)
    await fs.unlink(file.path).catch(() => {});
    throw new ValidationError(
      ErrorCodes.FILE_INVALID_CONTENT,
      magicNumberValidation.error
    );
  }

  return true;
}

/**
 * Middleware: Upload single file with validation
 */
function uploadSingle(fieldName = 'file') {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      try {
        await validateUploadedFile(req.file);
        next();
      } catch (error) {
        next(error);
      }
    },
  ];
}

/**
 * Middleware: Upload multiple files with validation
 */
function uploadMultiple(fieldName = 'files', maxCount = 10) {
  return [
    upload.array(fieldName, maxCount),
    async (req, res, next) => {
      try {
        if (!req.files || req.files.length === 0) {
          throw new ValidationError(
            ErrorCodes.FILE_REQUIRED,
            'No files uploaded'
          );
        }

        // Validate all uploaded files
        for (const file of req.files) {
          await validateUploadedFile(file);
        }

        next();
      } catch (error) {
        // Clean up all uploaded files on error
        if (req.files) {
          await Promise.all(
            req.files.map((file) =>
              fs.unlink(file.path).catch(() => {})
            )
          );
        }
        next(error);
      }
    },
  ];
}

/**
 * Middleware: Validate file download request
 * Prevents path traversal attacks
 */
function validateFileDownload(req, res, next) {
  try {
    const { filename } = req.params;

    const filenameValidation = validateFilename(filename);
    if (!filenameValidation.valid) {
      throw new ValidationError(
        ErrorCodes.FILE_INVALID_NAME,
        filenameValidation.error
      );
    }

    // Store validated info for downstream handlers
    req.validatedFilename = filename;
    req.uploadDir = getUploadDir();

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional: Virus scanning middleware
 * Requires ClamAV to be installed and running
 *
 * Installation:
 * - Windows: Download from clamav.net
 * - Linux: apt-get install clamav clamav-daemon
 * - Mac: brew install clamav
 *
 * Enable by setting VIRUS_SCAN_ENABLED=true in .env
 */
async function scanFileForVirus(filePath) {
  const NodeClam = require('clamscan');

  try {
    const clamscan = await new NodeClam().init({
      clamdscan: {
        host: process.env.CLAMAV_HOST || 'localhost',
        port: process.env.CLAMAV_PORT || 3310,
      },
    });

    const { isInfected, viruses } = await clamscan.isInfected(filePath);

    if (isInfected) {
      return {
        safe: false,
        viruses: viruses || [],
      };
    }

    return { safe: true };
  } catch (error) {
    // If ClamAV is not available, log warning but don't block upload
    console.warn('Virus scanning unavailable:', error.message);
    return { safe: true, warning: 'Virus scan not performed' };
  }
}

/**
 * Middleware: Optional virus scanning
 */
function virusScanMiddleware(req, res, next) {
  // Only run if virus scanning is enabled
  if (process.env.VIRUS_SCAN_ENABLED !== 'true') {
    return next();
  }

  const scanFile = async (file) => {
    const scanResult = await scanFileForVirus(file.path);

    if (!scanResult.safe) {
      // Delete infected file
      await fs.unlink(file.path).catch(() => {});

      throw new ValidationError(
        ErrorCodes.FILE_VIRUS_DETECTED,
        `Virus detected: ${scanResult.viruses.join(', ')}`
      );
    }
  };

  (async () => {
    try {
      if (req.file) {
        await scanFile(req.file);
      } else if (req.files) {
        for (const file of req.files) {
          await scanFile(file);
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  })();
}

/**
 * Clean up old uploaded files
 * Should be run periodically (e.g., daily cron job)
 */
async function cleanupOldFiles(maxAgeInDays = 30) {
  const uploadDir = getUploadDir();
  const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000;
  const now = Date.now();

  try {
    const files = await fs.readdir(uploadDir);

    for (const filename of files) {
      const filePath = path.join(uploadDir, filename);
      const stats = await fs.stat(filePath);

      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        console.log(`Cleaned up old file: ${filename}`);
      }
    }
  } catch (error) {
    console.error('File cleanup error:', error);
  }
}

module.exports = {
  uploadSingle,
  uploadMultiple,
  validateFileDownload,
  virusScanMiddleware,
  cleanupOldFiles,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};
