'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { Box, useTheme, Paper } from '@mui/material';

export interface TrendChartDataItem {
  name: string;
  actual?: number;
  forecast?: number;
  upperBound?: number;
  lowerBound?: number;
  target?: number;
  [key: string]: string | number | undefined;
}

export interface TrendChartProps {
  data: TrendChartDataItem[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  paper?: boolean;
  showTarget?: boolean;
  showConfidenceInterval?: boolean;
  actualLabel?: string;
  forecastLabel?: string;
  targetLabel?: string;
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
        {payload.map((entry: any, index: number) => {
          // Skip confidence interval bounds in tooltip
          if (entry.dataKey === 'upperBound' || entry.dataKey === 'lowerBound') {
            return null;
          }
          return (
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
                  borderRadius: entry.dataKey === 'target' ? 1 : '50%'
                }}
              />
              <span>
                {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </span>
            </Box>
          );
        })}
      </Paper>
    );
  }
  return null;
};

export default function TrendChart({
  data,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xAxisLabel,
  yAxisLabel,
  paper = false,
  showTarget = true,
  showConfidenceInterval = true,
  actualLabel = 'Actual',
  forecastLabel = 'Forecast',
  targetLabel = 'Target'
}: TrendChartProps) {
  const theme = useTheme();

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

        {/* Confidence Interval Area */}
        {showConfidenceInterval && (
          <>
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill={theme.palette.info.light}
              fillOpacity={0.2}
              legendType="none"
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="none"
              fill={theme.palette.background.paper}
              fillOpacity={1}
              legendType="none"
            />
          </>
        )}

        {/* Actual Line */}
        <Line
          type="monotone"
          dataKey="actual"
          name={actualLabel}
          stroke={theme.palette.primary.main}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          connectNulls={false}
        />

        {/* Forecast Line */}
        <Line
          type="monotone"
          dataKey="forecast"
          name={forecastLabel}
          stroke={theme.palette.info.main}
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          connectNulls={false}
        />

        {/* Target Line */}
        {showTarget && (
          <Line
            type="monotone"
            dataKey="target"
            name={targetLabel}
            stroke={theme.palette.success.main}
            strokeWidth={2}
            strokeDasharray="3 3"
            dot={false}
          />
        )}
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
