const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { requireProgramAccess, requirePermission } = require('../middleware/permissionMiddleware');
const userService = require('../services/userService');
const preferencesService = require('../services/preferencesService');
const menuService = require('../services/menuService');
const { transformMultiLangFields } = require('../utils/multiLangTransform');

const router = express.Router();

// Helper function to transform database menu to API format
function transformMenuToAPI(dbMenu) {
  if (!dbMenu) return null;

  // Transform multilingual fields
  const transformed = transformMultiLangFields(dbMenu, ['name', 'description']);

  return {
    id: transformed.id,
    code: transformed.code,
    name: transformed.name,
    path: transformed.path,
    icon: transformed.icon,
    order: transformed.order || 0,
    parentId: transformed.parent_id,
    level: transformed.level || 0,
    programId: transformed.program_id,
    description: transformed.description
  };
}

/**
 * Get all users with search and pagination
 */
router.get('/', authenticateToken, requireProgramAccess('PROG-USER-LIST'), async (req, res) => {
  try {
    const {
      loginid,
      username,
      name_ko,
      name_en,
      name,
      email,
      employee_number,
      phone_number,
      mobile_number,
      user_category,
      position,
      role,
      status,
      page = 1,
      limit = 50
    } = req.query;

    // Handle department as array
    const departments = req.query.department
      ? (Array.isArray(req.query.department) ? req.query.department : [req.query.department])
      : [];

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build search string (backward compatible with single search field)
    // If specific fields are provided, combine them for search
    const searchTerms = [loginid, username, name_ko, name_en, name, email, employee_number, phone_number, mobile_number, position].filter(Boolean);
    const search = searchTerms.length > 0 ? searchTerms[0] : null; // For now, use first non-empty term

    // Get users from database
    const users = await userService.getAllUsers({
      search,
      loginid,
      name_ko,
      name_en,
      email,
      employee_number,
      phone_number,
      mobile_number,
      user_category,
      position,
      role,
      status,
      departments, // Pass array of department IDs
      limit: limitNum,
      offset
    });

    // Get total count for pagination
    const totalCount = await userService.getUserCount({
      search,
      loginid,
      name_ko,
      name_en,
      email,
      employee_number,
      phone_number,
      mobile_number,
      user_category,
      position,
      role,
      status,
      departments // Pass array of department IDs
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    // Remove password field and convert snake_case to camelCase for response
    const safeUsers = users.map(({ password, name, mfa_enabled, sso_enabled, avatar_url, avatar_image, last_login, created_at, updated_at, ...rest }) => ({
      ...rest,
      name,
      mfaEnabled: mfa_enabled,
      ssoEnabled: sso_enabled,
      avatarUrl: avatar_url,
      avatar_image: avatar_image, // Include base64 avatar image from DB
      lastLogin: last_login,
      createdAt: created_at,
      updatedAt: updated_at
    }));

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
 * Get all users for dropdown (simplified list without pagination)
 */
router.get('/all', authenticateToken, requireProgramAccess('PROG-USER-LIST'), async (req, res) => {
  try {
    // Get all users with only essential fields (id, username, name)
    const users = await userService.getAllUsers({
      limit: 100000,  // Large limit to get all users
      offset: 0
    });

    // Return only essential fields for dropdown
    // Use name_ko as default name (database has name_ko and name_en, not name)
    const simpleUsers = users.map(({ id, username, name_ko, name_en }) => ({
      id,
      username,
      name: name_ko || name_en || username  // Prefer Korean name, fallback to English or username
    }));

    res.json({
      users: simpleUsers
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch all users' });
  }
});

/**
 * Get user preferences
 */
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get preferences from database
    let preferences = await preferencesService.getUserPreferences(userId);

    // Get user's MFA status
    const user = await userService.getUserById(userId);

    if (!preferences) {
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
          mfaEnabled: user?.mfa_enabled || false
        }
      });
    }

    // Convert DB format to API format
    const apiPreferences = {
      favoriteMenus: preferences.favorite_menus || [],
      recentMenus: preferences.recent_menus || [],
      language: preferences.language || 'en',
      theme: preferences.theme || 'light',
      rowsPerPage: preferences.rows_per_page || 10,
      emailNotifications: preferences.email_notifications !== false,
      systemNotifications: preferences.system_notifications !== false,
      sessionTimeout: preferences.session_timeout || 30,
      mfaEnabled: user?.mfa_enabled || false
    };

    res.json({ preferences: apiPreferences });
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
    const preferences = await preferencesService.getUserPreferences(userId);

    const favoriteMenuIds = preferences?.favorite_menus || [];

    if (!favoriteMenuIds.length) {
      return res.json({ menus: [] });
    }

    // Get all menus and filter favorites
    const allMenus = await menuService.getAllMenus();
    const favoriteMenus = allMenus
      .filter(m => favoriteMenuIds.includes(m.id))
      .map(transformMenuToAPI); // Transform to API format with proper name structure

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
    const preferences = await preferencesService.getUserPreferences(userId);

    const recentMenuIds = preferences?.recent_menus || [];

    if (!recentMenuIds.length) {
      return res.json({ menus: [] });
    }

    // Get all menus and filter recents
    const allMenus = await menuService.getAllMenus();
    const recentMenus = allMenus
      .filter(m => recentMenuIds.includes(m.id))
      .map(transformMenuToAPI); // Transform to API format with proper name structure

    res.json({ menus: recentMenus });
  } catch (error) {
    console.error('Get recent menus error:', error);
    res.status(500).json({ error: 'Failed to fetch recent menus' });
  }
});

/**
 * Get user's program permissions
 */
router.get('/permissions', authenticateToken, async (req, res) => {
  try {
    const { getUserAccessibleProgramsAsync } = require('../middleware/permissionMiddleware');

    const userId = req.user.userId;
    const accessiblePrograms = await getUserAccessibleProgramsAsync(userId);

    const permissions = accessiblePrograms.map(program => ({
      programCode: program.code,
      programId: program.id,
      programName: program.name,
      canView: program.permissions.canView,
      canCreate: program.permissions.canCreate,
      canUpdate: program.permissions.canUpdate,
      canDelete: program.permissions.canDelete
    }));

    res.json({ permissions });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to get permissions' });
  }
});

/**
 * Get single user by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can view their own profile without permission check
    if (req.user.userId !== id) {
      const { getUserProgramPermissions } = require('../middleware/permissionMiddleware');
      const permissions = getUserProgramPermissions(req.user.userId, 'PROG-USER-LIST');
      if (!permissions.hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Convert DB format to API format
    const { password, name, mfa_enabled, sso_enabled, avatar_url, avatar_image, last_login, created_at, updated_at, ...rest } = user;
    const safeUser = {
      ...rest,
      name,
      mfaEnabled: mfa_enabled,
      ssoEnabled: sso_enabled,
      avatarUrl: avatar_url,
      avatar_image: avatar_image, // Include base64 avatar image from DB
      lastLogin: last_login,
      createdAt: created_at,
      updatedAt: updated_at
    };

    res.json({ user: safeUser });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * Create new user
 */
router.post('/', authenticateToken, requirePermission('PROG-USER-LIST', 'create'), async (req, res) => {
  try {
    const { username, password, name, email, role, department, status, avatarUrl, avatar_image } = req.body;

    if (!username || !password || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if username or email already exists
    if (await userService.usernameExists(username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    if (await userService.emailExists(email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const newUser = await userService.createUser({
      id: uuidv4(),
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email,
      department: department || '',
      status: status || 'active',
      mfaEnabled: false,
      profileImage: avatarUrl,
      avatar_image: avatar_image
    });

    // Convert to API format
    const { password: _, name: userName, mfa_enabled, sso_enabled, avatar_url, avatar_image: dbAvatarImage, ...rest } = newUser;
    const safeUser = {
      ...rest,
      name: userName,
      mfaEnabled: mfa_enabled,
      ssoEnabled: sso_enabled,
      avatarUrl: avatar_url,
      avatar_image: dbAvatarImage
    };

    res.status(201).json({ user: safeUser });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
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
      sessionTimeout,
      favoriteMenus,
      recentMenus
    } = req.body;

    // Get existing preferences
    let preferences = await preferencesService.getUserPreferences(userId);

    // Prepare update data - only include fields that are provided
    const updateData = {
      userId
    };

    if (language !== undefined) updateData.language = language;
    if (theme !== undefined) updateData.theme = theme;
    if (rowsPerPage !== undefined) updateData.rowsPerPage = rowsPerPage;
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (systemNotifications !== undefined) updateData.systemNotifications = systemNotifications;
    if (sessionTimeout !== undefined) updateData.sessionTimeout = sessionTimeout;
    if (favoriteMenus !== undefined) updateData.favoriteMenus = favoriteMenus;
    if (recentMenus !== undefined) updateData.recentMenus = recentMenus;

    // Update preferences
    const updated = await preferencesService.createUserPreferences(updateData);

    res.json(updated);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

/**
 * Update user
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isSelf = req.user.userId === id;

    if (!isSelf) {
      const { getUserProgramPermissions } = require('../middleware/permissionMiddleware');
      const permissions = getUserProgramPermissions(req.user.userId, 'PROG-USER-LIST');
      if (!permissions.canUpdate) {
        return res.status(403).json({ error: 'Update permission required' });
      }
    }

    const { name, email, role, department, status, avatarUrl, avatar_image } = req.body;

    // Check email uniqueness
    if (email) {
      if (await userService.emailExists(email, id)) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Prepare updates
    const updates = {};
    if (name) {
      const nameParts = name.trim().split(' ');
      updates.firstName = nameParts[0];
      updates.lastName = nameParts.slice(1).join(' ') || '';
    }
    if (email) updates.email = email;
    if (department !== undefined) updates.department = department;
    if (avatarUrl !== undefined) updates.profileImage = avatarUrl;
    if (avatar_image !== undefined) updates.avatar_image = avatar_image;

    // Only admins can change role and status
    if (!isSelf) {
      if (role) updates.role = role;
      if (status) updates.status = status;
    }

    const updatedUser = await userService.updateUser(id, updates);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Convert to API format
    const { password, name: userName, mfa_enabled, sso_enabled, avatar_url, avatar_image: dbAvatarImage, ...rest } = updatedUser;
    const safeUser = {
      ...rest,
      name: userName,
      mfaEnabled: mfa_enabled,
      ssoEnabled: sso_enabled,
      avatarUrl: avatar_url,
      avatar_image: dbAvatarImage
    };

    res.json({ user: safeUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * Delete user
 */
router.delete('/:id', authenticateToken, requirePermission('PROG-USER-LIST', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.userId === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
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

    let preferences = await preferencesService.getUserPreferences(userId);
    const favoriteMenus = preferences?.favorite_menus || [];

    if (!favoriteMenus.includes(menuId)) {
      favoriteMenus.push(menuId);
      await preferencesService.createUserPreferences({
        userId,
        favoriteMenus
      });
    }

    res.json({ message: 'Menu added to favorites', favoriteMenus });
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

    const preferences = await preferencesService.getUserPreferences(userId);
    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    const favoriteMenus = (preferences.favorite_menus || []).filter(id => id !== menuId);

    await preferencesService.createUserPreferences({
      userId,
      favoriteMenus
    });

    res.json({ message: 'Menu removed from favorites', favoriteMenus });
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
    const {
      name,
      email,
      department,
      avatarUrl,
      name_ko,
      name_en,
      employee_number,
      phone_number,
      mobile_number,
      user_category,
      position,
      avatar_image
    } = req.body;

    if (email && await userService.emailExists(email, userId)) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const updates = {};
    if (name) {
      const nameParts = name.trim().split(' ');
      updates.firstName = nameParts[0];
      updates.lastName = nameParts.slice(1).join(' ') || '';
    }
    if (email !== undefined) updates.email = email;
    if (department !== undefined) updates.department = department;
    if (avatarUrl !== undefined) updates.profileImage = avatarUrl;
    if (name_ko !== undefined) updates.name_ko = name_ko;
    if (name_en !== undefined) updates.name_en = name_en;
    if (employee_number !== undefined) updates.employee_number = employee_number;
    if (phone_number !== undefined) updates.phone_number = phone_number;
    if (mobile_number !== undefined) updates.mobile_number = mobile_number;
    if (user_category !== undefined) updates.user_category = user_category;
    if (position !== undefined) updates.position = position;
    if (avatar_image !== undefined) updates.avatar_image = avatar_image;

    const updatedUser = await userService.updateUser(userId, updates);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        loginid: updatedUser.loginid,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        avatarUrl: updatedUser.avatar_url,
        name_ko: updatedUser.name_ko,
        name_en: updatedUser.name_en,
        employee_number: updatedUser.employee_number,
        phone_number: updatedUser.phone_number,
        mobile_number: updatedUser.mobile_number,
        user_category: updatedUser.user_category,
        position: updatedUser.position,
        avatar_image: updatedUser.avatar_image
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

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userService.updateUser(userId, { password: hashedPassword });

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

    await userService.updateUser(userId, { mfaEnabled: enabled });

    res.json({
      message: enabled ? 'MFA enabled' : 'MFA disabled',
      mfaEnabled: enabled
    });
  } catch (error) {
    console.error('Toggle MFA error:', error);
    res.status(500).json({ error: 'Failed to toggle MFA' });
  }
});

/**
 * Reset user password (Admin only)
 */
router.post('/:id/reset-password', authenticateToken, requirePermission('PROG-USER-LIST', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    console.log('[Reset Password] Request:', {
      requestUserId: req.user?.userId,
      targetUserId: id,
      requestUserType: typeof req.user?.userId,
      targetUserType: typeof id,
      hasNewPassword: !!newPassword,
      newPasswordLength: newPassword?.length
    });

    if (req.user.userId === id) {
      console.log('[Reset Password] Rejected: Cannot reset own password');
      return res.status(400).json({ error: 'Cannot reset your own password. Use change-password endpoint instead.' });
    }

    if (!newPassword || newPassword.length < 8) {
      console.log('[Reset Password] Rejected: Password too short or missing');
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userService.updateUser(id, { password: hashedPassword });

    res.json({
      message: 'Password reset successfully',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
