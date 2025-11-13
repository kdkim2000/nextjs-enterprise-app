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
import { TrendChart } from '@/components/common/Charts';
import type { TrendChartDataItem } from '@/components/common/Charts';

export default function TrendChartDemo() {
  // Sales Forecast Data
  const salesForecastData: TrendChartDataItem[] = [
    // Historical data (actual)
    { name: 'Jan', actual: 125000, target: 120000 },
    { name: 'Feb', actual: 142000, target: 130000 },
    { name: 'Mar', actual: 138000, target: 140000 },
    { name: 'Apr', actual: 165000, target: 150000 },
    { name: 'May', actual: 178000, target: 160000 },
    { name: 'Jun', actual: 192000, target: 170000 },
    // Forecast data
    { name: 'Jul', forecast: 205000, upperBound: 225000, lowerBound: 185000, target: 180000 },
    { name: 'Aug', forecast: 218000, upperBound: 240000, lowerBound: 196000, target: 190000 },
    { name: 'Sep', forecast: 232000, upperBound: 258000, lowerBound: 206000, target: 200000 },
    { name: 'Oct', forecast: 248000, upperBound: 278000, lowerBound: 218000, target: 210000 },
    { name: 'Nov', forecast: 265000, upperBound: 300000, lowerBound: 230000, target: 220000 },
    { name: 'Dec', forecast: 285000, upperBound: 325000, lowerBound: 245000, target: 230000 }
  ];

  // User Growth Forecast Data
  const userGrowthData: TrendChartDataItem[] = [
    // Historical data
    { name: 'Week 1', actual: 12500, target: 12000 },
    { name: 'Week 2', actual: 13200, target: 12800 },
    { name: 'Week 3', actual: 13800, target: 13600 },
    { name: 'Week 4', actual: 14600, target: 14400 },
    { name: 'Week 5', actual: 15300, target: 15200 },
    { name: 'Week 6', actual: 16100, target: 16000 },
    { name: 'Week 7', actual: 16900, target: 16800 },
    { name: 'Week 8', actual: 17800, target: 17600 },
    // Forecast data
    { name: 'Week 9', forecast: 18700, upperBound: 19500, lowerBound: 17900, target: 18400 },
    { name: 'Week 10', forecast: 19600, upperBound: 20800, lowerBound: 18400, target: 19200 },
    { name: 'Week 11', forecast: 20600, upperBound: 22200, lowerBound: 19000, target: 20000 },
    { name: 'Week 12', forecast: 21700, upperBound: 23700, lowerBound: 19700, target: 20800 }
  ];

  // Revenue Projection Data
  const revenueProjectionData: TrendChartDataItem[] = [
    // Q1-Q2 Actual
    { name: 'Q1 2023', actual: 1250000, target: 1200000 },
    { name: 'Q2 2023', actual: 1420000, target: 1350000 },
    { name: 'Q3 2023', actual: 1380000, target: 1450000 },
    { name: 'Q4 2023', actual: 1650000, target: 1550000 },
    { name: 'Q1 2024', actual: 1780000, target: 1650000 },
    { name: 'Q2 2024', actual: 1920000, target: 1750000 },
    // Q3-Q4 Forecast
    { name: 'Q3 2024', forecast: 2050000, upperBound: 2250000, lowerBound: 1850000, target: 1850000 },
    { name: 'Q4 2024', forecast: 2200000, upperBound: 2450000, lowerBound: 1950000, target: 1950000 },
    { name: 'Q1 2025', forecast: 2380000, upperBound: 2680000, lowerBound: 2080000, target: 2100000 },
    { name: 'Q2 2025', forecast: 2580000, upperBound: 2950000, lowerBound: 2210000, target: 2250000 }
  ];

  // KPI Performance Data
  const kpiData: TrendChartDataItem[] = [
    // Historical
    { name: 'Jan', actual: 85, target: 90 },
    { name: 'Feb', actual: 87, target: 90 },
    { name: 'Mar', actual: 89, target: 90 },
    { name: 'Apr', actual: 91, target: 90 },
    { name: 'May', actual: 92, target: 90 },
    { name: 'Jun', actual: 94, target: 90 },
    { name: 'Jul', actual: 93, target: 90 },
    { name: 'Aug', actual: 95, target: 90 },
    // Forecast
    { name: 'Sep', forecast: 96, upperBound: 98, lowerBound: 94, target: 90 },
    { name: 'Oct', forecast: 97, upperBound: 99, lowerBound: 95, target: 90 },
    { name: 'Nov', forecast: 97, upperBound: 100, lowerBound: 94, target: 90 },
    { name: 'Dec', forecast: 98, upperBound: 100, lowerBound: 96, target: 90 }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Trend Chart with Forecast
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Trend Chart는 과거 실적 데이터와 미래 예측 데이터를 함께 표시합니다.
        실적선(실선), 예측선(점선), 신뢰구간(음영), 목표선(점선)을 통해 추세와 목표 달성 가능성을 시각화합니다.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>사용 예시:</strong> 매출 예측, 사용자 성장 전망, 재무 계획, KPI 모니터링, 재고 예측 등
      </Alert>

      <Divider sx={{ my: 3 }} />

      {/* Example 1: Sales Forecast */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          1. 월별 매출 실적 및 예측
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          상반기 실제 매출(실선)과 하반기 예측 매출(점선)을 표시합니다.
          신뢰구간(음영)은 예측의 불확실성 범위를 나타내며, 목표선(녹색 점선)으로 목표 달성 여부를 평가할 수 있습니다.
        </Typography>
        <TrendChart
          data={salesForecastData}
          height={400}
          xAxisLabel="Month"
          yAxisLabel="Revenue ($)"
          showGrid={true}
          showLegend={true}
          showTooltip={true}
          showTarget={true}
          showConfidenceInterval={true}
          actualLabel="Actual Revenue"
          forecastLabel="Forecast Revenue"
          targetLabel="Target"
        />
      </Paper>

      {/* Example 2: User Growth */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          2. 주간 사용자 성장 추이 및 전망
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          8주간의 실제 사용자 증가 추이와 향후 4주간의 성장 예측을 표시합니다.
          신뢰구간을 통해 최소-최대 성장 범위를 확인할 수 있습니다.
        </Typography>
        <TrendChart
          data={userGrowthData}
          height={400}
          xAxisLabel="Week"
          yAxisLabel="Total Users"
          showGrid={true}
          showLegend={true}
          showTooltip={true}
          showTarget={true}
          showConfidenceInterval={true}
          actualLabel="Actual Users"
          forecastLabel="Projected Users"
          targetLabel="Growth Target"
        />
      </Paper>

      {/* Example 3: Revenue Projection */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          3. 분기별 매출 계획 및 전망
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          과거 4분기 실적과 향후 4분기 예상 매출을 표시합니다.
          경영 계획 수립과 목표 설정에 활용할 수 있습니다.
        </Typography>
        <TrendChart
          data={revenueProjectionData}
          height={400}
          xAxisLabel="Quarter"
          yAxisLabel="Revenue ($)"
          showGrid={true}
          showLegend={true}
          showTooltip={true}
          showTarget={true}
          showConfidenceInterval={true}
          actualLabel="Actual"
          forecastLabel="Projection"
          targetLabel="Plan"
        />
      </Paper>

      {/* Example 4: KPI Performance */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          4. KPI 성과 지표 및 예상 추이
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          핵심 성과 지표의 과거 실적과 향후 전망을 표시합니다.
          목표선(90점)을 기준으로 성과 달성 여부를 모니터링할 수 있습니다.
        </Typography>
        <TrendChart
          data={kpiData}
          height={400}
          xAxisLabel="Month"
          yAxisLabel="KPI Score"
          showGrid={true}
          showLegend={true}
          showTooltip={true}
          showTarget={true}
          showConfidenceInterval={true}
          actualLabel="Actual Score"
          forecastLabel="Expected Score"
          targetLabel="Target (90)"
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
          {`import { TrendChart } from '@/components/common/Charts';

const data = [
  // Historical data (actual 값만 설정)
  { name: 'Jan', actual: 125000, target: 120000 },
  { name: 'Feb', actual: 142000, target: 130000 },
  { name: 'Mar', actual: 138000, target: 140000 },

  // Forecast data (forecast와 신뢰구간 설정)
  {
    name: 'Apr',
    forecast: 165000,
    upperBound: 180000,  // 예측 상한선
    lowerBound: 150000,  // 예측 하한선
    target: 150000
  },
  {
    name: 'May',
    forecast: 178000,
    upperBound: 195000,
    lowerBound: 161000,
    target: 160000
  }
];

<TrendChart
  data={data}
  height={400}
  xAxisLabel="Month"
  yAxisLabel="Revenue ($)"
  showGrid={true}
  showLegend={true}
  showTooltip={true}
  showTarget={true}              // 목표선 표시
  showConfidenceInterval={true}  // 신뢰구간(음영) 표시
  actualLabel="Actual Revenue"
  forecastLabel="Forecast Revenue"
  targetLabel="Target"
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
              <li><code>data</code>: TrendChartDataItem[] - 차트 데이터</li>
              <li><code>height</code>: number (기본값: 300) - 차트 높이</li>
              <li><code>showGrid</code>: boolean (기본값: true) - 그리드 표시</li>
              <li><code>showLegend</code>: boolean (기본값: true) - 범례 표시</li>
              <li><code>showTooltip</code>: boolean (기본값: true) - 툴팁 표시</li>
              <li><code>showTarget</code>: boolean (기본값: true) - 목표선 표시</li>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Additional Props
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li><code>showConfidenceInterval</code>: boolean (기본값: true) - 신뢰구간 표시</li>
              <li><code>xAxisLabel</code>: string - X축 레이블</li>
              <li><code>yAxisLabel</code>: string - Y축 레이블</li>
              <li><code>paper</code>: boolean (기본값: false) - Paper로 감싸기</li>
              <li><code>actualLabel</code>: string (기본값: 'Actual') - 실적 레이블</li>
              <li><code>forecastLabel</code>: string (기본값: 'Forecast') - 예측 레이블</li>
              <li><code>targetLabel</code>: string (기본값: 'Target') - 목표 레이블</li>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Data Item Structure
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li><code>name</code>: string - X축 레이블 (필수)</li>
              <li><code>actual</code>: number - 실제 값 (과거 데이터)</li>
              <li><code>forecast</code>: number - 예측 값 (미래 데이터)</li>
              <li><code>upperBound</code>: number - 예측 상한선 (신뢰구간)</li>
              <li><code>lowerBound</code>: number - 예측 하한선 (신뢰구간)</li>
              <li><code>target</code>: number - 목표 값</li>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
