'use client';

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { usePathname } from 'next/navigation';
import { useMenu } from '@/hooks/useMenu';

export default function Footer() {
  const pathname = usePathname();
  const { currentMenu } = useMenu();

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
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
          <Box>
            {currentMenu?.programId && (
              <Typography variant="body2" color="text.secondary">
                <strong>Program ID:</strong> {currentMenu.programId} |{' '}
                <strong>Path:</strong> {pathname}
              </Typography>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            © 2024 Enterprise App v1.0.0
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
