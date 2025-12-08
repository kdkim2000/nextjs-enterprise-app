/**
 * API 공통 타입 정의
 */

import { Request } from 'express';
import { JwtPayload } from './auth';

/**
 * 인증된 요청 (JWT 페이로드 포함)
 */
export interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user?: JwtPayload & { type?: string };
}

/**
 * API 응답 표준 포맷
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * 페이지네이션 요청 파라미터
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 페이지네이션 응답
 */
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
 * 검색 파라미터
 */
export interface SearchParams extends PaginationParams {
  search?: string;
  filters?: Record<string, any>;
}

/**
 * API 에러 응답
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

/**
 * 벌크 작업 결과
 */
export interface BulkOperationResult {
  success: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}
