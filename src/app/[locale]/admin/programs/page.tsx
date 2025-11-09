'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Alert,
  Tooltip,
  IconButton,
  Paper,
  Drawer,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Divider,
  CircularProgress
} from '@mui/material';
import { Search, HelpOutline, Edit, Close } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import PageHeader from '@/components/common/PageHeader';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import SearchFilterFields, { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import PageContainer from '@/components/common/PageContainer';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import HelpViewer from '@/components/common/HelpViewer';
import { GridColDef } from '@mui/x-data-grid';
import { api } from '@/lib/axios';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { ProgramFormData, ProgramSearchCriteria, PROGRAM_CATEGORIES, PROGRAM_TYPES, PROGRAM_STATUS } from '@/types/program';

// Session storage key for state persistence
const STORAGE_KEY = 'admin-programs-page-state';

// Helper functions for state persistence
const savePageState = (state: {
  searchCriteria: ProgramSearchCriteria;
  paginationModel: { page: number; pageSize: number };
  quickSearch: string;
  programs: ProgramFormData[];
  rowCount: number;
}) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save page state:', error);
  }
};

const loadPageState = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load page state:', error);
    return null;
  }
};

export default function ProgramManagementPage() {
  const t = useI18n();
  const locale = useCurrentLocale();

  // Load saved state on mount
  const savedState = loadPageState();

  const [programs, setPrograms] = useState<ProgramFormData[]>(savedState?.programs || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramFormData | null>(null);
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
  const [searchCriteria, setSearchCriteria] = useState<ProgramSearchCriteria>(
    savedState?.searchCriteria || {
      code: '',
      name: '',
      category: '',
      type: '',
      status: ''
    }
  );
  const [paginationModel, setPaginationModel] = useState(
    savedState?.paginationModel || {
      page: 0,
      pageSize: 50
    }
  );
  const [rowCount, setRowCount] = useState(savedState?.rowCount || 0);

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

  // Save page state whenever it changes
  useEffect(() => {
    savePageState({
      searchCriteria,
      paginationModel,
      quickSearch,
      programs,
      rowCount
    });
  }, [searchCriteria, paginationModel, quickSearch, programs, rowCount]);

  // Check user role and help content availability on mount
  useEffect(() => {
    const checkHelpAndRole = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setIsAdmin(user.role === 'admin');
        }

        const response = await api.get('/help?pageId=admin-programs&language=en');
        setHelpExists(!!response.help);
      } catch {
        setHelpExists(false);
      }
    };

    checkHelpAndRole();

    // If there's saved state with search criteria or data, restore it
    if (savedState && (savedState.programs?.length > 0 || savedState.quickSearch ||
        Object.values(savedState.searchCriteria || {}).some(v => v !== ''))) {
      // Data already loaded from savedState, no need to fetch again
      // User can click refresh if they want fresh data
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPrograms = async (page: number = 0, pageSize: number = 50, useQuickSearch: boolean = false) => {
    try {
      setSearching(true);
      setError(null);

      const params = new URLSearchParams();

      if (useQuickSearch && quickSearch) {
        params.append('name', quickSearch);
        params.append('code', quickSearch);
      } else {
        if (searchCriteria.code) params.append('code', searchCriteria.code);
        if (searchCriteria.name) params.append('name', searchCriteria.name);
        if (searchCriteria.category) params.append('category', searchCriteria.category);
        if (searchCriteria.type) params.append('type', searchCriteria.type);
        if (searchCriteria.status) params.append('status', searchCriteria.status);
      }

      params.append('page', (page + 1).toString());
      params.append('limit', pageSize.toString());

      const response = await api.get(`/program?${params.toString()}`);

      // Transform data for grid
      const transformedPrograms = (response.programs || []).map((prog: {
        id: string;
        code: string;
        name: { en: string; ko: string };
        description: { en: string; ko: string };
        category: string;
        type: string;
        status: string;
        metadata?: { version?: string; author?: string; tags?: string[] };
      }) => ({
        id: prog.id,
        code: prog.code,
        nameEn: prog.name.en,
        nameKo: prog.name.ko,
        descriptionEn: prog.description.en,
        descriptionKo: prog.description.ko,
        category: prog.category,
        type: prog.type,
        status: prog.status,
        version: prog.metadata?.version || '',
        author: prog.metadata?.author || '',
        tags: prog.metadata?.tags?.join(', ') || ''
      }));

      setPrograms(transformedPrograms);

      if (response.pagination) {
        setRowCount(response.pagination.totalCount || 0);
      } else {
        setRowCount(transformedPrograms.length);
      }
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || 'Failed to load programs');
      console.error('Failed to fetch programs:', error);
      setPrograms([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Program Code', width: 150 },
    {
      field: 'name',
      headerName: 'Program Name',
      width: 180,
      valueGetter: (_value, row) => locale === 'ko' ? row.nameKo : row.nameEn
    },
    { field: 'category', headerName: 'Category', width: 120 },
    { field: 'type', headerName: 'Type', width: 100 },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      type: 'singleSelect',
      valueOptions: PROGRAM_STATUS as unknown as string[]
    },
    { field: 'version', headerName: 'Version', width: 100 },
    { field: 'author', headerName: 'Author', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleEdit(params.row.id)}
          color="primary"
        >
          <Edit fontSize="small" />
        </IconButton>
      )
    }
  ];

  const handleAdd = () => {
    setEditingProgram({
      code: '',
      nameEn: '',
      nameKo: '',
      descriptionEn: '',
      descriptionKo: '',
      category: 'admin',
      type: 'page',
      status: 'development',
      version: '1.0.0',
      author: '',
      tags: ''
    });
    setDialogOpen(true);
  };

  const handleEdit = (id: string | number) => {
    const program = programs.find((p) => p.id === id);
    if (program) {
      setEditingProgram(program);
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

      for (const id of selectedForDelete) {
        await api.delete(`/program/${id}`);
      }

      setPrograms(programs.filter((program) => !selectedForDelete.includes(program.id as string)));

      const count = selectedForDelete.length;
      setSuccessMessage(`Successfully deleted ${count} program${count > 1 ? 's' : ''}`);

      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to delete programs');
      console.error('Failed to delete programs:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  };

  const handleSave = async () => {
    if (!editingProgram) return;

    try {
      setSaveLoading(true);
      setError(null);

      const programData = {
        code: editingProgram.code,
        name: {
          en: editingProgram.nameEn,
          ko: editingProgram.nameKo
        },
        description: {
          en: editingProgram.descriptionEn,
          ko: editingProgram.descriptionKo
        },
        category: editingProgram.category,
        type: editingProgram.type,
        status: editingProgram.status,
        metadata: {
          version: editingProgram.version,
          author: editingProgram.author,
          tags: editingProgram.tags ? editingProgram.tags.split(',').map(t => t.trim()) : []
        }
      };

      if (editingProgram.id) {
        await api.put(`/program/${editingProgram.id}`, programData);
      } else {
        await api.post('/program', programData);
      }

      setDialogOpen(false);
      setEditingProgram(null);
      fetchPrograms(paginationModel.page, paginationModel.pageSize, quickSearch.trim() !== '');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to save program');
      console.error('Failed to save program:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRefresh = () => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchPrograms(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  };

  const handleSearchChange = (field: keyof ProgramSearchCriteria, value: string | string[]) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  };

  const handleQuickSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchPrograms(0, paginationModel.pageSize, true);
  };

  const handleQuickSearchClear = () => {
    setQuickSearch('');
    setPrograms([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 50 });
    // Clear saved state
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const handleAdvancedSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchPrograms(0, paginationModel.pageSize, false);
  };

  const handleAdvancedSearchClear = () => {
    setSearchCriteria({
      code: '',
      name: '',
      category: '',
      type: '',
      status: ''
    });
    // Clear saved state
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const handleAdvancedFilterApply = () => {
    setAdvancedFilterOpen(false);
    handleAdvancedSearch();
  };

  const handleAdvancedFilterClose = () => {
    setAdvancedFilterOpen(false);
  };

  const handlePaginationModelChange = (newModel: { page: number; pageSize: number }) => {
    setPaginationModel(newModel);
    const useQuickSearch = quickSearch.trim() !== '';
    fetchPrograms(newModel.page, newModel.pageSize, useQuickSearch);
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(searchCriteria).filter(v => v !== '').length;
  }, [searchCriteria]);

  const filterFields: FilterFieldConfig[] = useMemo(() => [
    {
      name: 'code',
      label: 'Program Code',
      type: 'text',
      placeholder: 'Search by program code...'
    },
    {
      name: 'name',
      label: 'Program Name',
      type: 'text',
      placeholder: 'Search by program name...'
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: '', label: 'All Categories' },
        ...PROGRAM_CATEGORIES.map(cat => ({ value: cat, label: cat }))
      ]
    },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: '', label: 'All Types' },
        ...PROGRAM_TYPES.map(type => ({ value: type, label: type }))
      ]
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Status' },
        ...PROGRAM_STATUS.map(status => ({ value: status, label: status }))
      ]
    }
  ], []);

  return (
    <PageContainer>
      <PageHeader
        useMenu
        showBreadcrumb
        actions={
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

      <QuickSearchBar
        searchValue={quickSearch}
        onSearchChange={setQuickSearch}
        onSearch={handleQuickSearch}
        onClear={handleQuickSearchClear}
        onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
        placeholder="Search by program code or name..."
        searching={searching}
        activeFilterCount={activeFilterCount}
        showAdvancedButton={true}
      />

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

      <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {programs.length === 0 && !searching ? (
          <EmptyState
            icon={Search}
            title="No programs loaded"
            description="Use the search filters above to find programs"
          />
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ExcelDataGrid
              rows={programs}
              columns={columns}
              onRowsChange={(rows) => setPrograms(rows as ProgramFormData[])}
              onAdd={handleAdd}
              onDelete={handleDeleteClick}
              onRefresh={handleRefresh}
              checkboxSelection
              editable
              exportFileName="programs"
              loading={searching}
              paginationMode="server"
              rowCount={rowCount}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
            />
          </Box>
        )}
      </Paper>

      {/* Edit Drawer */}
      <Drawer
        anchor="right"
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingProgram(null);
        }}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 500 } }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            <Typography variant="h6">
              {!editingProgram?.id ? 'Add New Program' : 'Edit Program'}
            </Typography>
            <IconButton onClick={() => {
              setDialogOpen(false);
              setEditingProgram(null);
            }}>
              <Close />
            </IconButton>
          </Box>

          {/* Form Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            <Stack spacing={3}>
              {/* Program Code */}
              <TextField
                label="Program Code"
                fullWidth
                required
                value={editingProgram?.code || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, code: e.target.value } : null)}
                disabled={!!editingProgram?.id}
                helperText={editingProgram?.id ? 'Program code cannot be changed' : 'Unique identifier (e.g., PROG-USER-MGMT)'}
              />

              {/* Name (English) */}
              <TextField
                label="Name (English)"
                fullWidth
                required
                value={editingProgram?.nameEn || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, nameEn: e.target.value } : null)}
              />

              {/* Name (Korean) */}
              <TextField
                label="Name (Korean)"
                fullWidth
                required
                value={editingProgram?.nameKo || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, nameKo: e.target.value } : null)}
              />

              {/* Category */}
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editingProgram?.category || 'admin'}
                  label="Category"
                  onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, category: e.target.value } : null)}
                >
                  {PROGRAM_CATEGORIES.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Type */}
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={editingProgram?.type || 'page'}
                  label="Type"
                  onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, type: e.target.value as 'page' | 'function' | 'api' | 'report' } : null)}
                >
                  {PROGRAM_TYPES.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Status */}
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingProgram?.status || 'development'}
                  label="Status"
                  onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, status: e.target.value as 'active' | 'inactive' | 'development' } : null)}
                >
                  {PROGRAM_STATUS.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Version */}
              <TextField
                label="Version"
                fullWidth
                value={editingProgram?.version || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, version: e.target.value } : null)}
                helperText="e.g., 1.0.0"
              />

              {/* Author */}
              <TextField
                label="Author"
                fullWidth
                value={editingProgram?.author || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, author: e.target.value } : null)}
              />

              <Divider />

              {/* Description (English) */}
              <TextField
                label="Description (English)"
                fullWidth
                multiline
                rows={2}
                value={editingProgram?.descriptionEn || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, descriptionEn: e.target.value } : null)}
              />

              {/* Description (Korean) */}
              <TextField
                label="Description (Korean)"
                fullWidth
                multiline
                rows={2}
                value={editingProgram?.descriptionKo || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, descriptionKo: e.target.value } : null)}
              />

              {/* Tags */}
              <TextField
                label="Tags"
                fullWidth
                value={editingProgram?.tags || ''}
                onChange={(e) => setEditingProgram(editingProgram ? { ...editingProgram, tags: e.target.value } : null)}
                helperText="Comma-separated tags (e.g., admin, security, user)"
              />
            </Stack>
          </Box>

          {/* Footer Actions */}
          <Box sx={{
            p: 2,
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
            borderTop: 1,
            borderColor: 'divider'
          }}>
            <Button
              variant="outlined"
              onClick={() => {
                setDialogOpen(false);
                setEditingProgram(null);
              }}
              disabled={saveLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saveLoading}
            >
              {saveLoading ? <CircularProgress size={20} /> : t('common.save')}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName="program"
        itemsList={selectedForDelete.map((id) => {
          const program = programs.find((p) => p.id === id);
          return program
            ? {
                id: program.id as string,
                displayName: `${program.code} - ${locale === 'ko' ? program.nameKo : program.nameEn}`
              }
            : { id: String(id), displayName: String(id) };
        })}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      <HelpViewer
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        programId="PROG-PROGRAM-LIST"
        language="en"
        isAdmin={isAdmin}
      />
    </PageContainer>
  );
}
