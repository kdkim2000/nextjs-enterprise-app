# Standard Page Pattern Guide

## Overview

This document describes the standard pattern for building CRUD pages in this application. The Users page (`src/app/[locale]/admin/users/page.tsx`) serves as the reference implementation.

## Architecture

### 1. File Structure

```
src/app/[locale]/admin/users/
├── page.tsx              # Main page component
├── types.ts              # TypeScript type definitions
├── constants.tsx         # Column definitions, static data
├── utils.ts              # Utility functions (filter fields, calculations)
└── hooks/
    └── useUserManagement.ts  # Business logic hook
```

### 2. Component Hierarchy

```
StandardCrudPageLayout          # Layout wrapper (NEW)
├── PageHeader                  # Auto-fetches menu info
├── MessageAlert                # Success/error messages (NEW)
├── QuickSearchBar              # Fast text search
├── SearchFilterPanel           # Advanced filters (collapsible)
│   └── SearchFilterFields      # Dynamic filter fields
├── Main Content                # Your data grid/content
│   └── ExcelDataGrid           # Data table with CRUD
├── EditDrawer                  # Slide-out form
├── DeleteConfirmDialog         # Confirmation dialog
└── HelpViewer                  # Context help
```

## New Common Components

### 1. MessageAlert

Displays success, error, warning, or info messages with auto-hide functionality.

**Location**: `src/components/common/MessageAlert/index.tsx`

**Usage**:
```tsx
import MessageAlert from '@/components/common/MessageAlert';
import { useAutoHideMessage } from '@/hooks/useAutoHideMessage';

const { successMessage, errorMessage } = useAutoHideMessage();

<MessageAlert
  successMessage={successMessage}
  errorMessage={errorMessage}
/>
```

**Features**:
- Auto-handles null/undefined messages
- Supports multiple alert types simultaneously
- Consistent styling across the app

### 2. StandardCrudPageLayout

Standardized layout for CRUD pages with all common elements built-in.

**Location**: `src/components/common/StandardCrudPageLayout/index.tsx`

**Usage**:
```tsx
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';

<StandardCrudPageLayout
  // Page Header
  useMenu
  showBreadcrumb

  // Messages
  successMessage={successMessage}
  errorMessage={errorMessage}

  // Quick Search
  quickSearch={quickSearch}
  onQuickSearchChange={setQuickSearch}
  onQuickSearch={handleQuickSearch}
  onQuickSearchClear={handleQuickSearchClear}
  quickSearchPlaceholder="Search..."
  searching={searching}

  // Advanced Filter
  showAdvancedFilter
  advancedFilterOpen={advancedFilterOpen}
  onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
  activeFilterCount={activeFilterCount}
  filterTitle="Search / Filter"
  filterContent={<SearchFilterFields ... />}
  onFilterApply={handleFilterApply}
  onFilterClear={handleFilterClear}
  onFilterClose={handleFilterClose}

  // Help
  programId="PROG-YOUR-PAGE"
  helpOpen={helpOpen}
  onHelpOpenChange={setHelpOpen}
  isAdmin={isAdmin}
  helpExists={helpExists}
  language={currentLocale}
>
  {/* Your main content here */}
  <Paper sx={{ p: 1.5, flex: 1 }}>
    <ExcelDataGrid ... />
  </Paper>
</StandardCrudPageLayout>
```

**Benefits**:
- Reduces boilerplate code by ~60%
- Ensures consistent layout across all pages
- Centralizes common functionality
- Easy to maintain and update

## Standard Hooks

### 1. usePageState

Manages page state with session storage persistence.

**Location**: `src/hooks/usePageState.ts`

**Features**:
- Persists search criteria, pagination, and data
- Auto-saves on state change
- Type-safe with generics

**Usage**:
```tsx
import { usePageState } from '@/hooks/usePageState';

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
} = usePageState<SearchCriteria, DataType>({
  storageKey: 'my-page-state',
  initialCriteria: { /* ... */ },
  initialPaginationModel: { page: 0, pageSize: 50 }
});
```

### 2. useAutoHideMessage

