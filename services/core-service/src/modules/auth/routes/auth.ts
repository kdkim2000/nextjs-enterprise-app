/**
 * Auth Routes - Core Service
 */

import { Router, Request, Response, NextFunction } from 'express';
import { getLogger } from '@enterprise/shared';
import {
  login,
  verifyMFA,
  resendMFA,
  refreshAccessToken,
  logout,
  register,
  validateToken,
  getCurrentUser,
} from '../services/authService';
import { authenticateToken } from '../../../middleware/authMiddleware';
import {
  loginLimiter,
  mfaLimiter,
  registerLimiter,
  authLimiter,
} from '../../../middleware/rateLimiter';

const router = Router();
const logger = getLogger('core-service:auth:routes');

/**
 * POST /auth/login
 * User login
 */
router.post('/login', loginLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
      return;
    }

    const result = await login(username, password);

    if (result.requireMFA) {
      res.json({
        success: true,
        requireMFA: true,
        mfaToken: result.mfaToken,
        message: 'MFA code sent to your email',
      });
      return;
    }

    logger.info(`User logged in: ${username}`);

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  } catch (error: any) {
    logger.warn(`Login failed: ${error.message}`);
    res.status(401).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
});

/**
 * POST /auth/verify-mfa
 * Verify MFA code
 */
router.post('/verify-mfa', mfaLimiter, async (req: Request, res: Response) => {
  try {
    const { mfaToken, code } = req.body;

    if (!mfaToken || !code) {
      res.status(400).json({
        success: false,
        message: 'MFA token and code are required',
      });
      return;
    }

    const result = await verifyMFA(mfaToken, code);

    logger.info('MFA verification successful');

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  } catch (error: any) {
    logger.warn(`MFA verification failed: ${error.message}`);
    res.status(401).json({
      success: false,
      message: error.message || 'MFA verification failed',
    });
  }
});

/**
 * POST /auth/resend-mfa
 * Resend MFA code
 */
router.post('/resend-mfa', mfaLimiter, async (req: Request, res: Response) => {
  try {
    const { mfaToken } = req.body;

    if (!mfaToken) {
      res.status(400).json({
        success: false,
        message: 'MFA token is required',
      });
      return;
    }

    const result = await resendMFA(mfaToken);

    res.json({
      success: true,
      message: 'MFA code resent',
      ...(result.devCode && { devCode: result.devCode }),
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to resend MFA code',
    });
  }
});

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post('/refresh', authLimiter, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    const result = await refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error: any) {
    logger.warn(`Token refresh failed: ${error.message}`);
    res.status(401).json({
      success: false,
      message: error.message || 'Token refresh failed',
      code: 'REFRESH_FAILED',
    });
  }
});

/**
 * POST /auth/logout
 * User logout
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : '';
    const { refreshToken } = req.body;

    if (accessToken) {
      await logout(accessToken, refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    // Even if logout fails, we return success to client
    res.json({
      success: true,
      message: 'Logged out',
    });
  }
});

/**
 * POST /auth/register
 * User registration
 */
router.post('/register', registerLimiter, async (req: Request, res: Response) => {
  try {
    const { username, password, name_ko, name_en, email, department, position } = req.body;

    // Validation
    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
      return;
    }

    const result = await register({
      username,
      password,
      name_ko,
      name_en,
      email,
      department,
      position,
    });

    logger.info(`New user registered: ${username}`);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Registration successful',
    });
  } catch (error: any) {
    logger.warn(`Registration failed: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
});

/**
 * POST /auth/validate
 * Validate token and get user info
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.body.token;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Token is required',
      });
      return;
    }

    const user = await validateToken(token);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Token validation failed',
    });
  }
});

/**
 * GET /auth/me
 * Get current user info
 */
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await getCurrentUser(req.user!.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user info',
    });
  }
});

/**
 * GET /auth/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'core-service',
    module: 'auth',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
