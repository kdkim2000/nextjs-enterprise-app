'use client';

import React from 'react';
import { Box, Typography, Container, Chip, Stack, Divider, Link as MuiLink } from '@mui/material';
import { usePathname } from 'next/navigation';
import { useMenu } from '@/hooks/useMenu';
import { useAppSettings } from '@/hooks/useAppSettings';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function DashboardFooter() {
  const pathname = usePathname();
  const { currentMenu } = useMenu();
  const { getSetting, getLocalizedSetting } = useAppSettings();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Get settings with defaults
  const appName = getLocalizedSetting('app_name', 'Enterprise App');
  const appVersion = getSetting('app_version', '1.0.0');
  const copyrightText = getSetting('copyright_text', '© 2024 Enterprise Corp. All rights reserved.');
  const privacyUrl = getSetting('privacy_policy_url', '/privacy');
  const termsUrl = getSetting('terms_of_service_url', '/terms');
  const supportEmail = getSetting('support_email', '');

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Extract page name from pathname
  const getPageName = () => {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        flexShrink: 0,
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          {/* Left Section - Page Information */}
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            {currentMenu?.programId && (
              <>
                <Chip
                  icon={<FolderOutlinedIcon />}
                  label={`Program: ${currentMenu.programId}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
                <Divider orientation="vertical" flexItem />
              </>
            )}

            <Chip
              icon={<InfoOutlinedIcon />}
              label={`Page: ${getPageName()}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />

            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
              {pathname}
            </Typography>
          </Stack>

          {/* Right Section - App Information */}
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Chip
              icon={<AccessTimeIcon />}
              label={currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })}
              size="small"
              variant="filled"
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 600
              }}
            />

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {appName} v{appVersion}
            </Typography>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

            {/* Footer Links */}
            <Stack direction="row" spacing={1} alignItems="center">
              <MuiLink
                href={privacyUrl}
                underline="hover"
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                Privacy
              </MuiLink>
              <Typography variant="caption" color="text.secondary">|</Typography>
              <MuiLink
                href={termsUrl}
                underline="hover"
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                Terms
              </MuiLink>
              {supportEmail && (
                <>
                  <Typography variant="caption" color="text.secondary">|</Typography>
                  <MuiLink
                    href={`mailto:${supportEmail}`}
                    underline="hover"
                    color="text.secondary"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    {supportEmail}
                  </MuiLink>
                </>
              )}
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

            <Typography variant="caption" color="text.secondary">
              {copyrightText}
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
