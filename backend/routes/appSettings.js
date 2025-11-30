const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const appSettingsService = require('../services/appSettingsService');
const { transformMultiLangFields } = require('../utils/multiLangTransform');

const router = express.Router();
/**
 * Get public settings (no authentication required)
 * Returns only ready settings that are safe for public display
 * GET /api/app-settings/public
 */
router.get('/public', async (req, res) => {
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
    const publicSettings = {};
    for (const key of publicKeys) {
      if (allAppliedSettings[key] !== undefined) {
        publicSettings[key] = allAppliedSettings[key];
      }
    }

    res.json({ settings: publicSettings });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({ error: 'Failed to fetch public settings' });
  }
});



/**
 * Get all settings with optional filtering
 * GET /api/app-settings?category=basic&isReady=true&search=app
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, isReady, isApplied, search, page = 1, limit = 100 } = req.query;

    const options = {
      category,
      search
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
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * Get settings grouped by category
 * GET /api/app-settings/grouped
 */
router.get('/grouped', authenticateToken, async (req, res) => {
  try {
    const { isReady, isApplied } = req.query;

    const options = {};
    if (isReady !== undefined) {
      options.isReady = isReady === 'true';
    }
    if (isApplied !== undefined) {
      options.isApplied = isApplied === 'true';
    }

    const groupedSettings = await appSettingsService.getSettingsByCategory(options);

    res.json({ settings: groupedSettings });
  } catch (error) {
    console.error('Get grouped settings error:', error);
    res.status(500).json({ error: 'Failed to fetch grouped settings' });
  }
});

/**
 * Get all categories
 * GET /api/app-settings/categories
 */
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await appSettingsService.getCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * Get ready settings as key-value map (for application use)
 * GET /api/app-settings/ready
 */
router.get('/ready', authenticateToken, async (req, res) => {
  try {
    const settingsMap = await appSettingsService.getReadySettingsMap();
    res.json({ settings: settingsMap });
  } catch (error) {
    console.error('Get ready settings error:', error);
    res.status(500).json({ error: 'Failed to fetch ready settings' });
  }
});

/**
 * Get settings by category
 * GET /api/app-settings/category/:category
 */
router.get('/category/:category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;
    const settings = await appSettingsService.getSettingsByCategoryName(category);
    res.json({ settings });
  } catch (error) {
    console.error('Get settings by category error:', error);
    res.status(500).json({ error: 'Failed to fetch settings by category' });
  }
});

/**
 * Get multiple settings by keys
 * POST /api/app-settings/bulk-get
 */
router.post('/bulk-get', authenticateToken, async (req, res) => {
  try {
    const { keys } = req.body;

    if (!Array.isArray(keys)) {
      return res.status(400).json({ error: 'keys must be an array' });
    }

    const settings = await appSettingsService.getSettingsByKeys(keys);
    res.json({ settings });
  } catch (error) {
    console.error('Bulk get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings by keys' });
  }
});

/**
 * Get setting by key
 * GET /api/app-settings/:key
 */
router.get('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await appSettingsService.getSettingByKey(key);

    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ setting });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

/**
 * Create new setting
 * POST /api/app-settings
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { key, value, valueType, category, isReady, isApplied, description, displayOrder, isSensitive } = req.body;

    if (!key || !category) {
      return res.status(400).json({ error: 'key and category are required' });
    }

    // Check if key already exists
    const existingSetting = await appSettingsService.getSettingByKey(key);
    if (existingSetting) {
      return res.status(400).json({ error: 'Setting key already exists' });
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
      updatedBy: req.user?.id
    };

    const newSetting = await appSettingsService.createSetting(settingData);
    res.status(201).json({ setting: newSetting });
  } catch (error) {
    console.error('Create setting error:', error);
    res.status(500).json({ error: 'Failed to create setting' });
  }
});

/**
 * Update setting
 * PUT /api/app-settings/:key
 */
router.put('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const { value, valueType, category, isReady, isApplied, description, displayOrder, isSensitive } = req.body;

    const existingSetting = await appSettingsService.getSettingByKey(key);
    if (!existingSetting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    const updates = {
      updatedBy: req.user?.id
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
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

/**
 * Update multiple settings at once
 * PUT /api/app-settings/bulk
 */
router.put('/bulk', authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings) || settings.length === 0) {
      return res.status(400).json({ error: 'settings array is required' });
    }

    const updatedSettings = await appSettingsService.updateMultipleSettings(
      settings,
      req.user?.id
    );

    res.json({
      message: `Successfully updated ${updatedSettings.length} setting(s)`,
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Bulk update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/**
 * Update setting ready status
 * PATCH /api/app-settings/:key/ready
 */
router.patch('/:key/ready', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const { isReady } = req.body;

    if (typeof isReady !== 'boolean') {
      return res.status(400).json({ error: 'isReady must be a boolean' });
    }

    const existingSetting = await appSettingsService.getSettingByKey(key);
    if (!existingSetting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    const updatedSetting = await appSettingsService.updateSettingReadyStatus(
      key,
      isReady,
      req.user?.id
    );

    res.json({ setting: updatedSetting });
  } catch (error) {
    console.error('Update setting ready status error:', error);
    res.status(500).json({ error: 'Failed to update setting ready status' });
  }
});

/**
 * Update setting applied status
 * PATCH /api/app-settings/:key/applied
 */
router.patch('/:key/applied', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const { isApplied } = req.body;

    if (typeof isApplied !== 'boolean') {
      return res.status(400).json({ error: 'isApplied must be a boolean' });
    }

    const existingSetting = await appSettingsService.getSettingByKey(key);
    if (!existingSetting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    // Can only apply settings that are ready
    if (isApplied && !existingSetting.isReady) {
      return res.status(400).json({ error: 'Cannot apply a setting that is not ready' });
    }

    const updatedSetting = await appSettingsService.updateSettingAppliedStatus(
      key,
      isApplied,
      req.user?.id
    );

    res.json({ setting: updatedSetting });
  } catch (error) {
    console.error('Update setting applied status error:', error);
    res.status(500).json({ error: 'Failed to update setting applied status' });
  }
});

/**
 * Delete setting
 * DELETE /api/app-settings/:key
 */
router.delete('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;

    const existingSetting = await appSettingsService.getSettingByKey(key);
    if (!existingSetting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    await appSettingsService.deleteSetting(key);
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

/**
 * Bulk delete settings
 * DELETE /api/app-settings
 */
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const { keys } = req.body;

    if (!Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ error: 'Invalid keys array' });
    }

    let deletedCount = 0;
    for (const key of keys) {
      try {
        const deleted = await appSettingsService.deleteSetting(key);
        if (deleted) deletedCount++;
      } catch (error) {
        console.error(`Failed to delete setting ${key}:`, error);
      }
    }

    res.json({
      message: `Successfully deleted ${deletedCount} setting(s)`
    });
  } catch (error) {
    console.error('Bulk delete settings error:', error);
    res.status(500).json({ error: 'Failed to delete settings' });
  }
});

module.exports = router;
