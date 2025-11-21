/**
 * Standardized Error Codes
 *
 * Format: [CATEGORY]_[NUMBER]
 * Categories:
 * - AUTH: Authentication & Authorization
 * - VALID: Validation Errors
 * - RES: Resource Errors (Not Found, Conflict, etc.)
 * - DB: Database Errors
 * - FILE: File Upload/Download Errors
 * - RATE: Rate Limiting Errors
 * - SYS: System Errors
 */

const ErrorCodes = {
  // Authentication & Authorization (AUTH_xxx)
  AUTH_TOKEN_MISSING: 'AUTH_001',
  AUTH_TOKEN_INVALID: 'AUTH_002',
  AUTH_TOKEN_EXPIRED: 'AUTH_003',
  AUTH_TOKEN_REVOKED: 'AUTH_004',
  AUTH_INVALID_CREDENTIALS: 'AUTH_005',
  AUTH_MFA_REQUIRED: 'AUTH_006',
  AUTH_MFA_INVALID: 'AUTH_007',
  AUTH_MFA_EXPIRED: 'AUTH_008',
  AUTH_PERMISSION_DENIED: 'AUTH_009',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_010',
  AUTH_ACCOUNT_LOCKED: 'AUTH_011',
  AUTH_ACCOUNT_INACTIVE: 'AUTH_012',

  // Validation Errors (VALID_xxx)
  VALID_INVALID_INPUT: 'VALID_001',
  VALID_MISSING_FIELD: 'VALID_002',
  VALID_INVALID_FORMAT: 'VALID_003',
  VALID_INVALID_EMAIL: 'VALID_004',
  VALID_INVALID_PASSWORD: 'VALID_005',
  VALID_PASSWORD_TOO_SHORT: 'VALID_006',
  VALID_INVALID_PHONE: 'VALID_007',
  VALID_INVALID_DATE: 'VALID_008',
  VALID_INVALID_RANGE: 'VALID_009',
  VALID_INVALID_ENUM: 'VALID_010',

  // Resource Errors (RES_xxx)
  RES_NOT_FOUND: 'RES_001',
  RES_ALREADY_EXISTS: 'RES_002',
  RES_CONFLICT: 'RES_003',
  RES_GONE: 'RES_004',
  RES_USER_NOT_FOUND: 'RES_101',
  RES_ROLE_NOT_FOUND: 'RES_102',
  RES_MENU_NOT_FOUND: 'RES_103',
  RES_PROGRAM_NOT_FOUND: 'RES_104',
  RES_DEPARTMENT_NOT_FOUND: 'RES_105',
  RES_CODE_NOT_FOUND: 'RES_106',

  // Database Errors (DB_xxx)
  DB_CONNECTION_FAILED: 'DB_001',
  DB_QUERY_FAILED: 'DB_002',
  DB_TRANSACTION_FAILED: 'DB_003',
  DB_CONSTRAINT_VIOLATION: 'DB_004',
  DB_DUPLICATE_KEY: 'DB_005',
  DB_FOREIGN_KEY_VIOLATION: 'DB_006',
  DB_TIMEOUT: 'DB_007',

  // File Errors (FILE_xxx)
  FILE_REQUIRED: 'FILE_001',
  FILE_UPLOAD_FAILED: 'FILE_002',
  FILE_TOO_LARGE: 'FILE_003',
  FILE_INVALID_TYPE: 'FILE_004',
  FILE_INVALID_NAME: 'FILE_005',
  FILE_INVALID_CONTENT: 'FILE_006',
  FILE_VIRUS_DETECTED: 'FILE_007',
  FILE_NOT_FOUND: 'FILE_008',
  FILE_DOWNLOAD_FAILED: 'FILE_009',
  FILE_DELETE_FAILED: 'FILE_010',

  // Rate Limiting Errors (RATE_xxx)
  RATE_LIMIT_EXCEEDED: 'RATE_001',
  RATE_LOGIN_LIMIT_EXCEEDED: 'RATE_002',
  RATE_MFA_LIMIT_EXCEEDED: 'RATE_003',
  RATE_UPLOAD_LIMIT_EXCEEDED: 'RATE_004',

  // System Errors (SYS_xxx)
  SYS_INTERNAL_ERROR: 'SYS_001',
  SYS_SERVICE_UNAVAILABLE: 'SYS_002',
  SYS_MAINTENANCE: 'SYS_003',
  SYS_CONFIGURATION_ERROR: 'SYS_004',
};

/**
 * Get HTTP status code from error code
 * @param {string} errorCode - Error code
 * @returns {number} HTTP status code
 */
function getHttpStatusFromCode(errorCode) {
  const category = errorCode.split('_')[0];

  const statusMap = {
    'AUTH': 401,
    'VALID': 400,
    'RES': 404,
    'DB': 500,
    'FILE': 400,
    'RATE': 429,
    'SYS': 500,
  };

  // Special cases
  if (errorCode === 'AUTH_PERMISSION_DENIED' || errorCode === 'AUTH_INSUFFICIENT_PERMISSIONS') {
    return 403;
  }
  if (errorCode === 'RES_ALREADY_EXISTS' || errorCode === 'RES_CONFLICT') {
    return 409;
  }
  if (errorCode === 'DB_DUPLICATE_KEY') {
    return 409;
  }

  return statusMap[category] || 500;
}

