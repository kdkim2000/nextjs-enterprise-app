/**
 * Log Routes
 */

import { Router, Request, Response } from 'express';
import * as logService from '../services/logService';
import { authenticateToken, requireAdmin } from '../middleware';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('common-service:routes:log');

/**
 * GET /logs - Get logs with filters (admin only)
 */
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
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error: any) {
    logger.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

/**
 * GET /logs/my-logs - Get user's own logs
 */
router.get('/my-logs', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const filters = {
      userId,
      limit: limitNum,
      offset
    };

    const [logs, totalCount] = await Promise.all([
      logService.getLogs(filters),
      logService.getLogCount({ userId })
    ]);

    res.json({
      logs,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error: any) {
    logger.error('Get my logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

/**
 * GET /logs/analytics - Get log analytics (admin only)
 */
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

/**
 * GET /logs/by-program/:programId - Get logs by program ID
 */
router.get('/by-program/:programId', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { programId } = req.params;
    const { page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const filters = {
      programId,
      limit: limitNum,
      offset
    };

    const [logs, totalCount] = await Promise.all([
      logService.getLogs(filters),
      logService.getLogCount({ programId })
    ]);

    res.json({
      logs,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error: any) {
    logger.error('Get logs by program error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

/**
 * GET /logs/errors - Get error logs (admin only)
 */
router.get('/errors', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      minStatusCode: 400,
      limit: limitNum,
      offset
    };

    const [logs, totalCount] = await Promise.all([
      logService.getLogs(filters),
      logService.getLogCount({ minStatusCode: 400, startDate: startDate as string, endDate: endDate as string })
    ]);

    res.json({
      logs,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error: any) {
    logger.error('Get error logs error:', error);
    res.status(500).json({ error: 'Failed to fetch error logs' });
  }
});

/**
 * POST /logs - Create a log entry
 */
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const logData = {
      ...req.body,
      userId: req.user!.userId
    };

    const log = await logService.createLog(logData);
    res.status(201).json({ log });
  } catch (error: any) {
    logger.error('Create log error:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

/**
 * DELETE /logs/cleanup - Clean up old logs (admin only)
 */
router.delete('/cleanup', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { days = '30' } = req.query;
    const daysNum = parseInt(days as string);

    const deletedCount = await logService.cleanupOldLogs(daysNum);

    res.json({
      message: `Successfully cleaned up logs older than ${daysNum} days`,
      deletedCount
    });
  } catch (error: any) {
    logger.error('Cleanup logs error:', error);
    res.status(500).json({ error: 'Failed to cleanup logs' });
  }
});

export default router;
