'use client';

import React, { useMemo, useCallback } from 'react';
import { Box, Paper } from '@mui/material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import MobileCardList from '@/components/mobile/MobileCardList';
import HelpFormFields from '@/components/admin/HelpFormFields';
import HelpMobileCard from './components/HelpMobileCard';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useHelpManagement } from './hooks/useHelpManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { HelpContent } from './types';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useProgramId } from '@/hooks/useProgramId';
import { useMobile } from '@/hooks/useMobile';

export default function HelpManagementPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { isMobileLayout } = useMobile();

  // Get programId from DB (menus table)
  const { programId } = useProgramId();

  // Permission control - use programId from DB
  const gridPermissions = useDataGridPermissions(programId || '');

  // Use custom hook for all business logic
  const {
    // State
    helps,
    setHelps,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingHelp,
    setEditingHelp,
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
    setDialogOpen
  } = useHelpManagement();

  // Memoized computed values
  const columns = useMemo(() => createColumns(t, currentLocale, handleEdit, gridPermissions.editable), [t, currentLocale, handleEdit, gridPermissions.editable]);
  const filterFields = useMemo(() => createFilterFields(t, currentLocale), [t, currentLocale]);
  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const deleteItemsList = useMemo(
    () =>
      selectedForDelete.map((id) => {
        const help = helps.find((h) => h.id === id);
        return help
          ? {
              id: help.id,
              displayName: `${help.programId} - ${help.title}`
            }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, helps]
  );

  // Mobile handlers
  const handleMobileEdit = useCallback((help: HelpContent) => {
    handleEdit(help.id);
  }, [handleEdit]);

  const handleMobileDelete = useCallback((help: HelpContent) => {
    handleDeleteClick([help.id]);
  }, [handleDeleteClick]);

  // Mobile card renderer
  const renderMobileCard = useCallback((help: HelpContent) => (
    <HelpMobileCard
      help={help}
      locale={currentLocale}
      onEdit={gridPermissions.editable ? handleMobileEdit : undefined}
      onDelete={gridPermissions.showDeleteButton ? handleMobileDelete : undefined}
      canEdit={gridPermissions.editable}
      canDelete={gridPermissions.showDeleteButton}
    />
  ), [currentLocale, gridPermissions, handleMobileEdit, handleMobileDelete]);

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
      quickSearchPlaceholder="Search by program ID or title..."
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
      programId={programId || ''}
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={isAdmin}
      helpExists={helpExists}
      language={currentLocale}
    >
      {isMobileLayout ? (
        // Mobile: Card List
        <MobileCardList
          data={helps}
          loading={searching}
          renderCard={renderMobileCard}
          keyExtractor={(help) => help.id}
          emptyMessage={currentLocale === 'ko' ? '도움말이 없습니다' : 'No help content found'}
        />
      ) : (
        // Desktop: DataGrid
        <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ExcelDataGrid
              rows={helps}
              columns={columns}
              onRowsChange={(rows) => setHelps(rows as HelpContent[])}
              {...(gridPermissions.showAddButton && { onAdd: handleAdd })}
              {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteClick })}
              onRefresh={handleRefresh}
              checkboxSelection={gridPermissions.checkboxSelection}
              editable={gridPermissions.editable}
              exportFileName="help-content"
              loading={searching}
              paginationMode="server"
              rowCount={rowCount}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
            />
          </Box>
        </Paper>
      )}

      {/* Edit Drawer */}
      <EditDrawer
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingHelp(null);
        }}
        title={!editingHelp?.id ? t('common.create') + ' Help' : t('common.edit') + ' Help'}
        onSave={handleSave}
        saveLoading={saveLoading}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        width={{ xs: '100%', sm: 600, md: 800, lg: 900 }}
      >
        <HelpFormFields
          help={editingHelp}
          onChange={(help) => setEditingHelp(help)}
        />
      </EditDrawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName="Help"
        itemsList={deleteItemsList}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </ResponsivePageLayout>
  );
}
