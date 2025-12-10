/**
 * Board Type Routes
 */

import { Router, Request, Response } from 'express';
import { getLogger } from '@enterprise/shared';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import * as boardTypeService from '../services/boardTypeService';
import { transformMultiLangFields } from '../utils/multiLangTransform';
import { BoardType, BoardTypeApiResponse } from '../types';

const router = Router();
const logger = getLogger('content-service:boardType-routes');

/**
 * Transform database row to API format
 */
function transformBoardTypeToAPI(dbBoardType: BoardType): BoardTypeApiResponse | null {
  if (!dbBoardType) return null;

  // Transform multilingual fields
  const transformed = transformMultiLangFields(dbBoardType, ['name', 'description']);

  // Parse JSON fields
  const settings = typeof dbBoardType.settings === 'string'
    ? JSON.parse(dbBoardType.settings)
    : dbBoardType.settings;

  const writeRoles = typeof dbBoardType.write_roles === 'string'
    ? JSON.parse(dbBoardType.write_roles)
    : dbBoardType.write_roles;

  const readRoles = typeof dbBoardType.read_roles === 'string'
    ? JSON.parse(dbBoardType.read_roles)
    : dbBoardType.read_roles;

  return {
    id: dbBoardType.id,
    code: dbBoardType.code,
    name: transformed.name,
    description: transformed.description,
    type: dbBoardType.type,
    settings: settings || {},
    writeRoles: writeRoles || [],
    readRoles: readRoles || [],
    category: dbBoardType.category,
    order: dbBoardType.order || 0,
    status: dbBoardType.status || 'active',
    totalPosts: dbBoardType.total_posts || 0,
    totalViews: dbBoardType.total_views || 0,
    createdAt: dbBoardType.created_at,
    updatedAt: dbBoardType.updated_at,
    createdBy: dbBoardType.created_by,
    updatedBy: dbBoardType.updated_by
  };
}

/**
 * GET /content/board-types - Get all board types with pagination and filtering
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      search, type, category, status,
      page = '1', limit = '50'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const dbBoardTypes = await boardTypeService.getAllBoardTypes({
      search: search as string,
      type: type as string,
      category: category as string,
      status: status as string,
      limit: limitNum,
      offset
    });

    // Transform to API format
    const boardTypes = dbBoardTypes
      .map(transformBoardTypeToAPI)
      .filter((b): b is BoardTypeApiResponse => b !== null);

    // Get total count for pagination
    const totalCount = await boardTypeService.getBoardTypeCount({
      search: search as string,
      type: type as string,
      category: category as string,
      status: status as string
    });

    res.json({
      success: true,
      data: {
        items: boardTypes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching board types:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch board types' });
  }
});

/**
 * GET /content/board-types/all - Get all board types without pagination
 */
router.get('/all', authenticateToken, async (req: Request, res: Response) => {
  try {
    const dbBoardTypes = await boardTypeService.getAllBoardTypes();
    const boardTypes = dbBoardTypes
      .map(transformBoardTypeToAPI)
      .filter((b): b is BoardTypeApiResponse => b !== null);
    res.json({ success: true, data: boardTypes });
  } catch (error) {
    logger.error('Error fetching all board types:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch board types' });
  }
});

/**
 * GET /content/board-types/code/:code - Get a specific board type by code
 */
router.get('/code/:code', authenticateToken, async (req: Request, res: Response) => {
  try {
    const dbBoardType = await boardTypeService.getBoardTypeByCode(req.params.code);

    if (!dbBoardType) {
      return res.status(404).json({ success: false, error: 'Board type not found' });
    }

    const boardType = transformBoardTypeToAPI(dbBoardType);
    res.json({ success: true, data: boardType });
  } catch (error) {
    logger.error('Error fetching board type:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch board type' });
  }
});

/**
 * GET /content/board-types/:id/stats - Get board type statistics
 */
router.get('/:id/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = await boardTypeService.getBoardTypeStats(req.params.id);

    if (!stats) {
      return res.status(404).json({ success: false, error: 'Board type not found' });
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Error fetching board type stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch board type stats' });
  }
});

