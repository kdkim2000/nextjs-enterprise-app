'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Alert,
  Chip,
  Box,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import ExcelDataGrid from '@/components/common/DataGrid';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import CrudDialog, { FormFieldConfig } from '@/components/common/CrudDialog';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import { GridColDef } from '@mui/x-data-grid';
import { api } from '@/lib/axios';
import { RoleMenuMapping } from '@/types/mapping';

interface SimpleRole { id: string; name: string; displayName: string }
interface SimpleMenu { id: string; code: string; name: { en: string; ko: string }; path?: string }

export default function RoleMenuMappingPage() {
  const [mappings, setMappings] = useState<RoleMenuMapping[]>([]);
  const [roles, setRoles] = useState<SimpleRole[]>([]);
  const [menus, setMenus] = useState<SimpleMenu[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<RoleMenuMapping | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch mappings with details
      const mappingsResponse = await api.get('/role-menu-mapping?includeDetails=true');
      setMappings(mappingsResponse.mappings || []);

      // Fetch roles for dropdown
      const rolesResponse = await api.get('/role');
      setRoles(rolesResponse.roles || []);

      // Fetch menus for dropdown
      const menusResponse = await api.get('/menu/all');
      setMenus(menusResponse.menus || []);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to load data');
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    {
      field: 'roleDisplayName',
      headerName: 'Role',
      width: 180,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    {
      field: 'menuName',
      headerName: 'Menu',
      width: 200,
      renderCell: (params) => {
        const menuName = typeof params.value === 'object' ? params.value?.en || params.value?.ko : params.value;
        return (
          <div>
            <div>{menuName}</div>
            <div style={{ fontSize: '0.75rem', color: 'gray' }}>{params.row.menuPath}</div>
          </div>
        );
      }
    },
    {
      field: 'canView',
      headerName: 'View',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      )
    },
    {
      field: 'canCreate',
      headerName: 'Create',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      )
    },
    {
      field: 'canUpdate',
      headerName: 'Update',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      )
    },
    {
      field: 'canDelete',
      headerName: 'Delete',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      )
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      width: 130
    }
  ];

  const handleAdd = () => {
    setEditingMapping(null);
    setDialogOpen(true);
  };

  const handleEdit = (id: string | number) => {
    const mapping = mappings.find((m) => m.id === id);
    if (mapping) {
      setEditingMapping(mapping);
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
        await api.delete(`/role-menu-mapping?id=${id}`);
      }

      setMappings(mappings.filter((m) => !selectedForDelete.includes(m.id)));
      const count = selectedForDelete.length;
      setSuccessMessage(`Successfully deleted ${count} mapping${count > 1 ? 's' : ''}`);
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to delete mapping(s)');
      console.error('Failed to delete mappings:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSave = async (formData: Record<string, unknown>) => {
    try {
      setSaveLoading(true);
      setError(null);

      if (!editingMapping) {
        // Add new mapping
        const response = await api.post('/role-menu-mapping', formData);
        setMappings([...mappings, response.mapping]);
        setSuccessMessage('Mapping created successfully');
      } else {
        // Update existing mapping
        const response = await api.put('/role-menu-mapping', {
          ...formData,
          id: editingMapping.id
        });
        setMappings(mappings.map((m) => (m.id === editingMapping.id ? response.mapping : m)));
        setSuccessMessage('Mapping updated successfully');
      }

      setDialogOpen(false);
      setEditingMapping(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to save mapping');
      console.error('Failed to save mapping:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const roleOptions = useMemo(() =>
    roles.map((role) => ({
      value: role.id,
      label: role.displayName
    })),
    [roles]
  );

  const menuOptions = useMemo(() =>
    menus.map((menu) => {
      const menuName = typeof menu.name === 'object' ? menu.name?.en || menu.name?.ko : menu.name;
      return {
        value: menu.id,
        label: `${menuName} (${menu.path})`
      };
    }),
    [menus]
  );

  const formFields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'roleId',
      label: 'Role',
      type: 'select',
      required: true,
      options: roleOptions,
      disabled: !!editingMapping
    },
    {
      name: 'menuId',
      label: 'Menu',
      type: 'select',
      required: true,
      options: menuOptions,
      disabled: !!editingMapping
    },
    {
      name: 'permissions',
      label: 'Permissions',
      type: 'custom',
      render: (value, onChange) => {
        const permissions = typeof value === 'string' ? JSON.parse(value || '{}') : (value || {});
        return (
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={permissions?.canView ?? true}
                  onChange={(e) => onChange({ ...permissions, canView: e.target.checked })}
                />
              }
              label="Can View"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={permissions?.canCreate ?? false}
                  onChange={(e) => onChange({ ...permissions, canCreate: e.target.checked })}
                />
              }
              label="Can Create"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={permissions?.canUpdate ?? false}
                  onChange={(e) => onChange({ ...permissions, canUpdate: e.target.checked })}
                />
              }
              label="Can Update"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={permissions?.canDelete ?? false}
                  onChange={(e) => onChange({ ...permissions, canDelete: e.target.checked })}
                />
              }
              label="Can Delete"
            />
          </Box>
        );
      }
    }
  ], [roleOptions, menuOptions, editingMapping]);

  return (
    <PageContainer>
      <PageHeader
        title="Role-Menu Mapping"
        description="Manage role-menu permissions"
        showBreadcrumb
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

      <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <ExcelDataGrid
          rows={mappings}
          columns={columns}
          onRowsChange={(rows) => setMappings(rows as RoleMenuMapping[])}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onRefresh={fetchData}
          editable
          checkboxSelection
          exportFileName="role-menu-mappings"
          loading={loading}
        />
      </Paper>

      {/* CRUD Dialog */}
      <CrudDialog
        open={dialogOpen}
        title={!editingMapping ? 'Add New Mapping' : 'Edit Mapping'}
        fields={formFields}
        data={{
          ...(editingMapping as unknown as Record<string, unknown> || {}),
          permissions: editingMapping ? {
            canView: editingMapping.canView,
            canCreate: editingMapping.canCreate,
            canUpdate: editingMapping.canUpdate,
            canDelete: editingMapping.canDelete
          } : {
            canView: true,
            canCreate: false,
            canUpdate: false,
            canDelete: false
          }
        }}
        onSave={(data) => {
          const { permissions, ...rest } = data;
          const saveData = {
            ...rest,
            ...(permissions as Record<string, unknown> || {})
          };
          return handleSave(saveData);
        }}
        onClose={() => {
          setDialogOpen(false);
          setEditingMapping(null);
        }}
        loading={saveLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Mapping(s)"
        itemCount={selectedForDelete.length}
        itemName="mapping"
        itemsList={selectedForDelete.map((id) => {
          const mapping = mappings.find((m) => m.id === id);
          const menuName = mapping?.menuName && typeof mapping.menuName === 'object'
            ? (mapping.menuName as { en?: string; ko?: string }).en || (mapping.menuName as { en?: string; ko?: string }).ko
            : mapping?.menuName;
          return mapping
            ? { id, displayName: `${mapping.roleDisplayName} - ${menuName}` }
            : { id, displayName: String(id) };
        })}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </PageContainer>
  );
}
