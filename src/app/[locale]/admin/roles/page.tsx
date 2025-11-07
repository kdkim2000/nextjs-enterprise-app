'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { Search, HelpOutline } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import SearchFilterFields, { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import CrudDialog, { FormFieldConfig } from '@/components/common/CrudDialog';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import HelpViewer from '@/components/common/HelpViewer';
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

export default function RoleManagementPage() {
  const t = useI18n();
  const [roles, setRoles] = useState<Role[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpExists, setHelpExists] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    name: '',
    displayName: '',
    roleType: '',
    isActive: '',
    isSystem: '',
    manager: '',
    representative: ''
  });

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
      } catch (err) {
        // If help doesn't exist or error occurs, set to false
        setHelpExists(false);
      }
    };

    checkHelpAndRole();
  }, []);

  const fetchRoles = async (useQuickSearch: boolean = false) => {
    try {
      setSearching(true);
      setError(null);

      const response = await api.get('/role');
      const allRoles = response.roles || [];

      // Debug log
      console.log('Fetched roles:', allRoles.length);
      if (allRoles.length > 0) {
        console.log('Sample role:', allRoles[0]);
      }

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

      console.log('Filtered roles:', filtered.length);
      setRoles(filtered);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to load roles');
      console.error('Failed to fetch roles:', err);
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

  const handleSave = async (formData: Record<string, unknown>) => {
    try {
      setSaveLoading(true);
      setError(null);

      if (!editingRole) {
        // Add new role
        const response = await api.post('/role', formData);
        setRoles([...roles, response.role]);
        setSuccessMessage('Role created successfully');
      } else {
        // Update existing role
        const response = await api.put('/role', {
          ...formData,
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

  const formFields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'name',
      label: 'Role Name',
      type: 'text',
      required: true,
      disabled: editingRole?.isSystem || false,
      helperText: 'Unique identifier for the role (lowercase, no spaces)'
    },
    {
      name: 'displayName',
      label: 'Display Name',
      type: 'text',
      required: true
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      multiline: true,
      rows: 3
    },
    {
      name: 'roleType',
      label: 'Role Type',
      type: 'select',
      required: true,
      options: [
        { value: 'general', label: 'General (일반 역할 - 사용자 신청 가능)' },
        { value: 'management', label: 'Management (관리용 역할 - 관리자 전용)' }
      ],
      helperText: 'Management roles cannot be requested by general users'
    },
    {
      name: 'manager',
      label: 'Manager (관리자)',
      type: 'userSelector',
      helperText: 'Select the user who will manage this role'
    },
    {
      name: 'representative',
      label: 'Representative (담당자)',
      type: 'userSelector',
      helperText: 'Select the user who will be responsible for this role'
    },
    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox'
    }
  ], [editingRole]);

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
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onRefresh={handleRefresh}
              editable
              checkboxSelection
              exportFileName="roles"
              loading={searching}
            />
          </Box>
        )}
      </Paper>

      {/* Edit Dialog */}
      <CrudDialog
        open={dialogOpen}
        title={!editingRole?.id ? 'Add New Role' : 'Edit Role'}
        data={editingRole}
        fields={formFields}
        onClose={() => {
          setDialogOpen(false);
          setEditingRole(null);
        }}
        onSave={handleSave}
        loading={saveLoading}
        cancelText={t('common.cancel')}
        saveText={t('common.save')}
      />

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
