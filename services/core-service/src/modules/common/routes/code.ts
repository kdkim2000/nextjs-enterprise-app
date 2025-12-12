/**
 * Code Routes - Common Module
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as codeService from '../services/codeService';
import { authenticateToken } from '../../../middleware/authMiddleware';
import { transformMultiLangFields } from '../utils/multiLangTransform';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('core-service:common:code');

router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { codeType, code, status, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const codes = await codeService.getAllCodes({
      codeType: codeType as string,
      code: code as string,
      status: status as string,
      limit: limitNum,
      offset
    });

    const totalCount = await codeService.getCodeCount({
      codeType: codeType as string,
      code: code as string,
      status: status as string
    });

    const transformedCodes = codes.map(c => transformMultiLangFields(c, ['name', 'description']));

    res.json({
      codes: transformedCodes,
      pagination: { currentPage: pageNum, pageSize: limitNum, totalCount, totalPages: Math.ceil(totalCount / limitNum) }
    });
  } catch (error: any) {
    logger.error('Get codes error:', error);
    res.status(500).json({ error: 'Failed to fetch codes' });
  }
});

router.get('/types/list', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const codeTypes = await codeService.getDistinctCodeTypes();
    res.json({ codeTypes });
  } catch (error: any) {
    logger.error('Get code types error:', error);
    res.status(500).json({ error: 'Failed to fetch code types' });
  }
});

router.get('/type/:codeType', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const codes = await codeService.getCodesByType(req.params.codeType);
    const transformedCodes = codes.map(c => transformMultiLangFields(c, ['name', 'description']));
    res.json({ codes: transformedCodes });
  } catch (error: any) {
    logger.error('Get codes by type error:', error);
    res.status(500).json({ error: 'Failed to fetch codes by type' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const code = await codeService.getCodeById(req.params.id);
    if (!code) {
      res.status(404).json({ error: 'Code not found' });
      return;
    }
    const transformedCode = transformMultiLangFields(code, ['name', 'description']);
    res.json({ code: transformedCode });
  } catch (error: any) {
    logger.error('Get code error:', error);
    res.status(500).json({ error: 'Failed to fetch code' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const existingCode = await codeService.getCodeByTypeAndCode(req.body.codeType, req.body.code);
    if (existingCode) {
      res.status(400).json({ error: 'Code already exists in this code type' });
      return;
    }

    const name = req.body.name || {};
    const description = req.body.description || {};

    const codeData = {
      id: uuidv4(),
      codeType: req.body.codeType,
      code: req.body.code,
      nameEn: name.en || '', nameKo: name.ko || '', nameZh: name.zh || '', nameVi: name.vi || '',
      descriptionEn: description.en || '', descriptionKo: description.ko || '',
      descriptionZh: description.zh || '', descriptionVi: description.vi || '',
      order: req.body.order || 1,
      status: req.body.status || 'active',
      parentCode: req.body.parentCode || undefined,
      attributes: req.body.attributes || {}
    };

    const newCode = await codeService.createCode(codeData);
    const transformedCode = transformMultiLangFields(newCode, ['name', 'description']);
    res.status(201).json({ code: transformedCode });
  } catch (error: any) {
    logger.error('Create code error:', error);
    res.status(500).json({ error: 'Failed to create code' });
  }
});

router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const existingCode = await codeService.getCodeById(req.params.id);
    if (!existingCode) {
      res.status(404).json({ error: 'Code not found' });
      return;
    }

    if (req.body.codeType && req.body.code) {
      const duplicateCode = await codeService.getCodeByTypeAndCode(req.body.codeType, req.body.code);
      if (duplicateCode && duplicateCode.id !== req.params.id) {
        res.status(400).json({ error: 'Code already exists in this code type' });
        return;
      }
    }

    const name = req.body.name || {};
    const description = req.body.description || {};

    const updates = {
      codeType: req.body.codeType,
      code: req.body.code,
      nameEn: name.en, nameKo: name.ko, nameZh: name.zh, nameVi: name.vi,
      descriptionEn: description.en, descriptionKo: description.ko,
      descriptionZh: description.zh, descriptionVi: description.vi,
      order: req.body.order,
      status: req.body.status,
      parentCode: req.body.parentCode,
      attributes: req.body.attributes || {}
    };

    const updatedCode = await codeService.updateCode(req.params.id, updates);
    const transformedCode = transformMultiLangFields(updatedCode, ['name', 'description']);
    res.json({ code: transformedCode });
  } catch (error: any) {
    logger.error('Update code error:', error);
    res.status(500).json({ error: 'Failed to update code' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const existingCode = await codeService.getCodeById(req.params.id);
    if (!existingCode) {
      res.status(404).json({ error: 'Code not found' });
      return;
    }
    await codeService.deleteCode(req.params.id);
    res.json({ message: 'Code deleted successfully' });
  } catch (error: any) {
    logger.error('Delete code error:', error);
    res.status(500).json({ error: 'Failed to delete code' });
  }
});

router.delete('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'Invalid ids array' });
      return;
    }

    let deletedCount = 0;
    for (const id of ids) {
      try {
        await codeService.deleteCode(id);
        deletedCount++;
      } catch (error) {
        logger.error(`Failed to delete code ${id}:`, error);
      }
    }

    res.json({ message: `Successfully deleted ${deletedCount} code(s)` });
  } catch (error: any) {
    logger.error('Bulk delete codes error:', error);
    res.status(500).json({ error: 'Failed to delete codes' });
  }
});

export default router;
