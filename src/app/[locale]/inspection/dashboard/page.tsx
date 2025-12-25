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
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Assessment as DashboardIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Warning as OverdueIcon,
  Refresh as RefreshIcon,
  Description as TemplateIcon,
  PlayArrow as InProgressIcon,
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
import axios from '@/lib/axios';

interface DashboardStats {
  total: number;
  completed: number;
  inProgress: number;
  draft: number;
  submitted: number;
  completionRate: number;
  totalTemplates: number;
}

interface CategoryStats {
  category: string;
  count: number;
  color: string;
}

interface TemplateStats {
  id: string;
  name: string;
  code: string;
  inspectionCount: number;
  completedCount: number;
  completionRate: number;
}

interface MonthlyStats {
  month: string;
  monthLabel: string;
  total: number;
  completed: number;
  rate: number;
}

interface InspectorStats {
  inspectorId: string;
  inspectorName: string;
  completedCount: number;
  inProgressCount: number;
  totalCount: number;
}

interface RecentInspection {
  id: string;
  inspectionCode: string;
  targetName: string;
  status: string;
  createdAt: string;
  templateName: string;
  inspectorName: string;
}

interface DashboardData {
  stats: DashboardStats;
  categoryStats: CategoryStats[];
  templateStats: TemplateStats[];
  monthlyStats: MonthlyStats[];
  inspectorStats: InspectorStats[];
  recentInspections: RecentInspection[];
}

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#8bc34a', '#e91e63', '#795548', '#607d8b'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
    case 'submitted':
      return 'success';
    case 'in_progress':
      return 'info';
    case 'draft':
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string, locale: string) => {
  const labels: Record<string, Record<string, string>> = {
    draft: { ko: '초안', en: 'Draft' },
    in_progress: { ko: '진행중', en: 'In Progress' },
    completed: { ko: '완료', en: 'Completed' },
    submitted: { ko: '제출됨', en: 'Submitted' },
  };
  return labels[status]?.[locale] || labels[status]?.en || status;
};

