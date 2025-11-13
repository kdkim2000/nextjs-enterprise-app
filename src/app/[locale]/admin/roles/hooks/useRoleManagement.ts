import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
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

  // States
  const [roles, setRoles] = useState<Role[]>(savedState?.roles || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
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
        // Check if user is admin
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setIsAdmin(user.role === 'admin');
        }

        // Check if help content exists for this page
        const response = await api.get('/help?pageId=admin-roles&language=en');
        setHelpExists(!!response.help);
      } catch {
        setHelpExists(false);
      }
    };

    checkHelpAndRole();
  }, []);

  // Fetch roles from API
  const fetchRoles = useCallback(async (useQuickSearch: boolean = false) => {
    try {
      setSearching(true);
      setError(null);

      const response = await api.get('/role');
      const allRoles = response.roles || [];

      let filtered = [];

      if (useQuickSearch && quickSearch) {
        // Quick search: search in name, displayName, and description
        const term = quickSearch.toLowerCase();
        filtered = allRoles.filter(
          (role: Role) =>
            role.id.toLowerCase().includes(term) ||
            role.name.toLowerCase().includes(term) ||
            role.displayName.toLowerCase().includes(term) ||
            role.description.toLowerCase().includes(term)
        );
      } else if (Object.values(searchCriteria).some(v => v !== '')) {
        // Advanced search: only filter if there are search criteria
        filtered = allRoles.filter((role: Role) => {
          if (searchCriteria.name && !role.name.toLowerCase().includes(searchCriteria.name.toLowerCase())) return false;
          if (searchCriteria.displayName && !role.displayName.toLowerCase().includes(searchCriteria.displayName.toLowerCase())) return false;
          if (searchCriteria.roleType && role.roleType !== searchCriteria.roleType) return false;
          if (searchCriteria.isActive && String(role.isActive) !== searchCriteria.isActive) return false;
          if (searchCriteria.isSystem && String(role.isSystem) !== searchCriteria.isSystem) return false;
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
      setError(err.response?.data?.error || 'Failed to load roles');
      console.error('Failed to fetch roles:', error);
      setRoles([]);
    } finally {
      setSearching(false);
    }
  }, [quickSearch, searchCriteria]);

  // Role CRUD operations
  const handleAdd = useCallback(() => {
    setEditingRole(null);
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
      setError(null);

      for (const id of selectedForDelete) {
        await api.delete(`/role?id=${id}`);
      }

      setRoles(roles.filter((r) => !selectedForDelete.includes(r.id)));

      const count = selectedForDelete.length;
      setSuccessMessage(`Successfully deleted ${count} role${count > 1 ? 's' : ''}`);

      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to delete roles');
      console.error('Failed to delete roles:', err);
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, roles]);

  const handleSave = useCallback(async (roleData: Role) => {
    try {
      setSaveLoading(true);
      setError(null);

      if (roleData.id) {
        // Update existing role
        const response = await api.put('/role', roleData);
        setRoles(roles.map((r) => (r.id === roleData.id ? response.role : r)));
        setSuccessMessage('Role updated successfully');
      } else {
        // Create new role
        const response = await api.post('/role', roleData);
        setRoles([...roles, response.role]);
        setSuccessMessage('Role created successfully');
      }

      setDialogOpen(false);
      setEditingRole(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to save role');
      console.error('Failed to save role:', err);
    } finally {
      setSaveLoading(false);
    }
  }, [roles]);

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
    handleAdvancedFilterClose
  };
};
