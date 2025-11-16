'use client';

import React, { useState } from 'react';
import {
  TextField,
  Divider,
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  IconButton,
  Drawer
} from '@mui/material';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import CodeSelect from '@/components/common/CodeSelect';

export interface ProgramPermission {
  code: string;
  name: { en: string; ko: string; zh: string; vi: string };
  description: { en: string; ko: string; zh: string; vi: string };
  isDefault?: boolean;
}

export interface ProgramFormData {
  id?: string;
  code: string;
  nameEn: string;
  nameKo: string;
  nameZh: string;
  nameVi: string;
  descriptionEn: string;
  descriptionKo: string;
  descriptionZh: string;
  descriptionVi: string;
  category: string;
  type: 'page' | 'function' | 'api' | 'report';
  status: 'active' | 'inactive' | 'development';
  version?: string;
  author?: string;
  tags?: string;
  permissions?: ProgramPermission[];
}

export interface ProgramFormFieldsProps {
  program: ProgramFormData | null;
  onChange: (program: ProgramFormData) => void;
  locale?: string;
}

export default function ProgramFormFields({
  program,
  onChange,
  locale = 'en'
}: ProgramFormFieldsProps) {
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<ProgramPermission & { originalCode?: string } | null>(null);

  if (!program) return null;

  const handleChange = (field: keyof ProgramFormData, value: string | ProgramPermission[]) => {
    onChange({ ...program, [field]: value });
  };

  const handleAddPermission = () => {
    setEditingPermission({
      code: '',
      name: { en: '', ko: '', zh: '', vi: '' },
      description: { en: '', ko: '', zh: '', vi: '' },
      isDefault: false
    });
    setPermissionDialogOpen(true);
  };

  const handleEditPermission = (permission: ProgramPermission) => {
    setEditingPermission({ ...permission, originalCode: permission.code });
    setPermissionDialogOpen(true);
  };

  const handleSavePermission = () => {
    if (!editingPermission) return;

    const { originalCode, ...permissionData } = editingPermission;

    if (originalCode) {
      // Update existing permission
      const existingIndex = program.permissions?.findIndex(p => p.code === originalCode);
      if (existingIndex !== undefined && existingIndex >= 0) {
        const updatedPermissions = [...(program.permissions || [])];
        updatedPermissions[existingIndex] = permissionData;
        handleChange('permissions', updatedPermissions);
      }
    } else {
      // Add new permission - check for duplicates
      const isDuplicate = program.permissions?.some(p => p.code === permissionData.code);
      if (isDuplicate) {
        alert(`Permission with code "${permissionData.code}" already exists!`);
        return;
      }
      handleChange('permissions', [...(program.permissions || []), permissionData]);
    }

    setPermissionDialogOpen(false);
    setEditingPermission(null);
  };

  const handleDeletePermission = (code: string) => {
    handleChange('permissions', program.permissions?.filter(p => p.code !== code) || []);
  };

  return (
    <>
      {/* Program Code */}
      <TextField
        label="Program Code *"
        value={program.code || ''}
        onChange={(e) => handleChange('code', e.target.value)}
        fullWidth
        required
        helperText="Unique identifier (e.g., PROG-USER-MGMT)"
        disabled={!!program.id}
      />

      <Divider>Names</Divider>

      {/* Program Name (English) */}
      <TextField
        label="Program Name (English) *"
        value={program.nameEn || ''}
        onChange={(e) => handleChange('nameEn', e.target.value)}
        fullWidth
        required
      />

      {/* Program Name (Korean) */}
      <TextField
        label="Program Name (Korean) *"
        value={program.nameKo || ''}
        onChange={(e) => handleChange('nameKo', e.target.value)}
        fullWidth
        required
      />

      {/* Program Name (Chinese) */}
      <TextField
        label="Program Name (Chinese)"
        value={program.nameZh || ''}
        onChange={(e) => handleChange('nameZh', e.target.value)}
        fullWidth
        placeholder="中文程序名称"
      />

      {/* Program Name (Vietnamese) */}
      <TextField
        label="Program Name (Vietnamese)"
        value={program.nameVi || ''}
        onChange={(e) => handleChange('nameVi', e.target.value)}
        fullWidth
        placeholder="Tên chương trình tiếng Việt"
      />

      <Divider>Descriptions</Divider>

      {/* Description (English) */}
      <TextField
        label="Description (English)"
        value={program.descriptionEn || ''}
        onChange={(e) => handleChange('descriptionEn', e.target.value)}
        fullWidth
        multiline
        rows={2}
      />

      {/* Description (Korean) */}
      <TextField
        label="Description (Korean)"
        value={program.descriptionKo || ''}
        onChange={(e) => handleChange('descriptionKo', e.target.value)}
        fullWidth
        multiline
        rows={2}
      />

      {/* Description (Chinese) */}
      <TextField
        label="Description (Chinese)"
        value={program.descriptionZh || ''}
        onChange={(e) => handleChange('descriptionZh', e.target.value)}
        fullWidth
        multiline
        rows={2}
        placeholder="中文描述"
      />

      {/* Description (Vietnamese) */}
      <TextField
        label="Description (Vietnamese)"
        value={program.descriptionVi || ''}
        onChange={(e) => handleChange('descriptionVi', e.target.value)}
        fullWidth
        multiline
        rows={2}
        placeholder="Mô tả tiếng Việt"
      />

      <Divider>Properties</Divider>

      {/* Category */}
      <CodeSelect
        codeType="PROGRAM_CATEGORY"
        value={program.category || 'admin'}
        onChange={(value) => handleChange('category', value)}
        label="Category"
        required
        locale={locale}
      />

      {/* Type */}
      <CodeSelect
        codeType="PROGRAM_TYPE"
        value={program.type || 'page'}
        onChange={(value) => handleChange('type', value as 'page' | 'function' | 'api' | 'report')}
        label="Type"
        required
        locale={locale}
      />

      {/* Status */}
      <CodeSelect
        codeType="PROGRAM_STATUS"
        value={program.status || 'development'}
        onChange={(value) => handleChange('status', value as 'active' | 'inactive' | 'development')}
        label="Status"
        required
        locale={locale}
      />

      <Divider>Metadata</Divider>

      {/* Version */}
      <TextField
        label="Version"
        value={program.version || ''}
        onChange={(e) => handleChange('version', e.target.value)}
        fullWidth
        placeholder="e.g., 1.0.0"
      />

      {/* Author */}
      <TextField
        label="Author"
        value={program.author || ''}
        onChange={(e) => handleChange('author', e.target.value)}
        fullWidth
      />

      {/* Tags */}
      <TextField
        label="Tags"
        value={program.tags || ''}
        onChange={(e) => handleChange('tags', e.target.value)}
        fullWidth
        placeholder="Comma-separated (e.g., admin, user, core)"
      />

      <Divider>Permissions</Divider>

      {/* Permissions */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Manage permissions for this program
            {program.permissions && ` (${program.permissions.length})`}
          </Typography>
          <Button
            size="small"
            startIcon={<Add />}
            onClick={handleAddPermission}
            variant="outlined"
          >
            Add Permission
          </Button>
        </Box>

        {program.permissions && program.permissions.length > 0 ? (
          <Stack spacing={1}>
            {program.permissions.map((permission, index) => (
              <Card key={index} variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {permission.code}
                        {permission.isDefault && (
                          <Typography component="span" variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                            (Default)
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {locale === 'ko' ? permission.name.ko : permission.name.en}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {locale === 'ko' ? permission.description.ko : permission.description.en}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditPermission(permission)}
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePermission(permission.code)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No permissions defined. Click "Add Permission" to add one.
          </Typography>
        )}
      </Box>

      {/* Permission Edit Dialog */}
      <Drawer
        anchor="right"
        open={permissionDialogOpen}
        onClose={() => {
          setPermissionDialogOpen(false);
          setEditingPermission(null);
        }}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 500 } }
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {editingPermission?.originalCode ? 'Edit Permission' : 'Add New Permission'}
            </Typography>
            <IconButton
              onClick={() => {
                setPermissionDialogOpen(false);
                setEditingPermission(null);
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Form */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <Stack spacing={3}>
              {/* Permission Code */}
              <TextField
                label="Permission Code *"
                value={editingPermission?.code || ''}
                onChange={(e) => setEditingPermission(editingPermission ? { ...editingPermission, code: e.target.value.toUpperCase() } : null)}
                fullWidth
                required
                placeholder="e.g., READ, WRITE, DELETE"
                disabled={!!editingPermission?.originalCode}
                helperText={editingPermission?.originalCode ? "Code cannot be changed after creation" : "Use uppercase letters"}
              />

              <Divider>Names</Divider>

              {/* Name (English) */}
              <TextField
                label="Name (English) *"
                value={editingPermission?.name.en || ''}
                onChange={(e) => setEditingPermission(editingPermission ? { ...editingPermission, name: { ...editingPermission.name, en: e.target.value } } : null)}
                fullWidth
                required
              />

              {/* Name (Korean) */}
              <TextField
                label="Name (Korean) *"
                value={editingPermission?.name.ko || ''}
                onChange={(e) => setEditingPermission(editingPermission ? { ...editingPermission, name: { ...editingPermission.name, ko: e.target.value } } : null)}
                fullWidth
                required
              />

              {/* Name (Chinese) */}
              <TextField
                label="Name (Chinese)"
                value={editingPermission?.name.zh || ''}
                onChange={(e) => setEditingPermission(editingPermission ? { ...editingPermission, name: { ...editingPermission.name, zh: e.target.value } } : null)}
                fullWidth
                placeholder="中文名称"
              />

              {/* Name (Vietnamese) */}
              <TextField
                label="Name (Vietnamese)"
                value={editingPermission?.name.vi || ''}
                onChange={(e) => setEditingPermission(editingPermission ? { ...editingPermission, name: { ...editingPermission.name, vi: e.target.value } } : null)}
                fullWidth
                placeholder="Tên tiếng Việt"
              />

              <Divider>Descriptions</Divider>

              {/* Description (English) */}
              <TextField
                label="Description (English)"
                value={editingPermission?.description.en || ''}
                onChange={(e) => setEditingPermission(editingPermission ? { ...editingPermission, description: { ...editingPermission.description, en: e.target.value } } : null)}
                fullWidth
                multiline
                rows={2}
              />

              {/* Description (Korean) */}
              <TextField
                label="Description (Korean)"
                value={editingPermission?.description.ko || ''}
                onChange={(e) => setEditingPermission(editingPermission ? { ...editingPermission, description: { ...editingPermission.description, ko: e.target.value } } : null)}
                fullWidth
                multiline
                rows={2}
              />

              {/* Description (Chinese) */}
              <TextField
                label="Description (Chinese)"
                value={editingPermission?.description.zh || ''}
                onChange={(e) => setEditingPermission(editingPermission ? { ...editingPermission, description: { ...editingPermission.description, zh: e.target.value } } : null)}
                fullWidth
                multiline
                rows={2}
                placeholder="中文描述"
              />

              {/* Description (Vietnamese) */}
              <TextField
                label="Description (Vietnamese)"
                value={editingPermission?.description.vi || ''}
                onChange={(e) => setEditingPermission(editingPermission ? { ...editingPermission, description: { ...editingPermission.description, vi: e.target.value } } : null)}
                fullWidth
                multiline
                rows={2}
                placeholder="Mô tả tiếng Việt"
              />
            </Stack>
          </Box>

          {/* Actions */}
          <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider', pt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setPermissionDialogOpen(false);
                setEditingPermission(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSavePermission}
              disabled={
                !editingPermission?.code ||
                !editingPermission?.name.en ||
                !editingPermission?.name.ko
              }
            >
              Save
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
