/**
 * File Validation Utilities
 *
 * Validates file content using magic numbers (file signatures)
 * to prevent MIME type spoofing attacks
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * File magic numbers (signatures) for validation
 * First bytes of files that identify their true type
 */
const FILE_SIGNATURES = {
  // Images
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF, 0xE0],
    [0xFF, 0xD8, 0xFF, 0xE1],
    [0xFF, 0xD8, 0xFF, 0xE2],
    [0xFF, 0xD8, 0xFF, 0xE3],
    [0xFF, 0xD8, 0xFF, 0xE8],
  ],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF (WebP starts with RIFF)

  // Documents
  'application/pdf': [[0x25, 0x50, 0x44, 0x46, 0x2D]], // %PDF-
  'application/zip': [
    [0x50, 0x4B, 0x03, 0x04], // PK.. (ZIP, DOCX, XLSX)
    [0x50, 0x4B, 0x05, 0x06], // Empty ZIP
    [0x50, 0x4B, 0x07, 0x08], // Spanned ZIP
  ],

  // Text files (no magic number, will check differently)
  'text/plain': null,
  'text/csv': null,
};

/**
 * Office document extensions that use ZIP format
 */
const OFFICE_EXTENSIONS = ['.docx', '.xlsx', '.pptx'];

/**
 * Dangerous file extensions that should always be blocked
 */
const DANGEROUS_EXTENSIONS = [
  '.exe', '.dll', '.bat', '.cmd', '.sh', '.ps1',
  '.jar', '.app', '.deb', '.rpm', '.dmg',
  '.js', '.vbs', '.wsf', '.scr', '.pif',
  '.com', '.msi', '.hta', '.cpl', '.gadget'
];

/**
 * Dangerous filename patterns
 */
const DANGEROUS_PATTERNS = [
  /\.php$/i,
  /\.asp$/i,
  /\.aspx$/i,
  /\.jsp$/i,
  /\.cgi$/i,
  /\.pl$/i,
  /\.py$/i,
  /\.rb$/i,
  // Double extension tricks
  /\.(php|asp|aspx|jsp)\./i,
  // Null byte injection
  /\x00/,
  // Unicode tricks
  /\u202E/,
];

/**
 * Check if buffer starts with any of the given signatures
 */
function matchesSignature(buffer, signatures) {
  if (!signatures) return false;

  for (const signature of signatures) {
    let matches = true;
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        matches = false;
        break;
      }
    }
    if (matches) return true;
  }

  return false;
}

/**
 * Validate file using magic numbers
 *
 * @param {string} filePath - Path to the file
 * @param {string} declaredMimeType - MIME type from upload
 * @param {string} originalName - Original filename
 * @returns {Promise<Object>} Validation result { valid: boolean, error?: string, detectedType?: string }
 */
async function validateFileMagicNumber(filePath, declaredMimeType, originalName) {
  try {
    const ext = path.extname(originalName).toLowerCase();

    // Check for dangerous extensions
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: `Dangerous file extension: ${ext}`,
      };
    }

    // Check for dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(originalName)) {
        return {
          valid: false,
          error: 'Filename contains dangerous patterns',
        };
      }
    }

    // Read first 16 bytes for magic number check
    const fileHandle = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(16);
    await fileHandle.read(buffer, 0, 16, 0);
    await fileHandle.close();

    // For text files, perform basic validation
    if (declaredMimeType === 'text/plain' || declaredMimeType === 'text/csv') {
      // Check if file contains mostly printable characters
      const isText = await validateTextFile(filePath);
      if (!isText) {
        return {
          valid: false,
          error: 'File declared as text but contains binary data',
        };
      }
      return { valid: true };
    }

    // For Office documents (DOCX, XLSX), they use ZIP format
    if (OFFICE_EXTENSIONS.includes(ext)) {
      const zipSignatures = FILE_SIGNATURES['application/zip'];
      if (!matchesSignature(buffer, zipSignatures)) {
        return {
          valid: false,
          error: 'Office document does not have valid ZIP signature',
        };
      }
      return { valid: true };
    }

    // Check if the file signature matches the declared MIME type
    const expectedSignatures = FILE_SIGNATURES[declaredMimeType];

    if (!expectedSignatures) {
      // Unknown MIME type - reject for safety
      return {
        valid: false,
        error: `MIME type ${declaredMimeType} not in whitelist`,
      };
    }

    if (!matchesSignature(buffer, expectedSignatures)) {
      // Try to detect actual file type
      let detectedType = 'unknown';
      for (const [mimeType, signatures] of Object.entries(FILE_SIGNATURES)) {
        if (signatures && matchesSignature(buffer, signatures)) {
          detectedType = mimeType;
          break;
        }
      }

      return {
        valid: false,
        error: `File signature mismatch. Declared: ${declaredMimeType}, Detected: ${detectedType}`,
        detectedType,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `File validation error: ${error.message}`,
    };
  }
}

