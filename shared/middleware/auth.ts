/**
 * 인증 미들웨어
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, JwtPayload } from '../types';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { sendUnauthorized, sendForbidden } from '../utils/response';

/**
 * JWT 인증 미들웨어
 * Authorization 헤더에서 토큰을 검증하고 req.user에 페이로드를 추가
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      sendUnauthorized(res, 'No token provided');
      return;
    }

    const result = verifyToken(token);

    if (!result.valid) {
      sendUnauthorized(res, result.error || 'Invalid token');
      return;
    }

    // req.user에 JWT 페이로드 추가
    req.user = {
      userId: result.user!.id,
      loginid: result.user!.loginid,
      role: result.user!.role,
    };

    next();
  } catch (error) {
    sendUnauthorized(res, 'Authentication failed');
  }
}

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 검증하고, 없어도 요청을 계속 진행
 */
export function optionalAuthenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const result = verifyToken(token);
      if (result.valid && result.user) {
        req.user = {
          userId: result.user.id,
          loginid: result.user.loginid,
          role: result.user.role,
        };
      }
    }

    next();
  } catch {
    // 토큰 검증 실패해도 계속 진행
    next();
  }
}

/**
 * 역할 기반 권한 검증 미들웨어
 * @param allowedRoles 허용된 역할 목록
 */
export function authorize(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendForbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
}

/**
 * Admin 전용 미들웨어
 */
export function adminOnly(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }

  if (req.user.role !== 'admin') {
    sendForbidden(res, 'Admin access required');
    return;
  }

  next();
}

/**
 * 자기 자신 또는 Admin만 접근 가능한 미들웨어
 * URL 파라미터의 userId와 현재 사용자 비교
 */
export function selfOrAdmin(userIdParam: string = 'id') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    const targetUserId = req.params[userIdParam];

    if (req.user.role === 'admin' || req.user.userId === targetUserId) {
      next();
      return;
    }

    sendForbidden(res, 'Access denied');
  };
}
