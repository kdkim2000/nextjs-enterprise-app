/**
 * Program Routes - Admin Module
 */

import { Router, Request, Response } from 'express';
import { getLogger } from '@enterprise/shared';
import { authenticateToken, requireAdmin } from '../../../middleware/authMiddleware';
import * as programService from '../services/programService';
import { transformMultiLangFields } from '../utils/multiLangTransform';

const router = Router();
const logger = getLogger('core-service:admin:program-routes');

function transformProgramToAPI(dbProgram: any) {
  if (!dbProgram) return null;
  const transformed = transformMultiLangFields(dbProgram, ['name', 'description']);
  return {
    id: transformed.id, code: transformed.code, name: transformed.name, description: transformed.description,
    category: transformed.category, type: transformed.type, status: transformed.status,
    permissions: transformed.permissions, createdAt: transformed.created_at, updatedAt: transformed.updated_at
  };
}

router.get('/all', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const options: any = {};
    if (status) options.status = status as string;
    const dbPrograms = await programService.getAllPrograms(options);
    res.json({ programs: dbPrograms.map(transformProgramToAPI) });
  } catch (error: any) {
    logger.error('Error fetching all programs:', error);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

router.get('/categories', authenticateToken, async (req: Request, res: Response) => {
  try {
    res.json({ categories: await programService.getCategories() });
  } catch (error: any) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/types', authenticateToken, async (req: Request, res: Response) => {
  try {
    res.json({ types: await programService.getTypes() });
  } catch (error: any) {
    logger.error('Error fetching types:', error);
    res.status(500).json({ error: 'Failed to fetch types' });
  }
});

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { search, category, type, status, page = '1', limit = '50' } = req.query;
    const options: any = {};
    if (search) options.search = search as string;
    if (category) options.category = category as string;
    if (type) options.type = type as string;
    if (status) options.status = status as string;

    const dbPrograms = await programService.getAllPrograms(options);
    const allPrograms = dbPrograms.map(transformProgramToAPI);

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const totalCount = allPrograms.length;
    const programs = allPrograms.slice((pageNum - 1) * limitNum, (pageNum - 1) * limitNum + limitNum);

    res.json({ programs, pagination: { page: pageNum, limit: limitNum, totalCount, totalPages: Math.ceil(totalCount / limitNum) } });
  } catch (error: any) {
    logger.error('Error fetching programs:', error);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const dbProgram = await programService.getProgramById(req.params.id);
    if (!dbProgram) return res.status(404).json({ error: 'Program not found' });
    res.json({ program: transformProgramToAPI(dbProgram) });
  } catch (error: any) {
    logger.error('Error fetching program:', error);
    res.status(500).json({ error: 'Failed to fetch program' });
  }
});

router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { code, name, description, category, type, status, permissions } = req.body;
    if (!code || !name) return res.status(400).json({ error: 'Code and name are required' });

    if (await programService.getProgramByCode(code)) return res.status(400).json({ error: 'Program code already exists' });

    const programData: any = { code, category, type, status, permissions };
    if (typeof name === 'object') { programData.nameEn = name.en || ''; programData.nameKo = name.ko || ''; programData.nameZh = name.zh || ''; programData.nameVi = name.vi || ''; }
    else programData.nameEn = name;

    if (typeof description === 'object') { programData.descriptionEn = description.en || ''; programData.descriptionKo = description.ko || ''; programData.descriptionZh = description.zh || ''; programData.descriptionVi = description.vi || ''; }
    else if (description) programData.descriptionEn = description;

    const dbProgram = await programService.createProgram(programData);
    logger.info(`Program created: ${code}`);
    res.status(201).json({ program: transformProgramToAPI(dbProgram) });
  } catch (error: any) {
    logger.error('Error creating program:', error);
    if (error.code === '23505') return res.status(400).json({ error: 'Program code already exists' });
    res.status(500).json({ error: 'Failed to create program' });
  }
});

router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, description, category, type, status, permissions } = req.body;

    const existing = await programService.getProgramById(id);
    if (!existing) return res.status(404).json({ error: 'Program not found' });

    if (code && code !== existing.code) {
      const conflict = await programService.getProgramByCode(code);
      if (conflict && conflict.id !== id) return res.status(400).json({ error: 'Program code already exists' });
    }

    const updates: any = {};
    if (code !== undefined) updates.code = code;
    if (category !== undefined) updates.category = category;
    if (type !== undefined) updates.type = type;
    if (status !== undefined) updates.status = status;
    if (permissions !== undefined) updates.permissions = permissions;

    if (name) {
      if (typeof name === 'object') {
        if (name.en !== undefined) updates.nameEn = name.en;
        if (name.ko !== undefined) updates.nameKo = name.ko;
        if (name.zh !== undefined) updates.nameZh = name.zh;
        if (name.vi !== undefined) updates.nameVi = name.vi;
      } else updates.nameEn = name;
    }

    if (description) {
      if (typeof description === 'object') {
        if (description.en !== undefined) updates.descriptionEn = description.en;
        if (description.ko !== undefined) updates.descriptionKo = description.ko;
        if (description.zh !== undefined) updates.descriptionZh = description.zh;
        if (description.vi !== undefined) updates.descriptionVi = description.vi;
      } else updates.descriptionEn = description;
    }

    const dbProgram = await programService.updateProgram(id, updates);
    res.json({ program: transformProgramToAPI(dbProgram) });
  } catch (error: any) {
    logger.error('Error updating program:', error);
    res.status(500).json({ error: 'Failed to update program' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const existing = await programService.getProgramById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Program not found' });

    await programService.deleteProgram(req.params.id);
    logger.info(`Program deleted: ${existing.code}`);
    res.json({ message: 'Program deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting program:', error);
    res.status(500).json({ error: 'Failed to delete program' });
  }
});

export default router;
