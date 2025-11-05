'use client';

import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { Search, Clear, FilterList } from '@mui/icons-material';
import { useI18n } from '@/lib/i18n/client';

interface QuickSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  onAdvancedFilterClick?: () => void;
  placeholder?: string;
  searching?: boolean;
  disabled?: boolean;
  activeFilterCount?: number;
  showAdvancedButton?: boolean;
}

/**
 * Quick search bar component with optional advanced filter button
 * Provides immediate search functionality without expanding panels
 */
export default function QuickSearchBar({
  searchValue,
  onSearchChange,
  onSearch,
  onClear,
  onAdvancedFilterClick,
  placeholder,
  searching = false,
  disabled = false,
  activeFilterCount = 0,
  showAdvancedButton = true
}: QuickSearchBarProps) {
  const t = useI18n();
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled && !searching) {
      onSearch();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        mb: 2
      }}
    >
      <TextField
        fullWidth
        size="small"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || searching}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" color="action" />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={onClear}
                disabled={disabled || searching}
                edge="end"
              >
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper'
          }
        }}
      />

      {/* Search Button - Icon Only with Tooltip */}
      <Tooltip title={searching ? t('common.searching') : t('common.search')} arrow>
        <span>
          <IconButton
            color="primary"
            onClick={onSearch}
            disabled={disabled || searching}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled'
              }
            }}
          >
            {searching ? (
              <CircularProgress size={20} sx={{ color: 'inherit' }} />
            ) : (
              <Search fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>

      {/* Advanced Filter Button - Icon Only with Badge and Tooltip */}
      {showAdvancedButton && onAdvancedFilterClick && (
        <Tooltip title={t('common.advanced')} arrow>
          <IconButton
            onClick={onAdvancedFilterClick}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              width: 40,
              height: 40,
              position: 'relative',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50'
              }
            }}
          >
            <FilterList fontSize="small" />
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                color="primary"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  height: 20,
                  minWidth: 20,
                  '& .MuiChip-label': {
                    px: 0.5,
                    fontSize: '0.7rem'
                  }
                }}
              />
            )}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
