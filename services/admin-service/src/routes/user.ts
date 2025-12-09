/**
 * User Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getLogger } from '@enterprise/shared';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import * as userService from '../services/userService';
import * as menuService from '../services/menuService';
import * as preferencesService from '../services/preferencesService';
import * as permissionService from '../services/permissionService';
import { transformMultiLangFields } from '../utils/multiLangTransform';

const router = Router();
const logger = getLogger('admin-service:user-routes');

// Helper function to transform database menu to API format
function transformMenuToAPI(dbMenu: any): any {
  if (!dbMenu) return null;

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
 * GET /admin/users/preferences - Get user preferences
 */
router.get('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_002',
          message: 'Invalid access token - userId missing',
        }
      });
    }

    // Get user's MFA status
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RES_101',
          message: 'User not found',
        }
      });
    }

    // Get preferences from database
    let preferences = await preferencesService.getUserPreferences(userId);

    if (!preferences) {
      return res.json({
        success: true,
        preferences: {
          favoriteMenus: [],
          recentMenus: [],
          language: 'en',
          theme: 'light',
          rowsPerPage: 10,
          emailNotifications: true,
          systemNotifications: true,
          sessionTimeout: 30,
          mfaEnabled: user.mfa_enabled || false
        }
      });
    }

    const apiPreferences = {
      favoriteMenus: preferences.favorite_menus || [],
      recentMenus: preferences.recent_menus || [],
      language: preferences.language || 'en',
      theme: preferences.theme || 'light',
      rowsPerPage: preferences.rows_per_page || 10,
      emailNotifications: preferences.email_notifications !== false,
      systemNotifications: preferences.system_notifications !== false,
      sessionTimeout: preferences.session_timeout || 30,
      mfaEnabled: user.mfa_enabled || false
    };

    res.json({
      success: true,
      preferences: apiPreferences
    });
  } catch (error: any) {
    logger.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

/**
 * PUT /admin/users/preferences - Update user preferences
 */
router.put('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

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

    const updateData: any = { userId };

    if (language !== undefined) updateData.language = language;
    if (theme !== undefined) updateData.theme = theme;
    if (rowsPerPage !== undefined) updateData.rowsPerPage = rowsPerPage;
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (systemNotifications !== undefined) updateData.systemNotifications = systemNotifications;
    if (sessionTimeout !== undefined) updateData.sessionTimeout = sessionTimeout;
    if (favoriteMenus !== undefined) updateData.favoriteMenus = favoriteMenus;
    if (recentMenus !== undefined) updateData.recentMenus = recentMenus;

    const updated = await preferencesService.createUserPreferences(updateData);

    res.json(updated);
  } catch (error: any) {
    logger.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

/**
 * GET /admin/users/favorite-menus - Get favorite menus with details
 */
router.get('/favorite-menus', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const preferences = await preferencesService.getUserPreferences(userId);

    const favoriteMenuIds = preferences?.favorite_menus || [];

    if (!favoriteMenuIds.length) {
      return res.json({ menus: [] });
    }

    const allMenus = await menuService.getAllMenus({});
    const favoriteMenus = allMenus
      .filter(m => favoriteMenuIds.includes(m.id))
      .map(transformMenuToAPI);

    res.json({ menus: favoriteMenus });
  } catch (error: any) {
    logger.error('Get favorite menus error:', error);
    res.status(500).json({ error: 'Failed to fetch favorite menus' });
  }
});

/**
 * POST /admin/users/favorite-menus - Add menu to favorites
 */
router.post('/favorite-menus', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

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
  } catch (error: any) {
    logger.error('Add favorite menu error:', error);
    res.status(500).json({ error: 'Failed to add favorite menu' });
  }
});

/**
 * DELETE /admin/users/favorite-menus/:menuId - Remove menu from favorites
 */
router.delete('/favorite-menus/:menuId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { menuId } = req.params;

    const preferences = await preferencesService.getUserPreferences(userId);
    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    const favoriteMenus = (preferences.favorite_menus || []).filter((id: string) => id !== menuId);

    await preferencesService.createUserPreferences({
      userId,
      favoriteMenus
    });

    res.json({ message: 'Menu removed from favorites', favoriteMenus });
  } catch (error: any) {
    logger.error('Remove favorite menu error:', error);
    res.status(500).json({ error: 'Failed to remove favorite menu' });
  }
});

