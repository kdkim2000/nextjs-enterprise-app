'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import InspectionMobileCard from './components/InspectionMobileCard';
import InspectionFormFields from './components/InspectionFormFields';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { useInspectionManagement } from './hooks/useInspectionManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { Inspection } from './types';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useHelp } from '@/hooks/useHelp';
import { useProgramId } from '@/hooks/useProgramId';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export default function InspectionExecutionPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { isMobileLayout } = useMobile();

  const { programId } = useProgramId();
  const gridPermissions = useDataGridPermissions(programId || 'INSPECTION_EXECUTIONS');

  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    navigateToHelpEdit,
    language,
  } = useHelp({ programId: programId || 'INSPECTION_EXECUTIONS' });

  const {
    inspections,
    setInspections,
    templates,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingInspection,
    setEditingInspection,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    deleteConfirmOpen,
    selectedForDelete,
    deleteLoading,
    successMessage,
    errorMessage,
    handleAdd,
    handleEdit,
    handleView,
    handleStartInspection,
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
    setDialogOpen,
  } = useInspectionManagement();

  // Mobile selection state
  const [mobileSelectedIds, setMobileSelectedIds] = useState<Set<string | number>>(new Set());
  const [mobileSelectionMode, setMobileSelectionMode] = useState(false);
  const [mobileHasMore, setMobileHasMore] = useState(true);

  // Mobile handlers
  const handleMobileLoadMore = useCallback(() => {
    if (inspections.length < rowCount) {
      handlePaginationModelChange({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
    } else {
      setMobileHasMore(false);
    }
  }, [inspections.length, rowCount, paginationModel, handlePaginationModelChange]);

  const handleMobileRefresh = useCallback(async () => {
    handleRefresh();
  }, [handleRefresh]);

  const handleMobileSelectionModeToggle = useCallback(() => {
    setMobileSelectionMode((prev) => !prev);
    if (mobileSelectionMode) {
      setMobileSelectedIds(new Set());
    }
  }, [mobileSelectionMode]);

  const handleMobileSelectAll = useCallback(() => {
    setMobileSelectedIds(new Set(inspections.map((i) => i.id)));
  }, [inspections]);

  const handleMobileDeselectAll = useCallback(() => {
    setMobileSelectedIds(new Set());
  }, []);

  const handleMobileDeleteSelected = useCallback(() => {
    handleDeleteClick(Array.from(mobileSelectedIds));
  }, [mobileSelectedIds, handleDeleteClick]);

  const handleMobileInspectionClick = useCallback(
    (inspection: Inspection) => {
      handleView(inspection.id);
    },
    [handleView]
  );

  const handleMobileInspectionDelete = useCallback(
    (inspection: Inspection) => {
      handleDeleteClick([inspection.id]);
    },
    [handleDeleteClick]
  );

  const handleMobileInspectionEdit = useCallback(
    (inspection: Inspection) => {
      handleEdit(inspection.id);
    },
    [handleEdit]
  );

  const handleMobileInspectionStart = useCallback(
    (inspection: Inspection) => {
      handleStartInspection(inspection.id);
    },
    [handleStartInspection]
  );

  // Memoized computed values
  const columns = useMemo(() => {
    return createColumns(
      t,
      currentLocale,
      handleView,
      handleEdit,
      handleStartInspection,
      gridPermissions.editable
    );
  }, [t, currentLocale, handleView, handleEdit, handleStartInspection, gridPermissions.editable]);

  const filterFields = useMemo(
    () => createFilterFields(t, currentLocale, templates),
    [t, currentLocale, templates]
  );

  const activeFilterCount = useMemo(() => calculateActiveFilterCount(searchCriteria), [searchCriteria]);

  const deleteItemsList = useMemo(
    () =>
      selectedForDelete.map((id) => {
        const inspection = inspections.find((i) => i.id === id);
        return inspection
          ? { id: inspection.id, displayName: `${inspection.inspection_code} (${inspection.title})` }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, inspections]
  );

  return (
    <ResponsivePageLayout
      useMenu
      showBreadcrumb
      successMessage={successMessage}
      errorMessage={errorMessage}
      quickSearch={quickSearch}
      onQuickSearchChange={setQuickSearch}
      onQuickSearch={handleQuickSearch}
      onQuickSearchClear={handleQuickSearchClear}
      quickSearchPlaceholder={getLocalizedValue(
        { en: 'Search inspections...', ko: '검사 검색...', zh: '搜索检查...', vi: 'Tìm kiểm tra...' },
        currentLocale
      )}
      searching={searching}
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
      programId={programId || 'INSPECTION_EXECUTIONS'}
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={isAdmin}
      helpExists={helpExists}
      canManageHelp={canManageHelp}
      onHelpEdit={navigateToHelpEdit}
      language={language}
      mobileFab={
        gridPermissions.showAddButton
          ? {
              onClick: handleAdd,
              label: getLocalizedValue({ en: 'New Inspection', ko: '새 검사' }, currentLocale),
            }
          : undefined
      }
      mobileSelectionMode={mobileSelectionMode}
      mobileSelectedCount={mobileSelectedIds.size}
      mobileTotalCount={inspections.length}
      onMobileSelectionModeToggle={gridPermissions.showDeleteButton ? handleMobileSelectionModeToggle : undefined}
      onMobileSelectAll={handleMobileSelectAll}
      onMobileDeselectAll={handleMobileDeselectAll}
      onMobileDeleteSelected={gridPermissions.showDeleteButton ? handleMobileDeleteSelected : undefined}
    >
      {isMobileLayout ? (
        // Mobile: Simple list
        <Box sx={{ bgcolor: 'background.paper', flex: 1, overflow: 'auto' }}>
          {searching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : inspections.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography color="text.secondary">{t('grid.noRows')}</Typography>
            </Box>
          ) : (
            inspections.map((inspection) => (
              <InspectionMobileCard
                key={inspection.id}
                inspection={inspection}
                locale={currentLocale}
                onClick={handleMobileInspectionClick}
                onEdit={gridPermissions.editable ? handleMobileInspectionEdit : undefined}
                onDelete={gridPermissions.showDeleteButton ? handleMobileInspectionDelete : undefined}
                onStart={gridPermissions.editable ? handleMobileInspectionStart : undefined}
                selected={mobileSelectedIds.has(inspection.id)}
                selectable={mobileSelectionMode}
                onSelectionChange={(selected) => {
                  const newIds = new Set(mobileSelectedIds);
                  if (selected) {
                    newIds.add(inspection.id);
                  } else {
                    newIds.delete(inspection.id);
                  }
                  setMobileSelectedIds(newIds);
                }}
              />
            ))
          )}
        </Box>
      ) : (
        <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ExcelDataGrid
              rows={inspections}
              columns={columns}
              onRowsChange={(rows) => setInspections(rows as Inspection[])}
              {...(gridPermissions.showAddButton && { onAdd: handleAdd })}
              {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteClick })}
              onRefresh={handleRefresh}
              checkboxSelection={gridPermissions.checkboxSelection}
              editable={gridPermissions.editable}
              exportFileName="inspections"
              loading={searching}
              paginationMode="server"
              rowCount={rowCount}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
            />
          </Box>
        </Paper>
      )}

      {/* Edit Drawer */}
      <EditDrawer
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingInspection(null);
        }}
        title={
          !editingInspection?.id
            ? getLocalizedValue({ en: 'New Inspection', ko: '새 검사', zh: '新检查', vi: 'Kiểm tra mới' }, currentLocale)
            : getLocalizedValue({ en: 'Edit Inspection', ko: '검사 수정', zh: '编辑检查', vi: 'Sửa kiểm tra' }, currentLocale)
        }
        onSave={handleSave}
        saveLoading={saveLoading}
        saveDisabled={!editingInspection?.template_id || !editingInspection?.title}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        width={{ xs: '100%', sm: 500, md: 600 }}
      >
        {editingInspection && (
          <InspectionFormFields
            inspection={editingInspection}
            onChange={(inspection) => setEditingInspection(inspection)}
            templates={templates}
            locale={currentLocale}
            isNew={!editingInspection.id}
          />
        )}
      </EditDrawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName={getLocalizedValue({ en: 'Inspection', ko: '검사', zh: '检查', vi: 'Kiểm tra' }, currentLocale)}
        itemsList={deleteItemsList}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </ResponsivePageLayout>
  );
}
