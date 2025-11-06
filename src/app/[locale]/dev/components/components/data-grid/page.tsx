'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Button
} from '@mui/material';
import ExcelDataGrid from '@/components/common/DataGrid';
import { GridColDef } from '@mui/x-data-grid';
import { exportDataGridToPDF } from '@/lib/pdf';
import PageHeader from '@/components/common/PageHeader';

export default function DataGridPage() {
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
    <Container maxWidth={false} sx={{ maxWidth: '100%', px: 0 }}>
      <PageHeader useMenu showBreadcrumb />

      <Paper sx={{ p: 3 }}>
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
      </Paper>
    </Container>
  );
}
