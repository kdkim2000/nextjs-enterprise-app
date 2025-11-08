'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Alert,
  IconButton,
  Tooltip,
  Avatar,
  Drawer,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Divider,
  CircularProgress
} from '@mui/material';
import { Search, HelpOutline, Edit, Close } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import PageHeader from '@/components/common/PageHeader';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import SearchFilterFields, { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import PageContainer from '@/components/common/PageContainer';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import HelpViewer from '@/components/common/HelpViewer';
import { GridColDef } from '@mui/x-data-grid';
import { api } from '@/lib/axios';
import { useI18n } from '@/lib/i18n/client';
import { getAvatarUrl } from '@/lib/config';

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
  avatarUrl?: string;
}

interface SearchCriteria {
  username: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  [key: string]: string;
}

const DEPARTMENTS = [
  'Admin', 'Design', 'Engineering', 'Finance', 'HR', 'IT',
  'Legal', 'Marketing', 'Operations', 'Product', 'Sales', 'Support'
];

// Session storage key for state persistence
const STORAGE_KEY = 'admin-users-page-state';

// Helper functions for state persistence
const savePageState = (state: {
  searchCriteria: SearchCriteria;
  paginationModel: { page: number; pageSize: number };
  quickSearch: string;
  users: User[];
  rowCount: number;
}) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save page state:', error);
  }
};

const loadPageState = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load page state:', error);
    return null;
  }
};

