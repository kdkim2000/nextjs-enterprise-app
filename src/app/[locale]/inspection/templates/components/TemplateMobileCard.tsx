'use client';

import React from 'react';
import { Box, Typography, IconButton, alpha, useTheme } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CloneIcon,
  ChevronRight as ChevronRightIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { MinimalBadge } from '@/components/common/MinimalListItem';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { ChecksheetTemplate, TemplateStatus } from '../types';
import { format } from 'date-fns';

export interface TemplateMobileCardProps {
  template: ChecksheetTemplate;
  locale?: string;
  onClick?: (template: ChecksheetTemplate) => void;
  onEdit?: (template: ChecksheetTemplate) => void;
  onDelete?: (template: ChecksheetTemplate) => void;
  onClone?: (template: ChecksheetTemplate) => void;
  onView?: (template: ChecksheetTemplate) => void;
  selected?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  showSwipeActions?: boolean;
}

const getStatusConfig = (status: TemplateStatus, locale: string) => {
  const configs: Record<TemplateStatus, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
    active: {
      label: getLocalizedValue({ ko: '활성', en: 'Active' }, locale),
      color: 'success'
    },
    draft: {
      label: getLocalizedValue({ ko: '초안', en: 'Draft' }, locale),
      color: 'warning'
    },
    inactive: {
      label: getLocalizedValue({ ko: '비활성', en: 'Inactive' }, locale),
      color: 'default'
    },
    archived: {
      label: getLocalizedValue({ ko: '보관', en: 'Archived' }, locale),
      color: 'error'
    },
  };
  return configs[status] || configs.draft;
};

export default function TemplateMobileCard({
  template,
  locale = 'ko',
  onClick,
  onEdit,
  onDelete,
  onClone,
  selected = false,
  selectable = false,
  onSelectionChange,
}: TemplateMobileCardProps) {
  const theme = useTheme();
  const statusConfig = getStatusConfig(template.status as TemplateStatus, locale);

  const handleClick = () => {
    if (selectable && onSelectionChange) {
      onSelectionChange(!selected);
    } else if (onClick) {
      onClick(template);
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
            {template.name}
          </Typography>
          <MinimalBadge label={statusConfig.label} color={statusConfig.color} />
        </Box>

        {/* Info row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: 'text.secondary',
            }}
          >
            {template.code}
          </Typography>
          <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>·</Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: 'text.disabled',
            }}
          >
            v{template.version}
          </Typography>
          {template.item_count > 0 && (
            <>
              <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>·</Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: 'text.disabled',
                }}
              >
                {template.item_count} {getLocalizedValue({ ko: '항목', en: 'items' }, locale)}
              </Typography>
            </>
          )}
        </Box>
      </Box>

      {/* Actions (only visible on hover for desktop, or via menu for mobile) */}
      {!selectable && (onEdit || onDelete || onClone) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            opacity: { xs: 1, sm: 0 },
            transition: 'opacity 0.15s',
            '.MuiBox-root:hover > &': {
              opacity: 1,
            },
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit && (
            <IconButton
              size="small"
              onClick={() => onEdit(template)}
              sx={{
                color: 'text.secondary',
                p: 0.5,
                '&:hover': { color: 'primary.main', bgcolor: 'primary.50' }
              }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
          {onClone && (
            <IconButton
              size="small"
              onClick={() => onClone(template)}
              sx={{
                color: 'text.secondary',
                p: 0.5,
                '&:hover': { color: 'secondary.main', bgcolor: 'secondary.50' }
              }}
            >
              <CloneIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              size="small"
              onClick={() => onDelete(template)}
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
