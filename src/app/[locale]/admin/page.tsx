'use client';

import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { People, Menu, Security, Assessment } from '@mui/icons-material';
import PageHeader from '@/components/common/PageHeader';
import Link from 'next/link';
import { useCurrentLocale } from '@/lib/i18n/client';

export default function AdminDashboardPage() {
  const locale = useCurrentLocale();

  const adminFeatures = [
    {
      title: 'User Management',
      titleKo: '사용자 관리',
      description: 'Manage users, roles, and permissions',
      descriptionKo: '사용자, 역할 및 권한 관리',
      icon: People,
      href: `/${locale}/admin/users`,
      color: '#1976d2'
    },
    {
      title: 'Menu Management',
      titleKo: '메뉴 관리',
      description: 'Configure application menus and navigation',
      descriptionKo: '애플리케이션 메뉴 및 네비게이션 구성',
      icon: Menu,
      href: `/${locale}/admin/menus`,
      color: '#2e7d32'
    },
    {
      title: 'Security Settings',
      titleKo: '보안 설정',
      description: 'Manage security policies and settings',
      descriptionKo: '보안 정책 및 설정 관리',
      icon: Security,
      href: `/${locale}/admin/security`,
      color: '#ed6c02'
    },
    {
      title: 'System Logs',
      titleKo: '시스템 로그',
      description: 'View and analyze system logs',
      descriptionKo: '시스템 로그 보기 및 분석',
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
                    {locale === 'ko' ? feature.titleKo : feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {locale === 'ko' ? feature.descriptionKo : feature.description}
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
