'use client';

import React, { useCallback } from 'react';
import { Box, Grid, ToggleButtonGroup, ToggleButton, IconButton, Tooltip, Alert } from '@mui/material';
import { Refresh, Today, DateRange as DateRangeIcon, CalendarMonth } from '@mui/icons-material';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import RouteGuard from '@/components/auth/RouteGuard';
import { useDashboardData } from './hooks/useDashboardData';
import {
  KPICards,
  ActivityTrendChart,
  UserStatusChart,
  LoginStatsChart,
  MenuUsageChart,
  BoardActivityChart,
  SystemPerformanceChart,
  HttpStatusChart,
  TopPostsTable,
  ErrorEndpointsTable,
  RecentActivityFeed,
  QuickActions
} from './components';
import { DateRange } from './types';

export default function DashboardPage() {
  const {
    summary,
    activityTrend,
    userStatus,
    loginStats,
    menuUsage,
    boardActivity,
    systemPerformance,
    httpStatus,
    topPosts,
    errorEndpoints,
    recentActivity,
    loading,
    error,
    dateRange,
    setDateRange,
    refresh
  } = useDashboardData();

  const handleDateRangeChange = useCallback((_: React.MouseEvent<HTMLElement>, newRange: DateRange | null) => {
    if (newRange !== null) {
      setDateRange(newRange);
    }
  }, [setDateRange]);

  return (
    <RouteGuard>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Fixed Header */}
        <Box
          sx={{
            flexShrink: 0,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            zIndex: 10
          }}
        >
          <PageContainer sx={{ pb: 0, pt: 1 }}>
            <PageHeader useMenu showBreadcrumb />

            {/* Toolbar */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
              <ToggleButtonGroup
                value={dateRange}
                exclusive
                onChange={handleDateRangeChange}
                size="small"
              >
                <ToggleButton value="today">
                  <Today sx={{ fontSize: 18, mr: 0.5 }} />
                  오늘
                </ToggleButton>
                <ToggleButton value="7days">
                  <DateRangeIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  7일
                </ToggleButton>
                <ToggleButton value="30days">
                  <CalendarMonth sx={{ fontSize: 18, mr: 0.5 }} />
                  30일
                </ToggleButton>
              </ToggleButtonGroup>

              <Tooltip title="새로고침">
                <IconButton onClick={refresh} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </PageContainer>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <PageContainer sx={{ py: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* KPI Cards Row */}
            <Box sx={{ mb: 3 }}>
              <KPICards summary={summary} loading={loading} />
            </Box>

            {/* Row 2: Activity Trend + User Status */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={8}>
                <ActivityTrendChart data={activityTrend} loading={loading} />
              </Grid>
              <Grid item xs={12} md={4}>
                <UserStatusChart data={userStatus} loading={loading} />
              </Grid>
            </Grid>

            {/* Row 3: Login Stats + Menu Usage */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <LoginStatsChart data={loginStats} loading={loading} />
              </Grid>
              <Grid item xs={12} md={6}>
                <MenuUsageChart data={menuUsage} loading={loading} />
              </Grid>
            </Grid>

            {/* Row 4: Board Activity */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <BoardActivityChart data={boardActivity} loading={loading} />
              </Grid>
            </Grid>

            {/* Row 5: System Performance + HTTP Status */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={8}>
                <SystemPerformanceChart data={systemPerformance} loading={loading} />
              </Grid>
              <Grid item xs={12} md={4}>
                <HttpStatusChart data={httpStatus} loading={loading} />
              </Grid>
            </Grid>

            {/* Row 6: Top Posts + Error Endpoints */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TopPostsTable data={topPosts} loading={loading} />
              </Grid>
              <Grid item xs={12} md={6}>
                <ErrorEndpointsTable data={errorEndpoints} loading={loading} />
              </Grid>
            </Grid>

            {/* Row 7: Recent Activity + Quick Actions */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <RecentActivityFeed data={recentActivity} loading={loading} />
              </Grid>
              <Grid item xs={12} md={4}>
                <QuickActions />
              </Grid>
            </Grid>
          </PageContainer>
        </Box>
      </Box>
    </RouteGuard>
  );
}
