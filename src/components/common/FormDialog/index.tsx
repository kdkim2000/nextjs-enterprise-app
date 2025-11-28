'use client';

import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export interface FormDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Save/Submit handler
   */
  onSave?: () => void;

  /**
   * Dialog title
   */
  title: string;

  /**
   * Whether save is in progress
   */
  saveLoading?: boolean;

  /**
   * Whether save button is disabled
   */
  saveDisabled?: boolean;

  /**
   * Save button label
   */
  saveLabel?: string;

  /**
   * Cancel button label
   */
  cancelLabel?: string;

  /**
   * Max width of dialog
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;

  /**
   * Whether to show full screen on mobile
   */
  fullScreenOnMobile?: boolean;

  /**
   * Breakpoint for full screen (default: 'md')
   */
  fullScreenBreakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Dialog height (default: 90vh)
   */
  height?: string | number;

  /**
   * Whether to show action buttons
   */
  showActions?: boolean;

  /**
   * Additional actions to render before cancel/save buttons
   */
  additionalActions?: ReactNode;

  /**
   * Content max width for centered layout
   */
  contentMaxWidth?: number | string;

  /**
   * Children (form content)
   */
  children: ReactNode;
}

/**
 * FormDialog - Full-screen responsive dialog for forms
 *
 * Features:
 * - Responsive: Full screen on mobile, large dialog on desktop
 * - Fixed header with title and close button
 * - Scrollable content area
 * - Fixed footer with action buttons
 * - Loading state for save button
 *
 * Usage:
 * ```tsx
 * <FormDialog
 *   open={dialogOpen}
 *   onClose={handleClose}
 *   onSave={handleSave}
 *   title="Create New Item"
 *   saveLoading={saving}
 *   saveDisabled={!isValid}
 * >
 *   <YourFormFields />
 * </FormDialog>
 * ```
 */
export default function FormDialog({
  open,
  onClose,
  onSave,
  title,
  saveLoading = false,
  saveDisabled = false,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  maxWidth = 'lg',
  fullScreenOnMobile = true,
  fullScreenBreakpoint = 'md',
  height = '90vh',
  showActions = true,
  additionalActions,
  contentMaxWidth = 900,
  children
}: FormDialogProps) {
  const theme = useTheme();
  const isFullScreen = useMediaQuery(theme.breakpoints.down(fullScreenBreakpoint));
  const fullScreen = fullScreenOnMobile && isFullScreen;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth={maxWidth}
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          // Desktop: Large dialog with specified height
          ...(!fullScreen && {
            height,
            maxHeight: height
          })
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent
        dividers
        sx={{
          p: 3,
          bgcolor: 'background.default',
          flex: 1,
          overflow: 'auto'
        }}
      >
        <Box
          sx={{
            maxWidth: contentMaxWidth,
            mx: 'auto'
          }}
        >
          {children}
        </Box>
      </DialogContent>

      {/* Footer */}
      {showActions && (
        <DialogActions
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            gap: 1
          }}
        >
          {additionalActions}
          <Button
            onClick={onClose}
            color="inherit"
            disabled={saveLoading}
            sx={{ minWidth: 100 }}
          >
            {cancelLabel}
          </Button>
          {onSave && (
            <Button
              onClick={onSave}
              variant="contained"
              disabled={saveLoading || saveDisabled}
              sx={{ minWidth: 100 }}
              startIcon={saveLoading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {saveLabel}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
}
