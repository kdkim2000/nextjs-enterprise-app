'use client';

import React, { memo, useMemo } from 'react';
import { Box } from '@mui/material';
import { People, Article, Business, Assessment, Settings, Shield } from '@mui/icons-material';
import { useCurrentLocale } from '@/lib/i18n/client';
import QuickActionGrid, { QuickAction } from '@/components/common/QuickActionGrid';
import { cardStyle, cardContentStyle } from '../styles';
import { chartColors } from './charts/themeColors';

function QuickActions() {
  const locale = useCurrentLocale();

  const actions = useMemo<QuickAction[]>(
    () => [
      {
        id: 'users',
        title: '사용자 관리',
        description: '사용자 목록 및 권한',
        icon: People,
        href: `/${locale}/admin/users`,
        color: chartColors.info
      },
      {
        id: 'boards',
        title: '게시판 관리',
        description: '게시판 유형 설정',
        icon: Article,
        href: `/${locale}/admin/board-types`,
        color: chartColors.warning
      },
      {
        id: 'departments',
        title: '부서 관리',
        description: '조직 구조 관리',
        icon: Business,
        href: `/${locale}/admin/departments`,
        color: chartColors.success
      },
      {
        id: 'logs',
        title: '로그 분석',
        description: '시스템 로그 조회',
        icon: Assessment,
        href: `/${locale}/admin/logs`,
        color: chartColors.primary[1]
      },
      {
        id: 'roles',
        title: '권한 관리',
        description: '역할 및 메뉴 권한',
        icon: Shield,
        href: `/${locale}/admin/roles`,
        color: chartColors.primary[0]
      },
      {
        id: 'settings',
        title: '시스템 설정',
        description: '앱 환경 설정',
        icon: Settings,
        href: `/${locale}/dashboard/settings`,
        color: chartColors.neutral
      }
    ],
    [locale]
  );

  return (
    <Box sx={{ ...cardStyle, height: '100%' }}>
      <Box sx={cardContentStyle}>
        <QuickActionGrid actions={actions} title="빠른 작업" columns={{ xs: 6, sm: 4 }} />
      </Box>
    </Box>
  );
}

export default memo(QuickActions);
