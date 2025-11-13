'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Alert,
  Chip
} from '@mui/material';
import ExcelDataGrid from '@/components/common/DataGrid';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import CrudDialog, { FormFieldConfig } from '@/components/common/CrudDialog';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import { GridColDef } from '@mui/x-data-grid';
import { api } from '@/lib/axios';
import { UserRoleMapping } from '@/types/mapping';

interface SimpleUser { id: string; username: string; name: string; email: string }
interface SimpleRole { id: string; name: string; displayName: string }

export default function UserRoleMappingPage() {
  const [mappings, setMappings] = useState<UserRoleMapping[]>([]);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [roles, setRoles] = useState<SimpleRole[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<UserRoleMapping | null>(null);
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
      const mappingsResponse = await api.get('/user-role-mapping?includeDetails=true');
      setMappings(mappingsResponse.mappings || []);

      // Fetch users for dropdown
      const usersResponse = await api.get('/user');
      setUsers(usersResponse.users || []);

      // Fetch roles for dropdown
      const rolesResponse = await api.get('/role');
      setRoles(rolesResponse.roles || []);
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
      field: 'userName',
      headerName: 'User',
      width: 200,
      renderCell: (params) => (
        <div>
          <div>{params.value}</div>
          <div style={{ fontSize: '0.75rem', color: 'gray' }}>{params.row.userEmail}</div>
        </div>
      )
    },
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
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      )
    },
    {
      field: 'assignedBy',
      headerName: 'Assigned By',
      width: 130
    },
    {
      field: 'assignedAt',
      headerName: 'Assigned At',
      width: 180,
      renderCell: (params) => new Date(params.value).toLocaleString()
    },
    {
      field: 'expiresAt',
      headerName: 'Expires At',
      width: 180,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleString() : 'Never'
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
        await api.delete(`/user-role-mapping?id=${id}`);
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
        const response = await api.post('/user-role-mapping', formData);
        setMappings([...mappings, response.mapping]);
        setSuccessMessage('Mapping created successfully');
      } else {
        // Update existing mapping
        const response = await api.put('/user-role-mapping', {
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

  const userOptions = useMemo(() =>
    users.map((user) => ({
      value: user.id,
      label: `${user.name} (${user.username})`
    })),
    [users]
  );

  const roleOptions = useMemo(() =>
    roles.map((role) => ({
      value: role.id,
      label: role.displayName
    })),
    [roles]
  );

  const formFields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'userId',
      label: 'User',
      type: 'select',
      required: true,
      options: userOptions,
      disabled: !!editingMapping
    },
    {
      name: 'roleId',
      label: 'Role',
      type: 'select',
      required: true,
      options: roleOptions,
      disabled: !!editingMapping
    },
    {
      name: 'expiresAt',
      label: 'Expires At',
      type: 'text',
      placeholder: 'YYYY-MM-DDTHH:mm:ss.sssZ (optional)',
      helperText: 'Leave empty for no expiration'
    },
    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox'
    }
  ], [userOptions, roleOptions, editingMapping]);

  return (
    <PageContainer>
      <PageHeader
        title="User-Role Mapping"
        description="Manage user-role assignments"
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
          onRowsChange={(rows) => setMappings(rows as UserRoleMapping[])}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onRefresh={fetchData}
          editable
          checkboxSelection
          exportFileName="user-role-mappings"
          loading={loading}
        />
      </Paper>

      {/* CRUD Dialog */}
      <CrudDialog
        open={dialogOpen}
        title={!editingMapping ? 'Add New Mapping' : 'Edit Mapping'}
        fields={formFields}
        data={editingMapping as unknown as Record<string, unknown> || undefined}
        onSave={handleSave}
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
          return mapping
            ? { id, displayName: `${mapping.userName} - ${mapping.roleDisplayName}` }
            : { id, displayName: String(id) };
        })}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </PageContainer>
  );
}
