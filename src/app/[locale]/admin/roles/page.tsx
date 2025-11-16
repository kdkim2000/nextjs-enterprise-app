'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Alert,
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
import { Search, HelpOutline, Close } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import HelpViewer from '@/components/common/HelpViewer';
import UserSelector from '@/components/common/UserSelector';
import RouteGuard from '@/components/auth/RouteGuard';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { Role } from '@/types/role';
import { useRoleManagement } from './hooks/useRoleManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';

export default function RoleManagementPage() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const gridPermissions = useDataGridPermissions('PROG-ROLE-MGMT');

  // Use custom hook for all business logic
  const {
    // State
    roles,
    setRoles,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    searching,
    saveLoading,
    dialogOpen,
    setDialogOpen,
    editingRole,
    setEditingRole,
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
    handleAdvancedFilterClose
  } = useRoleManagement();

  // Memoized computed values
  const columns = useMemo(() => createColumns(locale, handleEdit, gridPermissions.editable), [locale, handleEdit, gridPermissions.editable]);
  const filterFields = useMemo(() => createFilterFields(locale), [locale]);
  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const deleteItemsList = useMemo(
    () =>
      selectedForDelete.map((id) => {
        const role = roles.find((r) => r.id === id);
        return role
          ? {
              id: role.id,
              displayName: `${role.name} (${role.displayName})`
            }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, roles]
  );

  return (
    <RouteGuard programCode="PROG-ROLE-MGMT" requiredPermission="view" fallbackUrl="/dashboard">
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
              {...(gridPermissions.showAddButton && { onAdd: handleAdd })}
              {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteClick })}
              onRefresh={handleRefresh}
              checkboxSelection={gridPermissions.checkboxSelection}
              editable={gridPermissions.editable}
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
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {!editingRole?.id ? 'Add New Role' : 'Edit Role'}
            </Typography>
            <IconButton
              onClick={() => {
                setDialogOpen(false);
                setEditingRole(null);
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Form */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <Stack spacing={2.5}>
              {/* ID (read-only for edit) */}
              {editingRole?.id && (
                <TextField
                  label="ID"
                  value={editingRole.id}
                  disabled
                  fullWidth
                  size="small"
                />
              )}

              {/* Role Name */}
              <TextField
                label="Role Name *"
                value={editingRole?.name || ''}
                onChange={(e) => setEditingRole(editingRole ? { ...editingRole, name: e.target.value } : null)}
                fullWidth
                required
                size="small"
                helperText="Unique identifier (e.g., ROLE_ADMIN)"
              />

              {/* Display Name */}
              <TextField
                label="Display Name *"
                value={editingRole?.displayName || ''}
                onChange={(e) => setEditingRole(editingRole ? { ...editingRole, displayName: e.target.value } : null)}
                fullWidth
                required
                size="small"
                helperText="User-friendly name"
              />

              {/* Description */}
              <TextField
                label="Description"
                value={editingRole?.description || ''}
                onChange={(e) => setEditingRole(editingRole ? { ...editingRole, description: e.target.value } : null)}
                fullWidth
                multiline
                rows={3}
                size="small"
              />

              <Divider />

              {/* Role Type */}
              <FormControl fullWidth required>
                <InputLabel>Role Type</InputLabel>
                <Select
                  value={editingRole?.roleType || 'general'}
                  label="Role Type"
                  onChange={(e) => setEditingRole(editingRole ? { ...editingRole, roleType: e.target.value as 'management' | 'general' } : null)}
                >
                  <MenuItem value="general">General (일반 역할 - 사용자 신청 가능)</MenuItem>
                  <MenuItem value="management">Management (관리용 역할 - 관리자 전용)</MenuItem>
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5 }}>
                  General: Users can request | Management: Admin-only
                </Typography>
              </FormControl>

              {/* Manager */}
              <UserSelector
                label="Manager"
                value={editingRole?.manager || null}
                onChange={(userId) => setEditingRole(editingRole ? { ...editingRole, manager: userId } : null)}
                helperText="User who manages this role"
              />

              {/* Representative */}
              <UserSelector
                label="Representative"
                value={editingRole?.representative || null}
                onChange={(userId) => setEditingRole(editingRole ? { ...editingRole, representative: userId } : null)}
                helperText="Main contact person for this role"
              />

              <Divider />

              {/* System Role */}
              <FormControl fullWidth>
                <InputLabel>System Role</InputLabel>
                <Select
                  value={editingRole?.isSystem ? 'true' : 'false'}
                  label="System Role"
                  onChange={(e) => setEditingRole(editingRole ? { ...editingRole, isSystem: e.target.value === 'true' } : null)}
                >
                  <MenuItem value="false">Custom</MenuItem>
                  <MenuItem value="true">System</MenuItem>
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5 }}>
                  System roles cannot be deleted
                </Typography>
              </FormControl>

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

          {/* Actions */}
          <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
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
              onClick={() => editingRole && handleSave(editingRole)}
              disabled={saveLoading || !editingRole?.name || !editingRole?.displayName}
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
        itemName="role"
        itemsList={deleteItemsList}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      {/* Help Viewer */}
      <HelpViewer
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        programId="PROG-ROLE-MGMT"
        language="en"
        isAdmin={isAdmin}
      />
    </PageContainer>
    </RouteGuard>
  );
}
