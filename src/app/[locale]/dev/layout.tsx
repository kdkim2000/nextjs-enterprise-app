'use client';

import { Box } from '@mui/material';

export default function DevLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {children}
    </Box>
  );
}
