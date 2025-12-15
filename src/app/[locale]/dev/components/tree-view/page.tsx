'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Alert,
  Chip,
  Stack,
  Switch,
  FormControlLabel,
  TextField
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Description as FileIcon,
  Star as StarIcon
} from '@mui/icons-material';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import TreeView, { TreeViewColumn, TreeViewAction, BaseTreeNode } from '@/components/common/TreeView';

// Sample data type
interface FileNode extends BaseTreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: number;
  modified?: string;
  starred?: boolean;
  children?: FileNode[];
}

// Sample tree data
const SAMPLE_DATA: FileNode[] = [
  {
    id: '1',
    name: 'Documents',
    type: 'folder',
    modified: '2024-01-15',
    children: [
      {
        id: '1-1',
        name: 'Reports',
        type: 'folder',
        modified: '2024-01-14',
        children: [
          { id: '1-1-1', name: 'Q1 Report.pdf', type: 'file', size: 2500, modified: '2024-01-10', starred: true },
          { id: '1-1-2', name: 'Q2 Report.pdf', type: 'file', size: 3200, modified: '2024-01-12' },
          { id: '1-1-3', name: 'Annual Summary.xlsx', type: 'file', size: 1800, modified: '2024-01-14' }
        ]
      },
      {
        id: '1-2',
        name: 'Contracts',
        type: 'folder',
        modified: '2024-01-13',
        children: [
          { id: '1-2-1', name: 'Vendor Agreement.docx', type: 'file', size: 500, modified: '2024-01-08' },
          { id: '1-2-2', name: 'NDA Template.docx', type: 'file', size: 320, modified: '2024-01-09' }
        ]
      },
      { id: '1-3', name: 'Notes.txt', type: 'file', size: 50, modified: '2024-01-15' }
    ]
  },
  {
    id: '2',
    name: 'Images',
    type: 'folder',
    modified: '2024-01-12',
    children: [
      { id: '2-1', name: 'Logo.png', type: 'file', size: 150, modified: '2024-01-10', starred: true },
      { id: '2-2', name: 'Banner.jpg', type: 'file', size: 850, modified: '2024-01-11' },
      {
        id: '2-3',
        name: 'Screenshots',
        type: 'folder',
        modified: '2024-01-12',
        children: [
          { id: '2-3-1', name: 'Screen1.png', type: 'file', size: 200, modified: '2024-01-12' },
          { id: '2-3-2', name: 'Screen2.png', type: 'file', size: 180, modified: '2024-01-12' }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Projects',
    type: 'folder',
    modified: '2024-01-14',
    children: [
      {
        id: '3-1',
        name: 'Project Alpha',
        type: 'folder',
        modified: '2024-01-14',
        children: [
          { id: '3-1-1', name: 'README.md', type: 'file', size: 80, modified: '2024-01-14' },
          { id: '3-1-2', name: 'package.json', type: 'file', size: 25, modified: '2024-01-14' }
        ]
      }
    ]
  },
  { id: '4', name: 'config.json', type: 'file', size: 15, modified: '2024-01-08' }
];

// Helper function to format file size
const formatSize = (bytes?: number): string => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

// Helper to collect all IDs
const collectAllIds = (items: FileNode[]): string[] => {
  return items.reduce((acc: string[], item) => {
    acc.push(item.id);
    if (item.children) {
      acc.push(...collectAllIds(item.children));
    }
    return acc;
  }, []);
};

export default function TreeViewDemoPage() {
  // Tree state
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['1', '2']));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Options state
  const [showToolbar, setShowToolbar] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [checkboxSelection, setCheckboxSelection] = useState(true);

  // Handlers
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    const allIds = collectAllIds(SAMPLE_DATA);
    setExpandedIds(new Set(allIds));
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = collectAllIds(SAMPLE_DATA);
    setSelectedIds(new Set(allIds));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleRefresh = useCallback(() => {
    console.log('Refresh clicked');
  }, []);

  const handleAdd = useCallback(() => {
    console.log('Add clicked');
  }, []);

  const handleDelete = useCallback((ids: string[]) => {
    console.log('Delete clicked:', ids);
  }, []);

  const handleEdit = useCallback((item: FileNode) => {
    console.log('Edit clicked:', item);
  }, []);

  // Column definitions
  const columns: TreeViewColumn<FileNode>[] = useMemo(() => [
    {
      field: 'name',
      headerName: 'Name / 이름',
      flex: 1,
      renderCell: (item) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: item.type === 'folder' ? 600 : 400 }}>
            {item.name}
          </Typography>
          {item.starred && <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />}
        </Box>
      )
    },
    {
      field: 'size',
      headerName: 'Size / 크기',
      width: 100,
      align: 'right',
      valueGetter: (item) => formatSize(item.size)
    },
    {
      field: 'modified',
      headerName: 'Modified / 수정일',
      width: 120,
      valueGetter: (item) => item.modified || '-'
    }
  ], []);

  // Action definitions
  const actions: TreeViewAction<FileNode>[] = useMemo(() => [
    {
      key: 'edit',
      icon: <EditIcon fontSize="small" />,
      tooltip: 'Edit',
      onClick: handleEdit,
      color: 'primary'
    },
    {
      key: 'delete',
      icon: <DeleteIcon fontSize="small" />,
      tooltip: 'Delete',
      onClick: (item) => console.log('Delete:', item.name),
      color: 'error',
      visible: (item) => item.type === 'file' // Only show delete for files
    }
  ], [handleEdit]);

  // Get display name
  const getDisplayName = useCallback((item: FileNode): string => item.name, []);

  // Get icon based on type
  const getIcon = useCallback((item: FileNode): React.ReactNode => {
    return item.type === 'file' ? <FileIcon fontSize="small" color="action" /> : null;
  }, []);

  // Get folder icon
  const getFolderIcon = useCallback((expanded: boolean): React.ReactNode => {
    return expanded
      ? <FolderOpenIcon fontSize="small" color="primary" />
      : <FolderIcon fontSize="small" color="primary" />;
  }, []);

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h4" fontWeight={600}>
            TreeView
          </Typography>
          <Chip label="Data Management" color="primary" size="small" />
        </Box>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          트리뷰 컴포넌트
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Generic TreeView component for displaying hierarchical data with expand/collapse,
          selection, custom columns, and row actions.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          계층적 데이터를 트리 구조로 표시하는 범용 컴포넌트입니다. 확장/축소, 다중 선택,
          사용자 정의 컬럼, 행 액션 등을 지원합니다.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {['Tree', 'Hierarchy', 'Generic', 'TypeScript', 'Selection'].map((tag, index) => (
            <Chip key={index} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Options */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Options / 옵션
        </Typography>
        <Stack direction="row" spacing={3} flexWrap="wrap">
          <FormControlLabel
            control={<Switch checked={showToolbar} onChange={(e) => setShowToolbar(e.target.checked)} />}
            label="Show Toolbar"
          />
          <FormControlLabel
            control={<Switch checked={showHeader} onChange={(e) => setShowHeader(e.target.checked)} />}
            label="Show Header"
          />
          <FormControlLabel
            control={<Switch checked={checkboxSelection} onChange={(e) => setCheckboxSelection(e.target.checked)} />}
            label="Checkbox Selection"
          />
          <TextField
            size="small"
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 200 }}
          />
        </Stack>
      </Paper>

      {/* Demo */}
      <Typography variant="h6" gutterBottom>
        Demo / 데모
      </Typography>
      <Paper sx={{ height: 500, display: 'flex', flexDirection: 'column', overflow: 'hidden', mb: 4 }}>
        <TreeView<FileNode>
          data={SAMPLE_DATA}
          columns={columns}
          actions={actions}
          expandedIds={expandedIds}
          selectedIds={selectedIds}
          locale="en"
          searchQuery={searchQuery}
          onToggleExpand={handleToggleExpand}
          onToggleSelect={handleToggleSelect}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onRefresh={handleRefresh}
          onAdd={handleAdd}
          onDelete={handleDelete}
          getDisplayName={getDisplayName}
          getIcon={getIcon}
          getFolderIcon={getFolderIcon}
          checkboxSelection={checkboxSelection}
          editable
          showToolbar={showToolbar}
          showHeader={showHeader}
          emptyMessage="No files found"
        />
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Usage */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Usage / 사용법
        </Typography>
        <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'white', borderRadius: 1, overflow: 'auto' }}>
          <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 13, m: 0 }}>
{`import TreeView, { TreeViewColumn, TreeViewAction, BaseTreeNode } from '@/components/common/TreeView';

// 1. Define your data type extending BaseTreeNode
interface MyNode extends BaseTreeNode {
  id: string;
  name: string;
  status: string;
  children?: MyNode[];
}

// 2. Define columns
const columns: TreeViewColumn<MyNode>[] = [
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,
    renderCell: (item) => <Typography>{item.name}</Typography>
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 100,
    valueGetter: (item) => item.status
  }
];

// 3. Define actions (optional)
const actions: TreeViewAction<MyNode>[] = [
  {
    key: 'edit',
    icon: <EditIcon fontSize="small" />,
    tooltip: 'Edit',
    onClick: (item) => handleEdit(item),
    color: 'primary'
  },
  {
    key: 'delete',
    icon: <DeleteIcon fontSize="small" />,
    tooltip: 'Delete',
    onClick: (item) => handleDelete(item),
    visible: (item) => item.status !== 'locked' // Conditional visibility
  }
];

// 4. Use the component
<TreeView<MyNode>
  data={treeData}
  columns={columns}
  actions={actions}
  expandedIds={expandedIds}
  selectedIds={selectedIds}
  locale="ko"
  onToggleExpand={handleToggleExpand}
  onToggleSelect={handleToggleSelect}
  onExpandAll={handleExpandAll}
  onCollapseAll={handleCollapseAll}
  onSelectAll={handleSelectAll}
  onDeselectAll={handleDeselectAll}
  onRefresh={handleRefresh}
  onAdd={handleAdd}
  onDelete={handleDelete}
  getDisplayName={(item) => item.name}
  getIcon={(item) => <FileIcon />}
  getFolderIcon={(expanded) => expanded ? <FolderOpenIcon /> : <FolderIcon />}
  checkboxSelection
  editable
  showToolbar
  showHeader
  emptyMessage="No data found"
/>`}
          </Typography>
        </Paper>
      </Box>

      {/* Props Table */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Props / 속성
        </Typography>
        <Paper sx={{ overflow: 'auto' }}>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <Box component="thead" sx={{ bgcolor: 'grey.100' }}>
              <Box component="tr">
                <Box component="th" sx={{ p: 1.5, textAlign: 'left', borderBottom: 1, borderColor: 'divider' }}>Prop</Box>
                <Box component="th" sx={{ p: 1.5, textAlign: 'left', borderBottom: 1, borderColor: 'divider' }}>Type</Box>
                <Box component="th" sx={{ p: 1.5, textAlign: 'left', borderBottom: 1, borderColor: 'divider' }}>Required</Box>
                <Box component="th" sx={{ p: 1.5, textAlign: 'left', borderBottom: 1, borderColor: 'divider' }}>Description</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {[
                ['data', 'T[]', 'Yes', 'Tree data array'],
                ['columns', 'TreeViewColumn<T>[]', 'Yes', 'Column definitions'],
                ['expandedIds', 'Set<string>', 'Yes', 'Currently expanded node IDs'],
                ['selectedIds', 'Set<string>', 'Yes', 'Currently selected node IDs'],
                ['locale', 'string', 'Yes', 'Current locale (ko, en)'],
                ['actions', 'TreeViewAction<T>[]', 'No', 'Row action buttons'],
                ['getDisplayName', '(item, locale) => string', 'Yes', 'Get display name for search highlighting'],
                ['getIcon', '(item, expanded) => ReactNode', 'No', 'Get icon for leaf nodes'],
                ['getFolderIcon', '(expanded) => ReactNode', 'No', 'Get folder icon'],
                ['checkboxSelection', 'boolean', 'No', 'Show checkboxes (default: true)'],
                ['showToolbar', 'boolean', 'No', 'Show toolbar (default: true)'],
                ['showHeader', 'boolean', 'No', 'Show header row (default: true)'],
                ['emptyMessage', 'string', 'No', 'Empty state message'],
                ['searchQuery', 'string', 'No', 'Search query for highlighting'],
              ].map(([prop, type, required, desc], i) => (
                <Box component="tr" key={i} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <Box component="td" sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', fontFamily: 'monospace' }}>{prop}</Box>
                  <Box component="td" sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', fontFamily: 'monospace', color: 'info.main' }}>{type}</Box>
                  <Box component="td" sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>{required}</Box>
                  <Box component="td" sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>{desc}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Location Info */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Location:</strong> <code>@/components/common/TreeView</code>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Types exported: <code>BaseTreeNode</code>, <code>TreeViewColumn</code>, <code>TreeViewAction</code>, <code>TreeViewProps</code>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          For menu management example, see: <code>@/app/[locale]/admin/menus/components/MenuTreeView</code>
        </Typography>
      </Alert>
    </PageContainer>
  );
}
