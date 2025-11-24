'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Paper, Button, Alert, Skeleton, Chip, Breadcrumbs, Link, Typography } from '@mui/material';
import { Add, Home } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import EditDrawer from '@/components/common/EditDrawer';
import PostDetailDrawer from '@/components/common/PostDetailDrawer';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import PostFormFields, { PostFormData } from '@/components/boards/PostFormFields';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';
import { useBoardManagement } from './hooks/useBoardManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

export default function BoardListPage() {
  const params = useParams();
  const router = useRouter();
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
    setPosts,
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
    selectedPostId,
    drawerOpen,
    dialogOpen,
    setDialogOpen,
    editingPost,
    setEditingPost,
    saveLoading,
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
    handleSave,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handlePostClick,
    handleCloseDrawer
  } = useBoardManagement({
    storageKey: `board-${boardTypeId}-page-state`,
    boardTypeId,
    boardType
  });

  // Handler functions
  const handleEditPost = async (postId: string) => {
    // Close detail drawer first
    handleCloseDrawer();

    // Fetch the post data
    try {
      const response = await apiClient.get(`/post/${postId}`);
      if (response.success && response.data) {
        const postData = response.data.post || response.data;

        // Normalize the post data for editing
        const normalizedPost = {
          id: postData.id,
          title: postData.title,
          content: postData.content,
          tags: postData.tags || [],
          is_secret: postData.isSecret ?? postData.is_secret ?? false,
          is_pinned: postData.isPinned ?? postData.is_pinned ?? false,
          showPopup: postData.showPopup ?? postData.show_popup ?? false,
          displayStartDate: (postData.displayStartDate ?? postData.display_start_date)
            ? new Date(postData.displayStartDate ?? postData.display_start_date)
            : null,
          displayEndDate: (postData.displayEndDate ?? postData.display_end_date)
            ? new Date(postData.displayEndDate ?? postData.display_end_date)
            : null,
          status: postData.status || 'published'
        };

        // Open edit drawer with the post data
        setEditingPost(normalizedPost as any);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching post for edit:', error);
    }
  };

  const handleDeletePost = async () => {
    // Refresh the post list after deletion
    handleRefresh();
    handleCloseDrawer();
  };

  // Memoized computed values
  const columns = useMemo(() => {
    return createColumns(
      t,
      currentLocale,
      (postId: string) => handlePostClick(postId),
      (postId: string) => handleEditPost(postId),
      canWrite,
      rowCount,
      paginationModel.page,
      paginationModel.pageSize
    );
  }, [t, currentLocale, handlePostClick, handleEditPost, canWrite, rowCount, paginationModel.page, paginationModel.pageSize]);

  const filterFields = useMemo(() => createFilterFields(t, currentLocale), [t, currentLocale]);

  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const boardName = useMemo(() => {
    if (!boardType) return '';
    const nameField = currentLocale === 'ko' ? 'name_ko' : currentLocale === 'zh' ? 'name_zh' : currentLocale === 'vi' ? 'name_vi' : 'name_en';
    return (boardType as any)[nameField] || (boardType as any).name_en || '';
  }, [boardType, currentLocale]);

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
        <Alert severity="error">Board not found</Alert>
      </Box>
    );
  }

  // No read permission
  if (!canRead) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">
          You do not have permission to access this board.
        </Alert>
      </Box>
    );
  }

  return (
    <StandardCrudPageLayout
      // Messages
      successMessage={successMessage}
      errorMessage={errorMessage}
      // Quick Search
      quickSearch={quickSearch}
      onQuickSearchChange={setQuickSearch}
      onQuickSearch={handleQuickSearch}
      onQuickSearchClear={handleQuickSearchClear}
      quickSearchPlaceholder="Search posts by title, content, or author..."
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
    >
      {/* DataGrid Area */}
      <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ExcelDataGrid
            rows={posts}
            columns={columns}
            onRowsChange={(rows) => setPosts(rows as any[])}
            {...(canWrite && { onAdd: handleAdd })}
            {...(canWrite && { onDelete: handleDelete })}
            onRefresh={handleRefresh}
            checkboxSelection={canWrite}
            editable={canWrite}
            exportFileName={`board-${boardTypeId}-posts`}
            loading={searching}
            paginationMode="server"
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            onRowClick={(params) => handlePostClick(params.row.id)}
          />
        </Box>
      </Paper>

      {/* Edit Drawer for Post Creation/Edit */}
      <EditDrawer
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingPost(null);
        }}
        title={!editingPost?.id ? 'Write New Post' : 'Edit Post'}
        onSave={handleSave}
        saveLoading={saveLoading}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        width={{ xs: '100%', sm: 700, md: 900, lg: 1100 }}
      >
        <PostFormFields
          post={editingPost as PostFormData}
          onChange={(post) => setEditingPost(post as any)}
          boardSettings={boardType?.settings}
          mode={editingPost?.id ? 'edit' : 'create'}
          isAdmin={isAdmin}
        />
      </EditDrawer>

      {/* Post Detail Drawer */}
      {selectedPostId && (
        <PostDetailDrawer
          open={drawerOpen}
          onClose={handleCloseDrawer}
          postId={selectedPostId}
          boardTypeId={boardTypeId}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
          canWrite={canWrite}
          boardSettings={boardType?.settings}
        />
      )}

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
        title={t('common.confirmDelete')}
        cancelText={t('common.cancel')}
        confirmText={t('common.delete')}
      />
    </StandardCrudPageLayout>
  );
}
