import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
import { usePageState } from '@/hooks/usePageState';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';
import { Department, SearchCriteria } from '../types';
import { DepartmentFormData } from '@/components/admin/DepartmentFormFields';
import {
  multiLangFieldsToFormData,
  formDataToMultiLangFields,
  createEmptyMultiLangFormFields
} from '@/lib/i18n/multiLang';

interface UseDepartmentManagementOptions {
  storageKey?: string;
}

export const useDepartmentManagement = (options: UseDepartmentManagementOptions = {}) => {
  const { storageKey = 'admin-departments-page-state' } = options;

  // Use page state hook
  const {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data: departments,
    setData: setDepartments,
    rowCount,
    setRowCount
  } = usePageState<SearchCriteria, Department>({
    storageKey,
    initialCriteria: {
      code: '',
      name: '',
      parentId: '',
      managerId: '',
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
  const [editingDepartment, setEditingDepartment] = useState<DepartmentFormData | null>(null);
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Fetch all users for manager dropdown
  const fetchUsers = useCallback(async () => {
    try {
      // Fetch all users using the simplified endpoint (no pagination)
      const response = await api.get('/user/all');
      setAllUsers(response.users || []);
    } catch (error: any) {
      // If user doesn't have permission to view users (403), silently set empty array
      if (error.response?.status === 403) {
        console.warn('User does not have permission to view user list');
        setAllUsers([]);
      } else {
        console.error('Failed to fetch users:', error);
        setAllUsers([]);
      }
    }
  }, []);

  // Fetch departments from API
  const fetchDepartments = useCallback(async (
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
        if (searchCriteria.parentId) params.append('parentId', searchCriteria.parentId);
        if (searchCriteria.managerId) params.append('managerId', searchCriteria.managerId);
        if (searchCriteria.status) params.append('status', searchCriteria.status);
      }

      params.append('page', (page + 1).toString()); // Backend uses 1-indexed
      params.append('limit', pageSize.toString());

      const response = await api.get(`/department?${params.toString()}`);
      setDepartments(response.departments || []);

      // Update row count for DataGrid
      if (response.pagination) {
        setRowCount(response.pagination.totalCount || 0);
      } else {
        setRowCount(response.departments?.length || 0);
      }
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      await showErrorMessage(err.response?.data?.error ? 'COMMON_LOAD_FAIL' : 'CRUD_DEPARTMENT_LOAD_FAIL');
      console.error('Failed to fetch departments:', error);
      setDepartments([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria, setDepartments, setRowCount, showErrorMessage]);

  // Department CRUD operations
  const handleAdd = useCallback(() => {
    setEditingDepartment({
      id: '',
      code: '',
      ...createEmptyMultiLangFormFields(),
      parentId: '',
      managerId: '',
      status: 'active',
      order: 1
    } as any);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((id: string | number) => {
    const department = departments.find((d) => d.id === id);
    if (department) {
      const formFields = multiLangFieldsToFormData(department.name, department.description);

      setEditingDepartment({
        id: department.id,
        code: department.code,
        ...formFields,
        parentId: department.parentId || '',
        managerId: department.managerId || '',
        status: department.status,
        order: department.order
      } as any);
      setDialogOpen(true);
    }
  }, [departments]);

  const handleSave = useCallback(async () => {
    if (!editingDepartment) return;

    try {
      setSaveLoading(true);

      const { name, description } = formDataToMultiLangFields(editingDepartment);

      const payload = {
        code: editingDepartment.code,
        name,
        description,
        parentId: editingDepartment.parentId || null,
        managerId: editingDepartment.managerId || null,
        status: editingDepartment.status,
        order: editingDepartment.order
      };

      if (!editingDepartment.id) {
        // Add new department
        const response = await api.post('/department', payload);
        setDepartments([...departments, response.department]);
        await showSuccessMessage('CRUD_DEPARTMENT_CREATE_SUCCESS');
      } else {
        // Update existing department
        const response = await api.put(`/department/${editingDepartment.id}`, payload);
        setDepartments(departments.map((d) => (d.id === editingDepartment.id ? response.department : d)));
        await showSuccessMessage('CRUD_DEPARTMENT_UPDATE_SUCCESS');
      }

      setDialogOpen(false);
      setEditingDepartment(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      await showErrorMessage('CRUD_DEPARTMENT_SAVE_FAIL');
      console.error('Failed to save department:', err);
    } finally {
      setSaveLoading(false);
    }
  }, [editingDepartment, departments, setDepartments, showSuccessMessage, showErrorMessage]);

  const handleDeleteClick = useCallback((ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setDeleteLoading(true);

      // Delete departments from API
      for (const id of selectedForDelete) {
        await api.delete(`/department/${id}`);
      }

      // Remove from local state
      setDepartments(departments.filter((dept) => !selectedForDelete.includes(dept.id)));

      // Show success message
      const count = selectedForDelete.length;
      await showSuccessMessage('CRUD_DEPARTMENT_DELETE_SUCCESS', { count });

      // Close dialog
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      await showErrorMessage('CRUD_DEPARTMENT_DELETE_FAIL');
      console.error('Failed to delete departments:', err);
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, departments, setDepartments, showSuccessMessage, showErrorMessage]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  }, []);

  // Search handlers
  const handleRefresh = useCallback(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchDepartments(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchDepartments, quickSearch, paginationModel]);

  const handleSearchChange = useCallback((field: keyof SearchCriteria, value: string | string[]) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  }, [setSearchCriteria]);

  const handleQuickSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchDepartments(0, paginationModel.pageSize, true);
  }, [fetchDepartments, paginationModel, setPaginationModel]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setDepartments([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 50 });
    sessionStorage.removeItem(storageKey);
  }, [setQuickSearch, setDepartments, setRowCount, setPaginationModel, storageKey]);

  const handleAdvancedSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchDepartments(0, paginationModel.pageSize, false);
  }, [fetchDepartments, paginationModel, setPaginationModel]);

  const handleAdvancedSearchClear = useCallback(() => {
    setSearchCriteria({
      code: '',
      name: '',
      parentId: '',
      managerId: '',
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
    fetchDepartments(newModel.page, newModel.pageSize, useQuickSearch);
  }, [fetchDepartments, quickSearch, setPaginationModel]);

  return {
    // State
    departments,
    setDepartments,
    allUsers,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingDepartment,
    setEditingDepartment,
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
    setDialogOpen,
    fetchUsers,
    fetchDepartments
  };
};
