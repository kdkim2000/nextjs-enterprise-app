import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/axios';
import { usePageState } from '@/hooks/usePageState';
import { useAutoHideMessage } from '@/hooks/useAutoHideMessage';
import { HelpContent, SearchCriteria } from '../types';

interface UseHelpManagementOptions {
  storageKey?: string;
}

export const useHelpManagement = (options: UseHelpManagementOptions = {}) => {
  const { storageKey = 'admin-help-page-state' } = options;
  const searchParams = useSearchParams();

  // Use page state hook
  const {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data: helps,
    setData: setHelps,
    rowCount,
    setRowCount
  } = usePageState<SearchCriteria, HelpContent>({
    storageKey,
    initialCriteria: {
      programId: '',
      title: '',
      language: '',
      status: ''
    },
    initialPaginationModel: {
      page: 0,
      pageSize: 50
    }
  });

  // Use auto-hide message hook
  const { successMessage, errorMessage, showSuccess, showError } = useAutoHideMessage();

  // Local states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHelp, setEditingHelp] = useState<HelpContent | null>(null);
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpExists, setHelpExists] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check user role and help content availability on mount
  useEffect(() => {
    const checkHelpAndRole = async () => {
      try {
        // Check if user is admin
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setIsAdmin(user.role === 'admin');
        }

        // Check if help content exists for this page
        try {
          const response = await api.get('/help?programId=PROG-HELP-MGMT&language=en');
          setHelpExists(!!response.help);
        } catch {
          setHelpExists(false);
        }
      } catch (error) {
        console.error('Error checking help and role:', error);
        setHelpExists(false);
      }
    };

    checkHelpAndRole();
  }, []);

  // Check URL parameters for programId and open add dialog
  useEffect(() => {
    const programIdParam = searchParams.get('programId');
    if (programIdParam) {
      // Open add dialog with programId pre-filled
      setEditingHelp({
        id: '',
        programId: programIdParam,
        title: '',
        content: '',
        sections: [],
        faqs: [],
        relatedLinks: [],
        status: 'draft',
        language: 'en'
      });
      setDialogOpen(true);

      // Clean up URL parameter after opening dialog
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  // Fetch helps from API
  const fetchHelps = useCallback(async (
    page: number = 0,
    pageSize: number = 50,
    useQuickSearch: boolean = false
  ) => {
    try {
      setSearching(true);

      // Build query parameters
      const params = new URLSearchParams();

      if (useQuickSearch && quickSearch) {
        // Quick search: search in programId and title
        params.append('programId', quickSearch);
        params.append('title', quickSearch);
      } else {
        // Advanced search: use specific criteria
        if (searchCriteria.programId) params.append('programId', searchCriteria.programId);
        if (searchCriteria.title) params.append('title', searchCriteria.title);
        if (searchCriteria.language) params.append('language', searchCriteria.language);
        if (searchCriteria.status) params.append('status', searchCriteria.status);
      }

      params.append('page', (page + 1).toString()); // Backend uses 1-indexed
      params.append('limit', pageSize.toString());

      const response = await api.get(`/help?${params.toString()}`);
      setHelps(response.helps || []);

      // Update row count for DataGrid
      if (response.pagination) {
        setRowCount(response.pagination.total || 0);
      } else {
        setRowCount(response.helps?.length || 0);
      }
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      showError(err.response?.data?.error || 'Failed to load help content');
      console.error('Failed to fetch helps:', error);
      setHelps([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria, setHelps, setRowCount, showError]);

  // Help CRUD operations
  const handleAdd = useCallback(() => {
    setEditingHelp({
      id: '',
      programId: '',
      title: '',
      content: '',
      sections: [],
      faqs: [],
      relatedLinks: [],
      status: 'draft',
      language: 'en'
    });
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((id: string | number) => {
    const help = helps.find((h) => h.id === id);
    if (help) {
      setEditingHelp(help);
      setDialogOpen(true);
    }
  }, [helps]);

  const handleSave = useCallback(async () => {
    if (!editingHelp) return;

    try {
      setSaveLoading(true);

      if (!editingHelp.id) {
        // Add new help
        const response = await api.post('/help', editingHelp);
        setHelps([...helps, response.help]);
        showSuccess('Help content created successfully');
      } else {
        // Update existing help
        const response = await api.put('/help', editingHelp);
        setHelps(helps.map((h) => (h.id === editingHelp.id ? response.help : h)));
        showSuccess('Help content updated successfully');
      }

      setDialogOpen(false);
      setEditingHelp(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to save help content');
      console.error('Failed to save help:', err);
    } finally {
      setSaveLoading(false);
    }
  }, [editingHelp, helps, setHelps, showSuccess, showError]);

  const handleDeleteClick = useCallback((ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setDeleteLoading(true);

      // Delete helps from API
      for (const id of selectedForDelete) {
        await api.delete(`/help?id=${id}`);
      }

      // Remove from local state
      setHelps(helps.filter((help) => !selectedForDelete.includes(help.id)));

      // Show success message
      const count = selectedForDelete.length;
      showSuccess(`Successfully deleted ${count} help content${count > 1 ? 's' : ''}`);

      // Close dialog
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to delete help content');
      console.error('Failed to delete helps:', err);
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, helps, setHelps, showSuccess, showError]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  }, []);

  // Search handlers
  const handleRefresh = useCallback(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchHelps(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchHelps, quickSearch, paginationModel]);

  const handleSearchChange = useCallback((field: keyof SearchCriteria, value: string | string[]) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  }, [setSearchCriteria]);

  const handleQuickSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchHelps(0, paginationModel.pageSize, true);
  }, [fetchHelps, paginationModel, setPaginationModel]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setHelps([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 50 });
    sessionStorage.removeItem(storageKey);
  }, [setQuickSearch, setHelps, setRowCount, setPaginationModel, storageKey]);

  const handleAdvancedSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchHelps(0, paginationModel.pageSize, false);
  }, [fetchHelps, paginationModel, setPaginationModel]);

  const handleAdvancedSearchClear = useCallback(() => {
    setSearchCriteria({
      programId: '',
      title: '',
      language: '',
      status: ''
    });
    sessionStorage.removeItem(storageKey);
  }, [setSearchCriteria, storageKey]);

  const handleAdvancedFilterApply = useCallback(() => {
    setAdvancedFilterOpen(false);
    handleAdvancedSearch();
  }, [handleAdvancedSearch]);

  const handleAdvancedFilterClose = useCallback(() => {
    setAdvancedFilterOpen(false);
  }, []);

  const handlePaginationModelChange = useCallback((newModel: { page: number; pageSize: number }) => {
    setPaginationModel(newModel);
    const useQuickSearch = quickSearch.trim() !== '';
    fetchHelps(newModel.page, newModel.pageSize, useQuickSearch);
  }, [fetchHelps, quickSearch, setPaginationModel]);

  return {
    // State
    helps,
    setHelps,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingHelp,
    setEditingHelp,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    deleteConfirmOpen,
    selectedForDelete,
    deleteLoading,
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    successMessage,
    errorMessage,
    showError,

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
    handleAdvancedSearch,
    handleAdvancedSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange,
    setDialogOpen
  };
};
