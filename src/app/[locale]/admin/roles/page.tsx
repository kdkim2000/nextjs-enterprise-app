'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Alert,
  Chip,
  IconButton,
  Tooltip,
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
import PageContainer from '@/components/common/PageContainer';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import SearchFilterFields, { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import HelpViewer from '@/components/common/HelpViewer';
import UserSelector from '@/components/common/UserSelector';
import { GridColDef } from '@mui/x-data-grid';
import { api } from '@/lib/axios';
import { useI18n } from '@/lib/i18n/client';
import { Role } from '@/types/role';

interface SearchCriteria {
  name: string;
  displayName: string;
  roleType: string;
  isActive: string;
  isSystem: string;
  manager: string;
  representative: string;
  [key: string]: string;
}

// Session storage key for state persistence
const STORAGE_KEY = 'admin-roles-page-state';

// Helper functions for state persistence
const savePageState = (state: {
  searchCriteria: SearchCriteria;
  quickSearch: string;
  roles: Role[];
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

export default function RoleManagementPage() {
  const t = useI18n();

  // Load saved state on mount
  const savedState = loadPageState();

  const [roles, setRoles] = useState<Role[]>(savedState?.roles || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
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
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(
    savedState?.searchCriteria || {
      name: '',
      displayName: '',
      roleType: '',
      isActive: '',
      isSystem: '',
      manager: '',
      representative: ''
    }
  );

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
      quickSearch,
      roles
    });
  }, [searchCriteria, quickSearch, roles]);

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
        const response = await api.get('/help?pageId=admin-roles&language=en');
        setHelpExists(!!response.help);
      } catch {
        // If help doesn't exist or error occurs, set to false
        setHelpExists(false);
      }
    };

    checkHelpAndRole();

    // If there's saved state with search criteria or data, restore it
    if (savedState && (savedState.roles?.length > 0 || savedState.quickSearch ||
        Object.values(savedState.searchCriteria || {}).some(v => v !== ''))) {
      // Data already loaded from savedState, no need to fetch again
      // User can click refresh if they want fresh data
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRoles = async (useQuickSearch: boolean = false) => {
    try {
      setSearching(true);
      setError(null);

      const response = await api.get('/role');
      const allRoles = response.roles || [];

      let filtered = [];

      if (useQuickSearch && quickSearch) {
        // Quick search: search in name, displayName, and description
        const term = quickSearch.toLowerCase();
        filtered = allRoles.filter(
          (role: Role) =>
            role.id.toLowerCase().includes(term) ||
            role.name.toLowerCase().includes(term) ||
            role.displayName.toLowerCase().includes(term) ||
            role.description.toLowerCase().includes(term)
        );
      } else if (Object.values(searchCriteria).some(v => v !== '')) {
        // Advanced search: only filter if there are search criteria
        filtered = allRoles.filter((role: Role) => {
          if (searchCriteria.name && !role.name.toLowerCase().includes(searchCriteria.name.toLowerCase())) return false;
          if (searchCriteria.displayName && !role.displayName.toLowerCase().includes(searchCriteria.displayName.toLowerCase())) return false;
          if (searchCriteria.roleType && role.roleType !== searchCriteria.roleType) return false;
          if (searchCriteria.isActive && String(role.isActive) !== searchCriteria.isActive) return false;
          if (searchCriteria.isSystem && String(role.isSystem) !== searchCriteria.isSystem) return false;
          if (searchCriteria.manager && role.manager !== searchCriteria.manager) return false;
          if (searchCriteria.representative && role.representative !== searchCriteria.representative) return false;
          return true;
        });
      } else {
        // No search criteria - show all roles
        filtered = allRoles;
      }

      setRoles(filtered);
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || 'Failed to load roles');
      console.error('Failed to fetch roles:', error);
      setRoles([]);
    } finally {
      setSearching(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Name', width: 130 },
    { field: 'displayName', headerName: 'Display Name', width: 160 },
    { field: 'description', headerName: 'Description', width: 180, flex: 1 },
    {
      field: 'roleType',
      headerName: 'Type',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value === 'management' ? 'Management' : 'General'}
          size="small"
          color={params.value === 'management' ? 'warning' : 'info'}
          variant="outlined"
        />
      )
    },
    {
      field: 'managerName',
      headerName: 'Manager',
      width: 150,
      renderCell: (params) => params.value || '-',
      valueGetter: (value, row) => row.managerName || '-'
    },
    {
      field: 'representativeName',
      headerName: 'Representative',
      width: 150,
      renderCell: (params) => params.value || '-',
      valueGetter: (value, row) => row.representativeName || '-'
    },
    {
      field: 'isSystem',
      headerName: 'System',
      width: 90,
      renderCell: (params) =>
        params.value ? <Chip label="System" size="small" color="secondary" /> : null
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 90,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      )
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
    setEditingRole(null);
    setDialogOpen(true);
  };

  const handleEdit = (id: string | number) => {
    const role = roles.find((r) => r.id === id);
    if (role) {
      setEditingRole(role);
      setDialogOpen(true);
    }
  };

  const handleDeleteClick = (ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      setError(null);

      for (const id of selectedForDelete) {
        await api.delete(`/role?id=${id}`);
      }

      setRoles(roles.filter((r) => !selectedForDelete.includes(r.id)));
      const count = selectedForDelete.length;
      setSuccessMessage(`Successfully deleted ${count} role${count > 1 ? 's' : ''}`);
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to delete role(s)');
      console.error('Failed to delete roles:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingRole) return;

    try {
      setSaveLoading(true);
      setError(null);

      if (!editingRole.id) {
        // Add new role
        const response = await api.post('/role', editingRole);
        setRoles([...roles, response.role]);
        setSuccessMessage('Role created successfully');
      } else {
        // Update existing role
        const response = await api.put('/role', {
          ...editingRole,
          id: editingRole.id
        });
        setRoles(roles.map((r) => (r.id === editingRole.id ? response.role : r)));
        setSuccessMessage('Role updated successfully');
      }

      setDialogOpen(false);
      setEditingRole(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to save role');
      console.error('Failed to save role:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRefresh = () => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchRoles(useQuickSearch);
  };

  const handleSearchChange = (field: keyof SearchCriteria, value: string) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  };

  // Quick search handlers
  const handleQuickSearch = () => {
    fetchRoles(true);
  };

  const handleQuickSearchClear = () => {
    setQuickSearch('');
    setRoles([]);
    // Clear saved state
    sessionStorage.removeItem(STORAGE_KEY);
  };

  // Advanced search handlers
  const handleAdvancedSearch = () => {
    fetchRoles(false);
  };

  const handleAdvancedSearchClear = () => {
    setSearchCriteria({
      name: '',
      displayName: '',
      roleType: '',
      isActive: '',
      isSystem: '',
      manager: '',
      representative: ''
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

  const activeFilterCount = useMemo(() => {
    return Object.values(searchCriteria).filter(v => v !== '').length;
  }, [searchCriteria]);

  // Filter field configuration
  const filterFields: FilterFieldConfig[] = useMemo(() => [
    {
      name: 'name',
      label: 'Role Name',
      type: 'text',
      placeholder: 'Search by role name...'
    },
    {
      name: 'displayName',
      label: 'Display Name',
      type: 'text',
      placeholder: 'Search by display name...'
    },
    {
      name: 'roleType',
      label: 'Role Type',
      type: 'select',
      options: [
        { value: '', label: 'All Types' },
        { value: 'general', label: 'General' },
        { value: 'management', label: 'Management' }
      ]
    },
    {
      name: 'isActive',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Status' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    },
    {
      name: 'isSystem',
      label: 'System Role',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'System' },
        { value: 'false', label: 'Custom' }
      ]
    },
    {
      name: 'manager',
      label: 'Manager',
      type: 'userSelector',
      placeholder: 'Filter by manager...'
    },
    {
      name: 'representative',
      label: 'Representative',
      type: 'userSelector',
      placeholder: 'Filter by representative...'
    }
  ], []);

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
        placeholder="Search by ID, name, display name, or description..."
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
        {roles.length === 0 && !searching ? (
          <EmptyState
            icon={Search}
            title="No roles loaded"
            description="Use the search filters above to find roles"
          />
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ExcelDataGrid
              rows={roles}
              columns={columns}
              onRowsChange={(rows) => setRoles(rows as Role[])}
              onAdd={handleAdd}
              onDelete={handleDeleteClick}
              onRefresh={handleRefresh}
              checkboxSelection
              editable
              exportFileName="roles"
              loading={searching}
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
          setEditingRole(null);
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
              {!editingRole?.id ? 'Add New Role' : 'Edit Role'}
            </Typography>
            <IconButton onClick={() => {
              setDialogOpen(false);
              setEditingRole(null);
            }}>
              <Close />
            </IconButton>
          </Box>

          {/* Form Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            <Stack spacing={3}>
              {/* Role Name */}
              <TextField
                label="Role Name"
                fullWidth
                required
                value={editingRole?.name || ''}
                onChange={(e) => setEditingRole(editingRole ? { ...editingRole, name: e.target.value } : null)}
                disabled={editingRole?.isSystem || false}
                helperText={editingRole?.isSystem ? 'System role name cannot be changed' : 'Unique identifier for the role (lowercase, no spaces)'}
              />

              {/* Display Name */}
              <TextField
                label="Display Name"
                fullWidth
                required
                value={editingRole?.displayName || ''}
                onChange={(e) => setEditingRole(editingRole ? { ...editingRole, displayName: e.target.value } : null)}
              />

              {/* Description */}
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={editingRole?.description || ''}
                onChange={(e) => setEditingRole(editingRole ? { ...editingRole, description: e.target.value } : null)}
              />

              {/* Role Type */}
              <FormControl fullWidth required>
                <InputLabel>Role Type</InputLabel>
                <Select
                  value={editingRole?.roleType || 'general'}
                  label="Role Type"
                  onChange={(e) => setEditingRole(editingRole ? { ...editingRole, roleType: e.target.value } : null)}
                >
                  <MenuItem value="general">General (일반 역할 - 사용자 신청 가능)</MenuItem>
                  <MenuItem value="management">Management (관리용 역할 - 관리자 전용)</MenuItem>
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5 }}>
                  Management roles cannot be requested by general users
                </Typography>
              </FormControl>

              <Divider />

              {/* Manager */}
              <UserSelector
                label="Manager (관리자)"
                value={editingRole?.manager || null}
                onChange={(userId) => setEditingRole(editingRole ? { ...editingRole, manager: userId || '' } : null)}
                helperText="Select the user who will manage this role"
              />

              {/* Representative */}
              <UserSelector
                label="Representative (담당자)"
                value={editingRole?.representative || null}
                onChange={(userId) => setEditingRole(editingRole ? { ...editingRole, representative: userId || '' } : null)}
                helperText="Select the user who will be responsible for this role"
              />

              <Divider />

              {/* Active Status */}
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingRole?.isActive ? 'true' : 'false'}
                  label="Status"
                  onChange={(e) => setEditingRole(editingRole ? { ...editingRole, isActive: e.target.value === 'true' } : null)}
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
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
                setEditingRole(null);
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
        itemName="role"
        itemsList={selectedForDelete.map((id) => {
          const role = roles.find((r) => r.id === id);
          return role
            ? {
                id: role.id,
                displayName: `${role.displayName} (${role.name})`
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
        pageId="admin-roles"
        language="en"
        isAdmin={isAdmin}
      />
    </PageContainer>
  );
}
