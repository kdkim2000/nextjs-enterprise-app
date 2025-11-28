'use client';

import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import EmptyState from '@/components/common/EmptyState';
import {
  Search,
  Inbox,
  FolderOpen,
  ShoppingCart,
  FilterList,
  CloudOff,
  NotificationsNone
} from '@mui/icons-material';

export default function EmptyStateDemoPage() {
  return (
    <PageContainer
      title="Empty State"
      description="Display empty state with icon, message, and action button"
    >
      <Stack spacing={4}>
        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage (No Results)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Simple empty state with default search icon
          </Typography>

          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, minHeight: 300 }}>
            <EmptyState
              title="No results found"
              description="Try adjusting your search or filter to find what you're looking for"
            />
          </Box>
        </Paper>

        {/* With Custom Icon */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Custom Icon (Empty Inbox)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Custom icon for specific context
          </Typography>

          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, minHeight: 300 }}>
            <EmptyState
              icon={Inbox}
              title="Your inbox is empty"
              description="All caught up! You have no new messages at the moment."
            />
          </Box>
        </Paper>

        {/* With Action Button */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            With Action Button (Empty Folder)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Includes an action button for user interaction
          </Typography>

          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, minHeight: 300 }}>
            <EmptyState
              icon={FolderOpen}
              title="No files yet"
              description="Upload your first file to get started"
              action={
                <Button variant="contained" size="medium">
                  Upload File
                </Button>
              }
            />
          </Box>
        </Paper>

        {/* Multiple Examples Grid */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Various Empty State Scenarios
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Different use cases with appropriate icons and messages
          </Typography>

          <Stack spacing={3}>
            {/* Empty Cart */}
            <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, minHeight: 250 }}>
              <EmptyState
                icon={ShoppingCart}
                title="Your cart is empty"
                description="Add items to your cart to continue shopping"
                action={
                  <Button variant="outlined" size="small">
                    Browse Products
                  </Button>
                }
              />
            </Box>

            {/* No Filters Applied */}
            <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, minHeight: 250 }}>
              <EmptyState
                icon={FilterList}
                title="No filters match your criteria"
                description="Try removing some filters to see more results"
                action={
                  <Button variant="text" size="small">
                    Clear All Filters
                  </Button>
                }
              />
            </Box>

            {/* Offline State */}
            <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, minHeight: 250 }}>
              <EmptyState
                icon={CloudOff}
                title="You're offline"
                description="Check your internet connection and try again"
                action={
                  <Button variant="contained" color="error" size="small">
                    Retry Connection
                  </Button>
                }
              />
            </Box>

            {/* No Notifications */}
            <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, minHeight: 250 }}>
              <EmptyState
                icon={NotificationsNone}
                title="No notifications"
                description="You're all caught up! Check back later for updates"
              />
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
              {`import EmptyState from '@/components/common/EmptyState';\nimport { Inbox } from '@mui/icons-material';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>icon</code>: React.ComponentType - Icon component from @mui/icons-material (default: Search)</li>
            <li><code>title</code>: string - Main title text (required)</li>
            <li><code>description</code>: string - Descriptive text below title (optional)</li>
            <li><code>action</code>: React.ReactNode - Action button or custom component (optional)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Centered layout with flexible sizing</li>
            <li>Customizable icon from Material Icons</li>
            <li>Optional description and action elements</li>
            <li>Consistent spacing and typography</li>
            <li>Works well in various container sizes</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>No search results found</li>
            <li>Empty data tables or lists</li>
            <li>No content available yet</li>
            <li>Filter results in zero items</li>
            <li>Error or offline states</li>
            <li>First-time user experience (no data yet)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Example Usage:</strong>
          </Typography>
          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              mt: 1,
              fontSize: '0.875rem'
            }}
          >
            {`<EmptyState
  icon={Inbox}
  title="No messages"
  description="Your inbox is empty"
  action={
    <Button variant="contained">
      Compose Message
    </Button>
  }
/>`}
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
