import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
import { usePageState } from '@/hooks/usePageState';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';
import { Code, SearchCriteria } from '../types';
import { CodeFormData } from '@/components/admin/CodeFormFields';
import {
  multiLangFieldsToFormData,
  formDataToMultiLangFields,
  createEmptyMultiLangFormFields
} from '../utils';

interface UseCodeManagementOptions {
  storageKey?: string;
}

export const useCodeManagement = (options: UseCodeManagementOptions = {}) => {
  const { storageKey = 'admin-codes-page-state' } = options;

  // Use page state hook
  const {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data: codes,
    setData: setCodes,
    rowCount,
    setRowCount
  } = usePageState<SearchCriteria, Code>({
    storageKey,
    initialCriteria: {
      codeType: '',
      code: '',
      status: ''
    },
    initialPaginationModel: {
      page: 0,
      pageSize: 50
    }
  });

  // Use unified message system
  const locale = useCurrentLocale();
  const {
    successMessage,
    errorMessage,
    showSuccessMessage,
    showErrorMessage
  } = useMessage({ locale });

  // Local states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<CodeFormData | null>(null);
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
          const response = await api.get('/help?programId=PROG-CODE-MGMT&language=en');
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

  // Fetch codes from API
  const fetchCodes = useCallback(async (
    page: number = 0,
    pageSize: number = 50,
    useQuickSearch: boolean = false
  ) => {
    try {
      setSearching(true);

      // Build query parameters
      const params = new URLSearchParams();

      if (useQuickSearch && quickSearch) {
        // Quick search: search in codeType and code
        params.append('codeType', quickSearch);
        params.append('code', quickSearch);
      } else {
        // Advanced search: use specific criteria
        if (searchCriteria.codeType) params.append('codeType', searchCriteria.codeType);
        if (searchCriteria.code) params.append('code', searchCriteria.code);
        if (searchCriteria.status) params.append('status', searchCriteria.status);
      }

      params.append('page', (page + 1).toString()); // Backend uses 1-indexed
      params.append('limit', pageSize.toString());

      const response = await api.get(`/code?${params.toString()}`);
      setCodes(response.codes || []);

      // Update row count for DataGrid
      if (response.pagination) {
        setRowCount(response.pagination.totalCount || 0);
      } else {
        setRowCount(response.codes?.length || 0);
      }
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      await showErrorMessage(err.response?.data?.error ? 'COMMON_LOAD_FAIL' : 'CRUD_CODE_LOAD_FAIL');
      console.error('Failed to fetch codes:', error);
      setCodes([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria, setCodes, setRowCount, showErrorMessage]);

  // Code CRUD operations
  const handleAdd = useCallback(() => {
    setEditingCode({
      id: '',
      codeType: '',
      code: '',
      ...createEmptyMultiLangFormFields(),
      order: 1,
      status: 'active',
      parentCode: '',
      attributes: '{}'
    } as any);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((id: string | number) => {
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
      setDialogOpen(true);
    }
  }, [codes]);

  const handleSave = useCallback(async () => {
    if (!editingCode) return;

    try {
      setSaveLoading(true);

      // Parse attributes JSON
      let attributes = {};
      try {
        attributes = JSON.parse(editingCode.attributes || '{}');
      } catch (e) {
        await showErrorMessage('VALIDATION_JSON_INVALID');
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
        // Add new code
        const response = await api.post('/code', payload);
        setCodes([...codes, response.code]);
        await showSuccessMessage('CRUD_CODE_CREATE_SUCCESS');
      } else {
        // Update existing code
        const response = await api.put(`/code/${editingCode.id}`, payload);
        setCodes(codes.map((c) => (c.id === editingCode.id ? response.code : c)));
        await showSuccessMessage('CRUD_CODE_UPDATE_SUCCESS');
      }

      setDialogOpen(false);
      setEditingCode(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      await showErrorMessage('CRUD_CODE_SAVE_FAIL');
      console.error('Failed to save code:', err);
    } finally {
      setSaveLoading(false);
    }
  }, [editingCode, codes, setCodes, showSuccessMessage, showErrorMessage]);

  const handleDeleteClick = useCallback((ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setDeleteLoading(true);

      // Delete codes from API
      for (const id of selectedForDelete) {
        await api.delete(`/code/${id}`);
      }

      // Remove from local state
      setCodes(codes.filter((code) => !selectedForDelete.includes(code.id)));

      // Show success message
      const count = selectedForDelete.length;
      await showSuccessMessage('CRUD_CODE_DELETE_SUCCESS', { count });

      // Close dialog
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      await showErrorMessage('CRUD_CODE_DELETE_FAIL');
      console.error('Failed to delete codes:', err);
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, codes, setCodes, showSuccessMessage, showErrorMessage]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  }, []);

  // Search handlers
  const handleRefresh = useCallback(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchCodes(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchCodes, quickSearch, paginationModel]);

  const handleSearchChange = useCallback((field: keyof SearchCriteria, value: string | string[]) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  }, [setSearchCriteria]);

  const handleQuickSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchCodes(0, paginationModel.pageSize, true);
  }, [fetchCodes, paginationModel, setPaginationModel]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setCodes([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 50 });
    sessionStorage.removeItem(storageKey);
  }, [setQuickSearch, setCodes, setRowCount, setPaginationModel, storageKey]);

  const handleAdvancedSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchCodes(0, paginationModel.pageSize, false);
  }, [fetchCodes, paginationModel, setPaginationModel]);

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
    fetchCodes(newModel.page, newModel.pageSize, useQuickSearch);
  }, [fetchCodes, quickSearch, setPaginationModel]);

  return {
    // State
    codes,
    setCodes,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingCode,
    setEditingCode,
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
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange,
    setDialogOpen,
    fetchCodes
  };
};
