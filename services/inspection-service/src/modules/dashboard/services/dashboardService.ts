/**
 * Dashboard Service - Inspection Statistics and Analytics
 */

import { query } from '../../../utils/database';
import { getLogger } from '@enterprise/shared';

const logger = getLogger('inspection-service:dashboard');

export interface DashboardStats {
  total: number;
  completed: number;
  inProgress: number;
  draft: number;
  submitted: number;
  completionRate: number;
  totalTemplates: number;
}

export interface CategoryStats {
  category: string;
  count: number;
  color: string;
}

export interface TemplateStats {
  id: string;
  name: string;
  code: string;
  inspectionCount: number;
  completedCount: number;
  completionRate: number;
}

export interface MonthlyStats {
  month: string;
  monthLabel: string;
  total: number;
  completed: number;
  rate: number;
}

export interface InspectorStats {
  inspectorId: string;
  inspectorName: string;
  completedCount: number;
  inProgressCount: number;
  totalCount: number;
}

// Color palette for categories
const CATEGORY_COLORS: Record<string, string> = {
  '안전점검': '#4caf50',
  'safety': '#4caf50',
  '일상점검': '#2196f3',
  '정기점검': '#3f51b5',
  '차량점검': '#ff9800',
  '설비점검': '#9c27b0',
  '품질검사': '#00bcd4',
  '환경점검': '#8bc34a',
  '소방점검': '#f44336',
  '위생점검': '#e91e63',
  '건물점검': '#795548',
  '전기점검': '#ffc107',
  'default': '#607d8b',
};

/**
 * Get overall dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get inspection counts by status
    const statusQuery = `
      SELECT
        status,
        COUNT(*) as count
      FROM inspections
      GROUP BY status
    `;
    const statusResult = await query(statusQuery);

    const statusCounts: Record<string, number> = {};
    statusResult.rows.forEach(row => {
      statusCounts[row.status] = parseInt(row.count, 10);
    });

    // Get template count
    const templateQuery = `SELECT COUNT(*) as count FROM checksheet_templates WHERE status = 'active'`;
    const templateResult = await query(templateQuery);
    const totalTemplates = parseInt(templateResult.rows[0]?.count || '0', 10);

    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    const completed = (statusCounts['completed'] || 0) + (statusCounts['submitted'] || 0);
    const inProgress = statusCounts['in_progress'] || 0;
    const draft = statusCounts['draft'] || 0;
    const submitted = statusCounts['submitted'] || 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100 * 10) / 10 : 0;

    return {
      total,
      completed,
      inProgress,
      draft,
      submitted,
      completionRate,
      totalTemplates,
    };
  } catch (error) {
    logger.error('Error getting dashboard stats:', error);
    throw error;
  }
}

/**
 * Get inspection statistics by category
 */
export async function getCategoryStats(): Promise<CategoryStats[]> {
  try {
    const categoryQuery = `
      SELECT
        COALESCE(t.category, 'uncategorized') as category,
        COUNT(i.id) as count
      FROM checksheet_templates t
      LEFT JOIN inspections i ON t.id = i.template_id
      GROUP BY t.category
      ORDER BY count DESC
    `;
    const result = await query(categoryQuery);

    return result.rows.map(row => ({
      category: row.category || 'uncategorized',
      count: parseInt(row.count, 10),
      color: CATEGORY_COLORS[row.category] || CATEGORY_COLORS['default'],
    }));
  } catch (error) {
    logger.error('Error getting category stats:', error);
    throw error;
  }
}

/**
 * Get inspection statistics by template
 */
export async function getTemplateStats(limit: number = 10): Promise<TemplateStats[]> {
  try {
    const templateQuery = `
      SELECT
        t.id,
        t.name,
        t.code,
        COUNT(i.id) as inspection_count,
        SUM(CASE WHEN i.status IN ('completed', 'submitted') THEN 1 ELSE 0 END) as completed_count
      FROM checksheet_templates t
      LEFT JOIN inspections i ON t.id = i.template_id
      GROUP BY t.id, t.name, t.code
      ORDER BY inspection_count DESC
      LIMIT $1
    `;
    const result = await query(templateQuery, [limit]);

    return result.rows.map(row => {
      const inspectionCount = parseInt(row.inspection_count, 10);
      const completedCount = parseInt(row.completed_count, 10);
      return {
        id: row.id,
        name: row.name,
        code: row.code,
        inspectionCount,
        completedCount,
        completionRate: inspectionCount > 0
          ? Math.round((completedCount / inspectionCount) * 100)
          : 0,
      };
    });
  } catch (error) {
    logger.error('Error getting template stats:', error);
    throw error;
  }
}

