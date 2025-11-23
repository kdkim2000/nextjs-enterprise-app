import { useState, useEffect, useCallback } from 'react';
import { BoardType, BoardTypeSearchCriteria } from '../types';
import { buildQueryParams } from '../utils';
import { apiClient } from '@/lib/api/client';

export const useBoardTypeManagement = () => {
  // State
  const [boardTypes, setBoardTypes] = useState<BoardType[]>([]);
  const [searchCriteria, setSearchCriteria] = useState<BoardTypeSearchCriteria>({});
  const [quickSearch, setQuickSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [rowCount, setRowCount] = useState(0);
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBoardType, setEditingBoardType] = useState<BoardType | null>(null);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedBoardTypeStats, setSelectedBoardTypeStats] = useState<BoardType | null>(null);

  // Fetch board types
  const fetchBoardTypes = useCallback(async () => {
    try {
      setSearching(true);
      const queryString = buildQueryParams(quickSearch, searchCriteria, paginationModel);
      const response = await apiClient.get(`/board-type?${queryString}`);

      if (response.success) {
        setBoardTypes(response.data.items || []);
        setRowCount(response.data.pagination?.total || 0);
      } else {
        setErrorMessage(response.error || 'Failed to fetch board types');
      }
    } catch (error: any) {
      console.error('Error fetching board types:', error);
      setErrorMessage(error.message || 'Failed to fetch board types');
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria, paginationModel]);

  // Initial fetch and refetch on criteria change
  useEffect(() => {
    fetchBoardTypes();
  }, [fetchBoardTypes]);

  // Handlers
  const handleAdd = useCallback(() => {
    setEditingBoardType({
      code: '',
      name_en: '',
      name_ko: '',
      type: 'normal',
      settings: {
        allowComments: true,
        allowAttachments: true,
        allowLikes: true,
        requireApproval: false,
        maxAttachments: 5,
        maxAttachmentSize: 10485760 // 10MB
      },
      write_roles: ['admin', 'manager', 'user'],
      read_roles: ['admin', 'manager', 'user', 'guest'],
      status: 'active'
    } as BoardType);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((id: string | number) => {
    const boardType = boardTypes.find(bt => bt.id === id);
    if (boardType) {
      // Convert nested name/description objects to flat structure for the form
      const flatBoardType = { ...boardType };

      if (boardType.name && typeof boardType.name === 'object') {
        flatBoardType.name_en = boardType.name.en;
        flatBoardType.name_ko = boardType.name.ko;
        flatBoardType.name_zh = boardType.name.zh;
        flatBoardType.name_vi = boardType.name.vi;
      }

      if (boardType.description && typeof boardType.description === 'object') {
        flatBoardType.description_en = boardType.description.en;
        flatBoardType.description_ko = boardType.description.ko;
        flatBoardType.description_zh = boardType.description.zh;
        flatBoardType.description_vi = boardType.description.vi;
      }

      // Convert camelCase to snake_case for form fields
      if (boardType.writeRoles) {
        flatBoardType.write_roles = boardType.writeRoles;
      }
      if (boardType.readRoles) {
        flatBoardType.read_roles = boardType.readRoles;
      }

      setEditingBoardType(flatBoardType);
      setDialogOpen(true);
    }
  }, [boardTypes]);

  const handleSave = useCallback(async () => {
    if (!editingBoardType) return;

    try {
      setSaveLoading(true);
      const isNew = !editingBoardType.id;

      // Convert form data to backend format
      const payload = {
        code: editingBoardType.code,
        name_en: editingBoardType.name_en,
        name_ko: editingBoardType.name_ko,
        name_zh: editingBoardType.name_zh,
        name_vi: editingBoardType.name_vi,
        description_en: editingBoardType.description_en || '',
        description_ko: editingBoardType.description_ko || '',
        description_zh: editingBoardType.description_zh || '',
        description_vi: editingBoardType.description_vi || '',
        type: editingBoardType.type,
        settings: editingBoardType.settings,
        writeRoles: editingBoardType.write_roles, // Convert snake_case to camelCase
        readRoles: editingBoardType.read_roles,   // Convert snake_case to camelCase
        category: editingBoardType.category,
        order: editingBoardType.order || 0,
        status: editingBoardType.status || 'active'
      };

      const response = isNew
        ? await apiClient.post('/board-type', payload)
        : await apiClient.put(`/board-type/${editingBoardType.id}`, payload);

      if (response.success) {
        setSuccessMessage(isNew ? 'Board type created successfully' : 'Board type updated successfully');
        setDialogOpen(false);
        setEditingBoardType(null);
        fetchBoardTypes();
      } else {
        setErrorMessage(response.error || 'Failed to save board type');
      }
    } catch (error: any) {
      console.error('Error saving board type:', error);
      setErrorMessage(error.message || 'Failed to save board type');
    } finally {
      setSaveLoading(false);
    }
  }, [editingBoardType, fetchBoardTypes]);

  const handleDeleteClick = useCallback((ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setDeleteLoading(true);

      for (const id of selectedForDelete) {
        const response = await apiClient.delete(`/board-type/${id}`);
        if (!response.success) {
          throw new Error(response.error || `Failed to delete board type ${id}`);
        }
      }

      setSuccessMessage(`${selectedForDelete.length} board type(s) deleted successfully`);
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
      fetchBoardTypes();
    } catch (error: any) {
      console.error('Error deleting board types:', error);
      setErrorMessage(error.message || 'Failed to delete board types');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, fetchBoardTypes]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  }, []);

  const handleViewStats = useCallback(async (id: string | number) => {
    const boardType = boardTypes.find(bt => bt.id === id);
    if (!boardType) return;

    try {
      const response = await apiClient.get(`/board-type/${id}/stats`);
      if (response.success) {
        setSelectedBoardTypeStats({ ...boardType, ...response.data });
        setStatsDialogOpen(true);
      } else {
        setErrorMessage(response.error || 'Failed to fetch statistics');
      }
    } catch (error: any) {
      console.error('Error fetching board type stats:', error);
      setErrorMessage(error.message || 'Failed to fetch statistics');
    }
  }, [boardTypes]);

  const handleRefresh = useCallback(() => {
    fetchBoardTypes();
  }, [fetchBoardTypes]);

  const handleSearchChange = useCallback((field: string, value: any) => {
    setSearchCriteria((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleQuickSearch = useCallback(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setSearchCriteria({});
    fetchBoardTypes();
  }, [fetchBoardTypes]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setSearchCriteria({});
    setPaginationModel({ page: 0, pageSize: 20 });
  }, []);

  const handleAdvancedFilterApply = useCallback(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setQuickSearch('');
    setAdvancedFilterOpen(false);
    fetchBoardTypes();
  }, [fetchBoardTypes]);

  const handleAdvancedFilterClose = useCallback(() => {
    setAdvancedFilterOpen(false);
  }, []);

  const handlePaginationModelChange = useCallback((newModel: { page: number; pageSize: number }) => {
    setPaginationModel(newModel);
  }, []);

  return {
    // State
    boardTypes,
    setBoardTypes,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    setDialogOpen,
    editingBoardType,
    setEditingBoardType,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    deleteConfirmOpen,
    selectedForDelete,
    deleteLoading,
    successMessage,
    errorMessage,
    statsDialogOpen,
    setStatsDialogOpen,
    selectedBoardTypeStats,
    // Handlers
    handleAdd,
    handleEdit,
    handleSave,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleViewStats,
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange
  };
};
