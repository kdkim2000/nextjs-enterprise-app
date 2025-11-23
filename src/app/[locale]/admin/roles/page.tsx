'use client';

import React, { useMemo, useState, useEffect } from 'react';
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
  Stack,
  Divider,
  CircularProgress,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import { Search, HelpOutline, Close, PersonSearch, Clear } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import HelpViewer from '@/components/common/HelpViewer';
import UserSearchDialog, { User } from '@/components/common/UserSearchDialog';
import CodeSelect from '@/components/common/CodeSelect';
import RouteGuard from '@/components/auth/RouteGuard';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useHelp } from '@/hooks/useHelp';
import { Role } from '@/types/role';
import { useRoleManagement } from './hooks/useRoleManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';

export default function RoleManagementPage() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const gridPermissions = useDataGridPermissions('PROG-ROLE-MGMT');

  // Use help hook
  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    navigateToHelpEdit,
    language
  } = useHelp({ programId: 'PROG-ROLE-MGMT' });

  // User search dialog state
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [userSearchType, setUserSearchType] = useState<'manager' | 'representative' | null>(null);
  const [managerName, setManagerName] = useState<string>('');
  const [representativeName, setRepresentativeName] = useState<string>('');

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
    successMessage,
    errorMessage,
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

  // Initialize user names when editing role
  useEffect(() => {
    if (editingRole) {
      setManagerName(editingRole.managerName || '');
      setRepresentativeName(editingRole.representativeName || '');
    } else {
      setManagerName('');
      setRepresentativeName('');
    }
  }, [editingRole]);

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
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 1, flexShrink: 0 }}>
          {errorMessage}
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
      </Paper>

      {/* Edit Drawer */}
      <Drawer
        anchor="right"
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRole(null);
          setManagerName('');
          setRepresentativeName('');
        }}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 600, md: 700 } }
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {!editingRole?.id ? t('common.create') + ' Roles' : t('common.edit') + ' Roles'}
            </Typography>
            <IconButton
              onClick={() => {
                setDialogOpen(false);
                setEditingRole(null);
                setManagerName('');
                setRepresentativeName('');
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Form */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <Stack spacing={3}>
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
                helperText="Unique identifier (e.g., admin, manager)"
              />

              {/* Display Name */}
              <TextField
                label="Display Name *"
                value={editingRole?.displayName || ''}
                onChange={(e) => setEditingRole(editingRole ? { ...editingRole, displayName: e.target.value } : null)}
                fullWidth
                required
                helperText="User-friendly name shown in UI"
              />

              {/* Description */}
              <TextField
                label="Description"
                value={editingRole?.description || ''}
                onChange={(e) => setEditingRole(editingRole ? { ...editingRole, description: e.target.value } : null)}
                fullWidth
                multiline
                rows={3}
                helperText="Brief description of this role's purpose"
              />

              <Divider />

              {/* Role Type */}
              <CodeSelect
                codeType="ROLE_TYPE"
                value={editingRole?.roleType || 'general'}
                onChange={(value) => setEditingRole(editingRole ? { ...editingRole, roleType: value as 'management' | 'general' } : null)}
                label="Role Type *"
                required
                locale={locale}
                helperText="General: Users can request | Management: Admin-only"
              />

              {/* Manager */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Manager
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<PersonSearch />}
                    onClick={() => {
                      setUserSearchType('manager');
                      setUserSearchOpen(true);
                    }}
                    fullWidth
                  >
                    {managerName || editingRole?.managerName || 'Select Manager'}
                  </Button>
                  {(editingRole?.manager || managerName) && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingRole(editingRole ? { ...editingRole, manager: null, managerName: null } : null);
                        setManagerName('');
                      }}
                    >
                      <Clear />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5, display: 'block' }}>
                  User who manages this role
                </Typography>
              </Box>

              {/* Representative */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Representative
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<PersonSearch />}
                    onClick={() => {
                      setUserSearchType('representative');
                      setUserSearchOpen(true);
                    }}
                    fullWidth
                  >
                    {representativeName || editingRole?.representativeName || 'Select Representative'}
                  </Button>
                  {(editingRole?.representative || representativeName) && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingRole(editingRole ? { ...editingRole, representative: null, representativeName: null } : null);
                        setRepresentativeName('');
                      }}
                    >
                      <Clear />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5, display: 'block' }}>
                  Main contact person for this role
                </Typography>
              </Box>

              <Divider />

              {/* System Role - Switch */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editingRole?.isSystem || false}
                      onChange={(e) => setEditingRole(editingRole ? { ...editingRole, isSystem: e.target.checked } : null)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">System Role</Typography>
                      <Typography variant="caption" color="text.secondary">
                        System roles cannot be deleted
                      </Typography>
                    </Box>
                  }
                />
                {editingRole?.isSystem && (
                  <Chip
                    label="Protected"
                    size="small"
                    color="secondary"
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>

              {/* Active Status - Switch */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editingRole?.isActive !== false}
                      onChange={(e) => setEditingRole(editingRole ? { ...editingRole, isActive: e.target.checked } : null)}
                      color="success"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">Active Status</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Inactive roles cannot be assigned to users
                      </Typography>
                    </Box>
                  }
                />
                <Chip
                  label={editingRole?.isActive !== false ? 'Active' : 'Inactive'}
                  size="small"
                  color={editingRole?.isActive !== false ? 'success' : 'default'}
                  sx={{ ml: 2 }}
                />
              </Box>
            </Stack>
          </Box>

          {/* Actions */}
          <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setDialogOpen(false);
                setEditingRole(null);
                setManagerName('');
                setRepresentativeName('');
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
        itemName="Role"
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
        language={language as 'en' | 'ko'}
        isAdmin={isAdmin}
      />

      {/* User Search Dialog */}
      <UserSearchDialog
        open={userSearchOpen}
        onClose={() => {
          setUserSearchOpen(false);
          setUserSearchType(null);
        }}
        onSelect={(user: User) => {
          if (userSearchType === 'manager') {
            setEditingRole(editingRole ? { ...editingRole, manager: user.id, managerName: user.name } : null);
            setManagerName(user.name);
          } else if (userSearchType === 'representative') {
            setEditingRole(editingRole ? { ...editingRole, representative: user.id, representativeName: user.name } : null);
            setRepresentativeName(user.name);
          }
          setUserSearchOpen(false);
          setUserSearchType(null);
        }}
        title={userSearchType === 'manager' ? 'Select Manager' : 'Select Representative'}
        locale={locale}
        multiSelect={false}
      />
    </PageContainer>
    </RouteGuard>
  );
}
