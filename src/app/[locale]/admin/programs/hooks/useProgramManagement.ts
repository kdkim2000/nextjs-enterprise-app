import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
import { usePageState } from '@/hooks/usePageState';
import { useAutoHideMessage } from '@/hooks/useAutoHideMessage';
import { Program, SearchCriteria } from '../types';

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

  // Use auto-hide message hook
  const { successMessage, errorMessage, showSuccess, showError } = useAutoHideMessage();

  // Local states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
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
          const response = await api.get('/help?programId=PROG-PROGRAM-LIST&language=en');
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

  // Fetch programs from API
  const fetchPrograms = useCallback(async (
    page: number = 0,
    pageSize: number = 50,
    useQuickSearch: boolean = false
  ) => {
    try {
      setSearching(true);

      // Build query parameters
      const params = new URLSearchParams();

      if (useQuickSearch && quickSearch) {
        // Quick search: search in code and name
        params.append('code', quickSearch);
        params.append('name', quickSearch);
      } else {
        // Advanced search: use specific criteria
        if (searchCriteria.code) params.append('code', searchCriteria.code);
        if (searchCriteria.name) params.append('name', searchCriteria.name);
        if (searchCriteria.category) params.append('category', searchCriteria.category);
        if (searchCriteria.type) params.append('type', searchCriteria.type);
        if (searchCriteria.status) params.append('status', searchCriteria.status);
      }

      params.append('page', (page + 1).toString()); // Backend uses 1-indexed
      params.append('limit', pageSize.toString());

      const response = await api.get(`/program?${params.toString()}`);

      // Transform data for grid
      const transformedPrograms = (response.programs || []).map((prog: {
        id?: string;
        code: string;
        name: { en: string; ko: string };
        description: { en: string; ko: string };
        category: string;
        type: string;
        status: string;
        permissions?: Array<{
          code: string;
          name: { en: string; ko: string };
          description: { en: string; ko: string };
          isDefault?: boolean;
        }>;
        metadata?: { version?: string; author?: string; tags?: string[] };
      }) => ({
        id: prog.id,
        code: prog.code,
        nameEn: prog.name.en,
        nameKo: prog.name.ko,
        descriptionEn: prog.description.en,
        descriptionKo: prog.description.ko,
        category: prog.category,
        type: prog.type as 'page' | 'function' | 'api' | 'report',
        status: prog.status as 'active' | 'inactive' | 'development',
        permissions: prog.permissions || [],
        version: prog.metadata?.version || '',
        author: prog.metadata?.author || '',
        tags: prog.metadata?.tags?.join(', ') || ''
      }));

      setPrograms(transformedPrograms);

      // Update row count for DataGrid
      if (response.pagination) {
        setRowCount(response.pagination.totalCount || 0);
      } else {
        setRowCount(transformedPrograms.length);
      }
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      showError(err.response?.data?.error || 'Failed to load programs');
      console.error('Failed to fetch programs:', error);
      setPrograms([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria, setPrograms, setRowCount, showError]);

  // Program CRUD operations
  const handleAdd = useCallback(() => {
    setEditingProgram({
      id: '',
      code: '',
      nameEn: '',
      nameKo: '',
      descriptionEn: '',
      descriptionKo: '',
      category: 'admin',
      type: 'page',
      status: 'development',
      version: '',
      author: '',
      tags: '',
      permissions: []
    });
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((id: string | number) => {
    const program = programs.find((p) => p.id === id);
    if (program) {
      setEditingProgram(program);
      setDialogOpen(true);
    }
  }, [programs]);

  const handleSave = useCallback(async () => {
    if (!editingProgram) return;

    try {
      setSaveLoading(true);

      // Transform data for API
      const apiData = {
        code: editingProgram.code,
        name: {
          en: editingProgram.nameEn,
          ko: editingProgram.nameKo
        },
        description: {
          en: editingProgram.descriptionEn,
          ko: editingProgram.descriptionKo
        },
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

        // Transform response back
        const transformed: Program = {
          id: response.program.id,
          code: response.program.code,
          nameEn: response.program.name.en,
          nameKo: response.program.name.ko,
          descriptionEn: response.program.description.en,
          descriptionKo: response.program.description.ko,
          category: response.program.category,
          type: response.program.type,
          status: response.program.status,
          permissions: response.program.permissions || [],
          version: response.program.metadata?.version || '',
          author: response.program.metadata?.author || '',
          tags: response.program.metadata?.tags?.join(', ') || ''
        };

        setPrograms([...programs, transformed]);
        showSuccess('Program created successfully');
      } else {
        // Update existing program
        const response = await api.put(`/program/${editingProgram.id}`, apiData);

        // Transform response back
        const transformed: Program = {
          id: response.program.id,
          code: response.program.code,
          nameEn: response.program.name.en,
          nameKo: response.program.name.ko,
          descriptionEn: response.program.description.en,
          descriptionKo: response.program.description.ko,
          category: response.program.category,
          type: response.program.type,
          status: response.program.status,
          permissions: response.program.permissions || [],
          version: response.program.metadata?.version || '',
          author: response.program.metadata?.author || '',
          tags: response.program.metadata?.tags?.join(', ') || ''
        };

        setPrograms(programs.map((p) => (p.id === editingProgram.id ? transformed : p)));
        showSuccess('Program updated successfully');
      }

      setDialogOpen(false);
      setEditingProgram(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to save program');
      console.error('Failed to save program:', err);
    } finally {
      setSaveLoading(false);
    }
  }, [editingProgram, programs, setPrograms, showSuccess, showError]);

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
      showSuccess(`Successfully deleted ${count} program${count > 1 ? 's' : ''}`);

      // Close dialog
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to delete programs');
      console.error('Failed to delete programs:', err);
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, programs, setPrograms, showSuccess, showError]);

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
