'use client';

import React from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from '@mui/icons-material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface InspectionProgressProps {
  totalItems: number;
  completedItems: number;
  requiredItems: number;
  completedRequiredItems: number;
  currentIndex: number;
  locale?: string;
}

export default function MobileInspectionProgress({
  totalItems,
  completedItems,
  requiredItems,
  completedRequiredItems,
  currentIndex,
  locale = 'ko',
}: InspectionProgressProps) {
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const requiredProgress = requiredItems > 0 ? Math.round((completedRequiredItems / requiredItems) * 100) : 100;
  const canSubmit = requiredProgress === 100;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Main Progress Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              bgcolor: canSubmit ? 'success.main' : 'primary.main',
            },
          }}
        />
        <Typography variant="caption" fontWeight="bold" sx={{ minWidth: 40, textAlign: 'right' }}>
          {progress}%
        </Typography>
      </Box>

      {/* Stats Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Current Position */}
        <Typography variant="caption" color="text.secondary">
          {currentIndex + 1} / {totalItems}
        </Typography>

        {/* Completion Stats */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            icon={<CheckIcon sx={{ fontSize: 14 }} />}
            label={`${completedItems}/${totalItems}`}
            size="small"
            variant="outlined"
            color="default"
            sx={{ height: 22, '& .MuiChip-label': { px: 0.5 } }}
          />
          <Chip
            icon={canSubmit ? <CheckIcon sx={{ fontSize: 14 }} /> : <UncheckedIcon sx={{ fontSize: 14 }} />}
            label={`${getLocalizedValue({ en: 'Required', ko: '필수' }, locale)}: ${completedRequiredItems}/${requiredItems}`}
            size="small"
            variant={canSubmit ? 'filled' : 'outlined'}
            color={canSubmit ? 'success' : 'error'}
            sx={{ height: 22, '& .MuiChip-label': { px: 0.5 } }}
          />
        </Box>
      </Box>
    </Box>
  );
}
