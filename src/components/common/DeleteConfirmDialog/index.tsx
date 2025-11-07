'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';

export interface DeleteItem {
  id: string | number;
  displayName: string;
}

export interface DeleteConfirmDialogProps {
  open: boolean;
  itemCount: number;
  itemName: string; // e.g., "user", "menu", "item"
  itemsList?: DeleteItem[];
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
  maxDisplayItems?: number; // Max items to show in list before truncating
  title?: string;
  cancelText?: string;
  confirmText?: string;
  warningMessage?: string;
}

export default function DeleteConfirmDialog({
  open,
  itemCount,
  itemName,
  itemsList = [],
  onCancel,
  onConfirm,
  loading = false,
  maxDisplayItems = 5,
  title = 'Confirm Delete',
  cancelText = 'Cancel',
  confirmText = 'Delete',
  warningMessage
}: DeleteConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const defaultWarningMessage =
    warningMessage ||
    `Are you sure you want to delete ${itemCount} ${itemName}${itemCount > 1 ? 's' : ''}? This action cannot be undone.`;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {defaultWarningMessage}
        </Alert>
        {itemsList.length > 0 && (
          <Box>
            <strong>Selected {itemName}s:</strong>
            <ul>
              {itemsList.slice(0, maxDisplayItems).map((item) => (
                <li key={item.id}>{item.displayName}</li>
              ))}
              {itemsList.length > maxDisplayItems && (
                <li>... and {itemsList.length - maxDisplayItems} more</li>
              )}
            </ul>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
