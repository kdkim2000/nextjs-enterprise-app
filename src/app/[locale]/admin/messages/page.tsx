'use client';

import React, { useMemo } from 'react';
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
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { useHelp } from '@/hooks/useHelp';
import { useMessageManagement } from './hooks/useMessageManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { Message } from './types';

export default function MessagesPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const gridPermissions = useDataGridPermissions('PROG-MESSAGE-MGMT');

  // Use help hook
  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    navigateToHelpEdit,
    language
  } = useHelp({ programId: 'PROG-MESSAGE-MGMT' });

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
      programId="PROG-MESSAGE-MGMT"
      helpExists={helpExists}
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={isAdmin}
      canManageHelp={canManageHelp}
      onHelpEdit={navigateToHelpEdit}
      language={language}
    >
      {/* DataGrid Area */}
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
    </StandardCrudPageLayout>
  );
}
