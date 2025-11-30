'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DepartmentStatItem } from '../types';

interface DepartmentChartProps {
  data: DepartmentStatItem[];
  loading: boolean;
}

const COLORS = ['#1976d2', '#2196f3', '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb', '#e3f2fd', '#f5f5f5'];

export default function DepartmentChart({ data, loading }: DepartmentChartProps) {
  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton variant="rectangular" height={250} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          부서별 인원 Top 8
        </Typography>
        <Box sx={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => (value.length > 8 ? value.substring(0, 8) + '...' : value)}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString()}명`, '인원']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
