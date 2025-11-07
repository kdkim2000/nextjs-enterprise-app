'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
  Typography,
  Chip
} from '@mui/material';
import { Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material';
import { api } from '@/lib/axios';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface UserSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (user: User) => void;
  title?: string;
  selectedUserId?: string | null;
}

export default function UserSearchDialog({
  open,
  onClose,
  onSelect,
  title = 'Search User',
  selectedUserId
}: UserSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(term) ||
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.id.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  useEffect(() => {
    if (selectedUserId && users.length > 0) {
      const user = users.find((u) => u.id === selectedUserId);
      if (user) {
        setSelectedUser(user);
      }
    }
  }, [selectedUserId, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/user');
      setUsers(response.users || []);
      setFilteredUsers(response.users || []);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to load users');
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleConfirm = () => {
    if (selectedUser) {
      onSelect(selectedUser);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedUser(null);
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by username, name, email, or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            autoFocus
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {filteredUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  {searchTerm ? 'No users found' : 'No users available'}
                </Typography>
              </Box>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {filteredUsers.map((user) => (
                  <ListItem key={user.id} disablePadding>
                    <ListItemButton
                      selected={selectedUser?.id === user.id}
                      onClick={() => handleSelectUser(user)}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">{user.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              (@{user.username})
                            </Typography>
                            {!user.isActive && (
                              <Chip label="Inactive" size="small" color="default" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user.id} | Role: {user.role}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedUser}
        >
          Select
        </Button>
      </DialogActions>
    </Dialog>
  );
}
