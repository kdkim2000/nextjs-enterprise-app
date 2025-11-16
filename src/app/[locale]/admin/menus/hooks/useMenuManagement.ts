import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/axios';
import { usePageState } from '@/hooks/usePageState';
import { useMessage } from '@/hooks/useMessage';
import { useCurrentLocale } from '@/lib/i18n/client';
import { Menu, MenuFormData, SearchCriteria } from '../types';
import { MenuItem as MenuItemType } from '@/types/menu';
import {
  multiLangFieldsToFormData,
  formDataToMultiLangFields,
  createEmptyMultiLangFormFields,
  searchMultiLangField,
  getLocalizedValue
} from '@/lib/i18n/multiLang';

interface UseMenuManagementOptions {
  storageKey?: string;
  locale: string;
}

export const useMenuManagement = (options: UseMenuManagementOptions) => {
  const { storageKey = 'admin-menus-page-state', locale } = options;

  // Use page state hook (only for search criteria, not for data)
  const {
    searchCriteria,
    setSearchCriteria,
    quickSearch,
    setQuickSearch
  } = usePageState<SearchCriteria, Menu>({
    storageKey,
    initialCriteria: {
      code: '',
      name: '',
      path: '',
      icon: '',
      level: '',
      parentId: '',
      programId: ''
    }
  });

  // Menus data state (not persisted to avoid infinite loop)
  const [menus, setMenus] = useState<Menu[]>([]);

  // Use unified message system
  const currentLocale = useCurrentLocale();
  const {
    successMessage,
    errorMessage,
    showSuccessMessage,
    showErrorMessage
  } = useMessage({ locale: currentLocale });

  // Local states
  const [allMenus, setAllMenus] = useState<MenuItemType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuFormData | null>(null);
  const [loading, setLoading] = useState(false);
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
          const response = await api.get('/help?programId=PROG-MENU-LIST&language=en');
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

  // Flatten menu structure for DataGrid (not using useCallback to avoid dependency issues)
  const flattenMenus = (items: MenuItemType[]): Menu[] => {
    return items.reduce((acc: Menu[], item) => {
      const flatItem: Menu = {
        id: item.id,
        code: item.code,
        name: item.name,
        path: item.path,
        icon: item.icon,
        order: item.order,
        parentId: item.parentId,
        level: item.level,
        programId: item.programId || '',
        description: item.description
      };
      acc.push(flatItem);
      if (item.children && item.children.length > 0) {
        acc.push(...flattenMenus(item.children));
      }
      return acc;
    }, []);
  };

  // Fetch menus from API
  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/menu/all');
      const menuList = response.menus || [];
      setAllMenus(menuList);

      const flatMenus = flattenMenus(menuList);
      setMenus(flatMenus);
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      await showErrorMessage(err.response?.data?.error ? 'COMMON_LOAD_FAIL' : 'CRUD_MENU_LOAD_FAIL');
      console.error('Error fetching menus:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load menus on mount (only once)
  useEffect(() => {
    void fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Menu CRUD operations
  const handleAdd = useCallback(() => {
    setEditingMenu({
      id: '',
      code: '',
      ...createEmptyMultiLangFormFields(),
      path: '',
      icon: 'Dashboard',
      order: 0,
      parentId: null,
      level: 0,
      programId: ''
    } as MenuFormData);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((id: string | number) => {
    const menu = menus.find((m) => m.id === id);
    if (menu) {
      const formFields = multiLangFieldsToFormData(menu.name, menu.description);

      setEditingMenu({
        id: menu.id,
        code: menu.code,
        ...formFields,
        path: menu.path,
        icon: menu.icon,
        order: menu.order,
        parentId: menu.parentId,
        level: menu.level,
        programId: menu.programId
      } as MenuFormData);
      setDialogOpen(true);
    }
  }, [menus]);

  const handleSave = useCallback(async () => {
    if (!editingMenu) return;

    try {
      setSaveLoading(true);

      const { name, description } = formDataToMultiLangFields(editingMenu);

      const menuData = {
        code: editingMenu.code,
        name,
        path: editingMenu.path,
        icon: editingMenu.icon,
        order: editingMenu.order,
        parentId: editingMenu.parentId || null,
        level: editingMenu.level,
        programId: editingMenu.programId || null,
        description
      };

      if (editingMenu.id) {
        // Update existing menu
        await api.put(`/menu/${editingMenu.id}`, menuData);
        await showSuccessMessage('CRUD_MENU_UPDATE_SUCCESS');
      } else {
        // Add new menu
        await api.post('/menu', menuData);
        await showSuccessMessage('CRUD_MENU_CREATE_SUCCESS');
      }

      setDialogOpen(false);
      setEditingMenu(null);
      await fetchMenus();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      await showErrorMessage('CRUD_MENU_SAVE_FAIL');
      console.error('Failed to save menu:', err);
    } finally {
      setSaveLoading(false);
    }
  }, [editingMenu, showSuccessMessage, showErrorMessage]);

  const handleDeleteClick = useCallback((ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setDeleteLoading(true);

      // Delete menus from API
      for (const id of selectedForDelete) {
        await api.delete(`/menu/${id}`);
      }

      // Refresh menus
      await fetchMenus();

      // Show success message
      const count = selectedForDelete.length;
      await showSuccessMessage('CRUD_MENU_DELETE_SUCCESS', { count });

      // Close dialog
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      await showErrorMessage('CRUD_MENU_DELETE_FAIL');
      console.error('Failed to delete menus:', err);
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedForDelete, showSuccessMessage, showErrorMessage]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  }, []);

  // Search handlers
  const handleRefresh = useCallback(() => {
    void fetchMenus();
  }, []);

  const handleSearchChange = useCallback((field: keyof SearchCriteria, value: string | string[]) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  }, [setSearchCriteria]);

  const handleQuickSearch = useCallback(() => {
    // Quick search is handled by filteredMenus useMemo
  }, []);

  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    sessionStorage.removeItem(storageKey);
  }, [setQuickSearch, storageKey]);

  const handleAdvancedFilterApply = useCallback(() => {
    setAdvancedFilterOpen(false);
  }, []);

  const handleAdvancedFilterClose = useCallback(() => {
    setAdvancedFilterOpen(false);
  }, []);

  const handleAdvancedSearchClear = useCallback(() => {
    setSearchCriteria({
      code: '',
      name: '',
      path: '',
      icon: '',
      level: '',
      parentId: '',
      programId: ''
    });
    sessionStorage.removeItem(storageKey);
  }, [setSearchCriteria, storageKey]);

  // Client-side filtering
  const filteredMenus = useMemo(() => {
    // If quick search is active
    if (quickSearch.trim()) {
      const searchLower = quickSearch.toLowerCase().trim();
      return menus.filter((menu) => {
        const code = String(menu.code || '').toLowerCase();
        const path = String(menu.path || '').toLowerCase();
        const programId = String(menu.programId || '').toLowerCase();
        const icon = String(menu.icon || '').toLowerCase();

        // Search in multi-language name field
        const nameMatches = searchMultiLangField(menu.name, searchLower);

        // Also search in parent menu name
        let parentNameMatches = false;
        if (menu.parentId) {
          const parent = allMenus.find(m => m.id === menu.parentId);
          if (parent) {
            parentNameMatches = searchMultiLangField(parent.name, searchLower);
          }
        }

        return (
          code.includes(searchLower) ||
          nameMatches ||
          path.includes(searchLower) ||
          programId.includes(searchLower) ||
          icon.includes(searchLower) ||
          parentNameMatches
        );
      });
    }

    // If advanced search is active
    const hasAdvancedCriteria = Object.values(searchCriteria).some(v => v !== '');
    if (hasAdvancedCriteria) {
      return menus.filter((menu) => {
        let match = true;

        if (searchCriteria.code) {
          match = match && String(menu.code || '').toLowerCase().includes(searchCriteria.code.toLowerCase());
        }
        if (searchCriteria.name) {
          match = match && searchMultiLangField(menu.name, searchCriteria.name);
        }
        if (searchCriteria.path) {
          match = match && String(menu.path || '').toLowerCase().includes(searchCriteria.path.toLowerCase());
        }
        if (searchCriteria.icon) {
          match = match && String(menu.icon || '').toLowerCase().includes(searchCriteria.icon.toLowerCase());
        }
        if (searchCriteria.level) {
          match = match && String(menu.level || '') === searchCriteria.level;
        }
        if (searchCriteria.parentId) {
          if (searchCriteria.parentId === 'null') {
            match = match && !menu.parentId;
          } else {
            match = match && menu.parentId === searchCriteria.parentId;
          }
        }
        if (searchCriteria.programId) {
          match = match && String(menu.programId || '').toLowerCase().includes(searchCriteria.programId.toLowerCase());
        }

        return match;
      });
    }

    // Return all menus if no search is active
    return menus;
  }, [menus, quickSearch, searchCriteria, allMenus, locale]);

  return {
    // State
    menus,
    setMenus,
    allMenus,
    filteredMenus,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    loading,
    saveLoading,
    dialogOpen,
    editingMenu,
    setEditingMenu,
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
    handleAdvancedSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    setDialogOpen
  };
};
