'use client';

import React from 'react';
import { Chip } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import MobileEntityCard, { EntitySwipeAction } from '@/components/mobile/MobileEntityCard';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { Message } from '../types';

export interface MessageMobileCardProps {
  message: Message;
  locale: string;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function MessageMobileCard({
  message,
  locale,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: MessageMobileCardProps) {
  const isKorean = locale === 'ko';
  const messageText = getLocalizedValue(message.message, locale) || message.code;

  // Build swipe actions
  const swipeActions: EntitySwipeAction<Message>[] = [];

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

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return { bgcolor: 'error.50', color: 'error.dark' };
      case 'warning': return { bgcolor: 'warning.50', color: 'warning.dark' };
      case 'success': return { bgcolor: 'success.50', color: 'success.dark' };
      case 'info': return { bgcolor: 'info.50', color: 'info.dark' };
      default: return { bgcolor: 'grey.100', color: 'grey.700' };
    }
  };

  const typeColor = getTypeColor(message.type || 'info');

  return (
    <MobileEntityCard
      item={message}
      primaryText={message.code}
      secondaryText={messageText}
      tertiaryText={message.category}
      onClick={canEdit && onEdit ? () => onEdit(message) : undefined}
      swipeActions={swipeActions}
      rightContent={
        <Chip
          label={message.type || 'info'}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.65rem',
            ...typeColor,
          }}
        />
      }
    />
  );
}
