# Standard Page Pattern - Quick Reference

## Quick Start Template

```tsx
'use client';

import React, { useMemo } from 'react';
import { Box, Paper } from '@mui/material';
import { Search } from '@mui/icons-material';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import ExcelDataGrid from '@/components/common/DataGrid';
import SearchFilterFields from '@/components/common/SearchFilterFields';
import EmptyState from '@/components/common/EmptyState';
import EditDrawer from '@/components/common/EditDrawer';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useYourPageManagement } from './hooks/useYourPageManagement';
import { createColumns } from './constants';
import { createFilterFields, calculateActiveFilterCount } from './utils';
import { YourEntity } from './types';

export default function YourPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();

  const {
    // State
    data,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingItem,
    setEditingItem,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    deleteConfirmOpen,
    selectedForDelete,
    deleteLoading,
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    successMessage,
    errorMessage,
    // Handlers
    handleAdd,
    handleEdit,
    handleSave,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleRefresh,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handlePaginationModelChange,
    setDialogOpen
  } = useYourPageManagement();

  const columns = useMemo(() => createColumns(t, handleEdit), [t, handleEdit]);
  const filterFields = useMemo(() => createFilterFields(t), [t]);
  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  return (
    <StandardCrudPageLayout
      useMenu
      showBreadcrumb
      successMessage={successMessage}
      errorMessage={errorMessage}
      quickSearch={quickSearch}
      onQuickSearchChange={setQuickSearch}
      onQuickSearch={handleQuickSearch}
      onQuickSearchClear={handleQuickSearchClear}
      quickSearchPlaceholder="Search..."
      searching={searching}
      showAdvancedFilter
      advancedFilterOpen={advancedFilterOpen}
      onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
      activeFilterCount={activeFilterCount}
      filterTitle={`${t('common.search')} / ${t('common.filter')}`}
      filterContent={
        <SearchFilterFields
          fields={filterFields}
          values={searchCriteria}
          onChange={handleSearchChange}
          onEnter={handleAdvancedFilterApply}
        />
      }
      onFilterApply={handleAdvancedFilterApply}
      onFilterClear={handleQuickSearchClear}
      onFilterClose={handleAdvancedFilterClose}
      programId="PROG-YOUR-PAGE"
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={isAdmin}
      helpExists={helpExists}
      language={currentLocale}
    >
      <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {data.length === 0 && !searching ? (
          <EmptyState
            icon={Search}
            title="No data loaded"
            description="Use the search filters above to find items"
          />
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ExcelDataGrid
              rows={data}
              columns={columns}
              onRowsChange={(rows) => setData(rows as YourEntity[])}
              onAdd={handleAdd}
              onDelete={handleDeleteClick}
              onRefresh={handleRefresh}
              checkboxSelection
              editable
              exportFileName="your-data"
              loading={searching}
              paginationMode="server"
              rowCount={rowCount}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
            />
          </Box>
        )}
      </Paper>

      <EditDrawer
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingItem(null);
        }}
        title={!editingItem?.id ? 'Add New Item' : 'Edit Item'}
        onSave={handleSave}
        saveLoading={saveLoading}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
      >
        {/* Your form fields here */}
      </EditDrawer>

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        itemCount={selectedForDelete.length}
        itemName="item"
        itemsList={selectedForDelete.map(id => ({
          id,
          displayName: data.find(item => item.id === id)?.name || String(id)
        }))}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </StandardCrudPageLayout>
  );
}
```

## File Structure Checklist

```
your-page/
├── ☐ page.tsx
├── ☐ types.ts
├── ☐ constants.tsx
├── ☐ utils.ts
└── hooks/
    └── ☐ useYourPageManagement.ts
```

## types.ts Template

```tsx
export interface YourEntity {
  id: string;
  name: string;
  status: string;
  // ... your fields
}

export interface SearchCriteria {
  name: string;
  status: string;
  // ... search fields
  [key: string]: string | string[];
}
```

## constants.tsx Template

