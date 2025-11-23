'use client';

import React, { useMemo } from 'react';
import { Box, Paper } from '@mui/material';
import { Search } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import MenuFormFields from '@/components/admin/MenuFormFields';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { useHelp } from '@/hooks/useHelp';
import { useMenuManagement } from './hooks/useMenuManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { Menu } from './types';

export default function MenuManagementPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const gridPermissions = useDataGridPermissions('PROG-MENU-MGMT');

  // Use help hook
  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    navigateToHelpEdit,
    language
  } = useHelp({ programId: 'PROG-MENU-MGMT' });

  // Use custom hook for all business logic
  const {
    // State
    filteredMenus,
    allMenus,
    setMenus,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    loading,
    saveLoading,
    dialogOpen,
    editingMenu,
    setEditingMenu,
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
    handleAdvancedSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    setDialogOpen
  } = useMenuManagement({ locale: currentLocale });

  // Memoized computed values
  const columns = useMemo(
    () => createColumns(t, currentLocale, allMenus, handleEdit, gridPermissions.editable),
    [t, currentLocale, allMenus, handleEdit, gridPermissions.editable]
  );

  const filterFields = useMemo(
    () => createFilterFields(t, allMenus, currentLocale),
    [t, allMenus, currentLocale]
  );

  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const deleteItemsList = useMemo(
    () =>
      selectedForDelete.map((id) => {
        const menu = filteredMenus.find((m) => m.id === id);
        return menu
          ? {
              id: menu.id,
              displayName: `${menu.code} - ${getLocalizedValue(menu.name, currentLocale)}`
            }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, filteredMenus, currentLocale]
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
      quickSearchPlaceholder="Search by code, name, path, or icon..."
      searching={loading}
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
      onFilterClear={handleAdvancedSearchClear}
      onFilterClose={handleAdvancedFilterClose}
      // Help
      programId="PROG-MENU-MGMT"
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
        {filteredMenus.length === 0 && !loading ? (
          <EmptyState
            icon={Search}
            title="No menus found"
            description="Start by adding a new menu or loading existing ones"
          />
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ExcelDataGrid
              rows={filteredMenus}
              columns={columns}
              onRowsChange={(rows) => setMenus(rows)}
              {...(gridPermissions.showAddButton && { onAdd: handleAdd })}
              {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteClick })}
              onRefresh={handleRefresh}
              checkboxSelection={gridPermissions.checkboxSelection}
              editable={gridPermissions.editable}
              exportFileName="menus"
              loading={loading}
            />
          </Box>
        )}
      </Paper>

      {/* Edit Drawer */}
      <EditDrawer
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingMenu(null);
        }}
        title={!editingMenu?.id ? 'Add New Menu' : 'Edit Menu'}
        onSave={handleSave}
        saveLoading={saveLoading}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        width={{ xs: '100%', sm: 600, md: 800, lg: 900 }}
      >
        <MenuFormFields
          menu={editingMenu}
          onChange={setEditingMenu}
          allMenus={allMenus}
          locale={currentLocale}
          t={t}
        />
      </EditDrawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName="menu"
        itemsList={deleteItemsList}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </StandardCrudPageLayout>
  );
}
