'use client';

import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Button,
  Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  showAdvancedButton?: boolean;
  onAdvancedClick?: () => void;
  advancedFilterCount?: number;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  sx?: any;
}

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  showAdvancedButton = false,
  onAdvancedClick,
  advancedFilterCount = 0,
  size = 'small',
  fullWidth = true,
  sx
}: SearchBarProps) {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ...sx }}>
      <TextField
        size={size}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ flex: fullWidth ? 1 : undefined }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      {showAdvancedButton && (
        <Badge badgeContent={advancedFilterCount} color="primary">
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={onAdvancedClick}
            size={size}
          >
            Advanced
          </Button>
        </Badge>
      )}
    </Box>
  );
}
