/**
 * Code Type Routes
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as codeService from '../services/codeService';
import { authenticateToken } from '../middleware';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('common-service:routes:codeType');

/**
 * GET /code-types - Get all code types
 */
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    const codeTypes = await codeService.getAllCodeTypes({ search: search as string });
    res.json({ codeTypes });
  } catch (error: any) {
    logger.error('Get code types error:', error);
    res.status(500).json({ error: 'Failed to fetch code types' });
  }
});

/**
 * GET /code-types/by-code/:code - Get code type by code
 */
router.get('/by-code/:code', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const codeType = await codeService.getCodeTypeByCode(code);

    if (!codeType) {
      res.status(404).json({ error: 'Code type not found' });
      return;
    }

    res.json({ codeType });
  } catch (error: any) {
    logger.error('Get code type by code error:', error);
    res.status(500).json({ error: 'Failed to fetch code type' });
  }
});

/**
 * GET /code-types/:id - Get code type by ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const codeType = await codeService.getCodeTypeById(id);

    if (!codeType) {
      res.status(404).json({ error: 'Code type not found' });
      return;
    }

    res.json({ codeType });
  } catch (error: any) {
    logger.error('Get code type error:', error);
    res.status(500).json({ error: 'Failed to fetch code type' });
  }
});

/**
 * POST /code-types - Create new code type
 */
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const existingCodeType = await codeService.getCodeTypeByCode(req.body.code);
    if (existingCodeType) {
      res.status(400).json({ error: 'Code type already exists' });
      return;
    }

    const name = req.body.name || {};
    const description = req.body.description || {};

    const codeTypeData = {
      id: uuidv4(),
      code: req.body.code,
      nameEn: name.en || '',
      nameKo: name.ko || '',
      nameZh: name.zh || '',
      nameVi: name.vi || '',
      descriptionEn: description.en || '',
      descriptionKo: description.ko || '',
      descriptionZh: description.zh || '',
      descriptionVi: description.vi || ''
    };

    const newCodeType = await codeService.createCodeType(codeTypeData);
    res.status(201).json({ codeType: newCodeType });
  } catch (error: any) {
    logger.error('Create code type error:', error);
    res.status(500).json({ error: 'Failed to create code type' });
  }
});

/**
 * PUT /code-types/:id - Update code type
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingCodeType = await codeService.getCodeTypeById(id);
    if (!existingCodeType) {
      res.status(404).json({ error: 'Code type not found' });
      return;
    }

    if (req.body.code && req.body.code !== existingCodeType.code) {
      const duplicateCodeType = await codeService.getCodeTypeByCode(req.body.code);
      if (duplicateCodeType) {
        res.status(400).json({ error: 'Code type code already exists' });
        return;
      }
    }

    const name = req.body.name || {};
    const description = req.body.description || {};

    const updates = {
      code: req.body.code,
      nameEn: name.en,
      nameKo: name.ko,
      nameZh: name.zh,
      nameVi: name.vi,
      descriptionEn: description.en,
      descriptionKo: description.ko,
      descriptionZh: description.zh,
      descriptionVi: description.vi
    };

    const updatedCodeType = await codeService.updateCodeType(id, updates);
    res.json({ codeType: updatedCodeType });
  } catch (error: any) {
    logger.error('Update code type error:', error);
    res.status(500).json({ error: 'Failed to update code type' });
  }
});

/**
 * DELETE /code-types/:id - Delete code type (cascade)
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const codeType = await codeService.getCodeTypeById(id);
    if (!codeType) {
      res.status(404).json({ error: 'Code type not found' });
      return;
    }

    const relatedCodes = await codeService.getCodesByType(codeType.code);
    const relatedCodesCount = relatedCodes.length;

    for (const code of relatedCodes) {
      await codeService.deleteCode(code.id);
    }

    await codeService.deleteCodeType(id);

    res.json({
      message: 'Code type deleted successfully',
      deletedCodesCount: relatedCodesCount
    });
  } catch (error: any) {
    logger.error('Delete code type error:', error);
    res.status(500).json({ error: 'Failed to delete code type' });
  }
});

export default router;