Manages success/error messages with auto-hide.

**Location**: `src/hooks/useAutoHideMessage.ts`

**Features**:
- Auto-hides messages after 10 seconds (configurable)
- Prevents multiple messages showing simultaneously
- Simple API

**Usage**:
```tsx
import { useAutoHideMessage } from '@/hooks/useAutoHideMessage';

const { successMessage, errorMessage, showSuccess, showError } = useAutoHideMessage();

// Show messages
showSuccess('User created successfully');
showError('Failed to save user');
```

### 3. Custom Business Logic Hook

Create a custom hook for each page's business logic (like `useUserManagement`).

**Pattern**:
```tsx
// src/app/[locale]/your-page/hooks/useYourPageManagement.ts
export const useYourPageManagement = (options = {}) => {
  // Use standard hooks
  const pageState = usePageState({ ... });
  const { showSuccess, showError } = useAutoHideMessage();

  // Local state
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  // ... more state

  // Business logic handlers
  const handleAdd = useCallback(() => { ... }, []);
  const handleEdit = useCallback(() => { ... }, []);
  const handleSave = useCallback(async () => { ... }, []);
  const handleDelete = useCallback(async () => { ... }, []);

  // Return everything the page needs
  return {
    // State
    ...pageState,
    loading,
    dialogOpen,
    // ... more state

    // Handlers
    handleAdd,
    handleEdit,
    handleSave,
    handleDelete,
    // ... more handlers
  };
};
```

## File Organization Pattern

### 1. types.ts

Define all TypeScript interfaces for your data.

```tsx
export interface YourEntity {
  id: string;
  name: string;
  // ... other fields
}

export interface SearchCriteria {
  name: string;
  status: string;
  // ... search fields
}
```

### 2. constants.tsx

Define DataGrid columns and static data.

```tsx
import { GridColDef } from '@mui/x-data-grid';

export const createColumns = (
  t: any,
  handleEdit: (id: string | number) => void
): GridColDef[] => [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 200 },
  // ... more columns
  {
    field: 'actions',
    headerName: 'Actions',
    width: 80,
    sortable: false,
    renderCell: (params) => (
      <ActionsCell
        onEdit={() => handleEdit(params.row.id)}
        showMore={false}
      />
    )
  }
];
```

### 3. utils.ts

Define utility functions for filters and calculations.

```tsx
import { FilterFieldConfig } from '@/components/common/SearchFilterFields';

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
  // ... more fields
];

export const calculateActiveFilterCount = (criteria: SearchCriteria): number => {
  return Object.entries(criteria).filter(([_key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== '';
  }).length;
};
```

## Step-by-Step Implementation Guide

### 1. Create File Structure

```bash
mkdir -p src/app/[locale]/your-module/your-page/hooks
touch src/app/[locale]/your-module/your-page/{page.tsx,types.ts,constants.tsx,utils.ts}
touch src/app/[locale]/your-module/your-page/hooks/useYourPageManagement.ts
```

### 2. Define Types (types.ts)

Start with your data model and search criteria.

### 3. Create Business Logic Hook (hooks/useYourPageManagement.ts)

Implement all CRUD operations and state management.

### 4. Create Columns (constants.tsx)

Define your DataGrid columns.

### 5. Create Filter Fields (utils.ts)

Define search/filter field configuration.

### 6. Build Page Component (page.tsx)

Use StandardCrudPageLayout and wire everything together.

```tsx
export default function YourPage() {
  const t = useI18n();
  const currentLocale = useCurrentLocale();

  // Use your custom hook
  const {
    data,
    searchCriteria,
    quickSearch,
    // ... all state and handlers
  } = useYourPageManagement();

  // Memoized values
  const columns = useMemo(() => createColumns(t, handleEdit), [t, handleEdit]);
  const filterFields = useMemo(() => createFilterFields(t), [t]);
  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(searchCriteria),
    [searchCriteria]
  );

  return (
    <StandardCrudPageLayout
      // ... all props
    >
      <Paper sx={{ p: 1.5, flex: 1 }}>
        <ExcelDataGrid ... />
      </Paper>

      <EditDrawer ... />
      <DeleteConfirmDialog ... />
    </StandardCrudPageLayout>
  );
}
```

