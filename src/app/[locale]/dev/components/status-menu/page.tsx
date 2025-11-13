'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, Button, Chip, Alert, MenuItem } from '@mui/material';
import PageContainer from '@/components/common/PageContainer';
import StatusChangeMenu from '@/components/common/StatusChangeMenu';

interface DemoItem {
  id: string;
  name: string;
  status: string;
}

export default function StatusMenuDemoPage() {
  const [anchorEl1, setAnchorEl1] = useState<null | HTMLElement>(null);
  const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
  const [anchorEl3, setAnchorEl3] = useState<null | HTMLElement>(null);
  const [anchorEl4, setAnchorEl4] = useState<null | HTMLElement>(null);

  const [item1, setItem1] = useState<DemoItem>({ id: '1', name: 'Draft Document', status: 'draft' });
  const [item2, setItem2] = useState<DemoItem>({ id: '2', name: 'Published Article', status: 'published' });
  const [item3, setItem3] = useState<DemoItem>({ id: '3', name: 'Custom Item', status: 'pending' });
  const [item4, setItem4] = useState<DemoItem>({ id: '4', name: 'Blog Post', status: 'draft' });

  const [actionMessage, setActionMessage] = useState<string>('');

  const showMessage = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleEdit1 = (item: DemoItem) => {
    showMessage(`Edit clicked for: ${item.name}`);
  };

  const handleStatusChange1 = (item: DemoItem, newStatus: string) => {
    setItem1({ ...item, status: newStatus });
    showMessage(`Status changed to: ${newStatus}`);
  };

  const handleDelete1 = (item: DemoItem) => {
    showMessage(`Delete clicked for: ${item.name}`);
  };

  const handleStatusChange2 = (item: DemoItem, newStatus: string) => {
    setItem2({ ...item, status: newStatus });
    showMessage(`Status changed to: ${newStatus}`);
  };

  const handleStatusChange3 = (item: DemoItem, newStatus: string) => {
    setItem3({ ...item, status: newStatus });
    showMessage(`Status changed from ${item.status} to: ${newStatus}`);
  };

  const handleStatusChange4 = (item: DemoItem, newStatus: string) => {
    setItem4({ ...item, status: newStatus });
    showMessage(`Status changed to: ${newStatus}`);
  };

  return (
    <PageContainer
      title="Status Change Menu"
      description="Context menu for item actions with status management"
    >
      <Stack spacing={4}>
        {/* Action Message Alert */}
        {actionMessage && (
          <Alert severity="success" onClose={() => setActionMessage('')}>
            {actionMessage}
          </Alert>
        )}

        {/* Basic Usage - Draft Item */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage - Draft Item
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Draft item shows Edit, Publish, and Delete actions
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">{item1.name}</Typography>
            <Chip
              label={item1.status}
              size="small"
              color={item1.status === 'draft' ? 'default' : 'success'}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => setAnchorEl1(e.currentTarget)}
            >
              Actions
            </Button>
          </Box>

          <StatusChangeMenu
            anchorEl={anchorEl1}
            onClose={() => setAnchorEl1(null)}
            selectedItem={item1}
            onEdit={handleEdit1}
            onStatusChange={handleStatusChange1}
            onDelete={handleDelete1}
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
            {`<StatusChangeMenu
  anchorEl={anchorEl}
  onClose={() => setAnchorEl(null)}
  selectedItem={item}
  onEdit={(item) => console.log('Edit', item)}
  onStatusChange={(item, status) => console.log('Status changed', status)}
  onDelete={(item) => console.log('Delete', item)}
/>`}
          </Box>
        </Paper>

        {/* Published Item */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Published Item
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Published item shows Edit, Unpublish, and Delete actions
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">{item2.name}</Typography>
            <Chip
              label={item2.status}
              size="small"
              color={item2.status === 'published' ? 'success' : 'default'}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => setAnchorEl2(e.currentTarget)}
            >
              Actions
            </Button>
          </Box>

          <StatusChangeMenu
            anchorEl={anchorEl2}
            onClose={() => setAnchorEl2(null)}
            selectedItem={item2}
            onEdit={(item) => showMessage(`Edit: ${item.name}`)}
            onStatusChange={handleStatusChange2}
            onDelete={(item) => showMessage(`Delete: ${item.name}`)}
          />
        </Paper>

        {/* Custom Status Values */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Status Values
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use custom status values (pending/active instead of draft/published)
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">{item3.name}</Typography>
            <Chip
              label={item3.status}
              size="small"
              color={item3.status === 'active' ? 'success' : 'warning'}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => setAnchorEl3(e.currentTarget)}
            >
              Actions
            </Button>
          </Box>

          <StatusChangeMenu
            anchorEl={anchorEl3}
            onClose={() => setAnchorEl3(null)}
            selectedItem={item3}
            draftValue="pending"
            publishedValue="active"
            onEdit={(item) => showMessage(`Edit: ${item.name}`)}
            onStatusChange={handleStatusChange3}
            onDelete={(item) => showMessage(`Delete: ${item.name}`)}
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
            {`<StatusChangeMenu
  draftValue="pending"
  publishedValue="active"
  // ... other props
/>`}
          </Box>
        </Paper>

        {/* Selective Actions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selective Actions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Show only specific actions (Edit and Status Change only, no Delete)
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">{item4.name}</Typography>
            <Chip label={item4.status} size="small" color="default" />
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => setAnchorEl4(e.currentTarget)}
            >
              Actions
            </Button>
          </Box>

          <StatusChangeMenu
            anchorEl={anchorEl4}
            onClose={() => setAnchorEl4(null)}
            selectedItem={item4}
            showDelete={false}
            onEdit={(item) => showMessage(`Edit: ${item.name}`)}
            onStatusChange={handleStatusChange4}
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
            {`<StatusChangeMenu
  showDelete={false}
  // ... other props
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
              {`import StatusChangeMenu from '@/components/common/StatusChangeMenu';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>anchorEl</code>: HTMLElement | null - Anchor element for the menu (required)</li>
            <li><code>onClose</code>: () =&gt; void - Close handler (required)</li>
            <li><code>selectedItem</code>: T | null - Selected item (required)</li>
            <li><code>statusField</code>: keyof T - Status field name (default: &quot;status&quot;)</li>
            <li><code>draftValue</code>: string - Draft status value (default: &quot;draft&quot;)</li>
            <li><code>publishedValue</code>: string - Published status value (default: &quot;published&quot;)</li>
            <li><code>onEdit</code>: (item: T) =&gt; void - Edit handler (optional)</li>
            <li><code>onStatusChange</code>: (item: T, status: string) =&gt; void - Status change handler (optional)</li>
            <li><code>onDelete</code>: (item: T) =&gt; void - Delete handler (optional)</li>
            <li><code>showEdit</code>: boolean - Show edit option (default: true)</li>
            <li><code>showStatusChange</code>: boolean - Show status change options (default: true)</li>
            <li><code>showDelete</code>: boolean - Show delete option (default: true)</li>
            <li><code>customItems</code>: React.ReactNode - Custom menu items (optional)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Context menu triggered by anchor element</li>
            <li>Automatic status-based menu items (Publish/Unpublish)</li>
            <li>Type-safe with TypeScript generics</li>
            <li>Customizable status field and values</li>
            <li>Selective action visibility</li>
            <li>Support for custom menu items</li>
            <li>Material-UI Menu component</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>DataGrid row actions</li>
            <li>Content management systems</li>
            <li>Document status management</li>
            <li>Blog post actions</li>
            <li>User management actions</li>
            <li>Any item with draft/published workflow</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
