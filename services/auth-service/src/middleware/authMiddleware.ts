/**
 * Auth Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { getLogger } from '@enterprise/shared';
import { verifyAccessToken } from '../utils/jwt';
import { isBlacklisted } from '../utils/redis';
import { TokenPayload } from '../types';

const logger = getLogger('auth-service:middleware');

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
    // Get token from header or query
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : (req.query.token as string);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    // Check if token is blacklisted
    const blacklisted = await isBlacklisted(token);
    if (blacklisted) {
      res.status(401).json({
        success: false,
        message: 'Token has been revoked',
      });
      return;
    }

    // Verify token
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
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : (req.query.token as string);

    if (token) {
      const blacklisted = await isBlacklisted(token);
      if (!blacklisted) {
        const payload = verifyAccessToken(token);
        req.user = payload;
      }
    }
  } catch {
    // Ignore errors, proceed without user
  }

  next();
};

/**
 * Require specific role
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

/**
 * Require admin role
 */
export const requireAdmin = requireRole('admin');
