'use client';

import React from 'react';
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
import PostFormFields, { PostFormData } from './PostFormFields';
import { useI18n } from '@/lib/i18n/client';

export interface PostFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  post: PostFormData | null;
  onChange: (post: PostFormData) => void;
  mode: 'create' | 'edit';
  saveLoading?: boolean;
  boardSettings?: {
    allowComments?: boolean;
    allowAttachments?: boolean;
    allowLikes?: boolean;
    maxAttachments?: number;
    maxAttachmentSize?: number;
  };
  isAdmin?: boolean;
  title?: string;
  saveLabel?: string;
  cancelLabel?: string;
}

/**
 * PostFormModal - Full-screen modal dialog for creating/editing posts
 *
 * Features:
 * - Responsive: Full screen on mobile, large dialog on desktop
 * - Fixed header with title and close button
 * - Scrollable content area
 * - Fixed footer with action buttons
 * - Escape key to close (with confirmation if dirty)
 */
export default function PostFormModal({
  open,
  onClose,
  onSave,
  post,
  onChange,
  mode,
  saveLoading = false,
  boardSettings,
  isAdmin = false,
  title,
  saveLabel,
  cancelLabel
}: PostFormModalProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const t = useI18n();

  const dialogTitle = title || (mode === 'create' ? t('board.createPost') : t('board.editPostTitle'));
  const finalSaveLabel = saveLabel || t('common.save');
  const finalCancelLabel = cancelLabel || t('common.cancel');

  const handleClose = () => {
    // TODO: Add confirmation if form is dirty
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          // Desktop: Large dialog (80% of viewport height)
          ...(!fullScreen && {
            height: '90vh',
            maxHeight: '90vh'
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
          {dialogTitle}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
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
            maxWidth: 900,
            mx: 'auto'
          }}
        >
          <PostFormFields
            post={post}
            onChange={onChange}
            boardSettings={boardSettings}
            mode={mode}
            isAdmin={isAdmin}
          />
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          gap: 1
        }}
      >
        <Button
          onClick={handleClose}
          color="inherit"
          disabled={saveLoading}
          sx={{ minWidth: 100 }}
        >
          {finalCancelLabel}
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={saveLoading || !post?.title?.trim() || !post?.content?.trim()}
          sx={{ minWidth: 100 }}
          startIcon={saveLoading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {saveLoading ? t('common.loading') : finalSaveLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
