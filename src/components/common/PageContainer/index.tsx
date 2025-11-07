'use client';

import React from 'react';
import { Container, SxProps, Theme } from '@mui/material';

export interface PageContainerProps {
  children: React.ReactNode;
  fullHeight?: boolean;
  noPadding?: boolean;
  maxWidth?: false | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  sx?: SxProps<Theme>;
}

export default function PageContainer({
  children,
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
      flexDirection: 'column',
      overflow: 'hidden'
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
      {children}
    </Container>
  );
}
