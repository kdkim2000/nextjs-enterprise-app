'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import { Search } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import PageHeader from '@/components/common/PageHeader';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import SearchFilterFields, { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import PageContainer from '@/components/common/PageContainer';
import RouteGuard from '@/components/auth/RouteGuard';
import { GridColDef } from '@mui/x-data-grid';
import { api } from '@/lib/axios';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useProgramId } from '@/hooks/useProgramId';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import type { LogEntry } from '@/types/log';

interface SearchCriteria {
  method: string[];
  path: string;
  userId: string;
  programId: string;
  statusCode: string;
  startDate: string;
  endDate: string;
  [key: string]: string | string[];
}

// Session storage key for state persistence
const STORAGE_KEY = 'admin-logs-page-state-v2'; // Changed key to clear old invalid data

// Helper functions for state persistence
const savePageState = (state: {
  searchCriteria: SearchCriteria;
  paginationModel: { page: number; pageSize: number };
  quickSearch: string;
  logs: LogEntry[];
  rowCount: number;
}) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save page state:', error);
  }
};

const loadPageState = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load page state:', error);
    return null;
  }
};

export default function LogsPage() {
  const t = useI18n();
  const locale = useCurrentLocale();

  // Get programId from DB (menus table)
  const { programId } = useProgramId();

  // Load saved state on mount
  const savedState = loadPageState();

  const [logs, setLogs] = useState<LogEntry[]>(savedState?.logs || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickSearch, setQuickSearch] = useState(savedState?.quickSearch || '');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(
    savedState?.searchCriteria || {
      method: [],
      path: '',
      userId: '',
      programId: '',
      statusCode: '',
      startDate: '',
      endDate: ''
    }
  );
  const [paginationModel, setPaginationModel] = useState(
    savedState?.paginationModel || {
      page: 0,
      pageSize: 50
    }
  );
  const [rowCount, setRowCount] = useState(savedState?.rowCount || 0);

  // Auto-hide error message after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Save page state whenever it changes
  useEffect(() => {
    savePageState({
      searchCriteria,
      paginationModel,
      quickSearch,
      logs,
      rowCount
    });
  }, [searchCriteria, paginationModel, quickSearch, logs, rowCount]);

  // Check if there's saved state with data on mount, otherwise fetch initial data
  useEffect(() => {
    if (savedState && (savedState.logs?.length > 0 || savedState.quickSearch ||
        Object.values(savedState.searchCriteria || {}).some(v => v !== ''))) {
      // Data already loaded from savedState, no need to fetch again
      // User can click refresh if they want fresh data
    } else {
      // No saved state, fetch initial data (recent logs)
      fetchLogs(0, 50, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLogs = async (page: number = 0, pageSize: number = 50, useQuickSearch: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (useQuickSearch && quickSearch) {
        // Quick search: search in path, userId, and programId
        params.append('path', quickSearch);
        params.append('userId', quickSearch);
        params.append('programId', quickSearch);
      } else {
        // Advanced search: use specific criteria
        // Handle method as array
        if (Array.isArray(searchCriteria.method) && searchCriteria.method.length > 0) {
          searchCriteria.method.forEach(method => params.append('method', method));
        }
        if (searchCriteria.path) params.append('path', searchCriteria.path);
        if (searchCriteria.userId) params.append('userId', searchCriteria.userId);
        if (searchCriteria.programId) params.append('programId', searchCriteria.programId);
        if (searchCriteria.statusCode) params.append('statusCode', searchCriteria.statusCode);
        if (searchCriteria.startDate) params.append('startDate', searchCriteria.startDate);
        if (searchCriteria.endDate) params.append('endDate', searchCriteria.endDate);
      }

      params.append('page', (page + 1).toString()); // Backend uses 1-indexed
      params.append('limit', pageSize.toString());

      const response = await api.get(`/log?${params.toString()}`);
      setLogs(response.logs || []);

      // Update row count for DataGrid
      if (response.pagination) {
        setRowCount(response.pagination.total || 0);
      } else {
        setRowCount(response.logs?.length || 0);
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to load logs');
      console.error('Failed to fetch logs:', err);
      setLogs([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchLogs(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  };

  const handleSearchChange = (field: keyof SearchCriteria, value: string | string[]) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  };

  // Quick search handlers
  const handleQuickSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchLogs(0, paginationModel.pageSize, true);
  };

  const handleQuickSearchClear = () => {
    setQuickSearch('');
    setLogs([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 50 });
    // Clear saved state
    sessionStorage.removeItem(STORAGE_KEY);
  };

  // Advanced search handlers
  const handleAdvancedSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchLogs(0, paginationModel.pageSize, false);
  };

  const handleAdvancedSearchClear = () => {
    setSearchCriteria({
      method: [],
      path: '',
      userId: '',
      programId: '',
      statusCode: '',
      startDate: '',
      endDate: ''
    });
    // Clear saved state
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const handleAdvancedFilterApply = () => {
    setAdvancedFilterOpen(false);
    handleAdvancedSearch();
  };

  const handleAdvancedFilterClose = () => {
    setAdvancedFilterOpen(false);
  };

  const handlePaginationModelChange = (newModel: { page: number; pageSize: number }) => {
    setPaginationModel(newModel);
    const useQuickSearch = quickSearch.trim() !== '';
    fetchLogs(newModel.page, newModel.pageSize, useQuickSearch);
  };

  const activeFilterCount = useMemo(() => {
    return Object.entries(searchCriteria).filter(([_key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== '';
    }).length;
  }, [searchCriteria]);

  const getStatusColor = (statusCode: number): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 300 && statusCode < 400) return 'info';
    if (statusCode >= 400 && statusCode < 500) return 'warning';
    if (statusCode >= 500) return 'error';
    return 'default';
  };

  const getMethodColor = (method: string): 'primary' | 'success' | 'warning' | 'error' | 'default' | 'info' => {
    switch (method) {
      case 'MENU': return 'info';
      case 'GET': return 'primary';
      case 'POST': return 'success';
      case 'PUT': return 'warning';
      case 'PATCH': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  // Extract unique program IDs from logs for filter dropdown
  const programIds = useMemo(() => {
    const ids = new Set<string>();
    logs.forEach(log => {
      if (log.programId) {
        ids.add(log.programId);
      }
    });
    return Array.from(ids).sort();
  }, [logs]);

  // Filter field configuration
  const filterFields: FilterFieldConfig[] = useMemo(() => [
    {
      name: 'method',
      label: getLocalizedValue({ en: 'Method', ko: '메서드', zh: '方法', vi: 'Phương thức' }, locale),
      type: 'multi-select',
      options: [
        { value: 'MENU', label: getLocalizedValue({ en: 'MENU (Menu Access)', ko: 'MENU (메뉴 접근)', zh: 'MENU (菜单访问)', vi: 'MENU (Truy cập menu)' }, locale) },
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'PATCH', label: 'PATCH' },
        { value: 'DELETE', label: 'DELETE' }
      ],
      allLabel: getLocalizedValue({ en: 'All Methods', ko: '전체 메서드', zh: '所有方法', vi: 'Tất cả phương thức' }, locale)
    },
    {
      name: 'path',
      label: getLocalizedValue({ en: 'Path', ko: '경로', zh: '路径', vi: 'Đường dẫn' }, locale),
      type: 'text',
      placeholder: getLocalizedValue({ en: 'Search by path...', ko: '경로로 검색...', zh: '按路径搜索...', vi: 'Tìm theo đường dẫn...' }, locale)
    },
    {
      name: 'userId',
      label: getLocalizedValue({ en: 'User', ko: '사용자', zh: '用户', vi: 'Người dùng' }, locale),
      type: 'text',
      placeholder: getLocalizedValue({ en: 'Search by user ID or name...', ko: '사용자 ID 또는 이름으로 검색...', zh: '按用户 ID 或名称搜索...', vi: 'Tìm theo ID hoặc tên người dùng...' }, locale)
    },
    {
      name: 'programId',
      label: getLocalizedValue({ en: 'Program ID', ko: '프로그램 ID', zh: '程序 ID', vi: 'ID Chương trình' }, locale),
      type: 'select',
      options: [
        { value: '', label: getLocalizedValue({ en: 'All Programs', ko: '전체 프로그램', zh: '所有程序', vi: 'Tất cả chương trình' }, locale) },
        ...programIds.map(id => ({ value: id, label: id }))
      ]
    },
    {
      name: 'statusCode',
      label: getLocalizedValue({ en: 'Status Code', ko: '상태 코드', zh: '状态码', vi: 'Mã trạng thái' }, locale),
      type: 'text',
      placeholder: getLocalizedValue({ en: 'e.g., 200, 404, 500...', ko: '예: 200, 404, 500...', zh: '例如：200, 404, 500...', vi: 'ví dụ: 200, 404, 500...' }, locale)
    },
    {
      name: 'dateRange',
      label: getLocalizedValue({ en: 'Search Period', ko: '조회 기간', zh: '搜索期间', vi: 'Khoảng thời gian' }, locale),
      type: 'date-range',
      startDateField: 'startDate',
      endDateField: 'endDate',
      startLabel: getLocalizedValue({ en: 'Start Date', ko: '시작일', zh: '开始日期', vi: 'Ngày bắt đầu' }, locale),
      endLabel: getLocalizedValue({ en: 'End Date', ko: '종료일', zh: '结束日期', vi: 'Ngày kết thúc' }, locale),
      gridSize: { xs: 12, sm: 6, md: 6 },
      dateOnly: true // Date only, time auto-filled (00:00:00 ~ 23:59:59)
    }
  ], [programIds, locale]);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'timestamp',
      headerName: getLocalizedValue({ en: 'Time', ko: '시간', zh: '时间', vi: 'Thời gian' }, locale),
      width: 180,
      valueFormatter: (value) => new Date(value).toLocaleString()
    },
    {
      field: 'method',
      headerName: getLocalizedValue({ en: 'Method', ko: '메서드', zh: '方法', vi: 'Phương thức' }, locale),
      width: 90,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getMethodColor(params.value)}
        />
      )
    },
    {
      field: 'path',
      headerName: getLocalizedValue({ en: 'Path', ko: '경로', zh: '路径', vi: 'Đường dẫn' }, locale),
      width: 200,
      flex: 1
    },
    {
      field: 'programId',
      headerName: getLocalizedValue({ en: 'Program', ko: '프로그램', zh: '程序', vi: 'Chương trình' }, locale),
      width: 150,
      renderCell: (params) => (
        <Tooltip title={params.value || 'N/A'}>
          <Chip
            label={params.value || 'N/A'}
            size="small"
            variant="outlined"
          />
        </Tooltip>
      )
    },
    {
      field: 'statusCode',
      headerName: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value)}
        />
      )
    },
    {
      field: 'duration',
      headerName: getLocalizedValue({ en: 'Duration', ko: '소요시간', zh: '持续时间', vi: 'Thời lượng' }, locale),
      width: 100
    },
    {
      field: 'userName',
      headerName: getLocalizedValue({ en: 'User', ko: '사용자', zh: '用户', vi: 'Người dùng' }, locale),
      width: 150,
      valueGetter: (_value, row) => row.userName || row.userId || 'N/A',
      renderCell: (params) => (
        <Tooltip title={`User ID: ${params.row.userId}`}>
          <span>{params.value}</span>
        </Tooltip>
      )
    },
    {
      field: 'ip',
      headerName: getLocalizedValue({ en: 'IP', ko: 'IP', zh: 'IP', vi: 'IP' }, locale),
      width: 120
    }
  ], [locale]);

  return (
    <RouteGuard programCode={programId || ''} requiredPermission="view" fallbackUrl="/dashboard">
      <PageContainer>
        <PageHeader useMenu showBreadcrumb />

      {error && (
        <Alert severity="error" sx={{ mb: 1, flexShrink: 0 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Quick Search Bar */}
      <QuickSearchBar
        searchValue={quickSearch}
        onSearchChange={setQuickSearch}
        onSearch={handleQuickSearch}
        onClear={handleQuickSearchClear}
        onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
        placeholder={getLocalizedValue({ en: 'Search by path, user, or program...', ko: '경로, 사용자 또는 프로그램으로 검색...', zh: '按路径、用户或程序搜索...', vi: 'Tìm theo đường dẫn, người dùng hoặc chương trình...' }, locale)}
        searching={loading}
        activeFilterCount={activeFilterCount}
        showAdvancedButton={true}
      />

      {/* Advanced Filter Panel - Only show when open */}
      {advancedFilterOpen && (
        <SearchFilterPanel
          title={`${t('common.search')} / ${t('common.filter')}`}
          activeFilterCount={activeFilterCount}
          onApply={handleAdvancedFilterApply}
          onClear={handleAdvancedSearchClear}
          onClose={handleAdvancedFilterClose}
          mode="advanced"
          expanded={true}
          showHeader={false}
        >
          <SearchFilterFields
            fields={filterFields}
            values={searchCriteria}
            onChange={handleSearchChange}
            onEnter={handleAdvancedFilterApply}
          />
        </SearchFilterPanel>
      )}

      {/* DataGrid Area - Flexible */}
      <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {logs.length === 0 && !loading ? (
          <EmptyState
            icon={Search}
            title={getLocalizedValue({ en: 'No logs loaded', ko: '로그가 없습니다', zh: '未加载日志', vi: 'Không có nhật ký' }, locale)}
            description={getLocalizedValue({ en: 'Use the search filters above to load log data', ko: '검색 필터를 사용하여 로그 데이터를 불러오세요', zh: '使用上面的搜索过滤器加载日志数据', vi: 'Sử dụng bộ lọc tìm kiếm ở trên để tải dữ liệu nhật ký' }, locale)}
          />
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ExcelDataGrid
              rows={logs}
              columns={columns}
              onRefresh={handleRefresh}
              exportFileName="system-logs"
              loading={loading}
              paginationMode="server"
              rowCount={rowCount}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
            />
          </Box>
        )}
      </Paper>
    </PageContainer>
    </RouteGuard>
  );
}