## Best Practices

### 1. Keep Business Logic in Hooks

✅ **Good**: All business logic in custom hook
```tsx
const { handleSave } = useYourPageManagement();
```

❌ **Bad**: Business logic in component
```tsx
const handleSave = () => {
  // Complex logic here...
};
```

### 2. Memoize Computed Values

```tsx
const columns = useMemo(() => createColumns(t, handleEdit), [t, handleEdit]);
const filterFields = useMemo(() => createFilterFields(t), [t]);
```

### 3. Use Type-Safe Handlers

```tsx
const handleSearchChange = useCallback(
  (field: keyof SearchCriteria, value: string | string[]) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  },
  [setSearchCriteria]
);
```

### 4. Consistent Naming

- **Hook**: `useYourPageManagement`
- **Types**: `YourEntity`, `YourSearchCriteria`
- **Handlers**: `handleAdd`, `handleEdit`, `handleSave`, `handleDelete`
- **States**: `loading`, `dialogOpen`, `deleteConfirmOpen`

### 5. Error Handling

Always use try-catch and show user-friendly messages:

```tsx
try {
  setLoading(true);
  const response = await api.post('/entity', data);
  showSuccess('Entity created successfully');
} catch (err) {
  const error = err as { response?: { data?: { error?: string } } };
  showError(error.response?.data?.error || 'Failed to create entity');
} finally {
  setLoading(false);
}
```

## Common Patterns

### Server-Side Pagination

```tsx
<ExcelDataGrid
  rows={data}
  columns={columns}
  paginationMode="server"
  rowCount={rowCount}
  paginationModel={paginationModel}
  onPaginationModelChange={handlePaginationModelChange}
  loading={loading}
/>
```

### Quick Search vs Advanced Search

```tsx
const fetchData = async (useQuickSearch: boolean) => {
  const params = new URLSearchParams();

  if (useQuickSearch && quickSearch) {
    // Search in multiple fields
    params.append('field1', quickSearch);
    params.append('field2', quickSearch);
  } else {
    // Use specific criteria
    if (searchCriteria.field1) params.append('field1', searchCriteria.field1);
    if (searchCriteria.field2) params.append('field2', searchCriteria.field2);
  }

  const response = await api.get(`/entity?${params.toString()}`);
  setData(response.data);
};
```

### Delete with Confirmation

```tsx
const handleDeleteClick = useCallback((ids: (string | number)[]) => {
  setSelectedForDelete(ids);
  setDeleteConfirmOpen(true);
}, []);

const handleDeleteConfirm = useCallback(async () => {
  try {
    setDeleteLoading(true);
    for (const id of selectedForDelete) {
      await api.delete(`/entity/${id}`);
    }
    setData(data.filter(item => !selectedForDelete.includes(item.id)));
    showSuccess(`Successfully deleted ${selectedForDelete.length} item(s)`);
    setDeleteConfirmOpen(false);
  } catch (err) {
    showError('Failed to delete items');
  } finally {
    setDeleteLoading(false);
  }
}, [selectedForDelete, data]);
```

## Migration Guide

To migrate an existing page to use the new standard pattern:

1. **Install new components**: Copy MessageAlert and StandardCrudPageLayout
2. **Update imports**: Replace individual layout components with StandardCrudPageLayout
3. **Simplify JSX**: Use StandardCrudPageLayout props instead of manual layout
4. **Test thoroughly**: Ensure all functionality works as expected

## Reference Implementation

See [`src/app/[locale]/admin/users/page.tsx`](../src/app/[locale]/admin/users/page.tsx) for a complete, production-ready example.

## Benefits Summary

- ✅ **60% less boilerplate** code per page
- ✅ **Consistent UX** across all pages
- ✅ **Easy maintenance** with centralized components
- ✅ **Type-safe** with full TypeScript support
- ✅ **State persistence** with session storage
- ✅ **Auto-hide messages** for better UX
- ✅ **Scalable architecture** for large applications
