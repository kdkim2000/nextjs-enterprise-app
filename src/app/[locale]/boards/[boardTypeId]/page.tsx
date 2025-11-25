'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Box, Paper, Alert, Skeleton } from '@mui/material';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import PostFormModal from '@/components/boards/PostFormModal';
import BoardListView from '@/components/boards/BoardListView';
import { PostFormData } from '@/components/boards/PostFormFields';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';
import { useBoardManagement } from './hooks/useBoardManagement';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { useAuth } from '@/contexts/AuthContext';

export default function BoardListPage() {
  const params = useParams();
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const boardTypeId = params.boardTypeId as string;
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

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
    modalOpen,
    editingPost,
    setEditingPost,
    saveLoading,
    deleteDialogOpen,
    deleteTargetIds,
    setDeleteTargetIds,
    deleteLoading,
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange,
    handleAdd,
    handleSave,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handlePostClick,
    handleCloseModal
  } = useBoardManagement({
    storageKey: `board-${boardTypeId}-page-state`,
    boardTypeId,
    boardType
  });

  // Selection state for BoardListView
  const [selectedIds, setSelectedIds] = React.useState<(string | number)[]>([]);

  // Memoized computed values
  const filterFields = useMemo(() => createFilterFields(t, currentLocale), [t, currentLocale]);

  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  // Get localized board name
  const boardName = useMemo(() => {
    if (!boardType) return boardTypeId;
    const nameField = `name_${currentLocale}` as keyof typeof boardType;
    return (boardType as any)[nameField] || boardType.name_en || boardTypeId;
  }, [boardType, currentLocale, boardTypeId]);

  // Handle delete from BoardListView
  const handleDeleteSelected = (ids: (string | number)[]) => {
    handleDelete(ids);
  };

  // Loading state
  if (permLoading) {
    return (
      <Box sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  // Board not found
  if (!boardType) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">{t('common.error')}</Alert>
      </Box>
    );
  }

  // No read permission
  if (!canRead) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">{t('common.error')}</Alert>
      </Box>
    );
  }

  return (
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

      {/* Post Form Modal for Creation/Edit */}
      <PostFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        post={editingPost ? {
          id: editingPost.id,
          title: editingPost.title,
          content: editingPost.content || '',
          tags: editingPost.tags,
          isSecret: editingPost.is_secret,
          isPinned: editingPost.is_pinned,
          showPopup: (editingPost as any).showPopup,
          displayStartDate: (editingPost as any).displayStartDate,
          displayEndDate: (editingPost as any).displayEndDate,
          files: (editingPost as any).files
        } : null}
        onChange={(post) => setEditingPost({
          ...editingPost,
          id: post.id,
          title: post.title,
          content: post.content,
          tags: post.tags,
          is_secret: post.isSecret,
          is_pinned: post.isPinned,
          showPopup: post.showPopup,
          displayStartDate: post.displayStartDate,
          displayEndDate: post.displayEndDate,
          files: post.files
        } as any)}
        mode={editingPost?.id ? 'edit' : 'create'}
        saveLoading={saveLoading}
        boardSettings={boardType?.settings}
        isAdmin={isAdmin}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        itemCount={deleteTargetIds.length}
        itemName="post"
        itemsList={deleteTargetIds.map(id => {
          const post = posts.find(p => p.id === id);
          return {
            id,
            displayName: post?.title || `Post ${id}`
          };
        })}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title={t('common.confirm')}
        cancelText={t('common.cancel')}
        confirmText={t('common.delete')}
      />
    </StandardCrudPageLayout>
  );
}
