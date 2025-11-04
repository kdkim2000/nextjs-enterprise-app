const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { readJSON, writeJSON } = require('../utils/fileUtils');
const path = require('path');

const router = express.Router();

const MENUS_FILE = path.join(__dirname, '../data/menus.json');
const PERMISSIONS_FILE = path.join(__dirname, '../data/permissions.json');
const PREFERENCES_FILE = path.join(__dirname, '../data/userPreferences.json');

/**
 * Get user's accessible menus
 */
router.get('/user-menus', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const menus = await readJSON(MENUS_FILE);
    const permissions = await readJSON(PERMISSIONS_FILE);

    const userPermission = permissions.find(p => p.userId === userId);

    if (!userPermission) {
      return res.json([]);
    }

    // If user has * access, return all menus
    if (userPermission.menuAccess.includes('*')) {
      return res.json(buildMenuTree(menus));
    }

    // Filter menus based on access
    const accessibleMenus = menus.filter(menu =>
      userPermission.menuAccess.includes(menu.id)
    );

    // Include parent menus for accessible items
    const menusWithParents = includeParentMenus(accessibleMenus, menus);

    res.json(buildMenuTree(menusWithParents));
  } catch (error) {
    console.error('Get user menus error:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

/**
 * Get menu by path
 */
router.get('/by-path', authenticateToken, async (req, res) => {
  try {
    const { path: menuPath } = req.query;

    if (!menuPath) {
      return res.status(400).json({ error: 'Path required' });
    }

    const menus = await readJSON(MENUS_FILE);
    const menu = menus.find(m => m.path === menuPath);

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Check if user has access
    const userId = req.user.userId;
    const permissions = await readJSON(PERMISSIONS_FILE);
    const userPermission = permissions.find(p => p.userId === userId);

    if (!userPermission) {
      return res.status(403).json({ error: 'No permissions' });
    }

    const hasAccess = userPermission.menuAccess.includes('*') ||
                     userPermission.menuAccess.includes(menu.id);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Log menu access
    await logMenuAccess(userId, menu.id, menuPath);

    // Update recent menus
    await updateRecentMenus(userId, menu.id);

    res.json(menu);
  } catch (error) {
    console.error('Get menu by path error:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

/**
 * Get all menus (admin only)
 */
router.get('/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const menus = await readJSON(MENUS_FILE);
    res.json(buildMenuTree(menus));
  } catch (error) {
    console.error('Get all menus error:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

/**
 * Helper: Build menu tree from flat array
 */
function buildMenuTree(menus) {
  const menuMap = new Map();
  const tree = [];

  // Create map
  menus.forEach(menu => {
    menuMap.set(menu.id, { ...menu, children: [] });
  });

  // Build tree
  menus.forEach(menu => {
    const node = menuMap.get(menu.id);
    if (menu.parentId && menuMap.has(menu.parentId)) {
      menuMap.get(menu.parentId).children.push(node);
    } else {
      tree.push(node);
    }
  });

  // Sort by order
  const sortByOrder = (a, b) => a.order - b.order;
  tree.sort(sortByOrder);
  tree.forEach(node => sortChildren(node));

  return tree;
}

function sortChildren(node) {
  if (node.children && node.children.length > 0) {
    node.children.sort((a, b) => a.order - b.order);
    node.children.forEach(child => sortChildren(child));
  }
}

/**
 * Helper: Include parent menus for accessible items
 */
function includeParentMenus(accessibleMenus, allMenus) {
  const menuSet = new Set(accessibleMenus.map(m => m.id));
  const result = [...accessibleMenus];

  accessibleMenus.forEach(menu => {
    let currentParentId = menu.parentId;
    while (currentParentId) {
      if (!menuSet.has(currentParentId)) {
        const parent = allMenus.find(m => m.id === currentParentId);
        if (parent) {
          result.push(parent);
          menuSet.add(currentParentId);
          currentParentId = parent.parentId;
        } else {
          break;
        }
      } else {
        break;
      }
    }
  });

  return result;
}

/**
 * Helper: Log menu access
 */
async function logMenuAccess(userId, menuId, menuPath) {
  const logsPath = path.join(__dirname, '../data/logs.json');
  const logs = await readJSON(logsPath) || [];

  logs.push({
    type: 'menu_access',
    userId,
    menuId,
    menuPath,
    timestamp: new Date().toISOString()
  });

  // Keep last 10000 entries
  if (logs.length > 10000) {
    logs.splice(0, logs.length - 10000);
  }

  await writeJSON(logsPath, logs);
}

/**
 * Helper: Update recent menus
 */
async function updateRecentMenus(userId, menuId) {
  const preferences = await readJSON(PREFERENCES_FILE) || [];
  let userPref = preferences.find(p => p.userId === userId);

  if (!userPref) {
    userPref = {
      userId,
      favoriteMenus: [],
      recentMenus: [],
      language: 'en',
      theme: 'light',
      updatedAt: new Date().toISOString()
    };
    preferences.push(userPref);
  }

  // Add to recent menus (keep last 10)
  userPref.recentMenus = userPref.recentMenus.filter(id => id !== menuId);
  userPref.recentMenus.unshift(menuId);
  userPref.recentMenus = userPref.recentMenus.slice(0, 10);
  userPref.updatedAt = new Date().toISOString();

  await writeJSON(PREFERENCES_FILE, preferences);
}

module.exports = router;
