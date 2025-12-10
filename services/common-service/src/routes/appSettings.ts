/**
 * App Settings Routes
 */

import { Router, Request, Response } from 'express';
import * as appSettingsService from '../services/appSettingsService';
import { authenticateToken } from '../middleware';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('common-service:routes:appSettings');

/**
 * GET /app-settings/public - Get public settings (no authentication required)
 */
router.get('/public', async (_req: Request, res: Response): Promise<void> => {
  try {
    // Define public setting keys (safe to expose without authentication)
    const publicKeys = [
      // Basic info
      'app_name_en', 'app_name_ko', 'app_name_zh', 'app_name_vi',
      'app_description_en', 'app_description_ko', 'app_description_zh', 'app_description_vi',
      'app_logo', 'app_logo_dark', 'favicon', 'app_version', 'copyright_text',
      // Organization
      'company_name', 'company_address', 'company_phone', 'company_email',
      'support_email', 'privacy_policy_url', 'terms_of_service_url',
      // Branding
      'primary_color', 'secondary_color', 'default_theme', 'login_background',
      // Localization
      'default_language', 'supported_languages',
      // Feature flags
      'feature_chat_enabled', 'feature_board_enabled', 'feature_report_enabled', 'feature_beta_enabled',
      // Operations (public parts)
      'maintenance_mode', 'maintenance_message_en', 'maintenance_message_ko',
      'maintenance_message_zh', 'maintenance_message_vi', 'maintenance_end_time'
    ];

    // Get only settings that are both ready AND applied
    const allAppliedSettings = await appSettingsService.getAppliedSettingsMap();

    // Filter to only public keys
    const publicSettings: Record<string, any> = {};
    for (const key of publicKeys) {
      if (allAppliedSettings[key] !== undefined) {
        publicSettings[key] = allAppliedSettings[key];
      }
    }

    res.json({ settings: publicSettings });
  } catch (error: any) {
    logger.error('Get public settings error:', error);
    res.status(500).json({ error: 'Failed to fetch public settings' });
  }
});

/**
 * GET /app-settings - Get all settings with optional filtering
 */
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, isReady, isApplied, search, page = '1', limit = '100' } = req.query;

    const options: any = {
      category: category as string,
      search: search as string
    };

    // Parse isReady as boolean if provided
    if (isReady !== undefined) {
      options.isReady = isReady === 'true';
    }

    // Parse isApplied as boolean if provided
    if (isApplied !== undefined) {
      options.isApplied = isApplied === 'true';
    }

    const settings = await appSettingsService.getAllSettings(options);
    const totalCount = await appSettingsService.getSettingsCount(options);

    res.json({
      settings,
      pagination: {
        currentPage: parseInt(page as string),
        pageSize: parseInt(limit as string),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    logger.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * GET /app-settings/grouped - Get settings grouped by category
 */
router.get('/grouped', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { isReady, isApplied } = req.query;

    const options: any = {};
    if (isReady !== undefined) {
      options.isReady = isReady === 'true';
    }
    if (isApplied !== undefined) {
      options.isApplied = isApplied === 'true';
    }

    const groupedSettings = await appSettingsService.getSettingsByCategory(options);

    res.json({ settings: groupedSettings });
  } catch (error: any) {
    logger.error('Get grouped settings error:', error);
    res.status(500).json({ error: 'Failed to fetch grouped settings' });
  }
});

/**
 * GET /app-settings/categories - Get all categories
 */
router.get('/categories', authenticateToken, async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await appSettingsService.getCategories();
    res.json({ categories });
  } catch (error: any) {
    logger.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * GET /app-settings/ready - Get ready settings as key-value map
 */
router.get('/ready', authenticateToken, async (_req: Request, res: Response): Promise<void> => {
  try {
    const settingsMap = await appSettingsService.getReadySettingsMap();
    res.json({ settings: settingsMap });
  } catch (error: any) {
    logger.error('Get ready settings error:', error);
    res.status(500).json({ error: 'Failed to fetch ready settings' });
  }
});

/**
 * GET /app-settings/category/:category - Get settings by category
 */
router.get('/category/:category', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const settings = await appSettingsService.getSettingsByCategoryName(category);
    res.json({ settings });
  } catch (error: any) {
    logger.error('Get settings by category error:', error);
    res.status(500).json({ error: 'Failed to fetch settings by category' });
  }
});

/**
 * POST /app-settings/bulk-get - Get multiple settings by keys
 */
router.post('/bulk-get', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { keys } = req.body;

    if (!Array.isArray(keys)) {
      res.status(400).json({ error: 'keys must be an array' });
      return;
    }

    const settings = await appSettingsService.getSettingsByKeys(keys);
    res.json({ settings });
  } catch (error: any) {
    logger.error('Bulk get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings by keys' });
  }
});

/**
 * GET /app-settings/:key - Get setting by key
 */
