import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
import { usePageState } from '@/hooks/usePageState';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';
import { Program, SearchCriteria } from '../types';
import { ProgramFormData } from '@/components/admin/ProgramFormFields';
import {
  multiLangFieldsToFormData,
  formDataToMultiLangFields,
  createEmptyMultiLangFormFields
} from '@/lib/i18n/multiLang';

interface UseProgramManagementOptions {
  storageKey?: string;
}

export const useProgramManagement = (options: UseProgramManagementOptions = {}) => {
  const { storageKey = 'admin-programs-page-state' } = options;

  // Use page state hook
  const {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data: programs,
    setData: setPrograms,
    rowCount,
    setRowCount
  } = usePageState<SearchCriteria, Program>({
    storageKey,
    initialCriteria: {
      code: '',
      name: '',
      category: '',
      type: '',
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
  const [editingProgram, setEditingProgram] = useState<ProgramFormData | null>(null);
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch programs from API
  const fetchPrograms = useCallback(async (
    page: number = 0,
    pageSize: number = 50,
    useQuickSearch: boolean = false
  ) => {
    try {
      setSearching(true);
      console.log('[useProgramManagement] fetchPrograms called - page:', page, 'pageSize:', pageSize, 'useQuickSearch:', useQuickSearch);

      // Build query parameters
      const params = new URLSearchParams();

      if (useQuickSearch && quickSearch) {
        // Quick search: search in code and name
        params.append('code', quickSearch);
        params.append('name', quickSearch);
        console.log('[useProgramManagement] Using quick search:', quickSearch);
      } else {
        // Advanced search: use specific criteria
        if (searchCriteria.code) params.append('code', searchCriteria.code);
        if (searchCriteria.name) params.append('name', searchCriteria.name);
        if (searchCriteria.category) params.append('category', searchCriteria.category);
        if (searchCriteria.type) params.append('type', searchCriteria.type);
        if (searchCriteria.status) params.append('status', searchCriteria.status);
        console.log('[useProgramManagement] Using advanced search:', searchCriteria);
      }

      params.append('page', (page + 1).toString()); // Backend uses 1-indexed
      params.append('limit', pageSize.toString());

      const url = `/program?${params.toString()}`;
      console.log('[useProgramManagement] API URL:', url);

      const response = await api.get(url);
      console.log('[useProgramManagement] API response:', response);

      // Programs now use MultiLangField format directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedPrograms = (response.programs || []).map((prog: any) => ({
        ...prog,
        version: prog.version || '',
        author: prog.author || '',
        tags: typeof prog.tags === 'string' ? prog.tags : (Array.isArray(prog.tags) ? prog.tags.join(', ') : '')
      }));

      console.log('[useProgramManagement] Transformed programs count:', transformedPrograms.length);
      setPrograms(transformedPrograms);

      // Update row count for DataGrid
      if (response.pagination) {
        console.log('[useProgramManagement] Using pagination totalCount:', response.pagination.totalCount);
        setRowCount(response.pagination.totalCount || 0);
      } else {
        console.log('[useProgramManagement] No pagination, using array length:', transformedPrograms.length);
        setRowCount(transformedPrograms.length);
      }
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      console.error('[useProgramManagement] Failed to fetch programs:', error);
      await showErrorMessage(err.response?.data?.error ? 'COMMON_LOAD_FAIL' : 'CRUD_PROGRAM_LOAD_FAIL');
      setPrograms([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria, setPrograms, setRowCount, showErrorMessage]);

  // Program CRUD operations
  const handleAdd = useCallback(() => {
    setEditingProgram({
      id: '',
      code: '',
      ...createEmptyMultiLangFormFields(),
      category: 'admin',
      type: 'page',
      status: 'development',
      version: '',
      author: '',
      tags: '',
      permissions: []
    } as any);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((id: string | number) => {
    const program = programs.find((p) => p.id === id);
    if (program) {
      const formFields = multiLangFieldsToFormData(program.name, program.description);

      setEditingProgram({
        id: program.id,
        code: program.code,
        ...formFields,
        category: program.category,
        type: program.type,
        status: program.status,
        version: program.version || '',
        author: program.author || '',
        tags: program.tags || '',
        permissions: program.permissions || []
      } as any);
      setDialogOpen(true);
    }
  }, [programs]);

  const handleSave = useCallback(async () => {
    if (!editingProgram) return;

    try {
      setSaveLoading(true);

      const { name, description } = formDataToMultiLangFields(editingProgram);

      // Transform data for API
      const apiData = {
        code: editingProgram.code,
        name,
        description,
        category: editingProgram.category,
        type: editingProgram.type,
        status: editingProgram.status,
        permissions: editingProgram.permissions || [],
        metadata: {
          version: editingProgram.version,
          author: editingProgram.author,
          tags: editingProgram.tags ? editingProgram.tags.split(',').map(t => t.trim()) : []
        }
      };

      if (!editingProgram.id) {
        // Add new program
        const response = await api.post('/program', apiData);

        setPrograms([...programs, response.program]);
        await showSuccessMessage('CRUD_PROGRAM_CREATE_SUCCESS');
      } else {
        // Update existing program
        const response = await api.put(`/program/${editingProgram.id}`, apiData);

        setPrograms(programs.map((p) => (p.id === editingProgram.id ? response.program : p)));
        await showSuccessMessage('CRUD_PROGRAM_UPDATE_SUCCESS');
      }

      setDialogOpen(false);
      setEditingProgram(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      await showErrorMessage('CRUD_PROGRAM_SAVE_FAIL');
      console.error('Failed to save program:', err);
    } finally {
      setSaveLoading(false);
    }
  }, [editingProgram, programs, setPrograms, showSuccessMessage, showErrorMessage]);

  const handleDeleteClick = useCallback((ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setDeleteLoading(true);

      // Delete programs from API
      for (const id of selectedForDelete) {
        await api.delete(`/program/${id}`);
      }

      // Remove from local state
      setPrograms(programs.filter((program) => !selectedForDelete.includes(program.id!)));

      // Show success message
      const count = selectedForDelete.length;
      await showSuccessMessage('CRUD_PROGRAM_DELETE_SUCCESS', { count });

      // Close dialog
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      await showErrorMessage('CRUD_PROGRAM_DELETE_FAIL');
      console.error('Failed to delete programs:', err);
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, programs, setPrograms, showSuccessMessage, showErrorMessage]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  }, []);

  // Search handlers
  const handleRefresh = useCallback(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchPrograms(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchPrograms, quickSearch, paginationModel]);

  const handleSearchChange = useCallback((field: keyof SearchCriteria, value: string | string[]) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  }, [setSearchCriteria]);

  const handleQuickSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchPrograms(0, paginationModel.pageSize, true);
  }, [fetchPrograms, paginationModel, setPaginationModel]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setPrograms([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 50 });
    sessionStorage.removeItem(storageKey);
  }, [setQuickSearch, setPrograms, setRowCount, setPaginationModel, storageKey]);

  const handleAdvancedSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchPrograms(0, paginationModel.pageSize, false);
  }, [fetchPrograms, paginationModel, setPaginationModel]);

  const handleAdvancedSearchClear = useCallback(() => {
    setSearchCriteria({
      code: '',
      name: '',
      category: '',
      type: '',
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
    fetchPrograms(newModel.page, newModel.pageSize, useQuickSearch);
  }, [fetchPrograms, quickSearch, setPaginationModel]);

  // Initial load - fetch programs on mount
  useEffect(() => {
    console.log('[useProgramManagement] Initial load triggered');
    fetchPrograms(0, 50, false);
  }, [fetchPrograms]);

  return {
    // State
    programs,
    setPrograms,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingProgram,
    setEditingProgram,
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
