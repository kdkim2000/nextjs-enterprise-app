export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FileUploadResponse {
  message: string;
  file: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
    url: string;
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  duration: string;
  userId: string;
  ip: string;
  userAgent: string;
  requestBody?: any;
  responsePreview?: any;
}

export type Language = 'en' | 'ko';
export type Theme = 'light' | 'dark';
