'use client';

import React from 'react';
import {
  ComposedChart as RechartsComposedChart,
  Line,
  Bar,
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

export interface ComposedChartDataItem {
  name: string;
  [key: string]: string | number;
}

export interface ComposedChartSeries {
  type: 'line' | 'bar' | 'area';
  dataKey: string;
  name?: string;
  color?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  yAxisId?: string;
  stackId?: string;
}

export interface ComposedChartProps {
  data: ComposedChartDataItem[];
  series: ComposedChartSeries[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  paper?: boolean;
  curved?: boolean;
  dualAxis?: boolean;
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
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
        {payload.map((entry, index) => (
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
                borderRadius: entry.type === 'line' ? '50%' : 1
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

export default function ComposedChart({
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
  dualAxis = false
}: ComposedChartProps) {
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
      <RechartsComposedChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          {series
            .filter(s => s.type === 'area')
            .map((s, index) => {
              const color = s.color || defaultColors[index % defaultColors.length];
              return (
                <linearGradient key={s.dataKey} id={`gradient-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={s.fillOpacity || 0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
        </defs>
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
        {dualAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={theme.palette.text.secondary}
          />
        )}
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
          const yAxisId = s.yAxisId || 'left';

          if (s.type === 'bar') {
            return (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                fill={color}
                yAxisId={yAxisId}
                stackId={s.stackId}
              />
            );
          } else if (s.type === 'area') {
            return (
              <Area
                key={s.dataKey}
                type={curved ? 'monotone' : 'linear'}
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                stroke={color}
                strokeWidth={s.strokeWidth || 2}
                fill={`url(#gradient-${s.dataKey})`}
                yAxisId={yAxisId}
                stackId={s.stackId}
              />
            );
          } else {
            return (
              <Line
                key={s.dataKey}
                type={curved ? 'monotone' : 'linear'}
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                stroke={color}
                strokeWidth={s.strokeWidth || 2}
                yAxisId={yAxisId}
              />
            );
          }
        })}
      </RechartsComposedChart>
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
