'use client';

import React, { useMemo, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import { Search } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import UserFormFields, { UserFormData } from '@/components/admin/UserFormFields';
import ResetPasswordDialog from '@/components/admin/ResetPasswordDialog';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useUserManagement } from './hooks/useUserManagement';
import { createColumns, DEPARTMENTS } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { User } from './types';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useHelp } from '@/hooks/useHelp';

export default function UserManagementPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();

  // Permission control
  const gridPermissions = useDataGridPermissions('PROG-USER-LIST');

  // Use common help hook
  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    navigateToHelpEdit,
    language
  } = useHelp({ programId: 'PROG-USER-LIST' });

  // Use custom hook for all business logic
  const {
    // State
    users,
    setUsers,
    allDepartments,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingUser,
    setEditingUser,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    deleteConfirmOpen,
    selectedForDelete,
    deleteLoading,
    successMessage,
    errorMessage,
    resetPasswordDialogOpen,
    resetPasswordUser,
    resetPasswordLoading,
    // Handlers
    handleAdd,
    handleEdit,
    handleSave,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleResetPasswordClick,
    handleResetPasswordConfirm,
    handleResetPasswordCancel,
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange,
    setDialogOpen,
    fetchDepartments
  } = useUserManagement();

  // Load departments on mount
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Memoized computed values
  const columns = useMemo(() => {
    console.log('[UserManagementPage] Creating columns with handleResetPasswordClick:', !!handleResetPasswordClick);
    return createColumns(t, currentLocale, allDepartments, handleEdit, handleResetPasswordClick, gridPermissions.editable);
  }, [t, currentLocale, allDepartments, handleEdit, handleResetPasswordClick, gridPermissions.editable]);
  const filterFields = useMemo(() => createFilterFields(t, currentLocale), [t, currentLocale]);
  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const deleteItemsList = useMemo(
    () =>
      selectedForDelete.map((id) => {
        const user = users.find((u) => u.id === id);
        return user
          ? {
              id: user.id,
              displayName: `${user.username} (${user.name || user.email})`
            }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, users]
  );

  return (
    <StandardCrudPageLayout
      // Page Header
      useMenu
      showBreadcrumb
      // Messages
      successMessage={successMessage}
      errorMessage={errorMessage}
      // Quick Search
      quickSearch={quickSearch}
      onQuickSearchChange={setQuickSearch}
      onQuickSearch={handleQuickSearch}
      onQuickSearchClear={handleQuickSearchClear}
      quickSearchPlaceholder="Search by username, name, or email..."
      searching={searching}
      // Advanced Filter
      showAdvancedFilter
      advancedFilterOpen={advancedFilterOpen}
      onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
      activeFilterCount={activeFilterCount}
      filterTitle={`${t('common.search')} / ${t('common.filter')}`}
      filterContent={
        <SearchFilterFields
          fields={filterFields}
          values={searchCriteria}
          onChange={handleSearchChange}
          onEnter={handleAdvancedFilterApply}
        />
      }
      onFilterApply={handleAdvancedFilterApply}
      onFilterClear={handleQuickSearchClear}
      onFilterClose={handleAdvancedFilterClose}
      // Help
      programId="PROG-USER-LIST"
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={isAdmin}
      helpExists={helpExists}
      canManageHelp={canManageHelp}
      onHelpEdit={navigateToHelpEdit}
      language={language}
    >
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
              {...(gridPermissions.showAddButton && { onAdd: handleAdd })}
              {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteClick })}
              onRefresh={handleRefresh}
              checkboxSelection={gridPermissions.checkboxSelection}
              editable={gridPermissions.editable}
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
      <EditDrawer
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingUser(null);
        }}
        title={!editingUser?.id ? 'Add New User' : 'Edit User'}
        onSave={handleSave}
        saveLoading={saveLoading}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
      >
        <UserFormFields
          user={editingUser as UserFormData}
          onChange={(user) => setEditingUser(user as User)}
          usernameLabel={t('auth.username')}
          emailLabel={t('auth.email')}
          departments={allDepartments}
          locale={currentLocale}
        />
      </EditDrawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName="user"
        itemsList={deleteItemsList}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        user={resetPasswordUser}
        loading={resetPasswordLoading}
        onConfirm={handleResetPasswordConfirm}
        onCancel={handleResetPasswordCancel}
      />
    </StandardCrudPageLayout>
  );
}
