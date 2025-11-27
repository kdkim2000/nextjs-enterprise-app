'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Stack, List, ListItemButton, ListItemText, Card, CardContent, Divider, Chip, Avatar } from '@mui/material';
import { Folder, Description, Email, Settings } from '@mui/icons-material';
import PageContainer from '@/components/common/PageContainer';
import MasterDetailLayout from '@/components/common/MasterDetailLayout';

interface DemoItem {
  id: number;
  title: string;
  description: string;
  type: 'folder' | 'document' | 'email' | 'settings';
  date: string;
  content: string;
}

const sampleItems: DemoItem[] = [
  { id: 1, title: 'Project Documents', description: '15 files, 2 folders', type: 'folder', date: '2024-01-15', content: 'This folder contains all project-related documents including specifications, design files, and meeting notes.' },
  { id: 2, title: 'Q1 Report', description: 'Quarterly financial report', type: 'document', date: '2024-01-10', content: 'The Q1 financial report shows significant growth in all key metrics. Revenue increased by 25% compared to the same period last year.' },
  { id: 3, title: 'Team Meeting Notes', description: 'Weekly sync notes', type: 'email', date: '2024-01-08', content: 'Topics discussed: Project timeline, resource allocation, upcoming milestones. Action items: Update Gantt chart, schedule client review.' },
  { id: 4, title: 'Application Settings', description: 'System configuration', type: 'settings', date: '2024-01-05', content: 'Current settings: Theme: Dark mode, Language: English, Notifications: Enabled, Auto-save: Every 5 minutes.' },
  { id: 5, title: 'Design Assets', description: '24 images, 3 videos', type: 'folder', date: '2024-01-03', content: 'Brand assets including logos, icons, and promotional materials. All files are in high resolution and ready for print.' },
];

const typeIcons = {
  folder: <Folder />,
  document: <Description />,
  email: <Email />,
  settings: <Settings />,
};

const typeColors = {
  folder: 'primary',
  document: 'success',
  email: 'info',
  settings: 'warning',
} as const;

export default function MasterDetailLayoutDemoPage() {
  const [selectedItem, setSelectedItem] = useState<DemoItem | null>(sampleItems[0]);

  const MasterPanel = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Items List
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {sampleItems.length} items
        </Typography>
      </Box>
      <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        {sampleItems.map((item) => (
          <ListItemButton
            key={item.id}
            selected={selectedItem?.id === item.id}
            onClick={() => setSelectedItem(item)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Avatar
              sx={{
                mr: 2,
                bgcolor: `${typeColors[item.type]}.light`,
                color: `${typeColors[item.type]}.main`,
              }}
            >
              {typeIcons[item.type]}
            </Avatar>
            <ListItemText
              primary={item.title}
              secondary={item.description}
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  const DetailPanel = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {selectedItem ? (
        <>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <Avatar
                sx={{
                  bgcolor: `${typeColors[selectedItem.type]}.light`,
                  color: `${typeColors[selectedItem.type]}.main`,
                  width: 48,
                  height: 48,
                }}
              >
                {typeIcons[selectedItem.type]}
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedItem.title}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={selectedItem.type}
                    size="small"
                    color={typeColors[selectedItem.type]}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {selectedItem.date}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            <Typography variant="body1" paragraph>
              {selectedItem.content}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              {selectedItem.description}
            </Typography>
          </Box>
        </>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography color="text.secondary">Select an item to view details</Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <PageContainer
      title="Master Detail Layout"
      description="Resizable split-pane layout with master list and detail view"
    >
      <Stack spacing={4}>
        {/* Live Demo */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Live Demo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Drag the divider to resize panels. Select an item to view details.
          </Typography>

          <Box sx={{ height: 400, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
            <MasterDetailLayout
              master={MasterPanel}
              detail={DetailPanel}
              masterSize={35}
              detailSize={65}
            />
          </Box>
        </Paper>

        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Simple split layout with default settings (30/70 ratio)
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
            {`import MasterDetailLayout from '@/components/common/MasterDetailLayout';

<MasterDetailLayout
  master={<YourListComponent />}
  detail={<YourDetailComponent />}
/>`}
          </Box>
        </Paper>

        {/* Custom Configuration */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Custom Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customize panel sizes and constraints
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
            {`<MasterDetailLayout
  master={<MasterPanel />}
  detail={<DetailPanel />}
  masterSize={40}         // Initial master width: 40%
  detailSize={60}         // Initial detail width: 60%
  minMasterSize={250}     // Minimum master width in pixels
  minDetailSize={350}     // Minimum detail width in pixels
  gutterSize={12}         // Divider thickness in pixels
/>`}
          </Box>
        </Paper>

        {/* Use Case Example */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Use Case: File Explorer
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Common pattern for file/document management interfaces
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
            {`function FileExplorer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);

  const FileList = (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <List>
        {files.map(file => (
          <ListItemButton
            key={file.id}
            selected={selectedFile?.id === file.id}
            onClick={() => setSelectedFile(file)}
          >
            <ListItemIcon>
              {getFileIcon(file.type)}
            </ListItemIcon>
            <ListItemText
              primary={file.name}
              secondary={file.size}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  const FilePreview = (
    <Box sx={{ height: '100%', p: 2 }}>
      {selectedFile ? (
        <FileViewer file={selectedFile} />
      ) : (
        <EmptyState message="Select a file to preview" />
      )}
    </Box>
  );

  return (
    <MasterDetailLayout
      master={FileList}
      detail={FilePreview}
      masterSize={30}
      detailSize={70}
    />
  );
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
              {`import MasterDetailLayout from '@/components/common/MasterDetailLayout';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>master</code>: ReactNode - Left panel content (required)</li>
            <li><code>detail</code>: ReactNode - Right panel content (required)</li>
            <li><code>masterSize</code>: number - Initial master width percentage (default: 30)</li>
            <li><code>detailSize</code>: number - Initial detail width percentage (default: 70)</li>
            <li><code>minMasterSize</code>: number - Minimum master width in pixels (default: 200)</li>
            <li><code>minDetailSize</code>: number - Minimum detail width in pixels (default: 400)</li>
            <li><code>gutterSize</code>: number - Divider width in pixels (default: 10)</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Resizable panels with drag handle</li>
            <li>Minimum size constraints prevent collapsing</li>
            <li>Uses react-split library for smooth resizing</li>
            <li>Maintains state across renders</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Common Use Cases:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>File explorers and document managers</li>
            <li>Email clients (list + preview)</li>
            <li>Admin panels with entity list and edit form</li>
            <li>Code editors with file tree and editor</li>
            <li>Dashboard with navigation and content</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Dependencies:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><code>react-split</code> - Resizable split panes</li>
            <li>Custom CSS for styling (<code>split.css</code>)</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
