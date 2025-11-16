'use client';

import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { People, Menu, Security, Assessment } from '@mui/icons-material';
import PageHeader from '@/components/common/PageHeader';
import Link from 'next/link';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';

export default function AdminDashboardPage() {
  const locale = useCurrentLocale();
  const t = useI18n();

  const adminFeatures = [
    {
      title: t('admin.dashboard.userManagement'),
      description: t('admin.dashboard.userManagementDesc'),
      icon: People,
      href: `/${locale}/admin/users`,
      color: '#1976d2'
    },
    {
      title: t('admin.dashboard.menuManagement'),
      description: t('admin.dashboard.menuManagementDesc'),
      icon: Menu,
      href: `/${locale}/admin/menus`,
      color: '#2e7d32'
    },
    {
      title: t('admin.dashboard.securitySettings'),
      description: t('admin.dashboard.securitySettingsDesc'),
      icon: Security,
      href: `/${locale}/admin/security`,
      color: '#ed6c02'
    },
    {
      title: t('admin.dashboard.systemLogs'),
      description: t('admin.dashboard.systemLogsDesc'),
      icon: Assessment,
      href: `/${locale}/admin/logs`,
      color: '#9c27b0'
    }
  ];

  return (
    <Box>
      <PageHeader useMenu />

      <Grid container spacing={3}>
        {adminFeatures.map((feature) => (
          <Grid item xs={12} sm={6} md={3} key={feature.href}>
            <Link href={feature.href} style={{ textDecoration: 'none' }}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: `${feature.color}15`,
                      mb: 2
                    }}
                  >
                    <feature.icon sx={{ fontSize: 32, color: feature.color }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
