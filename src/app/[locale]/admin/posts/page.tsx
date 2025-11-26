'use client';

import React, { useMemo } from 'react';
import { Box, Paper } from '@mui/material';
import { Search } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import PostViewDialog from '@/components/admin/PostViewDialog';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { usePostManagement } from './hooks/usePostManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { Post } from './types';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useHelp } from '@/hooks/useHelp';
import { useProgramId } from '@/hooks/useProgramId';

export default function PostManagementPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();

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
      {/* DataGrid Area - Flexible */}
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
    </StandardCrudPageLayout>
  );
}
