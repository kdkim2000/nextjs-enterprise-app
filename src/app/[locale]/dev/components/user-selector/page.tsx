'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Alert, FormControl } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import UserSelector from '@/components/common/UserSelector';

export default function UserSelectorDemoPage() {
  const [selectedUser1, setSelectedUser1] = useState<string | null>(null);
  const [selectedUser2, setSelectedUser2] = useState<string | null>(null);
  const [selectedUser3, setSelectedUser3] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const handleUserSelect = (userId: string | null, user?: any) => {
    if (user) {
      setMessage(`Selected: ${user.name} (@${user.username})`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <PageContainer title="User Selector" description="Search and select users with dialog">
      <Stack spacing={4}>
        {message && (
          <Alert severity="success" onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click search icon to open user search dialog
          </Typography>

          <UserSelector
            label="Assignee"
            value={selectedUser1}
            onChange={(userId, user) => {
              setSelectedUser1(userId);
              handleUserSelect(userId, user);
            }}
            helperText="Select a user to assign this task"
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
            {`<UserSelector
  label="Assignee"
  value={userId}
  onChange={(userId, user) => {
    setUserId(userId);
    console.log('Selected user:', user);
  }}
  helperText="Select a user"
/>`}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Required Field
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Mark field as required
          </Typography>

          <UserSelector
            label="Reviewer"
            value={selectedUser2}
            onChange={setSelectedUser2}
            required
            helperText="This field is required"
          />
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Disabled State
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Disable user selection
          </Typography>

          <UserSelector
            label="Created By"
            value={selectedUser3}
            onChange={setSelectedUser3}
            disabled
            helperText="This field is read-only"
          />
        </Paper>

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
              {`import UserSelector from '@/components/common/UserSelector';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>label</code>: string - Field label (required)</li>
            <li><code>value</code>: string | null - Selected user ID (required)</li>
            <li><code>onChange</code>: (userId: string | null, user?: User) =&gt; void - Change handler (required)</li>
            <li><code>helperText</code>: string - Helper text below field (optional)</li>
            <li><code>error</code>: boolean - Show error state (default: false)</li>
            <li><code>required</code>: boolean - Mark as required (default: false)</li>
            <li><code>disabled</code>: boolean - Disable field (default: false)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Opens UserSearchDialog on click</li>
            <li>Displays selected user with username and email</li>
            <li>Shows role badge for selected user</li>
            <li>Clear button to deselect</li>
            <li>Read-only text field (prevents manual input)</li>
            <li>Integrates with backend user API</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Task assignment forms</li>
            <li>User selection in CrudDialog</li>
            <li>Reviewer/approver selection</li>
            <li>User filtering in search forms</li>
            <li>Permission assignment</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, bgcolor: 'info.50', p: 2, borderRadius: 1 }}>
            <strong>Note:</strong> This component requires backend API at <code>GET /user</code> to fetch user list.
            The UserSearchDialog will handle the search and selection UI.
          </Typography>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
