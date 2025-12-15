'use client';

import React from 'react';
import {
  SwipeableDrawer,
  Box,
  Typography,
  IconButton,
  Divider
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export interface MobileDetailSheetProps {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  fullHeight?: boolean;
  disableSwipeToOpen?: boolean;
}

// Drag handle component
const DragHandle = () => (
  <Box
    sx={{
      width: 32,
      height: 4,
      backgroundColor: 'grey.400',
      borderRadius: 2,
      mx: 'auto',
      my: 1,
    }}
  />
);

export default function MobileDetailSheet({
  open,
  onClose,
  onOpen,
  title,
  children,
  actions,
  fullHeight = false,
  disableSwipeToOpen = true,
}: MobileDetailSheetProps) {
  const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen || (() => {})}
      disableSwipeToOpen={disableSwipeToOpen}
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: fullHeight ? '95vh' : '80vh',
          minHeight: '30vh',
        },
      }}
    >
      {/* Drag Handle */}
      <DragHandle />

      {/* Header */}
      {title && (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 2,
              pb: 1,
            }}
          >
            <Typography variant="h6" sx={{ flex: 1 }}>
              {title}
            </Typography>
            <IconButton
              size="small"
              onClick={onClose}
              edge="end"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
        </>
      )}

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </Box>

      {/* Actions Footer */}
      {actions && (
        <>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              p: 2,
              pb: 'calc(env(safe-area-inset-bottom) + 16px)',
            }}
          >
            {actions}
          </Box>
        </>
      )}
    </SwipeableDrawer>
  );
}
