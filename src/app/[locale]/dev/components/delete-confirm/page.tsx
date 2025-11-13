'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Button, Alert } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';

export default function DeleteConfirmDemoPage() {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [open4, setOpen4] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string>('');

  const showResult = (msg: string) => {
    setResultMessage(msg);
    setTimeout(() => setResultMessage(''), 3000);
  };

  const handleDelete1 = async () => {
    showResult('Single user deleted successfully');
    setOpen1(false);
  };

  const handleDelete2 = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    showResult('3 users deleted successfully');
    setOpen2(false);
  };

  const handleDelete3 = async () => {
    showResult('Custom delete operation completed');
    setOpen3(false);
  };

  const handleDelete4 = async () => {
    showResult('Large batch (50 items) deleted');
    setOpen4(false);
  };

  const multipleUsers = [
    { id: '1', displayName: 'John Doe' },
    { id: '2', displayName: 'Jane Smith' },
    { id: '3', displayName: 'Bob Wilson' }
  ];

  const manyUsers = Array.from({ length: 50 }, (_, i) => ({
    id: `${i + 1}`,
    displayName: `User ${i + 1}`
  }));

  return (
    <PageContainer
      title="Delete Confirm Dialog"
      description="Confirmation dialog for safe delete operations"
    >
      <Stack spacing={4}>
        {/* Result Message */}
        {resultMessage && (
          <Alert severity="success" onClose={() => setResultMessage('')}>
            {resultMessage}
          </Alert>
        )}

        {/* Single Item Delete */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Single Item Delete
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Confirm deletion of a single item
          </Typography>

          <Button
            variant="contained"
            color="error"
            onClick={() => setOpen1(true)}
          >
            Delete User
          </Button>

          <DeleteConfirmDialog
            open={open1}
            itemCount={1}
            itemName="user"
            onCancel={() => setOpen1(false)}
            onConfirm={handleDelete1}
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
            {`<DeleteConfirmDialog
  open={open}
  itemCount={1}
  itemName="user"
  onCancel={() => setOpen(false)}
  onConfirm={async () => {
    await deleteUser();
    setOpen(false);
  }}
/>`}
          </Box>
        </Paper>

        {/* Multiple Items with List */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Multiple Items with List
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Shows list of items to be deleted with loading state
          </Typography>

          <Button
            variant="contained"
            color="error"
            onClick={() => setOpen2(true)}
          >
            Delete 3 Users
          </Button>

          <DeleteConfirmDialog
            open={open2}
            itemCount={3}
            itemName="user"
            itemsList={multipleUsers}
            onCancel={() => setOpen2(false)}
            onConfirm={handleDelete2}
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
            {`const users = [
  { id: '1', displayName: 'John Doe' },
  { id: '2', displayName: 'Jane Smith' },
  { id: '3', displayName: 'Bob Wilson' }
];

<DeleteConfirmDialog
  open={open}
  itemCount={3}
  itemName="user"
  itemsList={users}
  loading={loading}
  onCancel={() => setOpen(false)}
  onConfirm={handleDelete}
/>`}
          </Box>
        </Paper>

        {/* Custom Messages */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Messages
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customize dialog title, button text, and warning message
          </Typography>

          <Button
            variant="outlined"
            color="error"
            onClick={() => setOpen3(true)}
          >
            Remove Document
          </Button>

          <DeleteConfirmDialog
            open={open3}
            itemCount={1}
            itemName="document"
            title="Remove Document?"
            cancelText="Keep It"
            confirmText="Remove"
            warningMessage="This document will be permanently removed from the system. This action cannot be undone and all associated data will be lost."
            onCancel={() => setOpen3(false)}
            onConfirm={handleDelete3}
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
            {`<DeleteConfirmDialog
  title="Remove Document?"
  cancelText="Keep It"
  confirmText="Remove"
  warningMessage="Custom warning message here..."
  // ... other props
/>`}
          </Box>
        </Paper>

        {/* Large List with Truncation */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Large List with Truncation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            When deleting many items, shows first few with "... and X more"
          </Typography>

          <Button
            variant="contained"
            color="error"
            onClick={() => setOpen4(true)}
          >
            Delete 50 Items
          </Button>

          <DeleteConfirmDialog
            open={open4}
            itemCount={50}
            itemName="item"
            itemsList={manyUsers}
            maxDisplayItems={5}
            onCancel={() => setOpen4(false)}
            onConfirm={handleDelete4}
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
            {`<DeleteConfirmDialog
  itemCount={50}
  itemsList={manyItems}
  maxDisplayItems={5}
  // Shows first 5 items, then "... and 45 more"
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
              {`import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>open</code>: boolean - Dialog open state (required)</li>
            <li><code>itemCount</code>: number - Number of items to delete (required)</li>
            <li><code>itemName</code>: string - Item type name (e.g., &quot;user&quot;, &quot;document&quot;) (required)</li>
            <li><code>itemsList</code>: DeleteItem[] - List of items with id and displayName (optional)</li>
            <li><code>onCancel</code>: () =&gt; void - Cancel handler (required)</li>
            <li><code>onConfirm</code>: () =&gt; Promise&lt;void&gt; - Confirm handler, returns promise (required)</li>
            <li><code>loading</code>: boolean - Loading state during delete (default: false)</li>
            <li><code>maxDisplayItems</code>: number - Max items to show before truncating (default: 5)</li>
            <li><code>title</code>: string - Dialog title (default: &quot;Confirm Delete&quot;)</li>
            <li><code>cancelText</code>: string - Cancel button text (default: &quot;Cancel&quot;)</li>
            <li><code>confirmText</code>: string - Confirm button text (default: &quot;Delete&quot;)</li>
            <li><code>warningMessage</code>: string - Custom warning message (optional)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>DeleteItem Interface:</strong>
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
            {`interface DeleteItem {
  id: string | number;
  displayName: string;
}`}
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Warning alert for dangerous actions</li>
            <li>Optional list of items to be deleted</li>
            <li>Automatic truncation for large lists</li>
            <li>Loading state with spinner</li>
            <li>Fully customizable text and messages</li>
            <li>Async delete operation support</li>
            <li>Prevents accidental deletions</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>User deletion confirmation</li>
            <li>Bulk delete operations</li>
            <li>Document/file removal</li>
            <li>Data record deletion</li>
            <li>Account termination</li>
            <li>Any destructive operation requiring confirmation</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Best Practices:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Always use for destructive actions</li>
            <li>Show loading state during async operations</li>
            <li>Provide item list when deleting multiple items</li>
            <li>Use clear, specific warning messages</li>
            <li>Make confirm button error color (red)</li>
            <li>Close dialog only after successful deletion</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
