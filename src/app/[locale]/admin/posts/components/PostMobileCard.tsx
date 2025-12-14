'use client';

import React from 'react';
import { Typography, Chip, Box } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  PushPin as PinIcon,
} from '@mui/icons-material';
import MobileEntityCard, { EntitySwipeAction, EntityFeatureBadge } from '@/components/mobile/MobileEntityCard';
import { Post } from '../types';

export interface PostMobileCardProps {
  post: Post;
  locale: string;
  onView?: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
  onApprove?: (post: Post) => void;
  onPin?: (post: Post) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function PostMobileCard({
  post,
  locale,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onPin,
  canEdit = true,
  canDelete = true,
}: PostMobileCardProps) {
  const isKorean = locale === 'ko';

  // Build swipe actions
  const swipeActions: EntitySwipeAction<Post>[] = [];

  if (canDelete && onDelete) {
    swipeActions.push({
      icon: <DeleteIcon />,
      label: isKorean ? '삭제' : 'Delete',
      color: '#fff',
      backgroundColor: '#f44336',
      onClick: onDelete,
    });
  }

  if (onApprove && !post.is_approved) {
    swipeActions.push({
      icon: <ApproveIcon />,
      label: isKorean ? '승인' : 'Approve',
      color: '#fff',
      backgroundColor: '#4caf50',
      onClick: onApprove,
    });
  }

  if (onPin) {
    swipeActions.push({
      icon: <PinIcon />,
      label: post.is_pinned ? (isKorean ? '해제' : 'Unpin') : (isKorean ? '고정' : 'Pin'),
      color: '#fff',
      backgroundColor: '#ff9800',
      onClick: onPin,
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

  // Feature badges
  const featureBadges: EntityFeatureBadge[] = [
    {
      key: 'pinned',
      label: isKorean ? '고정' : 'Pinned',
      icon: <PinIcon sx={{ fontSize: 10 }} />,
      show: post.is_pinned,
      bgcolor: 'warning.50',
      color: 'warning.dark',
    },
    {
      key: 'secret',
      label: isKorean ? '비밀' : 'Secret',
      show: post.is_secret,
      bgcolor: 'error.50',
      color: 'error.dark',
    },
    {
      key: 'unapproved',
      label: isKorean ? '미승인' : 'Pending',
      show: !post.is_approved,
      bgcolor: 'grey.200',
      color: 'text.secondary',
    },
  ];

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <MobileEntityCard
      item={post}
      primaryText={post.title}
      secondaryText={post.author_name || post.author_id}
      tertiaryText={`${post.board_type_name || post.board_type_id} • ${formatDate(post.created_at)}`}
      featureBadges={featureBadges}
      onClick={onView ? () => onView(post) : undefined}
      swipeActions={swipeActions}
      rightContent={
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {isKorean ? '조회' : 'Views'} {post.view_count || 0}
          </Typography>
          {(post.comment_count || 0) > 0 && (
            <Chip
              label={`${post.comment_count}`}
              size="small"
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
        </Box>
      }
    />
  );
}
