'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Link,
  CircularProgress,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  VideoLibrary as VideoIcon,
  Link as LinkIcon,
  HelpOutline as HelpIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { api } from '@/lib/axios';
import { HelpContent } from '@/types/help';

interface HelpViewerProps {
  open: boolean;
  onClose: () => void;
  programId: string;
  language?: 'en' | 'ko';
  isAdmin?: boolean;
}

export default function HelpViewer({ open, onClose, programId, language = 'en', isAdmin = false }: HelpViewerProps) {
  const [helpContent, setHelpContent] = useState<HelpContent | null>(null);
  const [defaultTemplate, setDefaultTemplate] = useState<HelpContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const fetchHelpContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/help?programId=${programId}&language=${language}`);
      setHelpContent(response.help || null);

      // If no help content found, fetch default template (help-001) for reference
      if (!response.help) {
        try {
          const templateResponse = await api.get('/help?programId=PROG-USER-LIST&language=en&includeAll=true');
          setDefaultTemplate(templateResponse.help || null);
        } catch (templateErr) {
          console.error('Failed to fetch default template:', templateErr);
        }
      }

      // Expand all sections by default
      if (response.help?.sections) {
        setExpandedSections(response.help.sections.map((s: { id: string }) => s.id));
      }
    } catch (err: any) {
      console.error('Failed to fetch help content:', err);
      // Only show error if it's not a 404 (not found) or network error
      if (err?.response?.status && err.response.status !== 404) {
        setError('Failed to load help content');
      }
      setHelpContent(null);
    } finally {
      setLoading(false);
    }
  }, [programId, language]);

  useEffect(() => {
    if (open && programId) {
      fetchHelpContent();
    }
  }, [open, programId, fetchHelpContent]);

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleEditHelp = () => {
    // Navigate to help management page with filter for this programId
    const locale = language || 'en';
    window.location.href = `/${locale}/admin/help?programId=${programId}`;
  };

  const handleCreateFromTemplate = async () => {
    if (!defaultTemplate) return;

    try {
      setCreating(true);
      setError(null);

      // Create new help content based on default template
      const newHelp = {
        programId,
        language,
        title: defaultTemplate.title,
        content: defaultTemplate.content,
        sections: defaultTemplate.sections || [],
        videos: defaultTemplate.videos || [],
        faqs: defaultTemplate.faqs || [],
        relatedLinks: defaultTemplate.relatedLinks || [],
        status: 'draft'
      };

      await api.post('/help', newHelp);

      // Navigate to help management page to edit the newly created help
      const locale = language || 'en';
      window.location.href = `/${locale}/admin/help?programId=${programId}`;
    } catch (err: any) {
      console.error('Failed to create help from template:', err);
      setError('Failed to create help content from template');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '60vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpIcon color="primary" />
          <Typography variant="h6">
            {helpContent?.title || 'Help'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAdmin && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={handleEditHelp}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
          )}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && !helpContent && (
          <Alert severity="info">
            No help content available for this page yet.
            {isAdmin && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={handleEditHelp}
                >
                  Create Help Content
                </Button>
                {defaultTemplate && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCreateFromTemplate}
                    disabled={creating}
                  >
                    {creating ? 'Creating...' : 'Create from Default Template'}
                  </Button>
                )}
              </Box>
            )}
          </Alert>
        )}

        {!loading && !error && helpContent && (
          <Box>
            {/* Main Content */}
            {helpContent.content && (
              <Box
                sx={{ mb: 3 }}
                dangerouslySetInnerHTML={{ __html: helpContent.content }}
              />
            )}

            {/* Sections */}
            {helpContent.sections && helpContent.sections.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Topics
                </Typography>
                {helpContent.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <Accordion
                      key={section.id}
                      expanded={expandedSections.includes(section.id)}
                      onChange={() => handleSectionToggle(section.id)}
                      sx={{ mb: 1 }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight="medium">{section.title}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box dangerouslySetInnerHTML={{ __html: section.content }} />
                      </AccordionDetails>
                    </Accordion>
                  ))}
              </Box>
            )}

            {/* Videos */}
            {helpContent.videos && helpContent.videos.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VideoIcon color="primary" />
                  Video Tutorials
                </Typography>
                <Stack spacing={2}>
                  {helpContent.videos.map((video) => (
                    <Box key={video.id}>
                      <Link
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
                      >
                        <VideoIcon fontSize="small" />
                        <Typography variant="body1">{video.title}</Typography>
                        {video.duration && (
                          <Chip label={video.duration} size="small" />
                        )}
                      </Link>
                      {video.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                          {video.description}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* FAQs */}
            {helpContent.faqs && helpContent.faqs.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Frequently Asked Questions
                </Typography>
                {helpContent.faqs
                  .sort((a, b) => a.order - b.order)
                  .map((faq) => (
                    <Box key={faq.id} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        Q: {faq.question}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        A: {faq.answer}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            )}

            {/* Related Links */}
            {helpContent.relatedLinks && helpContent.relatedLinks.length > 0 && (
              <Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkIcon color="primary" />
                  Related Resources
                </Typography>
                <Stack spacing={1}>
                  {helpContent.relatedLinks.map((link) => (
                    <Box key={link.id}>
                      <Link
                        href={link.url}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <LinkIcon fontSize="small" />
                        <Typography variant="body1">{link.title}</Typography>
                      </Link>
                      {link.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                          {link.description}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
