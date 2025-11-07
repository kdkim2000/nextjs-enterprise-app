'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Chip,
  Typography,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import UserSearchDialog, { User } from '@/components/common/UserSearchDialog';

export interface UserSelectorProps {
  label: string;
  value: string | null;
  onChange: (userId: string | null, user?: User) => void;
  helperText?: string;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
}

export default function UserSelector({
  label,
  value,
  onChange,
  helperText,
  error = false,
  required = false,
  disabled = false
}: UserSelectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  return (
    <Box>
      <TextField
        fullWidth
        label={label}
        value={selectedUser ? `${selectedUser.name} (@${selectedUser.username})` : value || ''}
        placeholder="Click search icon to select user"
        helperText={
          selectedUser
            ? `${selectedUser.email} | ID: ${selectedUser.id}`
            : helperText
        }
        error={error}
        required={required}
        disabled={disabled}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              {selectedUser && !disabled && (
                <IconButton
                  size="small"
                  onClick={handleClear}
                  edge="end"
                  sx={{ mr: 0.5 }}
                >
                  <ClearIcon />
                </IconButton>
              )}
              <IconButton
                onClick={handleOpenDialog}
                disabled={disabled}
                edge="end"
              >
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
          startAdornment: selectedUser && (
            <InputAdornment position="start">
              <Chip
                label={selectedUser.role}
                size="small"
                color="primary"
                variant="outlined"
              />
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
        title={`Select ${label}`}
        selectedUserId={value}
      />
    </Box>
  );
}
