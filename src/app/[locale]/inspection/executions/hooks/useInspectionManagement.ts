import { useState, useEffect, useCallback } from 'react';
import { inspectionApi } from '@/lib/axios';
import { usePageState } from '@/hooks/usePageState';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { inspectionStore } from '@/lib/offline/inspectionStore';
import { Inspection, ChecksheetTemplate, SearchCriteria, InspectionStatus } from '../types';

interface UseInspectionManagementOptions {
  storageKey?: string;
}

export const useInspectionManagement = (options: UseInspectionManagementOptions = {}) => {
  const { storageKey = 'inspection-executions-page-state' } = options;

  const {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data: inspections,
    setData: setInspections,
    rowCount,
    setRowCount,
  } = usePageState<SearchCriteria, Inspection>({
    storageKey,
    initialCriteria: {
      inspection_code: '',
      template_id: '',
      inspector_id: '',
      status: '',
      location: '',
      date_from: '',
      date_to: '',
    },
    initialPaginationModel: {
      page: 0,
      pageSize: 50,
    },
  });

  const locale = useCurrentLocale();
  const { successMessage, errorMessage, showSuccessMessage, showErrorMessage } = useMessage({ locale });

  // Offline mode support
  const {
    isEffectivelyOffline,
    hasOfflineData,
    isOfflineModeEnabled,
    isNetworkAvailable,
    offlineStats,
    downloadProgress,
    isDownloading,
  } = useOfflineMode();

  // States
  const [templates, setTemplates] = useState<ChecksheetTemplate[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch templates for dropdown (offline-aware)
  const fetchTemplates = useCallback(async () => {
    try {
      if (isEffectivelyOffline && hasOfflineData) {
        // Fetch from IndexedDB
        const offlineTemplates = await inspectionStore.getAllTemplates();
        setTemplates(offlineTemplates as unknown as ChecksheetTemplate[]);
      } else {
        // Fetch from server
        const response = await inspectionApi.get('/templates?status=active&limit=1000');
        setTemplates(response.templates || []);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  }, [isEffectivelyOffline, hasOfflineData]);

  // Fetch inspections (offline-aware)
  const fetchInspections = useCallback(
    async (page: number = 0, pageSize: number = 50, useQuickSearch: boolean = false) => {
      try {
        setSearching(true);

        // Offline mode: fetch from IndexedDB
        if (isEffectivelyOffline && hasOfflineData) {
          const allInspections = await inspectionStore.getAllInspections();

          // Apply filtering (use any type for offline data)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let filteredInspections: any[] = allInspections;

          if (useQuickSearch && quickSearch) {
            const searchLower = quickSearch.toLowerCase();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filteredInspections = allInspections.filter((i: any) =>
              i.inspection_code?.toLowerCase().includes(searchLower) ||
              i.title?.toLowerCase().includes(searchLower) ||
              i.location?.toLowerCase().includes(searchLower)
            );
          } else {
            if (searchCriteria.inspection_code) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              filteredInspections = filteredInspections.filter((i: any) =>
                i.inspection_code?.toLowerCase().includes(searchCriteria.inspection_code.toLowerCase())
              );
            }
            if (searchCriteria.template_id) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              filteredInspections = filteredInspections.filter((i: any) =>
                i.template_id === searchCriteria.template_id
              );
            }
            if (searchCriteria.status) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              filteredInspections = filteredInspections.filter((i: any) =>
                i.status === searchCriteria.status
              );
            }
            if (searchCriteria.location) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              filteredInspections = filteredInspections.filter((i: any) =>
                i.location?.toLowerCase().includes(searchCriteria.location.toLowerCase())
              );
            }
          }

          // Apply pagination
          const totalCount = filteredInspections.length;
          const startIndex = page * pageSize;
          const paginatedInspections = filteredInspections.slice(startIndex, startIndex + pageSize);

          setInspections(paginatedInspections as Inspection[]);
          setRowCount(totalCount);
          return;
        }

        // Online mode: fetch from server
        const params = new URLSearchParams();

        if (useQuickSearch && quickSearch) {
          params.append('search', quickSearch);
        } else {
          if (searchCriteria.inspection_code) params.append('inspection_code', searchCriteria.inspection_code);
          if (searchCriteria.template_id) params.append('template_id', searchCriteria.template_id);
          if (searchCriteria.inspector_id) params.append('inspector_id', searchCriteria.inspector_id);
          if (searchCriteria.status) params.append('status', searchCriteria.status);
          if (searchCriteria.location) params.append('location', searchCriteria.location);
          if (searchCriteria.date_from) params.append('date_from', searchCriteria.date_from);
          if (searchCriteria.date_to) params.append('date_to', searchCriteria.date_to);
        }

        params.append('page', (page + 1).toString());
        params.append('limit', pageSize.toString());

        const response = await inspectionApi.get(`/executions?${params.toString()}`);
        setInspections(response.inspections || []);

        if (response.pagination) {
          setRowCount(response.pagination.total || response.pagination.totalCount || 0);
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
    [quickSearch, searchCriteria, setInspections, setRowCount, showErrorMessage, isEffectivelyOffline, hasOfflineData]
  );

  // CRUD operations
  const handleAdd = useCallback(() => {
    setEditingInspection({
      id: '',
      template_id: '',
      inspection_code: '',
      title: '',
      description: '',
      inspector_id: '',
      location: '',
      inspection_date: new Date().toISOString().split('T')[0],
      status: 'draft' as InspectionStatus,
      created_at: '',
      updated_at: '',
    });
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback(
    (id: string | number) => {
      const inspection = inspections.find((i) => i.id === id);
      if (inspection) {
        setEditingInspection(inspection);
        setDialogOpen(true);
      }
    },
    [inspections]
  );

  const handleView = useCallback((id: string | number) => {
    window.location.href = `/${locale}/inspection/executions/${id}`;
  }, [locale]);

  const handleStartInspection = useCallback((id: string | number) => {
    window.location.href = `/${locale}/inspection/executions/${id}/execute`;
  }, [locale]);

  const handleSave = useCallback(async () => {
    if (!editingInspection) return;

    try {
      setSaveLoading(true);

      if (!editingInspection.id) {
        const response = await inspectionApi.post('/executions', editingInspection);
        setInspections([...inspections, response.inspection]);
        await showSuccessMessage('COMMON_CREATE_SUCCESS');
      } else {
        const response = await inspectionApi.put(`/executions/${editingInspection.id}`, editingInspection);
        setInspections(inspections.map((i) => (i.id === editingInspection.id ? response.inspection : i)));
        await showSuccessMessage('COMMON_UPDATE_SUCCESS');
      }

      setDialogOpen(false);
      setEditingInspection(null);
    } catch (error) {
      console.error('Failed to save inspection:', error);
      await showErrorMessage('COMMON_SAVE_FAIL');
    } finally {
      setSaveLoading(false);
    }
  }, [editingInspection, inspections, setInspections, showSuccessMessage, showErrorMessage]);

  const handleDeleteClick = useCallback((ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setDeleteLoading(true);

      for (const id of selectedForDelete) {
        await inspectionApi.delete(`/executions/${id}`);
      }

      setInspections(inspections.filter((i) => !selectedForDelete.includes(i.id)));
      await showSuccessMessage('COMMON_DELETE_SUCCESS');

      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (error) {
      console.error('Failed to delete inspections:', error);
      await showErrorMessage('COMMON_DELETE_FAIL');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, inspections, setInspections, showSuccessMessage, showErrorMessage]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  }, []);

  // Search handlers
  const handleRefresh = useCallback(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchInspections(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchInspections, quickSearch, paginationModel]);

  const handleSearchChange = useCallback(
    (field: keyof SearchCriteria, value: string | string[]) => {
      setSearchCriteria((prev) => ({ ...prev, [field]: value }));
    },
    [setSearchCriteria]
  );

  const handleQuickSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchInspections(0, paginationModel.pageSize, true);
  }, [fetchInspections, paginationModel, setPaginationModel]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setInspections([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 50 });
    sessionStorage.removeItem(storageKey);
  }, [setQuickSearch, setInspections, setRowCount, setPaginationModel, storageKey]);

  const handleAdvancedFilterApply = useCallback(() => {
    setAdvancedFilterOpen(false);
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchInspections(0, paginationModel.pageSize, false);
  }, [fetchInspections, paginationModel, setPaginationModel]);

  const handleAdvancedFilterClose = useCallback(() => {
    setAdvancedFilterOpen(false);
  }, []);

  const handlePaginationModelChange = useCallback(
    (newModel: { page: number; pageSize: number }) => {
      setPaginationModel(newModel);
      const useQuickSearch = quickSearch.trim() !== '';
      fetchInspections(newModel.page, newModel.pageSize, useQuickSearch);
    },
    [fetchInspections, quickSearch, setPaginationModel]
  );

  // Initial fetch
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchInspections(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, []);

  return {
    // State
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

    // Offline mode state
    isEffectivelyOffline,
    hasOfflineData,
    isOfflineModeEnabled,
    isNetworkAvailable,
    offlineStats,
    downloadProgress,
    isDownloading,

    // Handlers
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
  };
};
