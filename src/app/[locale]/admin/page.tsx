'use client';

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider } from '@mui/material';
import {
  People,
  Menu,
  Security,
  Assessment,
  AccountTree,
  Assignment,
  ManageAccounts,
  Forum,
  Article,
  Help,
  Code,
  Message,
  Settings
} from '@mui/icons-material';
import PageHeader from '@/components/common/PageHeader';
import Link from 'next/link';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';

interface AdminFeature {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

interface FeatureCategory {
  title: string;
  features: AdminFeature[];
}

export default function AdminDashboardPage() {
  const locale = useCurrentLocale();
  const t = useI18n();

  const featureCategories: FeatureCategory[] = [
    {
      title: 'User & Access Management',
      features: [
        {
          title: t('admin.dashboard.userManagement'),
          description: t('admin.dashboard.userManagementDesc'),
          icon: People,
          href: `/${locale}/admin/users`,
          color: '#1976d2'
        },
        {
          title: t('admin.dashboard.roleManagement'),
          description: t('admin.dashboard.roleManagementDesc'),
          icon: Security,
          href: `/${locale}/admin/roles`,
          color: '#9c27b0'
        },
        {
          title: t('admin.dashboard.userRoleMapping'),
          description: t('admin.dashboard.userRoleMappingDesc'),
          icon: ManageAccounts,
          href: `/${locale}/admin/user-role-mapping`,
          color: '#673ab7'
        },
        {
          title: t('admin.dashboard.departmentManagement'),
          description: t('admin.dashboard.departmentManagementDesc'),
          icon: AccountTree,
          href: `/${locale}/admin/departments`,
          color: '#00897b'
        }
      ]
    },
    {
      title: 'Menu & Navigation',
      features: [
        {
          title: t('admin.dashboard.menuManagement'),
          description: t('admin.dashboard.menuManagementDesc'),
          icon: Menu,
          href: `/${locale}/admin/menus`,
          color: '#2e7d32'
        },
        {
          title: t('admin.dashboard.programManagement'),
          description: t('admin.dashboard.programManagementDesc'),
          icon: Assignment,
          href: `/${locale}/admin/programs`,
          color: '#0288d1'
        },
        {
          title: t('admin.dashboard.roleMenuMapping'),
          description: t('admin.dashboard.roleMenuMappingDesc'),
          icon: Settings,
          href: `/${locale}/admin/role-menu-mapping`,
          color: '#5e35b1'
        }
      ]
    },
    {
      title: 'Content Management',
      features: [
        {
          title: t('admin.dashboard.boardTypeManagement'),
          description: t('admin.dashboard.boardTypeManagementDesc'),
          icon: Forum,
          href: `/${locale}/admin/board-types`,
          color: '#f57c00'
        },
        {
          title: t('admin.dashboard.postManagement'),
          description: t('admin.dashboard.postManagementDesc'),
          icon: Article,
          href: `/${locale}/admin/posts`,
          color: '#d81b60'
        },
        {
          title: t('admin.dashboard.helpManagement'),
          description: t('admin.dashboard.helpManagementDesc'),
          icon: Help,
          href: `/${locale}/admin/help`,
          color: '#43a047'
        }
      ]
    },
    {
      title: 'System Settings',
      features: [
        {
          title: t('admin.dashboard.codeManagement'),
          description: t('admin.dashboard.codeManagementDesc'),
          icon: Code,
          href: `/${locale}/admin/codes`,
          color: '#455a64'
        },
        {
          title: t('admin.dashboard.messageManagement'),
          description: t('admin.dashboard.messageManagementDesc'),
          icon: Message,
          href: `/${locale}/admin/messages`,
          color: '#00acc1'
        },
        {
          title: t('admin.dashboard.systemLogs'),
          description: t('admin.dashboard.systemLogsDesc'),
          icon: Assessment,
          href: `/${locale}/admin/logs`,
          color: '#e53935'
        }
      ]
    }
  ];

  return (
    <Box>
      <PageHeader useMenu />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {t('admin.dashboard.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('admin.dashboard.subtitle')}
        </Typography>
      </Box>

      {featureCategories.map((category, categoryIndex) => (
        <Box key={categoryIndex} sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            fontWeight={600}
            color="text.secondary"
            sx={{ mb: 2, pl: 1 }}
          >
            {category.title}
          </Typography>

          <Grid container spacing={3}>
            {category.features.map((feature) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={feature.href}>
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

          {categoryIndex < featureCategories.length - 1 && (
            <Divider sx={{ mt: 4 }} />
          )}
        </Box>
      ))}
    </Box>
  );
}
