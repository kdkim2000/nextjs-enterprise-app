'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar
} from '@mui/material';
import {
  PushPin,
  Lock,
  Visibility,
  ThumbUp,
  Comment,
  AttachFile
} from '@mui/icons-material';
import MobileCard, { MobileCardChip } from '@/components/mobile/MobileCard';
import MobileSwipeActions, { SwipeAction } from '@/components/mobile/MobileSwipeActions';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useI18n } from '@/lib/i18n/client';
import type { BoardPost } from '@/components/boards/BoardListView';

export interface BoardMobileCardProps {
  post: BoardPost;
  rowNumber?: number;
  onClick?: (post: BoardPost) => void;
  onEdit?: (post: BoardPost) => void;
  onDelete?: (post: BoardPost) => void;
  selected?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  locale?: string;
  showSwipeActions?: boolean;
}

export default function BoardMobileCard({
  post,
  rowNumber,
  onClick,
  onEdit,
  onDelete,
  selected = false,
  selectable = false,
  onSelectionChange,
  locale = 'en',
  showSwipeActions = true,
}: BoardMobileCardProps) {
  const t = useI18n();

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      // Within 24 hours, show relative time
      if (diffHours < 24) {
        if (diffHours < 1) {
          const minutes = Math.floor(diffMs / (1000 * 60));
          return `${minutes}m`;
        }
        return `${Math.floor(diffHours)}h`;
      }

      // Within 7 days
      if (diffDays < 7) {
        return `${Math.floor(diffDays)}d`;
      }

      // Otherwise show date
      return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Build chips array
  const getChips = (): MobileCardChip[] => {
    const chips: MobileCardChip[] = [];

    if (post.is_secret) {
      chips.push({ label: t('board.secret'), color: 'error', variant: 'outlined' });
    }

    if ((post.attachment_count || 0) > 0) {
      chips.push({ label: `${post.attachment_count} ${t('board.attachments')}`, color: 'default' });
    }

    return chips;
  };

  // Build avatar (pinned indicator or row number)
  const getAvatar = () => {
    if (post.is_pinned) {
      return (
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'primary.main',
          }}
        >
          <PushPin fontSize="small" />
        </Avatar>
      );
    }

    if (rowNumber !== undefined) {
      return (
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'grey.200',
            color: 'text.secondary',
            fontSize: '0.875rem',
          }}
        >
          {rowNumber}
        </Avatar>
      );
    }

    return null;
  };

  // Build badge (stats)
  const getBadge = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        <Visibility sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {(post.view_count || 0).toLocaleString()}
        </Typography>
      </Box>
      {(post.like_count || 0) > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          <ThumbUp sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {post.like_count}
          </Typography>
        </Box>
      )}
      {(post.comment_count || 0) > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          <Comment sx={{ fontSize: 14, color: 'primary.main' }} />
          <Typography variant="caption" color="primary.main" fontWeight={500}>
            {post.comment_count}
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Build swipe actions
  const rightActions: SwipeAction[] = [];

  if (onDelete) {
    rightActions.push({
      icon: <DeleteIcon />,
      label: t('common.delete'),
      color: '#fff',
      backgroundColor: '#f44336',
      onClick: () => onDelete(post),
    });
  }

  if (onEdit) {
    rightActions.push({
      icon: <EditIcon />,
      label: t('common.edit'),
      color: '#fff',
      backgroundColor: '#2196f3',
      onClick: () => onEdit(post),
    });
  }

  const cardContent = (
    <MobileCard
      item={post}
      primaryText={(p) => {
        // Include lock icon in title for secret posts
        return p.is_secret ? `🔒 ${p.title}` : p.title;
      }}
      secondaryText={(p) => p.author_name || p.author_username || '-'}
      tertiaryText={formatDate(post.created_at)}
      avatar={getAvatar()}
      badge={getBadge()}
      chips={getChips()}
      onClick={onClick ? () => onClick(post) : undefined}
      selected={selected}
      selectable={selectable}
      onSelectionChange={onSelectionChange}
      divider
    />
  );

  // Wrap with swipe actions if enabled
  if (showSwipeActions && rightActions.length > 0) {
    return (
      <MobileSwipeActions rightActions={rightActions}>
        {cardContent}
      </MobileSwipeActions>
    );
  }

  return cardContent;
}
