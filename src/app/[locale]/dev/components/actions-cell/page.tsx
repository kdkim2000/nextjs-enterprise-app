'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import ActionsCell from '@/components/common/ActionsCell';
import StatusChangeMenu from '@/components/common/StatusChangeMenu';

interface DemoUser {
  id: string;
  name: string;
  email: string;
  status: string;
}

export default function ActionsCellDemoPage() {
  const [actionMessage, setActionMessage] = useState<string>('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<DemoUser | null>(null);

  const users: DemoUser[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', status: 'inactive' }
  ];

  const showMessage = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleEdit = (user: DemoUser) => {
    showMessage(`Edit clicked for: ${user.name}`);
  };

  const handleMore = (event: React.MouseEvent<HTMLElement>, user: DemoUser) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedUser(null);
  };

  return (
    <PageContainer
      title="Actions Cell"
      description="Action buttons for table rows with Edit and More options"
    >
      <Stack spacing={4}>
        {/* Action Message Alert */}
        {actionMessage && (
          <Alert severity="info" onClose={() => setActionMessage('')}>
            {actionMessage}
          </Alert>
        )}

        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Default ActionsCell with Edit and More buttons
          </Typography>

          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, display: 'inline-flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2">User Actions:</Typography>
            <ActionsCell
              onEdit={() => showMessage('Edit button clicked')}
              onMore={(e) => showMessage('More button clicked')}
            />
          </Box>

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
            {`<ActionsCell
  onEdit={() => console.log('Edit')}
  onMore={(e) => console.log('More', e)}
/>`}
          </Box>
        </Paper>

        {/* Edit Only */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Edit Button Only
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Show only the edit button by hiding the more button
          </Typography>

          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, display: 'inline-flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2">Quick Edit:</Typography>
            <ActionsCell
              onEdit={() => showMessage('Quick edit clicked')}
              showMore={false}
            />
          </Box>

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
            {`<ActionsCell
  onEdit={() => console.log('Edit')}
  showMore={false}
/>`}
          </Box>
        </Paper>

        {/* More Only */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            More Button Only
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Show only the more button for additional actions
          </Typography>

          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, display: 'inline-flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2">Context Menu:</Typography>
            <ActionsCell
              onMore={(e) => showMessage('Context menu opened')}
              showEdit={false}
            />
          </Box>

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
            {`<ActionsCell
  onMore={(e) => console.log('More', e)}
  showEdit={false}
/>`}
          </Box>
        </Paper>

        {/* Custom Tooltips */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Tooltips
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customize tooltip text for better context
          </Typography>

          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, display: 'inline-flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2">Hover to see tooltips:</Typography>
            <ActionsCell
              onEdit={() => showMessage('Modify user details')}
              onMore={(e) => showMessage('Additional operations')}
              editTooltip="Modify user details"
              moreTooltip="Additional operations"
            />
          </Box>

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
            {`<ActionsCell
  editTooltip="Modify user details"
  moreTooltip="Additional operations"
/>`}
          </Box>
        </Paper>

        {/* Disabled State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Disabled State
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Disable actions when operations are not allowed
          </Typography>

          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, display: 'inline-flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2">Disabled Actions:</Typography>
            <ActionsCell
              onEdit={() => {}}
              onMore={() => {}}
              disabled={true}
            />
          </Box>

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
            {`<ActionsCell
  disabled={true}
/>`}
          </Box>
        </Paper>

        {/* In DataGrid Context */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            In DataGrid / Table Context
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            ActionsCell integrated with table rows and context menu
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell align="right">
                      <ActionsCell
                        onEdit={() => handleEdit(user)}
                        onMore={(e) => handleMore(e, user)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <StatusChangeMenu
            anchorEl={menuAnchorEl}
            onClose={handleCloseMenu}
            selectedItem={selectedUser}
            onEdit={(user) => {
              showMessage(`Edit: ${user.name}`);
              handleCloseMenu();
            }}
            onStatusChange={(user, status) => {
              showMessage(`Status changed to: ${status}`);
              handleCloseMenu();
            }}
            onDelete={(user) => {
              showMessage(`Delete: ${user.name}`);
              handleCloseMenu();
            }}
            draftValue="inactive"
            publishedValue="active"
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
            {`<TableCell align="right">
  <ActionsCell
    onEdit={() => handleEdit(row)}
    onMore={(e) => handleMore(e, row)}
  />
</TableCell>`}
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
              {`import ActionsCell from '@/components/common/ActionsCell';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>onEdit</code>: () =&gt; void - Edit button click handler (optional)</li>
            <li><code>onMore</code>: (event: React.MouseEvent) =&gt; void - More button click handler (optional)</li>
            <li><code>showEdit</code>: boolean - Show edit button (default: true)</li>
            <li><code>showMore</code>: boolean - Show more button (default: true)</li>
            <li><code>editTooltip</code>: string - Edit button tooltip (default: &quot;Edit&quot;)</li>
            <li><code>moreTooltip</code>: string - More button tooltip (default: &quot;More actions&quot;)</li>
            <li><code>disabled</code>: boolean - Disable all buttons (default: false)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Compact icon buttons for table cells</li>
            <li>Tooltip support for better UX</li>
            <li>Disabled state support</li>
            <li>Flexible visibility controls</li>
            <li>Works with Material-UI Menu/Popover</li>
            <li>Small size optimized for DataGrid rows</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>DataGrid action columns</li>
            <li>Table row actions</li>
            <li>List item actions</li>
            <li>Combined with StatusChangeMenu for context menus</li>
            <li>User management tables</li>
            <li>Content management lists</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Best Practices:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Use <code>onMore</code> with a context menu (StatusChangeMenu) for additional actions</li>
            <li>Pass the event to <code>onMore</code> handler for menu positioning</li>
            <li>Use custom tooltips for clarity</li>
            <li>Hide unused buttons to reduce clutter</li>
            <li>Disable buttons when actions are not allowed</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
