const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { appendLog } = require('../middleware/logger');
const { getUserAccessibleProgramsAsync } = require('../middleware/permissionMiddleware');
const menuService = require('../services/menuService');
const preferencesService = require('../services/preferencesService');
const logService = require('../services/logService');
const { transformMultiLangFields } = require('../utils/multiLangTransform');
const { v4: uuidv4 } = require('uuid');

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
 * Get user's accessible menus based on program permissions
 */
router.get('/user-menus', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all menus from database
    const dbMenus = await menuService.getAllMenus();
    const menus = dbMenus.map(transformMenuToAPI);

    // Get user's accessible programs with permissions
    const accessiblePrograms = await getUserAccessibleProgramsAsync(userId);

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

    const dbMenu = await menuService.getMenuByPath(menuPath);

    // If menu not found, return null instead of 404
    // This allows pages without menus to still render
    if (!dbMenu) {
      return res.json({ menu: null });
    }

    const menu = transformMenuToAPI(dbMenu);

    // Check if user has access to the program
    const userId = req.user.userId;

    // If menu has programId, check program permissions
    if (menu.programId) {
      const accessiblePrograms = await getUserAccessibleProgramsAsync(userId);
      const hasAccess = accessiblePrograms.some(p => p.code === menu.programId);

      if (!hasAccess) {
        // If no access, return null menu (let page-level auth handle access)
        // Don't log or update recent menus for unauthorized access
        return res.json({ menu: null });
      }
    }

    // Log menu access
    await logMenuAccess(userId, menu.id, menuPath, menu.programId);

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

    const dbMenus = await menuService.getAllMenus();
    const menus = dbMenus.map(transformMenuToAPI);
    res.json({ menus: buildMenuTree(menus) });
  } catch (error) {
    console.error('Get all menus error:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

/**
 * POST /api/menu - Create a new menu
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Only admin can create menus
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin only' });
    }

    const { code, name, path, icon, order, parentId, level, programId, description } = req.body;

    // Validate required fields
    if (!code || !name || !path || order === undefined || level === undefined) {
      return res.status(400).json({ error: 'Missing required fields: code, name, path, order, level' });
    }

    // Check if menu code already exists
    const existingCodeMenu = await menuService.getMenuByCode(code);
    if (existingCodeMenu) {
      return res.status(409).json({ error: 'Menu code already exists' });
    }

    // Check if menu path already exists
    const existingPathMenu = await menuService.getMenuByPath(path);
    if (existingPathMenu) {
      return res.status(409).json({ error: 'Menu path already exists' });
    }

    const menuData = {
      code,
      nameEn: typeof name === 'string' ? name : name.en || '',
      nameKo: typeof name === 'object' ? name.ko || '' : '',
      nameZh: typeof name === 'object' ? name.zh || '' : '',
      nameVi: typeof name === 'object' ? name.vi || '' : '',
      path,
      icon: icon || 'Article',
      order,
      parentId: parentId || null,
      level,
      programId: programId || null,
      description: JSON.stringify(description || { en: '', ko: '', zh: '', vi: '' })
    };

    const dbMenu = await menuService.createMenu(menuData);
    const newMenu = transformMenuToAPI(dbMenu);

    res.status(201).json({ menu: newMenu });
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).json({ error: 'Failed to create menu' });
  }
});

/**
 * PUT /api/menu/:id - Update an existing menu
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Only admin can update menus
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin only' });
    }

    const existingMenu = await menuService.getMenuById(req.params.id);
    if (!existingMenu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    const { code, name, path, icon, order, parentId, level, programId, description } = req.body;

    // Check if new code conflicts with existing menus
    if (code && code !== existingMenu.code) {
      const conflictMenu = await menuService.getMenuByCode(code);
      if (conflictMenu && conflictMenu.id !== req.params.id) {
        return res.status(409).json({ error: 'Menu code already exists' });
      }
    }

    // Check if new path conflicts with existing menus
    if (path && path !== existingMenu.path) {
      const conflictMenu = await menuService.getMenuByPath(path);
      if (conflictMenu && conflictMenu.id !== req.params.id) {
        return res.status(409).json({ error: 'Menu path already exists' });
      }
    }

    const updates = {};
    if (code) updates.code = code;
    if (name) {
      if (typeof name === 'string') {
        updates.nameEn = name;
      } else {
        if (name.en !== undefined) updates.nameEn = name.en;
        if (name.ko !== undefined) updates.nameKo = name.ko;
        if (name.zh !== undefined) updates.nameZh = name.zh;
        if (name.vi !== undefined) updates.nameVi = name.vi;
      }
    }
    if (path) updates.path = path;
    if (icon !== undefined) updates.icon = icon;
    if (order !== undefined) updates.order = order;
    if (parentId !== undefined) updates.parentId = parentId;
    if (level !== undefined) updates.level = level;
    if (programId !== undefined) updates.programId = programId;
    if (description) updates.description = JSON.stringify(description);

    const dbMenu = await menuService.updateMenu(req.params.id, updates);
    const updatedMenu = transformMenuToAPI(dbMenu);

    res.json({ menu: updatedMenu });
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({ error: 'Failed to update menu' });
  }
});

/**
 * DELETE /api/menu/:id - Delete a menu
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Only admin can delete menus
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin only' });
    }

    const existingMenu = await menuService.getMenuById(req.params.id);
    if (!existingMenu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Check if menu has children
    const allMenus = await menuService.getAllMenus();
    const hasChildren = allMenus.some(m => m.parent_id === req.params.id);
    if (hasChildren) {
      return res.status(400).json({ error: 'Cannot delete menu with children. Delete child menus first.' });
    }

    await menuService.deleteMenu(req.params.id);

    const deletedMenu = transformMenuToAPI(existingMenu);
    res.json({ message: 'Menu deleted successfully', menu: deletedMenu });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({ error: 'Failed to delete menu' });
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
 * Helper: Log menu access using logService
 */
async function logMenuAccess(userId, menuId, menuPath, programId) {
  try {
    const logEntry = {
      method: 'MENU',
      path: menuPath,
      statusCode: 200,
      duration: '0ms',
      userId: userId,
      programId: programId || 'PROG-SYSTEM',
      ip: '',
      userAgent: ''
    };

    await logService.createLog(logEntry);
  } catch (error) {
    console.error('Error logging menu access:', error);
    // Don't throw - logging errors shouldn't break the main flow
  }
}

/**
 * Helper: Update recent menus using preferencesService
 */
async function updateRecentMenus(userId, menuId) {
  try {
    let userPrefs = await preferencesService.getUserPreferences(userId);

    if (!userPrefs) {
      // Create default preferences if not exist
      await preferencesService.createUserPreferences({
        userId,
        favoriteMenus: [],
        recentMenus: [menuId],
        language: 'en',
        theme: 'light'
      });
      return;
    }

    // Get current recent menus from database
    // recent_menus is stored as JSONB in database
    let recentMenus = [];
    try {
      recentMenus = userPrefs.recent_menus ?
        (typeof userPrefs.recent_menus === 'string' ?
          JSON.parse(userPrefs.recent_menus) :
          userPrefs.recent_menus) : [];
    } catch (e) {
      console.error('Error parsing recent_menus:', e);
      recentMenus = [];
    }

    // Add to recent menus (keep last 10)
    const updatedRecentMenus = recentMenus.filter(id => id !== menuId);
    updatedRecentMenus.unshift(menuId);
    const finalRecentMenus = updatedRecentMenus.slice(0, 10);

    // Update preferences with camelCase field name
    await preferencesService.updateUserPreferences(userId, {
      recentMenus: finalRecentMenus
    });
  } catch (error) {
    console.error('Error updating recent menus:', error);
    // Don't throw - preference errors shouldn't break the main flow
  }
}

module.exports = router;
