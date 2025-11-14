'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Alert, Divider } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import UserSelector from '@/components/common/UserSelector';

export default function UserSelectorDemoPage() {
  const [selectedUser1, setSelectedUser1] = useState<string | null>(null);
  const [selectedUser2, setSelectedUser2] = useState<string | null>(null);
  const [selectedUser3, setSelectedUser3] = useState<string | null>(null);
  const [selectedUser4, setSelectedUser4] = useState<string | null>(null);
  const [selectedUser5, setSelectedUser5] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const handleUserSelect = (userId: string | null, user?: any) => {
    if (user) {
      setMessage(`Selected: ${user.name} (@${user.username}) - ${user.email}${user.department ? ` | ${user.department}` : ''}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <PageContainer title="User Selector" description="Search and select users with advanced features">
      <Stack spacing={4}>
        {message && (
          <Alert severity="success" onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage (Simple Search)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click search icon to open user search dialog. Type at least 2 characters to search.
          </Typography>

          <UserSelector
            label="Assignee"
            value={selectedUser1}
            onChange={(userId, user) => {
              setSelectedUser1(userId);
              handleUserSelect(userId, user);
            }}
            helperText="Select a user to assign this task"
            locale="en"
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
  locale="en"
/>`}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Advanced Search (Korean)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enable advanced search with separate filters for name, username, email, and department
          </Typography>

          <UserSelector
            label="담당자"
            value={selectedUser2}
            onChange={(userId, user) => {
              setSelectedUser2(userId);
              handleUserSelect(userId, user);
            }}
            locale="ko"
            showAdvancedSearch={true}
            helperText="이름, 사용자명, 이메일, 부서로 검색 가능"
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
  label="담당자"
  value={userId}
  onChange={setUserId}
  locale="ko"
  showAdvancedSearch={true}
  helperText="이름, 사용자명, 이메일, 부서로 검색 가능"
/>`}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Required Field with Validation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Mark field as required and show error state
          </Typography>

          <UserSelector
            label="Reviewer"
            value={selectedUser3}
            onChange={setSelectedUser3}
            required
            error={!selectedUser3}
            helperText={!selectedUser3 ? "Reviewer is required" : "Reviewer assigned"}
            showAdvancedSearch={true}
            locale="en"
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
            value={selectedUser4}
            onChange={setSelectedUser4}
            disabled
            helperText="This field is read-only"
            locale="en"
          />
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Search Limits
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customize minimum search length and maximum results
          </Typography>

          <UserSelector
            label="Approver"
            value={selectedUser5}
            onChange={(userId, user) => {
              setSelectedUser5(userId);
              handleUserSelect(userId, user);
            }}
            showAdvancedSearch={true}
            minSearchLength={3}
            maxResults={50}
            helperText="Requires 3+ characters, shows max 50 results"
            locale="en"
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
  label="Approver"
  value={userId}
  onChange={setUserId}
  showAdvancedSearch={true}
  minSearchLength={3}      // Requires 3 chars
  maxResults={50}          // Max 50 results
  filterByStatus="active"  // Only active users
  locale="en"
/>`}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Reference
          </Typography>

          <Divider sx={{ my: 2 }} />

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

          <Typography variant="body2" sx={{ mt: 3 }}>
            <strong>Required Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>label</code>: string - Field label</li>
            <li><code>value</code>: string | null - Selected user ID</li>
            <li><code>onChange</code>: (userId: string | null, user?: User) =&gt; void - Change handler</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Optional Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>helperText</code>: string - Helper text below field</li>
            <li><code>error</code>: boolean - Show error state (default: false)</li>
            <li><code>required</code>: boolean - Mark as required (default: false)</li>
            <li><code>disabled</code>: boolean - Disable field (default: false)</li>
            <li><code>locale</code>: 'ko' | 'en' - Language (default: 'en')</li>
            <li><code>showAdvancedSearch</code>: boolean - Enable advanced search (default: false)</li>
            <li><code>minSearchLength</code>: number - Minimum search chars (default: 2)</li>
            <li><code>maxResults</code>: number - Maximum results (default: 200)</li>
            <li><code>filterByStatus</code>: string - Status filter (default: 'active')</li>
            <li><code>excludedUserIds</code>: string[] - User IDs to exclude (default: [])</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 3 }}>
            <strong>New Features (v2):</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>✅ Advanced search with separate filters (name, username, email, department)</li>
            <li>✅ Department badge display</li>
            <li>✅ Korean/English localization</li>
            <li>✅ Customizable search parameters</li>
            <li>✅ Performance optimized (2-char min search, debounce, result limits)</li>
            <li>✅ Server-side search for large datasets</li>
            <li>✅ User exclusion support</li>
            <li>✅ Auto-load user info when value changes</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 3 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Task assignment forms</li>
            <li>Reviewer/approver selection</li>
            <li>Team member selection</li>
            <li>Permission assignment</li>
            <li>User filtering in search forms</li>
            <li>Project manager assignment</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, bgcolor: 'info.50', p: 2, borderRadius: 1 }}>
            <strong>Backend Requirements:</strong>
            <br />
            - <code>GET /api/user?id=&#123;userId&#125;</code> - Fetch single user by ID
            <br />
            - <code>GET /api/user?name=&username=&email=&department=&limit=&status=</code> - Search users
            <br />
            <br />
            The component uses UserSearchDialog internally for the search interface.
          </Typography>

          <Typography variant="body2" sx={{ mt: 2, bgcolor: 'success.50', p: 2, borderRadius: 1 }}>
            <strong>Backward Compatible:</strong> Existing code works without changes. New features are opt-in via props.
          </Typography>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
