'use client';

import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, useTheme, Paper, Typography } from '@mui/material';

export interface DonutChartDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface DonutChartProps {
  data: DonutChartDataItem[];
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  paper?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  showLabel?: boolean;
  centerText?: string;
  centerSubtext?: string;
}

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
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

export default function DonutChart({
  data,
  height = 300,
  showLegend = true,
  showTooltip = true,
  paper = false,
  innerRadius = 60,
  outerRadius = 80,
  showLabel = false,
  centerText,
  centerSubtext
}: DonutChartProps) {
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
    <Box sx={{ position: 'relative', width: '100%', height }}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data as any}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
            label={showLabel}
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

      {/* Center Text */}
      {(centerText || centerSubtext) && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          {centerText && (
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              {centerText}
            </Typography>
          )}
          {centerSubtext && (
            <Typography variant="body2" color="text.secondary">
              {centerSubtext}
            </Typography>
          )}
        </Box>
      )}
    </Box>
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
