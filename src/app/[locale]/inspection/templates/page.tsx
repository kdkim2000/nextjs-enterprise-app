'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Box, Paper } from '@mui/material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import MobileCardList from '@/components/mobile/MobileCardList';
import TemplateMobileCard from './components/TemplateMobileCard';
import TemplateFormFields from './components/TemplateFormFields';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { useTemplateManagement } from './hooks/useTemplateManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { ChecksheetTemplate } from './types';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useHelp } from '@/hooks/useHelp';
import { useProgramId } from '@/hooks/useProgramId';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export default function TemplateManagementPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { isMobileLayout } = useMobile();

  // Get programId from DB
  const { programId } = useProgramId();

  // Permission control
  const gridPermissions = useDataGridPermissions(programId || 'INSPECTION_TEMPLATES');

  // Use common help hook
  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    navigateToHelpEdit,
    language,
  } = useHelp({ programId: programId || 'INSPECTION_TEMPLATES' });

  // Use custom hook for all business logic
  const {
    templates,
    setTemplates,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingTemplate,
    setEditingTemplate,
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
    handleClone,
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
  } = useTemplateManagement();

  // Mobile selection state
  const [mobileSelectedIds, setMobileSelectedIds] = useState<Set<string | number>>(new Set());
  const [mobileSelectionMode, setMobileSelectionMode] = useState(false);
  const [mobileHasMore, setMobileHasMore] = useState(true);

  // Mobile handlers
  const handleMobileLoadMore = useCallback(() => {
    if (templates.length < rowCount) {
      handlePaginationModelChange({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
    } else {
      setMobileHasMore(false);
    }
  }, [templates.length, rowCount, paginationModel, handlePaginationModelChange]);

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
    setMobileSelectedIds(new Set(templates.map((t) => t.id)));
  }, [templates]);

  const handleMobileDeselectAll = useCallback(() => {
    setMobileSelectedIds(new Set());
  }, []);

  const handleMobileDeleteSelected = useCallback(() => {
    handleDeleteClick(Array.from(mobileSelectedIds));
  }, [mobileSelectedIds, handleDeleteClick]);

  const handleMobileTemplateClick = useCallback(
    (template: ChecksheetTemplate) => {
      if (gridPermissions.editable) {
        handleView(template.id);
      }
    },
    [gridPermissions.editable, handleView]
  );

  const handleMobileTemplateDelete = useCallback(
    (template: ChecksheetTemplate) => {
      handleDeleteClick([template.id]);
    },
    [handleDeleteClick]
  );

  const handleMobileTemplateEdit = useCallback(
    (template: ChecksheetTemplate) => {
      handleEdit(template.id);
    },
    [handleEdit]
  );

  const handleMobileTemplateClone = useCallback(
    (template: ChecksheetTemplate) => {
      handleClone(template.id);
    },
    [handleClone]
  );

  // Memoized computed values
  const columns = useMemo(() => {
    return createColumns(
      t,
      currentLocale,
      handleEdit,
      handleView,
      gridPermissions.editable ? handleClone : undefined,
      gridPermissions.editable
    );
  }, [t, currentLocale, handleEdit, handleView, handleClone, gridPermissions.editable]);

  const filterFields = useMemo(() => createFilterFields(t, currentLocale), [t, currentLocale]);

  const activeFilterCount = useMemo(() => calculateActiveFilterCount(searchCriteria), [searchCriteria]);

  const deleteItemsList = useMemo(
    () =>
      selectedForDelete.map((id) => {
        const template = templates.find((t) => t.id === id);
        return template
          ? { id: template.id, displayName: `${template.code} (${template.name})` }
          : { id, displayName: String(id) };
      }),
    [selectedForDelete, templates]
  );

  const pageTitle = getLocalizedValue(
    { en: 'Checksheet Templates', ko: '체크시트 템플릿', zh: '检查表模板', vi: 'Mẫu kiểm tra' },
    currentLocale
  );

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
      quickSearchPlaceholder={getLocalizedValue(
        { en: 'Search by code or name...', ko: '코드 또는 이름으로 검색...', zh: '按代码或名称搜索...', vi: 'Tìm theo mã hoặc tên...' },
        currentLocale
      )}
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
      programId={programId || 'INSPECTION_TEMPLATES'}
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={isAdmin}
      helpExists={helpExists}
      canManageHelp={canManageHelp}
      onHelpEdit={navigateToHelpEdit}
      language={language}
      // Mobile specific props
      mobileFab={
        gridPermissions.showAddButton
          ? {
              onClick: handleAdd,
              label: t('common.create'),
            }
          : undefined
      }
      mobileSelectionMode={mobileSelectionMode}
      mobileSelectedCount={mobileSelectedIds.size}
      mobileTotalCount={templates.length}
      onMobileSelectionModeToggle={gridPermissions.showDeleteButton ? handleMobileSelectionModeToggle : undefined}
      onMobileSelectAll={handleMobileSelectAll}
      onMobileDeselectAll={handleMobileDeselectAll}
      onMobileDeleteSelected={gridPermissions.showDeleteButton ? handleMobileDeleteSelected : undefined}
    >
      {/* Conditional rendering based on device */}
      {isMobileLayout ? (
        // Mobile: Card List with infinite scroll
        <MobileCardList
          data={templates}
          loading={searching}
          emptyMessage={t('grid.noRows')}
          renderCard={(template, index) => (
            <TemplateMobileCard
              key={template.id}
              template={template}
              locale={currentLocale}
              onClick={handleMobileTemplateClick}
              onEdit={gridPermissions.editable ? handleMobileTemplateEdit : undefined}
              onDelete={gridPermissions.showDeleteButton ? handleMobileTemplateDelete : undefined}
              onClone={gridPermissions.editable ? handleMobileTemplateClone : undefined}
              selected={mobileSelectedIds.has(template.id)}
              selectable={mobileSelectionMode}
              onSelectionChange={(selected) => {
                const newIds = new Set(mobileSelectedIds);
                if (selected) {
                  newIds.add(template.id);
                } else {
                  newIds.delete(template.id);
                }
                setMobileSelectedIds(newIds);
              }}
              showSwipeActions={!mobileSelectionMode && gridPermissions.editable}
            />
          )}
          keyExtractor={(template) => template.id}
          hasMore={mobileHasMore}
          onLoadMore={handleMobileLoadMore}
          onRefresh={handleMobileRefresh}
        />
      ) : (
        // Desktop: DataGrid Area
        <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ExcelDataGrid
              rows={templates}
              columns={columns}
              onRowsChange={(rows) => setTemplates(rows as ChecksheetTemplate[])}
              {...(gridPermissions.showAddButton && { onAdd: handleAdd })}
              {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteClick })}
              {...(gridPermissions.editable && { onEdit: handleEdit })}
              onRefresh={handleRefresh}
              checkboxSelection={gridPermissions.checkboxSelection}
              editable={gridPermissions.editable}
              exportFileName="checksheet-templates"
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
          setEditingTemplate(null);
        }}
        title={
          !editingTemplate?.id
            ? getLocalizedValue({ en: 'Create Template', ko: '템플릿 생성', zh: '创建模板', vi: 'Tạo mẫu' }, currentLocale)
            : getLocalizedValue({ en: 'Edit Template', ko: '템플릿 수정', zh: '编辑模板', vi: 'Sửa mẫu' }, currentLocale)
        }
        onSave={handleSave}
        saveLoading={saveLoading}
        saveDisabled={!editingTemplate?.code || !editingTemplate?.name}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        width={{ xs: '100%', sm: 500, md: 600 }}
      >
        {editingTemplate && (
          <TemplateFormFields
            template={editingTemplate}
            onChange={(template) => setEditingTemplate(template)}
            locale={currentLocale}
            isNew={!editingTemplate.id}
          />
        )}
      </EditDrawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName={getLocalizedValue({ en: 'Template', ko: '템플릿', zh: '模板', vi: 'Mẫu' }, currentLocale)}
        itemsList={deleteItemsList}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </ResponsivePageLayout>
  );
}
