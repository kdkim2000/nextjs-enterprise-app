'use client';

import { Typography, Paper, Stack, Grid, Box, Chip } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  ComposedChart,
  DonutChart,
  RadarChart
} from '@/components/common/Charts';

export default function ChartsDemoPage() {
  // Sample data for LineChart
  const lineData = [
    { name: 'Jan', revenue: 4000, profit: 2400, cost: 1600 },
    { name: 'Feb', revenue: 3000, profit: 1398, cost: 1602 },
    { name: 'Mar', revenue: 2000, profit: 9800, cost: 2000 },
    { name: 'Apr', revenue: 2780, profit: 3908, cost: 2400 },
    { name: 'May', revenue: 1890, profit: 4800, cost: 2290 },
    { name: 'Jun', revenue: 2390, profit: 3800, cost: 2100 },
  ];

  // Sample data for BarChart
  const barData = [
    { name: 'Product A', sales: 4000, target: 2400 },
    { name: 'Product B', sales: 3000, target: 1398 },
    { name: 'Product C', sales: 2000, target: 9800 },
    { name: 'Product D', sales: 2780, target: 3908 },
    { name: 'Product E', sales: 1890, target: 4800 },
  ];

  // Sample data for PieChart
  const pieData = [
    { name: 'Desktop', value: 400 },
    { name: 'Mobile', value: 300 },
    { name: 'Tablet', value: 200 },
    { name: 'Other', value: 100 },
  ];

  // Sample data for AreaChart
  const areaData = [
    { name: 'Week 1', users: 4000, sessions: 2400 },
    { name: 'Week 2', users: 3000, sessions: 1398 },
    { name: 'Week 3', users: 2000, sessions: 9800 },
    { name: 'Week 4', users: 2780, sessions: 3908 },
  ];

  // Sample data for DonutChart
  const donutData = [
    { name: 'Complete', value: 75 },
    { name: 'Incomplete', value: 25 },
  ];

  // Sample data for RadarChart
  const radarData = [
    { subject: 'Performance', A: 120, B: 110 },
    { subject: 'Security', A: 98, B: 130 },
    { subject: 'Usability', A: 86, B: 130 },
    { subject: 'Reliability', A: 99, B: 100 },
    { subject: 'Scalability', A: 85, B: 90 },
  ];

  // Sample data for ComposedChart
  const composedData = [
    { name: 'Q1', revenue: 4000, profit: 2400, growth: 24 },
    { name: 'Q2', revenue: 3000, profit: 1398, growth: 22 },
    { name: 'Q3', revenue: 2000, profit: 9800, growth: 29 },
    { name: 'Q4', revenue: 2780, profit: 3908, growth: 26 },
  ];

  // Stacked bar data
  const stackedBarData = [
    { name: 'Jan', desktop: 4000, mobile: 2400, tablet: 1200 },
    { name: 'Feb', desktop: 3000, mobile: 1398, tablet: 800 },
    { name: 'Mar', desktop: 2000, mobile: 9800, tablet: 1500 },
    { name: 'Apr', desktop: 2780, mobile: 3908, tablet: 2100 },
  ];

  return (
    <PageContainer>
      <Stack spacing={4}>
        {/* Header */}
        <Paper sx={{ p: 3, bgcolor: 'primary.50' }}>
          <Typography variant="h5" gutterBottom>
            Chart Components
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Collection of reusable chart components built with Recharts and Material-UI
          </Typography>
        </Paper>

        {/* LineChart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Line Chart
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Perfect for showing trends over time. Supports multiple series, curved/straight lines, and grid display.
          </Typography>
          <LineChart
            data={lineData}
            series={[
              { dataKey: 'revenue', name: 'Revenue', strokeWidth: 3 },
              { dataKey: 'profit', name: 'Profit', strokeWidth: 2 },
            ]}
            height={300}
            showGrid={true}
            showLegend={true}
          />
          <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 2, fontSize: '0.875rem', overflow: 'auto' }}>
            {`<LineChart
  data={lineData}
  series={[
    { dataKey: 'revenue', name: 'Revenue' },
    { dataKey: 'profit', name: 'Profit' }
  ]}
  height={300}
  showGrid={true}
  showLegend={true}
/>`}
          </Box>
        </Paper>

        {/* BarChart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bar Chart
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Compare values across categories. Supports horizontal/vertical orientation and stacked bars.
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Vertical Bars
              </Typography>
              <BarChart
                data={barData}
                series={[
                  { dataKey: 'sales', name: 'Sales' },
                  { dataKey: 'target', name: 'Target' },
                ]}
                height={300}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Horizontal Bars
              </Typography>
              <BarChart
                data={barData}
                series={[
                  { dataKey: 'sales', name: 'Sales' },
                ]}
                height={300}
                horizontal={true}
              />
            </Grid>
          </Grid>
          <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 2, fontSize: '0.875rem', overflow: 'auto' }}>
            {`<BarChart
  data={barData}
  series={[
    { dataKey: 'sales', name: 'Sales' },
    { dataKey: 'target', name: 'Target' }
  ]}
  horizontal={false}  // or true for horizontal
/>`}
          </Box>
        </Paper>

        {/* Stacked Bar Chart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Stacked Bar Chart
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Show composition of categories with stacked bars
          </Typography>
          <BarChart
            data={stackedBarData}
            series={[
              { dataKey: 'desktop', name: 'Desktop', stackId: 'a' },
              { dataKey: 'mobile', name: 'Mobile', stackId: 'a' },
              { dataKey: 'tablet', name: 'Tablet', stackId: 'a' },
            ]}
            height={300}
          />
          <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 2, fontSize: '0.875rem', overflow: 'auto' }}>
            {`<BarChart
  data={stackedBarData}
  series={[
    { dataKey: 'desktop', name: 'Desktop', stackId: 'a' },
    { dataKey: 'mobile', name: 'Mobile', stackId: 'a' },
    { dataKey: 'tablet', name: 'Tablet', stackId: 'a' }
  ]}
/>`}
          </Box>
        </Paper>

        {/* PieChart and DonutChart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pie & Donut Charts
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Show proportions and percentages. Donut chart supports center text.
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Pie Chart
              </Typography>
              <PieChart
                data={pieData}
                height={300}
                showLabel={true}
                showPercentage={true}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Donut Chart
              </Typography>
              <DonutChart
                data={donutData}
                height={300}
                centerText="75%"
                centerSubtext="Complete"
                innerRadius={60}
                outerRadius={90}
              />
            </Grid>
          </Grid>
          <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 2, fontSize: '0.875rem', overflow: 'auto' }}>
            {`// Pie Chart
<PieChart
  data={pieData}
  showLabel={true}
  showPercentage={true}
/>

// Donut Chart
<DonutChart
  data={donutData}
  centerText="75%"
  centerSubtext="Complete"
/>`}
          </Box>
        </Paper>

        {/* AreaChart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Area Chart
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Emphasize magnitude of change over time with filled areas. Supports stacking.
          </Typography>
          <AreaChart
            data={areaData}
            series={[
              { dataKey: 'users', name: 'Users' },
              { dataKey: 'sessions', name: 'Sessions' },
            ]}
            height={300}
          />
          <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 2, fontSize: '0.875rem', overflow: 'auto' }}>
            {`<AreaChart
  data={areaData}
  series={[
    { dataKey: 'users', name: 'Users' },
    { dataKey: 'sessions', name: 'Sessions' }
  ]}
/>`}
          </Box>
        </Paper>

        {/* ComposedChart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Composed Chart (복합 차트)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Combine multiple chart types (line, bar, area) in one chart. Supports dual Y-axis.
          </Typography>
          <ComposedChart
            data={composedData}
            series={[
              { type: 'bar', dataKey: 'revenue', name: 'Revenue' },
              { type: 'bar', dataKey: 'profit', name: 'Profit' },
              { type: 'line', dataKey: 'growth', name: 'Growth %', yAxisId: 'right' },
            ]}
            height={300}
            dualAxis={true}
          />
          <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 2, fontSize: '0.875rem', overflow: 'auto' }}>
            {`<ComposedChart
  data={composedData}
  series={[
    { type: 'bar', dataKey: 'revenue', name: 'Revenue' },
    { type: 'bar', dataKey: 'profit', name: 'Profit' },
    { type: 'line', dataKey: 'growth', name: 'Growth %', yAxisId: 'right' }
  ]}
  dualAxis={true}  // Enable dual Y-axis
/>`}
          </Box>
        </Paper>

        {/* RadarChart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Radar Chart
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Compare multiple variables across categories. Great for showing strengths and weaknesses.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 600 }}>
              <RadarChart
                data={radarData}
                series={[
                  { dataKey: 'A', name: 'Product A', fillOpacity: 0.6 },
                  { dataKey: 'B', name: 'Product B', fillOpacity: 0.4 },
                ]}
                height={400}
              />
            </Box>
          </Box>
          <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 2, fontSize: '0.875rem', overflow: 'auto' }}>
            {`<RadarChart
  data={radarData}
  series={[
    { dataKey: 'A', name: 'Product A', fillOpacity: 0.6 },
    { dataKey: 'B', name: 'Product B', fillOpacity: 0.4 }
  ]}
/>`}
          </Box>
        </Paper>

        {/* API Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Common Props
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            All chart components share these common props:
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>data</code>: Array - Chart data (required)</li>
            <li><code>height</code>: number - Chart height in pixels (default: 300)</li>
            <li><code>showGrid</code>: boolean - Show grid lines (default: true)</li>
            <li><code>showLegend</code>: boolean - Show legend (default: true)</li>
            <li><code>showTooltip</code>: boolean - Show tooltip on hover (default: true)</li>
            <li><code>paper</code>: boolean - Wrap in Paper component (default: false)</li>
            <li><code>xAxisLabel</code>: string - X-axis label (optional)</li>
            <li><code>yAxisLabel</code>: string - Y-axis label (optional)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, mb: 1 }}>
            <strong>Import:</strong>
          </Typography>
          <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, fontSize: '0.875rem', overflow: 'auto' }}>
            {`import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  ComposedChart,
  DonutChart,
  RadarChart
} from '@/components/common/Charts';`}
          </Box>

          <Typography variant="body2" sx={{ mt: 3, mb: 1 }}>
            <strong>Features:</strong>
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="Responsive Design" size="small" />
            <Chip label="Material-UI Theme Colors" size="small" />
            <Chip label="TypeScript Support" size="small" />
            <Chip label="Custom Tooltips" size="small" />
            <Chip label="Multiple Series" size="small" />
            <Chip label="Stacked Charts" size="small" />
            <Chip label="Dual Axis" size="small" />
            <Chip label="Curved/Straight Lines" size="small" />
          </Stack>

          <Typography variant="body2" sx={{ mt: 3, mb: 1 }}>
            <strong>Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Dashboard analytics and KPIs</li>
            <li>Sales and revenue reports</li>
            <li>User activity trends</li>
            <li>Performance comparisons</li>
            <li>Market analysis</li>
            <li>Product metrics</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
