'use client';

import React, { useState } from 'react';
import { Box, Paper, Typography, Alert, Button, Divider, Stack } from '@mui/material';
import UserAutocomplete from '@/components/common/UserAutocomplete';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';

export default function UserAutocompleteDemo() {
  // Basic usage
  const [basicValue, setBasicValue] = useState<string | null>(null);

  // Required field with validation
  const [requiredValue, setRequiredValue] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Disabled state
  const [disabledValue] = useState<string | null>('user-001');

  // With initial value
  const [initialValue, setInitialValue] = useState<string | null>('user-002');

  // Multiple instances
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [reviewerId, setReviewerId] = useState<string | null>(null);
  const [approverId, setApproverId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (requiredValue) {
      alert(`Form submitted! Selected user: ${requiredValue}`);
      setSubmitted(false);
      setRequiredValue(null);
    }
  };

  return (
    <PageContainer fullHeight={false}>
      <PageHeader useMenu showBreadcrumb />

      <Stack spacing={4}>
        {/* Header */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            UserAutocomplete Component
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A lightweight autocomplete component for user selection with server-side search.
            Optimized for performance with debounced search and minimal bundle size.
          </Typography>
        </Paper>

        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Simple user selection with autocomplete. Type at least 2 characters to search.
          </Typography>

          <UserAutocomplete
            value={basicValue}
            onChange={setBasicValue}
            label="User"
            placeholder="Search by username or name..."
          />

          {basicValue && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Selected User ID: {basicValue}
            </Alert>
          )}
        </Paper>

        {/* Required Field with Validation */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Required Field with Validation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Form field with required validation and error handling.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <UserAutocomplete
              value={requiredValue}
              onChange={setRequiredValue}
              label="User"
              placeholder="Type to search..."
              required
              error={submitted && !requiredValue}
              helperText={
                submitted && !requiredValue
                  ? "User is required"
                  : "Select a user to continue"
              }
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Submit Form
            </Button>
          </Box>
        </Paper>

        {/* Disabled State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Disabled State
          </Typography>

          <UserAutocomplete
            value={disabledValue}
            onChange={() => {}}
            label="User"
            disabled
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This field is disabled and cannot be changed
          </Typography>
        </Paper>

        {/* With Initial Value */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Initial Value
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Loads user data when component mounts with initial ID.
          </Typography>

          <UserAutocomplete
            value={initialValue}
            onChange={setInitialValue}
            label="User"
            placeholder="Search or change user..."
          />

          {initialValue && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Current User ID: {initialValue}
            </Alert>
          )}
        </Paper>

        {/* Multiple Fields */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Multiple Fields (Form Example)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Multiple autocomplete fields in a single form.
          </Typography>

          <Stack spacing={2}>
            <UserAutocomplete
              label="Assignee"
              value={assigneeId}
              onChange={setAssigneeId}
              placeholder="Select task assignee..."
              helperText="Person responsible for the task"
            />

            <UserAutocomplete
              label="Reviewer"
              value={reviewerId}
              onChange={setReviewerId}
              placeholder="Select reviewer..."
              helperText="Person who will review the work"
            />

            <UserAutocomplete
              label="Approver"
              value={approverId}
              onChange={setApproverId}
              placeholder="Select approver..."
              helperText="Person who will approve the work"
            />
          </Stack>

          {(assigneeId || reviewerId || approverId) && (
            <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Users:
              </Typography>
              <Divider sx={{ my: 1 }} />
              {assigneeId && (
                <Typography variant="body2">Assignee: {assigneeId}</Typography>
              )}
              {reviewerId && (
                <Typography variant="body2">Reviewer: {reviewerId}</Typography>
              )}
              {approverId && (
                <Typography variant="body2">Approver: {approverId}</Typography>
              )}
            </Paper>
          )}
        </Paper>

        <Divider />

        {/* Features */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Features
          </Typography>
          <Stack spacing={1}>
            {[
              'Server-side search with debouncing (300ms)',
              'Minimum 2 characters to start search',
              'Loads up to 50 results per search',
              'Automatic user loading by ID',
              'Form validation support (required, error, helperText)',
              'Disabled state support',
              'Displays username and name',
              'Graceful error handling',
              'Lightweight and fast',
            ].map((feature, index) => (
              <Typography key={index} variant="body2" color="text.secondary">
                • {feature}
              </Typography>
            ))}
          </Stack>
        </Paper>

        {/* Props Reference */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Props Reference
          </Typography>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <Box component="thead">
              <Box component="tr" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Prop</Box>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Type</Box>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Default</Box>
                <Box component="th" sx={{ p: 1, textAlign: 'left' }}>Description</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {[
                { prop: 'value', type: 'string | null', default: '-', desc: 'Selected user ID' },
                { prop: 'onChange', type: '(userId: string | null) => void', default: '-', desc: 'Callback when user is selected or cleared' },
                { prop: 'label', type: 'string', default: "'User'", desc: 'Label text for the field' },
                { prop: 'placeholder', type: 'string', default: "'Search by username...'", desc: 'Placeholder text' },
                { prop: 'required', type: 'boolean', default: 'false', desc: 'Whether field is required' },
                { prop: 'disabled', type: 'boolean', default: 'false', desc: 'Whether field is disabled' },
                { prop: 'error', type: 'boolean', default: 'false', desc: 'Error state' },
                { prop: 'helperText', type: 'string', default: '-', desc: 'Helper/error text' },
                { prop: 'fullWidth', type: 'boolean', default: 'true', desc: 'Full width' },
              ].map((row, index) => (
                <Box component="tr" key={index} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Box component="td" sx={{ p: 1 }}><code>{row.prop}</code></Box>
                  <Box component="td" sx={{ p: 1 }}><code>{row.type}</code></Box>
                  <Box component="td" sx={{ p: 1 }}>{row.default}</Box>
                  <Box component="td" sx={{ p: 1 }}>{row.desc}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Usage Example */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Usage Example
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, fontFamily: 'monospace', fontSize: 13 }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`import UserAutocomplete from '@/components/common/UserAutocomplete';

const [userId, setUserId] = useState<string | null>(null);

<UserAutocomplete
  value={userId}
  onChange={setUserId}
  label="Select User"
  placeholder="Search by username or name..."
  required
/>`}
            </pre>
          </Box>
        </Paper>

        {/* Notes */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notes
          </Typography>
          <Alert severity="info">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Search is triggered after typing 2 or more characters</li>
              <li>Search is debounced to reduce API calls (300ms delay)</li>
              <li>Returns top 50 results per search</li>
              <li>Initial value is loaded automatically if provided</li>
              <li>Gracefully handles permission errors (403)</li>
              <li>Use UserSelector if you need advanced search features</li>
              <li>Use UserSearchDialog for multi-select scenarios</li>
            </ul>
          </Alert>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
