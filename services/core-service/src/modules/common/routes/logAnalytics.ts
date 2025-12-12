/**
 * Log Analytics Routes - Common Module
 */

import { Router, Request, Response } from 'express';
import * as logService from '../services/logService';
import { authenticateToken, requireAdmin } from '../../../middleware/authMiddleware';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('core-service:common:log-analytics');

router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await logService.getDetailedLogAnalytics({
      startDate: startDate as string,
      endDate: endDate as string
    });
    res.json(analytics);
  } catch (error: any) {
    logger.error('Get log analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
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

export default router;
