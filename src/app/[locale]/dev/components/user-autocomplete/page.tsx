'use client';

import React, { useState } from 'react';
import { Box, Paper, Typography, Alert, Button, Divider } from '@mui/material';
import UserAutocomplete from '@/components/common/UserAutocomplete';
import ComponentDemoTemplate from '../ComponentDemoTemplate';

export default function UserAutocompleteDemo() {
  // Basic usage
  const [basicValue, setBasicValue] = useState<string | null>(null);

  // Required field with validation
  const [requiredValue, setRequiredValue] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Disabled state
  const [disabledValue, setDisabledValue] = useState<string | null>('user-001');

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

  const examples = [
    {
      title: 'Basic Usage',
      description: 'Simple user selection with autocomplete',
      code: `<UserAutocomplete
  value={userId}
  onChange={setUserId}
  label="User"
  placeholder="Search by username or name..."
/>`,
      component: (
        <Box>
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
        </Box>
      ),
    },
    {
      title: 'Required Field with Validation',
      description: 'Form field with required validation and error handling',
      code: `<form onSubmit={handleSubmit}>
  <UserAutocomplete
    value={userId}
    onChange={setUserId}
    label="User"
    required
    error={submitted && !userId}
    helperText={
      submitted && !userId
        ? "User is required"
        : "Select a user to continue"
    }
  />
  <Button type="submit">Submit</Button>
</form>`,
      component: (
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
      ),
    },
    {
      title: 'Disabled State',
      description: 'Disabled field with pre-selected value',
      code: `<UserAutocomplete
  value={userId}
  onChange={setUserId}
  label="User"
  disabled
/>`,
      component: (
        <Box>
          <UserAutocomplete
            value={disabledValue}
            onChange={setDisabledValue}
            label="User"
            disabled
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This field is disabled and cannot be changed
          </Typography>
        </Box>
      ),
    },
    {
      title: 'With Initial Value',
      description: 'Loads user data when component mounts with initial ID',
      code: `// Component loads user-002 on mount
<UserAutocomplete
  value="user-002"
  onChange={setUserId}
  label="User"
/>`,
      component: (
        <Box>
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
        </Box>
      ),
    },
    {
      title: 'Multiple Fields (Form Example)',
      description: 'Multiple autocomplete fields in a single form',
      code: `<Box>
  <UserAutocomplete
    label="Assignee"
    value={assigneeId}
    onChange={setAssigneeId}
  />
  <UserAutocomplete
    label="Reviewer"
    value={reviewerId}
    onChange={setReviewerId}
  />
  <UserAutocomplete
    label="Approver"
    value={approverId}
    onChange={setApproverId}
  />
</Box>`,
      component: (
        <Box>
          <UserAutocomplete
            label="Assignee"
            value={assigneeId}
            onChange={setAssigneeId}
            placeholder="Select task assignee..."
            helperText="Person responsible for the task"
          />

          <Box sx={{ mt: 2 }} />

          <UserAutocomplete
            label="Reviewer"
            value={reviewerId}
            onChange={setReviewerId}
            placeholder="Select reviewer..."
            helperText="Person who will review the work"
          />

          <Box sx={{ mt: 2 }} />

          <UserAutocomplete
            label="Approver"
            value={approverId}
            onChange={setApproverId}
            placeholder="Select approver..."
            helperText="Person who will approve the work"
          />

          {(assigneeId || reviewerId || approverId) && (
            <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Users:
              </Typography>
              <Divider sx={{ my: 1 }} />
              {assigneeId && (
                <Typography variant="body2">
                  Assignee: {assigneeId}
                </Typography>
              )}
              {reviewerId && (
                <Typography variant="body2">
                  Reviewer: {reviewerId}
                </Typography>
              )}
              {approverId && (
                <Typography variant="body2">
                  Approver: {approverId}
                </Typography>
              )}
            </Paper>
          )}
        </Box>
      ),
    },
  ];

  return (
    <ComponentDemoTemplate
      title="UserAutocomplete"
      description="A lightweight autocomplete component for user selection with server-side search. Optimized for performance with debounced search and minimal bundle size."
      examples={examples}
      features={[
        'Server-side search with debouncing (300ms)',
        'Minimum 2 characters to start search',
        'Loads up to 50 results per search',
        'Automatic user loading by ID',
        'Form validation support (required, error, helperText)',
        'Disabled state support',
        'Displays username and name',
        'Graceful error handling',
        'Lightweight and fast',
      ]}
      props={[
        {
          name: 'value',
          type: 'string | null',
          required: true,
          description: 'Selected user ID',
        },
        {
          name: 'onChange',
          type: '(userId: string | null) => void',
          required: true,
          description: 'Callback when user is selected or cleared',
        },
        {
          name: 'label',
          type: 'string',
          default: "'User'",
          description: 'Label text for the field',
        },
        {
          name: 'placeholder',
          type: 'string',
          default: "'Search by username or name...'",
          description: 'Placeholder text',
        },
        {
          name: 'required',
          type: 'boolean',
          default: 'false',
          description: 'Whether field is required',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Whether field is disabled',
        },
        {
          name: 'error',
          type: 'boolean',
          default: 'false',
          description: 'Whether field has error',
        },
        {
          name: 'helperText',
          type: 'string',
          description: 'Helper or error text below field',
        },
        {
          name: 'fullWidth',
          type: 'boolean',
          default: 'true',
          description: 'Whether field takes full width',
        },
      ]}
      apiEndpoint="/api/user"
      notes={[
        'Search is triggered after typing 2 or more characters',
        'Search is debounced to reduce API calls (300ms delay)',
        'Returns top 50 results per search',
        'Initial value is loaded automatically if provided',
        'Gracefully handles permission errors (403)',
        'Use UserSelector if you need advanced search features',
        'Use UserSearchDialog for multi-select scenarios',
      ]}
    />
  );
}
