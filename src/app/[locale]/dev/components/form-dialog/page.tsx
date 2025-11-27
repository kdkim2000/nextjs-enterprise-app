'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Button, TextField, Alert, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import FormDialog from '@/components/common/FormDialog';

export default function FormDialogDemoPage() {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string>('');

  // Form data
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');

  const showResult = (msg: string) => {
    setResultMessage(msg);
    setTimeout(() => setResultMessage(''), 3000);
  };

  const handleSave1 = () => {
    showResult('Item created successfully!');
    setOpen1(false);
  };

  const handleSave2 = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    showResult('Data saved successfully!');
    setOpen2(false);
  };

  const handleSave3 = () => {
    showResult('Document saved!');
    setOpen3(false);
  };

  return (
    <PageContainer
      title="Form Dialog"
      description="Full-screen responsive dialog for complex forms"
    >
      <Stack spacing={4}>
        {/* Result Message */}
        {resultMessage && (
          <Alert severity="success" onClose={() => setResultMessage('')}>
            {resultMessage}
          </Alert>
        )}

        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Full-screen dialog on mobile, large dialog on desktop. Ideal for creating/editing complex data.
          </Typography>

          <Button variant="contained" onClick={() => setOpen1(true)}>
            Open Form Dialog
          </Button>

          <FormDialog
            open={open1}
            onClose={() => setOpen1(false)}
            title="Create New Item"
            onSave={handleSave1}
            saveLabel="Create"
            cancelLabel="Cancel"
          >
            <Stack spacing={3}>
              <TextField
                label="Title"
                placeholder="Enter title"
                fullWidth
                required
              />
              <TextField
                label="Description"
                multiline
                rows={4}
                placeholder="Enter description"
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select defaultValue="general" label="Category">
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="tech">Technology</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </FormDialog>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              mt: 2,
              fontSize: '0.875rem',
            }}
          >
            {`<FormDialog
  open={open}
  onClose={() => setOpen(false)}
  title="Create New Item"
  onSave={handleSave}
  saveLabel="Create"
  cancelLabel="Cancel"
>
  <Stack spacing={3}>
    <TextField label="Title" fullWidth required />
    <TextField label="Description" multiline rows={4} fullWidth />
  </Stack>
</FormDialog>`}
          </Box>
        </Paper>

        {/* With Loading State and Validation */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Loading State & Validation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Disable save button when form is invalid or during save operation
          </Typography>

          <Button variant="contained" onClick={() => { setTitle(''); setContent(''); setOpen2(true); }}>
            Open with Validation
          </Button>

          <FormDialog
            open={open2}
            onClose={() => setOpen2(false)}
            title="Create Post"
            onSave={handleSave2}
            saveLoading={loading}
            saveDisabled={!title.trim() || !content.trim()}
            saveLabel={loading ? 'Saving...' : 'Save'}
          >
            <Stack spacing={3}>
              <TextField
                label="Post Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                error={!title.trim()}
                helperText={!title.trim() ? 'Title is required' : ''}
              />
              <TextField
                label="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                multiline
                rows={6}
                fullWidth
                required
                error={!content.trim()}
                helperText={!content.trim() ? 'Content is required' : ''}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="announcement">Announcement</MenuItem>
                  <MenuItem value="question">Question</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Switch />}
                label="Pin this post"
              />
            </Stack>
          </FormDialog>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              mt: 2,
              fontSize: '0.875rem',
            }}
          >
            {`<FormDialog
  saveLoading={loading}
  saveDisabled={!title.trim() || !content.trim()}
  onSave={async () => {
    setLoading(true);
    await saveData();
    setLoading(false);
  }}
/>`}
          </Box>
        </Paper>

        {/* Custom Size and No Actions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customize max width, height, and hide action buttons for read-only view
          </Typography>

          <Button variant="contained" onClick={() => setOpen3(true)}>
            Open Medium Dialog
          </Button>

          <FormDialog
            open={open3}
            onClose={() => setOpen3(false)}
            title="Edit Document"
            onSave={handleSave3}
            maxWidth="md"
            height="70vh"
            contentMaxWidth={600}
          >
            <Stack spacing={3}>
              <TextField
                label="Document Title"
                defaultValue="Project Proposal"
                fullWidth
              />
              <TextField
                label="Summary"
                multiline
                rows={3}
                defaultValue="This document outlines the project scope and timeline."
                fullWidth
              />
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select defaultValue="draft" label="Status">
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="review">Under Review</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select defaultValue="medium" label="Priority">
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </FormDialog>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              mt: 2,
              fontSize: '0.875rem',
            }}
          >
            {`<FormDialog
  maxWidth="md"
  height="70vh"
  contentMaxWidth={600}
  fullScreenOnMobile={true}
  fullScreenBreakpoint="sm"
/>`}
          </Box>
        </Paper>

        {/* API Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Reference
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Import:</strong>
            <Box
              component="pre"
              sx={{
                bgcolor: 'grey.100',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                mt: 1,
              }}
            >
              {`import FormDialog from '@/components/common/FormDialog';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>open</code>: boolean - Dialog open state (required)</li>
            <li><code>onClose</code>: () =&gt; void - Close handler (required)</li>
            <li><code>title</code>: string - Dialog title (required)</li>
            <li><code>children</code>: ReactNode - Form content (required)</li>
            <li><code>onSave</code>: () =&gt; void - Save button handler</li>
            <li><code>saveLoading</code>: boolean - Show loading on save button (default: false)</li>
            <li><code>saveDisabled</code>: boolean - Disable save button (default: false)</li>
            <li><code>saveLabel</code>: string - Save button text (default: &quot;Save&quot;)</li>
            <li><code>cancelLabel</code>: string - Cancel button text (default: &quot;Cancel&quot;)</li>
            <li><code>maxWidth</code>: &apos;xs&apos; | &apos;sm&apos; | &apos;md&apos; | &apos;lg&apos; | &apos;xl&apos; - Dialog max width (default: &apos;lg&apos;)</li>
            <li><code>fullScreenOnMobile</code>: boolean - Full screen on mobile (default: true)</li>
            <li><code>fullScreenBreakpoint</code>: &apos;xs&apos; | &apos;sm&apos; | &apos;md&apos; - Breakpoint for full screen (default: &apos;md&apos;)</li>
            <li><code>height</code>: string | number - Dialog height (default: &apos;90vh&apos;)</li>
            <li><code>showActions</code>: boolean - Show action buttons (default: true)</li>
            <li><code>contentMaxWidth</code>: number | string - Content area max width (default: 900)</li>
            <li><code>additionalActions</code>: ReactNode - Extra buttons before cancel/save</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Comparison: FormDialog vs EditDrawer</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><strong>FormDialog:</strong> Full-screen modal, centered, for complex/long forms</li>
            <li><strong>EditDrawer:</strong> Side drawer, for quick edits, keeps context visible</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Best Practices:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Use for creating new items or editing complex data</li>
            <li>Implement form validation and disable save when invalid</li>
            <li>Show loading state during async save operations</li>
            <li>Use appropriate maxWidth for form complexity</li>
            <li>Provide clear feedback after save (success/error messages)</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
