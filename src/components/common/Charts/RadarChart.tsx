'use client';

import React from 'react';
import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Box, useTheme, Paper } from '@mui/material';

export interface RadarChartDataItem {
  subject: string;
  [key: string]: string | number;
}

export interface RadarChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
  fillOpacity?: number;
}

export interface RadarChartProps {
  data: RadarChartDataItem[];
  series: RadarChartSeries[];
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  paper?: boolean;
  showGrid?: boolean;
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
                borderRadius: '50%'
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

export default function RadarChart({
  data,
  series,
  height = 400,
  showLegend = true,
  showTooltip = true,
  paper = false,
  showGrid = true
}: RadarChartProps) {
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
      <RechartsRadarChart data={data}>
        {showGrid && (
          <PolarGrid stroke={theme.palette.divider} />
        )}
        <PolarAngleAxis
          dataKey="subject"
          stroke={theme.palette.text.secondary}
        />
        <PolarRadiusAxis
          stroke={theme.palette.text.secondary}
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
          <Radar
            key={s.dataKey}
            name={s.name || s.dataKey}
            dataKey={s.dataKey}
            stroke={s.color || defaultColors[index % defaultColors.length]}
            fill={s.color || defaultColors[index % defaultColors.length]}
            fillOpacity={s.fillOpacity !== undefined ? s.fillOpacity : 0.6}
          />
        ))}
      </RechartsRadarChart>
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
