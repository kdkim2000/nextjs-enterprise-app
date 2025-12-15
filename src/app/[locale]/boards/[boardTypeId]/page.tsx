'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Box, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import PageStateWrapper from '@/components/common/PageStateWrapper';
import BoardListView from '@/components/boards/BoardListView';
import MobileCardList from '@/components/mobile/MobileCardList';
import BoardMobileCard from './components/BoardMobileCard';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';
import { useBoardManagement } from './hooks/useBoardManagement';
import { useMobile } from '@/hooks/useMobile';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { buildSimpleDeleteItemsList } from '@/lib/utils/deleteItemsListBuilder';

export default function BoardListPage() {
  const params = useParams();
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const boardTypeId = params.boardTypeId as string;
  const { isMobileLayout } = useMobile();

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

  // Selection state
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [mobileSelectedIds, setMobileSelectedIds] = useState<Set<string | number>>(new Set());
  const [mobileSelectionMode, setMobileSelectionMode] = useState(false);

  // Mobile infinite scroll state
  const [mobileHasMore, setMobileHasMore] = useState(true);

  // Mobile handlers
  const handleMobileLoadMore = useCallback(() => {
    if (posts.length < rowCount) {
      handlePaginationModelChange({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
    } else {
      setMobileHasMore(false);
    }
  }, [posts.length, rowCount, paginationModel, handlePaginationModelChange]);

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
    setMobileSelectedIds(new Set(posts.map((p) => p.id)));
  }, [posts]);

  const handleMobileDeselectAll = useCallback(() => {
    setMobileSelectedIds(new Set());
  }, []);

  const handleMobileDeleteSelected = useCallback(() => {
    handleDelete(Array.from(mobileSelectedIds));
  }, [mobileSelectedIds, handleDelete]);

  const handleMobilePostDelete = useCallback((post: { id: string }) => {
    handleDelete([post.id]);
  }, [handleDelete]);

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
      <ResponsivePageLayout
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
        // Mobile specific props
        mobileFab={canWrite ? {
          onClick: handleAdd,
          label: t('common.create'),
        } : undefined}
        mobileSelectionMode={mobileSelectionMode}
        mobileSelectedCount={mobileSelectedIds.size}
        mobileTotalCount={posts.length}
        onMobileSelectionModeToggle={canWrite ? handleMobileSelectionModeToggle : undefined}
        onMobileSelectAll={handleMobileSelectAll}
        onMobileDeselectAll={handleMobileDeselectAll}
        onMobileDeleteSelected={canWrite ? handleMobileDeleteSelected : undefined}
      >
        {/* Conditional rendering based on device */}
        {isMobileLayout ? (
          // Mobile: Card List with infinite scroll
          <MobileCardList
            data={posts}
            loading={searching}
            emptyMessage={t('board.noPosts')}
            renderCard={(post, index) => (
              <BoardMobileCard
                key={post.id}
                post={post}
                rowNumber={paginationModel.page * paginationModel.pageSize + index + 1}
                onClick={(post) => handlePostClick(post.id)}
                onDelete={canWrite ? handleMobilePostDelete : undefined}
                selected={mobileSelectedIds.has(post.id)}
                selectable={mobileSelectionMode}
                onSelectionChange={(selected) => {
                  const newIds = new Set(mobileSelectedIds);
                  if (selected) {
                    newIds.add(post.id);
                  } else {
                    newIds.delete(post.id);
                  }
                  setMobileSelectedIds(newIds);
                }}
                locale={currentLocale}
                showSwipeActions={!mobileSelectionMode && canWrite}
              />
            )}
            keyExtractor={(post) => post.id}
            hasMore={mobileHasMore}
            onLoadMore={handleMobileLoadMore}
            onRefresh={handleMobileRefresh}
          />
        ) : (
          // Desktop: Board List View with DataGrid
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
        )}

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
      </ResponsivePageLayout>
    </PageStateWrapper>
  );
}