```tsx
import { GridColDef } from '@mui/x-data-grid';
import ActionsCell from '@/components/common/ActionsCell';

export const createColumns = (
  t: any,
  handleEdit: (id: string | number) => void
): GridColDef[] => [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'status', headerName: 'Status', width: 120 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 80,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <ActionsCell
        onEdit={() => handleEdit(params.row.id)}
        showMore={false}
      />
    )
  }
];
```

## utils.ts Template

```tsx
import { FilterFieldConfig } from '@/components/common/SearchFilterFields';
import { SearchCriteria } from './types';

export const createFilterFields = (t: any): FilterFieldConfig[] => [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Search by name...'
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: '', label: 'All' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
  }
];

export const calculateActiveFilterCount = (searchCriteria: SearchCriteria): number => {
  return Object.entries(searchCriteria).filter(([_key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== '';
  }).length;
};
```

## useYourPageManagement.ts Template

```tsx
import { useState, useCallback } from 'react';
import { api } from '@/lib/axios';
import { usePageState } from '@/hooks/usePageState';
import { useAutoHideMessage } from '@/hooks/useAutoHideMessage';
import { YourEntity, SearchCriteria } from '../types';

export const useYourPageManagement = () => {
  const {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data,
    setData,
    rowCount,
    setRowCount
  } = usePageState<SearchCriteria, YourEntity>({
    storageKey: 'your-page-state',
    initialCriteria: {
      name: '',
      status: ''
    },
    initialPaginationModel: {
      page: 0,
      pageSize: 50
    }
  });

  const { successMessage, errorMessage, showSuccess, showError } = useAutoHideMessage();

  const [searching, setSearching] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<YourEntity | null>(null);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<(string | number)[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpExists, setHelpExists] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Implement your handlers here...

  return {
    // State
    data,
    setData,
    searchCriteria,
    quickSearch,
    setQuickSearch,
    paginationModel,
    rowCount,
    searching,
    saveLoading,
    dialogOpen,
    editingItem,
    setEditingItem,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    deleteConfirmOpen,
    selectedForDelete,
    deleteLoading,
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    successMessage,
    errorMessage,
    showError,
    // Handlers
    handleAdd: () => {},
    handleEdit: (id: string | number) => {},
    handleSave: async () => {},
    handleDeleteClick: (ids: (string | number)[]) => {},
    handleDeleteConfirm: async () => {},
    handleDeleteCancel: () => {},
    handleRefresh: () => {},
    handleSearchChange: (field: keyof SearchCriteria, value: string | string[]) => {},
    handleQuickSearch: () => {},
    handleQuickSearchClear: () => {},
    handleAdvancedFilterApply: () => {},
    handleAdvancedFilterClose: () => {},
    handlePaginationModelChange: (newModel: { page: number; pageSize: number }) => {},
    setDialogOpen
  };
};
```

## Key Components Reference

### StandardCrudPageLayout
Main layout wrapper for CRUD pages.

**Required Props:**
- `quickSearch`, `onQuickSearchChange`, `onQuickSearch`, `onQuickSearchClear`
- `children`

**Optional Props:**
- All other props for customization

### MessageAlert
Auto-hiding alert messages.

**Props:**
- `successMessage`, `errorMessage`, `warningMessage`, `infoMessage`

### ExcelDataGrid
Advanced data grid with CRUD operations.

**Key Props:**
- `rows`, `columns`
- `onAdd`, `onDelete`, `onRefresh`
- `paginationMode="server"`, `rowCount`, `paginationModel`

## Common Hooks

```tsx
// Page state with persistence
usePageState<SearchCriteria, YourEntity>({ ... })

// Auto-hide messages
useAutoHideMessage({ duration: 10000 })

// Internationalization
useI18n()
useCurrentLocale()
```

## Reference

See full documentation: [STANDARD_PAGE_PATTERN.md](./STANDARD_PAGE_PATTERN.md)

See working example: [`src/app/[locale]/admin/users/page.tsx`](../src/app/[locale]/admin/users/page.tsx)
