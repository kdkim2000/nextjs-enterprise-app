import { useState, useEffect, useCallback, useMemo } from 'react';
import { commonApi } from '@/lib/axios';
import {
  DashboardSummary,
  ActivityTrendItem,
  UserStatusItem,
  DepartmentStatItem,
  BoardActivityItem,
  SystemPerformanceItem,
  HttpStatusItem,
  TopPostItem,
  ErrorEndpointItem,
  RecentActivityItem,
  LoginStatsItem,
  MenuUsageItem,
  DateRange
} from '../types';

// Unified dashboard data state
interface DashboardData {
  summary: DashboardSummary | null;
  activityTrend: ActivityTrendItem[];
  userStatus: UserStatusItem[];
  departmentStats: DepartmentStatItem[];
  boardActivity: BoardActivityItem[];
  systemPerformance: SystemPerformanceItem[];
  httpStatus: HttpStatusItem[];
  topPosts: TopPostItem[];
  errorEndpoints: ErrorEndpointItem[];
  recentActivity: RecentActivityItem[];
  loginStats: LoginStatsItem[];
  menuUsage: MenuUsageItem[];
}

const initialData: DashboardData = {
  summary: null,
  activityTrend: [],
  userStatus: [],
  departmentStats: [],
  boardActivity: [],
  systemPerformance: [],
  httpStatus: [],
  topPosts: [],
  errorEndpoints: [],
  recentActivity: [],
  loginStats: [],
  menuUsage: []
};

interface UseDashboardDataReturn extends DashboardData {
  loading: boolean;
  error: string | null;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  refresh: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
  // Single unified state for all dashboard data - reduces re-renders
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRangeState] = useState<DateRange>('7days');

  // Stable setDateRange reference
  const setDateRange = useCallback((range: DateRange) => {
    setDateRangeState(range);
  }, []);

  const getDays = useCallback((range: DateRange): number => {
    switch (range) {
      case 'today':
        return 1;
      case '7days':
        return 7;
      case '30days':
        return 30;
      default:
        return 7;
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const days = getDays(dateRange);

    // Helper to safely fetch data
    // Note: commonApi.get() already returns response.data, not the full response
    const safeFetch = async <T>(
      fetcher: () => Promise<T>,
      defaultValue: T
    ): Promise<T> => {
      try {
        const data = await fetcher();
        return data;
      } catch (err) {
        // Only log non-401 errors (401 is expected when not authenticated)
        if ((err as any)?.response?.status !== 401) {
          console.error('Dashboard API error:', err);
        }
        return defaultValue;
      }
    };

    try {
      // Fetch all data in parallel with individual error handling
      // Using common-service API: /common/dashboard/...
      const [
        summaryData,
        activityData,
        userStatusData,
        deptData,
        boardData,
        perfData,
        httpData,
        postsData,
        errorsData,
        activityFeedData,
        loginStatsData,
        menuUsageData
      ] = await Promise.all([
        safeFetch(() => commonApi.get('/common/dashboard/summary'), null),
        safeFetch(() => commonApi.get(`/common/dashboard/activity-trend?days=${days}`), []),
        safeFetch(() => commonApi.get('/common/dashboard/user-status'), []),
        safeFetch(() => commonApi.get('/common/dashboard/department-stats?limit=8'), []),
        safeFetch(() => commonApi.get('/common/dashboard/board-activity'), []),
        safeFetch(() => commonApi.get('/common/dashboard/system-performance?hours=24'), []),
        safeFetch(() => commonApi.get('/common/dashboard/http-status'), []),
        safeFetch(() => commonApi.get('/common/dashboard/top-posts?limit=5'), []),
        safeFetch(() => commonApi.get('/common/dashboard/error-endpoints?limit=5'), []),
        safeFetch(() => commonApi.get('/common/dashboard/recent-activity?limit=10'), []),
        safeFetch(() => commonApi.get(`/common/dashboard/login-stats?days=${days}`), []),
        safeFetch(() => commonApi.get('/common/dashboard/menu-usage?limit=10'), [])
      ]);

      // Single setState call with all data - prevents multiple re-renders
      setData({
        summary: summaryData,
        activityTrend: activityData,
        userStatus: userStatusData,
        departmentStats: deptData,
        boardActivity: boardData,
        systemPerformance: perfData,
        httpStatus: httpData,
        topPosts: postsData,
        errorEndpoints: errorsData,
        recentActivity: activityFeedData,
        loginStats: loginStatsData,
        menuUsage: menuUsageData
      });

      // Show warning if summary failed (critical data)
      if (!summaryData) {
        setError('일부 데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [dateRange, getDays]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Memoized return value to prevent unnecessary object recreation
  return useMemo(() => ({
    ...data,
    loading,
    error,
    dateRange,
    setDateRange,
    refresh: fetchDashboardData
  }), [data, loading, error, dateRange, setDateRange, fetchDashboardData]);
}
