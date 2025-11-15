import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
import { usePageState } from '@/hooks/usePageState';
import { useAutoHideMessage } from '@/hooks/useAutoHideMessage';
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
      username: '',
      name: '',
      email: '',
      role: '',
      department: [],
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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpExists, setHelpExists] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

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
          const response = await api.get('/help?programId=PROG-USER-LIST&language=en');
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
        // Quick search: search in username, name, and email
        params.append('username', quickSearch);
        params.append('name', quickSearch);
        params.append('email', quickSearch);
      } else {
        // Advanced search: use specific criteria
        if (searchCriteria.username) params.append('username', searchCriteria.username);
        if (searchCriteria.name) params.append('name', searchCriteria.name);
        if (searchCriteria.email) params.append('email', searchCriteria.email);
        if (searchCriteria.role) params.append('role', searchCriteria.role);
        // Handle department as array
        if (Array.isArray(searchCriteria.department) && searchCriteria.department.length > 0) {
          searchCriteria.department.forEach(dept => params.append('department', dept));
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
      showError(err.response?.data?.error || 'Failed to load users');
      console.error('Failed to fetch users:', error);
      setUsers([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria, setUsers, setRowCount, showError]);

  // User CRUD operations
  const handleAdd = useCallback(() => {
    setEditingUser({
      id: '',
      username: '',
      name: '',
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
        showSuccess('User created successfully');
      } else {
        // Update existing user
        const response = await api.put(`/user/${editingUser.id}`, editingUser);
        setUsers(users.map((u) => (u.id === editingUser.id ? response.user : u)));
        showSuccess('User updated successfully');
      }

      setDialogOpen(false);
      setEditingUser(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to save user');
      console.error('Failed to save user:', err);
    } finally {
      setSaveLoading(false);
    }
  }, [editingUser, users, setUsers, showSuccess, showError]);

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
      showSuccess(`Successfully deleted ${count} user${count > 1 ? 's' : ''}`);

      // Close dialog
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to delete users');
      console.error('Failed to delete users:', err);
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, users, setUsers, showSuccess, showError]);

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
      showSuccess(`Password reset ${resetMethod} for user: ${resetPasswordUser.username}`);
      setResetPasswordDialogOpen(false);
      setResetPasswordUser(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to reset password');
      console.error('Failed to reset password:', err);
    } finally {
      setResetPasswordLoading(false);
    }
  }, [resetPasswordUser, showSuccess, showError]);

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
      username: '',
      name: '',
      email: '',
      role: '',
      department: [],
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

  return {
    // State
    users,
    setUsers,
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
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    successMessage,
    errorMessage,
    showError,
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
    setDialogOpen
  };
};
