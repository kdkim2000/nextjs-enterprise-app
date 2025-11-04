'use client';

import React, { useState } from 'react';
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
  Stack
} from '@mui/material';
import ExcelDataGrid from '@/components/common/DataGrid';
import { GridColDef } from '@mui/x-data-grid';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      username: 'admin',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      department: 'IT',
      status: 'active'
    },
    {
      id: 2,
      username: 'john.doe',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'user',
      department: 'Sales',
      status: 'active'
    },
    {
      id: 3,
      username: 'jane.smith',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'manager',
      department: 'Marketing',
      status: 'active'
    }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: 'Username', width: 130 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
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
      id: 0,
      username: '',
      name: '',
      email: '',
      role: 'user',
      department: '',
      status: 'active'
    });
    setDialogOpen(true);
  };

  const handleEdit = (id: string | number) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setEditingUser(user);
      setDialogOpen(true);
    }
  };

  const handleDelete = (ids: (string | number)[]) => {
    setUsers(users.filter((user) => !ids.includes(user.id)));
  };

  const handleSave = () => {
    if (!editingUser) return;

    if (editingUser.id === 0) {
      // Add new user
      const newId = Math.max(...users.map((u) => u.id)) + 1;
      setUsers([...users, { ...editingUser, id: newId }]);
    } else {
      // Update existing user
      setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
    }

    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleRefresh = () => {
    // In real app, fetch from API
    console.log('Refreshing user data...');
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system users and their permissions
        </Typography>
      </Box>

      <Paper sx={{ p: 2 }}>
        <ExcelDataGrid
          rows={users}
          columns={columns}
          onRowsChange={setUsers}
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
          {editingUser?.id === 0 ? 'Add New User' : 'Edit User'}
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
            />
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
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
