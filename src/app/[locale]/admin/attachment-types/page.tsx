'use client';

import React, { useMemo } from 'react';
import { Box, Paper } from '@mui/material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import AttachmentTypeFormFields from '@/components/admin/AttachmentTypeFormFields';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { useHelp } from '@/hooks/useHelp';
import { useProgramId } from '@/hooks/useProgramId';
import { useAttachmentTypeManagement } from './hooks/useAttachmentTypeManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { AttachmentType } from './types';

export default function AttachmentTypeManagementPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();

  // Get programId from DB (menus table)
  const { programId, isLoading: programIdLoading } = useProgramId();

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
    attachmentTypes,
    setAttachmentTypes,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingItem,
    setEditingItem,
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
  } = useAttachmentTypeManagement();

  // Memoized computed values
  const columns = useMemo(
    () => createColumns(t, currentLocale, handleEdit, gridPermissions.editable),
    [t, currentLocale, handleEdit, gridPermissions.editable]
  );
  const filterFields = useMemo(
    () => createFilterFields(t, currentLocale),
    [t, currentLocale]
  );
  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const deleteItemsList = useMemo(
    () =>
      selectedForDelete.map((id) => {
        const item = attachmentTypes.find((a) => a.id === id);
        return item
          ? {
              id: item.id!,
              displayName: `${item.code} (${getLocalizedValue(item.name, currentLocale)})`
            }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, attachmentTypes, currentLocale]
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
        en: 'Search by code or name...',
        ko: '코드 또는 이름으로 검색...',
        zh: '按代码或名称搜索...',
        vi: 'Tìm theo mã hoặc tên...'
      }, currentLocale)}
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
      {/* DataGrid Area */}
      <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ExcelDataGrid
            rows={attachmentTypes}
            columns={columns}
            onRowsChange={(rows) => setAttachmentTypes(rows as AttachmentType[])}
            {...(gridPermissions.showAddButton && { onAdd: handleAdd })}
            {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteClick })}
            onRefresh={handleRefresh}
            checkboxSelection={gridPermissions.checkboxSelection}
            editable={gridPermissions.editable}
            exportFileName="attachment-types"
            loading={searching}
            paginationMode="server"
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
          />
        </Box>
      </Paper>

      {/* Edit Drawer */}
      <EditDrawer
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingItem(null);
        }}
        title={!editingItem?.id
          ? `${t('common.create')} ${getLocalizedValue({ en: 'Attachment Type', ko: '첨부파일 종류', zh: '附件类型', vi: 'Loại tệp đính kèm' }, currentLocale)}`
          : `${t('common.edit')} ${getLocalizedValue({ en: 'Attachment Type', ko: '첨부파일 종류', zh: '附件类型', vi: 'Loại tệp đính kèm' }, currentLocale)}`
        }
        onSave={handleSave}
        saveLoading={saveLoading}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        width={{ xs: '100%', sm: 600, md: 800, lg: 900 }}
      >
        <AttachmentTypeFormFields
          data={editingItem as any}
          onChange={setEditingItem as any}
          locale={currentLocale}
        />
      </EditDrawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName={getLocalizedValue({ en: 'Attachment Type', ko: '첨부파일 종류', zh: '附件类型', vi: 'Loại tệp đính kèm' }, currentLocale)}
        itemsList={deleteItemsList}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </StandardCrudPageLayout>
  );
}
