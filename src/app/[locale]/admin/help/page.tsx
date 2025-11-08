'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import { GridColDef } from '@mui/x-data-grid';
import { api } from '@/lib/axios';
import { useI18n } from '@/lib/i18n/client';
import { HelpContent, HelpSection, HelpFAQ } from '@/types/help';
import dynamic from 'next/dynamic';

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/common/RichTextEditor'), {
  ssr: false
});

interface ExtendedHelpContent extends Partial<HelpContent> {
  id?: string;
}

export default function HelpManagementPage() {
  const t = useI18n();
  const [helps, setHelps] = useState<HelpContent[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHelp, setEditingHelp] = useState<ExtendedHelpContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchHelps();
  }, []);

  // Auto-hide messages after 10 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchHelps = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/help');
      setHelps(response.helps || []);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to load help content');
      console.error('Failed to fetch helps:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'pageId', headerName: 'Page ID', width: 150 },
    { field: 'title', headerName: 'Title', width: 250 },
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
    }
  ];

  const handleAdd = () => {
    setEditingHelp({
      pageId: '',
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

  const handleDelete = async (ids: (string | number)[]) => {
    try {
      setError(null);
      for (const id of ids) {
        await api.delete(`/help?id=${id}`);
      }
      setHelps(helps.filter((h) => !ids.includes(h.id)));
      setSuccessMessage(`Successfully deleted ${ids.length} help content(s)`);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to delete help content');
      console.error('Failed to delete helps:', err);
    }
  };

  const handleSave = async () => {
    if (!editingHelp) return;

    try {
      setSaveLoading(true);
      setError(null);

      if (!editingHelp.id) {
        // Add new help
        const response = await api.post('/help', editingHelp);
        setHelps([...helps, response.help]);
        setSuccessMessage('Help content created successfully');
      } else {
        // Update existing help
        const response = await api.put('/help', editingHelp);
        setHelps(helps.map((h) => (h.id === editingHelp.id ? response.help : h)));
        setSuccessMessage('Help content updated successfully');
      }

      setDialogOpen(false);
      setEditingHelp(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to save help content');
      console.error('Failed to save help:', err);
    } finally {
      setSaveLoading(false);
    }
  };

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

  return (
    <PageContainer>
      <PageHeader
        title="Help Content Management"
        description="Manage help content for all pages"
        showBreadcrumb
      />

      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 1 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <ExcelDataGrid
          rows={helps}
          columns={columns}
          onRowsChange={(rows) => setHelps(rows as HelpContent[])}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={fetchHelps}
          editable
          checkboxSelection
          exportFileName="help-content"
          loading={loading}
        />
      </Paper>

      {/* Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingHelp(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh', maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          {!editingHelp?.id ? 'Add New Help Content' : 'Edit Help Content'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Page ID"
              value={editingHelp?.pageId || ''}
              onChange={(e) => handleChange('pageId', e.target.value)}
              fullWidth
              required
              helperText="Unique identifier for the page (e.g., 'admin-users', 'dashboard')"
            />

            <TextField
              label="Title"
              value={editingHelp?.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              fullWidth
              required
            />

            <TextField
              select
              label="Language"
              value={editingHelp?.language || 'en'}
              onChange={(e) => handleChange('language', e.target.value)}
              fullWidth
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
                <Accordion key={section.id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{section.title || `Section ${index + 1}`}</Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(index);
                      }}
                      sx={{ ml: 'auto', mr: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <TextField
                        label="Section Title"
                        value={section.title}
                        onChange={(e) => updateSection(index, 'title', e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Section Content (HTML)"
                        value={section.content}
                        onChange={(e) => updateSection(index, 'content', e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
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
                <Accordion key={faq.id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{faq.question || `FAQ ${index + 1}`}</Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFAQ(index);
                      }}
                      sx={{ ml: 'auto', mr: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <TextField
                        label="Question"
                        value={faq.question}
                        onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Answer"
                        value={faq.answer}
                        onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogOpen(false);
              setEditingHelp(null);
            }}
            disabled={saveLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saveLoading}>
            {saveLoading ? <CircularProgress size={24} /> : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
