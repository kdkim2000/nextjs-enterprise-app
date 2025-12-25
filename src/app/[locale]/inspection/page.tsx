'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Grid, Paper, Typography, Button } from '@mui/material';
import {
  Assignment as TemplateIcon,
  PlaylistAddCheck as ExecutionIcon,
  Assessment as ResultsIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import { useCurrentLocale } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

interface MenuCard {
  title: Record<string, string>;
  description: Record<string, string>;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const menuCards: MenuCard[] = [
  {
    title: { ko: '체크시트 템플릿', en: 'Checksheet Templates' },
    description: { ko: '검사용 체크시트 템플릿을 관리합니다', en: 'Manage checksheet templates for inspections' },
    icon: <TemplateIcon sx={{ fontSize: 48 }} />,
    href: '/inspection/templates',
    color: '#1976d2',
  },
  {
    title: { ko: '검사 실시', en: 'Inspections' },
    description: { ko: '검사를 생성하고 실시합니다', en: 'Create and execute inspections' },
    icon: <ExecutionIcon sx={{ fontSize: 48 }} />,
    href: '/inspection/executions',
    color: '#2e7d32',
  },
  {
    title: { ko: '검사 결과', en: 'Inspection Results' },
    description: { ko: '완료된 검사 결과를 조회합니다', en: 'View completed inspection results' },
    icon: <ResultsIcon sx={{ fontSize: 48 }} />,
    href: '/inspection/results',
    color: '#ed6c02',
  },
];

export default function InspectionHomePage() {
  const router = useRouter();
  const currentLocale = useCurrentLocale();

  const handleCardClick = (href: string) => {
    router.push(`/${currentLocale}${href}`);
  };

  return (
    <StandardCrudPageLayout useMenu showBreadcrumb>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {getLocalizedValue({ ko: '검사 관리', en: 'Inspection Management' }, currentLocale)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {getLocalizedValue(
            {
              ko: '체크시트 기반 검사를 관리합니다. 템플릿을 생성하고, 검사를 실시하며, 결과를 조회할 수 있습니다.',
              en: 'Manage checksheet-based inspections. Create templates, execute inspections, and view results.',
            },
            currentLocale
          )}
        </Typography>

        <Grid container spacing={3}>
          {menuCards.map((card, index) => (
            <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleCardClick(card.href)}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: `${card.color}15`,
                    color: card.color,
                    mb: 2,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {getLocalizedValue(card.title, currentLocale)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getLocalizedValue(card.description, currentLocale)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            {getLocalizedValue({ ko: '빠른 작업', en: 'Quick Actions' }, currentLocale)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${currentLocale}/inspection/templates`)}
            >
              {getLocalizedValue({ ko: '새 템플릿', en: 'New Template' }, currentLocale)}
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<ExecutionIcon />}
              onClick={() => router.push(`/${currentLocale}/inspection/executions`)}
            >
              {getLocalizedValue({ ko: '새 검사', en: 'New Inspection' }, currentLocale)}
            </Button>
          </Box>
        </Box>
      </Box>
    </StandardCrudPageLayout>
  );
}
