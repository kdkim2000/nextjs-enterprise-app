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
import PostFormFields, { PostFormData } from '@/components/boards/PostFormFields';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';
import { useBoardManagement } from './hooks/useBoardManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';

export default function BoardListPage() {
  const params = useParams();
  const router = useRouter();
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const boardTypeId = params.boardTypeId as string;

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
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange,
    handleAdd,
    handleSave,
    handlePostClick,
    handleCloseDrawer
  } = useBoardManagement({
    storageKey: `board-${boardTypeId}-page-state`,
    boardTypeId
  });

  // Memoized computed values
  const columns = useMemo(() => {
    return createColumns(t, currentLocale, (postId: string) => handlePostClick(postId), canWrite);
  }, [t, currentLocale, handlePostClick, canWrite]);

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

  const handleEditPost = (postId: string) => {
    router.push(`/${currentLocale}/boards/${boardTypeId}/${postId}/edit`);
  };

  const handleDeletePost = async () => {
    // Refresh the post list after deletion
    handleRefresh();
    handleCloseDrawer();
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
      // Custom Header
      customHeader={
        <Box sx={{ mb: 3 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              color="inherit"
              onClick={() => router.push(`/${currentLocale}`)}
            >
              <Home sx={{ mr: 0.5 }} fontSize="small" />
              Home
            </Link>
            <Typography color="text.primary">{boardName}</Typography>
          </Breadcrumbs>

          {/* Title and Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {boardName}
              </Typography>
              {boardType.type === 'notice' && (
                <Chip label="Notice Board" size="small" color="error" variant="outlined" />
              )}
            </Box>
            {canWrite && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAdd}
              >
                Write Post
              </Button>
            )}
          </Box>
        </Box>
      }
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
            onRefresh={handleRefresh}
            checkboxSelection={false}
            editable={false}
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
        />
      )}
    </StandardCrudPageLayout>
  );
}
