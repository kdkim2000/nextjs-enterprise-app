'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import { Search, ArrowBack } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import MasterDetailLayout from '@/components/common/MasterDetailLayout';
import MobileCardList from '@/components/mobile/MobileCardList';
import MobileMasterDetail, { useMobileMasterDetail } from '@/components/mobile/MobileMasterDetail';
import CodeFormFields, { CodeFormData } from '@/components/admin/CodeFormFields';
import CodeTypeFormFields, { CodeTypeFormData } from '@/components/admin/CodeTypeFormFields';
import CodeTypeList from './components/CodeTypeList';
import CodeTypeMobileCard from './components/CodeTypeMobileCard';
import CodeMobileCard from './components/CodeMobileCard';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { commonApi } from '@/lib/axios';
import { useMobile } from '@/hooks/useMobile';
import { useAutoHideMessage } from '@/hooks/useAutoHideMessage';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useCodeOptions } from '@/hooks/useCodeOptions';
import { useHelp } from '@/hooks/useHelp';
import { useProgramId } from '@/hooks/useProgramId';
import { createColumns } from './constants';
import {
  createFilterFields,
  calculateActiveFilterCount,
  multiLangFieldsToFormData,
  formDataToMultiLangFields,
  getLocalizedValue,
  createEmptyMultiLangFormFields,
  SUPPORTED_LANGUAGES
} from './utils';
import { Code, CodeType, SearchCriteria } from './types';

