/**
 * Dashboard Routes - Inspection Statistics API
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '@enterprise/shared';
import * as dashboardService from '../services/dashboardService';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('inspection-service:dashboard');

/**
 * GET /inspection/dashboard
 * Get full dashboard data (stats, categories, templates, monthly, inspectors)
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const data = await dashboardService.getFullDashboardData();
    res.json(data);
  } catch (error) {
    logger.error('Get dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

/**
 * GET /inspection/dashboard/stats
 * Get overview statistics only
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * GET /inspection/dashboard/categories
 * Get inspection statistics by category
 */
router.get('/categories', authenticateToken, async (req: Request, res: Response) => {
  try {
    const categoryStats = await dashboardService.getCategoryStats();
    res.json(categoryStats);
  } catch (error) {
    logger.error('Get category stats error:', error);
    res.status(500).json({ error: 'Failed to fetch category statistics' });
  }
});

/**
 * GET /inspection/dashboard/templates
 * Get inspection statistics by template
 */
router.get('/templates', authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const templateStats = await dashboardService.getTemplateStats(limit);
    res.json(templateStats);
  } catch (error) {
    logger.error('Get template stats error:', error);
    res.status(500).json({ error: 'Failed to fetch template statistics' });
  }
});

/**
 * GET /inspection/dashboard/monthly
 * Get monthly inspection statistics
 */
router.get('/monthly', authenticateToken, async (req: Request, res: Response) => {
  try {
    const months = parseInt(req.query.months as string, 10) || 6;
    const monthlyStats = await dashboardService.getMonthlyStats(months);
    res.json(monthlyStats);
  } catch (error) {
    logger.error('Get monthly stats error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly statistics' });
  }
});

/**
 * GET /inspection/dashboard/inspectors
 * Get inspection statistics by inspector
 */
router.get('/inspectors', authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const inspectorStats = await dashboardService.getInspectorStats(limit);
    res.json(inspectorStats);
  } catch (error) {
    logger.error('Get inspector stats error:', error);
    res.status(500).json({ error: 'Failed to fetch inspector statistics' });
  }
});

/**
 * GET /inspection/dashboard/recent
 * Get recent inspections
 */
router.get('/recent', authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 5;
    const recentInspections = await dashboardService.getRecentInspections(limit);
    res.json(recentInspections);
  } catch (error) {
    logger.error('Get recent inspections error:', error);
    res.status(500).json({ error: 'Failed to fetch recent inspections' });
  }
});

export default router;
