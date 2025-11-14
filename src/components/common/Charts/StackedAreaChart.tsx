'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Box, useTheme, Paper } from '@mui/material';

export interface StackedAreaChartDataItem {
  name: string;
  [key: string]: string | number;
}

export interface StackedAreaChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
  fillOpacity?: number;
}

export interface StackedAreaChartProps {
  data: StackedAreaChartDataItem[];
  series: StackedAreaChartSeries[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  paper?: boolean;
  curved?: boolean;
  stackId?: string;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  const theme = useTheme();

  if (active && payload && payload.length) {
    // Calculate total
    const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);

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
        <Box
          sx={{
            mt: 0.5,
            pt: 0.5,
            borderTop: 1,
            borderColor: 'divider',
            fontWeight: 'medium',
            fontSize: '0.875rem'
          }}
        >
          Total: {total.toLocaleString()}
        </Box>
      </Paper>
    );
  }
  return null;
};

export default function StackedAreaChart({
  data,
  series,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xAxisLabel,
  yAxisLabel,
  paper = false,
  curved = true,
  stackId = 'stack1'
}: StackedAreaChartProps) {
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
      <AreaChart
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
        {series.map((s, index) => (
          <Area
            key={s.dataKey}
            type={curved ? 'monotone' : 'linear'}
            dataKey={s.dataKey}
            name={s.name || s.dataKey}
            stackId={stackId}
            stroke={s.color || defaultColors[index % defaultColors.length]}
            fill={s.color || defaultColors[index % defaultColors.length]}
            fillOpacity={s.fillOpacity || 0.6}
          />
        ))}
      </AreaChart>
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
