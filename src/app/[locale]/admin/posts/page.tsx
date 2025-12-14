'use client';

import React, { useMemo, useCallback } from 'react';
import { Box, Paper } from '@mui/material';
import { Search } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import MobileCardList from '@/components/mobile/MobileCardList';
import PostViewDialog from '@/components/admin/PostViewDialog';
import PostMobileCard from './components/PostMobileCard';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { usePostManagement } from './hooks/usePostManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { Post } from './types';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useHelp } from '@/hooks/useHelp';
import { useProgramId } from '@/hooks/useProgramId';
import { useMobile } from '@/hooks/useMobile';

export default function PostManagementPage() {
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
    posts,
    setPosts,
    boardTypes,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    deleteConfirmOpen,
    selectedForDelete,
    deleteLoading,
    successMessage,
    errorMessage,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    viewDialogOpen,
    setViewDialogOpen,
    selectedPost,
    // Handlers
    handleView,
    handleEdit,
    handleApprove,
    handlePin,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange
  } = usePostManagement();

  // Memoized computed values
  const columns = useMemo(
    () =>
      createColumns(
        t,
        currentLocale,
        handleEdit,
        handleView,
        handleApprove,
        handlePin,
        gridPermissions.editable
      ),
    [t, currentLocale, handleEdit, handleView, handleApprove, handlePin, gridPermissions.editable]
  );
  const filterFields = useMemo(
    () => createFilterFields(t, currentLocale, boardTypes),
    [t, currentLocale, boardTypes]
  );
  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const deleteItemsList = useMemo(
    () =>
      selectedForDelete.map((id) => {
        const post = posts.find((p) => p.id === id);
        return post
          ? {
              id: post.id,
              displayName: post.title
            }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, posts]
  );

  // Mobile handlers
  const handleMobileView = useCallback((post: Post) => {
    handleView(post);
  }, [handleView]);

  const handleMobileEdit = useCallback((post: Post) => {
    handleEdit(post.id);
  }, [handleEdit]);

  const handleMobileDelete = useCallback((post: Post) => {
    handleDeleteClick([post.id]);
  }, [handleDeleteClick]);

  const handleMobileApprove = useCallback((post: Post) => {
    handleApprove(post);
  }, [handleApprove]);

  const handleMobilePin = useCallback((post: Post) => {
    handlePin(post.id);
  }, [handlePin]);

  // Mobile card renderer
  const renderMobileCard = useCallback((post: Post) => (
    <PostMobileCard
      post={post}
      locale={currentLocale}
      onView={handleMobileView}
      onEdit={gridPermissions.editable ? handleMobileEdit : undefined}
      onDelete={gridPermissions.showDeleteButton ? handleMobileDelete : undefined}
      onApprove={gridPermissions.editable ? handleMobileApprove : undefined}
      onPin={gridPermissions.editable ? handleMobilePin : undefined}
      canEdit={gridPermissions.editable}
      canDelete={gridPermissions.showDeleteButton}
    />
  ), [currentLocale, gridPermissions, handleMobileView, handleMobileEdit, handleMobileDelete, handleMobileApprove, handleMobilePin]);

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
      quickSearchPlaceholder="Search posts by title, author, or content..."
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
          data={posts}
          loading={searching}
          renderCard={renderMobileCard}
          keyExtractor={(post) => post.id}
          emptyMessage={currentLocale === 'ko' ? '게시물이 없습니다' : 'No posts found'}
        />
      ) : (
        // Desktop: DataGrid
        <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          {posts.length === 0 && !searching ? (
            <EmptyState
              icon={Search}
              title="No posts found"
              description="Use the search filters above to find posts"
            />
          ) : (
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <ExcelDataGrid
                rows={posts}
                columns={columns}
                onRowsChange={(rows) => setPosts(rows as Post[])}
                {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteClick })}
                onRefresh={handleRefresh}
                checkboxSelection={gridPermissions.checkboxSelection}
                editable={false}
                exportFileName="posts"
                loading={searching}
                paginationMode="server"
                rowCount={rowCount}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationModelChange}
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName="Post"
        itemsList={deleteItemsList}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      {/* View Dialog */}
      <PostViewDialog
        open={viewDialogOpen}
        post={selectedPost}
        onClose={() => setViewDialogOpen(false)}
        onEdit={handleEdit}
      />
    </ResponsivePageLayout>
  );
}
