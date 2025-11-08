const express = require('express');
const bcrypt = require('bcrypt');
const { authenticateToken } = require('../middleware/auth');
const { readJSON, writeJSON } = require('../utils/fileUtils');
const path = require('path');

const router = express.Router();

const PREFERENCES_FILE = path.join(__dirname, '../data/userPreferences.json');
const MENUS_FILE = path.join(__dirname, '../data/menus.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');

/**
 * Get all users with search and pagination (admin only)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = await readJSON(USERS_FILE);

    // Extract query parameters
    const {
      username,
      name,
      email,
      role,
      department,
      status,
      page = 1,
      limit = 50
    } = req.query;

    // Filter users based on search criteria
    let filteredUsers = users.filter(user => {
      if (username && !user.username.toLowerCase().includes(username.toLowerCase())) {
        return false;
      }
      if (name && !user.name.toLowerCase().includes(name.toLowerCase())) {
        return false;
      }
      if (email && !user.email.toLowerCase().includes(email.toLowerCase())) {
        return false;
      }
      if (role && user.role !== role) {
        return false;
      }
      if (department && user.department !== department) {
        return false;
      }
      if (status && user.status !== status) {
        return false;
      }
      return true;
    });

    const totalCount = filteredUsers.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const totalPages = Math.ceil(totalCount / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    // Apply pagination
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Remove password field from response
    const safeUsers = paginatedUsers.map(({ password, ...user }) => user);

    res.json({
      users: safeUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasMore: pageNum < totalPages
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * Get user preferences
 */
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const preferences = await readJSON(PREFERENCES_FILE) || [];
    const userPref = preferences.find(p => p.userId === userId);

    // Get user's MFA status
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.id === userId);

    if (!userPref) {
      return res.json({
        preferences: {
          favoriteMenus: [],
          recentMenus: [],
          language: 'en',
          theme: 'light',
          rowsPerPage: 10,
          emailNotifications: true,
          systemNotifications: true,
          sessionTimeout: 30,
          mfaEnabled: user?.mfaEnabled || false
        }
      });
    }

    res.json({
      preferences: {
        ...userPref,
        mfaEnabled: user?.mfaEnabled || false
      }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

/**
 * Get favorite menus with details
 */
router.get('/favorite-menus', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const preferences = await readJSON(PREFERENCES_FILE) || [];
    const userPref = preferences.find(p => p.userId === userId);

    if (!userPref || !userPref.favoriteMenus.length) {
      return res.json({ menus: [] });
    }

    const menus = await readJSON(MENUS_FILE);
    const favoriteMenus = userPref.favoriteMenus
      .map(menuId => menus.find(m => m.id === menuId))
      .filter(m => m !== undefined);

    res.json({ menus: favoriteMenus });
  } catch (error) {
    console.error('Get favorite menus error:', error);
    res.status(500).json({ error: 'Failed to fetch favorite menus' });
  }
});

/**
 * Get recent menus with details
 */
router.get('/recent-menus', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const preferences = await readJSON(PREFERENCES_FILE) || [];
    const userPref = preferences.find(p => p.userId === userId);

    if (!userPref || !userPref.recentMenus.length) {
      return res.json({ menus: [] });
    }

    const menus = await readJSON(MENUS_FILE);
    const recentMenus = userPref.recentMenus
      .map(menuId => menus.find(m => m.id === menuId))
      .filter(m => m !== undefined);

    res.json({ menus: recentMenus });
  } catch (error) {
    console.error('Get recent menus error:', error);
    res.status(500).json({ error: 'Failed to fetch recent menus' });
  }
});

