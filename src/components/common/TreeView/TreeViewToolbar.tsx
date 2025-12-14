'use client';

import React from 'react';
import {
  Box,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  UnfoldMore as ExpandAllIcon,
  UnfoldLess as CollapseAllIcon,
  SelectAll as SelectAllIcon,
  Deselect as DeselectIcon
} from '@mui/icons-material';
import { useI18n } from '@/lib/i18n/client';
import { TreeViewToolbarProps } from './types';

export default function TreeViewToolbar({
  selectedCount,
  totalCount,
  locale,
  loading = false,
  canAdd = true,
  canDelete = true,
  onAdd,
  onDelete,
  onRefresh,
  showExpandControls = true,
  onExpandAll,
  onCollapseAll,
  showSelectionControls = true,
  onSelectAll,
  onDeselectAll,
  extraActions
}: TreeViewToolbarProps) {
  const t = useI18n();
  const isKorean = locale === 'ko';

  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{
        py: 0.75,
        px: 1.5,
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Total Count Badge */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.5,
          bgcolor: 'primary.50',
          borderRadius: 1,
          color: 'primary.main',
          fontWeight: 600,
          fontSize: '0.8125rem'
        }}
      >
        {selectedCount > 0
          ? isKorean
            ? `${selectedCount}개 선택 / 전체 ${totalCount}개`
            : `${selectedCount} selected / ${totalCount} total`
          : t('grid.totalCount', { count: totalCount.toLocaleString() })
        }
      </Box>

      <Box sx={{ flex: 1 }} />

      {/* Extra Actions */}
      {extraActions}

      {/* Add Button */}
      {canAdd && onAdd && (
        <Tooltip title={t('common.create')} arrow>
          <IconButton
            size="small"
            onClick={onAdd}
            disabled={loading}
            sx={{
              color: 'primary.main',
              '&:hover': { bgcolor: 'primary.50' }
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Delete Button - only visible when items are selected */}
      {canDelete && selectedCount > 0 && onDelete && (
        <Tooltip title={t('common.delete')} arrow>
          <IconButton
            size="small"
            onClick={onDelete}
            disabled={loading}
            sx={{
              color: 'error.main',
              '&:hover': { bgcolor: 'error.50' }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <Tooltip title={t('common.refresh')} arrow>
          <IconButton
            size="small"
            onClick={onRefresh}
            disabled={loading}
            sx={{
              color: 'action.active',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            {loading ? <CircularProgress size={18} /> : <RefreshIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}

      {/* Expand/Collapse Controls */}
      {showExpandControls && (onExpandAll || onCollapseAll) && (
        <>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {onExpandAll && (
            <Tooltip title={isKorean ? '모두 펼치기' : 'Expand All'} arrow>
              <IconButton
                size="small"
                onClick={onExpandAll}
                disabled={loading}
                sx={{
                  color: 'action.active',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <ExpandAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {onCollapseAll && (
            <Tooltip title={isKorean ? '모두 접기' : 'Collapse All'} arrow>
              <IconButton
                size="small"
                onClick={onCollapseAll}
                disabled={loading}
                sx={{
                  color: 'action.active',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <CollapseAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </>
      )}

      {/* Selection Controls */}
      {showSelectionControls && (onSelectAll || onDeselectAll) && (
        <>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {onSelectAll && (
            <Tooltip title={isKorean ? '모두 선택' : 'Select All'} arrow>
              <IconButton
                size="small"
                onClick={onSelectAll}
                disabled={loading}
                sx={{
                  color: 'action.active',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <SelectAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {onDeselectAll && (
            <Tooltip title={isKorean ? '선택 해제' : 'Deselect All'} arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={onDeselectAll}
                  disabled={loading || selectedCount === 0}
                  sx={{
                    color: 'action.active',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <DeselectIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </>
      )}
    </Stack>
  );
}
