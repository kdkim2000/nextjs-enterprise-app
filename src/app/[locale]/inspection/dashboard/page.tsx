'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid2 as Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Assessment as DashboardIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Warning as OverdueIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieLabelRenderProps,
} from 'recharts';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import { StatCard } from '@/components/inspection/common';
import { useCurrentLocale } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

interface DashboardStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
  trend: number;
}

interface MonthlyData {
  month: string;
  completed: number;
  total: number;
  rate: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface TemplatePerformance {
  name: string;
  inspections: number;
  avgCompletionTime: number;
  completionRate: number;
}

interface InspectorPerformance {
  name: string;
  completed: number;
  avgTime: number;
  rating: number;
}

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'];

export default function InspectionDashboardPage() {
  const currentLocale = useCurrentLocale();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [templatePerformance, setTemplatePerformance] = useState<TemplatePerformance[]>([]);
  const [inspectorPerformance, setInspectorPerformance] = useState<InspectorPerformance[]>([]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // In production, these would be real API calls
      // For now, generate mock data
      const mockStats: DashboardStats = {
        total: 156,
        completed: 128,
        inProgress: 18,
        overdue: 10,
        completionRate: 82.1,
        trend: 5.3,
      };

      const mockMonthlyData: MonthlyData[] = [
        { month: 'Jan', completed: 45, total: 52, rate: 86.5 },
        { month: 'Feb', completed: 38, total: 48, rate: 79.2 },
        { month: 'Mar', completed: 52, total: 58, rate: 89.7 },
        { month: 'Apr', completed: 48, total: 55, rate: 87.3 },
        { month: 'May', completed: 61, total: 68, rate: 89.7 },
        { month: 'Jun', completed: 55, total: 62, rate: 88.7 },
      ];

      const mockCategoryData: CategoryData[] = [
        { name: getLocalizedValue({ en: 'Safety', ko: '안전 점검' }, currentLocale), value: 45, color: '#4caf50' },
        { name: getLocalizedValue({ en: 'Quality', ko: '품질 검사' }, currentLocale), value: 32, color: '#2196f3' },
        { name: getLocalizedValue({ en: 'Equipment', ko: '설비 점검' }, currentLocale), value: 28, color: '#ff9800' },
        { name: getLocalizedValue({ en: 'Environment', ko: '환경 점검' }, currentLocale), value: 18, color: '#9c27b0' },
        { name: getLocalizedValue({ en: 'Other', ko: '기타' }, currentLocale), value: 12, color: '#607d8b' },
      ];

      const mockTemplatePerformance: TemplatePerformance[] = [
        { name: getLocalizedValue({ en: 'Daily Safety Check', ko: '일일 안전 점검' }, currentLocale), inspections: 120, avgCompletionTime: 15, completionRate: 95 },
        { name: getLocalizedValue({ en: 'Equipment Maintenance', ko: '설비 유지보수' }, currentLocale), inspections: 45, avgCompletionTime: 45, completionRate: 88 },
        { name: getLocalizedValue({ en: 'Quality Audit', ko: '품질 감사' }, currentLocale), inspections: 32, avgCompletionTime: 60, completionRate: 92 },
        { name: getLocalizedValue({ en: 'Fire Safety', ko: '소방 점검' }, currentLocale), inspections: 24, avgCompletionTime: 30, completionRate: 100 },
        { name: getLocalizedValue({ en: 'Cleanliness Check', ko: '청결 점검' }, currentLocale), inspections: 85, avgCompletionTime: 10, completionRate: 78 },
      ];

      const mockInspectorPerformance: InspectorPerformance[] = [
        { name: getLocalizedValue({ en: 'John Kim', ko: '김철수' }, currentLocale), completed: 45, avgTime: 18, rating: 4.8 },
        { name: getLocalizedValue({ en: 'Sarah Lee', ko: '이영희' }, currentLocale), completed: 38, avgTime: 22, rating: 4.6 },
        { name: getLocalizedValue({ en: 'Mike Park', ko: '박민수' }, currentLocale), completed: 42, avgTime: 20, rating: 4.7 },
        { name: getLocalizedValue({ en: 'Jane Choi', ko: '최지은' }, currentLocale), completed: 35, avgTime: 25, rating: 4.5 },
      ];

      setStats(mockStats);
      setMonthlyData(mockMonthlyData);
      setCategoryData(mockCategoryData);
      setTemplatePerformance(mockTemplatePerformance);
      setInspectorPerformance(mockInspectorPerformance);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentLocale, period]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <StandardCrudPageLayout useMenu showBreadcrumb>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </StandardCrudPageLayout>
    );
  }

  return (
    <StandardCrudPageLayout useMenu showBreadcrumb>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            {getLocalizedValue({ en: 'Inspection Dashboard', ko: '검사 대시보드' }, currentLocale)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{getLocalizedValue({ en: 'Period', ko: '기간' }, currentLocale)}</InputLabel>
            <Select
              value={period}
              label={getLocalizedValue({ en: 'Period', ko: '기간' }, currentLocale)}
              onChange={(e) => setPeriod(e.target.value as typeof period)}
            >
              <MenuItem value="week">{getLocalizedValue({ en: 'This Week', ko: '이번 주' }, currentLocale)}</MenuItem>
              <MenuItem value="month">{getLocalizedValue({ en: 'This Month', ko: '이번 달' }, currentLocale)}</MenuItem>
              <MenuItem value="quarter">{getLocalizedValue({ en: 'This Quarter', ko: '이번 분기' }, currentLocale)}</MenuItem>
              <MenuItem value="year">{getLocalizedValue({ en: 'This Year', ko: '올해' }, currentLocale)}</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title={getLocalizedValue({ en: 'Refresh', ko: '새로고침' }, currentLocale)}>
            <IconButton onClick={fetchDashboardData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={getLocalizedValue({ en: 'Total Inspections', ko: '전체 검사' }, currentLocale)}
            value={stats?.total || 0}
            icon={<DashboardIcon />}
            color={theme.palette.primary.main}
            trend={stats?.trend}
            locale={currentLocale}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={getLocalizedValue({ en: 'Completed', ko: '완료' }, currentLocale)}
            value={stats?.completed || 0}
            icon={<CompletedIcon />}
            color={theme.palette.success.main}
            subtitle={`${stats?.completionRate}% ${getLocalizedValue({ en: 'completion rate', ko: '완료율' }, currentLocale)}`}
            locale={currentLocale}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={getLocalizedValue({ en: 'In Progress', ko: '진행 중' }, currentLocale)}
            value={stats?.inProgress || 0}
            icon={<PendingIcon />}
            color={theme.palette.info.main}
            locale={currentLocale}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={getLocalizedValue({ en: 'Overdue', ko: '지연' }, currentLocale)}
            value={stats?.overdue || 0}
            icon={<OverdueIcon />}
            color={theme.palette.error.main}
            locale={currentLocale}
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Monthly Trend */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              {getLocalizedValue({ en: 'Monthly Inspection Trend', ko: '월별 검사 추이' }, currentLocale)}
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  name={getLocalizedValue({ en: 'Total', ko: '전체' }, currentLocale)}
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.primary.light}
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name={getLocalizedValue({ en: 'Completed', ko: '완료' }, currentLocale)}
                  stroke={theme.palette.success.main}
                  fill={theme.palette.success.light}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              {getLocalizedValue({ en: 'By Category', ko: '카테고리별 분포' }, currentLocale)}
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={(props: PieLabelRenderProps) => `${props.name} ${(Number(props.percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3}>
        {/* Template Performance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              {getLocalizedValue({ en: 'Template Performance', ko: '템플릿별 성과' }, currentLocale)}
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={templatePerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Legend />
                <Bar
                  dataKey="inspections"
                  name={getLocalizedValue({ en: 'Inspections', ko: '검사 수' }, currentLocale)}
                  fill={theme.palette.primary.main}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Completion Rate by Template */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              {getLocalizedValue({ en: 'Completion Rate by Template', ko: '템플릿별 완료율' }, currentLocale)}
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={templatePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 100]} />
                <RechartsTooltip formatter={(value) => `${value}%`} />
                <Bar
                  dataKey="completionRate"
                  name={getLocalizedValue({ en: 'Completion Rate', ko: '완료율' }, currentLocale)}
                  fill={theme.palette.success.main}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Inspector Performance */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {getLocalizedValue({ en: 'Inspector Performance', ko: '검사자별 성과' }, currentLocale)}
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ display: 'flex', gap: 2, py: 2, minWidth: 'fit-content' }}>
                {inspectorPerformance.map((inspector, index) => (
                  <Card key={index} sx={{ minWidth: 200, flex: '0 0 auto' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {inspector.name}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            {getLocalizedValue({ en: 'Completed', ko: '완료' }, currentLocale)}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {inspector.completed}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            {getLocalizedValue({ en: 'Avg. Time', ko: '평균 시간' }, currentLocale)}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {inspector.avgTime} {getLocalizedValue({ en: 'min', ko: '분' }, currentLocale)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            {getLocalizedValue({ en: 'Rating', ko: '평점' }, currentLocale)}
                          </Typography>
                          <Chip
                            label={inspector.rating.toFixed(1)}
                            size="small"
                            color={inspector.rating >= 4.5 ? 'success' : inspector.rating >= 4 ? 'primary' : 'warning'}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </StandardCrudPageLayout>
  );
}
