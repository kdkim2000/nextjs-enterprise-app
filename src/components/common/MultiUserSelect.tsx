'use client';

import React, { useState, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Typography,
  Avatar,
  CircularProgress,
  alpha,
  useTheme
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { debounce } from '@mui/material/utils';
import { api } from '@/lib/axios';

export interface UserOption {
  id: string;
  username: string;
  name?: string;
  email?: string;
}

export interface MultiUserSelectProps {
  value: UserOption[];
  onChange: (users: UserOption[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  size?: 'small' | 'medium';
  maxHeight?: number;
}

export default function MultiUserSelect({
  value = [],
  onChange,
  label,
  placeholder = 'Search users...',
  disabled = false,
  error = false,
  helperText,
  size = 'small',
  maxHeight = 120
}: MultiUserSelectProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Search users with debounce
  const searchUsers = useCallback(
    debounce(async (searchTerm: string) => {
      if (!searchTerm || searchTerm.length < 2) {
        setOptions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(
          `/user?username=${searchTerm}&name=${searchTerm}&email=${searchTerm}&page=1&limit=30`
        );
        const users: UserOption[] = (response.users || []).map((u: any) => ({
          id: u.id,
          username: u.username,
          name: u.name,
          email: u.email
        }));
        // Filter out already selected users
        const selectedIds = new Set(value.map(v => v.id));
        setOptions(users.filter(u => !selectedIds.has(u.id)));
      } catch (error) {
        console.error('Failed to search users:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [value]
  );

  const handleInputChange = (_event: any, newInputValue: string) => {
    setInputValue(newInputValue);
    if (newInputValue.length >= 2) {
      searchUsers(newInputValue);
    } else {
      setOptions([]);
    }
  };

  const handleChange = (_event: any, newValue: UserOption[]) => {
    onChange(newValue);
    setInputValue('');
    setOptions([]);
  };

  const getInitials = (user: UserOption) => {
    if (user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  };

  const getDisplayName = (user: UserOption) => {
    return user.name || user.username;
  };

  return (
    <Autocomplete
      multiple
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={value}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      loading={loading}
      disabled={disabled}
      getOptionLabel={(option) => getDisplayName(option)}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      filterOptions={(x) => x}
      noOptionsText={
        inputValue.length < 2
          ? 'Type at least 2 characters'
          : 'No users found'
      }
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              key={key}
              {...tagProps}
              avatar={
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: '0.75rem',
                    bgcolor: theme.palette.primary.main
                  }}
                >
                  {getInitials(option)}
                </Avatar>
              }
              label={getDisplayName(option)}
              size="small"
              sx={{
                m: 0.25,
                height: 28,
                borderRadius: '14px',
                '& .MuiChip-label': {
                  px: 1,
                  fontSize: '0.8125rem'
                },
                '& .MuiChip-deleteIcon': {
                  fontSize: '1rem',
                  color: alpha(theme.palette.text.primary, 0.5),
                  '&:hover': {
                    color: theme.palette.text.primary
                  }
                }
              }}
            />
          );
        })
      }
      renderOption={(props, option) => {
        const { key, ...rest } = props as any;
        return (
          <Box
            component="li"
            key={key}
            {...rest}
            sx={{
              py: 1,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08)
              }
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.875rem',
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                color: theme.palette.primary.main
              }}
            >
              {getInitials(option)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, lineHeight: 1.3 }}
                noWrap
              >
                {getDisplayName(option)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ lineHeight: 1.2 }}
                noWrap
              >
                {option.email || option.username}
              </Typography>
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={value.length === 0 ? placeholder : ''}
          error={error}
          helperText={helperText}
          size={size}
          InputProps={{
            ...params.InputProps,
            sx: {
              flexWrap: 'wrap',
              maxHeight: maxHeight,
              overflowY: 'auto',
              alignItems: 'flex-start',
              py: 0.5,
              '& .MuiAutocomplete-input': {
                minWidth: 100,
                flexGrow: 1
              }
            },
            startAdornment: (
              <>
                {value.length === 0 && !inputValue && (
                  <PersonIcon
                    sx={{
                      color: 'text.disabled',
                      fontSize: 20,
                      ml: 0.5,
                      mr: -0.5
                    }}
                  />
                )}
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={18} />}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          transition: 'all 0.2s ease',
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main
            }
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2
            }
          }
        }
      }}
    />
  );
}
