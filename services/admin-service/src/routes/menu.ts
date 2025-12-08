/**
 * Menu Routes
 */

import { Router, Request, Response } from 'express';
import { getLogger } from '@enterprise/shared';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import * as menuService from '../services/menuService';
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
