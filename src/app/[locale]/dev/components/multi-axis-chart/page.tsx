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
import { MultiAxisChart } from '@/components/common/Charts';
import type { MultiAxisChartDataItem, MultiAxisChartSeries } from '@/components/common/Charts';

export default function MultiAxisChartDemo() {
  // Revenue vs Margin Data
  const revenueMarginData: MultiAxisChartDataItem[] = [
    { name: 'Q1 2023', revenue: 1250000, margin: 18.5, customers: 450 },
    { name: 'Q2 2023', revenue: 1420000, margin: 19.2, customers: 520 },
    { name: 'Q3 2023', revenue: 1380000, margin: 17.8, customers: 495 },
    { name: 'Q4 2023', revenue: 1650000, margin: 20.5, customers: 580 },
    { name: 'Q1 2024', revenue: 1780000, margin: 21.2, customers: 625 },
    { name: 'Q2 2024', revenue: 1920000, margin: 22.0, customers: 670 },
    { name: 'Q3 2024', revenue: 2050000, margin: 21.5, customers: 710 },
    { name: 'Q4 2024', revenue: 2280000, margin: 23.2, customers: 795 }
  ];

  const revenueMarginSeries: MultiAxisChartSeries[] = [
    { dataKey: 'revenue', name: 'Revenue', type: 'bar', yAxisId: 'left' },
    { dataKey: 'margin', name: 'Profit Margin (%)', type: 'line', yAxisId: 'right', strokeWidth: 3 }
  ];

  // Sales vs Customer Satisfaction Data
  const salesSatisfactionData: MultiAxisChartDataItem[] = [
    { name: 'Jan', sales: 125000, satisfaction: 4.2, nps: 42 },
    { name: 'Feb', sales: 142000, satisfaction: 4.3, nps: 45 },
    { name: 'Mar', sales: 138000, satisfaction: 4.1, nps: 40 },
    { name: 'Apr', sales: 165000, satisfaction: 4.4, nps: 48 },
    { name: 'May', sales: 178000, satisfaction: 4.5, nps: 52 },
    { name: 'Jun', sales: 192000, satisfaction: 4.6, nps: 55 },
    { name: 'Jul', sales: 205000, satisfaction: 4.5, nps: 53 },
    { name: 'Aug', sales: 198000, satisfaction: 4.4, nps: 50 },
    { name: 'Sep', sales: 215000, satisfaction: 4.7, nps: 58 },
    { name: 'Oct', sales: 228000, satisfaction: 4.8, nps: 62 },
    { name: 'Nov', sales: 242000, satisfaction: 4.7, nps: 60 },
    { name: 'Dec', sales: 268000, satisfaction: 4.9, nps: 68 }
  ];

  const salesSatisfactionSeries: MultiAxisChartSeries[] = [
    { dataKey: 'sales', name: 'Sales Amount', type: 'bar', yAxisId: 'left' },
    { dataKey: 'satisfaction', name: 'Satisfaction (5.0)', type: 'line', yAxisId: 'right', strokeWidth: 3 },
    { dataKey: 'nps', name: 'NPS Score', type: 'line', yAxisId: 'right', strokeWidth: 2 }
  ];

  // Traffic vs Performance Data
  const trafficPerformanceData: MultiAxisChartDataItem[] = [
    { name: '00:00', requests: 1200, responseTime: 85, errorRate: 0.5 },
    { name: '04:00', requests: 800, responseTime: 65, errorRate: 0.3 },
    { name: '08:00', requests: 3500, responseTime: 120, errorRate: 1.2 },
    { name: '12:00', requests: 5200, responseTime: 180, errorRate: 2.1 },
    { name: '16:00', requests: 4800, responseTime: 160, errorRate: 1.8 },
    { name: '20:00', requests: 3200, responseTime: 110, errorRate: 1.0 },
    { name: '23:59', requests: 1500, responseTime: 90, errorRate: 0.6 }
  ];

  const trafficPerformanceSeries: MultiAxisChartSeries[] = [
    { dataKey: 'requests', name: 'Requests/min', type: 'bar', yAxisId: 'left' },
    { dataKey: 'responseTime', name: 'Avg Response Time (ms)', type: 'line', yAxisId: 'right', strokeWidth: 3 },
    { dataKey: 'errorRate', name: 'Error Rate (%)', type: 'line', yAxisId: 'right', strokeWidth: 2 }
  ];

  // E-commerce Metrics Data
  const ecommerceData: MultiAxisChartDataItem[] = [
    { name: 'Week 1', orders: 450, aov: 278, conversionRate: 3.2 },
    { name: 'Week 2', orders: 520, aov: 285, conversionRate: 3.5 },
    { name: 'Week 3', orders: 495, aov: 292, conversionRate: 3.4 },
    { name: 'Week 4', orders: 580, aov: 305, conversionRate: 3.8 },
    { name: 'Week 5', orders: 625, aov: 312, conversionRate: 4.1 },
    { name: 'Week 6', orders: 670, aov: 320, conversionRate: 4.3 },
    { name: 'Week 7', orders: 710, aov: 328, conversionRate: 4.5 },
    { name: 'Week 8', orders: 750, aov: 335, conversionRate: 4.7 }
  ];

  const ecommerceSeries: MultiAxisChartSeries[] = [
    { dataKey: 'orders', name: 'Orders', type: 'bar', yAxisId: 'left' },
    { dataKey: 'aov', name: 'Avg Order Value ($)', type: 'line', yAxisId: 'right', strokeWidth: 3 },
    { dataKey: 'conversionRate', name: 'Conversion Rate (%)', type: 'area', yAxisId: 'right', fillOpacity: 0.3 }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Multi-Axis Chart
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Multi-Axis Chart는 서로 다른 척도를 가진 데이터를 하나의 차트에 표시합니다.
        왼쪽과 오른쪽에 각각 독립적인 Y축을 배치하여 절대값이 크게 차이나는 지표들을 효과적으로 비교할 수 있습니다.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>사용 예시:</strong> 매출액($) vs 이익률(%), 판매량 vs 평균단가, 트래픽 vs 응답시간, 주문수 vs 전환율 등
      </Alert>

      <Divider sx={{ my: 3 }} />

      {/* Example 1: Revenue vs Margin */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          1. 분기별 매출 및 이익률
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          매출액(왼쪽 축)과 이익률(오른쪽 축)을 함께 표시하여 수익성 추이를 분석합니다.
          매출 규모와 수익성을 동시에 모니터링할 수 있습니다.
        </Typography>
        <MultiAxisChart
          data={revenueMarginData}
          series={revenueMarginSeries}
          height={400}
          xAxisLabel="Quarter"
          leftYAxisLabel="Revenue ($)"
          rightYAxisLabel="Margin (%)"
          leftYAxisUnit="$"
          rightYAxisUnit="%"
          showGrid={true}
          showLegend={true}
          showTooltip={true}
        />
      </Paper>

      {/* Example 2: Sales vs Satisfaction */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          2. 판매액 및 고객만족도 추이
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          판매액(왼쪽 축)과 만족도 지표(오른쪽 축)를 함께 표시하여 매출과 고객 경험의 상관관계를 분석합니다.
        </Typography>
        <MultiAxisChart
          data={salesSatisfactionData}
          series={salesSatisfactionSeries}
          height={400}
          xAxisLabel="Month"
          leftYAxisLabel="Sales ($)"
          rightYAxisLabel="Score"
          leftYAxisUnit="$"
          showGrid={true}
          showLegend={true}
          showTooltip={true}
        />
      </Paper>

      {/* Example 3: Traffic vs Performance */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          3. 서버 트래픽 및 성능 모니터링
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          요청 수(왼쪽 축)와 응답시간/에러율(오른쪽 축)을 함께 표시하여 트래픽 증가가 성능에 미치는 영향을 분석합니다.
        </Typography>
        <MultiAxisChart
          data={trafficPerformanceData}
          series={trafficPerformanceSeries}
          height={400}
          xAxisLabel="Time"
          leftYAxisLabel="Requests"
          rightYAxisLabel="Response Time (ms) / Error Rate (%)"
          showGrid={true}
          showLegend={true}
          showTooltip={true}
        />
      </Paper>

      {/* Example 4: E-commerce Metrics */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          4. 이커머스 핵심 지표
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          주문 수(왼쪽 축)와 평균 주문 금액, 전환율(오른쪽 축)을 함께 표시하여 전자상거래 성과를 종합적으로 분석합니다.
        </Typography>
        <MultiAxisChart
          data={ecommerceData}
          series={ecommerceSeries}
          height={400}
          xAxisLabel="Week"
          leftYAxisLabel="Orders"
          rightYAxisLabel="AOV ($) / Conversion (%)"
          leftYAxisUnit="orders"
          showGrid={true}
          showLegend={true}
          showTooltip={true}
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
          {`import { MultiAxisChart } from '@/components/common/Charts';

const data = [
  { name: 'Q1 2023', revenue: 1250000, margin: 18.5 },
  { name: 'Q2 2023', revenue: 1420000, margin: 19.2 },
  // ...
];

const series = [
  {
    dataKey: 'revenue',
    name: 'Revenue',
    type: 'bar',
    yAxisId: 'left'  // 왼쪽 Y축 사용
  },
  {
    dataKey: 'margin',
    name: 'Profit Margin (%)',
    type: 'line',
    yAxisId: 'right',  // 오른쪽 Y축 사용
    strokeWidth: 3
  }
];

<MultiAxisChart
  data={data}
  series={series}
  height={400}
  xAxisLabel="Quarter"
  leftYAxisLabel="Revenue ($)"
  rightYAxisLabel="Margin (%)"
  leftYAxisUnit="$"
  rightYAxisUnit="%"
  showGrid={true}
  showLegend={true}
  showTooltip={true}
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
              <li><code>data</code>: MultiAxisChartDataItem[] - 차트 데이터</li>
              <li><code>series</code>: MultiAxisChartSeries[] - 시리즈 설정</li>
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
              <li><code>leftYAxisLabel</code>: string - 왼쪽 Y축 레이블</li>
              <li><code>rightYAxisLabel</code>: string - 오른쪽 Y축 레이블</li>
              <li><code>leftYAxisUnit</code>: string - 왼쪽 Y축 단위</li>
              <li><code>rightYAxisUnit</code>: string - 오른쪽 Y축 단위</li>
              <li><code>paper</code>: boolean (기본값: false) - Paper로 감싸기</li>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Series Configuration
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li><code>dataKey</code>: string - 데이터 키</li>
              <li><code>name</code>: string - 시리즈 이름</li>
              <li><code>type</code>: 'bar' | 'line' | 'area' - 차트 유형 (필수)</li>
              <li><code>yAxisId</code>: 'left' | 'right' - 사용할 Y축 (필수)</li>
              <li><code>color</code>: string - 색상 (선택사항)</li>
              <li><code>strokeWidth</code>: number - 선 두께 (line/area)</li>
              <li><code>fillOpacity</code>: number - 영역 투명도 (area)</li>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
