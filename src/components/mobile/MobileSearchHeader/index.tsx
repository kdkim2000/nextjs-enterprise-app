'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  SelectAll as SelectAllIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon
} from '@mui/icons-material';
import { useI18n } from '@/lib/i18n/client';

export interface SortOption {
  value: string;
  label: string;
}

export interface MobileSearchHeaderProps {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  searchPlaceholder?: string;
  searching?: boolean;

  // Filter
  showFilter?: boolean;
  filterCount?: number;
  onFilterClick?: () => void;

  // Sort
  sortOptions?: SortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;

  // Selection mode
  selectionMode?: boolean;
  selectedCount?: number;
  totalCount?: number;
  onSelectionModeToggle?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onDeleteSelected?: () => void;

  // Additional actions
  additionalActions?: React.ReactNode;
}

export default function MobileSearchHeader({
  searchValue,
  onSearchChange,
  onSearch,
  searchPlaceholder,
  searching = false,
  showFilter = true,
  filterCount = 0,
  onFilterClick,
  sortOptions,
  sortValue,
  onSortChange,
  selectionMode = false,
  selectedCount = 0,
  totalCount = 0,
  onSelectionModeToggle,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  additionalActions,
}: MobileSearchHeaderProps) {
  const t = useI18n();
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);

  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  }, [onSearch]);

  const handleSearchClear = useCallback(() => {
    onSearchChange('');
    onSearch();
  }, [onSearchChange, onSearch]);

  const handleSortClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(e.currentTarget);
  }, []);

  const handleSortClose = useCallback(() => {
    setSortAnchorEl(null);
  }, []);

  const handleSortSelect = useCallback((value: string) => {
    onSortChange?.(value);
    setSortAnchorEl(null);
  }, [onSortChange]);

  // Selection mode header
  if (selectionMode) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1,
          py: 1,
          gap: 1,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <IconButton
          size="small"
          onClick={onSelectionModeToggle}
          sx={{ color: 'inherit' }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="subtitle1" sx={{ flex: 1 }}>
          {selectedCount} {t('board.selected')}
        </Typography>

        {selectedCount < totalCount ? (
          <IconButton
            size="small"
            onClick={onSelectAll}
            sx={{ color: 'inherit' }}
            aria-label={t('mail.selectAll')}
          >
            <SelectAllIcon />
          </IconButton>
        ) : (
          <IconButton
            size="small"
            onClick={onDeselectAll}
            sx={{ color: 'inherit' }}
            aria-label={t('mail.deselectAll')}
          >
            <CheckBoxOutlineBlankIcon />
          </IconButton>
        )}

        {selectedCount > 0 && onDeleteSelected && (
          <IconButton
            size="small"
            onClick={onDeleteSelected}
            sx={{ color: 'inherit' }}
            aria-label={t('common.delete')}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
    );
  }

  // Normal search header
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1,
        py: 1,
        gap: 0.5,
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      {/* Search Input */}
      <TextField
        size="small"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyPress={handleSearchKeyPress}
        placeholder={searchPlaceholder || t('common.search')}
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: 'action.hover',
            '& fieldset': {
              border: 'none',
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleSearchClear}
                edge="end"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Filter Button */}
      {showFilter && onFilterClick && (
        <IconButton
          size="small"
          onClick={onFilterClick}
          color={filterCount > 0 ? 'primary' : 'default'}
        >
          <Badge
            badgeContent={filterCount}
            color="primary"
            max={9}
          >
            <FilterListIcon />
          </Badge>
        </IconButton>
      )}

      {/* Sort Button */}
      {sortOptions && sortOptions.length > 0 && (
        <>
          <IconButton
            size="small"
            onClick={handleSortClick}
          >
            <SortIcon />
          </IconButton>
          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={handleSortClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {sortOptions.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                selected={sortValue === option.value}
              >
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Menu>
        </>
      )}

      {/* Selection Mode Toggle */}
      {onSelectionModeToggle && (
        <IconButton
          size="small"
          onClick={onSelectionModeToggle}
        >
          <CheckBoxIcon />
        </IconButton>
      )}

      {/* Additional Actions */}
      {additionalActions}
    </Box>
  );
}
