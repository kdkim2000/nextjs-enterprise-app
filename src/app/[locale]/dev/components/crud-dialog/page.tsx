'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Button, Alert, Chip } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import CrudDialog, { FormFieldConfig } from '@/components/common/CrudDialog';

interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  active: boolean;
}

export default function CrudDialogDemoPage() {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string>('');

  const [userData, setUserData] = useState<User | null>(null);

  const showResult = (msg: string) => {
    setResultMessage(msg);
    setTimeout(() => setResultMessage(''), 3000);
  };

  const basicFields: FormFieldConfig[] = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter full name'
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'user@example.com'
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Administrator' },
        { value: 'moderator', label: 'Moderator' }
      ]
    }
  ];

  const advancedFields: FormFieldConfig[] = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      gridSize: { xs: 12, sm: 6 }
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      gridSize: { xs: 12, sm: 6 }
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' }
      ],
      gridSize: { xs: 12, sm: 6 }
    },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      options: [
        { value: 'engineering', label: 'Engineering' },
        { value: 'sales', label: 'Sales' },
        { value: 'marketing', label: 'Marketing' }
      ],
      gridSize: { xs: 12, sm: 6 }
    },
    {
      name: 'bio',
      label: 'Biography',
      type: 'textarea',
      rows: 3,
      helperText: 'Brief introduction about yourself',
      gridSize: { xs: 12 }
    },
    {
      name: 'active',
      label: 'Active Account',
      type: 'checkbox',
      gridSize: { xs: 12 }
    }
  ];

  const handleSave1 = async (data: User) => {
    showResult(`User created: ${data.name} (${data.email})`);
    setOpen1(false);
  };

  const handleSave2 = async (data: User) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    showResult(`User updated: ${data.name}`);
    setOpen2(false);
  };

  const handleSave3 = async (data: User) => {
    showResult(`Data saved with grid layout`);
    setOpen3(false);
  };

  const openEditDialog = () => {
    setUserData({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      bio: 'Software developer',
      active: true
    });
    setOpen2(true);
  };

  return (
    <PageContainer
      title="CRUD Dialog"
      description="Dynamic form dialog for Create, Read, Update, Delete operations"
    >
      <Stack spacing={4}>
        {/* Result Message */}
        {resultMessage && (
          <Alert severity="success" onClose={() => setResultMessage('')}>
            {resultMessage}
          </Alert>
        )}

        {/* Basic Usage - Create */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage - Create New
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Simple form with text, email, and select fields
          </Typography>

          <Button
            variant="contained"
            onClick={() => {
              setUserData({ name: '', email: '', role: '', bio: '', active: true });
              setOpen1(true);
            }}
          >
            Add New User
          </Button>

          <CrudDialog
            open={open1}
            title="Add New User"
            data={userData}
            fields={basicFields}
            onClose={() => setOpen1(false)}
            onSave={handleSave1}
          />

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
            {`const fields = [
  { name: 'name', label: 'Full Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'user', label: 'User' },
      { value: 'admin', label: 'Administrator' }
    ]
  }
];

<CrudDialog
  open={open}
  title="Add New User"
  data={initialData}
  fields={fields}
  onClose={() => setOpen(false)}
  onSave={async (data) => {
    await saveUser(data);
  }}
/>`}
          </Box>
        </Paper>

        {/* Edit Mode */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Edit Mode with Loading State
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Dialog automatically detects edit mode when data has an 'id' field
          </Typography>

          <Button variant="outlined" onClick={openEditDialog}>
            Edit Existing User
          </Button>

          <CrudDialog
            open={open2}
            title={userData?.id ? 'Edit User' : 'Add User'}
            data={userData}
            fields={basicFields}
            onClose={() => {
              setOpen2(false);
              setUserData(null);
            }}
            onSave={handleSave2}
            loading={loading}
          />

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
            {`// For editing, provide data with id
const existingUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user'
};

<CrudDialog
  data={existingUser}
  loading={loading}
  // ... other props
/>`}
          </Box>
        </Paper>

        {/* Grid Layout with Advanced Fields */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Grid Layout with Multiple Field Types
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use grid layout for better space utilization with textarea and checkbox
          </Typography>

          <Button
            variant="contained"
            onClick={() => {
              setUserData({
                name: '',
                email: '',
                role: '',
                bio: '',
                active: true
              });
              setOpen3(true);
            }}
          >
            Open Grid Form
          </Button>

          <CrudDialog
            open={open3}
            title="User Profile"
            data={userData}
            fields={advancedFields}
            onClose={() => setOpen3(false)}
            onSave={handleSave3}
            maxWidth="md"
            useGrid={true}
          />

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
            {`const fields = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    gridSize: { xs: 12, sm: 6 }  // 50% width on tablet+
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    gridSize: { xs: 12, sm: 6 }
  },
  {
    name: 'bio',
    label: 'Biography',
    type: 'textarea',
    rows: 3,
    gridSize: { xs: 12 }  // Full width
  },
  {
    name: 'active',
    label: 'Active',
    type: 'checkbox'
  }
];

<CrudDialog
  useGrid={true}
  maxWidth="md"
  // ... other props
/>`}
          </Box>
        </Paper>

        {/* Supported Field Types */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Supported Field Types
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box>
              <Chip label="text" size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" component="span">
                Standard text input
              </Typography>
            </Box>
            <Box>
              <Chip label="email" size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" component="span">
                Email input with validation
              </Typography>
            </Box>
            <Box>
              <Chip label="password" size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" component="span">
                Password input (hidden text)
              </Typography>
            </Box>
            <Box>
              <Chip label="number" size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" component="span">
                Numeric input
              </Typography>
            </Box>
            <Box>
              <Chip label="select" size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" component="span">
                Dropdown select (requires options array)
              </Typography>
            </Box>
            <Box>
              <Chip label="textarea" size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" component="span">
                Multi-line text input
              </Typography>
            </Box>
            <Box>
              <Chip label="checkbox" size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" component="span">
                Boolean checkbox
              </Typography>
            </Box>
            <Box>
              <Chip label="userSelector" size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" component="span">
                User search and selection
              </Typography>
            </Box>
            <Box>
              <Chip label="custom" size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" component="span">
                Custom render function for complex fields
              </Typography>
            </Box>
          </Stack>
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
              {`import CrudDialog from '@/components/common/CrudDialog';
import type { FormFieldConfig } from '@/components/common/CrudDialog';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>open</code>: boolean - Dialog open state (required)</li>
            <li><code>title</code>: string - Dialog title (optional, auto-generated)</li>
            <li><code>data</code>: T | null - Form data object (required)</li>
            <li><code>fields</code>: FormFieldConfig[] - Field configurations (required)</li>
            <li><code>onClose</code>: () =&gt; void - Close handler (required)</li>
            <li><code>onSave</code>: (data: T) =&gt; Promise&lt;void&gt; - Save handler (required)</li>
            <li><code>loading</code>: boolean - Loading state (default: false)</li>
            <li><code>maxWidth</code>: xs | sm | md | lg | xl - Dialog width (default: sm)</li>
            <li><code>cancelText</code>: string - Cancel button text (default: &quot;Cancel&quot;)</li>
            <li><code>saveText</code>: string - Save button text (default: &quot;Save&quot;)</li>
            <li><code>useGrid</code>: boolean - Use grid layout (default: false)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Dynamic form generation from field config</li>
            <li>Auto-detection of create vs edit mode</li>
            <li>9 built-in field types</li>
            <li>Grid and Stack layout modes</li>
            <li>Form validation support</li>
            <li>Loading state management</li>
            <li>Responsive design</li>
            <li>Type-safe with TypeScript generics</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Add/Edit user forms</li>
            <li>Quick CRUD operations</li>
            <li>Settings dialogs</li>
            <li>Data entry forms</li>
            <li>Admin panels</li>
            <li>Configuration dialogs</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
