'use client';

import React, { useMemo, useCallback } from 'react';
import { Box, TextField, Button } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import DataShell from '@/components/common/DataShell';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import MenuFormFields from '@/components/admin/MenuFormFields';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { useMobile } from '@/hooks/useMobile';
import { useHelp } from '@/hooks/useHelp';
import { useProgramId } from '@/hooks/useProgramId';
import { useMenuManagement } from './hooks/useMenuManagement';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import MenuTreeView from './components/MenuTreeView';
import MenuMobileTreeView from './components/MenuMobileTreeView';
import { Menu } from './types';

export default function MenuManagementPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { isMobileLayout } = useMobile();

  // Get programId from DB (menus table)
  const { programId } = useProgramId();

  const gridPermissions = useDataGridPermissions(programId || '');

  // Use help hook
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
    filteredMenus,
    allMenus,
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
    // Tree-related state
    treeMenus,
    expandedIds,
    selectedIds,
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
    setDialogOpen,
    // Tree-related handlers
    handleToggleExpand,
    handleExpandAll,
    handleCollapseAll,
    handleToggleSelect,
    handleSelectAll,
    handleDeselectAll,
    handleTreeDelete
  } = useMenuManagement({ locale: currentLocale });

  // Mobile handlers
  const handleMobileMenuDelete = useCallback((menu: Menu) => {
    handleDeleteClick([menu.id]);
  }, [handleDeleteClick]);

  const handleMobileMenuEdit = useCallback((menu: Menu) => {
    handleEdit(menu.id);
  }, [handleEdit]);

  // Memoized computed values
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
    <>
      <Box sx={{ px: 4, py: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <PageHeader
          breadcrumb={['Admin', '메뉴 관리']}
          title="메뉴 관리"
          actions={
            gridPermissions.showAddButton ? (
              <Button variant="contained" onClick={() => handleAdd()}>+ Add Menu</Button>
            ) : undefined
          }
        />
        <DataShell
          toolbar={
            <TextField
              size="small"
              placeholder="Search by code, name, path, or icon..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleQuickSearch(); }}
              sx={{ width: 300 }}
            />
          }
        >
          {isMobileLayout ? (
            <MenuMobileTreeView
              menus={filteredMenus}
              allMenus={allMenus}
              locale={currentLocale}
              loading={loading}
              onEdit={gridPermissions.editable ? handleMobileMenuEdit : undefined}
              onDelete={gridPermissions.showDeleteButton ? handleMobileMenuDelete : undefined}
              onAdd={gridPermissions.showAddButton ? handleAdd : undefined}
              onRefresh={handleRefresh}
              canEdit={gridPermissions.editable}
              canDelete={gridPermissions.showDeleteButton}
              canAdd={gridPermissions.showAddButton}
            />
          ) : (
            <MenuTreeView
              menus={treeMenus}
              expandedIds={expandedIds}
              selectedIds={selectedIds}
              locale={currentLocale}
              loading={loading}
              searchQuery={quickSearch}
              onToggleExpand={handleToggleExpand}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onExpandAll={handleExpandAll}
              onCollapseAll={handleCollapseAll}
              onEdit={handleEdit}
              onAdd={handleAdd}
              onDelete={handleTreeDelete}
              onRefresh={handleRefresh}
              canEdit={gridPermissions.editable}
              canDelete={gridPermissions.showDeleteButton}
              canAdd={gridPermissions.showAddButton}
            />
          )}
        </DataShell>
      </Box>

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
    </>
  );
}
