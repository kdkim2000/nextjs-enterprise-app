'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Alert,
  Grid
} from '@mui/material';
import { StackedAreaChart } from '@/components/common/Charts';
import type { StackedAreaChartDataItem, StackedAreaChartSeries } from '@/components/common/Charts';

export default function StackedAreaChartDemo() {
  // Revenue by Product Category Data
  const revenueData: StackedAreaChartDataItem[] = [
    { name: 'Jan', electronics: 45000, clothing: 32000, food: 28000, books: 15000 },
    { name: 'Feb', electronics: 52000, clothing: 35000, food: 30000, books: 17000 },
    { name: 'Mar', electronics: 48000, clothing: 38000, food: 32000, books: 18000 },
    { name: 'Apr', electronics: 61000, clothing: 42000, food: 35000, books: 20000 },
    { name: 'May', electronics: 55000, clothing: 45000, food: 38000, books: 22000 },
    { name: 'Jun', electronics: 67000, clothing: 48000, food: 40000, books: 25000 },
    { name: 'Jul', electronics: 72000, clothing: 52000, food: 42000, books: 27000 },
    { name: 'Aug', electronics: 68000, clothing: 50000, food: 45000, books: 28000 },
    { name: 'Sep', electronics: 75000, clothing: 55000, food: 48000, books: 30000 },
    { name: 'Oct', electronics: 80000, clothing: 58000, food: 50000, books: 32000 },
    { name: 'Nov', electronics: 85000, clothing: 62000, food: 52000, books: 35000 },
    { name: 'Dec', electronics: 95000, clothing: 70000, food: 55000, books: 40000 }
  ];

  const revenueSeries: StackedAreaChartSeries[] = [
    { dataKey: 'electronics', name: 'Electronics', fillOpacity: 0.6 },
    { dataKey: 'clothing', name: 'Clothing', fillOpacity: 0.6 },
    { dataKey: 'food', name: 'Food & Beverage', fillOpacity: 0.6 },
    { dataKey: 'books', name: 'Books', fillOpacity: 0.6 }
  ];

  // User Growth by Segment Data
  const userGrowthData: StackedAreaChartDataItem[] = [
    { name: 'Week 1', free: 1200, basic: 450, premium: 180, enterprise: 45 },
    { name: 'Week 2', free: 1450, basic: 520, premium: 210, enterprise: 52 },
    { name: 'Week 3', free: 1680, basic: 580, premium: 245, enterprise: 60 },
    { name: 'Week 4', free: 1920, basic: 650, premium: 280, enterprise: 68 },
    { name: 'Week 5', free: 2150, basic: 720, premium: 320, enterprise: 78 },
    { name: 'Week 6', free: 2400, basic: 800, premium: 360, enterprise: 88 },
    { name: 'Week 7', free: 2650, basic: 880, premium: 400, enterprise: 95 },
    { name: 'Week 8', free: 2900, basic: 960, premium: 445, enterprise: 105 }
  ];

  const userGrowthSeries: StackedAreaChartSeries[] = [
    { dataKey: 'free', name: 'Free Plan', fillOpacity: 0.7 },
    { dataKey: 'basic', name: 'Basic Plan', fillOpacity: 0.7 },
    { dataKey: 'premium', name: 'Premium Plan', fillOpacity: 0.7 },
    { dataKey: 'enterprise', name: 'Enterprise', fillOpacity: 0.7 }
  ];

  // Server Load Data
  const serverLoadData: StackedAreaChartDataItem[] = [
    { name: '00:00', api: 20, database: 15, cache: 10, static: 5 },
    { name: '04:00', api: 15, database: 12, cache: 8, static: 4 },
    { name: '08:00', api: 45, database: 35, cache: 25, static: 12 },
    { name: '12:00', api: 65, database: 50, cache: 35, static: 18 },
    { name: '16:00', api: 55, database: 42, cache: 30, static: 15 },
    { name: '20:00', api: 40, database: 30, cache: 22, static: 10 },
    { name: '23:59', api: 25, database: 18, cache: 12, static: 6 }
  ];

  const serverLoadSeries: StackedAreaChartSeries[] = [
    { dataKey: 'api', name: 'API Server', fillOpacity: 0.8 },
    { dataKey: 'database', name: 'Database', fillOpacity: 0.8 },
    { dataKey: 'cache', name: 'Cache', fillOpacity: 0.8 },
    { dataKey: 'static', name: 'Static Files', fillOpacity: 0.8 }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Stacked Area Chart
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Stacked Area Chart는 여러 데이터 시리즈를 누적하여 전체 합계와 각 구성 요소의 기여도를 동시에 표시합니다.
        시간에 따른 전체 추세와 각 카테고리의 변화를 한눈에 파악할 수 있습니다.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>사용 예시:</strong> 카테고리별 매출 추이, 사용자 유형별 성장, 리소스 사용량 분석, 비용 구성 변화 등
      </Alert>

      <Divider sx={{ my: 3 }} />

      {/* Example 1: Revenue by Category */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          1. 카테고리별 월간 매출 추이
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          각 제품 카테고리의 매출을 누적하여 전체 매출 추이와 카테고리별 기여도를 표시합니다.
        </Typography>
        <StackedAreaChart
          data={revenueData}
          series={revenueSeries}
          height={400}
          xAxisLabel="Month"
          yAxisLabel="Revenue ($)"
          showGrid={true}
          showLegend={true}
          showTooltip={true}
          curved={true}
        />
      </Paper>

      {/* Example 2: User Growth by Plan */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          2. 플랜별 사용자 성장 추이
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          각 요금제별 사용자 수를 누적하여 전체 사용자 성장과 플랜별 분포를 시각화합니다.
        </Typography>
        <StackedAreaChart
          data={userGrowthData}
          series={userGrowthSeries}
          height={400}
          xAxisLabel="Week"
          yAxisLabel="Users"
          showGrid={true}
          showLegend={true}
          showTooltip={true}
          curved={true}
          paper={false}
        />
      </Paper>

      {/* Example 3: Server Load */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          3. 서버 리소스 사용량 (24시간)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          시간대별 서버 구성 요소의 리소스 사용량을 누적하여 전체 부하와 각 서비스의 기여도를 분석합니다.
        </Typography>
        <StackedAreaChart
          data={serverLoadData}
          series={serverLoadSeries}
          height={400}
          xAxisLabel="Time"
          yAxisLabel="CPU Usage (%)"
          showGrid={true}
          showLegend={true}
          showTooltip={true}
          curved={true}
        />
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Code Example */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          사용 예제
        </Typography>
        <Box
          component="pre"
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem'
          }}
        >
          {`import { StackedAreaChart } from '@/components/common/Charts';

const data = [
  { name: 'Jan', electronics: 45000, clothing: 32000, food: 28000 },
  { name: 'Feb', electronics: 52000, clothing: 35000, food: 30000 },
  // ...
];

const series = [
  { dataKey: 'electronics', name: 'Electronics', fillOpacity: 0.6 },
  { dataKey: 'clothing', name: 'Clothing', fillOpacity: 0.6 },
  { dataKey: 'food', name: 'Food & Beverage', fillOpacity: 0.6 }
];

<StackedAreaChart
  data={data}
  series={series}
  height={400}
  xAxisLabel="Month"
  yAxisLabel="Revenue ($)"
  showGrid={true}
  showLegend={true}
  showTooltip={true}
  curved={true}
  stackId="stack1"  // 모든 영역을 하나의 스택으로 그룹화
/>`}
        </Box>
      </Paper>

      {/* API Reference */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          API Reference
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Props
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li><code>data</code>: StackedAreaChartDataItem[] - 차트 데이터</li>
              <li><code>series</code>: StackedAreaChartSeries[] - 시리즈 설정</li>
              <li><code>height</code>: number (기본값: 300) - 차트 높이</li>
              <li><code>showGrid</code>: boolean (기본값: true) - 그리드 표시</li>
              <li><code>showLegend</code>: boolean (기본값: true) - 범례 표시</li>
              <li><code>showTooltip</code>: boolean (기본값: true) - 툴팁 표시</li>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Additional Props
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li><code>xAxisLabel</code>: string - X축 레이블</li>
              <li><code>yAxisLabel</code>: string - Y축 레이블</li>
              <li><code>paper</code>: boolean (기본값: false) - Paper로 감싸기</li>
              <li><code>curved</code>: boolean (기본값: true) - 곡선 사용</li>
              <li><code>stackId</code>: string (기본값: 'stack1') - 스택 그룹 ID</li>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Series Configuration
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li><code>dataKey</code>: string - 데이터 키</li>
              <li><code>name</code>: string - 시리즈 이름 (범례에 표시)</li>
              <li><code>color</code>: string - 영역 색상 (선택사항)</li>
              <li><code>fillOpacity</code>: number (0-1) - 영역 투명도</li>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