export default function InspectionDashboardPage() {
  const currentLocale = useCurrentLocale();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/inspection/dashboard');
      setData(response.data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(
        err.response?.data?.error ||
          getLocalizedValue(
            { en: 'Failed to load dashboard data', ko: '대시보드 데이터를 불러오는데 실패했습니다' },
            currentLocale
          )
      );
    } finally {
      setLoading(false);
    }
  }, [currentLocale]);

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

  if (error) {
    return (
      <StandardCrudPageLayout useMenu showBreadcrumb>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton onClick={fetchDashboardData} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </StandardCrudPageLayout>
    );
  }

  const stats = data?.stats;
  const categoryStats = data?.categoryStats || [];
  const templateStats = data?.templateStats || [];
  const monthlyStats = data?.monthlyStats || [];
  const inspectorStats = data?.inspectorStats || [];
  const recentInspections = data?.recentInspections || [];

  // Prepare chart data
  const categoryChartData = categoryStats
    .filter((cat) => cat.count > 0)
    .map((cat, index) => ({
      name: cat.category,
      value: cat.count,
      color: cat.color || COLORS[index % COLORS.length],
    }));

  const monthlyChartData = monthlyStats.map((m) => ({
    month: m.monthLabel,
    total: m.total,
    completed: m.completed,
    rate: m.rate,
  }));

  const templateChartData = templateStats.filter((t) => t.inspectionCount > 0).slice(0, 5);

  return (
    <StandardCrudPageLayout useMenu showBreadcrumb>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            {getLocalizedValue({ en: 'Inspection Dashboard', ko: '점검 대시보드' }, currentLocale)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
            title={getLocalizedValue({ en: 'Total Inspections', ko: '전체 점검' }, currentLocale)}
            value={stats?.total || 0}
            icon={<DashboardIcon />}
            color={theme.palette.primary.main}
            locale={currentLocale}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={getLocalizedValue({ en: 'In Progress', ko: '진행중' }, currentLocale)}
            value={stats?.inProgress || 0}
            icon={<InProgressIcon />}
            color={theme.palette.info.main}
            locale={currentLocale}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={getLocalizedValue({ en: 'Completed', ko: '완료' }, currentLocale)}
            value={stats?.completed || 0}
            icon={<CompletedIcon />}
            color={theme.palette.success.main}
            subtitle={`${stats?.completionRate || 0}% ${getLocalizedValue({ en: 'completion rate', ko: '완료율' }, currentLocale)}`}
            locale={currentLocale}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={getLocalizedValue({ en: 'Templates', ko: '템플릿' }, currentLocale)}
            value={stats?.totalTemplates || 0}
            icon={<TemplateIcon />}
            color={theme.palette.secondary.main}
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
              {getLocalizedValue({ en: 'Monthly Inspection Trend', ko: '월별 점검 추이' }, currentLocale)}
            </Typography>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={monthlyChartData}>
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
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85%' }}>
                <Typography color="text.secondary">
                  {getLocalizedValue({ en: 'No data available', ko: '데이터가 없습니다' }, currentLocale)}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              {getLocalizedValue({ en: 'By Category', ko: '카테고리별 분포' }, currentLocale)}
            </Typography>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={(props: PieLabelRenderProps) =>
                      `${props.name} ${(Number(props.percent || 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85%' }}>
                <Typography color="text.secondary">
                  {getLocalizedValue({ en: 'No data available', ko: '데이터가 없습니다' }, currentLocale)}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Template Performance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              {getLocalizedValue({ en: 'Top Templates', ko: '주요 템플릿' }, currentLocale)}
            </Typography>
            {templateChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={templateChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar
                    dataKey="inspectionCount"
                    name={getLocalizedValue({ en: 'Inspections', ko: '점검 수' }, currentLocale)}
                    fill={theme.palette.primary.main}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85%' }}>
                <Typography color="text.secondary">
                  {getLocalizedValue({ en: 'No data available', ko: '데이터가 없습니다' }, currentLocale)}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Inspections */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              {getLocalizedValue({ en: 'Recent Inspections', ko: '최근 점검' }, currentLocale)}
            </Typography>
            {recentInspections.length > 0 ? (
              <List sx={{ overflow: 'auto', maxHeight: 320 }}>
                {recentInspections.map((inspection, index) => (
                  <React.Fragment key={inspection.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="bold">
                              {inspection.inspectionCode}
                            </Typography>
                            <Chip
                              label={getStatusLabel(inspection.status, currentLocale)}
                              size="small"
                              color={getStatusColor(inspection.status) as any}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {inspection.templateName}
                            </Typography>
                            {inspection.targetName && (
                              <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                                - {inspection.targetName}
                              </Typography>
                            )}
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(inspection.createdAt).toLocaleString(currentLocale)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentInspections.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85%' }}>
                <Typography color="text.secondary">
                  {getLocalizedValue({ en: 'No recent inspections', ko: '최근 점검이 없습니다' }, currentLocale)}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Inspector Performance */}
      {inspectorStats.length > 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {getLocalizedValue({ en: 'Inspector Performance', ko: '점검자별 현황' }, currentLocale)}
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ display: 'flex', gap: 2, py: 2, minWidth: 'fit-content' }}>
                  {inspectorStats.map((inspector, index) => (
                    <Card key={index} sx={{ minWidth: 200, flex: '0 0 auto' }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {inspector.inspectorName}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              {getLocalizedValue({ en: 'Total', ko: '전체' }, currentLocale)}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {inspector.totalCount}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              {getLocalizedValue({ en: 'Completed', ko: '완료' }, currentLocale)}
                            </Typography>
                            <Chip
                              label={inspector.completedCount}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              {getLocalizedValue({ en: 'In Progress', ko: '진행중' }, currentLocale)}
                            </Typography>
                            <Chip
                              label={inspector.inProgressCount}
                              size="small"
                              color="info"
                              variant="outlined"
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
      )}
    </StandardCrudPageLayout>
  );
}
