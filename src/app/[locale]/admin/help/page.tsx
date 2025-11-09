'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Alert,
  Chip,
  Stack,
  TextField,
  MenuItem,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import PageHeader from '@/components/common/PageHeader';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import SearchFilterFields, { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import PageContainer from '@/components/common/PageContainer';
import EditDrawer from '@/components/common/EditDrawer';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import ActionsCell from '@/components/common/ActionsCell';
import StatusChangeMenu from '@/components/common/StatusChangeMenu';
import { GridColDef } from '@mui/x-data-grid';
import { api } from '@/lib/axios';
import { useI18n } from '@/lib/i18n/client';
import { HelpContent, HelpSection, HelpFAQ } from '@/types/help';
import { usePageState } from '@/hooks/usePageState';
import { useAutoHideMessage } from '@/hooks/useAutoHideMessage';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/common/RichTextEditor'), {
  ssr: false
});

interface ExtendedHelpContent extends Partial<HelpContent> {
  id?: string;
}

interface SearchCriteria {
  programId: string;
  title: string;
  language: string;
  status: string;
  [key: string]: string | string[];
}

export default function HelpManagementPage() {
  const t = useI18n();
  const searchParams = useSearchParams();

  // Use page state hook
  const {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data: helps,
    setData: setHelps,
    rowCount,
    setRowCount
  } = usePageState<SearchCriteria, HelpContent>({
    storageKey: 'admin-help-page-state',
    initialCriteria: {
      programId: '',
      title: '',
      language: '',
      status: ''
    },
    initialPaginationModel: {
      page: 0,
      pageSize: 50
    }
  });

  // Use auto-hide message hook
  const { successMessage, errorMessage, showSuccess, showError } = useAutoHideMessage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHelp, setEditingHelp] = useState<ExtendedHelpContent | null>(null);
  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedHelp, setSelectedHelp] = useState<HelpContent | null>(null);

  // Check URL parameters for programId and open add dialog
  useEffect(() => {
    const programIdParam = searchParams.get('programId');
    if (programIdParam) {
      // Open add dialog with programId pre-filled
      setEditingHelp({
        programId: programIdParam,
        title: '',
        content: '',
        sections: [],
        faqs: [],
        relatedLinks: [],
        status: 'draft',
        language: 'en'
      });
      setDialogOpen(true);

      // Clean up URL parameter after opening dialog
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  const fetchHelps = async (page: number = 0, pageSize: number = 50, useQuickSearch: boolean = false) => {
    try {
      setSearching(true);

      const params = new URLSearchParams();

      if (useQuickSearch && quickSearch) {
        // Quick search: search in programId and title
        params.append('programId', quickSearch);
        params.append('title', quickSearch);
      } else {
        // Advanced search: use specific criteria
        if (searchCriteria.programId) params.append('programId', searchCriteria.programId);
        if (searchCriteria.title) params.append('title', searchCriteria.title);
        if (searchCriteria.language) params.append('language', searchCriteria.language);
        if (searchCriteria.status) params.append('status', searchCriteria.status);
      }

      params.append('page', (page + 1).toString());
      params.append('limit', pageSize.toString());

      const response = await api.get(`/help?${params.toString()}`);
      setHelps(response.helps || []);

      // Update row count for DataGrid
      if (response.pagination) {
        setRowCount(response.pagination.total || 0);
      } else {
        setRowCount(response.helps?.length || 0);
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to load help content');
      console.error('Failed to fetch helps:', err);
      setHelps([]);
      setRowCount(0);
    } finally {
      setSearching(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'programId', headerName: 'Program ID', width: 180 },
    { field: 'title', headerName: 'Title', width: 250, flex: 1 },
    {
      field: 'language',
      headerName: 'Language',
      width: 100,
      renderCell: (params) => (
        <Chip label={params.value === 'ko' ? '한국어' : 'English'} size="small" />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'published' ? 'success' : 'default'}
        />
      )
    },
    {
      field: 'version',
      headerName: 'Version',
      width: 90,
      type: 'number'
    },
    {
      field: 'updatedAt',
      headerName: 'Last Updated',
      width: 180,
      valueFormatter: (value) => new Date(value).toLocaleString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionsCell
          onEdit={() => handleEdit(params.row.id)}
          onMore={(e) => handleMenuOpen(e, params.row)}
        />
      )
    }
  ];

  const handleAdd = () => {
    setEditingHelp({
      programId: '',
      title: '',
      content: '',
      sections: [],
      faqs: [],
      relatedLinks: [],
      status: 'draft',
      language: 'en'
    });
    setDialogOpen(true);
  };

  const handleEdit = (id: string | number) => {
    const help = helps.find((h) => h.id === id);
    if (help) {
      setEditingHelp(help);
      setDialogOpen(true);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, help: HelpContent) => {
    setAnchorEl(event.currentTarget);
    setSelectedHelp(help);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedHelp(null);
  };

  const handleStatusChange = async (item: HelpContent, newStatus: string) => {
    try {
      const updatedHelp: HelpContent = {
        ...item,
        status: newStatus as 'draft' | 'published'
      };

      await api.put('/help', updatedHelp);

      setHelps(helps.map(h => h.id === item.id ? updatedHelp : h));
      showSuccess(`Status changed to ${newStatus}`);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to update status');
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteClick = (ids: (string | number)[]) => {
    setSelectedForDelete(ids);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);

      for (const id of selectedForDelete) {
        await api.delete(`/help?id=${id}`);
      }

      setHelps(helps.filter((h) => !selectedForDelete.includes(h.id)));

      const count = selectedForDelete.length;
      showSuccess(`Successfully deleted ${count} help content${count > 1 ? 's' : ''}`);

      setDeleteConfirmOpen(false);
      setSelectedForDelete([]);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to delete help content');
      console.error('Failed to delete helps:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSelectedForDelete([]);
  };

  const handleSave = async () => {
    if (!editingHelp) return;

    try {
      setSaveLoading(true);

      if (!editingHelp.id) {
        // Add new help
        const response = await api.post('/help', editingHelp);
        setHelps([...helps, response.help]);
        showSuccess('Help content created successfully');
      } else {
        // Update existing help
        const response = await api.put('/help', editingHelp);
        setHelps(helps.map((h) => (h.id === editingHelp.id ? response.help : h)));
        showSuccess('Help content updated successfully');
      }

      setDialogOpen(false);
      setEditingHelp(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to save help content');
      console.error('Failed to save help:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRefresh = () => {
    const useQuickSearch = quickSearch.trim() !== '';
    fetchHelps(paginationModel.page, paginationModel.pageSize, useQuickSearch);
  };

  const handleSearchChange = (field: keyof SearchCriteria, value: string | string[]) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  };

  // Quick search handlers
  const handleQuickSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchHelps(0, paginationModel.pageSize, true);
  };

  const handleQuickSearchClear = () => {
    setQuickSearch('');
    setHelps([]);
    setRowCount(0);
    setPaginationModel({ page: 0, pageSize: 50 });
    sessionStorage.removeItem('admin-help-page-state');
  };

  // Advanced search handlers
  const handleAdvancedSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    fetchHelps(0, paginationModel.pageSize, false);
  };

  const handleAdvancedSearchClear = () => {
    setSearchCriteria({
      programId: '',
      title: '',
      language: '',
      status: ''
    });
    sessionStorage.removeItem('admin-help-page-state');
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
    fetchHelps(newModel.page, newModel.pageSize, useQuickSearch);
  };

  const activeFilterCount = useMemo(() => {
    return Object.entries(searchCriteria).filter(([_key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== '';
    }).length;
  }, [searchCriteria]);

  const handleChange = (field: keyof HelpContent, value: string | HelpSection[] | HelpFAQ[] | { url: string; text: string }[]) => {
    setEditingHelp((prev) => prev ? ({ ...prev, [field]: value }) : null);
  };

  const addSection = () => {
    if (!editingHelp) return;
    const newSection: HelpSection = {
      id: `section-${Date.now()}`,
      title: '',
      content: '',
      order: (editingHelp.sections?.length || 0) + 1
    };
    setEditingHelp({
      ...editingHelp,
      sections: [...(editingHelp.sections || []), newSection]
    });
  };

  const updateSection = (index: number, field: keyof HelpSection, value: string | number) => {
    if (!editingHelp || !editingHelp.sections) return;
    const updatedSections = [...editingHelp.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setEditingHelp({ ...editingHelp, sections: updatedSections });
  };

  const removeSection = (index: number) => {
    if (!editingHelp || !editingHelp.sections) return;
    setEditingHelp({
      ...editingHelp,
      sections: editingHelp.sections.filter((_, i) => i !== index)
    });
  };

  const addFAQ = () => {
    if (!editingHelp) return;
    const newFAQ: HelpFAQ = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
      order: (editingHelp.faqs?.length || 0) + 1
    };
    setEditingHelp({
      ...editingHelp,
      faqs: [...(editingHelp.faqs || []), newFAQ]
    });
  };

  const updateFAQ = (index: number, field: keyof HelpFAQ, value: string | number) => {
    if (!editingHelp || !editingHelp.faqs) return;
    const updatedFAQs = [...editingHelp.faqs];
    updatedFAQs[index] = { ...updatedFAQs[index], [field]: value };
    setEditingHelp({ ...editingHelp, faqs: updatedFAQs });
  };

  const removeFAQ = (index: number) => {
    if (!editingHelp || !editingHelp.faqs) return;
    setEditingHelp({
      ...editingHelp,
      faqs: editingHelp.faqs.filter((_, i) => i !== index)
    });
  };

  // Filter field configuration
  const filterFields: FilterFieldConfig[] = useMemo(() => [
    {
      name: 'programId',
      label: 'Program ID',
      type: 'text',
      placeholder: 'Search by program ID...'
    },
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      placeholder: 'Search by title...'
    },
    {
      name: 'language',
      label: 'Language',
      type: 'select',
      options: [
        { value: '', label: 'All Languages' },
        { value: 'en', label: 'English' },
        { value: 'ko', label: '한국어' }
      ]
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Status' },
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' }
      ]
    }
  ], []);

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 1, flexShrink: 0 }}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 1, flexShrink: 0 }}>
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
        placeholder="Search by page ID or title..."
        searching={searching}
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
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ExcelDataGrid
            rows={helps}
            columns={columns}
            onRowsChange={(rows) => setHelps(rows as HelpContent[])}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onRefresh={handleRefresh}
            checkboxSelection
            editable
            exportFileName="help-content"
            loading={searching}
            paginationMode="server"
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
          />
        </Box>
      </Paper>

      {/* Edit Drawer */}
      <EditDrawer
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingHelp(null);
        }}
        title={!editingHelp?.id ? 'Add New Help Content' : 'Edit Help Content'}
        onSave={handleSave}
        saveLoading={saveLoading}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        width={{ xs: '100%', sm: 700, md: 900, lg: 1100 }}
      >
        <Stack spacing={3}>
          <TextField
            label="Program ID"
            value={editingHelp?.programId || ''}
            onChange={(e) => handleChange('programId', e.target.value)}
            fullWidth
            size="small"
            required
            helperText="Unique program identifier (e.g., 'PROG-USER-LIST', 'PROG-DASHBOARD')"
          />

          <TextField
            label="Title"
            value={editingHelp?.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            fullWidth
            size="small"
            required
          />

          <TextField
            select
            label="Language"
            value={editingHelp?.language || 'en'}
            onChange={(e) => handleChange('language', e.target.value)}
            fullWidth
            size="small"
            required
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ko">한국어</MenuItem>
          </TextField>

          <TextField
            select
            label="Status"
            value={editingHelp?.status || 'draft'}
            onChange={(e) => handleChange('status', e.target.value)}
            fullWidth
            size="small"
            required
          >
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="published">Published</MenuItem>
          </TextField>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Main Content
            </Typography>
            <RichTextEditor
              content={editingHelp?.content || ''}
              onChange={(content) => handleChange('content', content)}
            />
          </Box>

          {/* Sections */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">
                Sections
              </Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addSection}>
                Add Section
              </Button>
            </Box>
            {editingHelp?.sections?.map((section, index) => (
              <Box key={section.id} sx={{ mb: 1 }}>
                <Accordion sx={{ mb: 0 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                      <Typography sx={{ flex: 1 }}>{section.title || `Section ${index + 1}`}</Typography>
                      <Box
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSection(index);
                        }}
                        sx={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'error.main',
                          '&:hover': {
                            color: 'error.dark'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <TextField
                        label="Section Title"
                        value={section.title}
                        onChange={(e) => updateSection(index, 'title', e.target.value)}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Section Content (HTML)"
                        value={section.content}
                        onChange={(e) => updateSection(index, 'content', e.target.value)}
                        fullWidth
                        size="small"
                        multiline
                        rows={4}
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Box>
            ))}
          </Box>

          {/* FAQs */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">
                FAQs
              </Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addFAQ}>
                Add FAQ
              </Button>
            </Box>
            {editingHelp?.faqs?.map((faq, index) => (
              <Box key={faq.id} sx={{ mb: 1 }}>
                <Accordion sx={{ mb: 0 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                      <Typography sx={{ flex: 1 }}>{faq.question || `FAQ ${index + 1}`}</Typography>
                      <Box
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFAQ(index);
                        }}
                        sx={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'error.main',
                          '&:hover': {
                            color: 'error.dark'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <TextField
                        label="Question"
                        value={faq.question}
                        onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Answer"
                        value={faq.answer}
                        onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                        fullWidth
                        size="small"
                        multiline
                        rows={3}
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Box>
            ))}
          </Box>
        </Stack>
      </EditDrawer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName="help content"
        itemsList={selectedForDelete.map((id) => {
          const help = helps.find((h) => h.id === id);
          return help
            ? {
                id: help.id,
                displayName: `${help.programId} - ${help.title}`
              }
            : { id, displayName: String(id) };
        })}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      {/* Actions Menu */}
      <StatusChangeMenu
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        selectedItem={selectedHelp}
        onEdit={(item) => handleEdit(item.id)}
        onStatusChange={handleStatusChange}
        onDelete={(item) => handleDeleteClick([item.id])}
      />
    </PageContainer>
  );
}
