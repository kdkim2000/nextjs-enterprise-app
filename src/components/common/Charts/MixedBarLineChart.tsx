'use client';

import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, useTheme, Paper } from '@mui/material';

export interface MixedBarLineChartDataItem {
  name: string;
  [key: string]: string | number;
}

export interface MixedBarLineChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
  type: 'bar' | 'line';
  yAxisId?: 'left' | 'right';
  strokeWidth?: number;
  barSize?: number;
}

export interface MixedBarLineChartProps {
  data: MixedBarLineChartDataItem[];
  series: MixedBarLineChartSeries[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  paper?: boolean;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  const theme = useTheme();

  if (active && payload && payload.length) {
    return (
      <Paper
        sx={{
          p: 1.5,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          boxShadow: theme.shadows[3]
        }}
      >
        <Box sx={{ fontWeight: 'medium', mb: 0.5 }}>{label}</Box>
        {payload.map((entry: any, index: number) => (
          <Box
            key={index}
            sx={{
              color: entry.color,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: entry.color,
                borderRadius: entry.dataKey?.toString().includes('line') ? '50%' : 1
              }}
            />
            <span>{entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

export default function MixedBarLineChart({
  data,
  series,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xAxisLabel,
  yAxisLabel,
  paper = false
}: MixedBarLineChartProps) {
  const theme = useTheme();

  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.palette.divider}
          />
        )}
        <XAxis
          dataKey="name"
          stroke={theme.palette.text.secondary}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
        />
        <YAxis
          yAxisId="left"
          stroke={theme.palette.text.secondary}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        {showLegend && (
          <Legend
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />
        )}
        {series.map((s, index) => {
          const color = s.color || defaultColors[index % defaultColors.length];

          if (s.type === 'bar') {
            return (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                fill={color}
                yAxisId={s.yAxisId || 'left'}
                barSize={s.barSize}
              />
            );
          } else {
            return (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                stroke={color}
                strokeWidth={s.strokeWidth || 2}
                yAxisId={s.yAxisId || 'left'}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            );
          }
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );

  if (paper) {
    return (
      <Paper sx={{ p: 2 }}>
        {chartContent}
      </Paper>
    );
  }

  return chartContent;
}
