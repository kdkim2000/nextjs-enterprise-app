import { useState, useEffect, useCallback } from 'react';
import { inspectionApi } from '@/lib/axios';
import { usePageState } from '@/hooks/usePageState';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';
import { ChecksheetTemplate, SearchCriteria, TemplateStatus } from '../types';

interface UseTemplateManagementOptions {
  storageKey?: string;
}

export const useTemplateManagement = (options: UseTemplateManagementOptions = {}) => {
  const { storageKey = 'inspection-templates-page-state' } = options;

  // Use page state hook
  const {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data: templates,
    setData: setTemplates,
    rowCount,
    setRowCount,
  } = usePageState<SearchCriteria, ChecksheetTemplate>({
    storageKey,
    initialCriteria: {
      code: '',
      name: '',
      category: '',
      status: '',
      created_by: '',
    },
    initialPaginationModel: {
      page: 0,
      pageSize: 50,
    },
  });

  // Use unified message system
  const locale = useCurrentLocale();
  const { successMessage, errorMessage, showSuccessMessage, showErrorMessage } = useMessage({ locale });

  // Local states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecksheetTemplate | null>(null);
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch templates from API
  const fetchTemplates = useCallback(
    async (page: number = 0, pageSize: number = 50, useQuickSearch: boolean = false) => {
      try {
        setSearching(true);

        // Build query parameters
        const params = new URLSearchParams();

        if (useQuickSearch && quickSearch) {
          params.append('search', quickSearch);
        } else {
          if (searchCriteria.code) params.append('code', searchCriteria.code);
          if (searchCriteria.name) params.append('name', searchCriteria.name);
          if (searchCriteria.category) params.append('category', searchCriteria.category);
          if (searchCriteria.status) params.append('status', searchCriteria.status);
          if (searchCriteria.created_by) params.append('created_by', searchCriteria.created_by);
        }

        params.append('page', (page + 1).toString());
        params.append('limit', pageSize.toString());

        const response = await inspectionApi.get(`/templates?${params.toString()}`);
        setTemplates(response.templates || []);

        if (response.pagination) {
          setRowCount(response.pagination.totalCount || 0);
        } else {
          setRowCount(response.templates?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
        await showErrorMessage('COMMON_LOAD_FAIL');
        setTemplates([]);
        setRowCount(0);
      } finally {
        setSearching(false);
      }
    },
    [quickSearch, searchCriteria, setTemplates, setRowCount, showErrorMessage]
  );

  // Template CRUD operations
  const handleAdd = useCallback(() => {
    setEditingTemplate({
      id: '',
      code: '',
      name: '',
      description: '',
      category: '',
      version: 1,
      status: 'draft' as TemplateStatus,
      created_by: '',
      created_at: '',
      updated_at: '',
    });
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback(
    (id: string | number) => {
      const template = templates.find((t) => t.id === id);
      if (template) {
        setEditingTemplate(template);
        setDialogOpen(true);
      }
    },
    [templates]
  );

  const handleView = useCallback((id: string | number) => {
    // Navigate to template detail page
    window.location.href = `/${locale}/inspection/templates/${id}`;
  }, [locale]);

  const handleClone = useCallback(
    async (id: string | number) => {
      try {
        setSaveLoading(true);
        const response = await inspectionApi.post(`/templates/${id}/clone`);

        if (response.template) {
          setTemplates([response.template, ...templates]);
          await showSuccessMessage('COMMON_CREATE_SUCCESS');
        }
      } catch (error) {
        console.error('Failed to clone template:', error);
        await showErrorMessage('COMMON_SAVE_FAIL');
      } finally {
        setSaveLoading(false);
      }
    },
    [templates, setTemplates, showSuccessMessage, showErrorMessage]
  );

  const handleSave = useCallback(async () => {
    if (!editingTemplate) return;

    try {
      setSaveLoading(true);

      if (!editingTemplate.id) {
        // Create new template
        const response = await inspectionApi.post('/templates', editingTemplate);
        setTemplates([...templates, response.template]);
        await showSuccessMessage('COMMON_CREATE_SUCCESS');
      } else {
        // Update existing template
        const response = await inspectionApi.put(`/templates/${editingTemplate.id}`, editingTemplate);
        setTemplates(templates.map((t) => (t.id === editingTemplate.id ? response.template : t)));
        await showSuccessMessage('COMMON_UPDATE_SUCCESS');
      }

      setDialogOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Failed to save template:', error);
      await showErrorMessage('COMMON_SAVE_FAIL');
    } finally {
      setSaveLoading(false);
    }
  }, [editingTemplate, templates, setTemplates, showSuccessMessage, showErrorMessage]);

  const handleDeleteClick = useCallback((ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setDeleteLoading(true);

      for (const id of selectedForDelete) {
        await inspectionApi.delete(`/templates/${id}`);
      }

      setTemplates(templates.filter((t) => !selectedForDelete.includes(t.id)));
      await showSuccessMessage('COMMON_DELETE_SUCCESS');

      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (error) {
      console.error('Failed to delete templates:', error);
      await showErrorMessage('COMMON_DELETE_FAIL');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, templates, setTemplates, showSuccessMessage, showErrorMessage]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  }, []);

  // Search handlers
  const handleRefresh = useCallback(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchTemplates(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchTemplates, quickSearch, paginationModel]);

  const handleSearchChange = useCallback(
    (field: keyof SearchCriteria, value: string | string[]) => {
      setSearchCriteria((prev) => ({ ...prev, [field]: value }));
    },
    [setSearchCriteria]
  );

  const handleQuickSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchTemplates(0, paginationModel.pageSize, true);
  }, [fetchTemplates, paginationModel, setPaginationModel]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setTemplates([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 50 });
    sessionStorage.removeItem(storageKey);
  }, [setQuickSearch, setTemplates, setRowCount, setPaginationModel, storageKey]);

  const handleAdvancedFilterApply = useCallback(() => {
    setAdvancedFilterOpen(false);
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchTemplates(0, paginationModel.pageSize, false);
  }, [fetchTemplates, paginationModel, setPaginationModel]);

  const handleAdvancedFilterClose = useCallback(() => {
    setAdvancedFilterOpen(false);
  }, []);

  const handlePaginationModelChange = useCallback(
    (newModel: { page: number; pageSize: number }) => {
      setPaginationModel(newModel);
      const useQuickSearch = quickSearch.trim() !== '';
      fetchTemplates(newModel.page, newModel.pageSize, useQuickSearch);
    },
    [fetchTemplates, quickSearch, setPaginationModel]
  );

  // Initial fetch
  useEffect(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchTemplates(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, []);

  return {
    // State
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

    // Handlers
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
  };
};
