/**
 * Menu Routes
 */

import { Router, Request, Response } from 'express';
import { getLogger } from '@enterprise/shared';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import * as menuService from '../services/menuService';
import * as preferencesService from '../services/preferencesService';
import * as permissionService from '../services/permissionService';
import { transformMultiLangFields } from '../utils/multiLangTransform';

const router = Router();
const logger = getLogger('admin-service:menu-routes');

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

// Helper function to build menu tree from flat array
function buildMenuTree(menus: any[]): any[] {
  const menuMap = new Map();
  const tree: any[] = [];

  menus.forEach(menu => {
    menuMap.set(menu.id, { ...menu, children: [] });
  });

  menus.forEach(menu => {
    const node = menuMap.get(menu.id);
    if (menu.parentId && menuMap.has(menu.parentId)) {
      menuMap.get(menu.parentId).children.push(node);
    } else {
      tree.push(node);
    }
  });

  // Sort by order
  const sortByOrder = (a: any, b: any) => a.order - b.order;
  tree.sort(sortByOrder);
  tree.forEach(node => sortChildren(node));

  return tree;
}

function sortChildren(node: any): void {
  if (node.children && node.children.length > 0) {
    node.children.sort((a: any, b: any) => a.order - b.order);
    node.children.forEach((child: any) => sortChildren(child));
  }
}

/**
 * GET /admin/menus/user-menus - Get user's accessible menus based on program permissions
 */
