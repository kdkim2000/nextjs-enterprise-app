const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { readJSON, writeJSON } = require('../utils/fileUtils');
const { appendLog } = require('../middleware/logger');
const { getUserAccessiblePrograms } = require('../middleware/permissionMiddleware');
const path = require('path');

const router = express.Router();

const MENUS_FILE = path.join(__dirname, '../data/menus.json');
const PERMISSIONS_FILE = path.join(__dirname, '../data/permissions.json');
const PREFERENCES_FILE = path.join(__dirname, '../data/userPreferences.json');

/**
 * Get user's accessible menus based on program permissions
 */
router.get('/user-menus', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const menus = await readJSON(MENUS_FILE);

    // Get user's accessible programs with permissions
    const accessiblePrograms = getUserAccessiblePrograms(userId);

    // Create a map of programCode -> permissions for efficient lookup
    const programPermissionsMap = new Map();
    accessiblePrograms.forEach(prog => {
      programPermissionsMap.set(prog.code, prog.permissions);
    });

    // Debug logging
    console.log(`[Menu Filter] User ${userId} has access to programs:`,
      Array.from(programPermissionsMap.keys()));

    // Filter menus based on program access AND view permission
    // ONLY include menus with programId that user has VIEW access to
    // Parent menus (without programId) will be added later if they have accessible children
    const accessibleMenus = menus.filter(menu => {
      // If menu has programId, check if user has VIEW permission to that program
      if (menu.programId) {
        const permissions = programPermissionsMap.get(menu.programId);
        const hasViewAccess = permissions && permissions.canView;

        if (!hasViewAccess) {
          console.log(`[Menu Filter] Filtering out menu "${menu.code}" - no VIEW permission for program ${menu.programId}`);
        }
        return hasViewAccess;
      }

      // Parent menus (no programId) are NOT automatically included here
      // They will be added by includeParentMenus if they have accessible children
      return false;
    });

    console.log(`[Menu Filter] Accessible leaf menus: ${accessibleMenus.length}`);

    // Include parent menus for accessible items
    const menusWithParents = includeParentMenus(accessibleMenus, menus);

    console.log(`[Menu Filter] Menus with parents: ${menusWithParents.length}`);

    // Filter out parent menus that have no accessible children
    const filteredMenus = filterEmptyParents(menusWithParents, menus);

    console.log(`[Menu Filter] Final filtered menus: ${filteredMenus.length}`);

    res.json({ menus: buildMenuTree(filteredMenus) });
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

    // If menu not found, return null instead of 404
    // This allows pages without menus to still render
    if (!menu) {
      return res.json({ menu: null });
    }

    // Check if user has access to the program
    const userId = req.user.userId;

    // If menu has programId, check program permissions
    if (menu.programId) {
      const accessiblePrograms = getUserAccessiblePrograms(userId);
      const hasAccess = accessiblePrograms.some(p => p.code === menu.programId);

      if (!hasAccess) {
        // If no access, return null menu (let page-level auth handle access)
        // Don't log or update recent menus for unauthorized access
        return res.json({ menu: null });
      }
    }

    // Log menu access
    await logMenuAccess(userId, menu.id, menuPath);

    // Update recent menus
    await updateRecentMenus(userId, menu.id);

    res.json({ menu });
  } catch (error) {
    console.error('Get menu by path error:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

/**
 * Get all menus (admin and manager)
 */
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Allow admin and manager roles to view all menus
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Admin or manager access required' });
    }

    const menus = await readJSON(MENUS_FILE);
    res.json({ menus: buildMenuTree(menus) });
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
 * Helper: Filter out parent menus that have no accessible children
 */
function filterEmptyParents(menusWithParents, allMenus) {
  const menuIds = new Set(menusWithParents.map(m => m.id));

  return menusWithParents.filter(menu => {
    // If menu has programId, keep it (it's a leaf menu that passed permission check)
    if (menu.programId) {
      return true;
    }

    // For parent menus (no programId), check if any children are in the accessible list
    const hasAccessibleChildren = allMenus.some(m =>
      m.parentId === menu.id && menuIds.has(m.id)
    );

    if (!hasAccessibleChildren) {
      console.log(`[Menu Filter] Filtering out empty parent menu "${menu.code}"`);
    }

    return hasAccessibleChildren;
  });
}

/**
 * Helper: Log menu access
 */
async function logMenuAccess(userId, menuId, menuPath) {
  const { v4: uuidv4 } = require('uuid');

  // Get program ID from menuId
  const menus = await readJSON(MENUS_FILE);
  const menu = menus.find(m => m.id === menuId);
  const programId = menu?.programId || 'PROG-SYSTEM';

  // Create unified log entry
  const logEntry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    method: 'MENU',
    path: menuPath,
    statusCode: 200,
    duration: '0ms',
    userId: userId,
    programId: programId,
    ip: '',
    userAgent: ''
  };

  await appendLog(logEntry);
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
