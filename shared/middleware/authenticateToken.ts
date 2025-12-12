/**
 * Token Authentication Middleware
 * 서비스에서 사용하는 JWT 인증 미들웨어
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../auth/jwt';
import { TokenPayload } from '../types/token';
import { getLogger } from './logger';

// Express Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// 서비스 이름 (로거용)
let serviceName = 'shared';

/**
 * 서비스 이름 설정 (로거용)
 */
export function setMiddlewareServiceName(name: string): void {
  serviceName = name;
}

/**
 * JWT 토큰 인증 미들웨어
 * Authorization 헤더 또는 query parameter에서 토큰 검증
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const logger = getLogger(`${serviceName}:middleware`);

  try {
    // 헤더 또는 쿼리에서 토큰 추출
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader) || (req.query.token as string);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    // 토큰 검증
    const payload = verifyAccessToken(token);
    req.user = payload;

    next();
  } catch (error: any) {
    logger.warn('Token verification failed:', error.message);

    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
}

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 검증하고, 없어도 요청 진행
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader) || (req.query.token as string);

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        req.user = payload;
      } catch {
        // 토큰 검증 실패해도 진행
      }
    }
  } catch {
    // 에러 무시
  }

  next();
}

/**
 * 역할 기반 권한 검증 미들웨어
 * @param roles 허용된 역할 목록
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}

/**
 * Admin 전용 미들웨어
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
    return;
  }

  next();
}

export default {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  setMiddlewareServiceName,
};
