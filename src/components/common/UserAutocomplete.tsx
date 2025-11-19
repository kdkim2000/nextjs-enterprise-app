'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography } from '@mui/material';
import { debounce } from '@mui/material/utils';
import { api } from '@/lib/axios';

export interface User {
  id: string;
  username: string;
  name: string;
}

export interface UserAutocompleteProps {
  value: string | null;
  onChange: (userId: string | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

export default function UserAutocomplete({
  value,
  onChange,
  label = 'User',
  placeholder = 'Search by username or name...',
  required = false,
  disabled = false,
  error = false,
  helperText,
  fullWidth = true
}: UserAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch user by ID for initial value
  useEffect(() => {
    if (value && !selectedUser) {
      const fetchUserById = async () => {
        try {
          const response = await api.get(`/user/${value}`);
          if (response.user) {
            const user: User = {
              id: response.user.id,
              username: response.user.username,
              name: response.user.name
            };
            setSelectedUser(user);
            setOptions([user]);
          }
        } catch (error) {
          console.error('Failed to fetch user by ID:', error);
        }
      };
      fetchUserById();
    }
  }, [value, selectedUser]);

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
        const response = await api.get(`/user?username=${searchTerm}&name=${searchTerm}&email=${searchTerm}&page=1&limit=50`);
        const users: User[] = (response.users || []).map((u: any) => ({
          id: u.id,
          username: u.username,
          name: u.name
        }));
        setOptions(users);
      } catch (error) {
        console.error('Failed to search users:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Handle input change
  const handleInputChange = (_event: any, newInputValue: string) => {
    setInputValue(newInputValue);
    if (newInputValue.length >= 2) {
      searchUsers(newInputValue);
    } else {
      setOptions([]);
    }
  };

  // Handle selection change
  const handleChange = (_event: any, newValue: User | null) => {
    setSelectedUser(newValue);
    onChange(newValue ? newValue.id : null);
  };

  // Get option label
  const getOptionLabel = (option: User) => {
    return `${option.username} (${option.name || 'No name'})`;
  };

  return (
    <Autocomplete
      fullWidth={fullWidth}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={selectedUser}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      getOptionLabel={getOptionLabel}
      loading={loading}
      disabled={disabled}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      filterOptions={(x) => x} // Disable client-side filtering (server-side search)
      noOptionsText={
        inputValue.length < 2
          ? 'Type at least 2 characters to search'
          : 'No users found'
      }
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {option.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.name || 'No name'}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
