/**
 * Log Routes - Common Module
 */

import { Router, Request, Response } from 'express';
import * as logService from '../services/logService';
import { authenticateToken, requireAdmin } from '../../../middleware/authMiddleware';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('core-service:common:log');

router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, path, method, programId, statusCode, startDate, endDate, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const filters = {
      userId: userId as string,
      path: path as string,
      method: method as string,
      programId: programId as string,
      statusCode: statusCode ? parseInt(statusCode as string) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
      limit: limitNum,
      offset
    };

    const [logs, totalCount] = await Promise.all([
      logService.getLogs(filters),
      logService.getLogCount(filters)
    ]);

    res.json({
      logs,
      pagination: { total: totalCount, page: pageNum, limit: limitNum, totalPages: Math.ceil(totalCount / limitNum) }
    });
  } catch (error: any) {
    logger.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

router.get('/my-logs', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const [logs, totalCount] = await Promise.all([
      logService.getLogs({ userId, limit: limitNum, offset }),
      logService.getLogCount({ userId })
    ]);

    res.json({
      logs,
      pagination: { total: totalCount, page: pageNum, limit: limitNum, totalPages: Math.ceil(totalCount / limitNum) }
    });
  } catch (error: any) {
    logger.error('Get my logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

router.get('/analytics', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await logService.getLogAnalytics({
      startDate: startDate as string,
      endDate: endDate as string
    });
    res.json({ analytics });
  } catch (error: any) {
    logger.error('Get log analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch log analytics' });
  }
});

router.get('/by-program/:programId', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const [logs, totalCount] = await Promise.all([
      logService.getLogs({ programId: req.params.programId, limit: limitNum, offset }),
      logService.getLogCount({ programId: req.params.programId })
    ]);

    res.json({
      logs,
      pagination: { total: totalCount, page: pageNum, limit: limitNum, totalPages: Math.ceil(totalCount / limitNum) }
    });
  } catch (error: any) {
    logger.error('Get logs by program error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

router.get('/errors', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const [logs, totalCount] = await Promise.all([
      logService.getLogs({
        startDate: startDate as string,
        endDate: endDate as string,
        minStatusCode: 400,
        limit: limitNum,
        offset
      }),
      logService.getLogCount({ minStatusCode: 400, startDate: startDate as string, endDate: endDate as string })
    ]);

    res.json({
      logs,
      pagination: { total: totalCount, page: pageNum, limit: limitNum, totalPages: Math.ceil(totalCount / limitNum) }
    });
  } catch (error: any) {
    logger.error('Get error logs error:', error);
    res.status(500).json({ error: 'Failed to fetch error logs' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const logData = { ...req.body, userId: req.user!.userId };
    const log = await logService.createLog(logData);
    res.status(201).json({ log });
  } catch (error: any) {
    logger.error('Create log error:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

router.delete('/cleanup', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { days = '30' } = req.query;
    const daysNum = parseInt(days as string);
    const deletedCount = await logService.cleanupOldLogs(daysNum);
    res.json({ message: `Successfully cleaned up logs older than ${daysNum} days`, deletedCount });
  } catch (error: any) {
    logger.error('Cleanup logs error:', error);
    res.status(500).json({ error: 'Failed to cleanup logs' });
  }
});

export default router;
