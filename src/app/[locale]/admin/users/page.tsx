'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Box, TextField, Button } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import DataShell from '@/components/common/DataShell';
import ExcelDataGrid from '@/components/common/DataGrid';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import MobileCardList from '@/components/mobile/MobileCardList';
import UserMobileCard from './components/UserMobileCard';
import UserFormFields, { UserFormData } from '@/components/admin/UserFormFields';
import ResetPasswordDialog from '@/components/admin/ResetPasswordDialog';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { useUserManagement } from './hooks/useUserManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { User } from './types';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useHelp } from '@/hooks/useHelp';
import { useProgramId } from '@/hooks/useProgramId';

export default function UserManagementPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { isMobileLayout } = useMobile();

  // Get programId from DB (menus table)
  const { programId, isLoading: programIdLoading } = useProgramId();

  // Permission control - use programId from DB
  const gridPermissions = useDataGridPermissions(programId || '');

  // Use common help hook
  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    navigateToHelpEdit,
    language
  } = useHelp({ programId: programId || '' });

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
    formIsValid,
    // Handlers
    handleAdd,
    handleEdit,
    handleSave,
    handleValidationChange,
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
    handleToggleField,
    handleRowUpdate,
    setDialogOpen
  } = useUserManagement();

  // Mobile selection state
  const [mobileSelectedIds, setMobileSelectedIds] = useState<Set<string | number>>(new Set());
  const [mobileSelectionMode, setMobileSelectionMode] = useState(false);
  const [mobileHasMore, setMobileHasMore] = useState(true);

  // Mobile handlers
  const handleMobileLoadMore = useCallback(() => {
    if (users.length < rowCount) {
      handlePaginationModelChange({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
    } else {
      setMobileHasMore(false);
    }
  }, [users.length, rowCount, paginationModel, handlePaginationModelChange]);

  const handleMobileRefresh = useCallback(async () => {
    handleRefresh();
  }, [handleRefresh]);

  const handleMobileSelectionModeToggle = useCallback(() => {
    setMobileSelectionMode((prev) => !prev);
    if (mobileSelectionMode) {
      setMobileSelectedIds(new Set());
    }
  }, [mobileSelectionMode]);

  const handleMobileSelectAll = useCallback(() => {
    setMobileSelectedIds(new Set(users.map((u) => u.id)));
  }, [users]);

  const handleMobileDeselectAll = useCallback(() => {
    setMobileSelectedIds(new Set());
  }, []);

  const handleMobileDeleteSelected = useCallback(() => {
    handleDeleteClick(Array.from(mobileSelectedIds));
  }, [mobileSelectedIds, handleDeleteClick]);

  const handleMobileUserClick = useCallback((user: User) => {
    if (gridPermissions.editable) {
      handleEdit(user.id);
    }
  }, [gridPermissions.editable, handleEdit]);

  const handleMobileUserDelete = useCallback((user: User) => {
    handleDeleteClick([user.id]);
  }, [handleDeleteClick]);

  const handleMobileUserEdit = useCallback((user: User) => {
    handleEdit(user.id);
  }, [handleEdit]);

  const handleMobileResetPassword = useCallback((user: User) => {
    handleResetPasswordClick(user.id);
  }, [handleResetPasswordClick]);

  // Memoized computed values
  const columns = useMemo(() => {
    return createColumns(t, currentLocale, allDepartments, handleEdit, handleResetPasswordClick, gridPermissions.editable, handleToggleField);
  }, [t, currentLocale, allDepartments, handleEdit, handleResetPasswordClick, gridPermissions.editable, handleToggleField]);

  const filterFields = useMemo(() => createFilterFields(t, currentLocale, allDepartments), [t, currentLocale, allDepartments]);

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
              displayName: `${user.loginid || user.username} (${user.name_ko || user.name || user.email})`
            }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, users]
  );

  return (
    <>
      <Box sx={{ px: 4, py: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <PageHeader
          breadcrumb={['Admin', '사용자 관리']}
          title="사용자 관리"
          actions={
            gridPermissions.showAddButton ? (
              <Button variant="contained" onClick={handleAdd}>
                + {t('common.create')}
              </Button>
            ) : undefined
          }
        />
        <DataShell
          toolbar={
            <TextField
              size="small"
              placeholder="Search by login ID, name, email, or employee #..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleQuickSearch(); }}
              sx={{ width: 320 }}
            />
          }
        >
          {isMobileLayout ? (
            <MobileCardList
              data={users}
              loading={searching}
              emptyMessage={t('grid.noRows')}
              renderCard={(user, index) => (
                <UserMobileCard
                  key={user.id}
                  user={user}
                  locale={currentLocale}
                  departments={allDepartments}
                  onClick={handleMobileUserClick}
                  onEdit={gridPermissions.editable ? handleMobileUserEdit : undefined}
                  onDelete={gridPermissions.showDeleteButton ? handleMobileUserDelete : undefined}
                  onResetPassword={gridPermissions.editable ? handleMobileResetPassword : undefined}
                  selected={mobileSelectedIds.has(user.id)}
                  selectable={mobileSelectionMode}
                  onSelectionChange={(selected) => {
                    const newIds = new Set(mobileSelectedIds);
                    if (selected) {
                      newIds.add(user.id);
                    } else {
                      newIds.delete(user.id);
                    }
                    setMobileSelectedIds(newIds);
                  }}
                  showSwipeActions={!mobileSelectionMode && gridPermissions.editable}
                />
              )}
              keyExtractor={(user) => user.id}
              hasMore={mobileHasMore}
              onLoadMore={handleMobileLoadMore}
              onRefresh={handleMobileRefresh}
            />
          ) : (
            <ExcelDataGrid
              rows={users}
              columns={columns}
              onRowsChange={(rows) => setUsers(rows as User[])}
              {...(gridPermissions.showAddButton && { onAdd: handleAdd })}
              {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteClick })}
              {...(gridPermissions.editable && { onEdit: handleEdit })}
              {...(gridPermissions.editable && { onRowUpdate: handleRowUpdate })}
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
          )}
        </DataShell>
      </Box>

      {/* Edit Drawer */}
      <EditDrawer
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingUser(null);
        }}
        title={!editingUser?.id ? t('common.create') + ' Users' : t('common.edit') + ' Users'}
        onSave={handleSave}
        saveLoading={saveLoading}
        saveDisabled={!editingUser?.id && !formIsValid}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        width={{ xs: '100%', sm: 600, md: 800, lg: 900 }}
      >
        <UserFormFields
          user={editingUser as UserFormData}
          onChange={(user) => setEditingUser(user as User)}
          onValidationChange={handleValidationChange}
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
        itemName="User"
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
    </>
  );
}
