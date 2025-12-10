/**
 * Log Analytics Routes
 * Legacy compatible: /api/log-analytics
 */

import { Router, Request, Response } from 'express';
import * as logService from '../services/logService';
import { authenticateToken, requireAdmin } from '../middleware';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('common-service:routes:log-analytics');

/**
 * GET /log-analytics - Get detailed log analytics and statistics (admin only)
 * Compatible with legacy logAnalytics.js
 */
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

/**
 * GET /log-analytics/errors - Get error logs only (admin only)
 * Compatible with legacy logAnalytics.js /errors endpoint
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

export default router;