/**
 * Get user-friendly message from error code
 * @param {string} errorCode - Error code
 * @returns {string} User-friendly message
 */
function getMessageFromCode(errorCode) {
  const messages = {
    // Auth
    [ErrorCodes.AUTH_TOKEN_MISSING]: 'Access token is required',
    [ErrorCodes.AUTH_TOKEN_INVALID]: 'Invalid access token',
    [ErrorCodes.AUTH_TOKEN_EXPIRED]: 'Access token has expired',
    [ErrorCodes.AUTH_TOKEN_REVOKED]: 'Access token has been revoked',
    [ErrorCodes.AUTH_INVALID_CREDENTIALS]: 'Invalid username or password',
    [ErrorCodes.AUTH_MFA_REQUIRED]: 'Multi-factor authentication is required',
    [ErrorCodes.AUTH_MFA_INVALID]: 'Invalid MFA code',
    [ErrorCodes.AUTH_MFA_EXPIRED]: 'MFA code has expired',
    [ErrorCodes.AUTH_PERMISSION_DENIED]: 'Permission denied',
    [ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions to perform this action',
    [ErrorCodes.AUTH_ACCOUNT_LOCKED]: 'Account is locked due to multiple failed login attempts',
    [ErrorCodes.AUTH_ACCOUNT_INACTIVE]: 'Account is inactive',

    // Validation
    [ErrorCodes.VALID_INVALID_INPUT]: 'Invalid input data',
    [ErrorCodes.VALID_MISSING_FIELD]: 'Required field is missing',
    [ErrorCodes.VALID_INVALID_FORMAT]: 'Invalid data format',
    [ErrorCodes.VALID_INVALID_EMAIL]: 'Invalid email address',
    [ErrorCodes.VALID_INVALID_PASSWORD]: 'Invalid password format',
    [ErrorCodes.VALID_PASSWORD_TOO_SHORT]: 'Password is too short',

    // Resource
    [ErrorCodes.RES_NOT_FOUND]: 'Resource not found',
    [ErrorCodes.RES_ALREADY_EXISTS]: 'Resource already exists',
    [ErrorCodes.RES_CONFLICT]: 'Resource conflict',
    [ErrorCodes.RES_USER_NOT_FOUND]: 'User not found',
    [ErrorCodes.RES_ROLE_NOT_FOUND]: 'Role not found',
    [ErrorCodes.RES_MENU_NOT_FOUND]: 'Menu not found',
    [ErrorCodes.RES_PROGRAM_NOT_FOUND]: 'Program not found',
    [ErrorCodes.RES_DEPARTMENT_NOT_FOUND]: 'Department not found',

    // Database
    [ErrorCodes.DB_CONNECTION_FAILED]: 'Database connection failed',
    [ErrorCodes.DB_QUERY_FAILED]: 'Database query failed',
    [ErrorCodes.DB_TRANSACTION_FAILED]: 'Database transaction failed',
    [ErrorCodes.DB_CONSTRAINT_VIOLATION]: 'Database constraint violation',
    [ErrorCodes.DB_DUPLICATE_KEY]: 'Duplicate entry',
    [ErrorCodes.DB_FOREIGN_KEY_VIOLATION]: 'Related record not found',

    // File
    [ErrorCodes.FILE_REQUIRED]: 'File is required',
    [ErrorCodes.FILE_UPLOAD_FAILED]: 'File upload failed',
    [ErrorCodes.FILE_TOO_LARGE]: 'File is too large',
    [ErrorCodes.FILE_INVALID_TYPE]: 'Invalid file type',
    [ErrorCodes.FILE_INVALID_NAME]: 'Invalid filename',
    [ErrorCodes.FILE_INVALID_CONTENT]: 'Invalid file content',
    [ErrorCodes.FILE_VIRUS_DETECTED]: 'Virus detected in file',
    [ErrorCodes.FILE_NOT_FOUND]: 'File not found',
    [ErrorCodes.FILE_DOWNLOAD_FAILED]: 'File download failed',
    [ErrorCodes.FILE_DELETE_FAILED]: 'File deletion failed',

    // Rate Limiting
    [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please try again later',
    [ErrorCodes.RATE_LOGIN_LIMIT_EXCEEDED]: 'Too many login attempts. Please try again later',
    [ErrorCodes.RATE_MFA_LIMIT_EXCEEDED]: 'Too many MFA verification attempts',

    // System
    [ErrorCodes.SYS_INTERNAL_ERROR]: 'Internal server error',
    [ErrorCodes.SYS_SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
    [ErrorCodes.SYS_MAINTENANCE]: 'System is under maintenance',
  };

  return messages[errorCode] || 'An error occurred';
}

module.exports = {
  ErrorCodes,
  getHttpStatusFromCode,
  getMessageFromCode,
};
