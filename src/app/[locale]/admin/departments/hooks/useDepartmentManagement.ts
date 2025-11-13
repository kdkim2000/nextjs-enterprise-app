import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
import { usePageState } from '@/hooks/usePageState';
import { useAutoHideMessage } from '@/hooks/useAutoHideMessage';
import { Department, SearchCriteria } from '../types';
import { DepartmentFormData } from '@/components/admin/DepartmentFormFields';

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
      status: '',
      location: ''
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
  const [editingDepartment, setEditingDepartment] = useState<DepartmentFormData | null>(null);
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpExists, setHelpExists] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allUsers, setAllUsers] = useState<any[]>([]);

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
          const response = await api.get('/help?programId=PROG-DEPT-MGMT&language=en');
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

  // Fetch all users for manager dropdown
  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/user');
      setAllUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
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
        // Quick search: search in code, name, email, location
        params.append('code', quickSearch);
        params.append('name', quickSearch);
        params.append('email', quickSearch);
        params.append('location', quickSearch);
      } else {
        // Advanced search: use specific criteria
        if (searchCriteria.code) params.append('code', searchCriteria.code);
        if (searchCriteria.name) params.append('name', searchCriteria.name);
        if (searchCriteria.parentId) params.append('parentId', searchCriteria.parentId);
        if (searchCriteria.managerId) params.append('managerId', searchCriteria.managerId);
        if (searchCriteria.status) params.append('status', searchCriteria.status);
        if (searchCriteria.location) params.append('location', searchCriteria.location);
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
      showError(err.response?.data?.error || 'Failed to load departments');
      console.error('Failed to fetch departments:', error);
      setDepartments([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria, setDepartments, setRowCount, showError]);

  // Department CRUD operations
  const handleAdd = useCallback(() => {
    setEditingDepartment({
      id: '',
      code: '',
      nameEn: '',
      nameKo: '',
      descriptionEn: '',
      descriptionKo: '',
      parentId: '',
      managerId: '',
      status: 'active',
      email: '',
      phone: '',
      location: '',
      order: 1
    });
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((id: string | number) => {
    const department = departments.find((d) => d.id === id);
    if (department) {
      setEditingDepartment({
        id: department.id,
        code: department.code,
        nameEn: department.name?.en || '',
        nameKo: department.name?.ko || '',
        descriptionEn: department.description?.en || '',
        descriptionKo: department.description?.ko || '',
        parentId: department.parentId || '',
        managerId: department.managerId || '',
        status: department.status,
        email: department.email || '',
        phone: department.phone || '',
        location: department.location || '',
        order: department.order
      });
      setDialogOpen(true);
    }
  }, [departments]);

  const handleSave = useCallback(async () => {
    if (!editingDepartment) return;

    try {
      setSaveLoading(true);

      const payload = {
        code: editingDepartment.code,
        name: {
          en: editingDepartment.nameEn,
          ko: editingDepartment.nameKo
        },
        description: {
          en: editingDepartment.descriptionEn,
          ko: editingDepartment.descriptionKo
        },
        parentId: editingDepartment.parentId || null,
        managerId: editingDepartment.managerId || null,
        status: editingDepartment.status,
        email: editingDepartment.email,
        phone: editingDepartment.phone,
        location: editingDepartment.location,
        order: editingDepartment.order
      };

      if (!editingDepartment.id) {
        // Add new department
        const response = await api.post('/department', payload);
        setDepartments([...departments, response.department]);
        showSuccess('Department created successfully');
      } else {
        // Update existing department
        const response = await api.put(`/department/${editingDepartment.id}`, payload);
        setDepartments(departments.map((d) => (d.id === editingDepartment.id ? response.department : d)));
        showSuccess('Department updated successfully');
      }

      setDialogOpen(false);
      setEditingDepartment(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to save department');
      console.error('Failed to save department:', err);
    } finally {
      setSaveLoading(false);
    }
  }, [editingDepartment, departments, setDepartments, showSuccess, showError]);

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
      showSuccess(`Successfully deleted ${count} department${count > 1 ? 's' : ''}`);

      // Close dialog
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to delete departments');
      console.error('Failed to delete departments:', err);
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, departments, setDepartments, showSuccess, showError]);

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
      status: '',
      location: ''
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
    setDialogOpen,
    fetchUsers,
    fetchDepartments
  };
};
