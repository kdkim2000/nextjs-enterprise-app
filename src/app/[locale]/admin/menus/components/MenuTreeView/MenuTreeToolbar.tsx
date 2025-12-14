'use client';

import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Divider,
  CircularProgress
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

export interface MenuTreeToolbarProps {
  selectedCount: number;
  totalCount: number;
  locale: string;
  onAdd: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  canAdd?: boolean;
  canDelete?: boolean;
  loading?: boolean;
}

export default function MenuTreeToolbar({
  selectedCount,
  totalCount,
  locale,
  onAdd,
  onDelete,
  onRefresh,
  onExpandAll,
  onCollapseAll,
  onSelectAll,
  onDeselectAll,
  canAdd = true,
  canDelete = true,
  loading = false
}: MenuTreeToolbarProps) {
  const isKorean = locale === 'ko';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1,
        py: 1,
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
        flexWrap: 'wrap'
      }}
    >
      {/* Add Button */}
      {canAdd && (
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={onAdd}
          disabled={loading}
        >
          {isKorean ? '추가' : 'Add'}
        </Button>
      )}

      {/* Delete Button */}
      {canDelete && (
        <Button
          variant="outlined"
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
          disabled={selectedCount === 0 || loading}
        >
          {isKorean ? '삭제' : 'Delete'}
          {selectedCount > 0 && ` (${selectedCount})`}
        </Button>
      )}

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Refresh Button */}
      <Tooltip title={isKorean ? '새로고침' : 'Refresh'}>
        <IconButton size="small" onClick={onRefresh} disabled={loading}>
          {loading ? <CircularProgress size={18} /> : <RefreshIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Expand/Collapse All */}
      <Tooltip title={isKorean ? '모두 펼치기' : 'Expand All'}>
        <IconButton size="small" onClick={onExpandAll} disabled={loading}>
          <ExpandAllIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={isKorean ? '모두 접기' : 'Collapse All'}>
        <IconButton size="small" onClick={onCollapseAll} disabled={loading}>
          <CollapseAllIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Select/Deselect All */}
      <Tooltip title={isKorean ? '모두 선택' : 'Select All'}>
        <IconButton size="small" onClick={onSelectAll} disabled={loading}>
          <SelectAllIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={isKorean ? '선택 해제' : 'Deselect All'}>
        <IconButton size="small" onClick={onDeselectAll} disabled={loading || selectedCount === 0}>
          <DeselectIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Selection Info */}
      <Typography variant="caption" color="text.secondary">
        {selectedCount > 0
          ? isKorean
            ? `${selectedCount}개 선택됨 / 전체 ${totalCount}개`
            : `${selectedCount} selected / ${totalCount} total`
          : isKorean
            ? `전체 ${totalCount}개`
            : `${totalCount} items`
        }
      </Typography>
    </Box>
  );
}
