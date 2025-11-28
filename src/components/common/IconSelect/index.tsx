'use client';

import React, { useState, useMemo } from 'react';
import {
  TextField,
  MenuItem,
  Box,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { iconMap, getMenuIcon, getAvailableIconNames } from '@/lib/icons/menuIcons';

export interface IconSelectProps {
  /**
   * Current selected value (icon name)
   */
  value: string;

  /**
   * Change handler
   */
  onChange: (value: string) => void;

  /**
   * Field label
   */
  label: string;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Whether the field is disabled
   */
  disabled?: boolean;

  /**
   * Error state
   */
  error?: boolean;

  /**
   * Helper text / error message
   */
  helperText?: string;

  /**
   * Full width
   */
  fullWidth?: boolean;

  /**
   * Size variant
   */
  size?: 'small' | 'medium';
}

/**
 * IconSelect - Dropdown component for selecting MUI icons with preview
 *
 * @example
 * ```tsx
 * <IconSelect
 *   value={selectedIcon}
 *   onChange={setSelectedIcon}
 *   label="Menu Icon"
 *   required
 * />
 * ```
 */
export default function IconSelect({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error = false,
  helperText,
  fullWidth = true,
  size = 'medium'
}: IconSelectProps) {
  const [searchText, setSearchText] = useState('');

  // Get all available icon names
  const iconNames = useMemo(() => getAvailableIconNames(), []);

  // Filter icons based on search text
  const filteredIcons = useMemo(() => {
    if (!searchText) return iconNames;
    const searchLower = searchText.toLowerCase();
    return iconNames.filter(name => name.toLowerCase().includes(searchLower));
  }, [iconNames, searchText]);

  // Handle change event
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
    setSearchText(''); // Clear search after selection
  };

  // Render selected value with icon
  const renderValue = (selected: unknown) => {
    if (!selected || typeof selected !== 'string') return null;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {getMenuIcon(selected)}
        <Typography variant="body2">{selected}</Typography>
      </Box>
    );
  };

  return (
    <TextField
      select
      label={label}
      value={value || 'Dashboard'}
      onChange={handleChange}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      size={size}
      SelectProps={{
        renderValue: renderValue,
        MenuProps: {
          PaperProps: {
            sx: {
              maxHeight: 400
            }
          }
        }
      }}
      InputProps={{
        startAdornment: value ? (
          <InputAdornment position="start" sx={{ ml: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
              {getMenuIcon(value)}
            </Box>
          </InputAdornment>
        ) : undefined
      }}
    >
      {/* Search box at top */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          p: 1,
          borderBottom: 1,
          borderColor: 'divider',
          zIndex: 1
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="Search icons..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            )
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </Box>

      {/* Icon count */}
      <Box sx={{ px: 2, py: 0.5, bgcolor: 'grey.50' }}>
        <Typography variant="caption" color="text.secondary">
          {filteredIcons.length} icons available
        </Typography>
      </Box>

      {/* Icon options */}
      {filteredIcons.map((iconName) => (
        <MenuItem
          key={iconName}
          value={iconName}
          sx={{
            py: 1,
            '&.Mui-selected': {
              bgcolor: 'primary.light',
              '&:hover': {
                bgcolor: 'primary.light'
              }
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {iconMap[iconName]}
          </ListItemIcon>
          <ListItemText
            primary={iconName}
            primaryTypographyProps={{
              variant: 'body2'
            }}
          />
          {iconName === value && (
            <Chip
              label="Selected"
              size="small"
              color="primary"
              sx={{ ml: 1, height: 20 }}
            />
          )}
        </MenuItem>
      ))}

      {filteredIcons.length === 0 && (
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            No icons found matching "{searchText}"
          </Typography>
        </MenuItem>
      )}
    </TextField>
  );
}
