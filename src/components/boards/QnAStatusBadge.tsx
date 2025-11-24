import React from 'react';
import { Chip } from '@mui/material';
import { CheckCircle, Help, QuestionAnswer } from '@mui/icons-material';

interface QnAStatusBadgeProps {
  status: 'unanswered' | 'answered' | 'resolved';
  size?: 'small' | 'medium';
}

/**
 * QnAStatusBadge - Q&A 상태 표시 뱃지 컴포넌트
 *
 * @param status - Question status (unanswered, answered, resolved)
 * @param size - Badge size
 *
 * @example
 * ```tsx
 * <QnAStatusBadge status="resolved" size="small" />
 * ```
 */
export function QnAStatusBadge({ status, size = 'small' }: QnAStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'unanswered':
        return {
          label: 'Unanswered',
          color: 'default' as const,
          icon: <Help />
        };
      case 'answered':
        return {
          label: 'Answered',
          color: 'primary' as const,
          icon: <QuestionAnswer />
        };
      case 'resolved':
        return {
          label: 'Resolved',
          color: 'success' as const,
          icon: <CheckCircle />
        };
      default:
        return {
          label: 'Unknown',
          color: 'default' as const,
          icon: <Help />
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={config.icon}
      variant="outlined"
    />
  );
}
