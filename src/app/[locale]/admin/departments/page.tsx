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
import DepartmentFormFields, { DepartmentFormData } from '@/components/admin/DepartmentFormFields';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useDepartmentManagement } from './hooks/useDepartmentManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { Department } from './types';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useHelp } from '@/hooks/useHelp';

export default function DepartmentsPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();

  // Permission control
  const gridPermissions = useDataGridPermissions('PROG-DEPT-MGMT');

  // Use common help hook
  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    navigateToHelpEdit,
    language
  } = useHelp({ programId: 'PROG-DEPT-MGMT' });

  // Use custom hook for all business logic
  const {
    // State
    departments,
    setDepartments,
    allUsers,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingDepartment,
    setEditingDepartment,
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
    handleAdvancedFilterClose,
    handlePaginationModelChange,
    setDialogOpen,
    fetchUsers,
    fetchDepartments
  } = useDepartmentManagement();

  // Fetch users on mount for manager dropdown
  useEffect(() => {
    void fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoized computed values
  const columns = useMemo(
    () => createColumns(t, currentLocale, departments, allUsers, handleEdit, gridPermissions.editable),
    [t, currentLocale, departments, allUsers, handleEdit, gridPermissions.editable]
  );

  const filterFields = useMemo(
    () => createFilterFields(t, departments, allUsers, currentLocale),
    [t, departments, allUsers, currentLocale]
  );

  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const deleteItemsList = useMemo(
    () =>
      selectedForDelete.map((id) => {
        const department = departments.find((d) => d.id === id);
        return department
          ? {
              id: department.id,
              displayName: `${department.code} (${currentLocale === 'ko' ? department.name?.ko : department.name?.en})`
            }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, departments, currentLocale]
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
      quickSearchPlaceholder="Search by code or name..."
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
      programId="PROG-DEPT-MGMT"
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
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ExcelDataGrid
            rows={departments}
            columns={columns}
            onRowsChange={(rows) => setDepartments(rows as Department[])}
            {...(gridPermissions.showAddButton && { onAdd: handleAdd })}
            {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteClick })}
            onRefresh={handleRefresh}
            checkboxSelection={gridPermissions.checkboxSelection}
            editable={gridPermissions.editable}
            exportFileName="departments"
            loading={searching}
            paginationMode="server"
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
          />
        </Box>
      </Paper>

      {/* Edit Drawer */}
      <EditDrawer
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingDepartment(null);
        }}
        title={!editingDepartment?.id ? t('common.create') + ' Department' : t('common.edit') + ' Department'}
        onSave={handleSave}
        saveLoading={saveLoading}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        width={{ xs: '100%', sm: 600, md: 800, lg: 900 }}
      >
        <DepartmentFormFields
          department={editingDepartment as DepartmentFormData}
          onChange={(dept) => setEditingDepartment(dept as DepartmentFormData)}
          departments={departments}
          locale={currentLocale}
          labels={{
            code: t('fields.code'),
            nameEn: t('fields.nameEn'),
            nameKo: t('fields.nameKo'),
            descriptionEn: t('fields.descriptionEn'),
            descriptionKo: t('fields.descriptionKo'),
            parentDepartment: t('fields.parentDepartment'),
            manager: t('fields.manager'),
            status: t('fields.status'),
            order: t('fields.order'),
            none: t('fields.none')
          }}
        />
      </EditDrawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName="Department"
        itemsList={deleteItemsList}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </StandardCrudPageLayout>
  );
}
