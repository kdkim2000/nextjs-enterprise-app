/**
 * Auth Middleware for Admin Service
 */

import { Request, Response, NextFunction } from 'express';
import { getLogger } from '@enterprise/shared';
import { verifyAccessToken } from '../utils/jwt';
import { TokenPayload } from '../types';

const logger = getLogger('admin-service:middleware');

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authenticate JWT token
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    logger.info(`[Auth] Request to ${req.path}, Auth header exists: ${!!authHeader}`);

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : (req.query.token as string);

    if (!token) {
      logger.info(`[Auth] No token provided for ${req.path}`);
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    logger.info(`[Auth] Token received, length: ${token.length}`);
    const payload = verifyAccessToken(token);
    logger.info(`[Auth] Token verified for user: ${payload.userId}`);
    req.user = payload;

    next();
  } catch (error: any) {
    logger.warn(`[Auth] Token verification failed for ${req.path}:`, error.message);

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
};

/**
 * Require admin role
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
};

/**
 * Require specific roles
 */
export const requireRole = (...roles: string[]) => {
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
};
