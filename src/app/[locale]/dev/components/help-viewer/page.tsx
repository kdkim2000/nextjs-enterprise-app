'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Button, Alert } from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import PageContainer from '@/components/common/PageContainer';
import HelpViewer from '@/components/common/HelpViewer';

export default function HelpViewerDemoPage() {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  return (
    <PageContainer>
      <Stack spacing={4}>
        {/* Info Alert */}
        <Alert severity="info" icon={<HelpIcon />}>
          <Typography variant="body2">
            <strong>Note:</strong> This component fetches help content from the backend API.
            The actual content display depends on the data returned by{' '}
            <code>/api/help?programId=XXX&language=XX</code>
          </Typography>
        </Alert>

        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Display help content in a dialog for a specific program
          </Typography>

          <Button
            variant="contained"
            startIcon={<HelpIcon />}
            onClick={() => setOpen1(true)}
          >
            Open Help Dialog
          </Button>

          <HelpViewer
            open={open1}
            onClose={() => setOpen1(false)}
            programId="PROG-USER-LIST"
            language="en"
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
            {`<HelpViewer
  open={open}
  onClose={() => setOpen(false)}
  programId="PROG-USER-LIST"
  language="en"
/>`}
          </Box>
        </Paper>

        {/* With Admin Features */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Admin Mode
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            When isAdmin=true, shows Edit button in header and Create options when content is missing
          </Typography>

          <Button
            variant="outlined"
            startIcon={<HelpIcon />}
            onClick={() => setOpen2(true)}
          >
            Open Help (Admin)
          </Button>

          <HelpViewer
            open={open2}
            onClose={() => setOpen2(false)}
            programId="PROG-SAMPLE"
            language="en"
            isAdmin={true}
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
            {`<HelpViewer
  open={open}
  onClose={() => setOpen(false)}
  programId="PROG-SAMPLE"
  language="en"
  isAdmin={true}  // Shows Edit button and create options
/>`}
          </Box>
        </Paper>

        {/* Korean Language */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Multi-language Support
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Support for multiple languages (en, ko)
          </Typography>

          <Button
            variant="outlined"
            startIcon={<HelpIcon />}
            onClick={() => setOpen3(true)}
          >
            한국어 도움말 열기
          </Button>

          <HelpViewer
            open={open3}
            onClose={() => setOpen3(false)}
            programId="PROG-USER-LIST"
            language="ko"
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
            {`<HelpViewer
  open={open}
  onClose={() => setOpen(false)}
  programId="PROG-USER-LIST"
  language="ko"  // Korean language
/>`}
          </Box>
        </Paper>

        {/* Content Structure */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Help Content Structure
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The component displays various sections of help content:
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                1. Main Content
              </Typography>
              <Typography variant="body2" color="text.secondary">
                HTML content displayed at the top of the dialog
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                2. Topics (Sections)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expandable accordion sections with detailed content, sorted by order
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                3. Video Tutorials
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Links to video resources with duration chips and descriptions
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                4. FAQs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Frequently asked questions with answers, sorted by order
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                5. Related Resources
              </Typography>
              <Typography variant="body2" color="text.secondary">
                External links to documentation or related materials
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* States */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Component States
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                Loading State
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Shows CircularProgress while fetching help content from API
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                Empty State (Regular User)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Displays "No help content available" message when no content exists
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                Empty State (Admin)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Shows "Create Help Content" and "Create from Default Template" buttons
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                Error State
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Displays error alert when API call fails (excludes 404 errors)
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                Content State
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Displays full help content with all sections expanded by default
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
            <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 1 }}>
              {`import HelpViewer from '@/components/common/HelpViewer';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>open</code>: boolean - Dialog open state (required)</li>
            <li><code>onClose</code>: () =&gt; void - Close handler (required)</li>
            <li><code>programId</code>: string - Program identifier for help content (required)</li>
            <li><code>language</code>: &quot;en&quot; | &quot;ko&quot; - Content language (default: &quot;en&quot;)</li>
            <li><code>isAdmin</code>: boolean - Show admin features (default: false)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Backend API:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Endpoint: <code>GET /api/help?programId=XXX&language=XX</code></li>
            <li>Returns: <code>{'{ help: HelpContent | null }'}</code></li>
            <li>Template endpoint: <code>GET /api/help?programId=PROG-USER-LIST&language=en&includeAll=true</code></li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Fetches help content from backend API</li>
            <li>Multi-language support (en/ko)</li>
            <li>Rich content display with HTML rendering</li>
            <li>Expandable accordion sections</li>
            <li>Video tutorials with duration</li>
            <li>FAQ sections</li>
            <li>Related resource links</li>
            <li>Admin mode with edit capabilities</li>
            <li>Create from template functionality</li>
            <li>Loading and error states</li>
            <li>Empty state with admin actions</li>
            <li>Auto-expand all sections by default</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Admin Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Edit button in dialog header</li>
            <li>Create new help content button (when empty)</li>
            <li>Create from default template button (when empty)</li>
            <li>Redirects to help management page: <code>/[locale]/admin/help</code></li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Program-specific help dialogs</li>
            <li>User guides and documentation</li>
            <li>Feature tutorials</li>
            <li>FAQ sections</li>
            <li>Video tutorial libraries</li>
            <li>Context-sensitive help</li>
            <li>Multi-language documentation</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
