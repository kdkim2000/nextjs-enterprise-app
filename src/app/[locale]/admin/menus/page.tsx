'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Alert,
  Tooltip,
  IconButton,
  Paper
} from '@mui/material';
import { Search, HelpOutline } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import PageHeader from '@/components/common/PageHeader';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import SearchFilterFields, { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import PageContainer from '@/components/common/PageContainer';
import CrudDialog, { FormFieldConfig } from '@/components/common/CrudDialog';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import HelpViewer from '@/components/common/HelpViewer';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { api } from '@/lib/axios';
import { MenuItem as MenuItemType } from '@/types/menu';

// Available icons for menu
const AVAILABLE_ICONS = [
  'Dashboard', 'People', 'Assessment', 'Settings', 'List',
  'AdminPanelSettings', 'GridOn', 'TrendingUp', 'Widgets',
  'Description', 'Folder', 'Assignment', 'Build', 'Code',
  'Security', 'Help', 'Link', 'AccountTree'
];

interface MenuFormData {
  id?: string;
  code: string;
  nameEn: string;
  nameKo: string;
  path: string;
  icon: string;
  order: number;
  parentId: string | null;
  level: number;
  programId: string;
  descriptionEn: string;
  descriptionKo: string;
}

interface SearchCriteria {
  code: string;
  name: string;
  path: string;
  icon: string;
  level: string;
  parentId: string;
  programId: string;
  [key: string]: string;
}

export default function MenuManagementPage() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const [menus, setMenus] = useState<GridRowsProp>([]);
  const [allMenus, setAllMenus] = useState<MenuItemType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [quickSearch, setQuickSearch] = useState('');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpExists, setHelpExists] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    code: '',
    name: '',
    path: '',
    icon: '',
    level: '',
    parentId: '',
    programId: ''
  });

  // Auto-hide success message after 10 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-hide error message after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
        const response = await api.get('/help?pageId=admin-menus&language=en');
        setHelpExists(!!response.help);
      } catch (err) {
        // If help doesn't exist or error occurs, set to false
        setHelpExists(false);
      }
    };

    checkHelpAndRole();
  }, []);

  const columns: GridColDef[] = [
    { field: 'code', headerName: t('menuManagement.menuCode'), width: 130 },
    {
      field: 'name',
      headerName: t('menuManagement.menuName'),
      width: 180,
      valueGetter: (_value, row) => {
        return locale === 'ko' ? row.nameKo : row.nameEn;
      }
    },
    { field: 'path', headerName: t('menuManagement.path'), width: 220, flex: 1 },
    { field: 'icon', headerName: t('menuManagement.icon'), width: 100 },
    { field: 'order', headerName: t('menuManagement.order'), width: 70, type: 'number' },
    { field: 'level', headerName: t('menuManagement.level'), width: 70, type: 'number' },
    {
      field: 'parentId',
      headerName: t('menuManagement.parent'),
      width: 150,
      valueGetter: (_value, row) => {
        if (!row.parentId) return t('menuManagement.rootMenu');
        const parent = allMenus.find(m => m.id === row.parentId);
        return parent ? (locale === 'ko' ? parent.name.ko : parent.name.en) : '-';
      }
    },
    { field: 'programId', headerName: t('menuManagement.programId'), width: 140 }
  ];

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/menu/all');
      const menuList = response.menus || [];
      setAllMenus(menuList);

      // Flatten menu structure for DataGrid
      interface FlatMenuItem {
        id: string;
        code: string;
        nameEn: string;
        nameKo: string;
        path: string;
        icon: string;
        order: number;
        parentId: string | null;
        level: number;
        programId: string;
        descriptionEn: string;
        descriptionKo: string;
      }

      const flattenMenus = (items: MenuItemType[]): FlatMenuItem[] => {
        return items.reduce((acc: FlatMenuItem[], item) => {
          const flatItem: FlatMenuItem = {
            id: item.id,
            code: item.code,
            nameEn: item.name.en,
            nameKo: item.name.ko,
            path: item.path,
            icon: item.icon,
            order: item.order,
            parentId: item.parentId,
            level: item.level,
            programId: item.programId || '',
            descriptionEn: item.description.en,
            descriptionKo: item.description.ko
          };
          acc.push(flatItem);
          if (item.children && item.children.length > 0) {
            acc.push(...flattenMenus(item.children));
          }
          return acc;
        }, []);
      };

      const flatMenus = flattenMenus(menuList);
      setMenus(flatMenus);
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      console.error('Error fetching menus:', error);
      setError(err.response?.data?.error || 'Failed to load menus');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMenus();
  }, [fetchMenus]);

  const handleAdd = () => {
    setEditingMenu({
      code: '',
      nameEn: '',
      nameKo: '',
      path: '',
      icon: 'Dashboard',
      order: 0,
      parentId: null,
      level: 0,
      programId: '',
      descriptionEn: '',
      descriptionKo: ''
    });
    setDialogOpen(true);
  };

  const handleEdit = (id: string | number) => {
    const menu = menus.find((m) => m.id === id);
    if (menu) {
      setEditingMenu({
        id: menu.id,
        code: menu.code,
        nameEn: menu.nameEn,
        nameKo: menu.nameKo,
        path: menu.path,
        icon: menu.icon,
        order: menu.order,
        parentId: menu.parentId,
        level: menu.level,
        programId: menu.programId,
        descriptionEn: menu.descriptionEn,
        descriptionKo: menu.descriptionKo
      });
      setDialogOpen(true);
    }
  };

  const handleDeleteClick = (ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Delete menus from API
      for (const id of selectedForDelete) {
        await api.delete(`/menu/${id}`);
      }

      // Refresh menus
      await fetchMenus();

      // Show success message
      const count = selectedForDelete.length;
      setSuccessMessage(`Successfully deleted ${count} menu${count > 1 ? 's' : ''}`);

      // Close dialog
      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to delete menus');
      console.error('Failed to delete menus:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  };

  const handleSave = async () => {
    if (!editingMenu) return;

    try {
      setSaveLoading(true);
      setError(null);

      const menuData = {
        code: editingMenu.code,
        name: {
          en: editingMenu.nameEn,
          ko: editingMenu.nameKo
        },
        path: editingMenu.path,
        icon: editingMenu.icon,
        order: editingMenu.order,
        parentId: editingMenu.parentId || null,
        level: editingMenu.level,
        programId: editingMenu.programId || null,
        description: {
          en: editingMenu.descriptionEn,
          ko: editingMenu.descriptionKo
        }
      };

      if (editingMenu.id) {
        // Update existing menu
        await api.put(`/menu/${editingMenu.id}`, menuData);
      } else {
        // Add new menu
        await api.post('/menu', menuData);
      }

      setSuccessMessage(t('menuManagement.saveSuccess'));
      setDialogOpen(false);
      setEditingMenu(null);
      fetchMenus();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to save menu');
      console.error('Failed to save menu:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchMenus();
  };

  const handleSearchChange = (field: keyof SearchCriteria, value: string) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  };

  // Quick search handlers
  const handleQuickSearch = () => {
    // Quick search is handled by filteredMenus useMemo
  };

  const handleQuickSearchClear = () => {
    setQuickSearch('');
  };

  // Advanced search handlers
  const handleAdvancedSearch = () => {
    // Advanced search is handled by filteredMenus useMemo
  };

  const handleAdvancedSearchClear = () => {
    setSearchCriteria({
      code: '',
      name: '',
      path: '',
      icon: '',
      level: '',
      parentId: '',
      programId: ''
    });
  };

  const handleAdvancedFilterApply = () => {
    setAdvancedFilterOpen(false);
    handleAdvancedSearch();
  };

  const handleAdvancedFilterClose = () => {
    setAdvancedFilterOpen(false);
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(searchCriteria).filter(v => v !== '').length;
  }, [searchCriteria]);

  // Filter menus based on search value (Quick search or Advanced search)
  const filteredMenus = useMemo(() => {
    // If quick search is active
    if (quickSearch.trim()) {
      const searchLower = quickSearch.toLowerCase().trim();
      return menus.filter((menu) => {
        const code = String(menu.code || '').toLowerCase();
        const nameEn = String(menu.nameEn || '').toLowerCase();
        const nameKo = String(menu.nameKo || '').toLowerCase();
        const path = String(menu.path || '').toLowerCase();
        const programId = String(menu.programId || '').toLowerCase();
        const icon = String(menu.icon || '').toLowerCase();

        // Also search in parent menu name
        let parentName = '';
        if (menu.parentId) {
          const parent = allMenus.find(m => m.id === menu.parentId);
          if (parent) {
            parentName = (locale === 'ko' ? parent.name.ko : parent.name.en).toLowerCase();
          }
        }

        return (
          code.includes(searchLower) ||
          nameEn.includes(searchLower) ||
          nameKo.includes(searchLower) ||
          path.includes(searchLower) ||
          programId.includes(searchLower) ||
          icon.includes(searchLower) ||
          parentName.includes(searchLower)
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
          const searchName = searchCriteria.name.toLowerCase();
          const nameEn = String(menu.nameEn || '').toLowerCase();
          const nameKo = String(menu.nameKo || '').toLowerCase();
          match = match && (nameEn.includes(searchName) || nameKo.includes(searchName));
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

  // Filter field configuration
  const filterFields: FilterFieldConfig[] = useMemo(() => [
    {
      name: 'code',
      label: t('menuManagement.menuCode'),
      type: 'text',
      placeholder: 'Search by menu code...'
    },
    {
      name: 'name',
      label: t('menuManagement.menuName'),
      type: 'text',
      placeholder: 'Search by menu name...'
    },
    {
      name: 'path',
      label: t('menuManagement.path'),
      type: 'text',
      placeholder: 'Search by path...'
    },
    {
      name: 'icon',
      label: t('menuManagement.icon'),
      type: 'select',
      options: [
        { value: '', label: 'All Icons' },
        ...AVAILABLE_ICONS.map(icon => ({ value: icon, label: icon }))
      ]
    },
    {
      name: 'level',
      label: t('menuManagement.level'),
      type: 'select',
      options: [
        { value: '', label: 'All Levels' },
        { value: '0', label: 'Level 0' },
        { value: '1', label: 'Level 1' },
        { value: '2', label: 'Level 2' },
        { value: '3', label: 'Level 3' }
      ]
    },
    {
      name: 'parentId',
      label: t('menuManagement.parent'),
      type: 'select',
      options: [
        { value: '', label: 'All Parents' },
        { value: 'null', label: t('menuManagement.rootMenu') },
        ...allMenus.map(menu => ({
          value: menu.id,
          label: locale === 'ko' ? menu.name.ko : menu.name.en
        }))
      ]
    },
    {
      name: 'programId',
      label: t('menuManagement.programId'),
      type: 'text',
      placeholder: 'Search by program ID...'
    }
  ], [t, allMenus, locale]);

  // Form field configuration for CRUD dialog
  const formFields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'code',
      label: t('menuManagement.menuCode'),
      type: 'text',
      required: true
    },
    {
      name: 'nameEn',
      label: t('menuManagement.menuNameEn'),
      type: 'text',
      required: true
    },
    {
      name: 'nameKo',
      label: t('menuManagement.menuNameKo'),
      type: 'text',
      required: true
    },
    {
      name: 'path',
      label: t('menuManagement.path'),
      type: 'text',
      required: true,
      helperText: 'e.g., /dashboard/settings'
    },
    {
      name: 'icon',
      label: t('menuManagement.icon'),
      type: 'select',
      options: AVAILABLE_ICONS.map(icon => ({ value: icon, label: icon }))
    },
    {
      name: 'order',
      label: t('menuManagement.order'),
      type: 'number'
    },
    {
      name: 'level',
      label: t('menuManagement.level'),
      type: 'number'
    },
    {
      name: 'parentId',
      label: t('menuManagement.parent'),
      type: 'select',
      options: [
        { value: '', label: t('menuManagement.rootMenu') },
        ...allMenus
          .filter(m => !editingMenu?.id || m.id !== editingMenu.id)
          .map(menu => ({
            value: menu.id,
            label: locale === 'ko' ? menu.name.ko : menu.name.en
          }))
      ]
    },
    {
      name: 'programId',
      label: t('menuManagement.programId'),
      type: 'text',
      helperText: 'Program identifier (optional)'
    },
    {
      name: 'descriptionEn',
      label: t('menuManagement.descriptionEn'),
      type: 'text',
      multiline: true,
      rows: 2
    },
    {
      name: 'descriptionKo',
      label: t('menuManagement.descriptionKo'),
      type: 'text',
      multiline: true,
      rows: 2
    }
  ], [t, allMenus, locale, editingMenu?.id]);

  return (
    <PageContainer>
      {/* Header - Auto mode: fetches menu info based on current path */}
      <PageHeader
        useMenu
        showBreadcrumb
        actions={
          // Show help button: always for admin, only when help exists for regular users
          (isAdmin || helpExists) ? (
            <Tooltip title={isAdmin ? "Help (Admin: Click to edit)" : "Help"}>
              <IconButton
                onClick={() => setHelpOpen(true)}
                color="primary"
                sx={{ ml: 1 }}
              >
                <HelpOutline />
              </IconButton>
            </Tooltip>
          ) : null
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 1, flexShrink: 0 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 1, flexShrink: 0 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Quick Search Bar */}
      <QuickSearchBar
        searchValue={quickSearch}
        onSearchChange={setQuickSearch}
        onSearch={handleQuickSearch}
        onClear={handleQuickSearchClear}
        onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
        placeholder="Search by code, name, path, or icon..."
        searching={loading}
        activeFilterCount={activeFilterCount}
        showAdvancedButton={true}
      />

      {/* Advanced Filter Panel - Only show when open */}
      {advancedFilterOpen && (
        <SearchFilterPanel
          title={`${t('common.search')} / ${t('common.filter')}`}
          activeFilterCount={activeFilterCount}
          onApply={handleAdvancedFilterApply}
          onClear={handleAdvancedSearchClear}
          onClose={handleAdvancedFilterClose}
          mode="advanced"
          expanded={true}
          showHeader={false}
        >
          <SearchFilterFields
            fields={filterFields}
            values={searchCriteria}
            onChange={handleSearchChange}
            onEnter={handleAdvancedFilterApply}
          />
        </SearchFilterPanel>
      )}

      {/* DataGrid Area - Flexible */}
      <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {filteredMenus.length === 0 && menus.length === 0 && !loading ? (
          <EmptyState
            icon={Search}
            title="No menus found"
            description="Start by adding a new menu or loading existing ones"
          />
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ExcelDataGrid
              rows={filteredMenus}
              columns={columns}
              onRowsChange={(rows) => setMenus(rows)}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onRefresh={handleRefresh}
              editable
              checkboxSelection
              exportFileName="menus"
              loading={loading}
            />
          </Box>
        )}
      </Paper>

      {/* Edit Dialog */}
      <CrudDialog
        open={dialogOpen}
        title={!editingMenu?.id ? 'Add New Menu' : 'Edit Menu'}
        data={editingMenu}
        fields={formFields}
        onClose={() => {
          setDialogOpen(false);
          setEditingMenu(null);
        }}
        onSave={handleSave}
        loading={saveLoading}
        cancelText={t('common.cancel')}
        saveText={t('common.save')}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName="menu"
        itemsList={selectedForDelete.map((id) => {
          const menu = menus.find((m) => m.id === id);
          return menu
            ? {
                id: menu.id,
                displayName: `${menu.code} - ${locale === 'ko' ? menu.nameKo : menu.nameEn}`
              }
            : { id, displayName: String(id) };
        })}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      {/* Help Viewer */}
      <HelpViewer
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        pageId="admin-menus"
        language="en"
        isAdmin={isAdmin}
      />
    </PageContainer>
  );
}
