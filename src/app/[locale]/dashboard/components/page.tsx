'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Stack,
  Button
} from '@mui/material';
import ExcelDataGrid from '@/components/common/DataGrid';
import RichTextEditor from '@/components/common/RichTextEditor';
import FileUpload from '@/components/common/FileUpload';
import { GridColDef } from '@mui/x-data-grid';
import { exportDataGridToPDF } from '@/lib/pdf';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ComponentsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [editorContent, setEditorContent] = useState('<p>Hello World!</p>');
  const [editorMode, setEditorMode] = useState<'editor' | 'viewer'>('editor');

  // Sample data for DataGrid
  const [gridRows, setGridRows] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, department: 'IT' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 28, department: 'HR' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, department: 'Sales' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 32, department: 'Marketing' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', age: 29, department: 'IT' }
  ]);

  const gridColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150, editable: true },
    { field: 'email', headerName: 'Email', width: 200, editable: true },
    { field: 'age', headerName: 'Age', width: 80, editable: true, type: 'number' },
    { field: 'department', headerName: 'Department', width: 130, editable: true }
  ];

  const handleAddRow = () => {
    const newId = Math.max(...gridRows.map((r) => r.id)) + 1;
    setGridRows([
      ...gridRows,
      {
        id: newId,
        name: 'New User',
        email: 'newuser@example.com',
        age: 25,
        department: 'General'
      }
    ]);
  };

  const handleDeleteRows = (ids: (string | number)[]) => {
    setGridRows(gridRows.filter((row) => !ids.includes(row.id)));
  };

  const handleExportPDF = () => {
    exportDataGridToPDF(gridRows, gridColumns, 'employee-data', 'Employee Data Report');
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Component Showcase
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Demonstration of all common components
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Data Grid" />
          <Tab label="Rich Text Editor" />
          <Tab label="File Upload" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Typography variant="h6">Excel-Friendly Data Grid</Typography>
              <Box sx={{ flex: 1 }} />
              <Button variant="outlined" onClick={handleExportPDF}>
                Export to PDF
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Features: Excel export/import, inline editing, sorting, filtering, pagination
            </Typography>

            <ExcelDataGrid
              rows={gridRows}
              columns={gridColumns}
              onRowsChange={(rows) => setGridRows(rows as any)}
              onAdd={handleAddRow}
              onDelete={handleDeleteRows}
              editable
              checkboxSelection
              exportFileName="employee-data"
              height={500}
            />
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">HTML5 Rich Text Editor</Typography>
              <Box sx={{ flex: 1 }} />
              <Button
                variant="outlined"
                onClick={() =>
                  setEditorMode(editorMode === 'editor' ? 'viewer' : 'editor')
                }
              >
                Switch to {editorMode === 'editor' ? 'Viewer' : 'Editor'} Mode
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Supports: Bold, Italic, Lists, Links, Images, Tables, Code blocks
            </Typography>

            <RichTextEditor
              content={editorContent}
              onChange={setEditorContent}
              mode={editorMode}
              placeholder="Start typing your content here..."
              height={500}
            />

            <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
              <Typography variant="caption" fontWeight={600} gutterBottom>
                HTML Output:
              </Typography>
              <Typography
                variant="caption"
                component="pre"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace'
                }}
              >
                {editorContent}
              </Typography>
            </Paper>
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Stack spacing={2}>
            <Typography variant="h6">File Upload with Drag & Drop</Typography>

            <Typography variant="body2" color="text.secondary">
              Features: Drag & drop, Multiple files, Progress tracking, File size limits
            </Typography>

            <FileUpload
              multiple
              maxSize={10}
              acceptedTypes={['.pdf', '.doc', '.docx', '.xlsx', '.jpg', '.png']}
              onUploadComplete={(files) => {
                console.log('Uploaded files:', files);
              }}
              autoUpload
            />
          </Stack>
        </TabPanel>
      </Paper>
    </Container>
  );
}
