'use client';

import React from 'react';
import { Box, Typography, Container, Chip, Stack, Divider } from '@mui/material';
import { usePathname } from 'next/navigation';
import { useMenu } from '@/hooks/useMenu';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function DashboardFooter() {
  const pathname = usePathname();
  const { currentMenu } = useMenu();
  const [currentTime, setCurrentTime] = React.useState(new Date());

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
              Enterprise App v1.0.0
            </Typography>

            <Typography variant="caption" color="text.secondary">
              © 2024
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
