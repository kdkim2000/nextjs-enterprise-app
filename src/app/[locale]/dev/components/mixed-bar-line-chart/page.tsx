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
import { MixedBarLineChart } from '@/components/common/Charts';
import type { MixedBarLineChartDataItem, MixedBarLineChartSeries } from '@/components/common/Charts';

export default function MixedBarLineChartDemo() {
  // Sales Performance Data
  const salesData: MixedBarLineChartDataItem[] = [
    { name: 'Jan', revenue: 125000, orders: 450, conversionRate: 3.2 },
    { name: 'Feb', revenue: 142000, orders: 520, conversionRate: 3.5 },
    { name: 'Mar', revenue: 138000, orders: 495, conversionRate: 3.4 },
    { name: 'Apr', revenue: 165000, orders: 580, conversionRate: 3.8 },
    { name: 'May', revenue: 178000, orders: 625, conversionRate: 4.1 },
    { name: 'Jun', revenue: 192000, orders: 670, conversionRate: 4.3 },
    { name: 'Jul', revenue: 205000, orders: 710, conversionRate: 4.5 },
    { name: 'Aug', revenue: 198000, orders: 690, conversionRate: 4.4 },
    { name: 'Sep', revenue: 215000, orders: 750, conversionRate: 4.7 },
    { name: 'Oct', revenue: 228000, orders: 795, conversionRate: 4.9 },
    { name: 'Nov', revenue: 242000, orders: 850, conversionRate: 5.1 },
    { name: 'Dec', revenue: 268000, orders: 920, conversionRate: 5.4 }
  ];

  const salesSeries: MixedBarLineChartSeries[] = [
    { dataKey: 'revenue', name: 'Revenue ($)', type: 'bar', yAxisId: 'left' },
    { dataKey: 'orders', name: 'Orders', type: 'bar', yAxisId: 'left' },
    { dataKey: 'conversionRate', name: 'Conversion Rate (%)', type: 'line', yAxisId: 'left', strokeWidth: 3 }
  ];

  // Production vs Quality Data
  const productionData: MixedBarLineChartDataItem[] = [
    { name: 'Week 1', production: 1200, defects: 36, qualityRate: 97.0 },
    { name: 'Week 2', production: 1350, defects: 32, qualityRate: 97.6 },
    { name: 'Week 3', production: 1280, defects: 28, qualityRate: 97.8 },
    { name: 'Week 4', production: 1420, defects: 35, qualityRate: 97.5 },
    { name: 'Week 5', production: 1380, defects: 25, qualityRate: 98.2 },
    { name: 'Week 6', production: 1500, defects: 30, qualityRate: 98.0 },
    { name: 'Week 7', production: 1450, defects: 22, qualityRate: 98.5 },
    { name: 'Week 8', production: 1550, defects: 28, qualityRate: 98.2 }
  ];

  const productionSeries: MixedBarLineChartSeries[] = [
    { dataKey: 'production', name: 'Production Volume', type: 'bar', yAxisId: 'left' },
    { dataKey: 'defects', name: 'Defects', type: 'bar', yAxisId: 'left' },
    { dataKey: 'qualityRate', name: 'Quality Rate (%)', type: 'line', yAxisId: 'left', strokeWidth: 3 }
  ];

  // Marketing Performance Data
  const marketingData: MixedBarLineChartDataItem[] = [
    { name: 'Jan', spend: 15000, impressions: 850000, ctr: 2.8, cpc: 1.76 },
    { name: 'Feb', spend: 18000, impressions: 920000, ctr: 3.1, cpc: 1.96 },
    { name: 'Mar', spend: 17500, impressions: 890000, ctr: 3.0, cpc: 1.97 },
    { name: 'Apr', spend: 22000, impressions: 1050000, ctr: 3.3, cpc: 2.10 },
    { name: 'May', spend: 25000, impressions: 1180000, ctr: 3.5, cpc: 2.12 },
    { name: 'Jun', spend: 28000, impressions: 1320000, ctr: 3.8, cpc: 2.12 }
  ];

  const marketingSeries: MixedBarLineChartSeries[] = [
    { dataKey: 'spend', name: 'Ad Spend ($)', type: 'bar', yAxisId: 'left', barSize: 40 },
    { dataKey: 'impressions', name: 'Impressions', type: 'bar', yAxisId: 'left', barSize: 40 },
    { dataKey: 'ctr', name: 'CTR (%)', type: 'line', yAxisId: 'left', strokeWidth: 3 }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mixed Bar & Line Chart
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Mixed Bar & Line Chart는 막대 그래프와 선 그래프를 결합하여 서로 다른 유형의 데이터를 효과적으로 비교합니다.
        절대값(막대)과 비율/추세(선)를 함께 표시하여 데이터 간의 관계를 명확하게 보여줍니다.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>사용 예시:</strong> 매출액과 전환율, 생산량과 품질율, 광고비와 CTR, 판매량과 고객만족도 등
      </Alert>

      <Divider sx={{ my: 3 }} />

      {/* Example 1: Sales Performance */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          1. 월별 매출 성과 및 전환율
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          매출액과 주문 수는 막대로, 전환율은 선으로 표시하여 매출 성과와 효율성을 동시에 분석합니다.
        </Typography>
        <MixedBarLineChart
          data={salesData}
          series={salesSeries}
          height={400}
          xAxisLabel="Month"
          yAxisLabel="Amount / Rate"
          showGrid={true}
          showLegend={true}
          showTooltip={true}
        />
      </Paper>

      {/* Example 2: Production Quality */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          2. 생산량 및 품질 관리
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          생산량과 불량 수는 막대로, 품질율은 선으로 표시하여 생산 효율과 품질 추이를 모니터링합니다.
        </Typography>
        <MixedBarLineChart
          data={productionData}
          series={productionSeries}
          height={400}
          xAxisLabel="Week"
          yAxisLabel="Volume / Rate (%)"
          showGrid={true}
          showLegend={true}
          showTooltip={true}
        />
      </Paper>

      {/* Example 3: Marketing Performance */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          3. 마케팅 성과 분석
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          광고비와 노출수는 막대로, 클릭률(CTR)은 선으로 표시하여 마케팅 투자 대비 효율을 분석합니다.
        </Typography>
        <MixedBarLineChart
          data={marketingData}
          series={marketingSeries}
          height={400}
          xAxisLabel="Month"
          yAxisLabel="Spend / Impressions / CTR"
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
          {`import { MixedBarLineChart } from '@/components/common/Charts';

const data = [
  { name: 'Jan', revenue: 125000, orders: 450, conversionRate: 3.2 },
  { name: 'Feb', revenue: 142000, orders: 520, conversionRate: 3.5 },
  // ...
];

const series = [
  {
    dataKey: 'revenue',
    name: 'Revenue ($)',
    type: 'bar',
    yAxisId: 'left'
  },
  {
    dataKey: 'orders',
    name: 'Orders',
    type: 'bar',
    yAxisId: 'left'
  },
  {
    dataKey: 'conversionRate',
    name: 'Conversion Rate (%)',
    type: 'line',
    yAxisId: 'left',
    strokeWidth: 3
  }
];

<MixedBarLineChart
  data={data}
  series={series}
  height={400}
  xAxisLabel="Month"
  yAxisLabel="Amount / Rate"
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
              <li><code>data</code>: MixedBarLineChartDataItem[] - 차트 데이터</li>
              <li><code>series</code>: MixedBarLineChartSeries[] - 시리즈 설정</li>
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
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Series Configuration
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li><code>dataKey</code>: string - 데이터 키</li>
              <li><code>name</code>: string - 시리즈 이름</li>
              <li><code>type</code>: 'bar' | 'line' - 차트 유형 (필수)</li>
              <li><code>color</code>: string - 색상 (선택사항)</li>
              <li><code>yAxisId</code>: 'left' | 'right' - Y축 ID (현재는 'left'만 지원)</li>
              <li><code>strokeWidth</code>: number - 선 두께 (line 타입)</li>
              <li><code>barSize</code>: number - 막대 너비 (bar 타입)</li>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
