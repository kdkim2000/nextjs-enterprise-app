'use client';

import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { SearchOff, Home, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n/client';

interface NotFoundPageProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  homeUrl?: string;
}

/**
 * Common 404 / Page Not Found component
 * Can be used across different sections of the application
 */
export default function NotFoundPage({
  title,
  message,
  showBackButton = true,
  showHomeButton = true,
  homeUrl
}: NotFoundPageProps) {
  const router = useRouter();
  const locale = useCurrentLocale();

  const defaultTitle = locale === 'ko' ? '페이지를 찾을 수 없습니다' : 'Page Not Found';
  const defaultMessage = locale === 'ko'
    ? '요청하신 페이지가 존재하지 않거나 아직 구현되지 않았습니다.'
    : 'The page you are looking for does not exist or has not been implemented yet.';
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
                bgcolor: 'error.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.15
              }}
            >
              <SearchOff sx={{ fontSize: 80, color: 'error.main' }} />
            </Box>
          </Box>

          <Typography
            variant="h3"
            fontWeight={700}
            color="text.primary"
            gutterBottom
            sx={{ mb: 2 }}
          >
            404
          </Typography>

          <Typography
            variant="h5"
            fontWeight={600}
            color="text.primary"
            gutterBottom
            sx={{ mb: 2 }}
          >
            {title || defaultTitle}
          </Typography>

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
              ? '페이지가 이동되었거나 삭제되었을 수 있습니다.'
              : 'The page may have been moved or deleted.'}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
