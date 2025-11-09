'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Alert,
  Tooltip,
  IconButton,
  Paper,
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
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Search, HelpOutline, Close, Add, Delete, Edit as EditIcon } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import PageHeader from '@/components/common/PageHeader';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import PageContainer from '@/components/common/PageContainer';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import HelpViewer from '@/components/common/HelpViewer';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { PROGRAM_CATEGORIES, PROGRAM_TYPES, PROGRAM_STATUS, DEFAULT_PERMISSIONS } from '@/types/program';
import { useProgramManagement } from './hooks/useProgramManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { ProgramFormData, ProgramPermission } from './types';

export default function ProgramManagementPage() {
  const t = useI18n();
  const locale = useCurrentLocale();

  // Local state for permission editing
  const [editingPermission, setEditingPermission] = useState<ProgramPermission & { originalCode?: string } | null>(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);

  // Use custom hook for all business logic
  const {
    // State
    programs,
    setPrograms,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    setDialogOpen,
    editingProgram,
    setEditingProgram,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    deleteConfirmOpen,
    selectedForDelete,
    deleteLoading,
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    successMessage,
    error,
    // Handlers
    handleAdd,
    handleEdit,
    handleSave,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange
  } = useProgramManagement();

  // Memoized computed values
  const columns = useMemo(() => createColumns(locale, handleEdit), [locale, handleEdit]);
  const filterFields = useMemo(() => createFilterFields(), []);
  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  // Collect unique permissions from all programs
  const existingPermissions = useMemo(() => {
    const permMap = new Map<string, ProgramPermission>();

    // Add default permissions
    DEFAULT_PERMISSIONS.forEach(p => {
      permMap.set(p.code, {
        code: p.code,
        name: { en: p.nameEn, ko: p.nameKo },
        description: { en: p.descriptionEn, ko: p.descriptionKo },
        isDefault: false
      });
    });

    // Add permissions from all programs
    programs.forEach(program => {
      program.permissions?.forEach(perm => {
        if (!permMap.has(perm.code)) {
          permMap.set(perm.code, perm);
        }
      });
    });

    return Array.from(permMap.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [programs]);

  const deleteItemsList = useMemo(
    () =>
      selectedForDelete.map((id) => {
        const program = programs.find((p) => p.id === id);
        return program
          ? {
              id: program.id!,
              displayName: `${program.code} (${locale === 'ko' ? program.nameKo : program.nameEn})`
            }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, programs, locale]
  );

  // Permission management helpers
  const handleAddPermission = () => {
    setEditingPermission({
      code: '',
      name: { en: '', ko: '' },
      description: { en: '', ko: '' },
      isDefault: false
    });
    setPermissionDialogOpen(true);
  };

  const handleEditPermission = (permission: ProgramPermission) => {
    setEditingPermission({ ...permission, originalCode: permission.code });
    setPermissionDialogOpen(true);
  };

  const handleSavePermission = () => {
    if (!editingPermission || !editingProgram) return;

    const { originalCode, ...permissionData } = editingPermission;

    if (originalCode) {
      // Update existing permission
      const existingIndex = editingProgram.permissions?.findIndex(p => p.code === originalCode);
      if (existingIndex !== undefined && existingIndex >= 0) {
        const updatedPermissions = [...(editingProgram.permissions || [])];
        updatedPermissions[existingIndex] = permissionData;
        setEditingProgram({ ...editingProgram, permissions: updatedPermissions });
      }
    } else {
      // Add new permission - check for duplicates
      const isDuplicate = editingProgram.permissions?.some(p => p.code === permissionData.code);
      if (isDuplicate) {
        alert(`Permission with code "${permissionData.code}" already exists!`);
        return;
      }
      setEditingProgram({
        ...editingProgram,
        permissions: [...(editingProgram.permissions || []), permissionData]
      });
    }

    setPermissionDialogOpen(false);
    setEditingPermission(null);
  };

  const handleDeletePermission = (code: string) => {
    if (!editingProgram) return;
    setEditingProgram({
      ...editingProgram,
      permissions: editingProgram.permissions?.filter(p => p.code !== code) || []
    });
  };

  const handleSelectDefaultPermission = (template: ProgramPermission) => {
    setEditingPermission({
      code: template.code,
      name: template.name,
      description: template.description,
      isDefault: template.isDefault || false
    });
  };

  return (
    <PageContainer>
      <PageHeader
        useMenu
        showBreadcrumb
        actions={
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

      {/* Error and Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 1, flexShrink: 0 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 1, flexShrink: 0 }}>
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
        placeholder="Search by code or name..."
        searching={searching}
        activeFilterCount={activeFilterCount}
        showAdvancedButton={true}
      />

      {/* Advanced Filter Panel */}
      {advancedFilterOpen && (
        <SearchFilterPanel
          title={`${t('common.search')} / ${t('common.filter')}`}
          activeFilterCount={activeFilterCount}
          onApply={handleAdvancedFilterApply}
          onClear={handleQuickSearchClear}
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

      {/* DataGrid Area */}
      <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {programs.length === 0 && !searching ? (
          <EmptyState
            icon={Search}
            title="No programs loaded"
            description="Use the search filters above to find programs"
          />
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ExcelDataGrid
              rows={programs}
              columns={columns}
              onRowsChange={(rows) => setPrograms(rows as ProgramFormData[])}
              onAdd={handleAdd}
              onDelete={handleDeleteClick}
              onRefresh={handleRefresh}
              checkboxSelection
              editable
              exportFileName="programs"
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
          setEditingProgram(null);
        }}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 700, md: 800 } }
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {!editingProgram?.id ? 'Add New Program' : 'Edit Program'}
            </Typography>
            <IconButton
              onClick={() => {
                setDialogOpen(false);
                setEditingProgram(null);
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Form */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <Stack spacing={2.5}>
              {/* Program Code */}
              <TextField
                label="Program Code *"
                value={editingProgram?.code || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, code: e.target.value } : null)}
                fullWidth
                required
                size="small"
                helperText="Unique identifier (e.g., PROG-USER-MGMT)"
              />

              <Divider>Names</Divider>

              {/* Program Name (English) */}
              <TextField
                label="Program Name (English) *"
                value={editingProgram?.nameEn || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, nameEn: e.target.value } : null)}
                fullWidth
                required
                size="small"
              />

              {/* Program Name (Korean) */}
              <TextField
                label="Program Name (Korean) *"
                value={editingProgram?.nameKo || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, nameKo: e.target.value } : null)}
                fullWidth
                required
                size="small"
              />

              <Divider>Descriptions</Divider>

              {/* Description (English) */}
              <TextField
                label="Description (English)"
                value={editingProgram?.descriptionEn || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, descriptionEn: e.target.value } : null)}
                fullWidth
                multiline
                rows={2}
                size="small"
              />

              {/* Description (Korean) */}
              <TextField
                label="Description (Korean)"
                value={editingProgram?.descriptionKo || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, descriptionKo: e.target.value } : null)}
                fullWidth
                multiline
                rows={2}
                size="small"
              />

              <Divider>Properties</Divider>

              {/* Category */}
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editingProgram?.category || 'admin'}
                  label="Category"
                  onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, category: e.target.value } : null)}
                >
                  {PROGRAM_CATEGORIES.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Type */}
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={editingProgram?.type || 'page'}
                  label="Type"
                  onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, type: e.target.value as 'page' | 'function' | 'api' | 'report' } : null)}
                >
                  {PROGRAM_TYPES.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Status */}
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingProgram?.status || 'development'}
                  label="Status"
                  onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, status: e.target.value as 'active' | 'inactive' | 'development' } : null)}
                >
                  {PROGRAM_STATUS.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider>Metadata</Divider>

              {/* Version */}
              <TextField
                label="Version"
                value={editingProgram?.version || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, version: e.target.value } : null)}
                fullWidth
                size="small"
                placeholder="e.g., 1.0.0"
              />

              {/* Author */}
              <TextField
                label="Author"
                value={editingProgram?.author || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, author: e.target.value } : null)}
                fullWidth
                size="small"
              />

              {/* Tags */}
              <TextField
                label="Tags"
                value={editingProgram?.tags || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, tags: e.target.value } : null)}
                fullWidth
                size="small"
                placeholder="Comma-separated (e.g., admin, user, core)"
              />

              <Divider>Permissions</Divider>

              {/* Permissions */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Manage permissions for this program
                    {editingProgram?.permissions && ` (${editingProgram.permissions.length})`}
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

                {editingProgram?.permissions && editingProgram.permissions.length > 0 ? (
                  <Stack spacing={1}>
                    {editingProgram.permissions.map((permission, index) => (
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
                                <EditIcon fontSize="small" />
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
                    No permissions defined. Click &quot;Add Permission&quot; to add one.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Box>

          {/* Actions */}
          <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setDialogOpen(false);
                setEditingProgram(null);
              }}
              disabled={saveLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={() => editingProgram && handleSave(editingProgram)}
              disabled={saveLoading || !editingProgram?.code || !editingProgram?.nameEn || !editingProgram?.nameKo}
              startIcon={saveLoading && <CircularProgress size={16} />}
            >
              {t('common.save')}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName="program"
        itemsList={deleteItemsList}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      {/* Help Viewer */}
      <HelpViewer
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        programId="PROG-PROGRAM-LIST"
        language="en"
        isAdmin={isAdmin}
      />

      {/* Permission Edit Dialog */}
      <Drawer
        anchor="right"
        open={permissionDialogOpen}
        onClose={() => {
          setPermissionDialogOpen(false);
          setEditingPermission(null);
        }}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 550, md: 600 } }
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {editingPermission?.code ? 'Edit Permission' : 'Add New Permission'}
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
            <Stack spacing={2.5}>
              {/* Default Permission Templates */}
              {!editingPermission?.originalCode && (
                <>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Quick Add from Existing Permissions:
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      These are permissions from all programs in the system
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 200, overflowY: 'auto', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      {existingPermissions.map((template) => (
                        <Tooltip
                          key={template.code}
                          title={`${locale === 'ko' ? template.name.ko : template.name.en} - ${locale === 'ko' ? template.description.ko : template.description.en}`}
                          arrow
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleSelectDefaultPermission(template)}
                            sx={{ minWidth: 'auto' }}
                          >
                            {template.code}
                          </Button>
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>
                  <Divider>Or Create Custom</Divider>
                </>
              )}

              {/* Permission Code */}
              <TextField
                label="Permission Code *"
                value={editingPermission?.code || ''}
                onChange={(e) => setEditingPermission(editingPermission ? { ...editingPermission, code: e.target.value.toUpperCase() } : null)}
                fullWidth
                required
                size="small"
                placeholder="e.g., READ, WRITE, DELETE"
                disabled={!!editingPermission?.originalCode}
                helperText={editingPermission?.originalCode ? "Code cannot be changed after creation" : "Use uppercase letters (e.g., READ, WRITE)"}
              />

              <Divider>Names</Divider>

              {/* Name (English) */}
              <TextField
                label="Name (English) *"
                value={editingPermission?.name.en || ''}
                onChange={(e) => setEditingPermission(editingPermission ? { ...editingPermission, name: { ...editingPermission.name, en: e.target.value } } : null)}
                fullWidth
                required
                size="small"
              />

              {/* Name (Korean) */}
              <TextField
                label="Name (Korean) *"
                value={editingPermission?.name.ko || ''}
                onChange={(e) => setEditingPermission(editingPermission ? { ...editingPermission, name: { ...editingPermission.name, ko: e.target.value } } : null)}
                fullWidth
                required
                size="small"
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
                size="small"
              />

              {/* Description (Korean) */}
              <TextField
                label="Description (Korean)"
                value={editingPermission?.description.ko || ''}
                onChange={(e) => setEditingPermission(editingPermission ? { ...editingPermission, description: { ...editingPermission.description, ko: e.target.value } } : null)}
                fullWidth
                multiline
                rows={2}
                size="small"
              />

              <Divider>Options</Divider>

              {/* Is Default */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editingPermission?.isDefault || false}
                    onChange={(e) => setEditingPermission(editingPermission ? { ...editingPermission, isDefault: e.target.checked } : null)}
                  />
                }
                label="Default Permission (granted by default)"
              />
            </Stack>
          </Box>

          {/* Actions */}
          <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setPermissionDialogOpen(false);
                setEditingPermission(null);
              }}
            >
              {t('common.cancel')}
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
              {t('common.save')}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </PageContainer>
  );
}
