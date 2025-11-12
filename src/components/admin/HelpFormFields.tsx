'use client';

import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import dynamic from 'next/dynamic';
import { HelpContent, HelpSection, HelpFAQ } from '@/app/[locale]/admin/help/types';

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/common/RichTextEditor'), {
  ssr: false
});

export interface HelpFormFieldsProps {
  help: HelpContent | null;
  onChange: (help: HelpContent) => void;
  onError?: (error: string) => void;
}

export default function HelpFormFields({
  help,
  onChange
}: HelpFormFieldsProps) {
  if (!help) return null;

  const handleChange = (field: keyof HelpContent, value: string | HelpSection[] | HelpFAQ[]) => {
    onChange({ ...help, [field]: value });
  };

  const addSection = () => {
    const newSection: HelpSection = {
      id: `section-${Date.now()}`,
      title: '',
      content: '',
      order: (help.sections?.length || 0) + 1
    };
    handleChange('sections', [...(help.sections || []), newSection]);
  };

  const updateSection = (index: number, field: keyof HelpSection, value: string | number) => {
    if (!help.sections) return;
    const updatedSections = [...help.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    handleChange('sections', updatedSections);
  };

  const removeSection = (index: number) => {
    if (!help.sections) return;
    handleChange('sections', help.sections.filter((_, i) => i !== index));
  };

  const addFAQ = () => {
    const newFAQ: HelpFAQ = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
      order: (help.faqs?.length || 0) + 1
    };
    handleChange('faqs', [...(help.faqs || []), newFAQ]);
  };

  const updateFAQ = (index: number, field: keyof HelpFAQ, value: string | number) => {
    if (!help.faqs) return;
    const updatedFAQs = [...help.faqs];
    updatedFAQs[index] = { ...updatedFAQs[index], [field]: value };
    handleChange('faqs', updatedFAQs);
  };

  const removeFAQ = (index: number) => {
    if (!help.faqs) return;
    handleChange('faqs', help.faqs.filter((_, i) => i !== index));
  };

  return (
    <Stack spacing={3}>
      {/* Program ID */}
      <TextField
        label="Program ID"
        value={help.programId || ''}
        onChange={(e) => handleChange('programId', e.target.value)}
        fullWidth
        size="small"
        required
        disabled={!!help.id}
        helperText={
          help.id
            ? 'Program ID cannot be changed'
            : "Unique program identifier (e.g., 'PROG-USER-LIST', 'PROG-DASHBOARD')"
        }
      />

      {/* Title */}
      <TextField
        label="Title"
        value={help.title || ''}
        onChange={(e) => handleChange('title', e.target.value)}
        fullWidth
        size="small"
        required
      />

      {/* Language */}
      <FormControl fullWidth size="small">
        <InputLabel>Language</InputLabel>
        <Select
          value={help.language || 'en'}
          label="Language"
          onChange={(e) => handleChange('language', e.target.value)}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="ko">한국어</MenuItem>
        </Select>
      </FormControl>

      {/* Status */}
      <FormControl fullWidth size="small">
        <InputLabel>Status</InputLabel>
        <Select
          value={help.status || 'draft'}
          label="Status"
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="published">Published</MenuItem>
        </Select>
      </FormControl>

      {/* Main Content */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Main Content
        </Typography>
        <RichTextEditor
          content={help.content || ''}
          onChange={(content) => handleChange('content', content)}
        />
      </Box>

      {/* Sections */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">Sections</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addSection}>
            Add Section
          </Button>
        </Box>
        {help.sections?.map((section, index) => (
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
          <Typography variant="subtitle2">FAQs</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addFAQ}>
            Add FAQ
          </Button>
        </Box>
        {help.faqs?.map((faq, index) => (
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
  );
}
