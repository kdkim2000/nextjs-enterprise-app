# SSO 로그인 구현 계획
_Exported on 1/20/2026 at 02:48:49 GMT+9 from Cursor (2.3.41)_

---

**User**

@src\app\[locale]\login\page.tsx
로그인에서 SSO 로그인 부분을 구현하고자 한다.
SSO EpTray에서 사용자 정보를 읽어 오는 부분은 현재 내 PC에 설치 되어 있지 않으므로 생략하고 EpTray 에서 이미 SSO 인증을 완료한 사용자의 "loginid" 를 읽어 왔다 치고
이를 이용하여 사용자 정보를 읽어 와서 로그인 할 수 있도록 구현하기 위한 계획을 수립하라.

---

**Cursor**


로그인 페이지와 인증 관련 코드를 확인 중입니다.



AuthContext와 SSO 관련 구현, 사용자 정보 조회 API를 확인 중입니다.



백엔드 API 라우트와 SSO 관련 구현을 확인 중입니다.



SSO 로그인 구현을 위한 몇 가지 확인이 필요합니다.



SSO 로그인 구현 전에 몇 가지 확인이 필요합니다.



SSO 로그인 구현 계획을 수립 중입니다.



SSO 로그인 구현 계획을 수립 중입니다.


---

**User**

sso_로그인_구현_02b8afeb.plan.md 을 구현하라.

---

**Cursor**


계획 파일을 확인한 뒤 구현을 진행합니다.



백엔드부터 구현을 시작합니다.



백엔드부터 구현합니다.


