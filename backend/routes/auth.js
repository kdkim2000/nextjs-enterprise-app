const express = require('express');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { generateMFACode, sendMFACode } = require('../utils/email');
const { readJSON, writeJSON } = require('../utils/fileUtils');
const path = require('path');

const router = express.Router();

const USERS_FILE = path.join(__dirname, '../data/users.json');
const MFA_CODES_FILE = path.join(__dirname, '../data/mfaCodes.json');

/**
 * Login endpoint
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      // Generate and send MFA code
      const mfaCode = generateMFACode();
      const mfaCodes = await readJSON(MFA_CODES_FILE) || [];

      // Remove old codes for this user
      const filteredCodes = mfaCodes.filter(c => c.userId !== user.id);

      // Add new code
      filteredCodes.push({
        userId: user.id,
        code: mfaCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
      });

      await writeJSON(MFA_CODES_FILE, filteredCodes);

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
    user.lastLogin = new Date().toISOString();
    await writeJSON(USERS_FILE, users);

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
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
router.post('/verify-mfa', async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: 'UserId and code required' });
    }

    const mfaCodes = await readJSON(MFA_CODES_FILE) || [];
    const mfaEntry = mfaCodes.find(c => c.userId === userId);

    if (!mfaEntry) {
      return res.status(404).json({ error: 'MFA code not found' });
    }

    if (new Date(mfaEntry.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'MFA code expired' });
    }

    if (mfaEntry.code !== code) {
      return res.status(401).json({ error: 'Invalid MFA code' });
    }

    // Get user
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.id === userId);

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
    user.lastLogin = new Date().toISOString();
    await writeJSON(USERS_FILE, users);

    // Remove used MFA code
    const filteredCodes = mfaCodes.filter(c => c.userId !== userId);
    await writeJSON(MFA_CODES_FILE, filteredCodes);

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
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
router.post('/resend-mfa', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'UserId required' });
    }

    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new code
    const mfaCode = generateMFACode();
    const mfaCodes = await readJSON(MFA_CODES_FILE) || [];

    // Remove old codes
    const filteredCodes = mfaCodes.filter(c => c.userId !== userId);

    // Add new code
    filteredCodes.push({
      userId: user.id,
      code: mfaCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    });

    await writeJSON(MFA_CODES_FILE, filteredCodes);

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
      name: 'SSO User',
      email: 'sso.user@example.com',
      role: 'user',
      department: 'IT'
    };

    const token = generateToken({
      userId: mockUser.id,
      username: mockUser.username,
      role: mockUser.role
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

    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.id === decoded.userId);

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
    // In a real application, you might want to blacklist the token
    // For this mock, we just return success

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
