'use client';

import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  Divider,
  Chip,
  Alert,
  Grid
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  CheckBox,
  FormatColorText,
  Highlight,
  TableChart,
  Link,
  Image,
  Code,
  HorizontalRule
} from '@mui/icons-material';
import RichTextEditor from '@/components/common/RichTextEditor';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import SafeHtmlRenderer from '@/components/common/SafeHtmlRenderer';

export default function RichTextEditorPage() {
  const [editorContent, setEditorContent] = useState(`<h2>Welcome to Enhanced Rich Text Editor</h2>
<p>This editor supports <strong>Markdown shortcuts</strong> and many advanced features!</p>
<h3>Try Markdown Shortcuts</h3>
<ul>
  <li>Type <code># </code> for Heading 1</li>
  <li>Type <code>## </code> for Heading 2</li>
  <li>Type <code>**text**</code> for <strong>bold</strong></li>
  <li>Type <code>*text*</code> for <em>italic</em></li>
  <li>Type <code>- </code> for bullet list</li>
  <li>Type <code>1. </code> for numbered list</li>
  <li>Type <code>[ ] </code> for task list</li>
  <li>Type <code>> </code> for blockquote</li>
  <li>Type <code>\`\`\`</code> for code block</li>
</ul>
<p>Select text to see the <strong>floating toolbar</strong>!</p>`);
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'html'>('editor');

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Fixed Header Area */}
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: 10
        }}
      >
        <PageContainer sx={{ pb: 2, pt: 1 }}>
          <PageHeader useMenu showBreadcrumb />
        </PageContainer>
      </Box>

      {/* Scrollable Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <PageContainer sx={{ py: 2 }}>
          <Stack spacing={3}>
            {/* Title & Description */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Rich Text Editor (Enhanced)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                A feature-rich WYSIWYG editor built with Tiptap supporting Markdown input, syntax highlighting,
                and advanced formatting options.
              </Typography>

              {/* Feature Chips */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip icon={<FormatBold />} label="Text Formatting" size="small" />
                <Chip icon={<FormatColorText />} label="Text Color" size="small" />
                <Chip icon={<Highlight />} label="Highlight" size="small" />
                <Chip icon={<FormatListBulleted />} label="Lists" size="small" />
                <Chip icon={<CheckBox />} label="Task List" size="small" />
                <Chip icon={<TableChart />} label="Tables" size="small" />
                <Chip icon={<Code />} label="Code Blocks" size="small" />
                <Chip icon={<Link />} label="Links" size="small" />
                <Chip icon={<Image />} label="Images" size="small" />
                <Chip icon={<HorizontalRule />} label="HR" size="small" />
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Markdown Shortcuts:</strong> Type <code># </code> for headings, <code>**bold**</code>,
                  <code>*italic*</code>, <code>- </code> for lists, <code>[ ] </code> for tasks,
                  <code>&gt; </code> for quotes, <code>```</code> for code blocks
                </Typography>
              </Alert>
            </Paper>

            {/* Features Overview */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Features Overview
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Phase 1: Core Features
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    <li>Heading selector (H1-H6)</li>
                    <li>Table controls (insert, rows, cols, merge)</li>
                    <li>Horizontal rule</li>
                    <li>Indent/Outdent for lists</li>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Phase 2: Markdown Support
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    <li>Markdown input shortcuts</li>
                    <li>Task list (checkboxes)</li>
                    <li>Code block with syntax highlighting</li>
                    <li>Typography improvements</li>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Phase 3: UX Improvements
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    <li>Text color picker</li>
                    <li>Highlight/background color</li>
                    <li>Link dialog (not prompt)</li>
                    <li>Floating bubble menu</li>
                    <li>Character/word count</li>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* View Mode Selector */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="subtitle2">View Mode:</Typography>
              <Button
                variant={viewMode === 'editor' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('editor')}
              >
                Editor
              </Button>
              <Button
                variant={viewMode === 'preview' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('preview')}
              >
                Preview
              </Button>
              <Button
                variant={viewMode === 'html' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('html')}
              >
                HTML Output
              </Button>
            </Box>

            {/* Editor / Preview / HTML */}
            {viewMode === 'editor' && (
              <RichTextEditor
                value={editorContent}
                onChange={setEditorContent}
                placeholder="Start typing... Try Markdown shortcuts like # ## ### ** * - [ ] > ```"
                minHeight={400}
              />
            )}

            {viewMode === 'preview' && (
              <Paper sx={{ p: 3, minHeight: 400 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Preview (SafeHtmlRenderer)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <SafeHtmlRenderer html={editorContent} />
              </Paper>
            )}

            {viewMode === 'html' && (
              <Paper sx={{ p: 2, bgcolor: 'grey.100', minHeight: 400 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  HTML Output
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    m: 0
                  }}
                >
                  {editorContent}
                </Box>
              </Paper>
            )}

            {/* Usage Example */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Usage
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box
                component="pre"
                sx={{
                  bgcolor: '#1e1e1e',
                  color: '#d4d4d4',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem'
                }}
              >
                {`import RichTextEditor from '@/components/common/RichTextEditor';

function MyComponent() {
  const [content, setContent] = useState('<p>Hello World!</p>');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Write something..."
      minHeight={300}
      maxHeight={600}
      characterLimit={5000}  // Optional: limit characters
    />
  );
}`}
              </Box>
            </Paper>

            {/* Props Reference */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Props Reference
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: 'grey.100' }}>
                    <Box component="th" sx={{ p: 1, textAlign: 'left', border: '1px solid', borderColor: 'divider' }}>Prop</Box>
                    <Box component="th" sx={{ p: 1, textAlign: 'left', border: '1px solid', borderColor: 'divider' }}>Type</Box>
                    <Box component="th" sx={{ p: 1, textAlign: 'left', border: '1px solid', borderColor: 'divider' }}>Default</Box>
                    <Box component="th" sx={{ p: 1, textAlign: 'left', border: '1px solid', borderColor: 'divider' }}>Description</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {[
                    ['value', 'string', 'required', 'HTML content value'],
                    ['onChange', '(value: string) => void', 'required', 'Callback when content changes'],
                    ['placeholder', 'string', '"Write something..."', 'Placeholder text'],
                    ['minHeight', 'number | string', '200', 'Minimum editor height'],
                    ['maxHeight', 'number | string', '600', 'Maximum editor height'],
                    ['disabled', 'boolean', 'false', 'Disable editing'],
                    ['error', 'boolean', 'false', 'Show error state'],
                    ['helperText', 'string', '-', 'Helper text below editor'],
                    ['characterLimit', 'number', '0', 'Character limit (0 = unlimited)']
                  ].map(([prop, type, defaultVal, desc]) => (
                    <Box component="tr" key={prop}>
                      <Box component="td" sx={{ p: 1, border: '1px solid', borderColor: 'divider', fontFamily: 'monospace', fontSize: '0.85rem' }}>{prop}</Box>
                      <Box component="td" sx={{ p: 1, border: '1px solid', borderColor: 'divider', fontFamily: 'monospace', fontSize: '0.85rem' }}>{type}</Box>
                      <Box component="td" sx={{ p: 1, border: '1px solid', borderColor: 'divider', fontFamily: 'monospace', fontSize: '0.85rem' }}>{defaultVal}</Box>
                      <Box component="td" sx={{ p: 1, border: '1px solid', borderColor: 'divider' }}>{desc}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>

            {/* Keyboard Shortcuts */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Keyboard Shortcuts
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Formatting
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    <li><code>Ctrl+B</code> - Bold</li>
                    <li><code>Ctrl+I</code> - Italic</li>
                    <li><code>Ctrl+U</code> - Underline</li>
                    <li><code>Ctrl+Z</code> - Undo</li>
                    <li><code>Ctrl+Y</code> - Redo</li>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Markdown Input
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    <li><code># </code> - Heading 1</li>
                    <li><code>## </code> - Heading 2</li>
                    <li><code>### </code> - Heading 3</li>
                    <li><code>- </code> or <code>* </code> - Bullet list</li>
                    <li><code>1. </code> - Numbered list</li>
                    <li><code>[ ] </code> - Task (unchecked)</li>
                    <li><code>[x] </code> - Task (checked)</li>
                    <li><code>&gt; </code> - Blockquote</li>
                    <li><code>```</code> - Code block</li>
                    <li><code>---</code> - Horizontal rule</li>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </PageContainer>
      </Box>
    </Box>
  );
}
