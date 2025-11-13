'use client';

import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Box, useTheme, Paper } from '@mui/material';

export interface PieChartDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartDataItem[];
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  paper?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  showLabel?: boolean;
  showPercentage?: boolean;
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  const theme = useTheme();

  if (active && payload && payload.length) {
    const data = payload[0];
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
        <Box
          sx={{
            fontWeight: 'medium',
            color: data.payload.fill,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              bgcolor: data.payload.fill,
              borderRadius: '50%'
            }}
          />
          <span>{data.name}: {data.value}</span>
        </Box>
      </Paper>
    );
  }
  return null;
};

const renderLabel = (entry: PieChartDataItem, showPercentage: boolean, total: number) => {
  if (showPercentage) {
    const percentage = ((entry.value / total) * 100).toFixed(1);
    return `${entry.name} (${percentage}%)`;
  }
  return `${entry.name}: ${entry.value}`;
};

export default function PieChart({
  data,
  height = 300,
  showLegend = true,
  showTooltip = true,
  paper = false,
  innerRadius = 0,
  outerRadius = 80,
  showLabel = true,
  showPercentage = false
}: PieChartProps) {
  const theme = useTheme();

  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    '#9c27b0', // purple
    '#ff9800', // orange
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
          label={showLabel ? (entry) => renderLabel(entry, showPercentage, total) : false}
          labelLine={showLabel}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || defaultColors[index % defaultColors.length]}
            />
          ))}
        </Pie>
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
          />
        )}
      </RechartsPieChart>
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
