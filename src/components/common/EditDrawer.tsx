'use client';

import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  CircularProgress
} from '@mui/material';
import { Close } from '@mui/icons-material';

export interface EditDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  saveLoading?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  width?: number | string | { xs?: string | number; sm?: string | number; md?: string | number; lg?: string | number; xl?: string | number };
}

export default function EditDrawer({
  open,
  onClose,
  title,
  children,
  onSave,
  saveLoading = false,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  width = { xs: '100%', sm: 500 }
}: EditDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="h6">
            {title}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Form Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          <Stack spacing={3}>
            {children}
          </Stack>
        </Box>

        {/* Footer Actions */}
        <Box sx={{
          p: 2,
          display: 'flex',
          gap: 2,
          justifyContent: 'flex-end',
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={saveLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={saveLoading}
          >
            {saveLoading ? <CircularProgress size={20} /> : saveLabel}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
