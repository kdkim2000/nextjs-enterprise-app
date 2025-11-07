'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { GridColDef } from '@mui/x-data-grid';
import { api } from '@/lib/axios';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { ProgramFormData, ProgramSearchCriteria, PROGRAM_CATEGORIES, PROGRAM_TYPES, PROGRAM_STATUS } from '@/types/program';

export default function ProgramManagementPage() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const [programs, setPrograms] = useState<ProgramFormData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramFormData | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpExists, setHelpExists] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<ProgramSearchCriteria>({
    code: '',
    name: '',
    category: '',
    type: '',
    status: ''
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50
  });
  const [rowCount, setRowCount] = useState(0);

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
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setIsAdmin(user.role === 'admin');
        }

        const response = await api.get('/help?pageId=admin-programs&language=en');
        setHelpExists(!!response.help);
      } catch (err) {
        setHelpExists(false);
      }
    };

    checkHelpAndRole();
    // Load initial data
    fetchPrograms(0, 50, false);
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
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to load programs');
      console.error('Failed to fetch programs:', err);
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
    { field: 'author', headerName: 'Author', width: 120 }
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

  const handleSearchChange = (field: keyof ProgramSearchCriteria, value: string) => {
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

  const formFields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'code',
      label: 'Program Code',
      type: 'text',
      required: true,
      disabled: !!editingProgram?.id,
      helperText: 'Unique identifier (e.g., PROG-USER-MGMT)'
    },
    {
      name: 'nameEn',
      label: 'Name (English)',
      type: 'text',
      required: true
    },
    {
      name: 'nameKo',
      label: 'Name (Korean)',
      type: 'text',
      required: true
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: PROGRAM_CATEGORIES.map(cat => ({ value: cat, label: cat }))
    },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: PROGRAM_TYPES.map(type => ({ value: type, label: type }))
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: PROGRAM_STATUS.map(status => ({ value: status, label: status }))
    },
    {
      name: 'version',
      label: 'Version',
      type: 'text',
      helperText: 'e.g., 1.0.0'
    },
    {
      name: 'author',
      label: 'Author',
      type: 'text'
    },
    {
      name: 'descriptionEn',
      label: 'Description (English)',
      type: 'text',
      multiline: true,
      rows: 2
    },
    {
      name: 'descriptionKo',
      label: 'Description (Korean)',
      type: 'text',
      multiline: true,
      rows: 2
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'text',
      helperText: 'Comma-separated tags (e.g., admin, security, user)'
    }
  ], [editingProgram?.id]);

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
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onRefresh={handleRefresh}
              editable
              checkboxSelection
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

      <CrudDialog
        open={dialogOpen}
        title={!editingProgram?.id ? 'Add New Program' : 'Edit Program'}
        data={editingProgram}
        fields={formFields}
        onClose={() => {
          setDialogOpen(false);
          setEditingProgram(null);
        }}
        onSave={handleSave}
        loading={saveLoading}
        cancelText={t('common.cancel')}
        saveText={t('common.save')}
      />

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
        pageId="admin-programs"
        language="en"
        isAdmin={isAdmin}
      />
    </PageContainer>
  );
}
