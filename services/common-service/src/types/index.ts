/**
 * Common Service Types
 */

import { Request } from 'express';

// ==========================================
// Common Types
// ==========================================

export interface MultiLangField {
  en: string;
  ko: string;
  zh?: string;
  vi?: string;
}

export interface TokenPayload {
  userId: string;
  loginId: string;
  role: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==========================================
// Code Types
// ==========================================

export interface CodeType {
  id: string;
  code: string;
  name: MultiLangField;
  description: MultiLangField;
  createdAt: Date;
  updatedAt: Date;
}

export interface Code {
  id: string;
  codeType: string;
  code: string;
  name: MultiLangField;
  description: MultiLangField;
  order: number;
  status: 'active' | 'inactive';
  parentCode?: string;
  attributes?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeQueryOptions {
  codeType?: string;
  code?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// ==========================================
// Attachment Types
// ==========================================

export interface AttachmentType {
  id: string;
  code: string;
  name: MultiLangField;
  description: MultiLangField;
  storagePath: string;
  maxFileCount: number;
  maxFileSize: number;
  maxTotalSize: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  status: 'active' | 'inactive';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  attachmentTypeId: string;
  attachmentTypeCode?: string;
  referenceType?: string;
  referenceId?: string;
  title?: string;
  description?: string;
  fileCount: number;
  totalSize: number;
  status: 'active' | 'deleted';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  files?: AttachmentFile[];
}

export interface AttachmentFile {
  id: string;
  attachmentId: string;
  originalFilename: string;
  storedFilename: string;
  fileExtension: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  fullPath?: string;
  checksum?: string;
  isImage: boolean;
  imageWidth?: number;
  imageHeight?: number;
  thumbnailPath?: string;
  downloadCount: number;
  order: number;
  status: 'active' | 'deleted';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// Log Types
// ==========================================

export interface Log {
  id: string;
  timestamp: Date;
  method: string;
  path: string;
  url?: string;
  originalUrl?: string;
  statusCode: number;
  duration: string;
  userId?: string;
  userName?: string;
  programId?: string;
  ip?: string;
  userAgent?: string;
}

export interface LogQueryOptions {
  userId?: string;
  path?: string;
  method?: string;
  programId?: string;
  statusCode?: number;
  minStatusCode?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface LogAnalytics {
  period: string;
  totalRequests: number;
  avgDuration: number;
  uniqueUsers: number;
  errorCount: number;
}

// ==========================================
// App Settings Types
// ==========================================

export interface AppSetting {
  key: string;
  value: string;
  parsedValue?: any;
  valueType: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  isReady: boolean;
  isApplied: boolean;
  description: MultiLangField;
  displayOrder: number;
  isSensitive: boolean;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}

export interface AppSettingQueryOptions {
  category?: string;
  isReady?: boolean;
  isApplied?: boolean;
  search?: string;
}

// ==========================================
// Dashboard Types
// ==========================================

export interface DashboardSummary {
  users: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    growth: number;
  };
  posts: {
    total: number;
    today: number;
    thisWeek: number;
  };
  comments: {
    total: number;
    today: number;
  };
  views: {
    total: number;
    postsViewedToday: number;
  };
  errors: {
    rate: number;
    count: number;
  };
}

export interface ActivityTrend {
  date: string;
  posts: number;
  comments: number;
  views: number;
}

export interface UserStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface DepartmentStats {
  id: string;
  name: string;
  count: number;
}

export interface BoardActivity {
  id: string;
  name: string;
  postCount: number;
  totalViews: number;
}

export interface SystemPerformance {
  hour: string;
  requests: number;
  avgResponseTime: number;
  errors: number;
}

export interface HttpStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface TopPost {
  id: string;
  title: string;
  views: number;
  likes: number;
  author: string;
  board: string;
  createdAt: Date;
}

export interface ErrorEndpoint {
  endpoint: string;
  errorCount: number;
  lastError: string;
  statusCode: number;
}

export interface RecentActivity {
  type: 'post' | 'comment' | 'error';
  id: string | null;
  action: string;
  target: string;
  user: string;
  meta?: string;
  timestamp: Date;
}

export interface LoginStats {
  date: string;
  success: number;
  failed: number;
}

export interface MenuUsage {
  programId: string;
  name: string;
  accessCount: number;
  uniqueUsers: number;
}
