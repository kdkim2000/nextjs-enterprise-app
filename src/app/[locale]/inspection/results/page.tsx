'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Paper, Chip } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import ResponsivePageLayout from '@/components/common/ResponsivePageLayout';
import MobileCardList from '@/components/mobile/MobileCardList';
import { inspectionApi } from '@/lib/axios';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useMobile } from '@/hooks/useMobile';
import { useMessage } from '@/hooks/useMessage';
import { useDataGridPermissions } from '@/hooks/usePermissionControl';
import { useHelp } from '@/hooks/useHelp';
import { useProgramId } from '@/hooks/useProgramId';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { format } from 'date-fns';
import InspectionMobileCard from '../executions/components/InspectionMobileCard';
import { Inspection, ChecksheetTemplate } from '../executions/types';
import { FilterFieldConfig } from '@/components/common/SearchFilterFields';

interface SearchCriteria {
  inspection_code: string;
  template_id: string;
  inspector_id: string;
  location: string;
  date_from: string;
  date_to: string;
  [key: string]: string | string[] | undefined;
}

export default function InspectionResultsPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const router = useRouter();
  const { isMobileLayout } = useMobile();

  const { programId } = useProgramId();
  const gridPermissions = useDataGridPermissions(programId || 'INSPECTION_RESULTS');

  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    navigateToHelpEdit,
    language,
  } = useHelp({ programId: programId || 'INSPECTION_RESULTS' });

  const { successMessage, errorMessage, showErrorMessage } = useMessage({ locale: currentLocale });

  // States
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [templates, setTemplates] = useState<ChecksheetTemplate[]>([]);
  const [searching, setSearching] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    inspection_code: '',
    template_id: '',
    inspector_id: '',
    location: '',
    date_from: '',
    date_to: '',
  });
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });
  const [rowCount, setRowCount] = useState(0);
  const [mobileHasMore, setMobileHasMore] = useState(true);

  // Fetch templates for filter
  const fetchTemplates = useCallback(async () => {
    try {
      const response = await inspectionApi.get('/templates?status=active&limit=1000');
      setTemplates(response.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  }, []);

  // Fetch completed inspections only
  const fetchInspections = useCallback(
    async (page: number = 0, pageSize: number = 50, useQuickSearch: boolean = false) => {
      try {
        setSearching(true);

        const params = new URLSearchParams();
        params.append('status', 'completed'); // Only completed inspections

        if (useQuickSearch && quickSearch) {
          params.append('search', quickSearch);
        } else {
          if (searchCriteria.inspection_code) params.append('inspection_code', searchCriteria.inspection_code);
          if (searchCriteria.template_id) params.append('template_id', searchCriteria.template_id);
          if (searchCriteria.inspector_id) params.append('inspector_id', searchCriteria.inspector_id);
          if (searchCriteria.location) params.append('location', searchCriteria.location);
          if (searchCriteria.date_from) params.append('date_from', searchCriteria.date_from);
          if (searchCriteria.date_to) params.append('date_to', searchCriteria.date_to);
        }

        params.append('page', (page + 1).toString());
        params.append('limit', pageSize.toString());

        const response = await inspectionApi.get(`/executions?${params.toString()}`);
        setInspections(response.inspections || []);

        if (response.pagination) {
          setRowCount(response.pagination.totalCount || 0);
        } else {
          setRowCount(response.inspections?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch inspections:', error);
        await showErrorMessage('COMMON_LOAD_FAIL');
        setInspections([]);
        setRowCount(0);
      } finally {
        setSearching(false);
      }
    },
    [quickSearch, searchCriteria, showErrorMessage]
  );

  // Initial fetch
  useEffect(() => {
    fetchTemplates();
    fetchInspections(0, 50, false);
  }, []);

  // Handlers
  const handleView = useCallback(
    (id: string | number) => {
      router.push(`/${currentLocale}/inspection/executions/${id}`);
    },
    [currentLocale, router]
  );

  const handleRefresh = useCallback(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchInspections(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchInspections, quickSearch, paginationModel]);

  const handleSearchChange = useCallback((field: keyof SearchCriteria, value: string | string[]) => {
    setSearchCriteria((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleQuickSearch = useCallback(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    fetchInspections(0, paginationModel.pageSize, true);
  }, [fetchInspections, paginationModel.pageSize]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setSearchCriteria({
      inspection_code: '',
      template_id: '',
      inspector_id: '',
      location: '',
      date_from: '',
      date_to: '',
    });
    setInspections([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 50 });
  }, []);

  const handleAdvancedFilterApply = useCallback(() => {
    setAdvancedFilterOpen(false);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    fetchInspections(0, paginationModel.pageSize, false);
  }, [fetchInspections, paginationModel.pageSize]);

  const handleAdvancedFilterClose = useCallback(() => {
    setAdvancedFilterOpen(false);
  }, []);

  const handlePaginationModelChange = useCallback(
    (newModel: { page: number; pageSize: number }) => {
      setPaginationModel(newModel);
      const useQuickSearch = quickSearch.trim() !== '';
      fetchInspections(newModel.page, newModel.pageSize, useQuickSearch);
    },
    [fetchInspections, quickSearch]
  );

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

  const handleMobileInspectionClick = useCallback(
    (inspection: Inspection) => {
      handleView(inspection.id);
    },
    [handleView]
  );

  // Columns
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'inspection_code',
        headerName: getLocalizedValue({ en: 'Code', ko: '검사코드' }, currentLocale),
        width: 130,
      },
      {
        field: 'title',
        headerName: getLocalizedValue({ en: 'Title', ko: '제목' }, currentLocale),
        flex: 1,
        minWidth: 200,
      },
      {
        field: 'template_name',
        headerName: getLocalizedValue({ en: 'Template', ko: '템플릿' }, currentLocale),
        width: 150,
      },
      {
        field: 'inspector_name',
        headerName: getLocalizedValue({ en: 'Inspector', ko: '검사자' }, currentLocale),
        width: 120,
      },
      {
        field: 'location',
        headerName: getLocalizedValue({ en: 'Location', ko: '위치' }, currentLocale),
        width: 120,
      },
      {
        field: 'inspection_date',
        headerName: getLocalizedValue({ en: 'Date', ko: '검사일' }, currentLocale),
        width: 110,
        valueFormatter: (value) => {
          if (!value) return '-';
          try {
            return format(new Date(value), 'yyyy-MM-dd');
          } catch {
            return '-';
          }
        },
      },
      {
        field: 'completed_at',
        headerName: getLocalizedValue({ en: 'Completed', ko: '완료일' }, currentLocale),
        width: 150,
        valueFormatter: (value) => {
          if (!value) return '-';
          try {
            return format(new Date(value), 'yyyy-MM-dd HH:mm');
          } catch {
            return '-';
          }
        },
      },
      {
        field: 'status',
        headerName: getLocalizedValue({ en: 'Status', ko: '상태' }, currentLocale),
        width: 100,
        renderCell: () => (
          <Chip
            label={getLocalizedValue({ en: 'Completed', ko: '완료' }, currentLocale)}
            size="small"
            color="success"
          />
        ),
      },
    ],
    [currentLocale]
  );

  // Filter fields
  const filterFields: FilterFieldConfig[] = useMemo(
    () => [
      {
        name: 'inspection_code',
        label: getLocalizedValue({ en: 'Inspection Code', ko: '검사코드' }, currentLocale),
        type: 'text',
        placeholder: getLocalizedValue({ en: 'Search by code...', ko: '코드로 검색...' }, currentLocale),
      },
      {
        name: 'template_id',
        label: getLocalizedValue({ en: 'Template', ko: '템플릿' }, currentLocale),
        type: 'select',
        options: [
          { value: '', label: getLocalizedValue({ en: 'All Templates', ko: '전체 템플릿' }, currentLocale) },
          ...templates.map((t) => ({ value: t.id, label: `${t.code} - ${t.name}` })),
        ],
      },
      {
        name: 'location',
        label: getLocalizedValue({ en: 'Location', ko: '위치' }, currentLocale),
        type: 'text',
        placeholder: getLocalizedValue({ en: 'Search by location...', ko: '위치로 검색...' }, currentLocale),
      },
      {
        name: 'date_from',
        label: getLocalizedValue({ en: 'Date From', ko: '시작일' }, currentLocale),
        type: 'date',
      },
      {
        name: 'date_to',
        label: getLocalizedValue({ en: 'Date To', ko: '종료일' }, currentLocale),
        type: 'date',
      },
    ],
    [currentLocale, templates]
  );

  const activeFilterCount = useMemo(
    () => Object.entries(searchCriteria).filter(([_, value]) => value !== '').length,
    [searchCriteria]
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
        { en: 'Search completed inspections...', ko: '완료된 검사 검색...' },
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
      programId={programId || 'INSPECTION_RESULTS'}
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={isAdmin}
      helpExists={helpExists}
      canManageHelp={canManageHelp}
      onHelpEdit={navigateToHelpEdit}
      language={language}
    >
      {isMobileLayout ? (
        <MobileCardList
          data={inspections}
          loading={searching}
          emptyMessage={t('grid.noRows')}
          renderCard={(inspection) => (
            <InspectionMobileCard
              key={inspection.id}
              inspection={inspection}
              locale={currentLocale}
              onClick={handleMobileInspectionClick}
              showSwipeActions={false}
            />
          )}
          keyExtractor={(inspection) => inspection.id}
          hasMore={mobileHasMore}
          onLoadMore={handleMobileLoadMore}
          onRefresh={handleRefresh}
        />
      ) : (
        <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ExcelDataGrid
              rows={inspections}
              columns={columns}
              onRefresh={handleRefresh}
              checkboxSelection={false}
              editable={false}
              exportFileName="inspection-results"
              loading={searching}
              paginationMode="server"
              rowCount={rowCount}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
              onRowDoubleClick={(params) => handleView(params.row.id)}
            />
          </Box>
        </Paper>
      )}
    </ResponsivePageLayout>
  );
}
