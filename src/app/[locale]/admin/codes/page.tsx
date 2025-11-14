'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Paper, Typography, Collapse, IconButton, Tooltip } from '@mui/material';
import { Search, Close, RestartAlt, Check } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EditDrawer from '@/components/common/EditDrawer';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import MasterDetailLayout from '@/components/common/MasterDetailLayout';
import CodeFormFields, { CodeFormData } from '@/components/admin/CodeFormFields';
import CodeTypeFormFields, { CodeTypeFormData } from '@/components/admin/CodeTypeFormFields';
import CodeTypeList from './components/CodeTypeList';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { api } from '@/lib/axios';
import { useAutoHideMessage } from '@/hooks/useAutoHideMessage';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { Code, CodeType, SearchCriteria } from './types';

export default function CodesPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const { successMessage, errorMessage, showSuccess, showError } = useAutoHideMessage();

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

  // Help
  const [helpOpen, setHelpOpen] = useState(false);

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

  // Fetch code types
  const fetchCodeTypes = useCallback(async () => {
    try {
      const response = await api.get('/code-type');
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
      const response = await api.get(`/code/type/${selectedCodeType.code}`);
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

  // Auto-select first code type on initial load
  useEffect(() => {
    if (codeTypes.length > 0 && !selectedCodeType) {
      setSelectedCodeType(codeTypes[0]);
    }
  }, [codeTypes, selectedCodeType]);

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
          c.name.en.toLowerCase().includes(search) ||
          c.name.ko.toLowerCase().includes(search)
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

  // Code Type handlers
  const handleAddCodeType = useCallback(() => {
    setEditingCodeType({
      id: '',
      code: '',
      nameEn: '',
      nameKo: '',
      descriptionEn: '',
      descriptionKo: '',
      order: codeTypes.length + 1,
      status: 'active',
      category: 'common'
    });
    setCodeTypeDialogOpen(true);
  }, [codeTypes.length]);

  const handleEditCodeType = useCallback((codeType: CodeType) => {
    setEditingCodeType({
      id: codeType.id,
      code: codeType.code,
      nameEn: codeType.name.en,
      nameKo: codeType.name.ko,
      descriptionEn: codeType.description.en,
      descriptionKo: codeType.description.ko,
      order: codeType.order,
      status: codeType.status,
      category: codeType.category
    });
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

      const payload = {
        code: editingCodeType.code,
        name: {
          en: editingCodeType.nameEn,
          ko: editingCodeType.nameKo
        },
        description: {
          en: editingCodeType.descriptionEn,
          ko: editingCodeType.descriptionKo
        },
        order: editingCodeType.order,
        status: editingCodeType.status,
        category: editingCodeType.category
      };

      if (!editingCodeType.id) {
        await api.post('/code-type', payload);
        showSuccess('Code type created successfully');
      } else {
        await api.put(`/code-type/${editingCodeType.id}`, payload);
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
      const response = await api.delete(`/code-type/${codeTypeToDelete.id}`);
      const deletedCodesCount = response.deletedCodesCount || 0;

      if (deletedCodesCount > 0) {
        showSuccess(
          currentLocale === 'ko'
            ? `코드 타입과 관련된 ${deletedCodesCount}개의 코드가 삭제되었습니다`
            : `Code type and ${deletedCodesCount} related code(s) deleted successfully`
        );
      } else {
        showSuccess(
          currentLocale === 'ko' ? '코드 타입이 삭제되었습니다' : 'Code type deleted successfully'
        );
      }

      setCodeTypeDeleteConfirmOpen(false);
      setCodeTypeToDelete(null);

      // If deleted code type was selected, clear selection and codes
      if (selectedCodeType?.id === codeTypeToDelete.id) {
        setSelectedCodeType(null);
        setCodes([]);
        setFilteredCodes([]);
      }

      await fetchCodeTypes();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to delete code type');
    }
  }, [codeTypeToDelete, selectedCodeType, fetchCodeTypes, showSuccess, showError, currentLocale]);

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
      nameEn: '',
      nameKo: '',
      descriptionEn: '',
      descriptionKo: '',
      order: codes.length + 1,
      status: 'active',
      parentCode: '',
      attributes: '{}'
    });
    setCodeDialogOpen(true);
  }, [selectedCodeType, codes.length, showError]);

  const handleEditCode = useCallback((id: string | number) => {
    const code = codes.find((c) => c.id === id);
    if (code) {
      setEditingCode({
        id: code.id,
        codeType: code.codeType,
        code: code.code,
        nameEn: code.name.en,
        nameKo: code.name.ko,
        descriptionEn: code.description.en,
        descriptionKo: code.description.ko,
        order: code.order,
        status: code.status,
        parentCode: code.parentCode || '',
        attributes: JSON.stringify(code.attributes || {}, null, 2)
      });
      setCodeDialogOpen(true);
    }
  }, [codes]);

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

      const payload = {
        codeType: editingCode.codeType,
        code: editingCode.code,
        name: {
          en: editingCode.nameEn,
          ko: editingCode.nameKo
        },
        description: {
          en: editingCode.descriptionEn,
          ko: editingCode.descriptionKo
        },
        order: editingCode.order,
        status: editingCode.status,
        parentCode: editingCode.parentCode || null,
        attributes
      };

      if (!editingCode.id) {
        await api.post('/code', payload);
        showSuccess('Code created successfully');
      } else {
        await api.put(`/code/${editingCode.id}`, payload);
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
        await api.delete(`/code/${id}`);
      }

      const count = selectedCodesForDelete.length;
      showSuccess(`Successfully deleted ${count} code${count > 1 ? 's' : ''}`);
      setCodeDeleteConfirmOpen(false);
      setSelectedCodesForDelete([]);
      await fetchCodes();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to delete codes');
    }
  }, [selectedCodesForDelete, fetchCodes, showSuccess, showError]);

  // Memoized values
  const columns = useMemo(
    () => createColumns(t, handleEditCode),
    [t, handleEditCode]
  );

  const filterFields = useMemo(
    () => createFilterFields(t),
    [t]
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
              displayName: `${code.code} (${currentLocale === 'ko' ? code.name.ko : code.name.en})`
            }
          : { id, displayName: String(id) };
      }),
    [selectedCodesForDelete, codes, currentLocale]
  );

  return (
    <StandardCrudPageLayout
      useMenu
      showBreadcrumb
      successMessage={successMessage}
      errorMessage={errorMessage}
      showQuickSearch={false}
      showAdvancedFilter={false}
      programId="PROG-CODE-MGMT"
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={true}
      helpExists={true}
      language={currentLocale}
    >
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
            locale={currentLocale}
          />
        }
        detail={
          <Paper sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {!selectedCodeType ? (
                <EmptyState
                  icon={Search}
                  title={currentLocale === 'ko' ? '코드 타입을 선택하세요' : 'Select a Code Type'}
                  description={
                    currentLocale === 'ko'
                      ? '왼쪽 목록에서 코드 타입을 선택하여 코드를 관리하세요'
                      : 'Select a code type from the list to manage codes'
                  }
                />
              ) : (
                <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                  {/* Header with Title */}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="h6">
                      {currentLocale === 'ko'
                        ? `${selectedCodeType.name.ko} 코드`
                        : `${selectedCodeType.name.en} Codes`}
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
                    placeholder={currentLocale === 'ko' ? '코드 검색...' : 'Search codes...'}
                    searching={loading}
                    activeFilterCount={activeFilterCount}
                    showAdvancedButton={true}
                  />

                  {/* Advanced Filter Panel */}
                  <Collapse in={advancedFilterOpen}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: 'background.default'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {currentLocale === 'ko' ? '상세 필터' : 'Advanced Filter'}
                        </Typography>
                        <IconButton size="small" onClick={() => setAdvancedFilterOpen(false)}>
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                      <SearchFilterFields
                        fields={filterFields}
                        values={searchCriteria}
                        onChange={(field, value) => setSearchCriteria((prev) => ({ ...prev, [field]: value }))}
                        onEnter={() => setAdvancedFilterOpen(false)}
                      />
                      <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                        {/* Close Button */}
                        <Tooltip title={currentLocale === 'ko' ? '닫기' : 'Close'} arrow>
                          <IconButton
                            onClick={() => setAdvancedFilterOpen(false)}
                            size="small"
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover': {
                                borderColor: 'action.active',
                                bgcolor: 'action.hover'
                              }
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Clear Button */}
                        <Tooltip title={currentLocale === 'ko' ? '초기화' : 'Clear'} arrow>
                          <span>
                            <IconButton
                              onClick={() => {
                                setQuickSearch('');
                                setSearchCriteria({ codeType: '', code: '', status: '' });
                              }}
                              disabled={activeFilterCount === 0}
                              size="small"
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': {
                                  borderColor: 'warning.main',
                                  bgcolor: 'warning.50'
                                }
                              }}
                            >
                              <RestartAlt fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        {/* Apply Button */}
                        <Tooltip title={currentLocale === 'ko' ? '적용' : 'Apply'} arrow>
                          <IconButton
                            onClick={() => setAdvancedFilterOpen(false)}
                            size="small"
                            sx={{
                              bgcolor: 'primary.main',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'primary.dark'
                              },
                              '&.Mui-disabled': {
                                bgcolor: 'action.disabledBackground',
                                color: 'action.disabled'
                              }
                            }}
                          >
                            <Check fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Paper>
                  </Collapse>

                  {/* Data Grid */}
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <ExcelDataGrid
                      rows={filteredCodes}
                      columns={columns}
                      onRowsChange={(rows) => setFilteredCodes(rows as Code[])}
                      onAdd={handleAddCode}
                      onDelete={handleDeleteCodes}
                      onRefresh={fetchCodes}
                      checkboxSelection
                      editable
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
        saveLabel={currentLocale === 'ko' ? '저장' : 'Save'}
        cancelLabel={currentLocale === 'ko' ? '취소' : 'Cancel'}
      >
        <CodeTypeFormFields
          codeType={editingCodeType}
          onChange={setEditingCodeType}
          locale={currentLocale}
          labels={{
            code: t('fields.code'),
            nameEn: t('fields.nameEn'),
            nameKo: t('fields.nameKo'),
            descriptionEn: t('fields.descriptionEn'),
            descriptionKo: t('fields.descriptionKo'),
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
        saveLabel={currentLocale === 'ko' ? '저장' : 'Save'}
        cancelLabel={currentLocale === 'ko' ? '취소' : 'Cancel'}
      >
        <CodeFormFields
          code={editingCode}
          onChange={setEditingCode}
          onError={showError}
          locale={currentLocale}
          labels={{
            codeType: t('fields.codeType'),
            code: t('fields.code'),
            nameEn: t('fields.nameEn'),
            nameKo: t('fields.nameKo'),
            descriptionEn: t('fields.descriptionEn'),
            descriptionKo: t('fields.descriptionKo'),
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
        itemName={currentLocale === 'ko' ? '코드 타입' : 'code type'}
        itemsList={
          codeTypeToDelete
            ? [
                {
                  id: codeTypeToDelete.id,
                  displayName: `${codeTypeToDelete.code} (${
                    currentLocale === 'ko' ? codeTypeToDelete.name.ko : codeTypeToDelete.name.en
                  })`
                }
              ]
            : []
        }
        warningMessage={
          currentLocale === 'ko'
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
    </StandardCrudPageLayout>
  );
}