/**
 * GET /admin/users/recent-menus - Get recent menus with details
 */
router.get('/recent-menus', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const preferences = await preferencesService.getUserPreferences(userId);

    const recentMenuIds = preferences?.recent_menus || [];

    if (!recentMenuIds.length) {
      return res.json({ menus: [] });
    }

    const allMenus = await menuService.getAllMenus({});
    const recentMenus = allMenus
      .filter(m => recentMenuIds.includes(m.id))
      .map(transformMenuToAPI);

    res.json({ menus: recentMenus });
  } catch (error: any) {
    logger.error('Get recent menus error:', error);
    res.status(500).json({ error: 'Failed to fetch recent menus' });
  }
});

/**
 * GET /admin/users/permissions - Get user's program permissions
 */
router.get('/permissions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const accessiblePrograms = await permissionService.getUserAccessiblePrograms(userId);

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
  } catch (error: any) {
    logger.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to get permissions' });
  }
});

/**
 * PUT /admin/users/profile - Update current user's profile
 */
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { name_ko, name_en, email, department, phone_number, mobile_number, avatar_url, avatar_image } = req.body;

    // Check email uniqueness
    if (email) {
      if (await userService.emailExists(email, userId)) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updates: any = {};
    if (name_ko !== undefined) updates.name_ko = name_ko;
    if (name_en !== undefined) updates.name_en = name_en;
    if (email !== undefined) updates.email = email;
    if (department !== undefined) updates.department = department;
    if (phone_number !== undefined) updates.phone_number = phone_number;
    if (mobile_number !== undefined) updates.mobile_number = mobile_number;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (avatar_image !== undefined) updates.avatar_image = avatar_image;

    const updatedUser = await userService.updateUser(userId, updates);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, mfa_enabled, sso_enabled, avatar_url: dbAvatarUrl, avatar_image: dbAvatarImage, last_login, created_at, updated_at, ...rest } = updatedUser;
    const safeUser = {
      ...rest,
      mfaEnabled: mfa_enabled,
      ssoEnabled: sso_enabled,
      avatarUrl: dbAvatarUrl,
      avatar_image: dbAvatarImage,
      lastLogin: last_login,
      createdAt: created_at,
      updatedAt: updated_at
    };

    res.json({ user: safeUser });
  } catch (error: any) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /admin/users - Get all users with pagination
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
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
      page = '1',
      limit = '50'
    } = req.query;

    // Handle department as array
    const departments = req.query.department
      ? (Array.isArray(req.query.department) ? req.query.department as string[] : [req.query.department as string])
      : [];

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const users = await userService.getAllUsers({
      search: search as string,
      loginid: loginid as string,
      name_ko: name_ko as string,
      name_en: name_en as string,
      email: email as string,
      employee_number: employee_number as string,
      phone_number: phone_number as string,
      mobile_number: mobile_number as string,
      user_category: user_category as string,
      position: position as string,
      role: role as string,
      status: status as string,
      departments,
      limit: limitNum,
      offset
    });

    const totalCount = await userService.getUserCount({
      search: search as string,
      status: status as string,
      role: role as string,
      departments
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    // Remove password and transform response
    const safeUsers = users.map(({ password, mfa_enabled, sso_enabled, avatar_url, avatar_image, last_login, created_at, updated_at, ...rest }) => ({
      ...rest,
      mfaEnabled: mfa_enabled,
      ssoEnabled: sso_enabled,
      avatarUrl: avatar_url,
      avatar_image,
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
  } catch (error: any) {
    logger.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /admin/users/all - Get all users for dropdown
 */
router.get('/all', authenticateToken, async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers({ limit: 100000, offset: 0 });

    const simpleUsers = users.map(({ id, loginid, name_ko, name_en }) => ({
      id,
      username: loginid,
      name: name_ko || name_en || loginid
    }));

    res.json({ users: simpleUsers });
  } catch (error: any) {
    logger.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch all users' });
  }
});

/**
 * GET /admin/users/:id - Get single user by ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, mfa_enabled, sso_enabled, avatar_url, avatar_image, last_login, created_at, updated_at, ...rest } = user;
    const safeUser = {
      ...rest,
      mfaEnabled: mfa_enabled,
      ssoEnabled: sso_enabled,
      avatarUrl: avatar_url,
      avatar_image,
      lastLogin: last_login,
      createdAt: created_at,
      updatedAt: updated_at
    };

    res.json({ user: safeUser });
  } catch (error: any) {
    logger.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * POST /admin/users - Create new user
 */
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      loginid,
      password,
      name_ko,
      name_en,
      email,
      role,
      department,
      status,
      avatar_url,
      avatar_image,
      employee_number,
      phone_number,
      mobile_number,
      user_category,
      position
    } = req.body;

    if (!loginid || !password || !name_ko || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if loginid or email already exists
    if (await userService.loginidExists(loginid)) {
      return res.status(400).json({ error: 'Login ID already exists' });
    }
    if (await userService.emailExists(email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userService.createUser({
      id: uuidv4(),
      loginid,
      password: hashedPassword,
      name_ko,
      name_en: name_en || '',
      email,
      employee_number: employee_number || '',
      phone_number: phone_number || '',
      mobile_number: mobile_number || '',
      user_category: user_category || 'regular',
      position: position || '',
      department: department || '',
      status: status || 'active',
      avatar_url,
      avatar_image
    });

    const { password: _, mfa_enabled, sso_enabled, avatar_url: dbAvatarUrl, avatar_image: dbAvatarImage, ...rest } = newUser;
    const safeUser = {
      ...rest,
      mfaEnabled: mfa_enabled,
      ssoEnabled: sso_enabled,
      avatarUrl: dbAvatarUrl,
      avatar_image: dbAvatarImage
    };

    logger.info(`User created: ${loginid}`);
    res.status(201).json({ user: safeUser });
  } catch (error: any) {
    logger.error('Create user error:', error);

    if (error.code === '23505') {
      const detail = error.detail || '';
      if (detail.includes('loginid')) {
        return res.status(400).json({ error: 'Login ID already exists' });
      }
      if (detail.includes('email')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(400).json({ error: 'Duplicate value exists' });
    }

    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * PUT /admin/users/:id - Update user
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isSelf = req.user?.userId === id;
    const isAdmin = req.user?.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Update permission required' });
    }

    const { name_ko, name_en, email, role, department, status, avatar_url, avatar_image, mfaEnabled, ssoEnabled } = req.body;

    // Check email uniqueness
    if (email) {
      if (await userService.emailExists(email, id)) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updates: any = {};
    if (name_ko !== undefined) updates.name_ko = name_ko;
    if (name_en !== undefined) updates.name_en = name_en;
    if (email !== undefined) updates.email = email;
    if (department !== undefined) updates.department = department;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (avatar_image !== undefined) updates.avatar_image = avatar_image;

    // Only admins can change role, status, and security settings
    if (isAdmin && !isSelf) {
      if (role !== undefined) updates.role = role;
      if (status !== undefined) updates.status = status;
      if (mfaEnabled !== undefined) updates.mfa_enabled = mfaEnabled;
      if (ssoEnabled !== undefined) updates.sso_enabled = ssoEnabled;
    }

    const updatedUser = await userService.updateUser(id, updates);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, mfa_enabled, sso_enabled, avatar_url: dbAvatarUrl, avatar_image: dbAvatarImage, ...rest } = updatedUser;
    const safeUser = {
      ...rest,
      mfaEnabled: mfa_enabled,
      ssoEnabled: sso_enabled,
      avatarUrl: dbAvatarUrl,
      avatar_image: dbAvatarImage
    };

    res.json({ user: safeUser });
  } catch (error: any) {
    logger.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * DELETE /admin/users/:id - Delete user
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user?.userId === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    logger.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * POST /admin/users/:id/reset-password - Reset user password (Admin only)
 */
router.post('/:id/reset-password', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (req.user?.userId === id) {
      return res.status(400).json({ error: 'Cannot reset your own password. Use change-password endpoint instead.' });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userService.updateUser(id, { password: hashedPassword });

    logger.info(`Password reset for user: ${user.loginid}`);
    res.json({
      message: 'Password reset successfully',
      user: {
        id: user.id,
        loginid: user.loginid,
        email: user.email
      }
    });
  } catch (error: any) {
    logger.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
