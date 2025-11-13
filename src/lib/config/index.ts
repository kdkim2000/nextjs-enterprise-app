/**
 * Centralized Application Configuration
 * All environment-dependent URLs and settings should be managed here
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Base API URL for backend API calls
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',

  // Backend server URL for static file serving
  backendURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',

  // Timeout settings
  timeout: 30000, // 30 seconds
} as const;

/**
 * File Upload Configuration
 */
export const FILE_CONFIG = {
  // Maximum file size (10MB)
  maxFileSize: 10 * 1024 * 1024,

  // Allowed image MIME types
  allowedImageTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ],

  // Upload path (relative to backend server)
  uploadPath: '/uploads',
} as const;

/**
 * Get full URL for an avatar image
 * @param avatarUrl - The avatar URL path (e.g., /uploads/filename.jpg)
 * @returns Full URL to the avatar image
 */
export function getAvatarUrl(avatarUrl: string | undefined | null): string | undefined {
  if (!avatarUrl) return undefined;

  // If it's already a full URL, return as-is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  // Otherwise, prepend the backend URL
  return `${API_CONFIG.backendURL}${avatarUrl}`;
}

/**
 * Get full URL for any static file
 * @param filePath - The file path (e.g., /uploads/filename.pdf)
 * @returns Full URL to the file
 */
export function getFileUrl(filePath: string | undefined | null): string | undefined {
  if (!filePath) return undefined;

  // If it's already a full URL, return as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  // Otherwise, prepend the backend URL
  return `${API_CONFIG.backendURL}${filePath}`;
}

/**
 * Session Configuration
 */
export const SESSION_CONFIG = {
  // Session timeout in milliseconds
  timeout: parseInt(process.env.SESSION_TIMEOUT || '1800000'), // 30 minutes

  // Warning time before auto-logout
  warningTime: parseInt(process.env.SESSION_WARNING_TIME || '120000'), // 2 minutes
} as const;

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  // Application name
  name: 'Enterprise App',

  // Default language
  defaultLanguage: 'en' as const,

  // Available languages
  availableLanguages: ['en', 'ko'] as const,
} as const;
