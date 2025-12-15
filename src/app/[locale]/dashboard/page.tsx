'use client';

import React, { useCallback } from 'react';
import { Box, Grid, ToggleButtonGroup, ToggleButton, IconButton, Tooltip, Alert, useTheme, useMediaQuery } from '@mui/material';
import { Refresh, Today, DateRange as DateRangeIcon, CalendarMonth } from '@mui/icons-material';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import RouteGuard from '@/components/auth/RouteGuard';
import { useMobile } from '@/hooks/useMobile';
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
  const { isMobileLayout, isMobile } = useMobile();
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
          <PageContainer sx={{ pb: 0, pt: 1, px: isMobileLayout ? 1.5 : 3 }}>
            {!isMobileLayout && <PageHeader useMenu showBreadcrumb />}

            {/* Toolbar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: isMobileLayout ? 1.5 : 2,
                pt: isMobileLayout ? 1 : 0,
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <ToggleButtonGroup
                value={dateRange}
                exclusive
                onChange={handleDateRangeChange}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: isMobile ? 1 : 1.5,
                    py: isMobile ? 0.5 : 0.75,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }
                }}
              >
                <ToggleButton value="today">
                  <Today sx={{ fontSize: isMobile ? 16 : 18, mr: 0.5 }} />
                  {isMobile ? '오늘' : '오늘'}
                </ToggleButton>
                <ToggleButton value="7days">
                  <DateRangeIcon sx={{ fontSize: isMobile ? 16 : 18, mr: 0.5 }} />
                  {isMobile ? '7일' : '7일'}
                </ToggleButton>
                <ToggleButton value="30days">
                  <CalendarMonth sx={{ fontSize: isMobile ? 16 : 18, mr: 0.5 }} />
                  {isMobile ? '30일' : '30일'}
                </ToggleButton>
              </ToggleButtonGroup>

              <Tooltip title="새로고침">
                <IconButton onClick={refresh} disabled={loading} size={isMobile ? 'small' : 'medium'}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </PageContainer>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <PageContainer sx={{ py: isMobileLayout ? 1.5 : 2, px: isMobileLayout ? 1.5 : 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* KPI Cards Row */}
            <Box sx={{ mb: isMobileLayout ? 2 : 3 }}>
              <KPICards summary={summary} loading={loading} />
            </Box>

            {/* Row 2: Activity Trend + User Status */}
            <Grid container spacing={isMobileLayout ? 1.5 : 2} sx={{ mb: isMobileLayout ? 2 : 3 }}>
              <Grid item xs={12} md={8}>
                <ActivityTrendChart data={activityTrend} loading={loading} />
              </Grid>
              <Grid item xs={12} md={4}>
                <UserStatusChart data={userStatus} loading={loading} />
              </Grid>
            </Grid>

            {/* Row 3: Login Stats + Menu Usage */}
            <Grid container spacing={isMobileLayout ? 1.5 : 2} sx={{ mb: isMobileLayout ? 2 : 3 }}>
              <Grid item xs={12} md={6}>
                <LoginStatsChart data={loginStats} loading={loading} />
              </Grid>
              <Grid item xs={12} md={6}>
                <MenuUsageChart data={menuUsage} loading={loading} />
              </Grid>
            </Grid>

            {/* Row 4: Board Activity */}
            <Grid container spacing={isMobileLayout ? 1.5 : 2} sx={{ mb: isMobileLayout ? 2 : 3 }}>
              <Grid item xs={12}>
                <BoardActivityChart data={boardActivity} loading={loading} />
              </Grid>
            </Grid>

            {/* Row 5: System Performance + HTTP Status */}
            <Grid container spacing={isMobileLayout ? 1.5 : 2} sx={{ mb: isMobileLayout ? 2 : 3 }}>
              <Grid item xs={12} md={8}>
                <SystemPerformanceChart data={systemPerformance} loading={loading} />
              </Grid>
              <Grid item xs={12} md={4}>
                <HttpStatusChart data={httpStatus} loading={loading} />
              </Grid>
            </Grid>

            {/* Row 6: Top Posts + Error Endpoints */}
            <Grid container spacing={isMobileLayout ? 1.5 : 2} sx={{ mb: isMobileLayout ? 2 : 3 }}>
              <Grid item xs={12} md={6}>
                <TopPostsTable data={topPosts} loading={loading} />
              </Grid>
              <Grid item xs={12} md={6}>
                <ErrorEndpointsTable data={errorEndpoints} loading={loading} />
              </Grid>
            </Grid>

            {/* Row 7: Recent Activity + Quick Actions */}
            <Grid container spacing={isMobileLayout ? 1.5 : 2}>
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
