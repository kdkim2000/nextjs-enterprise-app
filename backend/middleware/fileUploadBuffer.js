/**
 * Buffer-based File Upload Middleware
 *
 * Uses memory storage for flexibility in file processing
 * Allows the attachment service to handle storage based on attachment type
 */

const multer = require('multer');
const path = require('path');
const {
  validateFilename,
} = require('../utils/fileValidation');
const { ValidationError } = require('../utils/ApiError');
const { ErrorCodes } = require('../constants/errorCodes');

/**
 * Default allowed MIME types (can be overridden by attachment type)
 */
const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
];

/**
 * Default allowed file extensions
 */
const DEFAULT_ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.csv',
  '.zip', '.rar', '.7z',
];

/**
 * Configure multer with memory storage
 */
const storage = multer.memoryStorage();

/**
 * Multer file filter (basic validation)
 */
const fileFilter = (req, file, cb) => {
  // Validate original filename for path traversal
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

  // Basic MIME type check (attachment type will do detailed validation)
  if (!DEFAULT_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new ValidationError(
        ErrorCodes.FILE_INVALID_TYPE,
        `File type ${file.mimetype} is not allowed`
      ),
      false
    );
  }

  // Basic extension check
  const ext = path.extname(file.originalname).toLowerCase();
  if (!DEFAULT_ALLOWED_EXTENSIONS.includes(ext)) {
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
 * Create multer upload instance with memory storage
 */
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max (attachment type will validate specific limits)
    files: 20, // Max 20 files in one request
  },
  fileFilter,
});

/**
 * Middleware: Upload single file to memory buffer
 */
function uploadSingleBuffer(fieldName = 'file') {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      try {
        if (!req.file) {
          throw new ValidationError(
            ErrorCodes.FILE_REQUIRED,
            'No file uploaded'
          );
        }
        next();
      } catch (error) {
        next(error);
      }
    },
  ];
}

/**
 * Middleware: Upload multiple files to memory buffers
 */
function uploadMultipleBuffer(fieldName = 'files', maxCount = 10) {
  return [
    upload.array(fieldName, maxCount),
    async (req, res, next) => {
      try {
        // Files are optional for this middleware (validation happens in service)
        if (req.files && req.files.length === 0) {
          req.files = null;
        }
        next();
      } catch (error) {
        next(error);
      }
    },
  ];
}

/**
 * Middleware: Upload files with flexible field names
 */
function uploadFieldsBuffer(fields) {
  return [
    upload.fields(fields),
    async (req, res, next) => {
      try {
        next();
      } catch (error) {
        next(error);
      }
    },
  ];
}

module.exports = {
  uploadSingleBuffer,
  uploadMultipleBuffer,
  uploadFieldsBuffer,
  DEFAULT_ALLOWED_MIME_TYPES,
  DEFAULT_ALLOWED_EXTENSIONS,
};
