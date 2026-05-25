'use client';

import React, { useMemo, useCallback } from 'react';
import { Box, TextField, Button } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import DataShell from '@/components/common/DataShell';
import ExcelDataGrid from '@/components/common/DataGrid';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import MobileCardList from '@/components/mobile/MobileCardList';
import ProgramFormFields from '@/components/admin/ProgramFormFields';
import ProgramMobileCard from './components/ProgramMobileCard';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { useHelp } from '@/hooks/useHelp';
import { useProgramId } from '@/hooks/useProgramId';
import { useMobile } from '@/hooks/useMobile';
import { useProgramManagement } from './hooks/useProgramManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { Program } from './types';

export default function ProgramManagementPage() {
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
    programs,
    setPrograms,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingProgram,
    setEditingProgram,
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
  } = useProgramManagement();

  // Memoized computed values
  const columns = useMemo(() => createColumns(currentLocale, handleEdit, gridPermissions.editable), [currentLocale, handleEdit, gridPermissions.editable]);
  const filterFields = useMemo(() => createFilterFields(t, currentLocale), [t, currentLocale]);
  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const deleteItemsList = useMemo(
    () =>
      selectedForDelete.map((id) => {
        const program = programs.find((p) => p.id === id);
        return program
          ? {
              id: program.id!,
              displayName: `${program.code} (${getLocalizedValue(program.name, currentLocale)})`
            }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, programs, currentLocale]
  );

  // Localized placeholder
  const quickSearchPlaceholder = getLocalizedValue({
    en: 'Search by code or name...',
    ko: '코드 또는 이름으로 검색...',
    zh: '按代码或名称搜索...',
    vi: 'Tìm theo mã hoặc tên...'
  }, currentLocale);

  // Mobile handlers
  const handleMobileEdit = useCallback((program: Program) => {
    handleEdit(program.id!);
  }, [handleEdit]);

  const handleMobileDelete = useCallback((program: Program) => {
    handleDeleteClick([program.id!]);
  }, [handleDeleteClick]);

  // Mobile card renderer
  const renderMobileCard = useCallback((program: Program) => (
    <ProgramMobileCard
      program={program}
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
          breadcrumb={['Admin', '프로그램 관리']}
          title="프로그램 관리"
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
              placeholder={quickSearchPlaceholder}
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleQuickSearch(); }}
              sx={{ width: 300 }}
            />
          }
        >
          {isMobileLayout ? (
            <MobileCardList
              data={programs}
              loading={searching}
              renderCard={renderMobileCard}
              keyExtractor={(program) => program.id!}
              emptyMessage={currentLocale === 'ko' ? '프로그램이 없습니다' : 'No programs found'}
            />
          ) : (
            <ExcelDataGrid
              rows={programs}
              columns={columns}
              onRowsChange={(rows) => setPrograms(rows as Program[])}
              {...(gridPermissions.showAddButton && { onAdd: handleAdd })}
              {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteClick })}
              onRefresh={handleRefresh}
              checkboxSelection={gridPermissions.checkboxSelection}
              editable={gridPermissions.editable}
              exportFileName="programs"
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
          setEditingProgram(null);
        }}
        title={!editingProgram?.id
          ? getLocalizedValue({ en: 'Add New Program', ko: '프로그램 추가', zh: '添加程序', vi: 'Thêm chương trình' }, currentLocale)
          : getLocalizedValue({ en: 'Edit Program', ko: '프로그램 수정', zh: '编辑程序', vi: 'Sửa chương trình' }, currentLocale)
        }
        onSave={handleSave}
        saveLoading={saveLoading}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        width={{ xs: '100%', sm: 600, md: 800, lg: 900 }}
      >
        <ProgramFormFields
          program={editingProgram}
          onChange={setEditingProgram}
          locale={currentLocale}
        />
      </EditDrawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName={getLocalizedValue({ en: 'program', ko: '프로그램', zh: '程序', vi: 'chương trình' }, currentLocale)}
        itemsList={deleteItemsList}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </>
  );
}
