'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography
} from '@mui/material';
import {
  Search,
  Clear,
  KeyboardArrowUp,
  KeyboardArrowDown
} from '@mui/icons-material';

// Basic Search Input Props
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number | string;
  debounceMs?: number;
  size?: 'small' | 'medium';
}

// Search with Navigation Props
interface SearchWithNavigationProps extends SearchInputProps {
  matchCount: number;
  currentIndex: number;
  onNavigate: (direction: 'prev' | 'next') => void;
}

// Basic Search Input Component
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  width = 280,
  debounceMs = 0,
  size = 'small'
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  // Sync with external value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    if (debounceMs === 0) return;

    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onChange, value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      if (debounceMs === 0) {
        onChange(newValue);
      }
    },
    [debounceMs, onChange]
  );

  const handleClear = useCallback(() => {
    setInternalValue('');
    onChange('');
  }, [onChange]);

  return (
    <TextField
      size={size}
      placeholder={placeholder}
      value={internalValue}
      onChange={handleChange}
      sx={{
        width,
        '& .MuiOutlinedInput-root': {
          bgcolor: 'white',
          borderRadius: 2,
          '& fieldset': { borderColor: 'grey.200' },
          '&:hover fieldset': { borderColor: 'grey.300' },
          '&.Mui-focused fieldset': { borderColor: 'primary.main' }
        }
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search sx={{ color: 'grey.400', fontSize: 20 }} />
          </InputAdornment>
        ),
        endAdornment: internalValue && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear}>
              <Clear sx={{ fontSize: 16 }} />
            </IconButton>
          </InputAdornment>
        )
      }}
    />
  );
}

// Search with Navigation Component (for in-page search)
export function SearchWithNavigation({
  value,
  onChange,
  placeholder = 'Search...',
  width = 280,
  size = 'small',
  matchCount,
  currentIndex,
  onNavigate
}: SearchWithNavigationProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <SearchInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        width={width}
        size={size}
      />

      {matchCount > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Typography variant="body2" sx={{ color: 'grey.600', fontSize: '0.8rem' }}>
            {currentIndex + 1} / {matchCount}
          </Typography>
          <IconButton
            size="small"
            onClick={() => onNavigate('prev')}
            sx={{ p: 0.5 }}
            disabled={matchCount === 0}
          >
            <KeyboardArrowUp sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onNavigate('next')}
            sx={{ p: 0.5 }}
            disabled={matchCount === 0}
          >
            <KeyboardArrowDown sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}

// Hook for search with navigation logic
export function useSearchNavigation<T>(
  items: T[],
  searchField: (item: T) => string,
  minSearchLength: number = 2
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Find matching indices
  const matchingIndices = React.useMemo(() => {
    if (!searchTerm || searchTerm.length < minSearchLength) return [];
    const term = searchTerm.toLowerCase();
    return items
      .map((item, idx) => (searchField(item).toLowerCase().includes(term) ? idx : -1))
      .filter((idx) => idx !== -1);
  }, [searchTerm, items, searchField, minSearchLength]);

  // Reset current index when search changes
  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [searchTerm]);

  // Navigate between matches
  const navigateMatch = useCallback(
    (direction: 'prev' | 'next') => {
      if (matchingIndices.length === 0) return;

      setCurrentMatchIndex((prev) => {
        if (direction === 'next') {
          return (prev + 1) % matchingIndices.length;
        }
        return (prev - 1 + matchingIndices.length) % matchingIndices.length;
      });
    },
    [matchingIndices.length]
  );

  // Get current match item index
  const currentMatchItemIndex =
    matchingIndices.length > 0 ? matchingIndices[currentMatchIndex] : -1;

  return {
    searchTerm,
    setSearchTerm,
    matchingIndices,
    currentMatchIndex,
    currentMatchItemIndex,
    navigateMatch,
    matchCount: matchingIndices.length,
    isMatch: (idx: number) => matchingIndices.includes(idx),
    isCurrentMatch: (idx: number) =>
      matchingIndices.length > 0 && matchingIndices[currentMatchIndex] === idx
  };
}

export default SearchInput;