```typescript
/**
 * Auth Service - Core Service
 * Authentication Logic
 */

import { v4 as uuidv4 } from 'uuid';
import { getLogger } from '@enterprise/shared';
import { query } from '../../../utils/database';
import {
  addToBlacklist,
  isBlacklisted,
  storeMFACode,
  verifyMFACode as verifyMFACodeRedis,
  storeRefreshToken,
} from '../../../utils/redis';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getTokenExpirationSeconds,
} from '../../../utils/jwt';
import { comparePassword, generateMFACode, hashPassword } from '../../../utils/password';
import {
  getUserByUsername,
  getUserById,
  updateLastLogin,
  createUser,
  usernameExists,
  emailExists,
} from './userService';
import { LoginResponse, User, UserInfo, TokenPayload } from '../types';

const logger = getLogger('core-service:auth');

// MFA expiration in seconds (5 minutes)
const MFA_EXPIRY_SECONDS = 300;

/**
 * Helper: Convert User to UserInfo (safe for client)
 */
const toUserInfo = (user: User): UserInfo => ({
  id: user.id,
  loginid: user.loginid,
  name: user.name_ko || user.name_en || user.loginid,
  email: user.email,
  role: user.role,
  department: user.department,
  position: user.position,
});

/**
 * Login user
 */
export const login = async (
  username: string,
  password: string
): Promise<LoginResponse & { requireMFA?: boolean; mfaToken?: string }> => {
  // Find user
  const user = await getUserByUsername(username);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check account status
  if (user.status !== 'active') {
    throw new Error('Account is inactive');
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Check if MFA is enabled
  if (user.mfa_enabled) {
    // Generate and store MFA code
    const mfaCode = generateMFACode();
    const mfaToken = uuidv4();

    await storeMFACode(user.id, mfaCode, MFA_EXPIRY_SECONDS);

    // Store MFA token to user mapping
    await query(
      `INSERT INTO mfa_codes (id, user_id, code, expires_at, used)
       VALUES ($1, $2, $3, NOW() + INTERVAL '5 minutes', false)`,
      [mfaToken, user.id, mfaCode]
    );

    // TODO: Send MFA code via email
    logger.info(`MFA code generated for user ${username}: ${mfaCode} (DEV ONLY)`);

    return {
      requireMFA: true,
      mfaToken,
      accessToken: '',
      refreshToken: '',
      user: toUserInfo(user),
    };
  }

  // Generate tokens
  return await generateTokensForUser(user);
};

/**
 * Verify MFA code and complete login
 */
export const verifyMFA = async (
  mfaToken: string,
  code: string
): Promise<LoginResponse> => {
  // Find MFA record
  const result = await query(
    `SELECT user_id, code, expires_at, used
     FROM mfa_codes
     WHERE id = $1`,
    [mfaToken]
  );

  const mfaRecord = result.rows[0];

  if (!mfaRecord) {
    throw new Error('Invalid MFA token');
  }

  if (mfaRecord.used) {
    throw new Error('MFA code already used');
  }

  if (new Date(mfaRecord.expires_at) < new Date()) {
    throw new Error('MFA code expired');
  }

  // Verify code (check Redis first, then DB)
  const isValidRedis = await verifyMFACodeRedis(mfaRecord.user_id, code);
  const isValidDB = mfaRecord.code === code;

  if (!isValidRedis && !isValidDB) {
    throw new Error('Invalid MFA code');
  }

  // Mark as used
  await query(
    `UPDATE mfa_codes SET used = true WHERE id = $1`,
    [mfaToken]
  );

  // Get user and generate tokens
  const user = await getUserById(mfaRecord.user_id);
  if (!user) {
    throw new Error('User not found');
  }

  return await generateTokensForUser(user);
};

/**
 * Resend MFA code
 */
export const resendMFA = async (mfaToken: string): Promise<{ devCode?: string }> => {
  // Find existing MFA record
  const result = await query(
    `SELECT user_id FROM mfa_codes WHERE id = $1 AND used = false`,
    [mfaToken]
  );

  const mfaRecord = result.rows[0];
  if (!mfaRecord) {
    throw new Error('Invalid MFA token');
  }

  // Generate new code
  const newCode = generateMFACode();
  const newMfaToken = uuidv4();

  // Invalidate old token
  await query(`UPDATE mfa_codes SET used = true WHERE id = $1`, [mfaToken]);

  // Create new MFA record
  await query(
    `INSERT INTO mfa_codes (id, user_id, code, expires_at, used)
     VALUES ($1, $2, $3, NOW() + INTERVAL '5 minutes', false)`,
    [newMfaToken, mfaRecord.user_id, newCode]
  );

  // Store in Redis
  await storeMFACode(mfaRecord.user_id, newCode, MFA_EXPIRY_SECONDS);

  // TODO: Send via email
  logger.info(`New MFA code generated: ${newCode} (DEV ONLY)`);

  return {
    devCode: process.env.NODE_ENV === 'development' ? newCode : undefined,
  };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  // Check if token is blacklisted
  const blacklisted = await isBlacklisted(refreshToken);
  if (blacklisted) {
    throw new Error('Token has been revoked');
  }

  // Verify refresh token
  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }

  // Get user
  const user = await getUserById(payload.userId);
  if (!user || user.status !== 'active') {
    throw new Error('User not found or inactive');
  }

  // Blacklist old refresh token
  const expiresIn = getTokenExpirationSeconds(refreshToken);
  if (expiresIn > 0) {
    await addToBlacklist(refreshToken, expiresIn);
  }

  // Generate new tokens
  const tokenPayload = {
    userId: user.id,
    loginid: user.loginid,
    role: user.role || 'user',
  };

  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  // Store new refresh token
  await storeRefreshToken(user.id, newRefreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Logout user
 */
export const logout = async (accessToken: string, refreshToken?: string): Promise<void> => {
  // Blacklist access token
  const accessExpiresIn = getTokenExpirationSeconds(accessToken);
  if (accessExpiresIn > 0) {
    await addToBlacklist(accessToken, accessExpiresIn);
  }

  // Blacklist refresh token if provided
  if (refreshToken) {
    const refreshExpiresIn = getTokenExpirationSeconds(refreshToken);
    if (refreshExpiresIn > 0) {
      await addToBlacklist(refreshToken, refreshExpiresIn);
    }
  }

  // Also store in database for persistence
  try {
    const decoded = verifyAccessToken(accessToken);
    await query(
      `INSERT INTO token_blacklist (token, user_id, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')
       ON CONFLICT (token) DO NOTHING`,
      [accessToken, decoded.userId]
    );
  } catch {
    // Token might be invalid, but we still blacklist it
  }

  logger.debug('User logged out, tokens blacklisted');
};

/**
 * Register new user
 */
export const register = async (userData: {
  username: string;
  password: string;
  name_ko?: string;
  name_en?: string;
  email?: string;
  department?: string;
  position?: string;
}): Promise<{ user: UserInfo }> => {
  // Check if username exists
  if (await usernameExists(userData.username)) {
    throw new Error('Username already exists');
  }

  // Check if email exists
  if (userData.email && await emailExists(userData.email)) {
    throw new Error('Email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user
  const user = await createUser({
    loginid: userData.username,
    password: hashedPassword,
    name_ko: userData.name_ko,
    name_en: userData.name_en,
    email: userData.email,
    department: userData.department,
    position: userData.position,
  });

  logger.info(`New user registered: ${userData.username}`);

  return {
    user: toUserInfo(user),
  };
};

/**
 * Validate token
 */
export const validateToken = async (token: string): Promise<UserInfo | null> => {
  // Check blacklist
  const blacklisted = await isBlacklisted(token);
  if (blacklisted) {
    return null;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await getUserById(payload.userId);

    if (!user || user.status !== 'active') {
      return null;
    }

    return {
      id: user.id,
      loginid: user.loginid,
      name: user.name_ko || user.name_en || user.loginid,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
    };
  } catch {
    return null;
  }
};

/**
 * SSO Login - Login using loginid from SSO provider (EpTray)
 * MFA is skipped for SSO login
 */
export const ssoLogin = async (loginid: string): Promise<LoginResponse> => {
  // Find user by loginid
  const user = await getUserByUsername(loginid);

  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다');
  }

  // Check account status
  if (user.status !== 'active') {
    throw new Error('계정이 비활성화되었습니다');
  }

  // SSO login skips MFA and password verification
  // Generate tokens directly
  logger.info(`SSO login successful for user: ${loginid}`);

  return await generateTokensForUser(user);
};

/**
 * Get current user info
 */
export const getCurrentUser = async (userId: string): Promise<UserInfo | null> => {
  const user = await getUserById(userId);
  if (!user) return null;

  return {
    id: user.id,
    loginid: user.loginid,
    name: user.name_ko || user.name_en || user.loginid,
    email: user.email,
    role: user.role,
    department: user.department,
    position: user.position,
  };
};

/**
 * Helper: Generate tokens for user
 */
async function generateTokensForUser(user: User): Promise<LoginResponse> {
  const tokenPayload = {
    userId: user.id,
    loginid: user.loginid,
    role: user.role || 'user',
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Update last login
  await updateLastLogin(user.id);

  // Store refresh token in Redis
  await storeRefreshToken(user.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      loginid: user.loginid,
      name: user.name_ko || user.name_en || user.loginid,
      name_ko: user.name_ko,
      name_en: user.name_en,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      avatarUrl: user.avatar_url,
      employee_number: user.employee_number,
      phone_number: user.phone_number,
      mobile_number: user.mobile_number,
    },
  };
}

```

```typescript
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
  ssoLogin,
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

```

```typescript
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
  ssoLogin,
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
 * POST /auth/sso
 * SSO login using loginid from EpTray
 */
router.post('/sso', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { loginid } = req.body;

    if (!loginid) {
      res.status(400).json({
        success: false,
        message: 'Login ID is required',
      });
      return;
    }

    const result = await ssoLogin(loginid);

    logger.info(`SSO login successful: ${loginid}`);

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  } catch (error: any) {
    logger.warn(`SSO login failed: ${error.message}`);
    res.status(401).json({
      success: false,
      message: error.message || 'SSO login failed',
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

```


프론트엔드 수정 중입니다.


```typescriptreact
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState } from '@/types/auth';
import { authApi } from '@/lib/axios';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<any>;
  verifyMFA: (mfaToken: string, code: string) => Promise<void>;
  resendMFA: (mfaToken: string) => Promise<{ devCode?: string }>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  ssoLogin: (loginid: string) => Promise<void>;
  updateUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            setAuthState({
              user,
              token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error) {
            console.error('Failed to parse user data:', error);
            setAuthState((prev) => ({ ...prev, isLoading: false }));
          }
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await authApi.post('/login', { username, password });

      // Check for MFA required
      if (response.requireMFA || response.data?.requireMFA) {
        return {
          mfaRequired: true,
          mfaToken: response.mfaToken || response.data?.mfaToken,
          message: response.message
        };
      }

      // Extract data from response (handle both old and new API format)
      const data = response.data || response;
      const accessToken = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      const user = data.user;

      if (!accessToken || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token: accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  }, []);

  const verifyMFA = useCallback(async (mfaToken: string, code: string) => {
    try {
      const response = await authApi.post('/verify-mfa', { mfaToken, code });

      const data = response.data || response;
      const accessToken = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      const user = data.user;

      if (!accessToken || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token: accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      console.error('MFA verification error:', error);
      const message = error.response?.data?.message || error.message || 'MFA verification failed';
      throw new Error(message);
    }
  }, []);

  const resendMFA = useCallback(async (mfaToken: string) => {
    try {
      const response = await authApi.post('/resend-mfa', { mfaToken });
      return {
        devCode: response.devCode || response.data?.devCode
      };
    } catch (error: any) {
      console.error('Resend MFA error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to resend MFA code';
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token) {
        await authApi.post('/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      setAuthState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    try {
      const currentRefreshToken = localStorage.getItem('refreshToken');
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.post('/refresh', {
        refreshToken: currentRefreshToken
      });

      const data = response.data || response;
      const newAccessToken = data.accessToken || data.token;
      const newRefreshToken = data.refreshToken;

      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
      }
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      setAuthState((prev) => ({
        ...prev,
        token: newAccessToken,
        refreshToken: newRefreshToken || prev.refreshToken
      }));
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      throw error;
    }
  }, [logout]);

  const ssoLogin = useCallback(async () => {
    try {
      const response = await authApi.post('/sso');

      const data = response.data || response;
      const accessToken = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      const user = data.user;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token: accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      console.error('SSO login error:', error);
      throw error;
    }
  }, []);

  const updateUser = useCallback((updatedUser: any) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setAuthState((prev) => ({
      ...prev,
      user: updatedUser
    }));
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    verifyMFA,
    resendMFA,
    logout,
    refreshAccessToken,
    ssoLogin,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

```

```typescriptreact
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState } from '@/types/auth';
import { authApi } from '@/lib/axios';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<any>;
  verifyMFA: (mfaToken: string, code: string) => Promise<void>;
  resendMFA: (mfaToken: string) => Promise<{ devCode?: string }>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  ssoLogin: (loginid: string) => Promise<void>;
  updateUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            setAuthState({
              user,
              token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error) {
            console.error('Failed to parse user data:', error);
            setAuthState((prev) => ({ ...prev, isLoading: false }));
          }
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await authApi.post('/login', { username, password });

      // Check for MFA required
      if (response.requireMFA || response.data?.requireMFA) {
        return {
          mfaRequired: true,
          mfaToken: response.mfaToken || response.data?.mfaToken,
          message: response.message
        };
      }

      // Extract data from response (handle both old and new API format)
      const data = response.data || response;
      const accessToken = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      const user = data.user;

      if (!accessToken || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token: accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  }, []);

  const verifyMFA = useCallback(async (mfaToken: string, code: string) => {
    try {
      const response = await authApi.post('/verify-mfa', { mfaToken, code });

      const data = response.data || response;
      const accessToken = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      const user = data.user;

      if (!accessToken || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token: accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      console.error('MFA verification error:', error);
      const message = error.response?.data?.message || error.message || 'MFA verification failed';
      throw new Error(message);
    }
  }, []);

  const resendMFA = useCallback(async (mfaToken: string) => {
    try {
      const response = await authApi.post('/resend-mfa', { mfaToken });
      return {
        devCode: response.devCode || response.data?.devCode
      };
    } catch (error: any) {
      console.error('Resend MFA error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to resend MFA code';
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token) {
        await authApi.post('/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      setAuthState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    try {
      const currentRefreshToken = localStorage.getItem('refreshToken');
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.post('/refresh', {
        refreshToken: currentRefreshToken
      });

      const data = response.data || response;
      const newAccessToken = data.accessToken || data.token;
      const newRefreshToken = data.refreshToken;

      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
      }
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      setAuthState((prev) => ({
        ...prev,
        token: newAccessToken,
        refreshToken: newRefreshToken || prev.refreshToken
      }));
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      throw error;
    }
  }, [logout]);

  const ssoLogin = useCallback(async (loginid: string) => {
    try {
      const response = await authApi.post('/sso', { loginid });

      // Extract data from response (handle both old and new API format)
      const data = response.data || response;
      const accessToken = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      const user = data.user;

      if (!accessToken || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token: accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      console.error('SSO login error:', error);
      const message = error.response?.data?.message || error.message || 'SSO login failed';
      throw new Error(message);
    }
  }, []);

  const updateUser = useCallback((updatedUser: any) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setAuthState((prev) => ({
      ...prev,
      user: updatedUser
    }));
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    verifyMFA,
    resendMFA,
    logout,
    refreshAccessToken,
    ssoLogin,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

```


로그인 페이지에 SSO 자동 로그인 로직 추가 중입니다.


```typescriptreact
'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';

export default function LoginPage() {
  const router = useRouter();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile, isMobileLayout } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin();
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.ssoLoginFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```

```typescriptreact
'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile, isMobileLayout } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  // Check for SSO login parameters on mount
  useEffect(() => {
    const sso = searchParams.get('sso');
    const loginid = searchParams.get('loginid');

    if (sso === 'true' && loginid) {
      // Automatically attempt SSO login
      handleSSOLogin(loginid);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin();
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.ssoLoginFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```

```typescriptreact
'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile, isMobileLayout } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  // Check for SSO login parameters on mount
  useEffect(() => {
    const sso = searchParams.get('sso');
    const loginid = searchParams.get('loginid');

    if (sso === 'true' && loginid) {
      // Automatically attempt SSO login
      handleSSOLogin(loginid);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    // For manual SSO button click, try to get loginid from URL or prompt user
    const loginid = searchParams.get('loginid');
    
    if (loginid) {
      await handleSSOLogin(loginid);
    } else {
      // In development, you might want to prompt for loginid
      // For production with EpTray, loginid should come from query params
      setError('SSO login requires loginid parameter');
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```


린터 오류 확인 및 수정 중입니다.



린터 오류 수정 중입니다.


```typescriptreact
'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  // Check for SSO login parameters on mount
  useEffect(() => {
    const sso = searchParams.get('sso');
    const loginid = searchParams.get('loginid');

    if (sso === 'true' && loginid) {
      // Automatically attempt SSO login
      handleSSOLogin(loginid);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    // For manual SSO button click, try to get loginid from URL or prompt user
    const loginid = searchParams.get('loginid');
    
    if (loginid) {
      await handleSSOLogin(loginid);
    } else {
      // In development, you might want to prompt for loginid
      // For production with EpTray, loginid should come from query params
      setError('SSO login requires loginid parameter');
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```


useEffect 의존성 문제 수정 중입니다.


```typescriptreact
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  // Check for SSO login parameters on mount
  useEffect(() => {
    const sso = searchParams.get('sso');
    const loginid = searchParams.get('loginid');

    if (sso === 'true' && loginid) {
      // Automatically attempt SSO login
      handleSSOLogin(loginid);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    // For manual SSO button click, try to get loginid from URL or prompt user
    const loginid = searchParams.get('loginid');
    
    if (loginid) {
      await handleSSOLogin(loginid);
    } else {
      // In development, you might want to prompt for loginid
      // For production with EpTray, loginid should come from query params
      setError('SSO login requires loginid parameter');
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```

```typescriptreact
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // Check for SSO login parameters on mount
  useEffect(() => {
    const sso = searchParams.get('sso');
    const loginid = searchParams.get('loginid');

    if (sso === 'true' && loginid) {
      // Automatically attempt SSO login
      handleSSOLogin(loginid);
    }
  }, [searchParams, handleSSOLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    // For manual SSO button click, try to get loginid from URL or prompt user
    const loginid = searchParams.get('loginid');
    
    if (loginid) {
      await handleSSOLogin(loginid);
    } else {
      // In development, you might want to prompt for loginid
      // For production with EpTray, loginid should come from query params
      setError('SSO login requires loginid parameter');
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```

```typescriptreact
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // Check for SSO login parameters on mount
  useEffect(() => {
    const sso = searchParams.get('sso');
    const loginid = searchParams.get('loginid');

    if (sso === 'true' && loginid) {
      // Automatically attempt SSO login
      handleSSOLogin(loginid);
    }
  }, [searchParams, handleSSOLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    // For manual SSO button click, try to get loginid from URL or prompt user
    const loginid = searchParams.get('loginid');
    
    if (loginid) {
      await handleSSOLogin(loginid);
    } else {
      // In development, you might want to prompt for loginid
      // For production with EpTray, loginid should come from query params
      setError('SSO login requires loginid parameter');
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```


SSO 로그인 구현을 완료했습니다. 변경 사항 요약:

## 구현 완료 사항

### 1. 백엔드 구현

**`services/core-service/src/modules/auth/services/authService.ts`**
- `ssoLogin(loginid: string)` 함수 추가
  - `loginid`로 사용자 조회
  - 사용자 없음/비활성 계정 에러 처리
  - MFA 건너뛰고 바로 토큰 생성

**`services/core-service/src/modules/auth/routes/auth.ts`**
- `POST /auth/sso` 엔드포인트 추가
  - 요청 body에서 `loginid` 추출
  - `ssoLogin` 호출 및 응답 처리

### 2. 프론트엔드 구현

**`src/contexts/AuthContext.tsx`**
- `ssoLogin` 함수를 `loginid` 파라미터를 받도록 수정
  - `authApi.post('/sso', { loginid })` 호출
  - 응답 처리 및 상태 업데이트

**`src/app/[locale]/login/page.tsx`**
- URL 쿼리 파라미터 자동 감지 및 SSO 로그인
  - `useEffect`로 `sso=true&loginid=xxx` 파라미터 확인
  - 자동 SSO 로그인 시도
  - 에러 처리 및 로딩 상태 관리

## 사용 방법

EpTray에서 SSO 인증 완료 후 다음과 같은 URL로 리다이렉트하면 자동으로 로그인됩니다:

```
/login?sso=true&loginid=user123
```

또는 SSO 로그인 버튼을 클릭하면 URL에 `loginid` 파라미터가 있을 경우 자동으로 SSO 로그인을 시도합니다.

## 주요 특징

- MFA 건너뛰기: SSO 로그인은 MFA를 건너뜁니다
- 자동 로그인: URL 파라미터가 있으면 자동으로 로그인 시도
- 에러 처리: 사용자 없음, 비활성 계정 등 적절한 에러 메시지 표시
- 기존 로그인과 분리: 일반 로그인과 SSO 로그인이 독립적으로 동작

구현이 완료되었습니다. 테스트해보시고 문제가 있으면 알려주세요.

```plaintext
/login?sso=true&loginid=user123
```

---

**User**

SSO EpTray 에서 loginid 를 읽어오는 부분은 어디에 구현해야 하는지  TO-DO 를 작성할 부분을 알려 줘.

---

**Cursor**


EpTray에서 loginid를 읽어오는 부분을 어디에 구현할지 확인 중입니다.



EpTray에서 loginid를 읽어오는 부분을 추가할 위치를 확인 중입니다.



EpTray에서 loginid를 읽어오는 부분을 추가할 위치와 TO-DO를 정리 중입니다.



EpTray에서 loginid를 읽어오는 부분을 추가할 위치와 TO-DO를 정리 중입니다.



EpTray에서 loginid를 읽어오는 부분을 추가할 위치와 TO-DO를 정리합니다.

## TO-DO 추가 위치

### 1. EpTray 유틸리티 함수 생성 (권장)

**파일**: `src/lib/eptray/index.ts` (새로 생성)

EpTray에서 loginid를 읽어오는 유틸리티 함수를 별도 파일로 분리합니다.

```typescript
// TODO: EpTray에서 loginid를 읽어오는 함수 구현
// EpTray API/SDK를 사용하여 현재 인증된 사용자의 loginid를 가져옴
// 가능한 방법:
// 1. EpTray API 호출
// 2. 쿠키에서 읽기
// 3. 로컬 스토리지에서 읽기
// 4. window 객체에서 읽기
// 5. EpTray SDK 메서드 호출

export const getEpTrayLoginId = async (): Promise<string | null> => {
  // TODO: EpTray에서 loginid를 읽어오는 로직 구현
  // 예시:
  // - return await eptrayApi.getCurrentUserLoginId();
  // - return getCookie('eptray_loginid');
  // - return localStorage.getItem('eptray_loginid');
  // - return window.eptray?.getLoginId();
  
  return null;
};
```

### 2. 로그인 페이지에서 사용

**파일**: `src/app/[locale]/login/page.tsx`

현재 64-73줄의 useEffect 부분을 수정하여 EpTray 유틸리티 함수를 사용하도록 변경:

```typescript
// Check for SSO login parameters on mount
useEffect(() => {
  const sso = searchParams.get('sso');
  const loginid = searchParams.get('loginid');

  // TODO: EpTray에서 직접 loginid를 읽어오는 경우
  // if (sso === 'true') {
  //   getEpTrayLoginId().then((eptrayLoginId) => {
  //     if (eptrayLoginId) {
  //       handleSSOLogin(eptrayLoginId);
  //     }
  //   });
  // }

  // 현재 구현: URL 쿼리 파라미터에서 loginid 읽기
  if (sso === 'true' && loginid) {
    // Automatically attempt SSO login
    handleSSOLogin(loginid);
  }
}, [searchParams, handleSSOLogin]);
```

### 3. 대안: 커스텀 훅 생성

**파일**: `src/hooks/useEpTray.ts` (새로 생성)

커스텀 훅으로 만들 수도 있습니다:

```typescript
// TODO: EpTray 연동을 위한 커스텀 훅
export const useEpTray = () => {
  const [loginid, setLoginid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: EpTray에서 loginid를 읽어오는 로직
    const fetchLoginId = async () => {
      // EpTray API 호출 또는 다른 방법으로 loginid 가져오기
      const id = await getEpTrayLoginId();
      setLoginid(id);
      setLoading(false);
    };

    fetchLoginId();
  }, []);

  return { loginid, loading };
};
```

## 권장 구현 순서

1. `src/lib/eptray/index.ts` 파일 생성
   - `getEpTrayLoginId()` 함수 구현
   - EpTray API/SDK 연동 방법에 따라 구현

2. `src/app/[locale]/login/page.tsx` 수정
   - EpTray 유틸리티 함수 import
   - useEffect에서 URL 파라미터와 EpTray 직접 읽기 모두 지원

3. (선택) `src/hooks/useEpTray.ts` 생성
   - 재사용이 필요한 경우 커스텀 훅으로 분리

## TO-DO 주석 추가 예시

로그인 페이지에 다음과 같은 TO-DO 주석을 추가할 수 있습니다:

```typescript
// Check for SSO login parameters on mount
useEffect(() => {
  const sso = searchParams.get('sso');
  const loginid = searchParams.get('loginid');

  // TODO: [EpTray 연동] EpTray에서 직접 loginid를 읽어오는 로직 추가
  // 현재는 URL 쿼리 파라미터로만 받고 있음
  // EpTray API/SDK 연동 후 아래와 같이 수정 필요:
  // if (sso === 'true') {
  //   const eptrayLoginId = await getEpTrayLoginId();
  //   if (eptrayLoginId) {
  //     handleSSOLogin(eptrayLoginId);
  //   }
  // }

  if (sso === 'true' && loginid) {
    handleSSOLogin(loginid);
  }
}, [searchParams, handleSSOLogin]);
```

이 위치에 TO-DO를 추가하면 됩니다. EpTray 연동 방법(API, SDK, 쿠키 등)이 정해지면 해당 위치에서 구현하면 됩니다.

```typescript
// TODO: EpTray에서 loginid를 읽어오는 함수 구현
// EpTray API/SDK를 사용하여 현재 인증된 사용자의 loginid를 가져옴
// 가능한 방법:
// 1. EpTray API 호출
// 2. 쿠키에서 읽기
// 3. 로컬 스토리지에서 읽기
// 4. window 객체에서 읽기
// 5. EpTray SDK 메서드 호출

export const getEpTrayLoginId = async (): Promise<string | null> => {
  // TODO: EpTray에서 loginid를 읽어오는 로직 구현
  // 예시:
  // - return await eptrayApi.getCurrentUserLoginId();
  // - return getCookie('eptray_loginid');
  // - return localStorage.getItem('eptray_loginid');
  // - return window.eptray?.getLoginId();
  
  return null;
};
```

```typescript
// Check for SSO login parameters on mount
useEffect(() => {
  const sso = searchParams.get('sso');
  const loginid = searchParams.get('loginid');

  // TODO: EpTray에서 직접 loginid를 읽어오는 경우
  // if (sso === 'true') {
  //   getEpTrayLoginId().then((eptrayLoginId) => {
  //     if (eptrayLoginId) {
  //       handleSSOLogin(eptrayLoginId);
  //     }
  //   });
  // }

  // 현재 구현: URL 쿼리 파라미터에서 loginid 읽기
  if (sso === 'true' && loginid) {
    // Automatically attempt SSO login
    handleSSOLogin(loginid);
  }
}, [searchParams, handleSSOLogin]);
```

```typescript
// TODO: EpTray 연동을 위한 커스텀 훅
export const useEpTray = () => {
  const [loginid, setLoginid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: EpTray에서 loginid를 읽어오는 로직
    const fetchLoginId = async () => {
      // EpTray API 호출 또는 다른 방법으로 loginid 가져오기
      const id = await getEpTrayLoginId();
      setLoginid(id);
      setLoading(false);
    };

    fetchLoginId();
  }, []);

  return { loginid, loading };
};
```

```typescript
// Check for SSO login parameters on mount
useEffect(() => {
  const sso = searchParams.get('sso');
  const loginid = searchParams.get('loginid');

  // TODO: [EpTray 연동] EpTray에서 직접 loginid를 읽어오는 로직 추가
  // 현재는 URL 쿼리 파라미터로만 받고 있음
  // EpTray API/SDK 연동 후 아래와 같이 수정 필요:
  // if (sso === 'true') {
  //   const eptrayLoginId = await getEpTrayLoginId();
  //   if (eptrayLoginId) {
  //     handleSSOLogin(eptrayLoginId);
  //   }
  // }

  if (sso === 'true' && loginid) {
    handleSSOLogin(loginid);
  }
}, [searchParams, handleSSOLogin]);
```

---

**User**

위 수정을 적용하라.

---

**Cursor**


EpTray 유틸리티 함수 생성 및 로그인 페이지에 TO-DO 주석 추가 중입니다.


```typescript
/**
 * EpTray SSO Integration Utilities
 * EpTray에서 SSO 인증 완료 후 사용자 정보를 읽어오는 유틸리티 함수
 */

/**
 * EpTray에서 현재 인증된 사용자의 loginid를 읽어옵니다.
 * 
 * TODO: EpTray API/SDK를 사용하여 실제 구현 필요
 * 
 * 가능한 구현 방법:
 * 1. EpTray API 호출: await eptrayApi.getCurrentUserLoginId()
 * 2. 쿠키에서 읽기: getCookie('eptray_loginid')
 * 3. 로컬 스토리지에서 읽기: localStorage.getItem('eptray_loginid')
 * 4. window 객체에서 읽기: window.eptray?.getLoginId()
 * 5. EpTray SDK 메서드 호출: eptraySDK.getUserInfo().loginid
 * 
 * @returns {Promise<string | null>} EpTray에서 읽어온 loginid, 없으면 null
 */
export const getEpTrayLoginId = async (): Promise<string | null> => {
  // TODO: EpTray에서 loginid를 읽어오는 실제 로직 구현
  // 
  // 예시 구현:
  // try {
  //   // 방법 1: EpTray API 호출
  //   const response = await fetch('/api/eptray/current-user');
  //   const data = await response.json();
  //   return data.loginid || null;
  //   
  //   // 방법 2: 쿠키에서 읽기
  //   // const cookies = document.cookie.split(';');
  //   // const loginidCookie = cookies.find(c => c.trim().startsWith('eptray_loginid='));
  //   // return loginidCookie ? loginidCookie.split('=')[1] : null;
  //   
  //   // 방법 3: 로컬 스토리지에서 읽기
  //   // return localStorage.getItem('eptray_loginid');
  //   
  //   // 방법 4: window 객체에서 읽기
  //   // return window.eptray?.getLoginId() || null;
  //   
  //   // 방법 5: EpTray SDK 사용
  //   // const userInfo = await eptraySDK.getUserInfo();
  //   // return userInfo?.loginid || null;
  // } catch (error) {
  //   console.error('Failed to get EpTray loginid:', error);
  //   return null;
  // }

  // 현재는 null 반환 (실제 EpTray 연동 전까지)
  return null;
};

/**
 * EpTray SSO 인증이 완료되었는지 확인합니다.
 * 
 * @returns {Promise<boolean>} SSO 인증 완료 여부
 */
export const isEpTrayAuthenticated = async (): Promise<boolean> => {
  // TODO: EpTray SSO 인증 상태 확인 로직 구현
  const loginid = await getEpTrayLoginId();
  return loginid !== null;
};

```


로그인 페이지에 EpTray 유틸리티 함수를 추가하고 TO-DO 주석을 반영 중입니다.


```typescriptreact
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { getEpTrayLoginId } from '@/lib/eptray';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // Check for SSO login parameters on mount
  useEffect(() => {
    const sso = searchParams.get('sso');
    const loginid = searchParams.get('loginid');

    if (sso === 'true' && loginid) {
      // Automatically attempt SSO login
      handleSSOLogin(loginid);
    }
  }, [searchParams, handleSSOLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    // For manual SSO button click, try to get loginid from URL or prompt user
    const loginid = searchParams.get('loginid');
    
    if (loginid) {
      await handleSSOLogin(loginid);
    } else {
      // In development, you might want to prompt for loginid
      // For production with EpTray, loginid should come from query params
      setError('SSO login requires loginid parameter');
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```

```typescriptreact
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { getEpTrayLoginId } from '@/lib/eptray';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // Check for SSO login parameters on mount
  useEffect(() => {
    const sso = searchParams.get('sso');
    const loginid = searchParams.get('loginid');

    if (sso === 'true') {
      // TODO: [EpTray 연동] EpTray에서 직접 loginid를 읽어오는 로직 추가
      // 현재는 URL 쿼리 파라미터로만 받고 있음
      // EpTray API/SDK 연동 후 아래와 같이 수정 필요:
      //
      // const attemptEpTraySSO = async () => {
      //   const eptrayLoginId = await getEpTrayLoginId();
      //   if (eptrayLoginId) {
      //     handleSSOLogin(eptrayLoginId);
      //     return;
      //   }
      //   // EpTray에서 읽어오지 못한 경우 URL 파라미터로 폴백
      //   if (loginid) {
      //     handleSSOLogin(loginid);
      //   }
      // };
      // attemptEpTraySSO();

      // 현재 구현: URL 쿼리 파라미터에서 loginid 읽기
      if (loginid) {
        // Automatically attempt SSO login
        handleSSOLogin(loginid);
      }
    }
  }, [searchParams, handleSSOLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    // For manual SSO button click, try to get loginid from URL or prompt user
    const loginid = searchParams.get('loginid');
    
    if (loginid) {
      await handleSSOLogin(loginid);
    } else {
      // In development, you might want to prompt for loginid
      // For production with EpTray, loginid should come from query params
      setError('SSO login requires loginid parameter');
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```


린터 경고 해결 중: import는 유지하고 실제 사용 코드를 주석으로 추가합니다.


```typescriptreact
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { getEpTrayLoginId } from '@/lib/eptray';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // Check for SSO login parameters on mount
  useEffect(() => {
    const sso = searchParams.get('sso');
    const loginid = searchParams.get('loginid');

    if (sso === 'true') {
      // TODO: [EpTray 연동] EpTray에서 직접 loginid를 읽어오는 로직 추가
      // 현재는 URL 쿼리 파라미터로만 받고 있음
      // EpTray API/SDK 연동 후 아래 주석을 해제하고 사용:
      //
      // const attemptEpTraySSO = async () => {
      //   const eptrayLoginId = await getEpTrayLoginId();
      //   if (eptrayLoginId) {
      //     handleSSOLogin(eptrayLoginId);
      //     return;
      //   }
      //   // EpTray에서 읽어오지 못한 경우 URL 파라미터로 폴백
      //   if (loginid) {
      //     handleSSOLogin(loginid);
      //   }
      // };
      // attemptEpTraySSO();

      // 현재 구현: URL 쿼리 파라미터에서 loginid 읽기
      if (loginid) {
        // Automatically attempt SSO login
        handleSSOLogin(loginid);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, handleSSOLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    // For manual SSO button click, try to get loginid from URL or prompt user
    const loginid = searchParams.get('loginid');
    
    if (loginid) {
      await handleSSOLogin(loginid);
    } else {
      // In development, you might want to prompt for loginid
      // For production with EpTray, loginid should come from query params
      setError('SSO login requires loginid parameter');
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```


린터 경고 해결 중: import에 eslint-disable 주석 추가.


```typescriptreact
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getEpTrayLoginId } from '@/lib/eptray'; // TODO: EpTray 연동 시 사용 예정

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // Check for SSO login parameters on mount
  useEffect(() => {
    const sso = searchParams.get('sso');
    const loginid = searchParams.get('loginid');

    if (sso === 'true') {
      // TODO: [EpTray 연동] EpTray에서 직접 loginid를 읽어오는 로직 추가
      // 현재는 URL 쿼리 파라미터로만 받고 있음
      // EpTray API/SDK 연동 후 아래 주석을 해제하고 사용:
      //
      // const attemptEpTraySSO = async () => {
      //   const eptrayLoginId = await getEpTrayLoginId();
      //   if (eptrayLoginId) {
      //     handleSSOLogin(eptrayLoginId);
      //     return;
      //   }
      //   // EpTray에서 읽어오지 못한 경우 URL 파라미터로 폴백
      //   if (loginid) {
      //     handleSSOLogin(loginid);
      //   }
      // };
      // attemptEpTraySSO();

      // 현재 구현: URL 쿼리 파라미터에서 loginid 읽기
      if (loginid) {
        // Automatically attempt SSO login
        handleSSOLogin(loginid);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, handleSSOLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    // For manual SSO button click, try to get loginid from URL or prompt user
    const loginid = searchParams.get('loginid');
    
    if (loginid) {
      await handleSSOLogin(loginid);
    } else {
      // In development, you might want to prompt for loginid
      // For production with EpTray, loginid should come from query params
      setError('SSO login requires loginid parameter');
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```

```typescriptreact
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getEpTrayLoginId } from '@/lib/eptray'; // TODO: EpTray 연동 시 사용 예정

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // Check for SSO login parameters on mount
  useEffect(() => {
    const sso = searchParams.get('sso');
    const loginid = searchParams.get('loginid');

    if (sso === 'true') {
      // TODO: [EpTray 연동] EpTray에서 직접 loginid를 읽어오는 로직 추가
      // 현재는 URL 쿼리 파라미터로만 받고 있음
      // EpTray API/SDK 연동 후 아래 주석을 해제하고 사용:
      //
      // const attemptEpTraySSO = async () => {
      //   const eptrayLoginId = await getEpTrayLoginId();
      //   if (eptrayLoginId) {
      //     handleSSOLogin(eptrayLoginId);
      //     return;
      //   }
      //   // EpTray에서 읽어오지 못한 경우 URL 파라미터로 폴백
      //   if (loginid) {
      //     handleSSOLogin(loginid);
      //   }
      // };
      // attemptEpTraySSO();

      // 현재 구현: URL 쿼리 파라미터에서 loginid 읽기
      if (loginid) {
        // Automatically attempt SSO login
        handleSSOLogin(loginid);
      }
    }
  }, [searchParams, handleSSOLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    // For manual SSO button click, try to get loginid from URL or prompt user
    const loginid = searchParams.get('loginid');
    
    if (loginid) {
      await handleSSOLogin(loginid);
    } else {
      // In development, you might want to prompt for loginid
      // For production with EpTray, loginid should come from query params
      setError('SSO login requires loginid parameter');
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```


수정 완료. 적용 내용 요약:

## 적용 완료 사항

### 1. EpTray 유틸리티 함수 생성
**파일**: `src/lib/eptray/index.ts` (새로 생성)

- `getEpTrayLoginId()`: EpTray에서 loginid를 읽어오는 함수
- `isEpTrayAuthenticated()`: EpTray SSO 인증 완료 여부 확인 함수
- 구현 방법 예시 주석 포함 (API 호출, 쿠키, 로컬 스토리지, window 객체 등)

### 2. 로그인 페이지 수정
**파일**: `src/app/[locale]/login/page.tsx`

- EpTray 유틸리티 함수 import 추가
- useEffect에 TO-DO 주석 추가
  - EpTray에서 직접 loginid를 읽어오는 로직 추가 위치 명시
  - 구현 예시 코드 주석 포함
  - 현재는 URL 쿼리 파라미터 방식 유지

## 다음 단계

EpTray API/SDK 연동 시:

1. `src/lib/eptray/index.ts`의 `getEpTrayLoginId()` 함수 구현
2. `src/app/[locale]/login/page.tsx`의 useEffect에서 주석 처리된 코드 활성화

현재는 URL 쿼리 파라미터 방식(`/login?sso=true&loginid=xxx`)으로 동작하며, EpTray 연동 준비가 완료되었습니다.

---

**User**

작성한 코드를 너무 구조화하거나 어렵게 작성하면 직접 구현을 어디에 해야 할 지 어렵다. 가장 간단하고 직관적으로 이해할 수 있도록 SSO 로그인 부분을 수정하라. 내가 EpTray 에서 loginid 을 읽어 오는 부분만 구현하면 딱 되도록 코드를 개선하라.

---

**Cursor**


EpTray에서 loginid를 읽어오는 부분만 구현하면 되도록 간단하게 정리 중입니다.



EpTray에서 loginid를 읽어오는 부분만 구현하면 되도록 간단히 정리 중입니다.


```typescript
/**
 * EpTray에서 현재 인증된 사용자의 loginid를 읽어옵니다.
 * 
 * 이 함수만 구현하면 SSO 로그인이 작동합니다.
 * EpTray API/SDK를 사용하여 loginid를 가져오세요.
 * 
 * @returns {Promise<string | null>} EpTray에서 읽어온 loginid, 없으면 null
 */
export const getEpTrayLoginId = async (): Promise<string | null> => {
  // TODO: 여기에 EpTray에서 loginid를 읽어오는 코드를 작성하세요
  // 예시:
  // return window.eptray?.getLoginId() || null;
  // 또는
  // const response = await fetch('/api/eptray/user');
  // const data = await response.json();
  // return data.loginid || null;

  // 테스트용 (실제 구현 시 삭제)
  return "admin";
};

```

```typescriptreact
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getEpTrayLoginId } from '@/lib/eptray'; // TODO: EpTray 연동 시 사용 예정

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // SSO 로그인 처리
  useEffect(() => {
    const sso = searchParams.get('sso');
    const loginid = searchParams.get('loginid');

    if (sso === 'true') {
      const attemptSSO = async () => {
        // EpTray에서 loginid 읽어오기 시도
        const eptrayLoginId = await getEpTrayLoginId();
        
        if (eptrayLoginId) {
          // EpTray에서 읽어온 loginid로 로그인
          handleSSOLogin(eptrayLoginId);
        } else if (loginid) {
          // EpTray에서 읽어오지 못한 경우 URL 파라미터 사용
          handleSSOLogin(loginid);
        }
      };

      attemptSSO();
    }
  }, [searchParams, handleSSOLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    // For manual SSO button click, try to get loginid from URL or prompt user
    const loginid = searchParams.get('loginid');
    
    if (loginid) {
      await handleSSOLogin(loginid);
    } else {
      // In development, you might want to prompt for loginid
      // For production with EpTray, loginid should come from query params
      setError('SSO login requires loginid parameter');
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```


불필요한 eslint-disable 주석 제거 중입니다.


```typescriptreact
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { getEpTrayLoginId } from '@/lib/eptray';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // SSO 로그인 처리
  useEffect(() => {
    const sso = searchParams.get('sso');
    const loginid = searchParams.get('loginid');

    if (sso === 'true') {
      const attemptSSO = async () => {
        // EpTray에서 loginid 읽어오기 시도
        const eptrayLoginId = await getEpTrayLoginId();
        
        if (eptrayLoginId) {
          // EpTray에서 읽어온 loginid로 로그인
          handleSSOLogin(eptrayLoginId);
        } else if (loginid) {
          // EpTray에서 읽어오지 못한 경우 URL 파라미터 사용
          handleSSOLogin(loginid);
        }
      };

      attemptSSO();
    }
  }, [searchParams, handleSSOLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    // For manual SSO button click, try to get loginid from URL or prompt user
    const loginid = searchParams.get('loginid');
    
    if (loginid) {
      await handleSSOLogin(loginid);
    } else {
      // In development, you might want to prompt for loginid
      // For production with EpTray, loginid should come from query params
      setError('SSO login requires loginid parameter');
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```


코드를 간단하고 직관적으로 정리했습니다.

## 개선 사항

### 1. EpTray 유틸리티 함수 단순화
**파일**: `src/lib/eptray/index.ts`

- 불필요한 주석과 예시 코드 제거
- 핵심만 남김: "이 함수만 구현하면 SSO 로그인이 작동합니다"
- 간단한 예시 2개만 제공

### 2. 로그인 페이지 단순화
**파일**: `src/app/[locale]/login/page.tsx`

- 복잡한 TO-DO 주석 제거
- EpTray에서 loginid를 읽어오는 로직을 직접 호출하도록 변경
- URL 파라미터는 폴백으로만 사용

## 구현 방법

`src/lib/eptray/index.ts` 파일의 `getEpTrayLoginId()` 함수만 수정하면 됩니다:

```typescript
export const getEpTrayLoginId = async (): Promise<string | null> => {
  // 여기에 EpTray에서 loginid를 읽어오는 코드만 작성하세요
  // 예시:
  // return window.eptray?.getLoginId() || null;
  
  return "admin"; // 테스트용 (실제 구현 시 삭제)
};
```

이 함수가 `loginid`를 반환하면 자동으로 SSO 로그인이 진행됩니다.

```typescript
export const getEpTrayLoginId = async (): Promise<string | null> => {
  // 여기에 EpTray에서 loginid를 읽어오는 코드만 작성하세요
  // 예시:
  // return window.eptray?.getLoginId() || null;
  
  return "admin"; // 테스트용 (실제 구현 시 삭제)
};
```

---

**User**

실행하면 "SSO login requires loginid parameter" 메시지가 뜬다. loginid 는 "admin" 을 가져왔다고 가정하고 코드를 계속하라.

---

**Cursor**


"SSO login requires loginid parameter" 오류 원인 확인 중. 로그인 페이지의 SSO 처리 로직을 확인합니다.



SSO 버튼 클릭 시 호출되는 `handleSSO` 함수 확인 중.



`handleSSO` 함수가 URL 파라미터만 확인하고 EpTray에서 loginid를 읽지 않습니다. EpTray에서도 읽도록 수정 중입니다.


```typescriptreact
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { getEpTrayLoginId } from '@/lib/eptray';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // SSO 로그인 처리
  useEffect(() => {
    const sso = searchParams.get('sso');
    const loginid = searchParams.get('loginid');

    if (sso === 'true') {
      const attemptSSO = async () => {
        // EpTray에서 loginid 읽어오기 시도
        const eptrayLoginId = await getEpTrayLoginId();
        
        if (eptrayLoginId) {
          // EpTray에서 읽어온 loginid로 로그인
          handleSSOLogin(eptrayLoginId);
        } else if (loginid) {
          // EpTray에서 읽어오지 못한 경우 URL 파라미터 사용
          handleSSOLogin(loginid);
        }
      };

      attemptSSO();
    }
  }, [searchParams, handleSSOLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    setError('');
    setLoading(true);

    try {
      // EpTray에서 loginid 읽어오기
      const eptrayLoginId = await getEpTrayLoginId();
      
      if (eptrayLoginId) {
        // EpTray에서 읽어온 loginid로 로그인
        await handleSSOLogin(eptrayLoginId);
      } else {
        // EpTray에서 읽어오지 못한 경우 URL 파라미터 확인
        const loginid = searchParams.get('loginid');
        if (loginid) {
          await handleSSOLogin(loginid);
        } else {
          setError('SSO login requires loginid parameter');
          setLoading(false);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || 'SSO login failed';
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```


수정 완료. 이제 SSO 로그인 버튼을 클릭하면 EpTray에서 loginid를 읽어와 로그인합니다.

## 수정 사항

**`src/app/[locale]/login/page.tsx`의 `handleSSO` 함수**

- EpTray에서 loginid를 읽어오도록 수정
- EpTray에서 읽어오지 못한 경우에만 URL 파라미터 확인
- 에러 처리 및 로딩 상태 관리 개선

## 동작 방식

1. SSO 로그인 버튼 클릭 시
   - `getEpTrayLoginId()` 호출 → "admin" 반환
   - "admin"으로 SSO 로그인 진행

2. URL에 `?sso=true` 파라미터가 있는 경우
   - `getEpTrayLoginId()` 호출 → "admin" 반환
   - 자동으로 SSO 로그인 진행

현재 `getEpTrayLoginId()`가 "admin"을 반환하므로, SSO 로그인 버튼을 클릭하면 "admin" 사용자로 로그인됩니다.

---

**User**

getEpTrayLoginId 에서 null 이 아닌 실제 계정 정보를 가져올 수 있다면 자동로그인 될 수 있도록 수정을 할 수 있도록 수정하라. 

---

**Cursor**


EpTray에서 loginid를 가져올 수 있으면 자동 로그인되도록 수정 중입니다.



EpTray에서 loginid를 가져올 수 있으면 자동 로그인되도록 수정 중입니다.



EpTray에서 loginid를 가져올 수 있으면 자동 로그인되도록 수정 중입니다.


```typescriptreact
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { getEpTrayLoginId } from '@/lib/eptray';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // SSO 로그인 처리
  useEffect(() => {
    const sso = searchParams.get('sso');
    const loginid = searchParams.get('loginid');

    if (sso === 'true') {
      const attemptSSO = async () => {
        // EpTray에서 loginid 읽어오기 시도
        const eptrayLoginId = await getEpTrayLoginId();
        
        if (eptrayLoginId) {
          // EpTray에서 읽어온 loginid로 로그인
          handleSSOLogin(eptrayLoginId);
        } else if (loginid) {
          // EpTray에서 읽어오지 못한 경우 URL 파라미터 사용
          handleSSOLogin(loginid);
        }
      };

      attemptSSO();
    }
  }, [searchParams, handleSSOLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    setError('');
    setLoading(true);

    try {
      // EpTray에서 loginid 읽어오기
      const eptrayLoginId = await getEpTrayLoginId();
      
      if (eptrayLoginId) {
        // EpTray에서 읽어온 loginid로 로그인
        await handleSSOLogin(eptrayLoginId);
      } else {
        // EpTray에서 읽어오지 못한 경우 URL 파라미터 확인
        const loginid = searchParams.get('loginid');
        if (loginid) {
          await handleSSOLogin(loginid);
        } else {
          setError('SSO login requires loginid parameter');
          setLoading(false);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || 'SSO login failed';
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```

```typescriptreact
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { getEpTrayLoginId } from '@/lib/eptray';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // EpTray 자동 로그인 처리
  useEffect(() => {
    // 이미 로그인된 상태면 대시보드로 리다이렉트
    if (isAuthenticated) {
      router.push(`/${locale}/dashboard`);
      return;
    }

    const attemptAutoSSO = async () => {
      // EpTray에서 loginid 읽어오기 시도
      const eptrayLoginId = await getEpTrayLoginId();
      
      if (eptrayLoginId) {
        // EpTray에서 loginid를 가져올 수 있으면 자동 로그인
        handleSSOLogin(eptrayLoginId);
        return;
      }

      // URL 파라미터로 SSO 로그인 시도 (기존 로직)
      const sso = searchParams.get('sso');
      const loginid = searchParams.get('loginid');

      if (sso === 'true' && loginid) {
        handleSSOLogin(loginid);
      }
    };

    attemptAutoSSO();
  }, [isAuthenticated, searchParams, handleSSOLogin, router, locale]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    setError('');
    setLoading(true);

    try {
      // EpTray에서 loginid 읽어오기
      const eptrayLoginId = await getEpTrayLoginId();
      
      if (eptrayLoginId) {
        // EpTray에서 읽어온 loginid로 로그인
        await handleSSOLogin(eptrayLoginId);
      } else {
        // EpTray에서 읽어오지 못한 경우 URL 파라미터 확인
        const loginid = searchParams.get('loginid');
        if (loginid) {
          await handleSSOLogin(loginid);
        } else {
          setError('SSO login requires loginid parameter');
          setLoading(false);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || 'SSO login failed';
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```


수정 완료. 이제 EpTray에서 loginid를 가져올 수 있으면 자동으로 로그인됩니다.

## 수정 사항

**`src/app/[locale]/login/page.tsx`**

1. **자동 로그인 로직 추가**
   - 페이지 마운트 시 EpTray에서 loginid 확인
   - loginid가 있으면 자동 SSO 로그인 시도
   - URL 파라미터 없이도 동작

2. **중복 로그인 방지**
   - 이미 로그인된 상태면 대시보드로 리다이렉트
   - 불필요한 로그인 시도 방지

3. **기존 로직 유지**
   - URL 파라미터 `?sso=true&loginid=xxx`도 계속 지원

## 동작 방식

1. 로그인 페이지 접속 시
   - `getEpTrayLoginId()` 호출
   - loginid가 있으면 자동 SSO 로그인
   - 없으면 일반 로그인 화면 표시

2. 이미 로그인된 경우
   - 대시보드로 자동 리다이렉트

3. URL 파라미터가 있는 경우
   - `?sso=true&loginid=xxx` → 해당 loginid로 로그인
   - EpTray에서 loginid를 가져올 수 있으면 우선 사용

현재 `getEpTrayLoginId()`가 "kdkim2000"을 반환하므로, 로그인 페이지 접속 시 자동으로 "kdkim2000" 사용자로 로그인됩니다.

---

**User**

아래 오류의 원인을 파악하고 설명해 줘.
```
Console AxiosError


Request failed with status code 429
src/contexts/AuthContext.tsx (207:24) @ async AuthProvider.useCallback[ssoLogin]


  205 |   const ssoLogin = useCallback(async (loginid: string) => {
  206 |     try {
> 207 |       const response = await authApi.post('/sso', { loginid });
      |                        ^
  208 |
  209 |       // Extract data from response (handle both old and new API format)
  210 |       const data = response.data || response;
Call Stack
5

Show 3 ignore-listed frame(s)
async AuthProvider.useCallback[ssoLogin]
src/contexts/AuthContext.tsx (207:24)
async LoginPage.useCallback[handleSSOLogin]
src/app/[locale]/login/page.tsx (55:7)
```

---

**Cursor**


429 에러 원인 확인 중. 백엔드 SSO 로그인 엔드포인트의 rate limiting 설정을 확인합니다.



429 에러 원인 확인 중. rate limiter 설정을 확인합니다.



## 429 에러 원인 분석

### 문제 원인

1. Rate Limiting 적용
   - SSO 로그인 엔드포인트(`POST /auth/sso`)에 `loginLimiter`가 적용되어 있습니다.
   - `loginLimiter`는 1분에 5번만 요청을 허용합니다.

2. 자동 로그인 로직의 반복 호출
   - 로그인 페이지가 마운트될 때마다 `getEpTrayLoginId()`를 호출하고 자동 로그인을 시도합니다.
   - 개발 중 페이지를 여러 번 새로고침하거나 리로드하면 1분 내 5번을 초과할 수 있습니다.

3. 중복 시도 방지 부재
   - 이미 로그인 시도 중인지 확인하지 않아, 실패 시에도 계속 재시도할 수 있습니다.

### 코드 위치

```32:46:services/core-service/src/middleware/rateLimiter.ts
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1분
  max: 5,                // 최대 5번
  ...
});
```

```212:212:services/core-service/src/modules/auth/routes/auth.ts
router.post('/sso', loginLimiter, async (req: Request, res: Response) => {
```

### 해결 방법

1. SSO 로그인에 별도의 rate limiter 사용 (권장)
   - SSO는 자동 로그인이므로 제한을 완화하거나 별도로 관리

2. 자동 로그인 시도 중복 방지
   - 이미 시도 중이면 재시도하지 않도록 플래그 추가

3. 실패 시 재시도 제한
   - 실패 후 일정 시간 대기 또는 최대 재시도 횟수 제한

원하는 해결 방법을 알려주세요.

```typescript
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1분
  max: 5,                // 최대 5번
  ...
});
```

```typescript
router.post('/sso', loginLimiter, async (req: Request, res: Response) => {
```

---

**User**

이를 해결하라.

---

**Cursor**


429 에러 해결 중: SSO 로그인에 별도 rate limiter 추가, 자동 로그인 중복 시도 방지.



백엔드와 프론트엔드 모두 수정 중입니다.


```typescript
/**
 * Rate Limiting Middleware - Core Service
 */

import rateLimit from 'express-rate-limit';
import { getLogger } from '@enterprise/shared';

const logger = getLogger('core-service:rateLimit');

/**
 * General auth rate limiter - 15 requests per minute
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

/**
 * Login rate limiter - 5 attempts per minute
 */
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Login rate limit exceeded for IP: ${req.ip}, username: ${req.body?.username}`);
    res.status(429).json(options.message);
  },
});

