'use client';

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  Cell
} from 'recharts';
import { Box, useTheme, Paper } from '@mui/material';

export interface BarChartDataItem {
  name: string;
  [key: string]: string | number;
}

export interface BarChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
  stackId?: string;
}

export interface BarChartProps {
  data: BarChartDataItem[];
  series: BarChartSeries[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  paper?: boolean;
  horizontal?: boolean;
  barSize?: number;
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
                borderRadius: 1
              }}
            />
            <span>{entry.name}: {entry.value}</span>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

export default function BarChart({
  data,
  series,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xAxisLabel,
  yAxisLabel,
  paper = false,
  horizontal = false,
  barSize
}: BarChartProps) {
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
      <RechartsBarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.palette.divider}
          />
        )}
        {!horizontal ? (
          <>
            <XAxis
              dataKey="name"
              stroke={theme.palette.text.secondary}
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              stroke={theme.palette.text.secondary}
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke={theme.palette.text.secondary}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
          </>
        )}
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        {showLegend && (
          <Legend
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />
        )}
        {series.map((s, index) => (
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.name || s.dataKey}
            fill={s.color || defaultColors[index % defaultColors.length]}
            stackId={s.stackId}
            barSize={barSize}
          />
        ))}
      </RechartsBarChart>
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
