import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
import { usePageState } from '@/hooks/usePageState';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';
import { formDataToMultiLangFields } from '@/lib/i18n/multiLang';
import { AttachmentType, SearchCriteria } from '../types';

interface UseAttachmentTypeManagementOptions {
  storageKey?: string;
}

export const useAttachmentTypeManagement = (options: UseAttachmentTypeManagementOptions = {}) => {
  const { storageKey = 'admin-attachment-types-page-state' } = options;

  // Use page state hook
  const {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data: attachmentTypes,
    setData: setAttachmentTypes,
    rowCount,
    setRowCount
  } = usePageState<SearchCriteria, AttachmentType>({
    storageKey,
    initialCriteria: {
      code: '',
      name: '',
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
  const [editingItem, setEditingItem] = useState<AttachmentType | null>(null);
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch attachment types from API
  const fetchAttachmentTypes = useCallback(async (
    page: number = 0,
    pageSize: number = 50,
    useQuickSearch: boolean = false
  ) => {
    try {
      setSearching(true);

      const params = new URLSearchParams();

      if (useQuickSearch && quickSearch) {
        params.append('search', quickSearch);
      } else {
        if (searchCriteria.code) params.append('search', searchCriteria.code);
        if (searchCriteria.name) params.append('search', searchCriteria.name);
        if (searchCriteria.status) params.append('status', searchCriteria.status);
      }

      params.append('page', (page + 1).toString());
      params.append('limit', pageSize.toString());

      const response = await api.get(`/attachment-type?${params.toString()}`);
      setAttachmentTypes(response.attachmentTypes || []);

      if (response.pagination) {
        setRowCount(response.pagination.totalCount || 0);
      } else {
        setRowCount(response.attachmentTypes?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch attachment types:', error);
      await showErrorMessage('COMMON_LOAD_FAIL');
      setAttachmentTypes([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria, setAttachmentTypes, setRowCount, showErrorMessage]);

  // CRUD operations
  const handleAdd = useCallback(() => {
    setEditingItem({
      code: '',
      name: { en: '', ko: '', zh: '', vi: '' },
      description: { en: '', ko: '', zh: '', vi: '' },
      nameEn: '',
      nameKo: '',
      nameZh: '',
      nameVi: '',
      descriptionEn: '',
      descriptionKo: '',
      descriptionZh: '',
      descriptionVi: '',
      storagePath: '/uploads/',
      maxFileCount: 5,
      maxFileSize: 10485760,
      maxTotalSize: 52428800,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      status: 'active',
      order: 0
    });
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((id: string | number) => {
    const item = attachmentTypes.find((a) => a.id === id);
    if (item) {
      // Transform to form data with flattened fields
      setEditingItem({
        ...item,
        nameEn: item.name?.en || '',
        nameKo: item.name?.ko || '',
        nameZh: item.name?.zh || '',
        nameVi: item.name?.vi || '',
        descriptionEn: item.description?.en || '',
        descriptionKo: item.description?.ko || '',
        descriptionZh: item.description?.zh || '',
        descriptionVi: item.description?.vi || ''
      });
      setDialogOpen(true);
    }
  }, [attachmentTypes]);

  const handleSave = useCallback(async () => {
    if (!editingItem) return;

    try {
      setSaveLoading(true);

      const { name, description } = formDataToMultiLangFields(editingItem);

      const apiData = {
        code: editingItem.code,
        name,
        description,
        storagePath: editingItem.storagePath,
        maxFileCount: editingItem.maxFileCount,
        maxFileSize: editingItem.maxFileSize,
        maxTotalSize: editingItem.maxTotalSize,
        allowedExtensions: editingItem.allowedExtensions,
        allowedMimeTypes: editingItem.allowedMimeTypes,
        status: editingItem.status,
        order: editingItem.order
      };

      if (!editingItem.id) {
        const response = await api.post('/attachment-type', apiData);
        setAttachmentTypes([...attachmentTypes, response.attachmentType]);
        await showSuccessMessage('CRUD_CREATE_SUCCESS');
      } else {
        const response = await api.put(`/attachment-type/${editingItem.id}`, apiData);
        setAttachmentTypes(attachmentTypes.map((a) => (a.id === editingItem.id ? response.attachmentType : a)));
        await showSuccessMessage('CRUD_UPDATE_SUCCESS');
      }

      setDialogOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to save attachment type:', err);
      await showErrorMessage('CRUD_SAVE_FAIL');
    } finally {
      setSaveLoading(false);
    }
  }, [editingItem, attachmentTypes, setAttachmentTypes, showSuccessMessage, showErrorMessage]);

  const handleDeleteClick = useCallback((ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setDeleteLoading(true);

      for (const id of selectedForDelete) {
        await api.delete(`/attachment-type/${id}`);
      }

      setAttachmentTypes(attachmentTypes.filter((a) => !selectedForDelete.includes(a.id!)));
      await showSuccessMessage('CRUD_DELETE_SUCCESS', { count: selectedForDelete.length });

      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      console.error('Failed to delete attachment types:', err);
      await showErrorMessage('CRUD_DELETE_FAIL');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, attachmentTypes, setAttachmentTypes, showSuccessMessage, showErrorMessage]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  }, []);

  // Search handlers
  const handleRefresh = useCallback(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchAttachmentTypes(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchAttachmentTypes, quickSearch, paginationModel]);

  const handleSearchChange = useCallback((field: keyof SearchCriteria, value: string | string[]) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  }, [setSearchCriteria]);

  const handleQuickSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchAttachmentTypes(0, paginationModel.pageSize, true);
  }, [fetchAttachmentTypes, paginationModel, setPaginationModel]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setAttachmentTypes([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 50 });
    sessionStorage.removeItem(storageKey);
  }, [setQuickSearch, setAttachmentTypes, setRowCount, setPaginationModel, storageKey]);

  const handleAdvancedSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchAttachmentTypes(0, paginationModel.pageSize, false);
  }, [fetchAttachmentTypes, paginationModel, setPaginationModel]);

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
    fetchAttachmentTypes(newModel.page, newModel.pageSize, useQuickSearch);
  }, [fetchAttachmentTypes, quickSearch, setPaginationModel]);

  // Initial fetch
  useEffect(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchAttachmentTypes(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchAttachmentTypes, quickSearch, paginationModel.page, paginationModel.pageSize]);

  return {
    // State
    attachmentTypes,
    setAttachmentTypes,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingItem,
    setEditingItem,
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
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange,
    setDialogOpen
  };
};
