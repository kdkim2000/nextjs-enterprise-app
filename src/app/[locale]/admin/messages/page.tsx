'use client';

import React, { useMemo, use } from 'react';
import { Box, Paper } from '@mui/material';
import { Search } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import MessageFormFields from '@/components/admin/MessageFormFields';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { useMessageManagement } from './hooks/useMessageManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { Message } from './types';

interface MessagesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default function MessagesPage({ params }: MessagesPageProps) {
  const { locale } = use(params);
  const gridPermissions = useDataGridPermissions('PROG-MESSAGE-MGMT');

  // Use custom hook for all business logic
  const {
    // State
    messages,
    setMessages,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingMessage,
    setEditingMessage,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    deleteConfirmOpen,
    selectedForDelete,
    deleteLoading,
    helpOpen,
    setHelpOpen,
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
  } = useMessageManagement();

  // Memoized computed values
  const columns = useMemo(() => createColumns(locale, handleEdit, gridPermissions.editable), [locale, handleEdit, gridPermissions.editable]);
  const filterFields = useMemo(() => createFilterFields(locale), [locale]);
  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const deleteItemsList = useMemo(
    () =>
      selectedForDelete.map((id) => {
        const message = messages.find((m) => m.id === id);
        return message
          ? {
              id: message.id,
              displayName: `${message.code} (${getLocalizedValue(message.message, locale)})`
            }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, messages, locale]
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
      quickSearchPlaceholder={getLocalizedValue({
        en: 'Search by code, category, or message...',
        ko: '코드, 카테고리, 메시지로 검색...',
        zh: '按代码、类别或消息搜索...',
        vi: 'Tìm theo mã, danh mục hoặc tin nhắn...'
      }, locale)}
      searching={searching}
      // Advanced Filter
      showAdvancedFilter
      advancedFilterOpen={advancedFilterOpen}
      onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
      activeFilterCount={activeFilterCount}
      filterTitle={getLocalizedValue({
        en: 'Search / Filter',
        ko: '검색 / 필터',
        zh: '搜索 / 筛选',
        vi: 'Tìm kiếm / Lọc'
      }, locale)}
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
      programId="PROG-MESSAGE-MGMT"
      helpExists={true}
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      language={locale}
    >
      {/* DataGrid Area */}
      <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {messages.length === 0 && !searching ? (
          <EmptyState
            icon={Search}
            title={getLocalizedValue({
              en: 'No messages found',
              ko: '메시지가 없습니다',
              zh: '未找到消息',
              vi: 'Không tìm thấy tin nhắn'
            }, locale)}
            description={getLocalizedValue({
              en: 'Use the search above or add a new message',
              ko: '검색어를 입력하여 메시지를 찾거나 새 메시지를 추가해주세요',
              zh: '使用上面的搜索或添加新消息',
              vi: 'Sử dụng tìm kiếm ở trên hoặc thêm tin nhắn mới'
            }, locale)}
          />
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ExcelDataGrid
              rows={messages}
              columns={columns}
              onRowsChange={(rows) => setMessages(rows as Message[])}
              {...(gridPermissions.showAddButton && { onAdd: handleAdd })}
              {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteClick })}
              onRefresh={handleRefresh}
              checkboxSelection={gridPermissions.checkboxSelection}
              exportFileName="messages"
              loading={searching}
              paginationMode="client"
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
            />
          </Box>
        )}
      </Paper>

      {/* Edit Drawer */}
      <EditDrawer
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingMessage(null);
        }}
        title={!editingMessage?.id ? 'Add New Message' : 'Edit Message'}
        onSave={handleSave}
        saveLoading={saveLoading}
        saveLabel={getLocalizedValue({ en: 'Save', ko: '저장', zh: '保存', vi: 'Lưu' }, locale)}
        cancelLabel={getLocalizedValue({ en: 'Cancel', ko: '취소', zh: '取消', vi: 'Hủy' }, locale)}
      >
        {editingMessage && (
          <MessageFormFields
            data={editingMessage}
            onChange={setEditingMessage}
            mode={editingMessage.id ? 'edit' : 'add'}
            locale={locale}
          />
        )}
      </EditDrawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName="message"
        itemsList={deleteItemsList}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </StandardCrudPageLayout>
  );
}
