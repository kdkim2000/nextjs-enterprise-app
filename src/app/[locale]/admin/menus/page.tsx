'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Tooltip,
  IconButton,
  Paper
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import PageHeader from '@/components/common/PageHeader';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import SearchFilterFields, { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { api } from '@/lib/axios';
import { MenuItem as MenuItemType } from '@/types/menu';

// Available icons for menu
const AVAILABLE_ICONS = [
  'Dashboard', 'People', 'Assessment', 'Settings', 'List',
  'AdminPanelSettings', 'GridOn', 'TrendingUp', 'Widgets',
  'Description', 'Folder', 'Assignment', 'Build', 'Code'
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
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchValue, setSearchValue] = useState<string>('');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    code: '',
    name: '',
    path: '',
    icon: '',
    level: '',
    parentId: '',
    programId: ''
  });

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const columns: GridColDef[] = [
    { field: 'code', headerName: t('menuManagement.menuCode'), width: 130, editable: false },
    {
      field: 'name',
      headerName: t('menuManagement.menuName'),
      width: 180,
      editable: false,
      valueGetter: (_value, row) => {
        return locale === 'ko' ? row.nameKo : row.nameEn;
      }
    },
    { field: 'path', headerName: t('menuManagement.path'), width: 220, editable: false, flex: 1 },
    { field: 'icon', headerName: t('menuManagement.icon'), width: 100, editable: false },
    { field: 'order', headerName: t('menuManagement.order'), width: 70, editable: false, type: 'number' },
    { field: 'level', headerName: t('menuManagement.level'), width: 70, editable: false, type: 'number' },
    {
      field: 'parentId',
      headerName: t('menuManagement.parent'),
      width: 150,
      editable: false,
      valueGetter: (_value, row) => {
        if (!row.parentId) return t('menuManagement.rootMenu');
        const parent = allMenus.find(m => m.id === row.parentId);
        return parent ? (locale === 'ko' ? parent.name.ko : parent.name.en) : '-';
      }
    },
    { field: 'programId', headerName: t('menuManagement.programId'), width: 140, editable: false }
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
      showSnackbar(t('menuManagement.error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [t, showSnackbar]);

  useEffect(() => {
    void fetchMenus();
  }, [fetchMenus]);

  const handleOpenDialog = (menu?: GridRowsProp[number]) => {
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
    } else {
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
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMenu(null);
  };

  const handleSaveMenu = async () => {
    if (!editingMenu) return;

    try {
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
        await api.put(`/menu/${editingMenu.id}`, menuData);
      } else {
        await api.post('/menu', menuData);
      }

      showSnackbar(t('menuManagement.saveSuccess'), 'success');
      handleCloseDialog();
      fetchMenus();
    } catch (error) {
      console.error('Error saving menu:', error);
      showSnackbar(t('menuManagement.error'), 'error');
    }
  };

  const handleDeleteMenu = async (ids: (string | number)[]) => {
    if (!confirm(t('menuManagement.deleteConfirm'))) return;

    try {
      for (const id of ids) {
        await api.delete(`/menu/${id}`);
      }
      showSnackbar(t('menuManagement.deleteSuccess'), 'success');
      fetchMenus();
    } catch (error) {
      console.error('Error deleting menu:', error);
      showSnackbar(t('menuManagement.error'), 'error');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFormChange = (field: keyof MenuFormData, value: string | number | null) => {
    if (!editingMenu) return;
    setEditingMenu({ ...editingMenu, [field]: value });
  };

  // Get parent menu options
  const getParentMenuOptions = () => {
    return allMenus.filter(m => !editingMenu?.id || m.id !== editingMenu.id);
  };

  // Filter menus based on search value (Quick search or Advanced search)
  const filteredMenus = useMemo(() => {
    // If quick search is active
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase().trim();
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
  }, [menus, searchValue, searchCriteria, allMenus, locale]);

  const handleSearch = () => {
    // Quick search is handled by filteredMenus useMemo
  };

  const handleClearSearch = () => {
    setSearchValue('');
  };

  const handleSearchChange = (field: keyof SearchCriteria, value: string) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
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
    // Filtering is automatically applied by useMemo
  };

  const handleAdvancedFilterClose = () => {
    setAdvancedFilterOpen(false);
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(searchCriteria).filter(v => v !== '').length;
  }, [searchCriteria]);

  // Filter field configuration
  const filterFields: FilterFieldConfig[] = useMemo(() => [
    {
      name: 'code',
      label: t('menuManagement.menuCode'),
      type: 'text',
      placeholder: t('menuManagement.menuCode')
    },
    {
      name: 'name',
      label: t('menuManagement.menuName'),
      type: 'text',
      placeholder: t('menuManagement.menuName')
    },
    {
      name: 'path',
      label: t('menuManagement.path'),
      type: 'text',
      placeholder: t('menuManagement.path')
    },
    {
      name: 'icon',
      label: t('menuManagement.icon'),
      type: 'select',
      options: [
        { value: '', label: t('common.all') },
        ...AVAILABLE_ICONS.map(icon => ({ value: icon, label: icon }))
      ]
    },
    {
      name: 'level',
      label: t('menuManagement.level'),
      type: 'select',
      options: [
        { value: '', label: t('common.all') },
        { value: '0', label: '0' },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' }
      ]
    },
    {
      name: 'parentId',
      label: t('menuManagement.parent'),
      type: 'select',
      options: [
        { value: '', label: t('common.all') },
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
      placeholder: t('menuManagement.programId')
    }
  ], [t, allMenus, locale]);

  return (
    <Container
      maxWidth={false}
      sx={{
        maxWidth: '100%',
        px: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <PageHeader useMenu showBreadcrumb />

      {error && (
        <Alert severity="error" sx={{ mb: 1, flexShrink: 0 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Quick Search Bar */}
      <QuickSearchBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
        placeholder={t('menuManagement.searchPlaceholder')}
        activeFilterCount={activeFilterCount}
        showAdvancedButton={true}
      />

      {/* Advanced Filter Panel */}
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

      {/* DataGrid Area */}
      <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ExcelDataGrid
            rows={filteredMenus}
            columns={columns}
            onRowsChange={(rows) => setMenus(rows)}
            onAdd={() => handleOpenDialog()}
            onDelete={handleDeleteMenu}
            onEdit={(id) => {
              const menu = menus.find(m => m.id === id);
              if (menu) handleOpenDialog(menu);
            }}
            onRefresh={fetchMenus}
            loading={loading}
            editable
            checkboxSelection
            exportFileName="menu-list"
          />
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          {editingMenu?.id ? t('menuManagement.edit') : t('menuManagement.add')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* Row 1 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label={t('menuManagement.menuCode')}
                value={editingMenu?.code || ''}
                onChange={(e) => handleFormChange('code', e.target.value)}
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label={t('menuManagement.menuNameEn')}
                value={editingMenu?.nameEn || ''}
                onChange={(e) => handleFormChange('nameEn', e.target.value)}
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label={t('menuManagement.menuNameKo')}
                value={editingMenu?.nameKo || ''}
                onChange={(e) => handleFormChange('nameKo', e.target.value)}
                fullWidth
                required
                size="small"
              />
            </Grid>

            {/* Row 2 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t('menuManagement.path')}
                value={editingMenu?.path || ''}
                onChange={(e) => handleFormChange('path', e.target.value)}
                fullWidth
                required
                size="small"
                placeholder="/dashboard/settings"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('menuManagement.icon')}</InputLabel>
                <Select
                  value={editingMenu?.icon || 'Dashboard'}
                  onChange={(e) => handleFormChange('icon', e.target.value)}
                  label={t('menuManagement.icon')}
                >
                  {AVAILABLE_ICONS.map((icon) => (
                    <MenuItem key={icon} value={icon}>
                      {icon}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 1.5 }}>
              <TextField
                label={t('menuManagement.order')}
                type="number"
                value={editingMenu?.order || 0}
                onChange={(e) => handleFormChange('order', parseInt(e.target.value))}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6, md: 1.5 }}>
              <TextField
                label={t('menuManagement.level')}
                type="number"
                value={editingMenu?.level || 0}
                onChange={(e) => handleFormChange('level', parseInt(e.target.value))}
                fullWidth
                size="small"
              />
            </Grid>

            {/* Row 3 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('menuManagement.parent')}</InputLabel>
                <Select
                  value={editingMenu?.parentId || ''}
                  onChange={(e) => handleFormChange('parentId', e.target.value || null)}
                  label={t('menuManagement.parent')}
                >
                  <MenuItem value="">
                    {t('menuManagement.rootMenu')}
                  </MenuItem>
                  {getParentMenuOptions().map((menu) => (
                    <MenuItem key={menu.id} value={menu.id}>
                      {locale === 'ko' ? menu.name.ko : menu.name.en}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label={t('menuManagement.programId')}
                  value={editingMenu?.programId || ''}
                  onChange={(e) => handleFormChange('programId', e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="PROG-XXX"
                />
                <Tooltip title={locale === 'ko' ? '프로그램 식별자 (선택사항)' : 'Program identifier (optional)'} arrow>
                  <IconButton size="small">
                    <HelpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {/* Row 4 - Description (collapsible) */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label={t('menuManagement.descriptionEn')}
                  value={editingMenu?.descriptionEn || ''}
                  onChange={(e) => handleFormChange('descriptionEn', e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Menu description in English"
                />
                <Tooltip title={locale === 'ko' ? '메뉴 설명 (선택사항)' : 'Menu description (optional)'} arrow>
                  <IconButton size="small">
                    <HelpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label={t('menuManagement.descriptionKo')}
                  value={editingMenu?.descriptionKo || ''}
                  onChange={(e) => handleFormChange('descriptionKo', e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="메뉴 설명 (한국어)"
                />
                <Tooltip title={locale === 'ko' ? '메뉴 설명 (선택사항)' : 'Menu description (optional)'} arrow>
                  <IconButton size="small">
                    <HelpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSaveMenu} variant="contained">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
