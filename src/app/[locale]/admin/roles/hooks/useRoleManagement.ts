import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';
import { Role } from '@/types/role';
import { SearchCriteria } from '../types';

interface UseRoleManagementOptions {
  storageKey?: string;
}

const savePageState = (storageKey: string, state: {
  searchCriteria: SearchCriteria;
  quickSearch: string;
  roles: Role[];
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

export const useRoleManagement = (options: UseRoleManagementOptions = {}) => {
  const { storageKey = 'admin-roles-page-state' } = options;

  // Load saved state
  const savedState = loadPageState(storageKey);

  // Use unified message system
  const locale = useCurrentLocale();
  const {
    successMessage,
    errorMessage,
    showSuccessMessage,
    showErrorMessage
  } = useMessage({ locale });

  // States
  const [roles, setRoles] = useState<Role[]>(savedState?.roles || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [quickSearch, setQuickSearch] = useState(savedState?.quickSearch || '');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(
    savedState?.searchCriteria || {
      name: '',
      displayName: '',
      roleType: '',
      isActive: '',
      isSystem: '',
      manager: '',
      representative: ''
    }
  );

  // Save state to session storage
  useEffect(() => {
    savePageState(storageKey, {
      searchCriteria,
      quickSearch,
      roles
    });
  }, [searchCriteria, quickSearch, roles, storageKey]);

  // Fetch roles from API
  const fetchRoles = useCallback(async (useQuickSearch: boolean = false) => {
    try {
      setSearching(true);

      const response = await api.get('/role');
      const allRoles = response.roles || [];

      let filtered = [];

      if (useQuickSearch && quickSearch) {
        // Quick search: search in name, displayName, and description
        const term = quickSearch.toLowerCase();
        filtered = allRoles.filter(
          (role: Role) =>
            role.id?.toLowerCase().includes(term) ||
            role.name?.toLowerCase().includes(term) ||
            role.displayName?.toLowerCase().includes(term) ||
            role.description?.toLowerCase().includes(term)
        );
      } else if (Object.values(searchCriteria).some(v => v !== '')) {
        // Advanced search: only filter if there are search criteria
        filtered = allRoles.filter((role: Role) => {
          if (searchCriteria.name && !role.name?.toLowerCase().includes(searchCriteria.name.toLowerCase())) return false;
          if (searchCriteria.displayName && !role.displayName?.toLowerCase().includes(searchCriteria.displayName.toLowerCase())) return false;
          if (searchCriteria.roleType && role.roleType !== searchCriteria.roleType) return false;
          // Handle boolean comparison properly
          if (searchCriteria.isActive !== '') {
            const expectedActive = searchCriteria.isActive === 'true';
            if (role.isActive !== expectedActive) return false;
          }
          if (searchCriteria.isSystem !== '') {
            const expectedSystem = searchCriteria.isSystem === 'true';
            if (role.isSystem !== expectedSystem) return false;
          }
          if (searchCriteria.manager && role.manager !== searchCriteria.manager) return false;
          if (searchCriteria.representative && role.representative !== searchCriteria.representative) return false;
          return true;
        });
      } else {
        // No search criteria - show all roles
        filtered = allRoles;
      }

      setRoles(filtered);
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      await showErrorMessage(err.response?.data?.error ? 'COMMON_LOAD_FAIL' : 'CRUD_ROLE_LOAD_FAIL');
      console.error('Failed to fetch roles:', error);
      setRoles([]);
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria, showErrorMessage]);

  // Role CRUD operations
  const handleAdd = useCallback(() => {
    setEditingRole({
      id: '',
      name: '',
      displayName: '',
      description: '',
      roleType: 'general',
      manager: null,
      representative: null,
      managerName: null,
      representativeName: null,
      isSystem: false,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      createdBy: ''
    });
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((id: string | number) => {
    const role = roles.find((r) => r.id === id);
    if (role) {
      setEditingRole(role);
      setDialogOpen(true);
    }
  }, [roles]);

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

      // Delete roles from API
      for (const id of selectedForDelete) {
        await api.delete(`/role?id=${id}`);
      }

      // Remove from local state
      setRoles(roles.filter((r) => !selectedForDelete.includes(r.id)));

      // Show success message
      const count = selectedForDelete.length;
      await showSuccessMessage('CRUD_ROLE_DELETE_SUCCESS', { count });

      // Close dialog
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      await showErrorMessage('CRUD_ROLE_DELETE_FAIL');
      console.error('Failed to delete roles:', err);
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, roles, showSuccessMessage, showErrorMessage]);

  const handleSave = useCallback(async (roleData: Role) => {
    try {
      setSaveLoading(true);

      if (roleData.id) {
        // Update existing role
        const response = await api.put('/role', roleData);
        setRoles(roles.map((r) => (r.id === roleData.id ? response.role : r)));
        await showSuccessMessage('CRUD_ROLE_UPDATE_SUCCESS');
      } else {
        // Create new role
        const response = await api.post('/role', roleData);
        setRoles([...roles, response.role]);
        await showSuccessMessage('CRUD_ROLE_CREATE_SUCCESS');
      }

      setDialogOpen(false);
      setEditingRole(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      await showErrorMessage('CRUD_ROLE_SAVE_FAIL');
      console.error('Failed to save role:', err);
    } finally {
      setSaveLoading(false);
    }
  }, [roles, showSuccessMessage, showErrorMessage]);

  // Search handlers
  const handleRefresh = useCallback(() => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchRoles(useQuickSearch);
  }, [fetchRoles, quickSearch]);

  const handleSearchChange = useCallback((field: keyof SearchCriteria, value: string | string[]) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleQuickSearch = useCallback(() => {
    fetchRoles(true);
  }, [fetchRoles]);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    setRoles([]);
    sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  const handleAdvancedSearch = useCallback(() => {
    fetchRoles(false);
  }, [fetchRoles]);

  const handleAdvancedSearchClear = useCallback(() => {
    setSearchCriteria({
      name: '',
      displayName: '',
      roleType: '',
      isActive: '',
      isSystem: '',
      manager: '',
      representative: ''
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

  return {
    // State
    roles,
    setRoles,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    searching,
    saveLoading,
    dialogOpen,
    setDialogOpen,
    editingRole,
    setEditingRole,
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
    handleAdvancedFilterClose
  };
};
