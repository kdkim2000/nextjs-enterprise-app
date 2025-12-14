'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Paper, Box } from '@mui/material';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import MobileCardList from '@/components/mobile/MobileCardList';
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
import MenuMobileCard from './components/MenuMobileCard';
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

  // Mobile selection state
  const [mobileSelectedIds, setMobileSelectedIds] = useState<Set<string | number>>(new Set());
  const [mobileSelectionMode, setMobileSelectionMode] = useState(false);

  // Mobile handlers
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
    setMobileSelectedIds(new Set(filteredMenus.map((m) => m.id)));
  }, [filteredMenus]);

  const handleMobileDeselectAll = useCallback(() => {
    setMobileSelectedIds(new Set());
  }, []);

  const handleMobileDeleteSelected = useCallback(() => {
    handleDeleteClick(Array.from(mobileSelectedIds));
  }, [mobileSelectedIds, handleDeleteClick]);

  const handleMobileMenuClick = useCallback((menu: Menu) => {
    if (gridPermissions.editable) {
      handleEdit(menu.id);
    }
  }, [gridPermissions.editable, handleEdit]);

  const handleMobileMenuDelete = useCallback((menu: Menu) => {
    handleDeleteClick([menu.id]);
  }, [handleDeleteClick]);

  const handleMobileMenuEdit = useCallback((menu: Menu) => {
    handleEdit(menu.id);
  }, [handleEdit]);

  const handleMobileAddChild = useCallback((menu: Menu) => {
    handleAdd(menu.id);
  }, [handleAdd]);

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
    <ResponsivePageLayout
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
      programId={programId || ''}
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={isAdmin}
      helpExists={helpExists}
      canManageHelp={canManageHelp}
      onHelpEdit={navigateToHelpEdit}
      language={language}
      // Mobile specific props
      mobileFab={gridPermissions.showAddButton ? {
        onClick: () => handleAdd(null),
        label: t('common.create'),
      } : undefined}
      mobileSelectionMode={mobileSelectionMode}
      mobileSelectedCount={mobileSelectedIds.size}
      mobileTotalCount={filteredMenus.length}
      onMobileSelectionModeToggle={gridPermissions.showDeleteButton ? handleMobileSelectionModeToggle : undefined}
      onMobileSelectAll={handleMobileSelectAll}
      onMobileDeselectAll={handleMobileDeselectAll}
      onMobileDeleteSelected={gridPermissions.showDeleteButton ? handleMobileDeleteSelected : undefined}
    >
      {/* Conditional rendering based on device */}
      {isMobileLayout ? (
        // Mobile: Card List
        <MobileCardList
          data={filteredMenus}
          loading={loading}
          emptyMessage={t('grid.noRows')}
          renderCard={(menu) => (
            <MenuMobileCard
              key={menu.id}
              menu={menu}
              locale={currentLocale}
              allMenus={allMenus}
              onClick={handleMobileMenuClick}
              onEdit={gridPermissions.editable ? handleMobileMenuEdit : undefined}
              onDelete={gridPermissions.showDeleteButton ? handleMobileMenuDelete : undefined}
              onAddChild={gridPermissions.showAddButton ? handleMobileAddChild : undefined}
              selected={mobileSelectedIds.has(menu.id)}
              selectable={mobileSelectionMode}
              onSelectionChange={(selected) => {
                const newIds = new Set(mobileSelectedIds);
                if (selected) {
                  newIds.add(menu.id);
                } else {
                  newIds.delete(menu.id);
                }
                setMobileSelectedIds(newIds);
              }}
              showSwipeActions={!mobileSelectionMode && gridPermissions.editable}
            />
          )}
          keyExtractor={(menu) => menu.id}
          onRefresh={handleMobileRefresh}
        />
      ) : (
        // Desktop: TreeView
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
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
        </Paper>
      )}

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
    </ResponsivePageLayout>
  );
}
