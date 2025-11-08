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
import { GridColDef } from '@mui/x-data-grid';
import { api } from '@/lib/axios';
import { useI18n } from '@/lib/i18n/client';
import type { LogEntry } from '@/types/log';

interface SearchCriteria {
  method: string;
  path: string;
  userId: string;
  programId: string;
  statusCode: string;
  startDate: string;
  endDate: string;
  [key: string]: string;
}

// Session storage key for state persistence
const STORAGE_KEY = 'admin-logs-page-state';

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

  // Load saved state on mount
  const savedState = loadPageState();

  const [logs, setLogs] = useState<LogEntry[]>(savedState?.logs || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickSearch, setQuickSearch] = useState(savedState?.quickSearch || '');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(
    savedState?.searchCriteria || {
      method: '',
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

  // Check if there's saved state with data on mount
  useEffect(() => {
    if (savedState && (savedState.logs?.length > 0 || savedState.quickSearch ||
        Object.values(savedState.searchCriteria || {}).some(v => v !== ''))) {
      // Data already loaded from savedState, no need to fetch again
      // User can click refresh if they want fresh data
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
        if (searchCriteria.method) params.append('method', searchCriteria.method);
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

  const handleQuickSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchLogs(0, paginationModel.pageSize, true);
  };

  const handleAdvancedSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    setAdvancedFilterOpen(false);
    fetchLogs(0, paginationModel.pageSize, false);
  };

  const handleClearFilters = () => {
    setQuickSearch('');
    setSearchCriteria({
      method: '',
      path: '',
      userId: '',
      programId: '',
      statusCode: '',
      startDate: '',
      endDate: ''
    });
    setPaginationModel({ ...paginationModel, page: 0 });
    setLogs([]);
    setRowCount(0);
  };

  const handleRefresh = () => {
    fetchLogs(paginationModel.page, paginationModel.pageSize, !!quickSearch);
  };

  const handlePaginationModelChange = (newModel: { page: number; pageSize: number }) => {
    setPaginationModel(newModel);
    fetchLogs(newModel.page, newModel.pageSize, !!quickSearch);
  };

  const getStatusColor = (statusCode: number): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 300 && statusCode < 400) return 'info';
    if (statusCode >= 400 && statusCode < 500) return 'warning';
    if (statusCode >= 500) return 'error';
    return 'default';
  };

  const getMethodColor = (method: string): 'primary' | 'success' | 'warning' | 'error' | 'default' => {
    switch (method) {
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

  const filterFieldsConfig: FilterFieldConfig[] = [
    {
      name: 'method',
      label: 'Method',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'PATCH', label: 'PATCH' },
        { value: 'DELETE', label: 'DELETE' }
      ],
      gridSize: { xs: 12, sm: 6, md: 4 }
    },
    {
      name: 'path',
      label: 'Path',
      type: 'text',
      gridSize: { xs: 12, sm: 6, md: 4 }
    },
    {
      name: 'userId',
      label: 'User ID',
      type: 'text',
      gridSize: { xs: 12, sm: 6, md: 4 }
    },
    {
      name: 'programId',
      label: 'Program ID',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        ...programIds.map(id => ({ value: id, label: id }))
      ],
      gridSize: { xs: 12, sm: 6, md: 4 }
    },
    {
      name: 'statusCode',
      label: 'Status Code',
      type: 'text',
      gridSize: { xs: 12, sm: 6, md: 4 }
    },
    {
      name: 'startDate',
      label: 'Start Date',
      type: 'datetime-local',
      gridSize: { xs: 12, sm: 6, md: 4 }
    },
    {
      name: 'endDate',
      label: 'End Date',
      type: 'datetime-local',
      gridSize: { xs: 12, sm: 6, md: 4 }
    }
  ];

  const columns: GridColDef[] = [
    {
      field: 'timestamp',
      headerName: 'Time',
      width: 180,
      valueFormatter: (value) => new Date(value).toLocaleString()
    },
    {
      field: 'method',
      headerName: 'Method',
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
      headerName: 'Path',
      width: 200,
      flex: 1
    },
    {
      field: 'programId',
      headerName: 'Program',
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
      headerName: 'Status',
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
      headerName: 'Duration',
      width: 100
    },
    {
      field: 'userId',
      headerName: 'User',
      width: 120
    },
    {
      field: 'ip',
      headerName: 'IP',
      width: 120
    }
  ];

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Quick Search Bar */}
      <QuickSearchBar
        value={quickSearch}
        onChange={setQuickSearch}
        onSearch={handleQuickSearch}
        onAdvancedFilter={() => setAdvancedFilterOpen(true)}
        onClear={handleClearFilters}
        placeholder="Search by path, user ID, or program ID..."
        disabled={loading}
      />

      {/* Advanced Filter Panel */}
      <SearchFilterPanel
        open={advancedFilterOpen}
        onClose={() => setAdvancedFilterOpen(false)}
        onSearch={handleAdvancedSearch}
        onClear={handleClearFilters}
      >
        <SearchFilterFields
          fields={filterFieldsConfig}
          values={searchCriteria}
          onChange={setSearchCriteria}
        />
      </SearchFilterPanel>

      {/* Empty State */}
      {logs.length === 0 && !loading && (
        <EmptyState
          icon={Search}
          message="No logs loaded"
          description="Click the refresh button or use search filters to load log data"
        />
      )}

      {/* DataGrid */}
      {logs.length > 0 && (
        <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
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
        </Paper>
      )}
    </PageContainer>
  );
}
