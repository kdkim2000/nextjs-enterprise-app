'use client';

import React from 'react';
import { Chip } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachIcon,
} from '@mui/icons-material';
import MobileEntityCard, { EntitySwipeAction } from '@/components/mobile/MobileEntityCard';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { AttachmentType } from '../types';

export interface AttachmentTypeMobileCardProps {
  attachmentType: AttachmentType;
  locale: string;
  onEdit?: (item: AttachmentType) => void;
  onDelete?: (item: AttachmentType) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function AttachmentTypeMobileCard({
  attachmentType,
  locale,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: AttachmentTypeMobileCardProps) {
  const isKorean = locale === 'ko';
  const name = getLocalizedValue(attachmentType.name, locale) || attachmentType.code;
  const description = getLocalizedValue(attachmentType.description, locale);

  // Build swipe actions
  const swipeActions: EntitySwipeAction<AttachmentType>[] = [];

  if (canDelete && onDelete) {
    swipeActions.push({
      icon: <DeleteIcon />,
      label: isKorean ? '삭제' : 'Delete',
      color: '#fff',
      backgroundColor: '#f44336',
      onClick: onDelete,
    });
  }

  if (canEdit && onEdit) {
    swipeActions.push({
      icon: <EditIcon />,
      label: isKorean ? '편집' : 'Edit',
      color: '#fff',
      backgroundColor: '#2196f3',
      onClick: onEdit,
    });
  }

  // Format max size
  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
    }
    return `${(bytes / 1024).toFixed(0)}KB`;
  };

  const isActive = attachmentType.status === 'active';

  return (
    <MobileEntityCard
      item={attachmentType}
      avatar={{
        initials: attachmentType.code.substring(0, 2).toUpperCase(),
        bgcolor: isActive ? 'primary.main' : 'grey.400',
        size: 44,
      }}
      primaryText={name}
      secondaryText={attachmentType.code}
      tertiaryText={description}
      status={{
        active: isActive,
        activeColor: 'success.main',
        inactiveColor: 'text.disabled',
      }}
      isActive={isActive}
      onClick={canEdit && onEdit ? () => onEdit(attachmentType) : undefined}
      swipeActions={swipeActions}
      rightContent={
        <>
          <Chip
            label={formatSize(attachmentType.maxFileSize || 10485760)}
            size="small"
            variant="outlined"
            sx={{ height: 18, fontSize: '0.6rem' }}
          />
          {attachmentType.allowedExtensions && attachmentType.allowedExtensions.length > 0 && (
            <Chip
              label={attachmentType.allowedExtensions.slice(0, 3).join(', ')}
              size="small"
              sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'grey.100' }}
            />
          )}
        </>
      }
    />
  );
}