router.get('/user-menus', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    // Get all menus from database
    const dbMenus = await menuService.getAllMenus({});
    const menus = dbMenus.map(transformMenuToAPI);

    // Get user's accessible programs with permissions
    const accessiblePrograms = await permissionService.getUserAccessiblePrograms(userId);

    // Create a map of programCode -> permissions for efficient lookup
    const programPermissionsMap = new Map<string, any>();
    accessiblePrograms.forEach(prog => {
      programPermissionsMap.set(prog.code, prog.permissions);
    });

    logger.debug(`User ${userId} has access to programs: ${Array.from(programPermissionsMap.keys()).join(', ')}`);

    // Filter menus based on program access AND view permission
    const accessibleMenus = menus.filter(menu => {
      if (menu.programId) {
        const permissions = programPermissionsMap.get(menu.programId);
        return permissions && permissions.canView;
      }
      return false;
    });

    // Include parent menus for accessible items
    const menusWithParents = includeParentMenus(accessibleMenus, menus);

    // Filter out parent menus that have no accessible children
    const filteredMenus = filterEmptyParents(menusWithParents, menus);

    res.json({ menus: buildMenuTree(filteredMenus) });
  } catch (error: any) {
    logger.error('Get user menus error:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

/**
 * GET /admin/menus/by-path - Get menu by path
 */
router.get('/by-path', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { path: menuPath } = req.query;

    if (!menuPath) {
      return res.status(400).json({ error: 'Path required' });
    }

    const dbMenu = await menuService.getMenuByPath(menuPath as string);

    if (!dbMenu) {
      return res.json({ menu: null });
    }

    const menu = transformMenuToAPI(dbMenu);

    // Check if user has access to the program
    const userId = req.user?.userId;

    if (menu.programId && userId) {
      const accessiblePrograms = await permissionService.getUserAccessiblePrograms(userId);
      const hasAccess = accessiblePrograms.some(p => p.code === menu.programId);

      if (!hasAccess) {
        return res.json({ menu: null });
      }

      // Update recent menus
      await updateRecentMenus(userId, menu.id);
    }

    res.json({ menu });
  } catch (error: any) {
    logger.error('Get menu by path error:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

/**
 * Helper: Include parent menus for accessible items
 */
function includeParentMenus(accessibleMenus: any[], allMenus: any[]): any[] {
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
function filterEmptyParents(menusWithParents: any[], allMenus: any[]): any[] {
  const menuIds = new Set(menusWithParents.map(m => m.id));

  return menusWithParents.filter(menu => {
    if (menu.programId) {
      return true;
    }

    const hasAccessibleChildren = allMenus.some(m =>
      m.parentId === menu.id && menuIds.has(m.id)
    );

    return hasAccessibleChildren;
  });
}

/**
 * Helper: Update recent menus
 */
async function updateRecentMenus(userId: string, menuId: string): Promise<void> {
  try {
    let userPrefs = await preferencesService.getUserPreferences(userId);

    if (!userPrefs) {
      await preferencesService.createUserPreferences({
        userId,
        favoriteMenus: [],
        recentMenus: [menuId],
        language: 'en',
        theme: 'light'
      });
      return;
    }

    let recentMenus: string[] = [];
    try {
      recentMenus = userPrefs.recent_menus ?
        (typeof userPrefs.recent_menus === 'string' ?
          JSON.parse(userPrefs.recent_menus) :
          userPrefs.recent_menus) : [];
    } catch (e) {
      recentMenus = [];
    }

    const updatedRecentMenus = recentMenus.filter(id => id !== menuId);
    updatedRecentMenus.unshift(menuId);
    const finalRecentMenus = updatedRecentMenus.slice(0, 10);

    await preferencesService.updateUserPreferences(userId, {
      recentMenus: finalRecentMenus
    });
  } catch (error) {
    logger.error('Error updating recent menus:', error);
  }
}

/**
 * GET /admin/menus/all - Get all menus (admin and manager) as tree
 */
router.get('/all', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Allow admin and manager roles to view all menus
    if (req.user?.role !== 'admin' && req.user?.role !== 'manager') {
      return res.status(403).json({ error: 'Admin or manager access required' });
    }

    const dbMenus = await menuService.getAllMenus({});
    const menus = dbMenus.map(transformMenuToAPI);
    res.json({ menus: buildMenuTree(menus) });
  } catch (error: any) {
    logger.error('Get all menus error:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

/**
 * GET /admin/menus - Get all menus (admin and manager)
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Allow admin and manager roles to view all menus
    if (req.user?.role !== 'admin' && req.user?.role !== 'manager') {
      return res.status(403).json({ error: 'Admin or manager access required' });
    }

    const dbMenus = await menuService.getAllMenus({});
    const menus = dbMenus.map(transformMenuToAPI);
    res.json({ menus: buildMenuTree(menus) });
  } catch (error: any) {
    logger.error('Get all menus error:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

/**
 * GET /admin/menus/flat - Get all menus as flat list
 */
router.get('/flat', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'manager') {
      return res.status(403).json({ error: 'Admin or manager access required' });
    }

    const dbMenus = await menuService.getAllMenus({});
    const menus = dbMenus.map(transformMenuToAPI);
    res.json({ menus });
  } catch (error: any) {
    logger.error('Get flat menus error:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

/**
 * GET /admin/menus/:id - Get menu by ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dbMenu = await menuService.getMenuById(id);

    if (!dbMenu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    const menu = transformMenuToAPI(dbMenu);
    res.json({ menu });
  } catch (error: any) {
    logger.error('Get menu error:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

/**
 * POST /admin/menus - Create a new menu
 */
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
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
      nameEn: (typeof name === 'object' && name !== null) ? (name.en || '') : (typeof name === 'string' ? name : ''),
      nameKo: (typeof name === 'object' && name !== null) ? (name.ko || '') : '',
      nameZh: (typeof name === 'object' && name !== null) ? (name.zh || '') : '',
      nameVi: (typeof name === 'object' && name !== null) ? (name.vi || '') : '',
      path,
      icon: icon || 'Article',
      order,
      parentId: parentId || null,
      level,
      programId: programId || null,
      descriptionEn: (typeof description === 'object' && description !== null) ? (description.en || '') : (typeof description === 'string' ? description : ''),
      descriptionKo: (typeof description === 'object' && description !== null) ? (description.ko || '') : '',
      descriptionZh: (typeof description === 'object' && description !== null) ? (description.zh || '') : '',
      descriptionVi: (typeof description === 'object' && description !== null) ? (description.vi || '') : ''
    };

    const dbMenu = await menuService.createMenu(menuData);
    const newMenu = transformMenuToAPI(dbMenu);

    logger.info(`Menu created: ${code}`);
    res.status(201).json({ menu: newMenu });
  } catch (error: any) {
    logger.error('Create menu error:', error);
    res.status(500).json({ error: 'Failed to create menu' });
  }
});

/**
 * PUT /admin/menus/:id - Update an existing menu
 */
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
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

    const updates: any = {};
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
    if (description) {
      if (typeof description === 'object') {
        if (description.en !== undefined) updates.descriptionEn = description.en;
        if (description.ko !== undefined) updates.descriptionKo = description.ko;
        if (description.zh !== undefined) updates.descriptionZh = description.zh;
        if (description.vi !== undefined) updates.descriptionVi = description.vi;
      }
    }

    const dbMenu = await menuService.updateMenu(req.params.id, updates);
    const updatedMenu = transformMenuToAPI(dbMenu);

    res.json({ menu: updatedMenu });
  } catch (error: any) {
    logger.error('Update menu error:', error);
    res.status(500).json({ error: 'Failed to update menu' });
  }
});

/**
 * DELETE /admin/menus/:id - Delete a menu
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const existingMenu = await menuService.getMenuById(req.params.id);
    if (!existingMenu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Check if menu has children
    const allMenus = await menuService.getAllMenus({});
    const hasChildren = allMenus.some(m => m.parent_id === req.params.id);
    if (hasChildren) {
      return res.status(400).json({ error: 'Cannot delete menu with children. Delete child menus first.' });
    }

    await menuService.deleteMenu(req.params.id);

    const deletedMenu = transformMenuToAPI(existingMenu);
    logger.info(`Menu deleted: ${existingMenu.code}`);
    res.json({ message: 'Menu deleted successfully', menu: deletedMenu });
  } catch (error: any) {
    logger.error('Delete menu error:', error);
    res.status(500).json({ error: 'Failed to delete menu' });
  }
});

export default router;
