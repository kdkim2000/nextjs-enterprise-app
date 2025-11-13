'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Button, Alert } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import UserSearchDialog from '@/components/common/UserSearchDialog';

export default function UserSearchDemoPage() {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const handleSelect = (user: any) => {
    setSelectedUser(user);
    setOpen(false);
  };

  return (
    <PageContainer title="User Search Dialog" description="Dialog for searching and selecting users">
      <Stack spacing={4}>
        {selectedUser && (
          <Alert severity="success" onClose={() => setSelectedUser(null)}>
            Selected: {selectedUser.name} (@{selectedUser.username}) - {selectedUser.email}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            User Search Dialog
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Opens a dialog to search and select users from the system
          </Typography>

          <Button variant="contained" onClick={() => setOpen(true)}>
            Open User Search
          </Button>

          <UserSearchDialog
            open={open}
            onClose={() => setOpen(false)}
            onSelect={handleSelect}
            title="Select User"
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
            {`<UserSearchDialog
  open={open}
  onClose={() => setOpen(false)}
  onSelect={(user) => {
    console.log('Selected:', user);
    setOpen(false);
  }}
  title="Select User"
/>`}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Reference
          </Typography>

          <Typography variant="body2" component="div">
            <strong>Import:</strong>
            <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 1 }}>
              {`import UserSearchDialog from '@/components/common/UserSearchDialog';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>open</code>: boolean - Dialog open state (required)</li>
            <li><code>onClose</code>: () =&gt; void - Close handler (required)</li>
            <li><code>onSelect</code>: (user: User) =&gt; void - User selection handler (required)</li>
            <li><code>title</code>: string - Dialog title (default: &quot;Search User&quot;)</li>
            <li><code>selectedUserId</code>: string | null - Pre-selected user ID (optional)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>User Interface:</strong>
          </Typography>
          <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 1, fontSize: '0.875rem' }}>
            {`interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}`}
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Real-time search filtering</li>
            <li>Searches by username, name, email, or ID</li>
            <li>Displays user role and active status</li>
            <li>Avatar placeholder for each user</li>
            <li>Loading state while fetching</li>
            <li>Error handling for API failures</li>
            <li>Scrollable user list</li>
            <li>Highlight selected user</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, bgcolor: 'info.50', p: 2, borderRadius: 1 }}>
            <strong>Backend Integration:</strong> Requires <code>GET /user</code> API endpoint that returns a list of users.
          </Typography>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
