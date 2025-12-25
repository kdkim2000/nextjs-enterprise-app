'use client';

import React from 'react';
import { Box, Typography, IconButton, alpha, useTheme } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { MinimalBadge } from '@/components/common/MinimalListItem';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { Inspection, InspectionStatus } from '../types';
import { format } from 'date-fns';

export interface InspectionMobileCardProps {
  inspection: Inspection;
  locale?: string;
  onClick?: (inspection: Inspection) => void;
  onEdit?: (inspection: Inspection) => void;
  onDelete?: (inspection: Inspection) => void;
  onStart?: (inspection: Inspection) => void;
  onView?: (inspection: Inspection) => void;
  selected?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  showSwipeActions?: boolean;
}

const getStatusConfig = (status: InspectionStatus, locale: string) => {
  const configs: Record<InspectionStatus, { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
    completed: {
      label: getLocalizedValue({ ko: '완료', en: 'Completed' }, locale),
      color: 'success'
    },
    in_progress: {
      label: getLocalizedValue({ ko: '진행중', en: 'In Progress' }, locale),
      color: 'info'
    },
    draft: {
      label: getLocalizedValue({ ko: '대기', en: 'Pending' }, locale),
      color: 'warning'
    },
    submitted: {
      label: getLocalizedValue({ ko: '제출됨', en: 'Submitted' }, locale),
      color: 'info'
    },
    cancelled: {
      label: getLocalizedValue({ ko: '취소', en: 'Cancelled' }, locale),
      color: 'error'
    },
  };
  return configs[status] || configs.draft;
};

export default function InspectionMobileCard({
  inspection,
  locale = 'ko',
  onClick,
  onEdit,
  onDelete,
  onStart,
  selected = false,
  selectable = false,
  onSelectionChange,
}: InspectionMobileCardProps) {
  const theme = useTheme();
  const statusConfig = getStatusConfig(inspection.status as InspectionStatus, locale);
  const canStart = inspection.status === 'draft' || inspection.status === 'in_progress';
  const canEdit = inspection.status === 'draft';
  const canDelete = inspection.status === 'draft';

  const handleClick = () => {
    if (selectable && onSelectionChange) {
      onSelectionChange(!selected);
    } else if (onClick) {
      onClick(inspection);
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'MM.dd');
    } catch {
      return '';
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.06) : 'background.paper',
        borderBottom: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.5),
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        '&:active': {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        },
      }}
    >
      {/* Selection checkbox */}
      {selectable && (
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: '2px solid',
            borderColor: selected ? 'primary.main' : 'grey.300',
            bgcolor: selected ? 'primary.main' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {selected && (
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
          )}
        </Box>
      )}

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Title row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {inspection.title}
          </Typography>
          <MinimalBadge label={statusConfig.label} color={statusConfig.color} />
        </Box>

        {/* Info row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: 'text.secondary',
            }}
          >
            {inspection.inspection_code}
          </Typography>
          {inspection.template_name && (
            <>
              <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>·</Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: 'text.disabled',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 120,
                }}
              >
                {inspection.template_name}
              </Typography>
            </>
          )}
          {inspection.inspection_date && (
            <>
              <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>·</Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: 'text.disabled',
                }}
              >
                {formatDate(inspection.inspection_date)}
              </Typography>
            </>
          )}
        </Box>
      </Box>

      {/* Actions */}
      {!selectable && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Start/Continue button - always visible if available */}
          {onStart && canStart && (
            <IconButton
              size="small"
              onClick={() => onStart(inspection)}
              sx={{
                color: 'success.main',
                p: 0.5,
                bgcolor: 'success.50',
                '&:hover': { bgcolor: 'success.100' }
              }}
            >
              <StartIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
          {onEdit && canEdit && (
            <IconButton
              size="small"
              onClick={() => onEdit(inspection)}
              sx={{
                color: 'text.secondary',
                p: 0.5,
                '&:hover': { color: 'primary.main', bgcolor: 'primary.50' }
              }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
          {onDelete && canDelete && (
            <IconButton
              size="small"
              onClick={() => onDelete(inspection)}
              sx={{
                color: 'text.secondary',
                p: 0.5,
                '&:hover': { color: 'error.main', bgcolor: 'error.50' }
              }}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>
      )}

      {/* Chevron for navigation hint */}
      {onClick && !selectable && (
        <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 20, ml: -0.5 }} />
      )}
    </Box>
  );
}
