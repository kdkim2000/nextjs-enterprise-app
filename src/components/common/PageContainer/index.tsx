'use client';

import React from 'react';
import { Container, SxProps, Theme, Typography, Box } from '@mui/material';

export interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  fullHeight?: boolean;
  noPadding?: boolean;
  maxWidth?: false | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  sx?: SxProps<Theme>;
}

export default function PageContainer({
  children,
  title,
  description,
  fullHeight = true,
  noPadding = true,
  maxWidth = false,
  sx = {}
}: PageContainerProps) {
  const defaultSx: SxProps<Theme> = {
    maxWidth: '100%',
    px: noPadding ? 0 : 2,
    ...(fullHeight && {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    })
  };

  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        ...defaultSx,
        ...sx
      }}
    >
      {(title || description) && (
        <Box sx={{ mb: 3 }}>
          {title && (
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body1" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      )}
      {children}
    </Container>
  );
}
