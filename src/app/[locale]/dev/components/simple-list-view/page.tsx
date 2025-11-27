'use client';

import { useState, useMemo } from 'react';
import { Box, Typography, Paper, Stack, Chip, Alert, Tooltip } from '@mui/material';
import { Visibility, ThumbUp, Comment } from '@mui/icons-material';
import PageContainer from '@/components/common/PageContainer';
import SimpleListView, { SimpleListColumn } from '@/components/common/SimpleListView';

interface DemoItem {
  id: number;
  title: string;
  author: string;
  status: 'published' | 'draft' | 'archived';
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
}

// Sample data
const sampleData: DemoItem[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Sample Item ${i + 1}`,
  author: ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown'][i % 4],
  status: (['published', 'draft', 'archived'] as const)[i % 3],
  views: Math.floor(Math.random() * 1000),
  likes: Math.floor(Math.random() * 100),
  comments: Math.floor(Math.random() * 50),
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
}));

export default function SimpleListViewDemoPage() {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = page * pageSize;
    return sampleData.slice(start, start + pageSize);
  }, [page, pageSize]);

  const columns: SimpleListColumn<DemoItem>[] = [
    {
      field: 'title',
      headerName: 'Title',
      width: 250,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {row.title}
        </Typography>
      )
    },
    {
      field: 'author',
      headerName: 'Author',
      width: 120
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      align: 'center',
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.status}
          color={row.status === 'published' ? 'success' : row.status === 'draft' ? 'warning' : 'default'}
        />
      )
    },
    {
      field: 'views',
      headerName: 'Views',
      width: 80,
      align: 'center',
      headerIcon: <Visibility fontSize="small" />,
      headerTooltip: 'View Count'
    },
    {
      field: 'likes',
      headerName: 'Likes',
      width: 60,
      align: 'center',
      headerIcon: <ThumbUp fontSize="small" />,
      headerTooltip: 'Like Count'
    },
    {
      field: 'comments',
      headerName: 'Comments',
      width: 60,
      align: 'center',
      headerIcon: <Comment fontSize="small" />,
      headerTooltip: 'Comment Count'
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      align: 'center',
      valueGetter: (row) => new Date(row.createdAt).toLocaleDateString()
    }
  ];

  const handleAdd = () => {
    setMessage('Add button clicked');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleDelete = (ids: (string | number)[]) => {
    setMessage(`Delete ${ids.length} item(s): ${ids.join(', ')}`);
    setSelectedIds([]);
    setTimeout(() => setMessage(''), 2000);
  };

  const handleRefresh = () => {
    setLoading(true);
    setMessage('Refreshing...');
    setTimeout(() => {
      setLoading(false);
      setMessage('Data refreshed!');
      setTimeout(() => setMessage(''), 2000);
    }, 1000);
  };

  const handleRowClick = (row: DemoItem) => {
    setMessage(`Clicked: ${row.title}`);
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <PageContainer
      title="Simple List View"
      description="Lightweight table-based list component with pagination and selection"
    >
      <Stack spacing={4}>
        {/* Message */}
        {message && (
          <Alert severity="info" onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        {/* Basic Usage */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Full Featured Example
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Table with checkbox selection, pagination, toolbar actions, and custom cell renderers
          </Typography>

          <Box sx={{ height: 500 }}>
            <SimpleListView
              rows={paginatedData}
              columns={columns}
              loading={loading}
              totalCount={sampleData.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(0); }}
              checkboxSelection
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onRowClick={handleRowClick}
              onAdd={handleAdd}
              onDelete={handleDelete}
              onRefresh={handleRefresh}
              showRowNumber
              rowNumberMode="desc"
              totalLabel="Total Items"
              selectedLabel="selected"
              emptyMessage="No items found"
              addTooltip="Add new item"
              deleteTooltip="Delete selected items"
              refreshTooltip="Refresh list"
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
              fontSize: '0.75rem',
            }}
          >
            {`<SimpleListView
  rows={data}
  columns={columns}
  totalCount={100}
  page={page}
  pageSize={pageSize}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  checkboxSelection
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
  onRowClick={handleRowClick}
  onAdd={handleAdd}
  onDelete={handleDelete}
  onRefresh={handleRefresh}
  showRowNumber
/>`}
          </Box>
        </Paper>

        {/* Column Definition */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Column Definition
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Define columns with custom renderers and value getters
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.75rem',
            }}
          >
            {`const columns: SimpleListColumn<MyItem>[] = [
  // Basic column
  { field: 'name', headerName: 'Name', width: 200 },

  // With custom renderer
  {
    field: 'status',
    headerName: 'Status',
    width: 100,
    align: 'center',
    renderCell: (row) => (
      <Chip label={row.status} color={row.status === 'active' ? 'success' : 'default'} />
    )
  },

  // With value getter (transform data)
  {
    field: 'createdAt',
    headerName: 'Created',
    width: 120,
    valueGetter: (row) => new Date(row.createdAt).toLocaleDateString()
  },

  // With header icon
  {
    field: 'views',
    headerName: 'Views',
    width: 80,
    align: 'center',
    headerIcon: <Visibility fontSize="small" />,
    headerTooltip: 'View Count'
  }
];`}
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
              {`import SimpleListView, { SimpleListColumn } from '@/components/common/SimpleListView';`}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Props:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1, fontSize: '0.875rem' }}>
            <li><code>rows</code>: T[] - Data array (items must have id field)</li>
            <li><code>columns</code>: SimpleListColumn[] - Column definitions</li>
            <li><code>loading</code>: boolean - Show loading indicator</li>
            <li><code>totalCount</code>: number - Total items for pagination</li>
            <li><code>page</code>: number - Current page (0-indexed)</li>
            <li><code>pageSize</code>: number - Items per page</li>
            <li><code>onPageChange</code>: (page) =&gt; void - Page change handler</li>
            <li><code>onPageSizeChange</code>: (size) =&gt; void - Page size change handler</li>
            <li><code>pageSizeOptions</code>: number[] - Page size options (default: [10, 25, 50, 100])</li>
            <li><code>checkboxSelection</code>: boolean - Enable row selection</li>
            <li><code>selectedIds</code>: (string | number)[] - Selected row IDs</li>
            <li><code>onSelectionChange</code>: (ids) =&gt; void - Selection change handler</li>
            <li><code>onRowClick</code>: (row) =&gt; void - Row click handler</li>
            <li><code>onAdd</code>: () =&gt; void - Add button handler (shows button)</li>
            <li><code>onDelete</code>: (ids) =&gt; void - Delete button handler</li>
            <li><code>onRefresh</code>: () =&gt; void - Refresh button handler</li>
            <li><code>showRowNumber</code>: boolean - Show row numbers</li>
            <li><code>rowNumberMode</code>: &apos;asc&apos; | &apos;desc&apos; - Row number direction</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Column Options:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1, fontSize: '0.875rem' }}>
            <li><code>field</code>: string - Field name (required)</li>
            <li><code>headerName</code>: string - Column header text</li>
            <li><code>width</code>: number | string - Column width</li>
            <li><code>minWidth</code>: number - Minimum width</li>
            <li><code>align</code>: &apos;left&apos; | &apos;center&apos; | &apos;right&apos; - Text alignment</li>
            <li><code>renderCell</code>: (row, index) =&gt; ReactNode - Custom cell renderer</li>
            <li><code>valueGetter</code>: (row) =&gt; string | number - Value transformer</li>
            <li><code>headerIcon</code>: ReactNode - Icon instead of header text</li>
            <li><code>headerTooltip</code>: string - Header tooltip text</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Comparison: SimpleListView vs ExcelDataGrid</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li><strong>SimpleListView:</strong> Lightweight, simple API, native MUI Table</li>
            <li><strong>ExcelDataGrid:</strong> Full-featured, editable cells, sorting, Excel export</li>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>When to Use SimpleListView:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Read-only data display (board posts, logs, notifications)</li>
            <li>Simple list without inline editing</li>
            <li>When you need lighter bundle size</li>
            <li>Mobile-friendly simple tables</li>
          </Box>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
