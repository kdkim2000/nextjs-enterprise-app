/**
 * Dashboard Routes
 */

import { Router, Request, Response } from 'express';
import * as dashboardService from '../services/dashboardService';
import { authenticateToken, requireAdmin } from '../middleware';
import { getLogger } from '@enterprise/shared';

const router = Router();
const logger = getLogger('common-service:routes:dashboard');

/**
 * GET /dashboard/summary - Get dashboard summary KPIs
 */
router.get('/summary', authenticateToken, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const summary = await dashboardService.getDashboardSummary();
    res.json(summary);
  } catch (error: any) {
    logger.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary', details: error.message });
  }
});

/**
 * GET /dashboard/activity-trend - Get activity trend data for charts
 */
router.get('/activity-trend', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const trend = await dashboardService.getActivityTrend(days);
    res.json(trend);
  } catch (error: any) {
    logger.error('Activity trend error:', error);
    res.status(500).json({ error: 'Failed to fetch activity trend', details: error.message });
  }
});

/**
 * GET /dashboard/user-status - Get user status distribution
 */
router.get('/user-status', authenticateToken, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const distribution = await dashboardService.getUserStatusDistribution();
    res.json(distribution);
  } catch (error: any) {
    logger.error('User status error:', error);
    res.status(500).json({ error: 'Failed to fetch user status' });
  }
});

/**
 * GET /dashboard/department-stats - Get department user statistics
 */
router.get('/department-stats', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const stats = await dashboardService.getDepartmentStats(limit);
    res.json(stats);
  } catch (error: any) {
    logger.error('Department stats error:', error);
    res.status(500).json({ error: 'Failed to fetch department stats' });
  }
});

/**
 * GET /dashboard/board-activity - Get board activity statistics
 */
router.get('/board-activity', authenticateToken, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const activity = await dashboardService.getBoardActivity();
    res.json(activity);
  } catch (error: any) {
    logger.error('Board activity error:', error);
    res.status(500).json({ error: 'Failed to fetch board activity' });
  }
});

/**
 * GET /dashboard/system-performance - Get system performance metrics
 */
router.get('/system-performance', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const performance = await dashboardService.getSystemPerformance(hours);
    res.json(performance);
  } catch (error: any) {
    logger.error('System performance error:', error);
    res.status(500).json({ error: 'Failed to fetch system performance' });
  }
});

/**
 * GET /dashboard/http-status - Get HTTP status code distribution
 */
router.get('/http-status', authenticateToken, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const distribution = await dashboardService.getHttpStatusDistribution();
    res.json(distribution);
  } catch (error: any) {
    logger.error('HTTP status error:', error);
    res.status(500).json({ error: 'Failed to fetch HTTP status' });
  }
});

/**
 * GET /dashboard/top-posts - Get top posts by view count
 */
router.get('/top-posts', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const posts = await dashboardService.getTopPosts(limit);
    res.json(posts);
  } catch (error: any) {
    logger.error('Top posts error:', error);
    res.status(500).json({ error: 'Failed to fetch top posts' });
  }
});

/**
 * GET /dashboard/error-endpoints - Get endpoints with most errors
 */
router.get('/error-endpoints', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const endpoints = await dashboardService.getErrorEndpoints(limit);
    res.json(endpoints);
  } catch (error: any) {
    logger.error('Error endpoints error:', error);
    res.status(500).json({ error: 'Failed to fetch error endpoints' });
  }
});

/**
 * GET /dashboard/recent-activity - Get recent activity feed
 */
router.get('/recent-activity', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await dashboardService.getRecentActivity(limit);
    res.json(activities);
  } catch (error: any) {
    logger.error('Recent activity error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

/**
 * GET /dashboard/login-stats - Get login statistics
 */
router.get('/login-stats', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const stats = await dashboardService.getLoginStats(days);
    res.json(stats);
  } catch (error: any) {
    logger.error('Login stats error:', error);
    res.status(500).json({ error: 'Failed to fetch login stats' });
  }
});

/**
 * GET /dashboard/menu-usage - Get menu/program usage statistics
 */
router.get('/menu-usage', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const usage = await dashboardService.getMenuUsage(limit);
    res.json(usage);
  } catch (error: any) {
    logger.error('Menu usage error:', error);
    res.status(500).json({ error: 'Failed to fetch menu usage' });
  }
});

export default router;
