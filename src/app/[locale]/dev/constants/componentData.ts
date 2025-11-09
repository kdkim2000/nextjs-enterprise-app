import {
  GridOn,
  Edit,
  Search,
  Description,
  Category
} from '@mui/icons-material';

export const componentCategories = [
  {
    category: 'Data Display',
    description: 'Components for displaying and managing data',
    icon: GridOn,
    color: '#1976d2',
    components: [
      {
        title: 'DataGrid',
        description: 'Excel-like data grid with sorting, filtering, pagination, export/import, and inline editing',
        path: '/dev/components/data-grid',
        tags: ['Table', 'Grid', 'Excel', 'CRUD']
      },
      {
        title: 'Empty State',
        description: 'Display empty state with icon, message, and action button',
        path: '/dev/components/empty-state',
        tags: ['UI', 'State', 'Placeholder']
      },
      {
        title: 'Page Header',
        description: 'Standardized page header with breadcrumb, title, and actions',
        path: '/dev/components/page-header',
        tags: ['Layout', 'Navigation', 'Header']
      }
    ]
  },
  {
    category: 'Form Controls',
    description: 'Input components for forms and user interaction',
    icon: Edit,
    color: '#2e7d32',
    components: [
      {
        title: 'Rich Text Editor',
        description: 'WYSIWYG text editor with formatting, lists, links, images, and tables',
        path: '/dev/components/rich-text-editor',
        tags: ['Input', 'WYSIWYG', 'HTML']
      },
      {
        title: 'File Upload',
        description: 'Drag-and-drop file upload with progress tracking and file size limits',
        path: '/dev/components/file-upload',
        tags: ['Upload', 'File', 'Drag-Drop']
      },
      {
        title: 'Date Range Picker',
        description: 'Select date ranges with calendar interface',
        path: '/dev/components/date-range-picker',
        tags: ['Date', 'Calendar', 'Range']
      },
      {
        title: 'Date Picker',
        description: 'Single date selection with calendar interface',
        path: '/dev/components/date-picker',
        tags: ['Date', 'Calendar', 'Single']
      },
      {
        title: 'Year Picker',
        description: 'Select year only',
        path: '/dev/components/year-picker',
        tags: ['Year', 'Calendar']
      },
      {
        title: 'Month Picker',
        description: 'Select year and month',
        path: '/dev/components/month-picker',
        tags: ['Month', 'Calendar']
      },
      {
        title: 'Time Picker',
        description: 'Select time with hour and minute',
        path: '/dev/components/time-picker',
        tags: ['Time', 'Clock']
      },
      {
        title: 'DateTime Picker',
        description: 'Select date and time combined',
        path: '/dev/components/datetime-picker',
        tags: ['DateTime', 'Calendar', 'Time']
      },
      {
        title: 'DateTime Range Picker',
        description: 'Select date and time ranges',
        path: '/dev/components/datetime-range-picker',
        tags: ['DateTime', 'Range', 'Period']
      },
      {
        title: 'Multi Select',
        description: 'Multiple selection dropdown with search and chips',
        path: '/dev/components/multi-select',
        tags: ['Select', 'Dropdown', 'Multiple']
      },
      {
        title: 'Avatar Upload',
        description: 'User avatar upload with crop and preview',
        path: '/dev/components/avatar-upload',
        tags: ['Image', 'Profile', 'Upload']
      },
      {
        title: 'User Selector',
        description: 'Select users with search and autocomplete',
        path: '/dev/components/user-selector',
        tags: ['User', 'Search', 'Autocomplete']
      }
    ]
  },
  {
    category: 'Search & Filter',
    description: 'Components for searching and filtering data',
    icon: Search,
    color: '#ed6c02',
    components: [
      {
        title: 'Quick Search Bar',
        description: 'Simple search bar with instant results',
        path: '/dev/components/quick-search',
        tags: ['Search', 'Filter', 'Quick']
      },
      {
        title: 'Search Filter Panel',
        description: 'Advanced filter panel with multiple criteria',
        path: '/dev/components/search-filter',
        tags: ['Filter', 'Advanced', 'Panel']
      },
      {
        title: 'Advanced Search Dialog',
        description: 'Dialog-based advanced search with complex filters',
        path: '/dev/components/advanced-search',
        tags: ['Search', 'Dialog', 'Complex']
      },
      {
        title: 'User Search Dialog',
        description: 'Search and select users from a dialog',
        path: '/dev/components/user-search',
        tags: ['User', 'Search', 'Dialog']
      }
    ]
  },
  {
    category: 'Dialogs & Drawers',
    description: 'Modal dialogs and side drawers for focused interactions',
    icon: Description,
    color: '#9c27b0',
    components: [
      {
        title: 'CRUD Dialog',
        description: 'Generic dialog for Create, Read, Update, Delete operations',
        path: '/dev/components/crud-dialog',
        tags: ['Dialog', 'CRUD', 'Form']
      },
      {
        title: 'Edit Drawer',
        description: 'Side drawer for editing data with form fields',
        path: '/dev/components/edit-drawer',
        tags: ['Drawer', 'Edit', 'Form']
      },
      {
        title: 'Delete Confirm Dialog',
        description: 'Confirmation dialog for delete operations',
        path: '/dev/components/delete-confirm',
        tags: ['Dialog', 'Delete', 'Confirm']
      },
      {
        title: 'Help Viewer',
        description: 'Display contextual help content with markdown support',
        path: '/dev/components/help-viewer',
        tags: ['Help', 'Documentation', 'Markdown']
      }
    ]
  },
  {
    category: 'Layout & Navigation',
    description: 'Components for page structure and navigation',
    icon: Category,
    color: '#f57c00',
    components: [
      {
        title: 'Page Container',
        description: 'Standard page container with consistent padding and spacing',
        path: '/dev/components/page-container',
        tags: ['Layout', 'Container', 'Wrapper']
      },
      {
        title: 'Actions Cell',
        description: 'Action buttons for DataGrid rows (Edit, Delete, Status)',
        path: '/dev/components/actions-cell',
        tags: ['Actions', 'Buttons', 'Grid']
      },
      {
        title: 'Status Change Menu',
        description: 'Dropdown menu for changing status with colors',
        path: '/dev/components/status-menu',
        tags: ['Status', 'Menu', 'Dropdown']
      }
    ]
  }
];
