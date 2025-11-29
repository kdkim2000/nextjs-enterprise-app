'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Box } from '@mui/material';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import PageStateWrapper from '@/components/common/PageStateWrapper';
import BoardListView from '@/components/boards/BoardListView';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';
import { useBoardManagement } from './hooks/useBoardManagement';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { buildSimpleDeleteItemsList } from '@/lib/utils/deleteItemsListBuilder';

export default function BoardListPage() {
  const params = useParams();
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const boardTypeId = params.boardTypeId as string;

  // Board permissions
  const { canWrite, canRead, boardType, loading: permLoading } = useBoardPermissions(boardTypeId);

  // Use custom hook for all business logic
  const {
    posts,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    successMessage,
    errorMessage,
    deleteDialogOpen,
    deleteTargetIds,
    deleteLoading,
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange,
    handleAdd,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handlePostClick
  } = useBoardManagement({
    storageKey: `board-${boardTypeId}-page-state`,
    boardTypeId,
    boardType
  });

  // Selection state for BoardListView
  const [selectedIds, setSelectedIds] = React.useState<(string | number)[]>([]);

  // Memoized computed values
  const filterFields = useMemo(() => createFilterFields(currentLocale), [currentLocale]);

  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  // Build delete items list using utility
  const deleteItemsList = useMemo(
    () => buildSimpleDeleteItemsList(deleteTargetIds, posts, 'title', 'Post'),
    [deleteTargetIds, posts]
  );

  // Handle delete from BoardListView
  const handleDeleteSelected = (ids: (string | number)[]) => {
    handleDelete(ids);
  };

  return (
    <PageStateWrapper
      loading={permLoading}
      skeletonHeight={400}
      notFound={!boardType && !permLoading}
      notFoundMessage={t('common.error')}
      noPermission={!canRead && !permLoading && !!boardType}
      noPermissionMessage={t('common.error')}
    >
      <StandardCrudPageLayout
        // Page Header (consistent with users page)
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
        quickSearchPlaceholder={t('board.searchPlaceholder')}
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
            values={searchCriteria as unknown as Record<string, string | boolean | string[] | undefined>}
            onChange={handleSearchChange as (name: string, value: string | string[]) => void}
            onEnter={handleAdvancedFilterApply}
            locale={currentLocale}
          />
        }
        onFilterApply={handleAdvancedFilterApply}
        onFilterClear={handleQuickSearchClear}
        onFilterClose={handleAdvancedFilterClose}
        // Note: programId is NOT passed to avoid RouteGuard permission check
        // Boards use their own permission system via useBoardPermissions
      >
        {/* Board List View - Optimized for boards */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <BoardListView
            posts={posts}
            loading={searching}
            totalCount={rowCount}
            page={paginationModel.page}
            pageSize={paginationModel.pageSize}
            onPageChange={(newPage) => handlePaginationModelChange({ ...paginationModel, page: newPage })}
            onPageSizeChange={(newPageSize) => handlePaginationModelChange({ page: 0, pageSize: newPageSize })}
            checkboxSelection={canWrite}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onRowClick={handlePostClick}
            onAdd={canWrite ? handleAdd : undefined}
            onDelete={canWrite ? handleDeleteSelected : undefined}
            onRefresh={handleRefresh}
            showRowNumber
            locale={currentLocale}
          />
        </Box>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          itemCount={deleteTargetIds.length}
          itemName="post"
          itemsList={deleteItemsList}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
          title={t('common.confirm')}
          cancelText={t('common.cancel')}
          confirmText={t('common.delete')}
        />
      </StandardCrudPageLayout>
    </PageStateWrapper>
  );
}
