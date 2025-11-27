'use client';

import React from 'react';
import FormDialog from '@/components/common/FormDialog';
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
 * Uses FormDialog common component for consistent dialog behavior.
 *
 * Features:
 * - Responsive: Full screen on mobile, large dialog on desktop
 * - Fixed header with title and close button
 * - Scrollable content area
 * - Fixed footer with action buttons
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
  const t = useI18n();

  const dialogTitle = title || (mode === 'create' ? t('board.createPost') : t('board.editPostTitle'));
  const finalSaveLabel = saveLabel || t('common.save');
  const finalCancelLabel = cancelLabel || t('common.cancel');

  // Validate required fields
  const isSaveDisabled = !post?.title?.trim() || !post?.content?.trim();

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSave={onSave}
      title={dialogTitle}
      saveLoading={saveLoading}
      saveDisabled={isSaveDisabled}
      saveLabel={saveLoading ? t('common.loading') : finalSaveLabel}
      cancelLabel={finalCancelLabel}
      maxWidth="lg"
      fullScreenOnMobile
      fullScreenBreakpoint="md"
      height="90vh"
      contentMaxWidth={900}
    >
      <PostFormFields
        post={post}
        onChange={onChange}
        boardSettings={boardSettings}
        mode={mode}
        isAdmin={isAdmin}
      />
    </FormDialog>
  );
}
