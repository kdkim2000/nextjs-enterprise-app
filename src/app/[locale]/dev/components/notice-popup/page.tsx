'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Button, Alert, Divider, Chip, Card, CardContent } from '@mui/material';
import { Notifications, Schedule, Visibility, VisibilityOff } from '@mui/icons-material';
import PageContainer from '@/components/common/PageContainer';

export default function NoticePopupDemoPage() {
  const [message, setMessage] = useState('');

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const clearHiddenNotices = () => {
    localStorage.removeItem('hiddenNotices');
    showMessage('Hidden notices cleared! Refresh the page to see popup notices again.');
  };

  const checkHiddenNotices = () => {
    const hidden = localStorage.getItem('hiddenNotices');
    if (hidden) {
      const parsed = JSON.parse(hidden);
      const count = Object.keys(parsed).length;
      showMessage(`${count} notice(s) are hidden until tomorrow.`);
    } else {
      showMessage('No notices are hidden.');
    }
  };

  return (
    <PageContainer
      title="Notice Popup"
      description="Automatic popup dialog for important notifications"
    >
      <Stack spacing={4}>
        {/* Message */}
        {message && (
          <Alert severity="info" onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        {/* Overview */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Overview
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            NoticePopup automatically displays important notifications when users log in.
            Users can dismiss notices with &quot;Don&apos;t show today&quot; option, which uses localStorage to remember their preference.
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Notifications sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle2">Auto Fetch</Typography>
                <Typography variant="caption" color="text.secondary">
                  Fetches notices on login
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="subtitle2">Hide Until Tomorrow</Typography>
                <Typography variant="caption" color="text.secondary">
                  User preference stored locally
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Visibility sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="subtitle2">Multiple Notices</Typography>
                <Typography variant="caption" color="text.secondary">
                  Tab-based navigation
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          <Alert severity="info">
            NoticePopup is typically placed in the main layout and automatically shows popup notices.
            It fetches from <code>/api/post/popup-notifications</code> endpoint.
          </Alert>
        </Paper>

        {/* LocalStorage Management */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            LocalStorage Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage the &quot;Don&apos;t show today&quot; preferences stored in localStorage
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={checkHiddenNotices}
            >
              Check Hidden Notices
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<VisibilityOff />}
              onClick={clearHiddenNotices}
            >
              Clear Hidden Notices
            </Button>
          </Stack>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              mt: 3,
              fontSize: '0.875rem',
            }}
          >
            {`// LocalStorage structure for hidden notices
{
  "hiddenNotices": {
    "notice-id-1": "2024-01-16T00:00:00.000Z",  // Hide until this date
    "notice-id-2": "2024-01-16T00:00:00.000Z"
  }
}`}
          </Box>
        </Paper>

        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add NoticePopup to your main layout component
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {`import NoticePopup from '@/components/common/NoticePopup';

// In your main layout (e.g., MainLayout.tsx)
function MainLayout({ children }) {
  return (
    <Box>
      {/* NoticePopup automatically shows on login */}
      <NoticePopup />

      <Header />
      <Sidebar />
      <main>{children}</main>
    </Box>
  );
}`}
          </Box>
        </Paper>

        {/* With Close Callback */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Close Callback
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Handle actions when the popup is closed
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {`<NoticePopup
  onClose={() => {
    console.log('User closed the notice popup');
    // You can track analytics, update state, etc.
  }}
/>`}
          </Box>
        </Paper>

        {/* Backend API */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Backend API Requirements
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            The NoticePopup component expects the following API endpoint
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {`// GET /api/post/popup-notifications
// Returns active popup notifications for the current user

// Response format:
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid-string",
        "title": "Important Notice",
        "content": "<p>HTML content here...</p>",
        "createdAt": "2024-01-15T10:00:00Z",
        "displayStartDate": "2024-01-15T00:00:00Z",
        "displayEndDate": "2024-01-31T23:59:59Z"
      }
    ]
  }
}

// Backend should filter by:
// - isPopup: true
// - displayStartDate <= now <= displayEndDate
// - isActive: true`}
          </Box>
        </Paper>

        {/* Notice Interface */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notice Data Structure
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            TypeScript interface for notice objects
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {`interface Notice {
  id: string;                        // Unique identifier
  title: string;                     // Notice title
  content: string;                   // HTML content (rendered with SafeHtmlRenderer)
  createdAt: string;                 // ISO date string
  displayStartDate?: string | null;  // When to start showing
  displayEndDate?: string | null;    // When to stop showing
}`}
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
              {`import NoticePopup from '@/components/common/NoticePopup';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>onClose</code>: () =&gt; void - Optional callback when popup is closed</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Automatically fetches popup notifications on user login</li>
            <li>Supports multiple notices with tab navigation</li>
            <li>&quot;Don&apos;t show today&quot; checkbox with localStorage persistence</li>
            <li>HTML content rendering with SafeHtmlRenderer</li>
            <li>Responsive dialog (fullWidth, maxWidth=&quot;md&quot;)</li>
            <li>Korean date formatting for createdAt display</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Behavior:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Only shows when user is authenticated</li>
            <li>Waits for auth loading to complete before fetching</li>
            <li>Filters out notices hidden by user preference</li>
            <li>Hidden notices expire at midnight the next day</li>
            <li>Returns null if no notices to display</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Dependencies:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>useAuth</code> - For authentication state</li>
            <li><code>apiClient</code> - For API calls</li>
            <li><code>SafeHtmlRenderer</code> - For secure HTML rendering</li>
            <li><code>localStorage</code> - For &quot;don&apos;t show today&quot; persistence</li>
          </Box>
        </Paper>

        {/* Best Practices */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Best Practices
          </Typography>
          <Box component="ul">
            <li>Place NoticePopup in the main layout, not individual pages</li>
            <li>Keep notice content concise and scannable</li>
            <li>Use displayStartDate/displayEndDate for time-limited announcements</li>
            <li>Sanitize HTML content on the backend before storing</li>
            <li>Limit the number of active popup notices (recommended: 1-3)</li>
            <li>Provide clear call-to-action in notice content</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
