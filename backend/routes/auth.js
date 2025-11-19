const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { generateMFACode, sendMFACode } = require('../utils/email');
const { comparePassword } = require('../utils/password');
const { authLimiter, mfaLimiter } = require('../middleware/rateLimiter');
const userService = require('../services/userService');
const authService = require('../services/authService');

const router = express.Router();

/**
 * Login endpoint
 */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await userService.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password with hashed password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Check if MFA is enabled
    if (user.mfa_enabled) {
      // Generate and send MFA code
      const mfaCode = generateMFACode();

      // Delete old codes for this user
      await authService.deleteMFACodesForUser(user.id);

      // Create new MFA code
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await authService.createMFACode(user.id, mfaCode, expiresAt);

      const emailResult = await sendMFACode(user.email, mfaCode);

      return res.json({
        mfaRequired: true,
        userId: user.id,
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
        devCode: emailResult.devCode // Only in development
      });
    }

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user.id
    });

    // Update last login
    await userService.updateLastLogin(user.id);

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * Verify MFA code
 */
router.post('/verify-mfa', mfaLimiter, async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: 'UserId and code required' });
    }

    const mfaEntry = await authService.verifyMFACode(userId, code);

    if (!mfaEntry) {
      return res.status(401).json({ error: 'Invalid or expired MFA code' });
    }

    // Get user
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user.id
    });

    // Update last login
    await userService.updateLastLogin(user.id);

    // Mark MFA code as used
    await authService.markMFACodeAsUsed(mfaEntry.id);

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        department: user.department
      }
    });
  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({ error: 'MFA verification failed' });
  }
});

/**
 * Resend MFA code
 */
router.post('/resend-mfa', mfaLimiter, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'UserId required' });
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new code
    const mfaCode = generateMFACode();

    // Delete old codes
    await authService.deleteMFACodesForUser(userId);

    // Create new MFA code
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await authService.createMFACode(userId, mfaCode, expiresAt);

    const emailResult = await sendMFACode(user.email, mfaCode);

    res.json({
      message: 'MFA code sent',
      devCode: emailResult.devCode
    });
  } catch (error) {
    console.error('Resend MFA error:', error);
    res.status(500).json({ error: 'Failed to resend MFA code' });
  }
});

/**
 * SSO login (placeholder - will be implemented later)
 */
router.post('/sso', async (req, res) => {
  try {
    // For now, just return a mock successful login
    // In production, integrate with your SSO provider (SAML, OAuth, etc.)

    const mockUser = {
      id: 'sso-user-001',
      username: 'sso.user',
      firstName: 'SSO',
      lastName: 'User',
      email: 'sso.user@example.com',
      department: 'IT'
    };

    const token = generateToken({
      userId: mockUser.id,
      username: mockUser.username,
      role: 'user'
    });

    const refreshToken = generateRefreshToken({
      userId: mockUser.id
    });

    res.json({
      token,
      refreshToken,
      user: mockUser,
      message: 'SSO authentication successful (mock)'
    });
  } catch (error) {
    console.error('SSO error:', error);
    res.status(500).json({ error: 'SSO authentication failed' });
  }
});

/**
 * Refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await userService.getUserById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new access token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    });

    res.json({ token });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

/**
 * Logout
 */
router.post('/logout', async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Decode token to get expiration time and user ID
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
          // Add token to blacklist with expiration time
          const expiresAt = new Date(decoded.exp * 1000); // Convert to milliseconds
          await authService.addToBlacklist(token, decoded.userId, expiresAt);
          console.log('Token blacklisted on logout');
        }
      } catch (decodeError) {
        console.error('Error decoding token for blacklist:', decodeError);
        // Continue with logout even if blacklisting fails
      }
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
