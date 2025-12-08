/**
 * API 응답 유틸리티
 */

import { Response } from 'express';
import { ApiResponse, PaginatedResponse, ApiError } from '../types';

/**
 * 성공 응답
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
}

/**
 * 생성 성공 응답 (201)
 */
export function sendCreated<T>(res: Response, data: T, message?: string): Response {
  return sendSuccess(res, data, message || 'Created successfully', 201);
}

/**
 * 삭제 성공 응답 (204 또는 200)
 */
export function sendDeleted(res: Response, message?: string): Response {
  return sendSuccess(res, null, message || 'Deleted successfully', 200);
}

/**
 * 페이지네이션 응답
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
): Response {
  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
  return res.status(200).json({
    success: true,
    ...response,
  });
}

/**
 * 에러 응답
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): Response {
  const error: ApiError = {
    code: code || `ERR_${statusCode}`,
    message,
    details,
  };

  const response: ApiResponse = {
    success: false,
    error: message,
  };

  return res.status(statusCode).json(response);
}

/**
 * 400 Bad Request
 */
export function sendBadRequest(res: Response, message: string = 'Bad request'): Response {
  return sendError(res, message, 400, 'BAD_REQUEST');
}

/**
 * 401 Unauthorized
 */
export function sendUnauthorized(res: Response, message: string = 'Unauthorized'): Response {
  return sendError(res, message, 401, 'UNAUTHORIZED');
}

/**
 * 403 Forbidden
 */
export function sendForbidden(res: Response, message: string = 'Forbidden'): Response {
  return sendError(res, message, 403, 'FORBIDDEN');
}

/**
 * 404 Not Found
 */
export function sendNotFound(res: Response, message: string = 'Resource not found'): Response {
  return sendError(res, message, 404, 'NOT_FOUND');
}

/**
 * 409 Conflict
 */
export function sendConflict(res: Response, message: string = 'Resource already exists'): Response {
  return sendError(res, message, 409, 'CONFLICT');
}

/**
 * 422 Unprocessable Entity (Validation Error)
 */
export function sendValidationError(res: Response, errors: any): Response {
  return sendError(res, 'Validation failed', 422, 'VALIDATION_ERROR', errors);
}

/**
 * 500 Internal Server Error
 */
export function sendServerError(
  res: Response,
  message: string = 'Internal server error'
): Response {
  return sendError(res, message, 500, 'INTERNAL_ERROR');
}