/**
 * Validate if file is actually a text file
 * Checks for binary content
 */
async function validateTextFile(filePath) {
  try {
    const fileHandle = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(1024); // Read first 1KB
    const { bytesRead } = await fileHandle.read(buffer, 0, 1024, 0);
    await fileHandle.close();

    // Check for null bytes (binary indicator)
    for (let i = 0; i < bytesRead; i++) {
      if (buffer[i] === 0) {
        return false;
      }

      // Check if character is printable or whitespace
      const char = buffer[i];
      const isPrintable = (char >= 32 && char <= 126) || // ASCII printable
                         char === 9 || // Tab
                         char === 10 || // LF
                         char === 13 || // CR
                         char >= 128; // Extended ASCII / UTF-8

      if (!isPrintable) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate filename
 * Prevents path traversal, hidden files, and dangerous names
 */
function validateFilename(filename) {
  // Check for null or empty
  if (!filename || typeof filename !== 'string') {
    return { valid: false, error: 'Filename is required' };
  }

  // Check for path traversal patterns
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return { valid: false, error: 'Path traversal detected in filename' };
  }

  // Check for hidden files
  if (filename.startsWith('.')) {
    return { valid: false, error: 'Hidden files not allowed' };
  }

  // Check filename length
  if (filename.length > 255) {
    return { valid: false, error: 'Filename too long (max 255 characters)' };
  }

  // Check for dangerous extensions
  const ext = path.extname(filename).toLowerCase();
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Dangerous file extension: ${ext}` };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(filename)) {
      return { valid: false, error: 'Filename contains dangerous patterns' };
    }
  }

  // Validate characters (alphanumeric, dash, underscore, dot, space only)
  // Allow international characters for better UX
  const validPattern = /^[\w\s.-]+$/;
  if (!validPattern.test(filename)) {
    return { valid: false, error: 'Filename contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Generate safe filename with UUID
 */
function generateSafeFilename(originalFilename) {
  const { v4: uuidv4 } = require('uuid');
  const ext = path.extname(originalFilename).toLowerCase();
  const uuid = uuidv4();

  // Return UUID with extension
  return `${uuid}${ext}`;
}

/**
 * Check if file size is within limits for its type
 */
function validateFileSize(size, mimeType) {
  // Size limits per file type (in bytes)
  const SIZE_LIMITS = {
    'image/jpeg': 5 * 1024 * 1024, // 5MB
    'image/png': 5 * 1024 * 1024,
    'image/gif': 2 * 1024 * 1024,
    'image/webp': 5 * 1024 * 1024,
    'application/pdf': 10 * 1024 * 1024, // 10MB
    'application/msword': 10 * 1024 * 1024,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 10 * 1024 * 1024,
    'application/vnd.ms-excel': 10 * 1024 * 1024,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 10 * 1024 * 1024,
    'text/plain': 1 * 1024 * 1024, // 1MB
    'text/csv': 5 * 1024 * 1024,
  };

  const limit = SIZE_LIMITS[mimeType] || 5 * 1024 * 1024; // Default 5MB

  if (size > limit) {
    return {
      valid: false,
      error: `File size ${(size / 1024 / 1024).toFixed(2)}MB exceeds limit ${(limit / 1024 / 1024).toFixed(2)}MB for ${mimeType}`,
    };
  }

  return { valid: true };
}

module.exports = {
  validateFileMagicNumber,
  validateFilename,
  validateTextFile,
  generateSafeFilename,
  validateFileSize,
  DANGEROUS_EXTENSIONS,
  DANGEROUS_PATTERNS,
};
