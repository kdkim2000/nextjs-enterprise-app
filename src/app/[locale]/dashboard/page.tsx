'use client';

import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper
} from '@mui/material';
import {
  People,
  Assessment,
  TrendingUp,
  Description
} from '@mui/icons-material';
import PageHeader from '@/components/common/PageHeader';

export default function DashboardPage() {

  const stats = [
    { title: 'Total Users', value: '1,234', icon: <People />, color: '#1976d2' },
    { title: 'Reports', value: '89', icon: <Assessment />, color: '#2e7d32' },
    { title: 'Growth', value: '+12%', icon: <TrendingUp />, color: '#ed6c02' },
    { title: 'Documents', value: '456', icon: <Description />, color: '#9c27b0' }
  ];

  return (
    <Container maxWidth={false} sx={{ maxWidth: '100%', px: 0 }}>
      <PageHeader useMenu />

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {React.cloneElement(stat.icon, { sx: { fontSize: 32 } })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No recent activity to display
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a menu item from the sidebar to get started
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