router.get('/:key', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const setting = await appSettingsService.getSettingByKey(key);

    if (!setting) {
      res.status(404).json({ error: 'Setting not found' });
      return;
    }

    res.json({ setting });
  } catch (error: any) {
    logger.error('Get setting error:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

/**
 * POST /app-settings - Create new setting
 */
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, value, valueType, category, isReady, isApplied, description, displayOrder, isSensitive } = req.body;

    if (!key || !category) {
      res.status(400).json({ error: 'key and category are required' });
      return;
    }

    // Check if key already exists
    const existingSetting = await appSettingsService.getSettingByKey(key);
    if (existingSetting) {
      res.status(400).json({ error: 'Setting key already exists' });
      return;
    }

    const settingData = {
      key,
      value: value || '',
      valueType: valueType || 'string',
      category,
      isReady: isReady || false,
      isApplied: isApplied || false,
      descriptionEn: description?.en || '',
      descriptionKo: description?.ko || '',
      descriptionZh: description?.zh || '',
      descriptionVi: description?.vi || '',
      displayOrder: displayOrder || 0,
      isSensitive: isSensitive || false,
      updatedBy: req.user?.userId
    };

    const newSetting = await appSettingsService.createSetting(settingData);
    res.status(201).json({ setting: newSetting });
  } catch (error: any) {
    logger.error('Create setting error:', error);
    res.status(500).json({ error: 'Failed to create setting' });
  }
});

/**
 * PUT /app-settings/bulk - Update multiple settings at once
 */
router.put('/bulk', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings) || settings.length === 0) {
      res.status(400).json({ error: 'settings array is required' });
      return;
    }

    const updatedSettings = await appSettingsService.updateMultipleSettings(
      settings,
      req.user?.userId
    );

    res.json({
      message: `Successfully updated ${updatedSettings.length} setting(s)`,
      settings: updatedSettings
    });
  } catch (error: any) {
    logger.error('Bulk update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/**
 * PUT /app-settings/:key - Update setting
 */
router.put('/:key', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { value, valueType, category, isReady, isApplied, description, displayOrder, isSensitive } = req.body;

    const existingSetting = await appSettingsService.getSettingByKey(key);
    if (!existingSetting) {
      res.status(404).json({ error: 'Setting not found' });
      return;
    }

    const updates: any = {
      updatedBy: req.user?.userId
    };

    if (value !== undefined) updates.value = value;
    if (valueType !== undefined) updates.valueType = valueType;
    if (category !== undefined) updates.category = category;
    if (isReady !== undefined) updates.isReady = isReady;
    if (isApplied !== undefined) updates.isApplied = isApplied;
    if (displayOrder !== undefined) updates.displayOrder = displayOrder;
    if (isSensitive !== undefined) updates.isSensitive = isSensitive;

    if (description) {
      if (description.en !== undefined) updates.descriptionEn = description.en;
      if (description.ko !== undefined) updates.descriptionKo = description.ko;
      if (description.zh !== undefined) updates.descriptionZh = description.zh;
      if (description.vi !== undefined) updates.descriptionVi = description.vi;
    }

    const updatedSetting = await appSettingsService.updateSetting(key, updates);
    res.json({ setting: updatedSetting });
  } catch (error: any) {
    logger.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

/**
 * PATCH /app-settings/:key/ready - Update setting ready status
 */
router.patch('/:key/ready', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { isReady } = req.body;

    if (typeof isReady !== 'boolean') {
      res.status(400).json({ error: 'isReady must be a boolean' });
      return;
    }

    const existingSetting = await appSettingsService.getSettingByKey(key);
    if (!existingSetting) {
      res.status(404).json({ error: 'Setting not found' });
      return;
    }

    const updatedSetting = await appSettingsService.updateSettingReadyStatus(
      key,
      isReady,
      req.user?.userId
    );

    res.json({ setting: updatedSetting });
  } catch (error: any) {
    logger.error('Update setting ready status error:', error);
    res.status(500).json({ error: 'Failed to update setting ready status' });
  }
});

/**
 * PATCH /app-settings/:key/applied - Update setting applied status
 */
router.patch('/:key/applied', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { isApplied } = req.body;

    if (typeof isApplied !== 'boolean') {
      res.status(400).json({ error: 'isApplied must be a boolean' });
      return;
    }

    const existingSetting = await appSettingsService.getSettingByKey(key);
    if (!existingSetting) {
      res.status(404).json({ error: 'Setting not found' });
      return;
    }

    // Can only apply settings that are ready
    if (isApplied && !existingSetting.isReady) {
      res.status(400).json({ error: 'Cannot apply a setting that is not ready' });
      return;
    }

    const updatedSetting = await appSettingsService.updateSettingAppliedStatus(
      key,
      isApplied,
      req.user?.userId
    );

    res.json({ setting: updatedSetting });
  } catch (error: any) {
    logger.error('Update setting applied status error:', error);
    res.status(500).json({ error: 'Failed to update setting applied status' });
  }
});

/**
 * DELETE /app-settings/:key - Delete setting
 */
router.delete('/:key', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;

    const existingSetting = await appSettingsService.getSettingByKey(key);
    if (!existingSetting) {
      res.status(404).json({ error: 'Setting not found' });
      return;
    }

    await appSettingsService.deleteSetting(key);
    res.json({ message: 'Setting deleted successfully' });
  } catch (error: any) {
    logger.error('Delete setting error:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

/**
 * DELETE /app-settings - Bulk delete settings
 */
router.delete('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { keys } = req.body;

    if (!Array.isArray(keys) || keys.length === 0) {
      res.status(400).json({ error: 'Invalid keys array' });
      return;
    }

    let deletedCount = 0;
    for (const key of keys) {
      try {
        const deleted = await appSettingsService.deleteSetting(key);
        if (deleted) deletedCount++;
      } catch (error) {
        logger.error(`Failed to delete setting ${key}:`, error);
      }
    }

    res.json({
      message: `Successfully deleted ${deletedCount} setting(s)`
    });
  } catch (error: any) {
    logger.error('Bulk delete settings error:', error);
    res.status(500).json({ error: 'Failed to delete settings' });
  }
});

export default router;
