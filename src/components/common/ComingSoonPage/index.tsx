'use client';

import React from 'react';
import { Box, Typography, Button, Container, Paper, Chip } from '@mui/material';
import { Construction, Home, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';

interface ComingSoonPageProps {
  title?: string;
  message?: string;
  featureName?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  homeUrl?: string;
}

/**
 * Coming Soon / Under Construction page component
 * Used for menu items that exist but pages are not yet implemented
 */
export default function ComingSoonPage({
  title,
  message,
  featureName,
  showBackButton = true,
  showHomeButton = true,
  homeUrl
}: ComingSoonPageProps) {
  const router = useRouter();
  const locale = useCurrentLocale();

  const defaultTitle = locale === 'ko' ? '준비 중입니다' : 'Coming Soon';
  const defaultMessage = locale === 'ko'
    ? '이 기능은 현재 개발 중입니다. 곧 만나보실 수 있습니다.'
    : 'This feature is currently under development. It will be available soon.';
  const backButtonText = locale === 'ko' ? '뒤로 가기' : 'Go Back';
  const homeButtonText = locale === 'ko' ? '홈으로' : 'Go Home';

  const defaultHomeUrl = homeUrl || `/${locale}/dashboard`;

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center'
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 6,
            bgcolor: 'background.paper',
            borderRadius: 3,
            maxWidth: 600
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'warning.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.15
              }}
            >
              <Construction sx={{ fontSize: 80, color: 'warning.main' }} />
            </Box>
          </Box>

          <Chip
            label={locale === 'ko' ? '개발 중' : 'Under Development'}
            color="warning"
            size="small"
            sx={{ mb: 2 }}
          />

          <Typography
            variant="h4"
            fontWeight={700}
            color="text.primary"
            gutterBottom
            sx={{ mb: 2 }}
          >
            {title || defaultTitle}
          </Typography>

          {featureName && (
            <Typography
              variant="h6"
              color="primary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              {featureName}
            </Typography>
          )}

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, lineHeight: 1.7 }}
          >
            {message || defaultMessage}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            {showBackButton && (
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => router.back()}
                size="large"
              >
                {backButtonText}
              </Button>
            )}
            {showHomeButton && (
              <Button
                variant="contained"
                startIcon={<Home />}
                onClick={() => router.push(defaultHomeUrl)}
                size="large"
              >
                {homeButtonText}
              </Button>
            )}
          </Box>
        </Paper>

        <Box sx={{ mt: 4, opacity: 0.7 }}>
          <Typography variant="caption" color="text.secondary">
            {locale === 'ko'
              ? '이 페이지는 곧 사용 가능합니다. 조금만 기다려 주세요!'
              : 'This page will be available soon. Please check back later!'}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
