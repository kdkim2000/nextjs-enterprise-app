'use client';

import React, { useMemo, useCallback } from 'react';
import { Box, Paper } from '@mui/material';
import { Search } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import MobileCardList from '@/components/mobile/MobileCardList';
import MessageFormFields from '@/components/admin/MessageFormFields';
import MessageMobileCard from './components/MessageMobileCard';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { useHelp } from '@/hooks/useHelp';
import { useProgramId } from '@/hooks/useProgramId';
import { useMobile } from '@/hooks/useMobile';
import { useMessageManagement } from './hooks/useMessageManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { Message } from './types';

export default function MessagesPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { isMobileLayout } = useMobile();

  // Get programId from DB (menus table)
  const { programId } = useProgramId();

  const gridPermissions = useDataGridPermissions(programId || '');

  // Use help hook
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
  const columns = useMemo(() => createColumns(currentLocale, handleEdit, gridPermissions.editable), [currentLocale, handleEdit, gridPermissions.editable]);
  const filterFields = useMemo(() => createFilterFields(currentLocale), [currentLocale]);
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
              displayName: `${message.code} (${getLocalizedValue(message.message, currentLocale)})`
            }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, messages, currentLocale]
  );

  // Mobile handlers
  const handleMobileEdit = useCallback((message: Message) => {
    handleEdit(message.id);
  }, [handleEdit]);

  const handleMobileDelete = useCallback((message: Message) => {
    handleDeleteClick([message.id]);
  }, [handleDeleteClick]);

  // Mobile card renderer
  const renderMobileCard = useCallback((message: Message) => (
    <MessageMobileCard
      message={message}
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
      quickSearchPlaceholder="Search by code, category, or message..."
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
      helpExists={helpExists}
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={isAdmin}
      canManageHelp={canManageHelp}
      onHelpEdit={navigateToHelpEdit}
      language={language}
    >
      {isMobileLayout ? (
        // Mobile: Card List
        <MobileCardList
          data={messages}
          loading={searching}
          renderCard={renderMobileCard}
          keyExtractor={(message) => message.id}
          emptyMessage={currentLocale === 'ko' ? '메시지가 없습니다' : 'No messages found'}
        />
      ) : (
        // Desktop: DataGrid
        <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          {messages.length === 0 && !searching ? (
            <EmptyState
              icon={Search}
              title="No messages found"
              description="Use the search above to find messages"
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
      )}

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
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        width={{ xs: '100%', sm: 600, md: 800, lg: 900 }}
      >
        {editingMessage && (
          <MessageFormFields
            data={editingMessage}
            onChange={setEditingMessage}
            mode={editingMessage.id ? 'edit' : 'add'}
            locale={currentLocale}
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
    </ResponsivePageLayout>
  );
}
