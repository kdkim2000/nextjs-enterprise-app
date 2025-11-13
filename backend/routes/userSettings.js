const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { readJSON, writeJSON } = require('../utils/fileUtils');
const path = require('path');

const router = express.Router();

const SETTINGS_FILE = path.join(__dirname, '../data/userSettings.json');

// Default settings for new users
const DEFAULT_SETTINGS = {
  general: {
    language: 'en',
    timezone: 'Asia/Seoul',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h'
  },
  appearance: {
    theme: 'light',
    fontSize: 'medium',
    compactMode: false,
    sidebarCollapsed: false
  },
  notifications: {
    email: true,
    push: true,
    desktop: false,
    sound: true
  },
  dataGrid: {
    defaultPageSize: 50,
    showDensitySelector: true,
    showColumnSelector: true,
    showFilterPanel: true,
    autoRefresh: false,
    autoRefreshInterval: 30
  },
  privacy: {
    showOnlineStatus: true,
    showActivity: true,
    allowAnalytics: true
  },
  advanced: {
    enableDebugMode: false,
    enableBetaFeatures: false,
    enableKeyboardShortcuts: true
  }
};

/**
 * Get current user's settings
 * GET /api/user-settings
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const allSettings = await readJSON(SETTINGS_FILE) || [];

    let userSettings = allSettings.find(s => s.userId === userId);

    // If user settings don't exist, create default settings
    if (!userSettings) {
      userSettings = {
        userId,
        ...DEFAULT_SETTINGS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      allSettings.push(userSettings);
      await writeJSON(SETTINGS_FILE, allSettings);
    }

    res.json({ settings: userSettings });
  } catch (error) {
    console.error('Get user settings error:', error);
    res.status(500).json({ error: 'Failed to fetch user settings' });
  }
});

/**
 * Update current user's settings (partial or full update)
 * PUT /api/user-settings
 * Body: { general?, appearance?, notifications?, dataGrid?, privacy?, advanced? }
 */
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    const allSettings = await readJSON(SETTINGS_FILE) || [];
    const settingsIndex = allSettings.findIndex(s => s.userId === userId);

    let userSettings;

    if (settingsIndex === -1) {
      // Create new settings if not exists
      userSettings = {
        userId,
        ...DEFAULT_SETTINGS,
        ...updates,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      allSettings.push(userSettings);
    } else {
      // Update existing settings (deep merge)
      userSettings = allSettings[settingsIndex];

      // Merge each section
      if (updates.general) {
        userSettings.general = { ...userSettings.general, ...updates.general };
      }
      if (updates.appearance) {
        userSettings.appearance = { ...userSettings.appearance, ...updates.appearance };
      }
      if (updates.notifications) {
        userSettings.notifications = { ...userSettings.notifications, ...updates.notifications };
      }
      if (updates.dataGrid) {
        userSettings.dataGrid = { ...userSettings.dataGrid, ...updates.dataGrid };
      }
      if (updates.privacy) {
        userSettings.privacy = { ...userSettings.privacy, ...updates.privacy };
      }
      if (updates.advanced) {
        userSettings.advanced = { ...userSettings.advanced, ...updates.advanced };
      }

      userSettings.updatedAt = new Date().toISOString();
      allSettings[settingsIndex] = userSettings;
    }

    await writeJSON(SETTINGS_FILE, allSettings);

    res.json({
      message: 'Settings updated successfully',
      settings: userSettings
    });
  } catch (error) {
    console.error('Update user settings error:', error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
});

/**
 * Update a specific section of user settings
 * PATCH /api/user-settings/:section
 * Sections: general, appearance, notifications, dataGrid, privacy, advanced
 */
router.patch('/:section', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const section = req.params.section;
    const sectionUpdates = req.body;

    const validSections = ['general', 'appearance', 'notifications', 'dataGrid', 'privacy', 'advanced'];

    if (!validSections.includes(section)) {
      return res.status(400).json({
        error: `Invalid section. Must be one of: ${validSections.join(', ')}`
      });
    }

    const allSettings = await readJSON(SETTINGS_FILE) || [];
    const settingsIndex = allSettings.findIndex(s => s.userId === userId);

    let userSettings;

    if (settingsIndex === -1) {
      // Create new settings if not exists
      userSettings = {
        userId,
        ...DEFAULT_SETTINGS,
        [section]: { ...DEFAULT_SETTINGS[section], ...sectionUpdates },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      allSettings.push(userSettings);
    } else {
      // Update existing settings
      userSettings = allSettings[settingsIndex];
      userSettings[section] = { ...userSettings[section], ...sectionUpdates };
      userSettings.updatedAt = new Date().toISOString();
      allSettings[settingsIndex] = userSettings;
    }

    await writeJSON(SETTINGS_FILE, allSettings);

    res.json({
      message: `${section} settings updated successfully`,
      settings: userSettings
    });
  } catch (error) {
    console.error('Update user settings section error:', error);
    res.status(500).json({ error: 'Failed to update user settings section' });
  }
});

/**
 * Reset user settings to default
 * POST /api/user-settings/reset
 */
router.post('/reset', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const allSettings = await readJSON(SETTINGS_FILE) || [];
    const settingsIndex = allSettings.findIndex(s => s.userId === userId);

    const userSettings = {
      userId,
      ...DEFAULT_SETTINGS,
      createdAt: settingsIndex === -1
        ? new Date().toISOString()
        : allSettings[settingsIndex].createdAt,
      updatedAt: new Date().toISOString()
    };

    if (settingsIndex === -1) {
      allSettings.push(userSettings);
    } else {
      allSettings[settingsIndex] = userSettings;
    }

    await writeJSON(SETTINGS_FILE, allSettings);

    res.json({
      message: 'Settings reset to default successfully',
      settings: userSettings
    });
  } catch (error) {
    console.error('Reset user settings error:', error);
    res.status(500).json({ error: 'Failed to reset user settings' });
  }
});

/**
 * Get all users' settings (admin only)
 * GET /api/user-settings/all
 */
router.get('/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const allSettings = await readJSON(SETTINGS_FILE) || [];

    res.json({ settings: allSettings });
  } catch (error) {
    console.error('Get all user settings error:', error);
    res.status(500).json({ error: 'Failed to fetch all user settings' });
  }
});

/**
 * Get specific user's settings (admin only)
 * GET /api/user-settings/user/:userId
 */
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const allSettings = await readJSON(SETTINGS_FILE) || [];
    const userSettings = allSettings.find(s => s.userId === userId);

    if (!userSettings) {
      return res.status(404).json({ error: 'User settings not found' });
    }

    res.json({ settings: userSettings });
  } catch (error) {
    console.error('Get user settings by userId error:', error);
    res.status(500).json({ error: 'Failed to fetch user settings' });
  }
});

module.exports = router;