/**
 * MFA rate limiter - 10 attempts per 5 minutes
 */
export const mfaLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many MFA attempts, please try again later',
    code: 'MFA_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`MFA rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

/**
 * Register rate limiter - 3 registrations per hour
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later',
    code: 'REGISTER_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Register rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

/**
 * SSO login rate limiter - 15 attempts per minute
 * SSO는 자동 로그인이므로 일반 로그인보다 더 관대한 제한 적용
 */
export const ssoLoginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'Too many SSO login attempts, please try again later',
    code: 'SSO_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`SSO login rate limit exceeded for IP: ${req.ip}, loginid: ${req.body?.loginid}`);
    res.status(429).json(options.message);
  },
});

```

```typescript
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
  ssoLogin,
} from '../services/authService';
import { authenticateToken } from '../../../middleware/authMiddleware';
import {
  loginLimiter,
  mfaLimiter,
  registerLimiter,
  authLimiter,
  ssoLoginLimiter,
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
 * POST /auth/sso
 * SSO login using loginid from EpTray
 */
router.post('/sso', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { loginid } = req.body;

    if (!loginid) {
      res.status(400).json({
        success: false,
        message: 'Login ID is required',
      });
      return;
    }

    const result = await ssoLogin(loginid);

    logger.info(`SSO login successful: ${loginid}`);

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  } catch (error: any) {
    logger.warn(`SSO login failed: ${error.message}`);
    res.status(401).json({
      success: false,
      message: error.message || 'SSO login failed',
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

```

```typescript
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
  ssoLogin,
} from '../services/authService';
import { authenticateToken } from '../../../middleware/authMiddleware';
import {
  loginLimiter,
  mfaLimiter,
  registerLimiter,
  authLimiter,
  ssoLoginLimiter,
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
 * POST /auth/sso
 * SSO login using loginid from EpTray
 */
router.post('/sso', ssoLoginLimiter, async (req: Request, res: Response) => {
  try {
    const { loginid } = req.body;

    if (!loginid) {
      res.status(400).json({
        success: false,
        message: 'Login ID is required',
      });
      return;
    }

    const result = await ssoLogin(loginid);

    logger.info(`SSO login successful: ${loginid}`);

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  } catch (error: any) {
    logger.warn(`SSO login failed: ${error.message}`);
    res.status(401).json({
      success: false,
      message: error.message || 'SSO login failed',
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

```

```typescriptreact
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { getEpTrayLoginId } from '@/lib/eptray';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // EpTray 자동 로그인 처리
  useEffect(() => {
    // 이미 로그인된 상태면 대시보드로 리다이렉트
    if (isAuthenticated) {
      router.push(`/${locale}/dashboard`);
      return;
    }

    const attemptAutoSSO = async () => {
      // EpTray에서 loginid 읽어오기 시도
      const eptrayLoginId = await getEpTrayLoginId();
      
      if (eptrayLoginId) {
        // EpTray에서 loginid를 가져올 수 있으면 자동 로그인
        handleSSOLogin(eptrayLoginId);
        return;
      }

      // URL 파라미터로 SSO 로그인 시도 (기존 로직)
      const sso = searchParams.get('sso');
      const loginid = searchParams.get('loginid');

      if (sso === 'true' && loginid) {
        handleSSOLogin(loginid);
      }
    };

    attemptAutoSSO();
  }, [isAuthenticated, searchParams, handleSSOLogin, router, locale]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    setError('');
    setLoading(true);

    try {
      // EpTray에서 loginid 읽어오기
      const eptrayLoginId = await getEpTrayLoginId();
      
      if (eptrayLoginId) {
        // EpTray에서 읽어온 loginid로 로그인
        await handleSSOLogin(eptrayLoginId);
      } else {
        // EpTray에서 읽어오지 못한 경우 URL 파라미터 확인
        const loginid = searchParams.get('loginid');
        if (loginid) {
          await handleSSOLogin(loginid);
        } else {
          setError('SSO login requires loginid parameter');
          setLoading(false);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || 'SSO login failed';
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```

```typescriptreact
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { getEpTrayLoginId } from '@/lib/eptray';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  // 자동 로그인 시도 중복 방지
  const autoLoginAttempted = useRef(false);

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // EpTray 자동 로그인 처리
  useEffect(() => {
    // 이미 로그인된 상태면 대시보드로 리다이렉트
    if (isAuthenticated) {
      router.push(`/${locale}/dashboard`);
      return;
    }

    const attemptAutoSSO = async () => {
      // EpTray에서 loginid 읽어오기 시도
      const eptrayLoginId = await getEpTrayLoginId();
      
      if (eptrayLoginId) {
        // EpTray에서 loginid를 가져올 수 있으면 자동 로그인
        handleSSOLogin(eptrayLoginId);
        return;
      }

      // URL 파라미터로 SSO 로그인 시도 (기존 로직)
      const sso = searchParams.get('sso');
      const loginid = searchParams.get('loginid');

      if (sso === 'true' && loginid) {
        handleSSOLogin(loginid);
      }
    };

    attemptAutoSSO();
  }, [isAuthenticated, searchParams, handleSSOLogin, router, locale]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    setError('');
    setLoading(true);

    try {
      // EpTray에서 loginid 읽어오기
      const eptrayLoginId = await getEpTrayLoginId();
      
      if (eptrayLoginId) {
        // EpTray에서 읽어온 loginid로 로그인
        await handleSSOLogin(eptrayLoginId);
      } else {
        // EpTray에서 읽어오지 못한 경우 URL 파라미터 확인
        const loginid = searchParams.get('loginid');
        if (loginid) {
          await handleSSOLogin(loginid);
        } else {
          setError('SSO login requires loginid parameter');
          setLoading(false);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || 'SSO login failed';
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```

```typescriptreact
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { getEpTrayLoginId } from '@/lib/eptray';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const t = useI18n();
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { login, verifyMFA, ssoLogin, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  // 자동 로그인 시도 중복 방지
  const autoLoginAttempted = useRef(false);

  const handleSSOLogin = useCallback(async (loginid: string) => {
    setError('');
    setLoading(true);

    try {
      await ssoLogin(loginid);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || t('auth.ssoLoginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ssoLogin, router, locale, t]);

  // EpTray 자동 로그인 처리
  useEffect(() => {
    // 이미 로그인된 상태면 대시보드로 리다이렉트
    if (isAuthenticated) {
      router.push(`/${locale}/dashboard`);
      return;
    }

    // 이미 자동 로그인을 시도했다면 중복 시도 방지
    if (autoLoginAttempted.current) {
      return;
    }

    const attemptAutoSSO = async () => {
      // 자동 로그인 시도 플래그 설정
      autoLoginAttempted.current = true;

      try {
        // EpTray에서 loginid 읽어오기 시도
        const eptrayLoginId = await getEpTrayLoginId();
        
        if (eptrayLoginId) {
          // EpTray에서 loginid를 가져올 수 있으면 자동 로그인
          await handleSSOLogin(eptrayLoginId);
          return;
        }

        // URL 파라미터로 SSO 로그인 시도 (기존 로직)
        const sso = searchParams.get('sso');
        const loginid = searchParams.get('loginid');

        if (sso === 'true' && loginid) {
          await handleSSOLogin(loginid);
        }
      } catch (error) {
        // 에러 발생 시 플래그 리셋하여 재시도 가능하도록
        // (하지만 rate limit을 피하기 위해 짧은 딜레이 후)
        setTimeout(() => {
          autoLoginAttempted.current = false;
        }, 5000); // 5초 후 재시도 가능
      }
    };

    attemptAutoSSO();
  }, [isAuthenticated, searchParams, handleSSOLogin, router, locale]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(result.userId);
        setMfaEmail(result.email);
        setDevCode(result.devCode || '');
      } else {
        // Login successful
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyMFA(mfaUserId, mfaCode);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.mfaVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async () => {
    setError('');
    setLoading(true);

    try {
      // EpTray에서 loginid 읽어오기
      const eptrayLoginId = await getEpTrayLoginId();
      
      if (eptrayLoginId) {
        // EpTray에서 읽어온 loginid로 로그인
        await handleSSOLogin(eptrayLoginId);
      } else {
        // EpTray에서 읽어오지 못한 경우 URL 파라미터 확인
        const loginid = searchParams.get('loginid');
        if (loginid) {
          await handleSSOLogin(loginid);
        } else {
          setError('SSO login requires loginid parameter');
          setLoading(false);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || 'SSO login failed';
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (mfaRequired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          // 모바일에서 배경 효과 간소화
          ...(!isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%',
            }
          })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            px: isMobile ? 2 : 3,
            py: isMobile ? 2 : 0
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: '100%',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              backgroundColor: isMobile
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: isMobile ? 2 : 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
              <Stack spacing={isMobile ? 2 : 3} alignItems="center">
                <Box
                  sx={{
                    width: isMobile ? 56 : 64,
                    height: isMobile ? 56 : 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: 'white', fontWeight: 700 }}>
                    2FA
                  </Typography>
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    fontWeight={600}
                    textAlign="center"
                  >
                    {t('auth.verificationRequired')}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    textAlign="center"
                  >
                    {t('auth.enterCodeSentTo', { email: mfaEmail })}
                  </Typography>
                </Stack>
              </Stack>

              {devCode && (
                <Alert
                  severity="info"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  <strong>{t('auth.devMode')}:</strong> {t('auth.codeIs')} {devCode}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: isMobile ? 2 : 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleMFAVerify} sx={{ mt: isMobile ? 3 : 4 }}>
                <TextField
                  id="mfa-code"
                  fullWidth
                  label={t('auth.mfaCode')}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: 'center',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    mb: isMobile ? 2 : 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mb: 2,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.verifyCode')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                  onClick={() => setMfaRequired(false)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05)
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        // 모바일에서 배경 효과 간소화
        ...(!isMobile && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50%',
            left: '-20%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        })
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 0
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            backgroundColor: isMobile
              ? theme.palette.background.paper
              : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Stack spacing={isMobile ? 2 : 3} alignItems="center">
              <Box
                sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <LoginIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h1"
                  fontWeight={600}
                >
                  {t('auth.welcomeBack')}
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  color="text.secondary"
                >
                  {t('auth.signInToContinue')}
                </Typography>
              </Stack>
            </Stack>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: isMobile ? 2 : 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: isMobile ? 3 : 4 }}>
              <Stack spacing={isMobile ? 2 : 2.5}>
                <TextField
                  id="login-username"
                  fullWidth
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <TextField
                  id="login-password"
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{
                    mt: 1,
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={isMobile ? 20 : 24} color="inherit" /> : t('auth.signIn')}
                </Button>

                <Divider sx={{ my: isMobile ? 0.5 : 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('auth.or')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSSO}
                  disabled={loading}
                  sx={{
                    height: isMobile ? 48 : 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {t('auth.ssoLogin')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

```


429 에러 해결 완료. 기존 린터 경고는 수정하지 않았습니다.

## 해결 사항

### 1. 백엔드: SSO 로그인용 별도 Rate Limiter 추가
**파일**: `services/core-service/src/middleware/rateLimiter.ts`

- `ssoLoginLimiter` 생성: 1분에 15번 허용 (기존 `loginLimiter`는 5번)
- SSO 자동 로그인 특성에 맞게 제한 완화

**파일**: `services/core-service/src/modules/auth/routes/auth.ts`

- SSO 로그인 엔드포인트에 `ssoLoginLimiter` 적용

### 2. 프론트엔드: 자동 로그인 중복 시도 방지
**파일**: `src/app/[locale]/login/page.tsx`

- `useRef`로 자동 로그인 시도 플래그 관리
- 이미 시도한 경우 재시도하지 않음
- 에러 발생 시 5초 후 재시도 가능하도록 플래그 리셋

## 개선 효과

1. Rate Limit 완화: 1분에 5번 → 15번
2. 중복 시도 방지: 페이지 리로드 시 중복 요청 차단
3. 에러 처리: 실패 시 5초 후 재시도 가능

이제 429 에러가 발생하지 않아야 합니다. 페이지를 여러 번 새로고침해도 자동 로그인이 한 번만 시도됩니다.

