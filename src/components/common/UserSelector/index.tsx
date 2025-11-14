'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Chip,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import UserSearchDialog, { User } from '@/components/common/UserSearchDialog';
import { api } from '@/lib/axios';

export interface UserSelectorProps {
  label: string;
  value: string | null;
  onChange: (userId: string | null, user?: User) => void;
  helperText?: string;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  locale?: string;
  showAdvancedSearch?: boolean;
  minSearchLength?: number;
  maxResults?: number;
  filterByStatus?: string;
  excludedUserIds?: string[];
}

export default function UserSelector({
  label,
  value,
  onChange,
  helperText,
  error = false,
  required = false,
  disabled = false,
  locale = 'en',
  showAdvancedSearch = false,
  minSearchLength = 2,
  maxResults = 200,
  filterByStatus = 'active',
  excludedUserIds = []
}: UserSelectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Load user info when value changes
  useEffect(() => {
    if (value && (!selectedUser || selectedUser.id !== value)) {
      loadUserInfo(value);
    } else if (!value && selectedUser) {
      setSelectedUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // selectedUser is intentionally not in deps to avoid infinite loop

  const loadUserInfo = async (userId: string) => {
    try {
      setLoading(true);
      const response = await api.get('/user', { params: { id: userId } });
      if (response.user) {
        setSelectedUser(response.user);
      }
    } catch (err) {
      console.error('Failed to load user info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    onChange(user.id, user);
  };

  const handleClear = () => {
    setSelectedUser(null);
    onChange(null);
  };

  const placeholder = locale === 'ko'
    ? '검색 아이콘을 클릭하여 사용자 선택'
    : 'Click search icon to select user';

  const displayValue = selectedUser
    ? `${selectedUser.name} (@${selectedUser.username})`
    : value || '';

  const displayHelperText = selectedUser
    ? `${selectedUser.email}${selectedUser.department ? ` | ${selectedUser.department}` : ''} | ID: ${selectedUser.id}`
    : helperText;

  return (
    <Box>
      <TextField
        fullWidth
        label={label}
        value={displayValue}
        placeholder={placeholder}
        helperText={displayHelperText}
        error={error}
        required={required}
        disabled={disabled || loading}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              {selectedUser && !disabled && (
                <Tooltip title={locale === 'ko' ? '선택 해제' : 'Clear selection'} arrow>
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    edge="end"
                    sx={{ mr: 0.5 }}
                  >
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={locale === 'ko' ? '사용자 검색' : 'Search user'} arrow>
                <span>
                  <IconButton
                    onClick={handleOpenDialog}
                    disabled={disabled || loading}
                    edge="end"
                  >
                    <SearchIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </InputAdornment>
          ),
          startAdornment: selectedUser && (
            <InputAdornment position="start">
              {selectedUser.department ? (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Chip
                    label={selectedUser.department}
                    size="small"
                    color="default"
                    variant="outlined"
                  />
                  {selectedUser.role && (
                    <Chip
                      label={selectedUser.role}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              ) : selectedUser.role ? (
                <Chip
                  label={selectedUser.role}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ) : null}
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiInputBase-input': {
            cursor: 'pointer'
          }
        }}
        onClick={!disabled ? handleOpenDialog : undefined}
      />

      <UserSearchDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSelect={handleSelectUser}
        title={locale === 'ko' ? `${label} 선택` : `Select ${label}`}
        selectedUserId={value}
        locale={locale}
        showAdvancedSearch={showAdvancedSearch}
        minSearchLength={minSearchLength}
        maxResults={maxResults}
        filterByStatus={filterByStatus}
        excludedUserIds={excludedUserIds}
      />
    </Box>
  );
}