/**
 * Get monthly inspection statistics
 */
export async function getMonthlyStats(months: number = 6): Promise<MonthlyStats[]> {
  try {
    const monthlyQuery = `
      SELECT
        DATE_TRUNC('month', created_at) as month,
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month_label,
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('completed', 'submitted') THEN 1 ELSE 0 END) as completed
      FROM inspections
      WHERE created_at >= NOW() - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `;
    const result = await query(monthlyQuery);

    // If no data, generate empty months
    if (result.rows.length === 0) {
      const emptyMonths: MonthlyStats[] = [];
      const now = new Date();
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        emptyMonths.push({
          month: date.toISOString(),
          monthLabel: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          total: 0,
          completed: 0,
          rate: 0,
        });
      }
      return emptyMonths;
    }

    return result.rows.map(row => {
      const total = parseInt(row.total, 10);
      const completed = parseInt(row.completed, 10);
      return {
        month: row.month,
        monthLabel: row.month_label,
        total,
        completed,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  } catch (error) {
    logger.error('Error getting monthly stats:', error);
    throw error;
  }
}

/**
 * Get inspection statistics by inspector
 */
export async function getInspectorStats(limit: number = 10): Promise<InspectorStats[]> {
  try {
    const inspectorQuery = `
      SELECT
        i.inspector_id,
        COALESCE(u.name_ko, u.name_en, i.inspector_id, 'Unknown') as inspector_name,
        COUNT(*) as total_count,
        SUM(CASE WHEN i.status IN ('completed', 'submitted') THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN i.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count
      FROM inspections i
      LEFT JOIN users u ON i.inspector_id = u.id
      WHERE i.inspector_id IS NOT NULL AND i.inspector_id != ''
      GROUP BY i.inspector_id, u.name_ko, u.name_en
      ORDER BY total_count DESC
      LIMIT $1
    `;
    const result = await query(inspectorQuery, [limit]);

    return result.rows.map(row => ({
      inspectorId: row.inspector_id,
      inspectorName: row.inspector_name,
      completedCount: parseInt(row.completed_count, 10),
      inProgressCount: parseInt(row.in_progress_count, 10),
      totalCount: parseInt(row.total_count, 10),
    }));
  } catch (error) {
    logger.error('Error getting inspector stats:', error);
    throw error;
  }
}

/**
 * Get recent inspections
 */
export async function getRecentInspections(limit: number = 5) {
  try {
    const recentQuery = `
      SELECT
        i.id,
        i.inspection_code,
        i.target_name,
        i.status,
        i.created_at,
        t.name as template_name,
        COALESCE(u.name_ko, u.name_en, 'Unknown') as inspector_name
      FROM inspections i
      LEFT JOIN checksheet_templates t ON i.template_id = t.id
      LEFT JOIN users u ON i.inspector_id = u.id
      ORDER BY i.created_at DESC
      LIMIT $1
    `;
    const result = await query(recentQuery, [limit]);

    return result.rows.map(row => ({
      id: row.id,
      inspectionCode: row.inspection_code,
      targetName: row.target_name,
      status: row.status,
      createdAt: row.created_at,
      templateName: row.template_name,
      inspectorName: row.inspector_name,
    }));
  } catch (error) {
    logger.error('Error getting recent inspections:', error);
    throw error;
  }
}

/**
 * Get full dashboard data
 */
export async function getFullDashboardData() {
  try {
    const [stats, categoryStats, templateStats, monthlyStats, inspectorStats, recentInspections] = await Promise.all([
      getDashboardStats(),
      getCategoryStats(),
      getTemplateStats(10),
      getMonthlyStats(6),
      getInspectorStats(10),
      getRecentInspections(5),
    ]);

    return {
      stats,
      categoryStats,
      templateStats,
      monthlyStats,
      inspectorStats,
      recentInspections,
    };
  } catch (error) {
    logger.error('Error getting full dashboard data:', error);
    throw error;
  }
}
