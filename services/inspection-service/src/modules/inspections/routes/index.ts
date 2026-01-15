/**
 * Inspection Routes - Inspection Execution Management
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '@enterprise/shared';
import * as inspectionService from '../services/inspectionService';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('inspection-service:inspections');

/**
 * GET /inspection/executions
 * List all inspections with pagination and filtering
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      status,
      template_id,
      inspector_id,
      start_date,
      end_date,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const [inspections, totalCount] = await Promise.all([
      inspectionService.getAllInspections({
        limit: limitNum,
        offset,
        search: search as string,
        status: status as string,
        template_id: template_id as string,
        inspector_id: inspector_id as string,
        start_date: start_date as string,
        end_date: end_date as string,
      }),
      inspectionService.getInspectionCount({
        search: search as string,
        status: status as string,
        template_id: template_id as string,
        inspector_id: inspector_id as string,
        start_date: start_date as string,
        end_date: end_date as string,
      }),
    ]);

    res.json({
      inspections,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    logger.error('Get inspections error:', error);
    res.status(500).json({ error: 'Failed to fetch inspections' });
  }
});

/**
 * GET /inspection/executions/:id
 * Get inspection by ID with results
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const includeResults = req.query.includeResults !== 'false';
    const includeTemplate = req.query.includeTemplate === 'true';

    const inspection = await inspectionService.getInspectionById(id, includeResults, includeTemplate);

    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    res.json({ inspection });
  } catch (error) {
    logger.error('Get inspection error:', error);
    res.status(500).json({ error: 'Failed to fetch inspection' });
  }
});

/**
 * POST /inspection/executions
 * Create new inspection (start inspection)
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const inspectionData = {
      ...req.body,
      inspector_id: userId,
      status: 'in_progress',
      started_at: new Date(),
    };

    // Validate required fields
    if (!inspectionData.template_id) {
      return res.status(400).json({ error: 'template_id is required' });
    }

    // Generate inspection code if not provided
    if (!inspectionData.inspection_code) {
      inspectionData.inspection_code = await inspectionService.generateInspectionCode();
    }

    const inspection = await inspectionService.createInspection(inspectionData);
    res.status(201).json(inspection);
  } catch (error) {
    logger.error('Create inspection error:', error);
    res.status(500).json({ error: 'Failed to create inspection' });
  }
});

/**
 * PUT /inspection/executions/:id
 * Update inspection info
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingInspection = await inspectionService.getInspectionById(id, false);
    if (!existingInspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // For submitted inspections, only allow updating certain fields
    if (existingInspection.status === 'submitted') {
      const allowedFieldsForSubmitted = ['inspection_date', 'notes', 'title', 'location'];
      const updateKeys = Object.keys(updates);
      const hasDisallowedFields = updateKeys.some(key => !allowedFieldsForSubmitted.includes(key));

      if (hasDisallowedFields) {
        return res.status(400).json({
          error: 'Cannot modify submitted inspection. Only inspection_date, notes, title, and location can be updated.',
          allowedFields: allowedFieldsForSubmitted
        });
      }
    }

    const inspection = await inspectionService.updateInspection(id, updates);
    res.json(inspection);
  } catch (error) {
    logger.error('Update inspection error:', error);
    res.status(500).json({ error: 'Failed to update inspection' });
  }
});

/**
 * PUT /inspection/executions/:id/results
 * Save inspection results (bulk update)
 */
router.put('/:id/results', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { results } = req.body;

    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'results array is required' });
    }

    const existingInspection = await inspectionService.getInspectionById(id, false);
    if (!existingInspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    if (existingInspection.status === 'submitted') {
      return res.status(400).json({ error: 'Cannot modify submitted inspection' });
    }

    const savedResults = await inspectionService.saveResults(id, results);
    res.json(savedResults);
  } catch (error) {
    logger.error('Save results error:', error);
    res.status(500).json({ error: 'Failed to save results' });
  }
});

/**
 * POST /inspection/executions/:id/submit
 * Submit inspection (finalize)
 */
router.post('/:id/submit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingInspection = await inspectionService.getInspectionById(id, true);
    if (!existingInspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    if (existingInspection.status === 'submitted') {
      return res.status(400).json({ error: 'Inspection already submitted' });
    }

    // Validate all required items have results
    const validation = await inspectionService.validateInspectionCompletion(id);
    if (!validation.isComplete) {
      return res.status(400).json({
        error: 'Inspection is not complete',
        missingItems: validation.missingItems,
      });
    }

    const inspection = await inspectionService.submitInspection(id);
    res.json(inspection);
  } catch (error) {
    logger.error('Submit inspection error:', error);
    res.status(500).json({ error: 'Failed to submit inspection' });
  }
});

/**
 * DELETE /inspection/executions/:id
 * Delete inspection (only draft/in_progress)
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingInspection = await inspectionService.getInspectionById(id, false);
    if (!existingInspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    if (['completed', 'submitted'].includes(existingInspection.status)) {
      return res.status(400).json({ error: 'Cannot delete completed or submitted inspection' });
    }

    await inspectionService.deleteInspection(id);
    res.json({ message: 'Inspection deleted successfully' });
  } catch (error) {
    logger.error('Delete inspection error:', error);
    res.status(500).json({ error: 'Failed to delete inspection' });
  }
});

/**
 * GET /inspection/executions/:id/results
 * Get results for an inspection
 */
router.get('/:id/results', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingInspection = await inspectionService.getInspectionById(id, false);
    if (!existingInspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    const results = await inspectionService.getInspectionResults(id);
    res.json({ results });
  } catch (error) {
    logger.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

export default router;