/**
 * GET /content/board-types/:id - Get a specific board type by ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const dbBoardType = await boardTypeService.getBoardTypeById(req.params.id);

    if (!dbBoardType) {
      return res.status(404).json({ success: false, error: 'Board type not found' });
    }

    const boardType = transformBoardTypeToAPI(dbBoardType);
    res.json({ success: true, data: boardType });
  } catch (error) {
    logger.error('Error fetching board type:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch board type' });
  }
});

/**
 * POST /content/board-types - Create a new board type
 */
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      code, name, description, type, settings,
      writeRoles, readRoles, category, order, status,
      name_en, name_ko, name_zh, name_vi,
      description_en, description_ko, description_zh, description_vi
    } = req.body;

    // Validate required fields
    if (!code || (!name && !name_en) || !type) {
      return res.status(400).json({ success: false, error: 'Missing required fields: code, name, type' });
    }

    // Check if board type code already exists
    const existingBoardType = await boardTypeService.getBoardTypeByCode(code);
    if (existingBoardType) {
      return res.status(409).json({ success: false, error: 'Board type code already exists' });
    }

    const boardTypeData = {
      code,
      nameEn: name_en || (typeof name === 'string' ? name : name?.en) || '',
      nameKo: name_ko || (typeof name === 'object' ? name.ko : '') || '',
      nameZh: name_zh || (typeof name === 'object' ? name.zh : '') || '',
      nameVi: name_vi || (typeof name === 'object' ? name.vi : '') || '',
      descriptionEn: description_en || description?.en || '',
      descriptionKo: description_ko || description?.ko || '',
      descriptionZh: description_zh || description?.zh || '',
      descriptionVi: description_vi || description?.vi || '',
      type,
      settings,
      writeRoles,
      readRoles,
      category,
      order: order || 0,
      status: status || 'active',
      createdBy: req.user?.userId
    };

    const dbBoardType = await boardTypeService.createBoardType(boardTypeData);
    const newBoardType = transformBoardTypeToAPI(dbBoardType);

    res.status(201).json({ success: true, data: newBoardType });
  } catch (error) {
    logger.error('Error creating board type:', error);
    res.status(500).json({ success: false, error: 'Failed to create board type' });
  }
});

/**
 * PUT /content/board-types/:id - Update a board type
 */
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const existingBoardType = await boardTypeService.getBoardTypeById(req.params.id);
    if (!existingBoardType) {
      return res.status(404).json({ success: false, error: 'Board type not found' });
    }

    const {
      code, name, description, type, settings,
      writeRoles, readRoles, category, order, status,
      name_en, name_ko, name_zh, name_vi,
      description_en, description_ko, description_zh, description_vi
    } = req.body;

    // Check if new code conflicts with existing board types
    if (code && code !== existingBoardType.code) {
      const conflictBoardType = await boardTypeService.getBoardTypeByCode(code);
      if (conflictBoardType && conflictBoardType.id !== req.params.id) {
        return res.status(409).json({ success: false, error: 'Board type code already exists' });
      }
    }

    const updates: Record<string, any> = { updatedBy: req.user?.userId };
    if (code) updates.code = code;

    // Support both object format and flat format for name
    if (name || name_en !== undefined) {
      if (typeof name === 'string') {
        updates.nameEn = name;
      } else if (typeof name === 'object') {
        if (name.en !== undefined) updates.nameEn = name.en;
        if (name.ko !== undefined) updates.nameKo = name.ko;
        if (name.zh !== undefined) updates.nameZh = name.zh;
        if (name.vi !== undefined) updates.nameVi = name.vi;
      } else {
        if (name_en !== undefined) updates.nameEn = name_en;
        if (name_ko !== undefined) updates.nameKo = name_ko;
        if (name_zh !== undefined) updates.nameZh = name_zh;
        if (name_vi !== undefined) updates.nameVi = name_vi;
      }
    }

    // Support both object format and flat format for description
    if (description || description_en !== undefined) {
      if (typeof description === 'object') {
        if (description.en !== undefined) updates.descriptionEn = description.en;
        if (description.ko !== undefined) updates.descriptionKo = description.ko;
        if (description.zh !== undefined) updates.descriptionZh = description.zh;
        if (description.vi !== undefined) updates.descriptionVi = description.vi;
      } else {
        if (description_en !== undefined) updates.descriptionEn = description_en;
        if (description_ko !== undefined) updates.descriptionKo = description_ko;
        if (description_zh !== undefined) updates.descriptionZh = description_zh;
        if (description_vi !== undefined) updates.descriptionVi = description_vi;
      }
    }

    if (type !== undefined) updates.type = type;
    if (settings !== undefined) updates.settings = settings;
    if (writeRoles !== undefined) updates.writeRoles = writeRoles;
    if (readRoles !== undefined) updates.readRoles = readRoles;
    if (category !== undefined) updates.category = category;
    if (order !== undefined) updates.order = order;
    if (status !== undefined) updates.status = status;

    const dbBoardType = await boardTypeService.updateBoardType(req.params.id, updates);
    const updatedBoardType = transformBoardTypeToAPI(dbBoardType!);

    res.json({ success: true, data: updatedBoardType });
  } catch (error) {
    logger.error('Error updating board type:', error);
    res.status(500).json({ success: false, error: 'Failed to update board type' });
  }
});

/**
 * DELETE /content/board-types/:id - Delete a board type
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const existingBoardType = await boardTypeService.getBoardTypeById(req.params.id);
    if (!existingBoardType) {
      return res.status(404).json({ success: false, error: 'Board type not found' });
    }

    try {
      await boardTypeService.deleteBoardType(req.params.id);
      const deletedBoardType = transformBoardTypeToAPI(existingBoardType);
      res.json({ success: true, message: 'Board type deleted successfully', data: deletedBoardType });
    } catch (error: any) {
      if (error.message.includes('existing posts')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Error deleting board type:', error);
    res.status(500).json({ success: false, error: 'Failed to delete board type' });
  }
});

export default router;
