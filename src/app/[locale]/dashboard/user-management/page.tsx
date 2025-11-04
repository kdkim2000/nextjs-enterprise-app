'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import ExcelDataGrid from '@/components/common/DataGrid';
import { GridColDef } from '@mui/x-data-grid';
import { api } from '@/lib/axios';
import { useI18n } from '@/lib/i18n/client';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  mfaEnabled?: boolean;
  ssoEnabled?: boolean;
  createdAt?: string;
  lastLogin?: string | null;
}

export default function UserManagementPage() {
  const t = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/user');
      setUsers(response.users || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load users');
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: t('auth.username'), width: 130 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: t('auth.email'), width: 200 },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      type: 'singleSelect',
      valueOptions: ['admin', 'manager', 'user']
    },
    { field: 'department', headerName: 'Department', width: 130 },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      type: 'singleSelect',
      valueOptions: ['active', 'inactive']
    }
  ];

  const handleAdd = () => {
    setEditingUser({
      id: '',
      username: '',
      name: '',
      email: '',
      role: 'user',
      department: '',
      status: 'active',
      password: ''
    } as any);
    setDialogOpen(true);
  };

  const handleEdit = (id: string | number) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setEditingUser(user);
      setDialogOpen(true);
    }
  };

  const handleDelete = async (ids: (string | number)[]) => {
    try {
      setError(null);
      // Delete users from API
      for (const id of ids) {
        await api.delete(`/user/${id}`);
      }
      // Remove from local state
      setUsers(users.filter((user) => !ids.includes(user.id)));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete users');
      console.error('Failed to delete users:', err);
    }
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      setSaveLoading(true);
      setError(null);

      if (!editingUser.id) {
        // Add new user
        const response = await api.post('/user', editingUser);
        setUsers([...users, response.user]);
      } else {
        // Update existing user
        const response = await api.put(`/user/${editingUser.id}`, editingUser);
        setUsers(users.map((u) => (u.id === editingUser.id ? response.user : u)));
      }

      setDialogOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save user');
      console.error('Failed to save user:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          {t('menu.userManagement')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system users and their permissions
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        <ExcelDataGrid
          rows={users}
          columns={columns}
          onRowsChange={(rows) => setUsers(rows as any)}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
          editable
          checkboxSelection
          exportFileName="users"
          height={600}
        />
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {!editingUser?.id ? 'Add New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Username"
              value={editingUser?.username || ''}
              onChange={(e) =>
                setEditingUser(
                  editingUser ? { ...editingUser, username: e.target.value } : null
                )
              }
              fullWidth
              required
              disabled={!!editingUser?.id}
            />
            {!editingUser?.id && (
              <TextField
                label="Password"
                type="password"
                value={(editingUser as any)?.password || ''}
                onChange={(e) =>
                  setEditingUser(
                    editingUser ? { ...editingUser, password: e.target.value } as any : null
                  )
                }
                fullWidth
                required
                helperText="Minimum 8 characters"
              />
            )}
            <TextField
              label="Name"
              value={editingUser?.name || ''}
              onChange={(e) =>
                setEditingUser(
                  editingUser ? { ...editingUser, name: e.target.value } : null
                )
              }
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={editingUser?.email || ''}
              onChange={(e) =>
                setEditingUser(
                  editingUser ? { ...editingUser, email: e.target.value } : null
                )
              }
              fullWidth
              required
            />
            <TextField
              label="Role"
              select
              value={editingUser?.role || 'user'}
              onChange={(e) =>
                setEditingUser(
                  editingUser ? { ...editingUser, role: e.target.value } : null
                )
              }
              fullWidth
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </TextField>
            <TextField
              label="Department"
              value={editingUser?.department || ''}
              onChange={(e) =>
                setEditingUser(
                  editingUser ? { ...editingUser, department: e.target.value } : null
                )
              }
              fullWidth
            />
            <TextField
              label="Status"
              select
              value={editingUser?.status || 'active'}
              onChange={(e) =>
                setEditingUser(
                  editingUser ? { ...editingUser, status: e.target.value } : null
                )
              }
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saveLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saveLoading}>
            {saveLoading ? <CircularProgress size={24} /> : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
