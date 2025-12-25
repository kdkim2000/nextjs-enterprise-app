'use client';

import React from 'react';
import { Box, Typography, LinearProgress, Chip, useTheme, alpha } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface InspectionProgressProps {
  totalItems: number;
  completedItems: number;
  requiredItems: number;
  completedRequiredItems: number;
  currentIndex: number;
  locale?: string;
  variant?: 'compact' | 'detailed' | 'ring';
  onItemClick?: (index: number) => void;
  itemStatuses?: boolean[]; // Array of completion status for each item
}

// Circular progress ring component
const ProgressRing: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
}> = ({ progress, size = 80, strokeWidth = 6, color, bgColor, children }) => {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor || theme.palette.grey[200]}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color || theme.palette.primary.main}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

// Step indicator dots
const StepIndicator: React.FC<{
  total: number;
  current: number;
  itemStatuses?: boolean[];
  requiredIndices?: number[];
  onItemClick?: (index: number) => void;
}> = ({ total, current, itemStatuses = [], requiredIndices = [], onItemClick }) => {
  const theme = useTheme();
  const maxVisible = 7;
  const showAll = total <= maxVisible;

  if (showAll) {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
        {Array.from({ length: total }).map((_, idx) => {
          const isCompleted = itemStatuses[idx];
          const isCurrent = idx === current;
          const isRequired = requiredIndices.includes(idx);

          return (
            <Box
              key={idx}
              onClick={() => onItemClick?.(idx)}
              sx={{
                width: isCurrent ? 24 : 12,
                height: 12,
                borderRadius: 6,
                cursor: onItemClick ? 'pointer' : 'default',
                bgcolor: isCompleted
                  ? theme.palette.success.main
                  : isCurrent
                    ? theme.palette.primary.main
                    : isRequired
                      ? alpha(theme.palette.error.main, 0.3)
                      : theme.palette.grey[300],
                transition: 'all 0.3s ease',
                '&:hover': onItemClick ? { transform: 'scale(1.2)' } : {},
              }}
            />
          );
        })}
      </Box>
    );
  }

  // Show condensed view for many items
  const visibleStart = Math.max(0, Math.min(current - 2, total - maxVisible));
  const visibleEnd = Math.min(total, visibleStart + maxVisible);

  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'center' }}>
      {visibleStart > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
          ...
        </Typography>
      )}
      {Array.from({ length: visibleEnd - visibleStart }).map((_, i) => {
        const idx = visibleStart + i;
        const isCompleted = itemStatuses[idx];
        const isCurrent = idx === current;
        const isRequired = requiredIndices.includes(idx);

        return (
          <Box
            key={idx}
            onClick={() => onItemClick?.(idx)}
            sx={{
              width: isCurrent ? 20 : 10,
              height: 10,
              borderRadius: 5,
              cursor: onItemClick ? 'pointer' : 'default',
              bgcolor: isCompleted
                ? theme.palette.success.main
                : isCurrent
                  ? theme.palette.primary.main
                  : isRequired
                    ? alpha(theme.palette.error.main, 0.3)
                    : theme.palette.grey[300],
              transition: 'all 0.3s ease',
            }}
          />
        );
      })}
      {visibleEnd < total && (
        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
          ...
        </Typography>
      )}
    </Box>
  );
};

export default function MobileInspectionProgress({
  totalItems,
  completedItems,
  requiredItems,
  completedRequiredItems,
  currentIndex,
  locale = 'ko',
  variant = 'detailed',
  onItemClick,
  itemStatuses = [],
}: InspectionProgressProps) {
  const theme = useTheme();
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const requiredProgress = requiredItems > 0 ? Math.round((completedRequiredItems / requiredItems) * 100) : 100;
  const canSubmit = requiredProgress === 100;

  if (variant === 'ring') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ProgressRing
          progress={progress}
          size={64}
          strokeWidth={5}
          color={canSubmit ? theme.palette.success.main : theme.palette.primary.main}
        >
          <Typography variant="h6" fontWeight="bold">
            {progress}%
          </Typography>
        </ProgressRing>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            {completedItems} / {totalItems}{' '}
            {getLocalizedValue({ en: 'completed', ko: '완료' }, locale)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            {canSubmit ? (
              <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <WarningIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            )}
            <Typography variant="caption" color={canSubmit ? 'success.main' : 'warning.main'}>
              {getLocalizedValue({ en: 'Required', ko: '필수' }, locale)}: {completedRequiredItems}/{requiredItems}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  if (variant === 'compact') {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 2,
              bgcolor: canSubmit ? 'success.main' : 'primary.main',
            },
          }}
        />
      </Box>
    );
  }

  // Detailed variant (default)
  return (
    <Box sx={{ width: '100%' }}>
      {/* Progress Bar with Ring */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
        <ProgressRing
          progress={progress}
          size={56}
          strokeWidth={4}
          color={canSubmit ? theme.palette.success.main : theme.palette.primary.main}
        >
          <Typography variant="body2" fontWeight="bold">
            {progress}%
          </Typography>
        </ProgressRing>

        <Box sx={{ flex: 1 }}>
          {/* Step Indicator */}
          <StepIndicator
            total={totalItems}
            current={currentIndex}
            itemStatuses={itemStatuses}
            onItemClick={onItemClick}
          />

          {/* Position Text */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
            {currentIndex + 1} / {totalItems}
          </Typography>
        </Box>
      </Box>

      {/* Stats Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Chip
          icon={<CheckIcon sx={{ fontSize: 14 }} />}
          label={`${completedItems}/${totalItems}`}
          size="small"
          variant="outlined"
          color="default"
          sx={{ height: 24, '& .MuiChip-label': { px: 0.75, fontSize: '0.75rem' } }}
        />
        <Chip
          icon={canSubmit ? <CheckIcon sx={{ fontSize: 14 }} /> : <WarningIcon sx={{ fontSize: 14 }} />}
          label={`${getLocalizedValue({ en: 'Required', ko: '필수' }, locale)}: ${completedRequiredItems}/${requiredItems}`}
          size="small"
          variant={canSubmit ? 'filled' : 'outlined'}
          color={canSubmit ? 'success' : 'warning'}
          sx={{ height: 24, '& .MuiChip-label': { px: 0.75, fontSize: '0.75rem' } }}
        />
      </Box>
    </Box>
  );
}