export default function UserManagementPage() {
  const t = useI18n();

  // Load saved state on mount
  const savedState = loadPageState();

  const [users, setUsers] = useState<User[]>(savedState?.users || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [quickSearch, setQuickSearch] = useState(savedState?.quickSearch || '');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpExists, setHelpExists] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(
    savedState?.searchCriteria || {
      username: '',
      name: '',
      email: '',
      role: '',
      department: '',
      status: ''
    }
  );
  const [paginationModel, setPaginationModel] = useState(
    savedState?.paginationModel || {
      page: 0, // DataGrid uses 0-indexed pages
      pageSize: 50
    }
  );
  const [rowCount, setRowCount] = useState(savedState?.rowCount || 0);

  // Auto-hide success message after 10 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-hide error message after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Save page state whenever it changes
  useEffect(() => {
    savePageState({
      searchCriteria,
      paginationModel,
      quickSearch,
      users,
      rowCount
    });
  }, [searchCriteria, paginationModel, quickSearch, users, rowCount]);

  // Check user role and help content availability on mount
  useEffect(() => {
    const checkHelpAndRole = async () => {
      try {
        // Check if user is admin
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setIsAdmin(user.role === 'admin');
        }

        // Check if help content exists for this page
        const response = await api.get('/help?pageId=admin-users&language=en');
        setHelpExists(!!response.help);
      } catch {
        // If help doesn't exist or error occurs, set to false
        setHelpExists(false);
      }
    };

    checkHelpAndRole();

    // If there's saved state with search criteria or data, restore it
    if (savedState && (savedState.users?.length > 0 || savedState.quickSearch ||
        Object.values(savedState.searchCriteria || {}).some(v => v !== ''))) {
      // Data already loaded from savedState, no need to fetch again
      // User can click refresh if they want fresh data
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async (page: number = 0, pageSize: number = 50, useQuickSearch: boolean = false) => {
    try {
      setSearching(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();

      if (useQuickSearch && quickSearch) {
        // Quick search: search in username, name, and email
        params.append('username', quickSearch);
        params.append('name', quickSearch);
        params.append('email', quickSearch);
      } else {
        // Advanced search: use specific criteria
        if (searchCriteria.username) params.append('username', searchCriteria.username);
        if (searchCriteria.name) params.append('name', searchCriteria.name);
        if (searchCriteria.email) params.append('email', searchCriteria.email);
        if (searchCriteria.role) params.append('role', searchCriteria.role);
        if (searchCriteria.department) params.append('department', searchCriteria.department);
        if (searchCriteria.status) params.append('status', searchCriteria.status);
      }

      params.append('page', (page + 1).toString()); // Backend uses 1-indexed
      params.append('limit', pageSize.toString());

      const response = await api.get(`/user?${params.toString()}`);
      setUsers(response.users || []);

      // Update row count for DataGrid
      if (response.pagination) {
        setRowCount(response.pagination.totalCount || 0);
      } else {
        setRowCount(response.users?.length || 0);
      }
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || 'Failed to load users');
      console.error('Failed to fetch users:', error);
      setUsers([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'avatarUrl',
      headerName: 'Avatar',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const user = params.row as User;
        return (
          <Avatar
            src={getAvatarUrl(user.avatarUrl)}
            alt={user.name}
            sx={{ width: 32, height: 32 }}
          >
            {!user.avatarUrl && user.name?.substring(0, 2).toUpperCase()}
          </Avatar>
        );
      }
    },
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
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleEdit(params.row.id)}
          color="primary"
        >
          <Edit fontSize="small" />
        </IconButton>
      )
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
    } as User);
    setDialogOpen(true);
  };

  const handleEdit = (id: string | number) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setEditingUser(user);
      setDialogOpen(true);
    }
  };

  const handleDeleteClick = (ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Delete users from API
      for (const id of selectedForDelete) {
        await api.delete(`/user/${id}`);
      }

      // Remove from local state
      setUsers(users.filter((user) => !selectedForDelete.includes(user.id)));

      // Show success message
      const count = selectedForDelete.length;
      setSuccessMessage(`Successfully deleted ${count} user${count > 1 ? 's' : ''}`);

      // Close dialog
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to delete users');
      console.error('Failed to delete users:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  };

  const handleAvatarUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    setUploadingAvatar(true);
    try {
      const response = await api.post('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.file.path; // Returns /uploads/filename
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      throw new Error(error.response?.data?.error || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
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
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to save user');
      console.error('Failed to save user:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRefresh = () => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchUsers(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  };

  const handleSearchChange = (field: keyof SearchCriteria, value: string) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  };

  // Quick search handlers
  const handleQuickSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchUsers(0, paginationModel.pageSize, true);
  };

  const handleQuickSearchClear = () => {
    setQuickSearch('');
    setUsers([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 50 });
    // Clear saved state
    sessionStorage.removeItem(STORAGE_KEY);
  };

  // Advanced search handlers
  const handleAdvancedSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchUsers(0, paginationModel.pageSize, false);
  };

  const handleAdvancedSearchClear = () => {
    setSearchCriteria({
      username: '',
      name: '',
      email: '',
      role: '',
      department: '',
      status: ''
    });
    // Clear saved state
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const handleAdvancedFilterApply = () => {
    setAdvancedFilterOpen(false);
    handleAdvancedSearch();
  };

  const handleAdvancedFilterClose = () => {
    setAdvancedFilterOpen(false);
  };

  const handlePaginationModelChange = (newModel: { page: number; pageSize: number }) => {
    setPaginationModel(newModel);
    const useQuickSearch = quickSearch.trim() !== '';
    fetchUsers(newModel.page, newModel.pageSize, useQuickSearch);
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(searchCriteria).filter(v => v !== '').length;
  }, [searchCriteria]);

  // Filter field configuration
  const filterFields: FilterFieldConfig[] = useMemo(() => [
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      placeholder: 'Search by username...'
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Search by name...'
    },
    {
      name: 'email',
      label: t('auth.email'),
      type: 'text',
      placeholder: 'Search by email...'
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: '', label: 'All Roles' },
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'user', label: 'User' }
      ]
    },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      options: [
        { value: '', label: 'All Departments' },
        ...DEPARTMENTS.map(dept => ({ value: dept, label: dept }))
      ]
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ], [t]);

  return (
    <PageContainer>
      {/* Header - Auto mode: fetches menu info based on current path */}
      <PageHeader
        useMenu
        showBreadcrumb
        actions={
          // Show help button: always for admin, only when help exists for regular users
          (isAdmin || helpExists) ? (
            <Tooltip title={isAdmin ? "Help (Admin: Click to edit)" : "Help"}>
              <IconButton
                onClick={() => setHelpOpen(true)}
                color="primary"
                sx={{ ml: 1 }}
              >
                <HelpOutline />
              </IconButton>
            </Tooltip>
          ) : null
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 1, flexShrink: 0 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 1, flexShrink: 0 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Quick Search Bar */}
      <QuickSearchBar
        searchValue={quickSearch}
        onSearchChange={setQuickSearch}
        onSearch={handleQuickSearch}
        onClear={handleQuickSearchClear}
        onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
        placeholder="Search by username, name, or email..."
        searching={searching}
        activeFilterCount={activeFilterCount}
        showAdvancedButton={true}
      />

      {/* Advanced Filter Panel - Only show when open */}
      {advancedFilterOpen && (
        <SearchFilterPanel
          title={`${t('common.search')} / ${t('common.filter')}`}
          activeFilterCount={activeFilterCount}
          onApply={handleAdvancedFilterApply}
          onClear={handleAdvancedSearchClear}
          onClose={handleAdvancedFilterClose}
          mode="advanced"
          expanded={true}
          showHeader={false}
        >
          <SearchFilterFields
            fields={filterFields}
            values={searchCriteria}
            onChange={handleSearchChange}
            onEnter={handleAdvancedFilterApply}
          />
        </SearchFilterPanel>
      )}

      {/* DataGrid Area - Flexible */}
      <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {users.length === 0 && !searching ? (
          <EmptyState
            icon={Search}
            title="No users loaded"
            description="Use the search filters above to find users"
          />
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ExcelDataGrid
              rows={users}
              columns={columns}
              onRowsChange={(rows) => setUsers(rows as User[])}
              onAdd={handleAdd}
              onDelete={handleDeleteClick}
              onRefresh={handleRefresh}
              checkboxSelection
              exportFileName="users"
              loading={searching}
              paginationMode="server"
              rowCount={rowCount}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
            />
          </Box>
        )}
      </Paper>

      {/* Edit Drawer */}
      <Drawer
        anchor="right"
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingUser(null);
        }}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 500 } }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            <Typography variant="h6">
              {!editingUser?.id ? 'Add New User' : 'Edit User'}
            </Typography>
            <IconButton onClick={() => {
              setDialogOpen(false);
              setEditingUser(null);
            }}>
              <Close />
            </IconButton>
          </Box>

          {/* Form Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            <Stack spacing={3}>
              {/* Avatar Upload */}
              {editingUser && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Avatar
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    <Avatar
                      src={editingUser.avatarUrl ? getAvatarUrl(editingUser.avatarUrl) : undefined}
                      alt={editingUser.name}
                      sx={{ width: 80, height: 80 }}
                    >
                      {!editingUser.avatarUrl && editingUser.name?.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Button
                      component="label"
                      variant="outlined"
                      size="small"
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? <CircularProgress size={20} /> : 'Upload'}
                      <input
                        type="file"
                        hidden
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const avatarUrl = await handleAvatarUpload(file);
                              setEditingUser({ ...editingUser, avatarUrl });
                            } catch {
                              setError('Failed to upload avatar');
                            }
                          }
                        }}
                      />
                    </Button>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    JPG, PNG, GIF, WEBP (Max 10MB)
                  </Typography>
                </Box>
              )}

              <Divider />

              {/* Username */}
              <TextField
                label="Username"
                fullWidth
                required
                value={editingUser?.username || ''}
                onChange={(e) => setEditingUser(editingUser ? { ...editingUser, username: e.target.value } : null)}
                disabled={!!editingUser?.id}
                helperText={editingUser?.id ? 'Username cannot be changed' : ''}
              />

              {/* Password - Only for new users */}
              {!editingUser?.id && (
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  required
                  value={editingUser?.password || ''}
                  onChange={(e) => setEditingUser(editingUser ? { ...editingUser, password: e.target.value } : null)}
                  helperText="Minimum 8 characters"
                />
              )}

              {/* Name */}
              <TextField
                label="Name"
                fullWidth
                required
                value={editingUser?.name || ''}
                onChange={(e) => setEditingUser(editingUser ? { ...editingUser, name: e.target.value } : null)}
              />

              {/* Email */}
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={editingUser?.email || ''}
                onChange={(e) => setEditingUser(editingUser ? { ...editingUser, email: e.target.value } : null)}
              />

              {/* Role */}
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editingUser?.role || 'user'}
                  label="Role"
                  onChange={(e) => setEditingUser(editingUser ? { ...editingUser, role: e.target.value } : null)}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>

              {/* Department */}
              <TextField
                label="Department"
                fullWidth
                value={editingUser?.department || ''}
                onChange={(e) => setEditingUser(editingUser ? { ...editingUser, department: e.target.value } : null)}
              />

              {/* Status */}
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingUser?.status || 'active'}
                  label="Status"
                  onChange={(e) => setEditingUser(editingUser ? { ...editingUser, status: e.target.value } : null)}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Footer Actions */}
          <Box sx={{
            p: 2,
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
            borderTop: 1,
            borderColor: 'divider'
          }}>
            <Button
              variant="outlined"
              onClick={() => {
                setDialogOpen(false);
                setEditingUser(null);
              }}
              disabled={saveLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saveLoading}
            >
              {saveLoading ? <CircularProgress size={20} /> : t('common.save')}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName="user"
        itemsList={selectedForDelete.map((id) => {
          const user = users.find((u) => u.id === id);
          return user
            ? {
                id: user.id,
                displayName: `${user.username} (${user.name || user.email})`
              }
            : { id, displayName: String(id) };
        })}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      {/* Help Viewer */}
      <HelpViewer
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        pageId="admin-users"
        language="en"
        isAdmin={isAdmin}
      />
    </PageContainer>
  );
}
