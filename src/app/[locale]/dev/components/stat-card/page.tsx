'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Grid, Switch, FormControlLabel } from '@mui/material';
import { People, TrendingUp, AttachMoney, ShoppingCart, Assessment, Visibility } from '@mui/icons-material';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import StatCard, { StatCardGradients, StatCardColors } from '@/components/common/StatCard';

export default function StatCardDemoPage() {
  const [loading, setLoading] = useState(false);

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          StatCard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A versatile card component for displaying KPIs, metrics, and statistics with trend indicators.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          KPI, 지표, 통계를 트렌드 표시와 함께 보여주는 다용도 카드 컴포넌트입니다.
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Display key metrics with icon, value, and optional trend indicator.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Users"
                value="12,543"
                icon={People}
                gradient={StatCardGradients.primary}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Revenue"
                value="$45,678"
                icon={AttachMoney}
                gradient={StatCardGradients.success}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Orders"
                value="1,234"
                icon={ShoppingCart}
                gradient={StatCardGradients.warning}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Page Views"
                value="89,102"
                icon={Visibility}
                gradient={StatCardGradients.info}
              />
            </Grid>
          </Grid>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`import StatCard, { StatCardGradients } from '@/components/common/StatCard';
import { People, AttachMoney } from '@mui/icons-material';

<StatCard
  title="Total Users"
  value="12,543"
  icon={People}
  gradient={StatCardGradients.primary}
/>`}
          </Box>
        </Paper>

        {/* With Trend */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Trend Indicator
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Show positive or negative trend with percentage.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Monthly Revenue"
                value="$125,430"
                icon={TrendingUp}
                gradient={StatCardGradients.success}
                trend={{ value: 12.5, label: 'vs last month' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Active Users"
                value="8,432"
                icon={People}
                gradient={StatCardGradients.primary}
                trend={{ value: -3.2, label: 'vs last week' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Conversion Rate"
                value="4.28%"
                icon={Assessment}
                gradient={StatCardGradients.purple}
                trend={{ value: 0.8 }}
                subValue="from 3.48%"
              />
            </Grid>
          </Grid>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`<StatCard
  title="Monthly Revenue"
  value="$125,430"
  icon={TrendingUp}
  gradient={StatCardGradients.success}
  trend={{ value: 12.5, label: 'vs last month' }}
/>

// Negative trend
<StatCard
  title="Active Users"
  value="8,432"
  trend={{ value: -3.2 }}
/>`}
          </Box>
        </Paper>

        {/* Gradient Options */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Gradient Options
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Built-in gradient presets for different use cases.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {Object.entries(StatCardGradients).map(([name, gradient]) => (
              <Grid item xs={12} sm={6} md={4} key={name}>
                <StatCard
                  title={`${name.charAt(0).toUpperCase() + name.slice(1)} Gradient`}
                  value="1,234"
                  icon={Assessment}
                  gradient={gradient}
                />
              </Grid>
            ))}
          </Grid>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`import { StatCardGradients } from '@/components/common/StatCard';

// Available gradients:
StatCardGradients.primary  // Indigo to Purple
StatCardGradients.success  // Emerald to Green
StatCardGradients.warning  // Amber to Yellow
StatCardGradients.error    // Red to Rose
StatCardGradients.info     // Blue to Light Blue
StatCardGradients.purple   // Purple to Violet
StatCardGradients.teal     // Teal to Cyan`}
          </Box>
        </Paper>

        {/* Custom Color */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Color
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use custom colors instead of gradient presets.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Custom Pink"
                value="5,678"
                icon={Assessment}
                color="#ec4899"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Custom Cyan"
                value="3,456"
                icon={Assessment}
                color="#06b6d4"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Custom Orange"
                value="2,345"
                icon={Assessment}
                color="#f97316"
              />
            </Grid>
          </Grid>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`<StatCard
  title="Custom Pink"
  value="5,678"
  icon={Assessment}
  color="#ec4899"
/>`}
          </Box>
        </Paper>

        {/* Loading State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Loading State
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Display skeleton placeholder while data is loading.
          </Typography>

          <FormControlLabel
            control={<Switch checked={loading} onChange={(e) => setLoading(e.target.checked)} />}
            label="Toggle Loading"
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Users"
                value="12,543"
                icon={People}
                gradient={StatCardGradients.primary}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Revenue"
                value="$45,678"
                icon={AttachMoney}
                gradient={StatCardGradients.success}
                loading={loading}
              />
            </Grid>
          </Grid>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`<StatCard
  title="Total Users"
  value="12,543"
  icon={People}
  loading={true}
/>`}
          </Box>
        </Paper>

        {/* Clickable */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Clickable Card
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add onClick handler to make the card interactive.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Click Me"
                value="1,234"
                icon={Assessment}
                gradient={StatCardGradients.primary}
                onClick={() => alert('Card clicked!')}
              />
            </Grid>
          </Grid>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem'
            }}
          >
            {`<StatCard
  title="Click Me"
  value="1,234"
  onClick={() => navigate('/details')}
/>`}
          </Box>
        </Paper>

        {/* API Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Reference
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
              mb: 3
            }}
          >
            {`import StatCard, { StatCardGradients, StatCardColors } from '@/components/common/StatCard';`}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            StatCardProps
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li>
              <code>title</code>: string - Card title text
            </li>
            <li>
              <code>value</code>: string | number - Main value to display
            </li>
            <li>
              <code>subValue</code>?: string - Optional subtitle/description
            </li>
            <li>
              <code>icon</code>?: ComponentType - Icon component to display
            </li>
            <li>
              <code>gradient</code>?: string - Gradient background for accent
            </li>
            <li>
              <code>color</code>?: string - Solid color (alternative to gradient)
            </li>
            <li>
              <code>trend</code>?: {'{ value: number; label?: string }'} - Trend indicator
            </li>
            <li>
              <code>loading</code>?: boolean - Loading state (default: false)
            </li>
            <li>
              <code>onClick</code>?: () =&gt; void - Click handler
            </li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Exported Constants
          </Typography>
          <Box component="ul" sx={{ mb: 2 }}>
            <li>
              <code>StatCardGradients</code>: Object with preset gradients (primary, success, warning, error, info, purple, teal)
            </li>
            <li>
              <code>StatCardColors</code>: Object with color values used internally
            </li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