export default function CodesPage() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const { isMobileLayout } = useMobile();
  const { successMessage, errorMessage, showSuccess, showError } = useAutoHideMessage();

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

  // Fetch status options from code management system
  const { codes: statusOptions } = useCodeOptions('COMMON_STATUS', locale);

  // Mobile Master-Detail navigation
  const {
    view: mobileView,
    setView: setMobileView,
    selectedMaster: mobileSelectedCodeType,
    selectMaster: selectMobileCodeType,
    goBack: handleMobileBack,
    clearSelection: clearMobileSelection,
  } = useMobileMasterDetail<CodeType>('master');

  // State
  const [codeTypes, setCodeTypes] = useState<CodeType[]>([]);
  const [selectedCodeType, setSelectedCodeType] = useState<CodeType | null>(null);
  const [codes, setCodes] = useState<Code[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    codeType: '',
    code: '',
    status: ''
  });
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);

  // Code Type Dialog
  const [codeTypeDialogOpen, setCodeTypeDialogOpen] = useState(false);
  const [editingCodeType, setEditingCodeType] = useState<CodeTypeFormData | null>(null);
  const [codeTypeSaveLoading, setCodeTypeSaveLoading] = useState(false);
  const [codeTypeDeleteConfirmOpen, setCodeTypeDeleteConfirmOpen] = useState(false);
  const [codeTypeToDelete, setCodeTypeToDelete] = useState<CodeType | null>(null);

  // Code Dialog
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<CodeFormData | null>(null);
  const [codeSaveLoading, setCodeSaveLoading] = useState(false);
  const [codeDeleteConfirmOpen, setCodeDeleteConfirmOpen] = useState(false);
  const [selectedCodesForDelete, setSelectedCodesForDelete] = useState<(string | number)[]>([]);

  // Mobile selection state
  const [mobileSelectedIds, setMobileSelectedIds] = useState<Set<string | number>>(new Set());
  const [mobileSelectionMode, setMobileSelectionMode] = useState(false);

  // Fetch code types
  const fetchCodeTypes = useCallback(async () => {
    try {
      const response = await commonApi.get('/code-types');
      setCodeTypes(response.codeTypes || []);
    } catch (error) {
      console.error('Failed to fetch code types:', error);
      showError('Failed to load code types');
    }
  }, [showError]);

  // Fetch codes for selected code type
  const fetchCodes = useCallback(async () => {
    if (!selectedCodeType) {
      setCodes([]);
      setFilteredCodes([]);
      return;
    }

    try {
      setLoading(true);
      const response = await commonApi.get(`/codes/type/${selectedCodeType.code}`);
      setCodes(response.codes || []);
      setFilteredCodes(response.codes || []);
    } catch (error) {
      console.error('Failed to fetch codes:', error);
      showError('Failed to load codes');
      setCodes([]);
      setFilteredCodes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCodeType, showError]);

  // Initial load
  useEffect(() => {
    void fetchCodeTypes();
  }, [fetchCodeTypes]);

  // Auto-select first code type on initial load (desktop only)
  useEffect(() => {
    if (!isMobileLayout && codeTypes.length > 0 && !selectedCodeType) {
      setSelectedCodeType(codeTypes[0]);
    }
  }, [codeTypes, selectedCodeType, isMobileLayout]);

  // Load codes when code type changes
  useEffect(() => {
    void fetchCodes();
  }, [fetchCodes]);

  // Apply filters
  useEffect(() => {
    let filtered = [...codes];

    if (quickSearch) {
      const search = quickSearch.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.code.toLowerCase().includes(search) ||
          SUPPORTED_LANGUAGES.some((lang) =>
            c.name[lang].toLowerCase().includes(search)
          )
      );
    }

    if (searchCriteria.code) {
      filtered = filtered.filter((c) =>
        c.code.toLowerCase().includes(searchCriteria.code.toLowerCase())
      );
    }

    if (searchCriteria.status) {
      filtered = filtered.filter((c) => c.status === searchCriteria.status);
    }

    setFilteredCodes(filtered);
  }, [codes, quickSearch, searchCriteria]);

  // Mobile: Handle code type selection (drill-down)
  const handleMobileCodeTypeClick = useCallback((codeType: CodeType) => {
    setSelectedCodeType(codeType);
    selectMobileCodeType(codeType);
  }, [selectMobileCodeType]);

  // Mobile: Handle back navigation
  const handleMobileBackClick = useCallback(() => {
    handleMobileBack();
    setMobileSelectionMode(false);
    setMobileSelectedIds(new Set());
  }, [handleMobileBack]);

  // Code Type handlers
  const handleAddCodeType = useCallback(() => {
    setEditingCodeType({
      id: '',
      code: '',
      ...createEmptyMultiLangFormFields(),
      order: codeTypes.length + 1,
      status: 'active',
      category: 'common'
    } as any);
    setCodeTypeDialogOpen(true);
  }, [codeTypes.length]);

  const handleEditCodeType = useCallback((codeType: CodeType) => {
    const formFields = multiLangFieldsToFormData(codeType.name, codeType.description);

    setEditingCodeType({
      id: codeType.id,
      code: codeType.code,
      ...formFields,
      order: codeType.order,
      status: codeType.status,
      category: codeType.category
    } as any);
    setCodeTypeDialogOpen(true);
  }, []);

  const handleDeleteCodeType = useCallback((codeType: CodeType) => {
    setCodeTypeToDelete(codeType);
    setCodeTypeDeleteConfirmOpen(true);
  }, []);

  const handleSaveCodeType = useCallback(async () => {
    if (!editingCodeType) return;

    try {
      setCodeTypeSaveLoading(true);

      const { name, description } = formDataToMultiLangFields(editingCodeType);

      const payload = {
        code: editingCodeType.code,
        name,
        description,
        order: editingCodeType.order,
        status: editingCodeType.status,
        category: editingCodeType.category
      };

      if (!editingCodeType.id) {
        await commonApi.post('/code-types', payload);
        showSuccess('Code type created successfully');
      } else {
        await commonApi.put(`/code-types/${editingCodeType.id}`, payload);
        showSuccess('Code type updated successfully');
      }

      setCodeTypeDialogOpen(false);
      setEditingCodeType(null);
      await fetchCodeTypes();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to save code type');
    } finally {
      setCodeTypeSaveLoading(false);
    }
  }, [editingCodeType, fetchCodeTypes, showSuccess, showError]);

  const handleConfirmDeleteCodeType = useCallback(async () => {
    if (!codeTypeToDelete) return;

    try {
      const response = await commonApi.delete(`/code-types/${codeTypeToDelete.id}`);
      const deletedCodesCount = response.deletedCodesCount || 0;

      if (deletedCodesCount > 0) {
        showSuccess(
          locale === 'ko'
            ? `코드 타입과 관련된 ${deletedCodesCount}개의 코드가 삭제되었습니다`
            : `Code type and ${deletedCodesCount} related code(s) deleted successfully`
        );
      } else {
        showSuccess(
          locale === 'ko' ? '코드 타입이 삭제되었습니다' : 'Code type deleted successfully'
        );
      }

      setCodeTypeDeleteConfirmOpen(false);
      setCodeTypeToDelete(null);

      // If deleted code type was selected, clear selection and codes
      if (selectedCodeType?.id === codeTypeToDelete.id) {
        setSelectedCodeType(null);
        setCodes([]);
        setFilteredCodes([]);
        // Mobile: go back to master view
        if (isMobileLayout) {
          clearMobileSelection();
        }
      }

      await fetchCodeTypes();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to delete code type');
    }
  }, [codeTypeToDelete, selectedCodeType, fetchCodeTypes, showSuccess, showError, locale, isMobileLayout]);

  // Code handlers
  const handleAddCode = useCallback(() => {
    if (!selectedCodeType) {
      showError('Please select a code type first');
      return;
    }

    setEditingCode({
      id: '',
      codeType: selectedCodeType.code,
      code: '',
      ...createEmptyMultiLangFormFields(),
      order: codes.length + 1,
      status: 'active',
      parentCode: '',
      attributes: '{}'
    } as any);
    setCodeDialogOpen(true);
  }, [selectedCodeType, codes.length, showError]);

  const handleEditCode = useCallback((id: string | number) => {
    const code = codes.find((c) => c.id === id);
    if (code) {
      const formFields = multiLangFieldsToFormData(code.name, code.description);

      setEditingCode({
        id: code.id,
        codeType: code.codeType,
        code: code.code,
        ...formFields,
        order: code.order,
        status: code.status,
        parentCode: code.parentCode || '',
        attributes: JSON.stringify(code.attributes || {}, null, 2)
      } as any);
      setCodeDialogOpen(true);
    }
  }, [codes]);

  // Mobile: Edit code from card
  const handleMobileEditCode = useCallback((code: Code) => {
    handleEditCode(code.id);
  }, [handleEditCode]);

  // Mobile: Delete single code from card
  const handleMobileDeleteCode = useCallback((code: Code) => {
    setSelectedCodesForDelete([code.id]);
    setCodeDeleteConfirmOpen(true);
  }, []);

  const handleSaveCode = useCallback(async () => {
    if (!editingCode) return;

    try {
      setCodeSaveLoading(true);

      let attributes = {};
      try {
        attributes = JSON.parse(editingCode.attributes || '{}');
      } catch {
        showError('Invalid JSON format in attributes');
        return;
      }

      const { name, description } = formDataToMultiLangFields(editingCode);

      const payload = {
        codeType: editingCode.codeType,
        code: editingCode.code,
        name,
        description,
        order: editingCode.order,
        status: editingCode.status,
        parentCode: editingCode.parentCode || null,
        attributes
      };

      if (!editingCode.id) {
        await commonApi.post('/codes', payload);
        showSuccess('Code created successfully');
      } else {
        await commonApi.put(`/codes/${editingCode.id}`, payload);
        showSuccess('Code updated successfully');
      }

      setCodeDialogOpen(false);
      setEditingCode(null);
      await fetchCodes();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to save code');
    } finally {
      setCodeSaveLoading(false);
    }
  }, [editingCode, fetchCodes, showSuccess, showError]);

  const handleDeleteCodes = useCallback((ids: (string | number)[]) => {
    setSelectedCodesForDelete(ids);
    setCodeDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDeleteCodes = useCallback(async () => {
    try {
      for (const id of selectedCodesForDelete) {
        await commonApi.delete(`/codes/${id}`);
      }

      const count = selectedCodesForDelete.length;
      showSuccess(`Successfully deleted ${count} code${count > 1 ? 's' : ''}`);
      setCodeDeleteConfirmOpen(false);
      setSelectedCodesForDelete([]);
      setMobileSelectedIds(new Set());
      setMobileSelectionMode(false);
      await fetchCodes();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to delete codes');
    }
  }, [selectedCodesForDelete, fetchCodes, showSuccess, showError]);

  // Mobile selection handlers
  const handleMobileSelectionModeToggle = useCallback(() => {
    setMobileSelectionMode((prev) => !prev);
    if (mobileSelectionMode) {
      setMobileSelectedIds(new Set());
    }
  }, [mobileSelectionMode]);

  const handleMobileSelectAll = useCallback(() => {
    setMobileSelectedIds(new Set(filteredCodes.map((c) => c.id)));
  }, [filteredCodes]);

  const handleMobileDeselectAll = useCallback(() => {
    setMobileSelectedIds(new Set());
  }, []);

  const handleMobileDeleteSelected = useCallback(() => {
    handleDeleteCodes(Array.from(mobileSelectedIds));
  }, [mobileSelectedIds, handleDeleteCodes]);

  // Memoized values
  const columns = useMemo(
    () => createColumns(t, handleEditCode, gridPermissions.editable, statusOptions),
    [t, handleEditCode, gridPermissions.editable, statusOptions]
  );

  const filterFields = useMemo(
    () => createFilterFields(t, locale, statusOptions),
    [t, locale, statusOptions]
  );

  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  const deleteItemsList = useMemo(
    () =>
      selectedCodesForDelete.map((id) => {
        const code = codes.find((c) => c.id === id);
        return code
          ? {
              id: code.id,
              displayName: `${code.code} (${getLocalizedValue(code.name, locale)})`
            }
          : { id, displayName: String(id) };
      }),
    [selectedCodesForDelete, codes, locale]
  );

  // Mobile: Master Content (Code Types List)
  const renderMasterContent = () => (
    <MobileCardList
      data={codeTypes}
      loading={false}
      emptyMessage={locale === 'ko' ? '코드 타입이 없습니다' : 'No code types found'}
      renderCard={(codeType) => (
        <CodeTypeMobileCard
          key={codeType.id}
          codeType={codeType}
          locale={locale}
          onClick={handleMobileCodeTypeClick}
          onEdit={gridPermissions.editable ? handleEditCodeType : undefined}
          onDelete={gridPermissions.showDeleteButton ? handleDeleteCodeType : undefined}
          showSwipeActions={gridPermissions.editable}
        />
      )}
      keyExtractor={(codeType) => codeType.id}
    />
  );

  // Mobile: Detail Content (Codes List)
  const renderDetailContent = () => (
    <MobileCardList
      data={filteredCodes}
      loading={loading}
      emptyMessage={locale === 'ko' ? '코드가 없습니다' : 'No codes found'}
      renderCard={(code) => (
        <CodeMobileCard
          key={code.id}
          code={code}
          locale={locale}
          onClick={gridPermissions.editable ? handleMobileEditCode : undefined}
          onEdit={gridPermissions.editable ? handleMobileEditCode : undefined}
          onDelete={gridPermissions.showDeleteButton ? handleMobileDeleteCode : undefined}
          selected={mobileSelectedIds.has(code.id)}
          selectable={mobileSelectionMode}
          onSelectionChange={(selected) => {
            const newIds = new Set(mobileSelectedIds);
            if (selected) {
              newIds.add(code.id);
            } else {
              newIds.delete(code.id);
            }
            setMobileSelectedIds(newIds);
          }}
          showSwipeActions={!mobileSelectionMode && gridPermissions.editable}
        />
      )}
      keyExtractor={(code) => code.id}
    />
  );

  return (
    <ResponsivePageLayout
      // Page Header
      useMenu
      showBreadcrumb
      // Messages
      successMessage={successMessage}
      errorMessage={errorMessage}
      // Quick Search (only show in detail view on mobile)
      quickSearch={isMobileLayout && mobileView === 'detail' ? quickSearch : undefined}
      onQuickSearchChange={isMobileLayout && mobileView === 'detail' ? setQuickSearch : undefined}
      onQuickSearch={() => {}}
      onQuickSearchClear={() => {
        setQuickSearch('');
        setSearchCriteria({ codeType: '', code: '', status: '' });
      }}
      quickSearchPlaceholder={locale === 'ko' ? '코드 검색...' : 'Search codes...'}
      searching={loading}
      // Advanced Filter (only for detail view on mobile)
      showAdvancedFilter={isMobileLayout && mobileView === 'detail'}
      advancedFilterOpen={advancedFilterOpen}
      onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
      activeFilterCount={mobileView === 'detail' ? activeFilterCount : 0}
      filterTitle={`${t('common.search')} / ${t('common.filter')}`}
      filterContent={
        <SearchFilterFields
          fields={filterFields}
          values={searchCriteria}
          onChange={(field, value) => setSearchCriteria((prev) => ({ ...prev, [field]: value }))}
          onEnter={() => setAdvancedFilterOpen(false)}
        />
      }
      onFilterApply={() => setAdvancedFilterOpen(false)}
      onFilterClear={() => {
        setQuickSearch('');
        setSearchCriteria({ codeType: '', code: '', status: '' });
      }}
      onFilterClose={() => setAdvancedFilterOpen(false)}
      // Help
      programId={programId || ''}
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={isAdmin}
      helpExists={helpExists}
      canManageHelp={canManageHelp}
      onHelpEdit={navigateToHelpEdit}
      language={language}
      // Mobile FAB - not needed when using MobileMasterDetail (it has its own FAB support)
      mobileFab={undefined}
      // Mobile selection mode - only active in detail view
      mobileSelectionMode={mobileView === 'detail' ? mobileSelectionMode : false}
      mobileSelectedCount={mobileSelectedIds.size}
      mobileTotalCount={filteredCodes.length}
      onMobileSelectionModeToggle={
        mobileView === 'detail' && gridPermissions.showDeleteButton
          ? handleMobileSelectionModeToggle
          : undefined
      }
      onMobileSelectAll={handleMobileSelectAll}
      onMobileDeselectAll={handleMobileDeselectAll}
      onMobileDeleteSelected={
        mobileView === 'detail' && gridPermissions.showDeleteButton
          ? handleMobileDeleteSelected
          : undefined
      }
      // Hide default mobile header when using MobileMasterDetail
      mobileCustomHeader={isMobileLayout ? <Box /> : undefined}
    >
      {/* Conditional rendering based on device */}
      {isMobileLayout ? (
        // Mobile: Master-Detail navigation with slide animation
        <MobileMasterDetail
          view={mobileView}
          onViewChange={setMobileView}
          masterContent={renderMasterContent()}
          detailContent={renderDetailContent()}
          detailHeader={{
            title: selectedCodeType
              ? getLocalizedValue(selectedCodeType.name, locale)
              : '',
            subtitle: selectedCodeType?.code,
          }}
          onBack={handleMobileBackClick}
          masterFab={
            gridPermissions.showAddButton
              ? { onClick: handleAddCodeType, label: t('common.create') }
              : undefined
          }
          detailFab={
            gridPermissions.showAddButton
              ? { onClick: handleAddCode, label: t('common.create') }
              : undefined
          }
          detailSelection={
            gridPermissions.showDeleteButton
              ? {
                  active: mobileSelectionMode,
                  selectedCount: mobileSelectedIds.size,
                  totalCount: filteredCodes.length,
                  onToggle: handleMobileSelectionModeToggle,
                  onSelectAll: handleMobileSelectAll,
                  onDeselectAll: handleMobileDeselectAll,
                  onDeleteSelected: handleMobileDeleteSelected,
                }
              : undefined
          }
          enableSwipeBack
          detailLoading={loading}
          hasDetailContent={filteredCodes.length > 0}
          detailEmptyState={
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {locale === 'ko' ? '코드가 없습니다' : 'No codes found'}
              </Typography>
            </Box>
          }
        />
      ) : (
        // Desktop: Master-Detail Layout
        <MasterDetailLayout
          masterSize={30}
          detailSize={70}
          master={
            <CodeTypeList
              codeTypes={codeTypes}
              selectedCodeType={selectedCodeType}
              onSelectCodeType={setSelectedCodeType}
              onAddCodeType={handleAddCodeType}
              onEditCodeType={handleEditCodeType}
              onDeleteCodeType={handleDeleteCodeType}
              locale={locale}
            />
          }
          detail={
            <Paper sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {!selectedCodeType ? (
                <EmptyState
                  icon={Search}
                  title={locale === 'ko' ? '코드 타입을 선택하세요' : 'Select a Code Type'}
                  description={
                    locale === 'ko'
                      ? '왼쪽 목록에서 코드 타입을 선택하여 코드를 관리하세요'
                      : 'Select a code type from the list to manage codes'
                  }
                />
              ) : (
                <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                  {/* Header with Title */}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="h6">
                      {locale === 'ko'
                        ? `${getLocalizedValue(selectedCodeType.name, locale)} 코드`
                        : `${getLocalizedValue(selectedCodeType.name, locale)} Codes`}
                    </Typography>
                  </Box>

                  {/* Quick Search Bar */}
                  <QuickSearchBar
                    searchValue={quickSearch}
                    onSearchChange={setQuickSearch}
                    onSearch={() => {}}
                    onClear={() => {
                      setQuickSearch('');
                      setSearchCriteria({ codeType: '', code: '', status: '' });
                    }}
                    onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
                    placeholder={locale === 'ko' ? '코드 검색...' : 'Search codes...'}
                    searching={loading}
                    activeFilterCount={activeFilterCount}
                    showAdvancedButton={true}
                  />

                  {/* Advanced Filter Panel */}
                  {advancedFilterOpen && (
                    <SearchFilterPanel
                      activeFilterCount={activeFilterCount}
                      onApply={() => setAdvancedFilterOpen(false)}
                      onClear={() => {
                        setQuickSearch('');
                        setSearchCriteria({ codeType: '', code: '', status: '' });
                      }}
                      onClose={() => setAdvancedFilterOpen(false)}
                      mode="advanced"
                      expanded={true}
                      showHeader={false}
                    >
                      <SearchFilterFields
                        fields={filterFields}
                        values={searchCriteria}
                        onChange={(field, value) => setSearchCriteria((prev) => ({ ...prev, [field]: value }))}
                        onEnter={() => setAdvancedFilterOpen(false)}
                      />
                    </SearchFilterPanel>
                  )}

                  {/* Data Grid */}
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <ExcelDataGrid
                      rows={filteredCodes}
                      columns={columns}
                      onRowsChange={(rows) => setFilteredCodes(rows as Code[])}
                      {...(gridPermissions.showAddButton && { onAdd: handleAddCode })}
                      {...(gridPermissions.showDeleteButton && { onDelete: handleDeleteCodes })}
                      onRefresh={fetchCodes}
                      checkboxSelection={gridPermissions.checkboxSelection}
                      editable={gridPermissions.editable}
                      exportFileName={`codes-${selectedCodeType.code}`}
                      loading={loading}
                      paginationMode="client"
                    />
                  </Box>
                </Box>
              )}
            </Paper>
          }
        />
      )}

      {/* Code Type Edit Drawer */}
      <EditDrawer
        open={codeTypeDialogOpen}
        onClose={() => {
          setCodeTypeDialogOpen(false);
          setEditingCodeType(null);
        }}
        title={!editingCodeType?.id ? 'Add New Code Type' : 'Edit Code Type'}
        onSave={handleSaveCodeType}
        saveLoading={codeTypeSaveLoading}
        saveLabel={locale === 'ko' ? '저장' : 'Save'}
        cancelLabel={locale === 'ko' ? '취소' : 'Cancel'}
        width={{ xs: '100%', sm: 600, md: 800, lg: 900 }}
      >
        <CodeTypeFormFields
          codeType={editingCodeType}
          onChange={setEditingCodeType}
          locale={locale}
          labels={{
            code: t('fields.code'),
            nameEn: t('fields.nameEn'),
            nameKo: t('fields.nameKo'),
            nameZh: t('fields.nameZh'),
            nameVi: t('fields.nameVi'),
            descriptionEn: t('fields.descriptionEn'),
            descriptionKo: t('fields.descriptionKo'),
            descriptionZh: t('fields.descriptionZh'),
            descriptionVi: t('fields.descriptionVi'),
            order: t('fields.order'),
            status: t('fields.status'),
            category: t('fields.category')
          }}
        />
      </EditDrawer>

      {/* Code Edit Drawer */}
      <EditDrawer
        open={codeDialogOpen}
        onClose={() => {
          setCodeDialogOpen(false);
          setEditingCode(null);
        }}
        title={!editingCode?.id ? 'Add New Code' : 'Edit Code'}
        onSave={handleSaveCode}
        saveLoading={codeSaveLoading}
        saveLabel={locale === 'ko' ? '저장' : 'Save'}
        cancelLabel={locale === 'ko' ? '취소' : 'Cancel'}
        width={{ xs: '100%', sm: 600, md: 800, lg: 900 }}
      >
        <CodeFormFields
          code={editingCode}
          onChange={setEditingCode}
          onError={showError}
          locale={locale}
          labels={{
            codeType: t('fields.codeType'),
            code: t('fields.code'),
            nameEn: t('fields.nameEn'),
            nameKo: t('fields.nameKo'),
            nameZh: t('fields.nameZh'),
            nameVi: t('fields.nameVi'),
            descriptionEn: t('fields.descriptionEn'),
            descriptionKo: t('fields.descriptionKo'),
            descriptionZh: t('fields.descriptionZh'),
            descriptionVi: t('fields.descriptionVi'),
            order: t('fields.order'),
            status: t('fields.status'),
            parentCode: t('fields.parentCode'),
            attributes: t('fields.attributes')
          }}
        />
      </EditDrawer>

      {/* Code Type Delete Confirmation */}
      <DeleteConfirmDialog
        open={codeTypeDeleteConfirmOpen}
        itemCount={1}
        itemName={locale === 'ko' ? '코드 타입' : 'code type'}
        itemsList={
          codeTypeToDelete
            ? [
                {
                  id: codeTypeToDelete.id,
                  displayName: `${codeTypeToDelete.code} (${getLocalizedValue(codeTypeToDelete.name, locale)})`
                }
              ]
            : []
        }
        warningMessage={
          locale === 'ko'
            ? '⚠️ 이 코드 타입을 삭제하면 연관된 모든 코드도 함께 삭제됩니다.'
            : '⚠️ Deleting this code type will also delete all related codes.'
        }
        onCancel={() => {
          setCodeTypeDeleteConfirmOpen(false);
          setCodeTypeToDelete(null);
        }}
        onConfirm={handleConfirmDeleteCodeType}
        loading={false}
      />

      {/* Code Delete Confirmation */}
      <DeleteConfirmDialog
        open={codeDeleteConfirmOpen}
        itemCount={selectedCodesForDelete.length}
        itemName="code"
        itemsList={deleteItemsList}
        onCancel={() => {
          setCodeDeleteConfirmOpen(false);
          setSelectedCodesForDelete([]);
        }}
        onConfirm={handleConfirmDeleteCodes}
        loading={false}
      />
    </ResponsivePageLayout>
  );
}
