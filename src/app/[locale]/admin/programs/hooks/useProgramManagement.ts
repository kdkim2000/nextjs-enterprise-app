import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
import { ProgramFormData, ProgramSearchCriteria } from '@/types/program';

interface UseProgramManagementOptions {
  storageKey?: string;
}

const savePageState = (storageKey: string, state: {
  searchCriteria: ProgramSearchCriteria;
  paginationModel: { page: number; pageSize: number };
  quickSearch: string;
  programs: ProgramFormData[];
  rowCount: number;
}) => {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save page state:', error);
  }
};

const loadPageState = (storageKey: string) => {
  try {
    const saved = sessionStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load page state:', error);
    return null;
  }
};

export const useProgramManagement = (options: UseProgramManagementOptions = {}) => {
  const { storageKey = 'admin-programs-page-state' } = options;

  // Load saved state
  const savedState = loadPageState(storageKey);

  // States
  const [programs, setPrograms] = useState<ProgramFormData[]>(savedState?.programs || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramFormData | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [quickSearch, setQuickSearch] = useState(savedState?.quickSearch || '');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpExists, setHelpExists] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [paginationModel, setPaginationModel] = useState(
    savedState?.paginationModel || { page: 0, pageSize: 50 }
  );
  const [rowCount, setRowCount] = useState(savedState?.rowCount || 0);
  const [searchCriteria, setSearchCriteria] = useState<ProgramSearchCriteria>(
    savedState?.searchCriteria || {
      code: '',
      name: '',
      category: '',
      type: '',
      status: ''
    }
  );

  // Save state to session storage
  useEffect(() => {
    savePageState(storageKey, {
      searchCriteria,
      paginationModel,
      quickSearch,
      programs,
      rowCount
    });
  }, [searchCriteria, paginationModel, quickSearch, programs, rowCount, storageKey]);

  // Auto-hide success/error messages
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  // Check user role and help content availability on mount
  useEffect(() => {
    const checkHelpAndRole = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setIsAdmin(user.role === 'admin');
        }

        const response = await api.get('/help?pageId=admin-programs&language=en');
        setHelpExists(!!response.help);
      } catch {
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
      setError(null);

      const params = new URLSearchParams();

      if (useQuickSearch && quickSearch) {
        params.append('name', quickSearch);
        params.append('code', quickSearch);
      } else {
        if (searchCriteria.code) params.append('code', searchCriteria.code);
        if (searchCriteria.name) params.append('name', searchCriteria.name);
        if (searchCriteria.category) params.append('category', searchCriteria.category);
        if (searchCriteria.type) params.append('type', searchCriteria.type);
        if (searchCriteria.status) params.append('status', searchCriteria.status);
      }

      params.append('page', (page + 1).toString());
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
        type: prog.type,
        status: prog.status,
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
      setError(err.response?.data?.error || 'Failed to load programs');
      console.error('Failed to fetch programs:', error);
      setPrograms([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria]);

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

  const handleDeleteClick = useCallback((ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setDeleteLoading(true);
      setError(null);

      for (const id of selectedForDelete) {
        await api.delete(`/program/${id}`);
      }

      setPrograms(programs.filter((p) => !selectedForDelete.includes(p.id!)));

      const count = selectedForDelete.length;
      setSuccessMessage(`Successfully deleted ${count} program${count > 1 ? 's' : ''}`);

      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to delete programs');
      console.error('Failed to delete programs:', err);
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, programs]);

  const handleSave = useCallback(async (programData: ProgramFormData) => {
    try {
      setSaveLoading(true);
      setError(null);

      // Transform data for API
      const apiData = {
        code: programData.code,
        name: {
          en: programData.nameEn,
          ko: programData.nameKo
        },
        description: {
          en: programData.descriptionEn,
          ko: programData.descriptionKo
        },
        category: programData.category,
        type: programData.type,
        status: programData.status,
        permissions: programData.permissions || [],
        metadata: {
          version: programData.version,
          author: programData.author,
          tags: programData.tags ? programData.tags.split(',').map(t => t.trim()) : []
        }
      };

      if (programData.id) {
        // Update existing program
        const response = await api.put(`/program/${programData.id}`, apiData);

        // Transform response back
        const transformed = {
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

        setPrograms(programs.map((p) => (p.id === programData.id ? transformed : p)));
        setSuccessMessage('Program updated successfully');
      } else {
        // Create new program
        const response = await api.post('/program', apiData);

        // Transform response back
        const transformed = {
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
        setSuccessMessage('Program created successfully');
      }

      setDialogOpen(false);
      setEditingProgram(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to save program');
      console.error('Failed to save program:', err);
    } finally {
      setSaveLoading(false);
    }
  }, [programs]);

  // Search handlers
  const handleRefresh = useCallback(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchPrograms(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchPrograms, quickSearch, paginationModel]);

  const handleSearchChange = useCallback((field: keyof ProgramSearchCriteria, value: string | string[]) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleQuickSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchPrograms(0, paginationModel.pageSize, true);
  }, [fetchPrograms, paginationModel]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setPrograms([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 50 });
    sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  const handleAdvancedSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchPrograms(0, paginationModel.pageSize, false);
  }, [fetchPrograms, paginationModel]);

  const handleAdvancedSearchClear = useCallback(() => {
    setSearchCriteria({
      code: '',
      name: '',
      category: '',
      type: '',
      status: ''
    });
    sessionStorage.removeItem(storageKey);
  }, [storageKey]);

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
  }, [fetchPrograms, quickSearch]);

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
    setDialogOpen,
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
    error,

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
    handlePaginationModelChange
  };
};
