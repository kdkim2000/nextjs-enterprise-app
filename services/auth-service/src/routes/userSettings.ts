/**
 * User Settings Routes
 */

import { Router, Request, Response } from 'express';
import { getLogger } from '@enterprise/shared';
import { authenticateToken } from '../middleware/authMiddleware';
import * as userSettingsService from '../services/userSettingsService';

const router = Router();
const logger = getLogger('auth-service:user-settings');

const { DEFAULT_SETTINGS, mergeWithDefaults, formatSettings } = userSettingsService;

/**
 * GET /auth/user-settings - Get current user's settings
 */
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    let userSettings = await userSettingsService.getUserPreferences(userId);

    // If user settings don't exist, create default settings
    if (!userSettings) {
      userSettings = await userSettingsService.createUserPreferences({
        userId,
        preferences: DEFAULT_SETTINGS
      });
    }

    const formattedSettings = formatSettings(userSettings);

    res.json({ settings: formattedSettings });
  } catch (error: any) {
    logger.error('Get user settings error:', error);
    res.status(500).json({ error: 'Failed to fetch user settings' });
  }
});

/**
 * PUT /auth/user-settings - Update current user's settings (partial or full update)
 * Body: { general?, appearance?, notifications?, dataGrid?, privacy?, advanced? }
 */
router.put('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const updates = req.body;

    let userSettings = await userSettingsService.getUserPreferences(userId);

    let newPreferences;

    if (!userSettings) {
      // Create new settings if not exists
      newPreferences = { ...DEFAULT_SETTINGS, ...updates };
      userSettings = await userSettingsService.createUserPreferences({
        userId,
        preferences: newPreferences
      });
    } else {
      // Update existing settings (deep merge)
      const currentPrefs = userSettings.preferences || DEFAULT_SETTINGS;
      newPreferences = mergeWithDefaults(currentPrefs, updates);

      userSettings = await userSettingsService.updateUserPreferences(userId, {
        preferences: newPreferences
      });
    }

    const formattedSettings = formatSettings(userSettings);

    res.json({
      message: 'Settings updated successfully',
      settings: formattedSettings
    });
  } catch (error: any) {
    logger.error('Update user settings error:', error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
});

/**
 * PATCH /auth/user-settings/:section - Update a specific section of user settings
 * Sections: general, appearance, notifications, dataGrid, privacy, advanced
 */
router.patch('/:section', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const section = req.params.section;
    const sectionUpdates = req.body;

    const validSections = ['general', 'appearance', 'notifications', 'dataGrid', 'privacy', 'advanced'];

    if (!validSections.includes(section)) {
      res.status(400).json({
        error: `Invalid section. Must be one of: ${validSections.join(', ')}`
      });
      return;
    }

    let userSettings = await userSettingsService.getUserPreferences(userId);

    let newPreferences;

    if (!userSettings) {
      // Create new settings if not exists
      newPreferences = {
        ...DEFAULT_SETTINGS,
        [section]: { ...(DEFAULT_SETTINGS as any)[section], ...sectionUpdates }
      };
      userSettings = await userSettingsService.createUserPreferences({
        userId,
        preferences: newPreferences
      });
    } else {
      // Update existing settings
      const currentPrefs = userSettings.preferences || DEFAULT_SETTINGS;
      newPreferences = {
        ...currentPrefs,
        [section]: { ...currentPrefs[section], ...sectionUpdates }
      };

      userSettings = await userSettingsService.updateUserPreferences(userId, {
        preferences: newPreferences
      });
    }

    const formattedSettings = formatSettings(userSettings);

    res.json({
      message: `${section} settings updated successfully`,
      settings: formattedSettings
    });
  } catch (error: any) {
    logger.error('Update user settings section error:', error);
    res.status(500).json({ error: 'Failed to update user settings section' });
  }
});

/**
 * POST /auth/user-settings/reset - Reset user settings to default
 */
router.post('/reset', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    let userSettings = await userSettingsService.updateUserPreferences(userId, {
      preferences: DEFAULT_SETTINGS
    });

    if (!userSettings) {
      // Create if doesn't exist
      userSettings = await userSettingsService.createUserPreferences({
        userId,
        preferences: DEFAULT_SETTINGS
      });
    }

    const formattedSettings = formatSettings(userSettings);

    res.json({
      message: 'Settings reset to default successfully',
      settings: formattedSettings
    });
  } catch (error: any) {
    logger.error('Reset user settings error:', error);
    res.status(500).json({ error: 'Failed to reset user settings' });
  }
});

/**
 * GET /auth/user-settings/all - Get all users' settings (admin only)
 */
router.get('/all', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const allSettings = await userSettingsService.getAllUserPreferences();

    // Format all settings
    const formattedSettings = allSettings.map(s => formatSettings(s));

    res.json({ settings: formattedSettings });
  } catch (error: any) {
    logger.error('Get all user settings error:', error);
    res.status(500).json({ error: 'Failed to fetch all user settings' });
  }
});

/**
 * GET /auth/user-settings/user/:userId - Get specific user's settings (admin only)
 */
router.get('/user/:userId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { userId } = req.params;
    const userSettings = await userSettingsService.getUserPreferences(userId);

    if (!userSettings) {
      res.status(404).json({ error: 'User settings not found' });
      return;
    }

    const formattedSettings = formatSettings(userSettings);

    res.json({ settings: formattedSettings });
  } catch (error: any) {
    logger.error('Get user settings by userId error:', error);
    res.status(500).json({ error: 'Failed to fetch user settings' });
  }
});

export default router;
