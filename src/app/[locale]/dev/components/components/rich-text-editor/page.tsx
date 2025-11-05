'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Button
} from '@mui/material';
import RichTextEditor from '@/components/common/RichTextEditor';
import PageHeader from '@/components/common/PageHeader';

export default function RichTextEditorPage() {
  const [editorContent, setEditorContent] = useState('<p>Hello World!</p>');
  const [editorMode, setEditorMode] = useState<'editor' | 'viewer'>('editor');

  return (
    <Container maxWidth={false} sx={{ maxWidth: '100%', px: 0 }}>
      <PageHeader useMenu showBreadcrumb />

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">HTML5 Rich Text Editor</Typography>
            <Box sx={{ flex: 1 }} />
            <Button
              variant="outlined"
              onClick={() =>
                setEditorMode(editorMode === 'editor' ? 'viewer' : 'editor')
              }
            >
              Switch to {editorMode === 'editor' ? 'Viewer' : 'Editor'} Mode
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Supports: Bold, Italic, Lists, Links, Images, Tables, Code blocks
          </Typography>

          <RichTextEditor
            content={editorContent}
            onChange={setEditorContent}
            mode={editorMode}
            placeholder="Start typing your content here..."
            height={500}
          />

          <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
            <Typography variant="caption" fontWeight={600} gutterBottom>
              HTML Output:
            </Typography>
            <Typography
              variant="caption"
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace'
              }}
            >
              {editorContent}
            </Typography>
          </Paper>
        </Stack>
      </Paper>
    </Container>
  );
}
