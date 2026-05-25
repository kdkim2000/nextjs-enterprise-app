'use client';

import React, { useMemo, useCallback } from 'react';
import { Box, TextField, Button } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import DataShell from '@/components/common/DataShell';
import ExcelDataGrid from '@/components/common/DataGrid';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import MobileCardList from '@/components/mobile/MobileCardList';
import AttachmentTypeFormFields from '@/components/admin/AttachmentTypeFormFields';
import AttachmentTypeMobileCard from './components/AttachmentTypeMobileCard';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { useHelp } from '@/hooks/useHelp';
import { useProgramId } from '@/hooks/useProgramId';
import { useMobile } from '@/hooks/useMobile';
import { useAttachmentTypeManagement } from './hooks/useAttachmentTypeManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { AttachmentType } from './types';

export default function AttachmentTypeManagementPage() {
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

  // Mobile handlers
  const handleMobileEdit = useCallback((item: AttachmentType) => {
    handleEdit(item.id!);
  }, [handleEdit]);

  const handleMobileDelete = useCallback((item: AttachmentType) => {
    handleDeleteClick([item.id!]);
  }, [handleDeleteClick]);

  // Mobile card renderer
  const renderMobileCard = useCallback((item: AttachmentType) => (
    <AttachmentTypeMobileCard
      attachmentType={item}
      locale={currentLocale}
      onEdit={gridPermissions.editable ? handleMobileEdit : undefined}
      onDelete={gridPermissions.showDeleteButton ? handleMobileDelete : undefined}
      canEdit={gridPermissions.editable}
      canDelete={gridPermissions.showDeleteButton}
    />
  ), [currentLocale, gridPermissions, handleMobileEdit, handleMobileDelete]);

  return (
    <>
      <Box sx={{ px: 4, py: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <PageHeader
          breadcrumb={['Admin', '첨부파일 종류']}
          title="첨부파일 종류 관리"
          actions={
            gridPermissions.showAddButton ? (
              <Button variant="contained" onClick={handleAdd}>
                + {getLocalizedValue({ en: 'Add', ko: '추가', zh: '添加', vi: 'Thêm' }, currentLocale)}
              </Button>
            ) : undefined
          }
        />
        <DataShell
          toolbar={
            <TextField
              size="small"
              placeholder={getLocalizedValue({
                en: 'Search by code or name...',
                ko: '코드 또는 이름으로 검색...',
                zh: '按代码或名称搜索...',
                vi: 'Tìm theo mã hoặc tên...'
              }, currentLocale)}
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleQuickSearch(); }}
              sx={{ width: 300 }}
            />
          }
        >
          {isMobileLayout ? (
            <MobileCardList
              data={attachmentTypes}
              loading={searching}
              renderCard={renderMobileCard}
              keyExtractor={(item) => item.id!}
              emptyMessage={currentLocale === 'ko' ? '첨부파일 종류가 없습니다' : 'No attachment types found'}
            />
          ) : (
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
          )}
        </DataShell>
      </Box>

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
    </>
  );
}
