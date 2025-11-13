'use client';

import React, { useState, useMemo } from 'react';
import {
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  TextField,
  Drawer,
  MenuItem
} from '@mui/material';
import { Search } from '@mui/icons-material';
import ExcelDataGrid from '@/components/common/DataGrid';
import { GridColDef } from '@mui/x-data-grid';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import ActionsCell from '@/components/common/ActionsCell';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';

type RowData = {
  id: number;
  name: string;
  email: string;
  age: number;
  department: string;
};

const SAMPLE_DATA: RowData[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, department: 'IT' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 28, department: 'HR' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, department: 'Sales' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 32, department: 'Marketing' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', age: 29, department: 'IT' },
  { id: 6, name: 'David Lee', email: 'david@example.com', age: 31, department: 'IT' },
  { id: 7, name: 'Emma White', email: 'emma@example.com', age: 27, department: 'HR' },
  { id: 8, name: 'Frank Miller', email: 'frank@example.com', age: 33, department: 'Sales' }
];

type SearchCriteria = {
  name: string;
  email: string;
  department: string;
  minAge: string;
  maxAge: string;
};

export default function DataGridPage() {
  // Sample data for DataGrid
  const [allRows] = useState<RowData[]>(SAMPLE_DATA);
  const [gridRows, setGridRows] = useState<RowData[]>(SAMPLE_DATA);

  // Search state
  const [quickSearch, setQuickSearch] = useState('');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    name: '',
    email: '',
    department: '',
    minAge: '',
    maxAge: ''
  });

  // Edit drawer state
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
  const [editFormData, setEditFormData] = useState<RowData>({
    id: 0,
    name: '',
    email: '',
    age: 0,
    department: ''
  });

  const handleEdit = (row: RowData) => {
    setSelectedRow(row);
    setEditFormData({ ...row });
    setEditDrawerOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedRow) {
      setGridRows(gridRows.map(row =>
        row.id === selectedRow.id ? editFormData : row
      ));
      setEditDrawerOpen(false);
      setSelectedRow(null);
    }
  };

  const handleCancelEdit = () => {
    setEditDrawerOpen(false);
    setSelectedRow(null);
  };

  // Search handlers
  const filterRows = (search: string, criteria: SearchCriteria) => {
    let filtered = [...allRows];

    // Quick search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          row.name.toLowerCase().includes(searchLower) ||
          row.email.toLowerCase().includes(searchLower) ||
          row.department.toLowerCase().includes(searchLower)
      );
    }

    // Advanced search criteria
    if (criteria.name) {
      filtered = filtered.filter((row) =>
        row.name.toLowerCase().includes(criteria.name.toLowerCase())
      );
    }
    if (criteria.email) {
      filtered = filtered.filter((row) =>
        row.email.toLowerCase().includes(criteria.email.toLowerCase())
      );
    }
    if (criteria.department) {
      filtered = filtered.filter((row) => row.department === criteria.department);
    }
    if (criteria.minAge) {
      filtered = filtered.filter((row) => row.age >= parseInt(criteria.minAge));
    }
    if (criteria.maxAge) {
      filtered = filtered.filter((row) => row.age <= parseInt(criteria.maxAge));
    }

    return filtered;
  };

  const handleQuickSearch = () => {
    const filtered = filterRows(quickSearch, searchCriteria);
    setGridRows(filtered);
  };

  const handleQuickSearchClear = () => {
    setQuickSearch('');
    setSearchCriteria({
      name: '',
      email: '',
      department: '',
      minAge: '',
      maxAge: ''
    });
    setGridRows(allRows);
  };

  const handleAdvancedFilterApply = () => {
    const filtered = filterRows(quickSearch, searchCriteria);
    setGridRows(filtered);
    setAdvancedFilterOpen(false);
  };

  const handleAdvancedFilterClose = () => {
    setAdvancedFilterOpen(false);
  };

  const handleSearchChange = (field: string, value: string) => {
    setSearchCriteria((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchCriteria.name) count++;
    if (searchCriteria.email) count++;
    if (searchCriteria.department) count++;
    if (searchCriteria.minAge) count++;
    if (searchCriteria.maxAge) count++;
    return count;
  }, [searchCriteria]);

  // Filter fields for advanced search
  const filterFields = useMemo(
    () => [
      {
        name: 'name',
        label: 'Name',
        type: 'text' as const,
        placeholder: 'Enter name...'
      },
      {
        name: 'email',
        label: 'Email',
        type: 'text' as const,
        placeholder: 'Enter email...'
      },
      {
        name: 'department',
        label: 'Department',
        type: 'select' as const,
        options: [
          { value: '', label: 'All' },
          { value: 'IT', label: 'IT' },
          { value: 'HR', label: 'HR' },
          { value: 'Sales', label: 'Sales' },
          { value: 'Marketing', label: 'Marketing' }
        ]
      },
      {
        name: 'minAge',
        label: 'Min Age',
        type: 'number' as const,
        placeholder: 'Min...'
      },
      {
        name: 'maxAge',
        label: 'Max Age',
        type: 'number' as const,
        placeholder: 'Max...'
      }
    ],
    []
  );

  const gridColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150, editable: true },
    { field: 'email', headerName: 'Email', width: 200, editable: true },
    { field: 'age', headerName: 'Age', width: 80, editable: true, type: 'number' },
    { field: 'department', headerName: 'Department', width: 130, editable: true },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionsCell
          onEdit={() => handleEdit(params.row as RowData)}
          onDelete={() => handleDeleteRows([params.row.id])}
        />
      )
    }
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

  return (
    <PageContainer>
      <PageHeader useMenu showBreadcrumb />

      {/* Quick Search Bar */}
      <QuickSearchBar
        searchValue={quickSearch}
        onSearchChange={setQuickSearch}
        onSearch={handleQuickSearch}
        onClear={handleQuickSearchClear}
        onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
        placeholder="Search by name, email, or department..."
        searching={false}
        activeFilterCount={activeFilterCount}
        showAdvancedButton={true}
      />

      {/* Advanced Filter Panel */}
      {advancedFilterOpen && (
        <SearchFilterPanel
          title="Search / Filter"
          activeFilterCount={activeFilterCount}
          onApply={handleAdvancedFilterApply}
          onClear={handleQuickSearchClear}
          onClose={handleAdvancedFilterClose}
          mode="advanced"
          expanded={true}
          showHeader={false}
        >
          <SearchFilterFields
            fields={filterFields}
            values={searchCriteria}
            onChange={handleSearchChange}
            onEnter={handleAdvancedFilterApply}
          />
        </SearchFilterPanel>
      )}

      {/* DataGrid Area - Flexible */}
      <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {gridRows.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No data found"
            description="Try adjusting your search filters or add new employees"
          />
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ExcelDataGrid
              rows={gridRows}
              columns={gridColumns}
              onRowsChange={(rows) => setGridRows(rows as typeof gridRows)}
              onAdd={handleAddRow}
              onDelete={handleDeleteRows}
              editable
              checkboxSelection
              exportFileName="employee-data"
            />
          </Box>
        )}
      </Paper>

      {/* Edit Drawer */}
      <Drawer
        anchor="right"
        open={editDrawerOpen}
        onClose={handleCancelEdit}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 450, md: 550 },
            p: 3
          }
        }}
      >
        <Stack spacing={3}>
          <Typography variant="h6">Edit Employee</Typography>

          <TextField
            label="Name"
            value={editFormData.name}
            onChange={(e) =>
              setEditFormData({ ...editFormData, name: e.target.value })
            }
            fullWidth
          />

          <TextField
            label="Email"
            type="email"
            value={editFormData.email}
            onChange={(e) =>
              setEditFormData({ ...editFormData, email: e.target.value })
            }
            fullWidth
          />

          <TextField
            label="Age"
            type="number"
            value={editFormData.age}
            onChange={(e) =>
              setEditFormData({ ...editFormData, age: Number(e.target.value) })
            }
            fullWidth
          />

          <TextField
            label="Department"
            value={editFormData.department}
            onChange={(e) =>
              setEditFormData({ ...editFormData, department: e.target.value })
            }
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveEdit}>
              Save
            </Button>
          </Box>
        </Stack>
      </Drawer>
    </PageContainer>
  );
}