/**
 * Get single user by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can view their own profile, admins can view any profile
    if (req.user.userId !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password field
    const { password, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * Create new user (admin only)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { username, password, name, email, role, department, status, avatarUrl } = req.body;

    if (!username || !password || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const users = await readJSON(USERS_FILE);

    // Check if username or email already exists
    if (users.some(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate new user ID
    const newId = `user-${String(users.length + 1).padStart(3, '0')}`;

    const newUser = {
      id: newId,
      username,
      password: hashedPassword,
      name,
      email,
      role: role || 'user',
      department: department || '',
      mfaEnabled: false,
      ssoEnabled: false,
      status: status || 'active',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      ...(avatarUrl && { avatarUrl })
    };

    users.push(newUser);
    await writeJSON(USERS_FILE, users);

    // Remove password from response
    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ user: safeUser });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * Update user (admin only, or user updating their own profile)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can update their own profile (limited fields), admins can update any profile
    const isSelf = req.user.userId === id;
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, email, role, department, status, avatarUrl } = req.body;
    const users = await readJSON(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check email uniqueness
    if (email && email !== users[userIndex].email) {
      if (users.some(u => u.email === email && u.id !== id)) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Update fields
    if (name) users[userIndex].name = name;
    if (email) users[userIndex].email = email;
    if (department !== undefined) users[userIndex].department = department;
    if (avatarUrl !== undefined) users[userIndex].avatarUrl = avatarUrl;

    // Only admins can change role and status
    if (isAdmin) {
      if (role) users[userIndex].role = role;
      if (status) users[userIndex].status = status;
    }

    await writeJSON(USERS_FILE, users);

    // Remove password from response
    const { password, ...safeUser } = users[userIndex];
    res.json({ user: safeUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * Delete user (admin only)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    // Prevent deleting self
    if (req.user.userId === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const users = await readJSON(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users.splice(userIndex, 1);
    await writeJSON(USERS_FILE, users);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * Update user preferences
 */
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      language,
      theme,
      rowsPerPage,
      emailNotifications,
      systemNotifications,
      sessionTimeout
    } = req.body;

    const preferences = await readJSON(PREFERENCES_FILE) || [];
    let userPref = preferences.find(p => p.userId === userId);

    if (!userPref) {
      userPref = {
        userId,
        favoriteMenus: [],
        recentMenus: [],
        language: 'en',
        theme: 'light',
        rowsPerPage: 10,
        emailNotifications: true,
        systemNotifications: true,
        sessionTimeout: 30
      };
      preferences.push(userPref);
    }

    if (language !== undefined) userPref.language = language;
    if (theme !== undefined) userPref.theme = theme;
    if (rowsPerPage !== undefined) userPref.rowsPerPage = rowsPerPage;
    if (emailNotifications !== undefined) userPref.emailNotifications = emailNotifications;
    if (systemNotifications !== undefined) userPref.systemNotifications = systemNotifications;
    if (sessionTimeout !== undefined) userPref.sessionTimeout = sessionTimeout;
    userPref.updatedAt = new Date().toISOString();

    await writeJSON(PREFERENCES_FILE, preferences);

    res.json(userPref);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

/**
 * Add menu to favorites
 */
router.post('/favorite-menus', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { menuId } = req.body;

    if (!menuId) {
      return res.status(400).json({ error: 'Menu ID required' });
    }

    const preferences = await readJSON(PREFERENCES_FILE) || [];
    let userPref = preferences.find(p => p.userId === userId);

    if (!userPref) {
      userPref = {
        userId,
        favoriteMenus: [],
        recentMenus: [],
        language: 'en',
        theme: 'light'
      };
      preferences.push(userPref);
    }

    if (!userPref.favoriteMenus.includes(menuId)) {
      userPref.favoriteMenus.push(menuId);
      userPref.updatedAt = new Date().toISOString();
      await writeJSON(PREFERENCES_FILE, preferences);
    }

    res.json({ message: 'Menu added to favorites', favoriteMenus: userPref.favoriteMenus });
  } catch (error) {
    console.error('Add favorite menu error:', error);
    res.status(500).json({ error: 'Failed to add favorite menu' });
  }
});

/**
 * Remove menu from favorites
 */
router.delete('/favorite-menus/:menuId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { menuId } = req.params;

    const preferences = await readJSON(PREFERENCES_FILE) || [];
    const userPref = preferences.find(p => p.userId === userId);

    if (!userPref) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    userPref.favoriteMenus = userPref.favoriteMenus.filter(id => id !== menuId);
    userPref.updatedAt = new Date().toISOString();

    await writeJSON(PREFERENCES_FILE, preferences);

    res.json({ message: 'Menu removed from favorites', favoriteMenus: userPref.favoriteMenus });
  } catch (error) {
    console.error('Remove favorite menu error:', error);
    res.status(500).json({ error: 'Failed to remove favorite menu' });
  }
});

/**
 * Update user profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, department, avatarUrl } = req.body;

    const users = await readJSON(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already used by another user
    if (email && email !== users[userIndex].email) {
      const emailExists = users.some(u => u.email === email && u.id !== userId);
      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    if (name) users[userIndex].name = name;
    if (email) users[userIndex].email = email;
    if (department) users[userIndex].department = department;
    if (avatarUrl !== undefined) users[userIndex].avatarUrl = avatarUrl;

    await writeJSON(USERS_FILE, users);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: users[userIndex].id,
        username: users[userIndex].username,
        name: users[userIndex].name,
        email: users[userIndex].email,
        role: users[userIndex].role,
        department: users[userIndex].department,
        avatarUrl: users[userIndex].avatarUrl
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * Change password
 */
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const users = await readJSON(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users[userIndex].password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;

    await writeJSON(USERS_FILE, users);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

/**
 * Toggle MFA
 */
router.post('/mfa-toggle', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { enabled } = req.body;

    if (enabled === undefined) {
      return res.status(400).json({ error: 'Enabled flag required' });
    }

    const users = await readJSON(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex].mfaEnabled = enabled;

    await writeJSON(USERS_FILE, users);

    res.json({
      message: enabled ? 'MFA enabled' : 'MFA disabled',
      mfaEnabled: enabled
    });
  } catch (error) {
    console.error('Toggle MFA error:', error);
    res.status(500).json({ error: 'Failed to toggle MFA' });
  }
});

module.exports = router;
