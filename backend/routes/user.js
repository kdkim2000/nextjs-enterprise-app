const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { readJSON, writeJSON } = require('../utils/fileUtils');
const path = require('path');

const router = express.Router();

const PREFERENCES_FILE = path.join(__dirname, '../data/userPreferences.json');
const MENUS_FILE = path.join(__dirname, '../data/menus.json');

/**
 * Get user preferences
 */
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const preferences = await readJSON(PREFERENCES_FILE) || [];
    const userPref = preferences.find(p => p.userId === userId);

    if (!userPref) {
      return res.json({
        favoriteMenus: [],
        recentMenus: [],
        language: 'en',
        theme: 'light'
      });
    }

    res.json(userPref);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

/**
 * Update user preferences
 */
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { language, theme } = req.body;

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

    if (language) userPref.language = language;
    if (theme) userPref.theme = theme;
    userPref.updatedAt = new Date().toISOString();

    await writeJSON(PREFERENCES_FILE, preferences);

    res.json(userPref);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
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
      return res.json([]);
    }

    const menus = await readJSON(MENUS_FILE);
    const favoriteMenus = userPref.favoriteMenus
      .map(menuId => menus.find(m => m.id === menuId))
      .filter(m => m !== undefined);

    res.json(favoriteMenus);
  } catch (error) {
    console.error('Get favorite menus error:', error);
    res.status(500).json({ error: 'Failed to fetch favorite menus' });
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
 * Get recent menus with details
 */
router.get('/recent-menus', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const preferences = await readJSON(PREFERENCES_FILE) || [];
    const userPref = preferences.find(p => p.userId === userId);

    if (!userPref || !userPref.recentMenus.length) {
      return res.json([]);
    }

    const menus = await readJSON(MENUS_FILE);
    const recentMenus = userPref.recentMenus
      .map(menuId => menus.find(m => m.id === menuId))
      .filter(m => m !== undefined);

    res.json(recentMenus);
  } catch (error) {
    console.error('Get recent menus error:', error);
    res.status(500).json({ error: 'Failed to fetch recent menus' });
  }
});

module.exports = router;
