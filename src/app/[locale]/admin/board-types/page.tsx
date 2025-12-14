'use client';

import React, { useMemo, useCallback } from 'react';
import { Box, Paper } from '@mui/material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import MobileCardList from '@/components/mobile/MobileCardList';
import BoardTypeFormFields, { BoardTypeFormData } from '@/components/admin/BoardTypeFormFields';
import BoardTypeStatsDialog from '@/components/admin/BoardTypeStatsDialog';
import BoardTypeMobileCard from './components/BoardTypeMobileCard';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useBoardTypeManagement } from './hooks/useBoardTypeManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { BoardType } from './types';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useHelp } from '@/hooks/useHelp';
import { useProgramId } from '@/hooks/useProgramId';
import { useMobile } from '@/hooks/useMobile';

export default function BoardTypeManagementPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { isMobileLayout } = useMobile();

  // Get programId from DB (menus table)
  const { programId } = useProgramId();

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
    boardTypes,
    setBoardTypes,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    setDialogOpen,
    editingBoardType,
    setEditingBoardType,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    deleteConfirmOpen,
    selectedForDelete,
    deleteLoading,
    successMessage,
    errorMessage,
    statsDialogOpen,
    setStatsDialogOpen,
    selectedBoardTypeStats,
    // Handlers
    handleAdd,
    handleEdit,
    handleSave,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleViewStats,
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange
  } = useBoardTypeManagement();

  // Memoized computed values
  const columns = useMemo(
    () => createColumns(t, currentLocale, handleEdit, handleViewStats, gridPermissions.editable),
    [t, currentLocale, handleEdit, handleViewStats, gridPermissions.editable]
  );
  const filterFields = useMemo(() => createFilterFields(t, currentLocale), [t, currentLocale]);
  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const deleteItemsList = useMemo(
    () =>
      selectedForDelete.map((id) => {
        const boardType = boardTypes.find((bt) => bt.id === id);
        if (!boardType) return { id, displayName: String(id) };

        // Get localized name
        let displayName = '';
        if (boardType.name && typeof boardType.name === 'object') {
          displayName = boardType.name[currentLocale] || boardType.name.en || '';
        } else {
          displayName = boardType[`name_${currentLocale}`] || boardType.name_en || '';
        }

        return {
          id: boardType.id,
          displayName: `${boardType.code} (${displayName})`
        };
      }),
    [selectedForDelete, boardTypes, currentLocale]
  );

  // Mobile handlers
  const handleMobileEdit = useCallback((boardType: BoardType) => {
    handleEdit(boardType.id);
  }, [handleEdit]);

  const handleMobileDelete = useCallback((boardType: BoardType) => {
    handleDeleteClick([boardType.id]);
  }, [handleDeleteClick]);

  const handleMobileViewStats = useCallback((boardType: BoardType) => {
    handleViewStats(boardType.id);
  }, [handleViewStats]);

  // Mobile card renderer
  const renderMobileCard = useCallback((boardType: BoardType) => (
    <BoardTypeMobileCard
      boardType={boardType}
      locale={currentLocale}
      onEdit={gridPermissions.editable ? handleMobileEdit : undefined}
      onDelete={gridPermissions.showDeleteButton ? handleMobileDelete : undefined}
      onViewStats={handleMobileViewStats}
      canEdit={gridPermissions.editable}
      canDelete={gridPermissions.showDeleteButton}
    />
  ), [currentLocale, gridPermissions, handleMobileEdit, handleMobileDelete, handleMobileViewStats]);

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
          locale={currentLocale}
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
      canManageHelp={canManageHelp}
      onHelpEdit={navigateToHelpEdit}
      language={language}
    >
      {isMobileLayout ? (
        // Mobile: Card List
        <MobileCardList
          data={boardTypes}
          loading={searching}
          renderCard={renderMobileCard}
          keyExtractor={(bt) => bt.id}
          emptyMessage={currentLocale === 'ko' ? '게시판 유형이 없습니다' : 'No board types found'}
        />
      ) : (
        // Desktop: DataGrid
        <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ExcelDataGrid
              rows={boardTypes}
              columns={columns}
              onRowsChange={(rows) => setBoardTypes(rows as BoardType[])}
              {...(gridPermissions.showAddButton && { onAdd: handleAdd })}
              {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteClick })}
              onRefresh={handleRefresh}
              checkboxSelection={gridPermissions.checkboxSelection}
              editable={gridPermissions.editable}
              exportFileName="board-types"
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
          setEditingBoardType(null);
        }}
        title={!editingBoardType?.id ? t('common.create') + ' Board Type' : t('common.edit') + ' Board Type'}
        onSave={handleSave}
        saveLoading={saveLoading}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        width={{ xs: '100%', sm: 600, md: 800, lg: 900 }}
      >
        <BoardTypeFormFields
          boardType={editingBoardType as BoardTypeFormData}
          onChange={(boardType) => setEditingBoardType(boardType as BoardType)}
          locale={currentLocale}
        />
      </EditDrawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName="Board Type"
        itemsList={deleteItemsList}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      {/* Stats Dialog */}
      <BoardTypeStatsDialog
        open={statsDialogOpen}
        boardType={selectedBoardTypeStats}
        onClose={() => setStatsDialogOpen(false)}
      />
    </ResponsivePageLayout>
  );
}
