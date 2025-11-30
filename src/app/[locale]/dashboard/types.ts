// Dashboard API Response Types

export interface DashboardSummary {
  users: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    growth: number;
  };
  posts: {
    total: number;
    today: number;
    thisWeek: number;
  };
  comments: {
    total: number;
    today: number;
  };
  views: {
    total: number;
    postsViewedToday: number;
  };
  errors: {
    rate: number;
    count: number;
  };
}

export interface ActivityTrendItem {
  date: string;
  posts: number;
  comments: number;
  views: number;
}

export interface UserStatusItem {
  status: string;
  count: number;
  percentage: number;
}

export interface DepartmentStatItem {
  id: string;
  name: string;
  count: number;
}

export interface LoginStatsItem {
  date: string;
  success: number;
  failed: number;
}

export interface MenuUsageItem {
  programId: string;
  name: string;
  accessCount: number;
  uniqueUsers: number;
}

export interface BoardActivityItem {
  id: string;
  name: string;
  postCount: number;
  totalViews: number;
}

export interface SystemPerformanceItem {
  hour: string;
  requests: number;
  avgResponseTime: number;
  errors: number;
}

export interface HttpStatusItem {
  status: string;
  count: number;
  percentage: number;
}

export interface TopPostItem {
  id: string;
  title: string;
  views: number;
  likes: number;
  author: string;
  board: string;
  createdAt: string;
}

export interface ErrorEndpointItem {
  endpoint: string;
  errorCount: number;
  lastError: string;
  statusCode: number;
}

export interface RecentActivityItem {
  type: 'post' | 'comment' | 'error' | 'login';
  id: string | null;
  action: string;
  target: string;
  user: string;
  meta: string | null;
  timestamp: string;
}

// Dashboard Data State
export interface DashboardData {
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
}

export type DateRange = 'today' | '7days' | '30days';
