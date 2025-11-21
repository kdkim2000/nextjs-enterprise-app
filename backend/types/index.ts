/**
 * Type Definitions
 *
 * Central type definitions for the backend application
 */

import { Request, Response, NextFunction } from 'express';

/**
 * User Types
 */
export interface User {
  id: string;
  loginid: string;
  email: string;
  name_ko?: string;
  name_en?: string;
  employee_number?: string;
  phone_number?: string;
  mobile_number?: string;
  user_category: 'admin' | 'regular' | 'guest' | 'system';
  position?: string;
  department?: string;
  status: 'active' | 'inactive' | 'locked';
  mfa_enabled: boolean;
  mfa_secret?: string;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateInput {
  loginid: string;
  email: string;
  password: string;
  name_ko?: string;
  name_en?: string;
  employee_number?: string;
  phone_number?: string;
  mobile_number?: string;
  user_category?: 'admin' | 'regular' | 'guest' | 'system';
  position?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'locked';
  mfa_enabled?: boolean;
}

export interface UserUpdateInput {
  loginid?: string;
  email?: string;
  password?: string;
  name_ko?: string;
  name_en?: string;
  employee_number?: string;
  phone_number?: string;
  mobile_number?: string;
  user_category?: 'admin' | 'regular' | 'guest' | 'system';
  position?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'locked';
  mfa_enabled?: boolean;
}

/**
 * JWT Payload Types
 */
export interface JWTPayload {
  id: string;
  loginid: string;
  email: string;
  user_category: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  id: string;
  loginid: string;
  iat?: number;
  exp?: number;
}

/**
 * Authentication Types
 */
export interface LoginInput {
  loginid: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'mfa_secret'>;
  token: string;
  refreshToken: string;
  mfaRequired?: boolean;
}

export interface MFAVerifyInput {
  code: string;
  tempToken: string;
}

/**
 * Role Types
 */
export interface Role {
  id: string;
  code: string;
  name_en: string;
  name_ko?: string;
  name_zh?: string;
  name_vi?: string;
  description_en?: string;
  description_ko?: string;
  description_zh?: string;
  description_vi?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

/**
 * Menu Types
 */
export interface Menu {
  id: string;
  code: string;
  name_en: string;
  name_ko?: string;
  name_zh?: string;
  name_vi?: string;
  parent_id?: string;
  path?: string;
  icon?: string;
  order_num: number;
  level: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

/**
 * Department Types
 */
export interface Department {
  id: string;
  code: string;
  name_en: string;
  name_ko?: string;
  name_zh?: string;
  name_vi?: string;
  parent_id?: string;
  manager_id?: string;
  level: number;
  order_num: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

/**
 * Log Types
 */
export interface Log {
  id: string;
  user_id?: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  method?: string;
  url?: string;
  status_code?: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface LogCreateInput {
  user_id?: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  method?: string;
  url?: string;
  status_code?: number;
  metadata?: Record<string, any>;
}

/**
 * Pagination Types
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API Response Types
 */
export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    timestamp: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Express Request Extensions
 */
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
  validatedFilename?: string;
  uploadDir?: string;
}

/**
 * Middleware Types
 */
export type AsyncRequestHandler = (
  req: Request | AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export type ErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

/**
 * Database Query Result Types
 */
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

/**
 * File Upload Types
 */
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

/**
 * Search and Filter Types
 */
export interface SearchParams {
  search?: string;
  status?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Multi-language Field Types
 */
export interface MultiLangName {
  name_en: string;
  name_ko?: string;
  name_zh?: string;
  name_vi?: string;
}

export interface MultiLangDescription {
  description_en?: string;
  description_ko?: string;
  description_zh?: string;
  description_vi?: string;
}

/**
 * Environment Variables Types
 */
export interface EnvironmentVariables {
  // Server
  NODE_ENV: 'development' | 'production' | 'test';
  BACKEND_PORT: string;

  // Database
  DB_HOST: string;
  DB_PORT: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_POOL_MAX?: string;
  DB_POOL_MIN?: string;
  DB_STATEMENT_TIMEOUT?: string;
  DB_QUERY_TIMEOUT?: string;

  // JWT
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRY?: string;
  JWT_REFRESH_EXPIRY?: string;

  // Email
  EMAIL_HOST: string;
  EMAIL_PORT: string;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_FROM?: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS?: string;
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_AUTH_WINDOW_MS?: string;
  RATE_LIMIT_AUTH_MAX?: string;
  RATE_LIMIT_MFA_WINDOW_MS?: string;
  RATE_LIMIT_MFA_MAX?: string;
  RATE_LIMIT_UPLOAD_WINDOW_MS?: string;
  RATE_LIMIT_UPLOAD_MAX?: string;
  RATE_LIMIT_MODIFY_WINDOW_MS?: string;
  RATE_LIMIT_MODIFY_MAX?: string;

  // File Upload
  VIRUS_SCAN_ENABLED?: string;
  CLAMAV_HOST?: string;
  CLAMAV_PORT?: string;

  // CORS
  ALLOWED_ORIGINS?: string;
}

/**
 * Service Response Types
 */
export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Permission Types
 */
export interface Permission {
  id: string;
  resource: string;
  action: 'view' | 'create' | 'update' | 'delete';
  role_id: string;
}

/**
 * Utility Types
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string | number;

/**
 * Export all types
 */
export * from './express';
