import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
import { usePageState } from '@/hooks/usePageState';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';
import { User, SearchCriteria } from '../types';

interface UseUserManagementOptions {
  storageKey?: string;
}

export const useUserManagement = (options: UseUserManagementOptions = {}) => {
  const { storageKey = 'admin-users-page-state' } = options;

  // Use page state hook
  const {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data: users,
    setData: setUsers,
    rowCount,
    setRowCount
  } = usePageState<SearchCriteria, User>({
    storageKey,
    initialCriteria: {
      loginid: '',
      username: '',
      name_ko: '',
      name_en: '',
      name: '',
      email: '',
      employee_number: '',
      position: '',
      role: '',
      department: '', // Single department string
      status: '',
      user_category: ''
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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allDepartments, setAllDepartments] = useState<any[]>([]);

  // Fetch all departments for dropdown
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await api.get('/department/all');
      const departments = response.departments || [];

      // Transform department data to include name object for multi-language support
      const transformedDepartments = departments.map((dept: any) => ({
        id: dept.id,
        code: dept.code,
        name: {
          en: dept.name_en || dept.name || dept.code,
          ko: dept.name_ko || dept.name || dept.code,
          zh: dept.name_zh || dept.name || dept.code,
          vi: dept.name_vi || dept.name || dept.code
        },
        name_ko: dept.name_ko,
        name_en: dept.name_en,
        name_zh: dept.name_zh,
        name_vi: dept.name_vi,
        parent_id: dept.parent_id,
        level: dept.level,
        status: dept.status
      }));

      setAllDepartments(transformedDepartments);
    } catch (error: any) {
      console.error('Failed to fetch departments:', error);
      setAllDepartments([]);
    }
  }, []);

  // Fetch users from API
  const fetchUsers = useCallback(async (
    page: number = 0,
    pageSize: number = 50,
    useQuickSearch: boolean = false
  ) => {
    try {
      setSearching(true);

      // Build query parameters
      const params = new URLSearchParams();

      if (useQuickSearch && quickSearch) {
        // Quick search: search across most relevant fields
        // Using the general 'search' parameter that searches multiple fields at once
        params.append('loginid', quickSearch);
        params.append('name_ko', quickSearch);
        params.append('name_en', quickSearch);
        params.append('email', quickSearch);
        params.append('employee_number', quickSearch);
      } else {
        // Advanced search: use specific criteria
        if (searchCriteria.loginid) params.append('loginid', searchCriteria.loginid);
        if (searchCriteria.name_ko) params.append('name_ko', searchCriteria.name_ko);
        if (searchCriteria.name_en) params.append('name_en', searchCriteria.name_en);
        if (searchCriteria.email) params.append('email', searchCriteria.email);
        if (searchCriteria.employee_number) params.append('employee_number', searchCriteria.employee_number);
        if (searchCriteria.phone_number) params.append('phone_number', searchCriteria.phone_number);
        if (searchCriteria.mobile_number) params.append('mobile_number', searchCriteria.mobile_number);
        if (searchCriteria.user_category) params.append('user_category', searchCriteria.user_category);
        if (searchCriteria.position) params.append('position', searchCriteria.position);
        if (searchCriteria.role) params.append('role', searchCriteria.role);
        // Handle department as single value
        if (searchCriteria.department) {
          params.append('department', searchCriteria.department);
        }
        if (searchCriteria.status) params.append('status', searchCriteria.status);
      }

      params.append('page', (page + 1).toString()); // Backend uses 1-indexed
      params.append('limit', pageSize.toString());

      const response = await api.get(`/user?${params.toString()}`);
      setUsers(response.users || []);

      // Update row count for DataGrid
      if (response.pagination) {
        setRowCount(response.pagination.totalCount || 0);
      } else {
        setRowCount(response.users?.length || 0);
      }
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      await showErrorMessage(err.response?.data?.error ? 'COMMON_LOAD_FAIL' : 'CRUD_USER_LOAD_FAIL');
      console.error('Failed to fetch users:', error);
      setUsers([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria, setUsers, setRowCount, showErrorMessage]);

  // User CRUD operations
  const handleAdd = useCallback(() => {
    setEditingUser({
      id: '',
      loginid: '',
      name_ko: '',
      email: '',
      role: 'user',
      department: '',
      status: 'active',
      password: ''
    });
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((id: string | number) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setEditingUser(user);
      setDialogOpen(true);
    }
  }, [users]);

  const handleSave = useCallback(async () => {
    if (!editingUser) return;

    try {
      setSaveLoading(true);

      if (!editingUser.id) {
        // Add new user
        const response = await api.post('/user', editingUser);
        setUsers([...users, response.user]);
        await showSuccessMessage('CRUD_USER_CREATE_SUCCESS');
      } else {
        // Update existing user
        const response = await api.put(`/user/${editingUser.id}`, editingUser);
        setUsers(users.map((u) => (u.id === editingUser.id ? response.user : u)));
        await showSuccessMessage('CRUD_USER_UPDATE_SUCCESS');
      }

      setDialogOpen(false);
      setEditingUser(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      await showErrorMessage('CRUD_USER_SAVE_FAIL');
      console.error('Failed to save user:', err);
    } finally {
      setSaveLoading(false);
    }
  }, [editingUser, users, setUsers, showSuccessMessage, showErrorMessage]);

  const handleDeleteClick = useCallback((ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setDeleteLoading(true);

      // Delete users from API
      for (const id of selectedForDelete) {
        await api.delete(`/user/${id}`);
      }

      // Remove from local state
      setUsers(users.filter((user) => !selectedForDelete.includes(user.id)));

      // Show success message
      const count = selectedForDelete.length;
      await showSuccessMessage('CRUD_USER_DELETE_SUCCESS', { count });

      // Close dialog
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      await showErrorMessage('CRUD_USER_DELETE_FAIL');
      console.error('Failed to delete users:', err);
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, users, setUsers, showSuccessMessage, showErrorMessage]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  }, []);

  // Password reset handlers
  const handleResetPasswordClick = useCallback((userId: string | number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setResetPasswordUser(user);
      setResetPasswordDialogOpen(true);
    }
  }, [users]);

  const handleResetPasswordConfirm = useCallback(async (newPassword: string, useDefault: boolean) => {
    if (!resetPasswordUser) return;

    try {
      setResetPasswordLoading(true);
      await api.post(`/user/${resetPasswordUser.id}/reset-password`, { newPassword });

      const resetMethod = useDefault ? 'to default password' : 'successfully';
      await showSuccessMessage('USER_PASSWORD_RESET_SUCCESS', {
        resetMethod,
        username: resetPasswordUser.username
      });
      setResetPasswordDialogOpen(false);
      setResetPasswordUser(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      await showErrorMessage('USER_PASSWORD_RESET_FAIL');
      console.error('Failed to reset password:', err);
    } finally {
      setResetPasswordLoading(false);
    }
  }, [resetPasswordUser, showSuccessMessage, showErrorMessage]);

  const handleResetPasswordCancel = useCallback(() => {
    setResetPasswordDialogOpen(false);
    setResetPasswordUser(null);
  }, []);

  // Search handlers
  const handleRefresh = useCallback(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchUsers(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchUsers, quickSearch, paginationModel]);

  const handleSearchChange = useCallback((field: keyof SearchCriteria, value: string | string[]) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  }, [setSearchCriteria]);

  const handleQuickSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchUsers(0, paginationModel.pageSize, true);
  }, [fetchUsers, paginationModel, setPaginationModel]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setUsers([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 50 });
    sessionStorage.removeItem(storageKey);
  }, [setQuickSearch, setUsers, setRowCount, setPaginationModel, storageKey]);

  const handleAdvancedSearch = useCallback(() => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchUsers(0, paginationModel.pageSize, false);
  }, [fetchUsers, paginationModel, setPaginationModel]);

  const handleAdvancedSearchClear = useCallback(() => {
    setSearchCriteria({
      loginid: '',
      username: '',
      name_ko: '',
      name_en: '',
      name: '',
      email: '',
      employee_number: '',
      phone_number: '',
      mobile_number: '',
      user_category: '',
      position: '',
      role: '',
      department: '',
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
    fetchUsers(newModel.page, newModel.pageSize, useQuickSearch);
  }, [fetchUsers, quickSearch, setPaginationModel]);

  // Load departments on mount
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Initial fetch and refetch on criteria change
  useEffect(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchUsers(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  }, [fetchUsers, quickSearch, paginationModel.page, paginationModel.pageSize]);

  return {
    // State
    users,
    setUsers,
    allDepartments,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingUser,
    setEditingUser,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    deleteConfirmOpen,
    selectedForDelete,
    deleteLoading,
    successMessage,
    errorMessage,
    resetPasswordDialogOpen,
    resetPasswordUser,
    resetPasswordLoading,

    // Handlers
    handleAdd,
    handleEdit,
    handleSave,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleResetPasswordClick,
    handleResetPasswordConfirm,
    handleResetPasswordCancel,
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
    fetchDepartments
  };
};
