/**
 * Log Types
 */

export interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  duration: string;
  userId: string;
  programId: string;
  ip: string;
  userAgent: string;
  requestBody?: any;
  responsePreview?: any;
}

export interface LogPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetLogsResponse {
  logs: LogEntry[];
  pagination: LogPagination;
}

export interface LogAnalyticsSummary {
  totalRequests: number;
  errorRate: string;
  avgResponseTime: string;
  slowRequestCount: number;
}

export interface LogAnalyticsResponse {
  summary: LogAnalyticsSummary;
  methodStats: Record<string, number>;
  statusStats: Record<string, number>;
  topEndpoints: Array<{ endpoint: string; count: number }>;
  topUsers: Array<{ userId: string; count: number }>;
  timeSeriesData: Array<{
    hour: string;
    count: number;
    errors: number;
  }>;
  recentErrors: LogEntry[];
}
