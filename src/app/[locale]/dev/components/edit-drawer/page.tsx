'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Button, TextField, Alert, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import EditDrawer from '@/components/common/EditDrawer';

export default function EditDrawerDemoPage() {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string>('');

  const [userName, setUserName] = useState('John Doe');
  const [userEmail, setUserEmail] = useState('john@example.com');
  const [userRole, setUserRole] = useState('user');

  const showResult = (msg: string) => {
    setResultMessage(msg);
    setTimeout(() => setResultMessage(''), 3000);
  };

  const handleSave1 = () => {
    showResult('Changes saved successfully!');
    setOpen1(false);
  };

  const handleSave2 = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    showResult('User updated successfully!');
    setOpen2(false);
  };

  const handleSave3 = () => {
    showResult('Wide drawer data saved!');
    setOpen3(false);
  };

  return (
    <PageContainer
      title="Edit Drawer"
      description="Side drawer for editing data with form fields"
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
            Simple edit drawer with default width (500px on desktop, 100% on mobile)
          </Typography>

          <Button variant="contained" onClick={() => setOpen1(true)}>
            Open Edit Drawer
          </Button>

          <EditDrawer
            open={open1}
            onClose={() => setOpen1(false)}
            title="Edit Profile"
            onSave={handleSave1}
          >
            <TextField
              label="Name"
              defaultValue="John Doe"
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              defaultValue="john@example.com"
              fullWidth
            />
            <TextField
              label="Phone"
              defaultValue="+1 234 567 8900"
              fullWidth
            />
          </EditDrawer>

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
            {`<EditDrawer
  open={open}
  onClose={() => setOpen(false)}
  title="Edit Profile"
  onSave={handleSave}
>
  <TextField label="Name" fullWidth />
  <TextField label="Email" fullWidth />
  <TextField label="Phone" fullWidth />
</EditDrawer>`}
          </Box>
        </Paper>

        {/* With Loading State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Loading State
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Shows loading spinner during save operation
          </Typography>

          <Button variant="contained" onClick={() => setOpen2(true)}>
            Open with Loading Demo
          </Button>

          <EditDrawer
            open={open2}
            onClose={() => setOpen2(false)}
            title="Edit User"
            onSave={handleSave2}
            saveLoading={loading}
          >
            <TextField
              label="Full Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Email Address"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                label="Role"
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Active"
            />
          </EditDrawer>

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
            {`<EditDrawer
  saveLoading={loading}
  onSave={async () => {
    setLoading(true);
    await saveData();
    setLoading(false);
  }}
/>`}
          </Box>
        </Paper>

        {/* Custom Width */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Width
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Wider drawer for more complex forms (700px)
          </Typography>

          <Button variant="contained" onClick={() => setOpen3(true)}>
            Open Wide Drawer
          </Button>

          <EditDrawer
            open={open3}
            onClose={() => setOpen3(false)}
            title="Edit Document Settings"
            onSave={handleSave3}
            width={{ xs: '100%', sm: 700 }}
            saveLabel="Update Settings"
            cancelLabel="Discard"
          >
            <TextField
              label="Document Title"
              defaultValue="Annual Report 2024"
              fullWidth
            />
            <TextField
              label="Description"
              multiline
              rows={4}
              defaultValue="This document contains the annual financial report for 2024..."
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select defaultValue="reports" label="Category">
                  <MenuItem value="reports">Reports</MenuItem>
                  <MenuItem value="documents">Documents</MenuItem>
                  <MenuItem value="presentations">Presentations</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select defaultValue="draft" label="Status">
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField
              label="Tags"
              defaultValue="finance, annual, 2024"
              helperText="Comma-separated tags"
              fullWidth
            />
          </EditDrawer>

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
            {`<EditDrawer
  width={{ xs: '100%', sm: 700 }}
  saveLabel="Update Settings"
  cancelLabel="Discard"
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
              {`import EditDrawer from '@/components/common/EditDrawer';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>open</code>: boolean - Drawer open state (required)</li>
            <li><code>onClose</code>: () =&gt; void - Close handler (required)</li>
            <li><code>title</code>: string - Drawer title (required)</li>
            <li><code>children</code>: React.ReactNode - Form content (required)</li>
            <li><code>onSave</code>: () =&gt; void - Save button handler (required)</li>
            <li><code>saveLoading</code>: boolean - Show loading on save button (default: false)</li>
            <li><code>saveLabel</code>: string - Save button text (default: &quot;Save&quot;)</li>
            <li><code>cancelLabel</code>: string - Cancel button text (default: &quot;Cancel&quot;)</li>
            <li><code>width</code>: number | string | object - Drawer width, supports responsive (default: {`{ xs: '100%', sm: 500 }`})</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Width Configuration Examples:</strong>
          </Typography>
          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              mt: 1,
              fontSize: '0.875rem',
            }}
          >
            {`// Fixed width
width={500}

// Responsive width
width={{ xs: '100%', sm: 600, md: 800 }}

// Full width
width="100%"`}
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Slides in from the right side</li>
            <li>Sticky header with title and close button</li>
            <li>Scrollable content area</li>
            <li>Sticky footer with action buttons</li>
            <li>Loading state support</li>
            <li>Responsive width configuration</li>
            <li>Automatic spacing for form fields (Stack layout)</li>
            <li>Backdrop click to close</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Edit user profile</li>
            <li>Update settings</li>
            <li>Modify data records</li>
            <li>Quick edit forms in tables</li>
            <li>Side-by-side editing with main content</li>
            <li>Mobile-friendly full-screen forms</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Best Practices:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Use for editing existing data (not creating new items)</li>
            <li>Keep forms concise - use Dialog for very long forms</li>
            <li>Show loading state during async operations</li>
            <li>Use responsive width for mobile support</li>
            <li>Disable actions during save operation</li>
            <li>Provide clear success/error feedback after save</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
