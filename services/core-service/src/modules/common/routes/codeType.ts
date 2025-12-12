/**
 * Code Type Routes - Common Module
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as codeService from '../services/codeService';
import { authenticateToken } from '../../../middleware/authMiddleware';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('core-service:common:codeType');

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

router.get('/by-code/:code', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const codeType = await codeService.getCodeTypeByCode(req.params.code);
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

router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const codeType = await codeService.getCodeTypeById(req.params.id);
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
      nameEn: name.en || '', nameKo: name.ko || '', nameZh: name.zh || '', nameVi: name.vi || '',
      descriptionEn: description.en || '', descriptionKo: description.ko || '',
      descriptionZh: description.zh || '', descriptionVi: description.vi || ''
    };

    const newCodeType = await codeService.createCodeType(codeTypeData);
    res.status(201).json({ codeType: newCodeType });
  } catch (error: any) {
    logger.error('Create code type error:', error);
    res.status(500).json({ error: 'Failed to create code type' });
  }
});

router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const existingCodeType = await codeService.getCodeTypeById(req.params.id);
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
      nameEn: name.en, nameKo: name.ko, nameZh: name.zh, nameVi: name.vi,
      descriptionEn: description.en, descriptionKo: description.ko,
      descriptionZh: description.zh, descriptionVi: description.vi
    };

    const updatedCodeType = await codeService.updateCodeType(req.params.id, updates);
    res.json({ codeType: updatedCodeType });
  } catch (error: any) {
    logger.error('Update code type error:', error);
    res.status(500).json({ error: 'Failed to update code type' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const codeType = await codeService.getCodeTypeById(req.params.id);
    if (!codeType) {
      res.status(404).json({ error: 'Code type not found' });
      return;
    }

    const relatedCodes = await codeService.getCodesByType(codeType.code);
    const relatedCodesCount = relatedCodes.length;

    for (const code of relatedCodes) {
      await codeService.deleteCode(code.id);
    }

    await codeService.deleteCodeType(req.params.id);

    res.json({ message: 'Code type deleted successfully', deletedCodesCount: relatedCodesCount });
  } catch (error: any) {
    logger.error('Delete code type error:', error);
    res.status(500).json({ error: 'Failed to delete code type' });
  }
});

export default router;
