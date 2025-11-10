import {
  GridOn,
  Edit,
  Search,
  Description,
  Category,
  ShowChart,
  Widgets,
  Notifications,
  Security,
  ViewModule
} from '@mui/icons-material';

export const componentCategories = [
  {
    category: 'Data Display & Tables',
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
        title: 'Table',
        description: 'Simple table with sorting, pagination, and row selection',
        path: '/dev/components/ui-components',
        tags: ['Table', 'Simple', 'Lightweight']
      },
      {
        title: 'Empty State',
        description: 'Display empty state with icon, message, and action button',
        path: '/dev/components/empty-state',
        tags: ['UI', 'State', 'Placeholder']
      },
      {
        title: 'Status Indicator',
        description: 'Status badges with dot, chip, and icon variants',
        path: '/dev/components/ui-components',
        tags: ['Status', 'Badge', 'Indicator']
      },
      {
        title: 'Badge & Chip',
        description: 'Badges and chips for labels, tags, and counts',
        path: '/dev/components/ui-components',
        tags: ['Badge', 'Chip', 'Label']
      }
    ]
  },
  {
    category: 'Form Components',
    description: 'Input components for forms and user interaction',
    icon: Edit,
    color: '#2e7d32',
    components: [
      {
        title: 'Input Field',
        description: 'Text input with validation, password toggle, and character counter',
        path: '/dev/components/ui-components',
        tags: ['Input', 'TextField', 'Form']
      },
      {
        title: 'Select Dropdown',
        description: 'Single and multiple selection dropdown with icons',
        path: '/dev/components/ui-components',
        tags: ['Select', 'Dropdown', 'Form']
      },
      {
        title: 'Checkbox & Radio',
        description: 'Checkbox groups and radio button groups',
        path: '/dev/components/ui-components',
        tags: ['Checkbox', 'Radio', 'Form']
      },
      {
        title: 'Switch Toggle',
        description: 'On/off switch with labels and states',
        path: '/dev/components/ui-components',
        tags: ['Switch', 'Toggle', 'Form']
      },
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
        title: 'Avatar Upload',
        description: 'User avatar upload with crop and preview',
        path: '/dev/components/avatar-upload',
        tags: ['Image', 'Profile', 'Upload']
      },
      {
        title: 'Multi Select',
        description: 'Multiple selection dropdown with search and chips',
        path: '/dev/components/multi-select',
        tags: ['Select', 'Dropdown', 'Multiple']
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
    category: 'Date & Time Pickers',
    description: 'Date and time selection components',
    icon: Edit,
    color: '#5e35b1',
    components: [
      {
        title: 'Date Picker',
        description: 'Single date selection with calendar interface',
        path: '/dev/components/date-picker',
        tags: ['Date', 'Calendar', 'Single']
      },
      {
        title: 'Date Range Picker',
        description: 'Select date ranges with calendar interface',
        path: '/dev/components/date-range-picker',
        tags: ['Date', 'Calendar', 'Range']
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
    category: 'Modals & Dialogs',
    description: 'Modal dialogs and overlays for focused interactions',
    icon: Description,
    color: '#9c27b0',
    components: [
      {
        title: 'Modal',
        description: 'Generic modal dialog with header, content, and actions',
        path: '/dev/components/ui-components',
        tags: ['Modal', 'Dialog', 'Popup']
      },
      {
        title: 'Confirmation Dialog',
        description: 'Confirmation dialog for critical actions',
        path: '/dev/components/ui-components',
        tags: ['Dialog', 'Confirm', 'Warning']
      },
      {
        title: 'CRUD Dialog',
        description: 'Generic dialog for Create, Read, Update, Delete operations',
        path: '/dev/components/crud-dialog',
        tags: ['Dialog', 'CRUD', 'Form']
      },
      {
        title: 'Delete Confirm Dialog',
        description: 'Confirmation dialog for delete operations',
        path: '/dev/components/delete-confirm',
        tags: ['Dialog', 'Delete', 'Confirm']
      },
      {
        title: 'Edit Drawer',
        description: 'Side drawer for editing data with form fields',
        path: '/dev/components/edit-drawer',
        tags: ['Drawer', 'Edit', 'Form']
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
    category: 'Feedback & Notifications',
    description: 'User feedback and notification components',
    icon: Notifications,
    color: '#d32f2f',
    components: [
      {
        title: 'Alert & Banner',
        description: 'Alert messages with success, error, warning, and info types',
        path: '/dev/components/ui-components',
        tags: ['Alert', 'Banner', 'Message']
      },
      {
        title: 'Toast Messages',
        description: 'Toast notifications for user actions and feedback',
        path: '/dev/components/ui-components',
        tags: ['Toast', 'Snackbar', 'Notification']
      },
      {
        title: 'Notification Center',
        description: 'Notification dropdown with badge and list',
        path: '/dev/components/ui-components',
        tags: ['Notification', 'Bell', 'Alerts']
      },
      {
        title: 'Loading Indicators',
        description: 'Spinner, progress bar, skeleton loader, and overlay loading',
        path: '/dev/components/loading',
        tags: ['Loading', 'Spinner', 'Progress']
      },
      {
        title: 'Progress Indicators',
        description: 'Linear and circular progress bars with steps',
        path: '/dev/components/ui-components',
        tags: ['Progress', 'Steps', 'Indicator']
      }
    ]
  },
  {
    category: 'Layout & Navigation',
    description: 'Components for page structure and navigation',
    icon: ViewModule,
    color: '#f57c00',
    components: [
      {
        title: 'Page Header',
        description: 'Standardized page header with breadcrumb, title, and actions',
        path: '/dev/components/page-header',
        tags: ['Layout', 'Navigation', 'Header']
      },
      {
        title: 'Page Container',
        description: 'Standard page container with consistent padding and spacing',
        path: '/dev/components/page-container',
        tags: ['Layout', 'Container', 'Wrapper']
      },
      {
        title: 'Breadcrumb',
        description: 'Navigation breadcrumb with auto-collapse',
        path: '/dev/components/ui-components',
        tags: ['Breadcrumb', 'Navigation', 'Path']
      },
      {
        title: 'Card',
        description: 'Card container with header, content, and actions',
        path: '/dev/components/ui-components',
        tags: ['Card', 'Container', 'Layout']
      },
      {
        title: 'Tabs',
        description: 'Horizontal and vertical tabs with content panels',
        path: '/dev/components/ui-components',
        tags: ['Tabs', 'Navigation', 'Panel']
      },
      {
        title: 'Accordion',
        description: 'Expandable accordion panels',
        path: '/dev/components/ui-components',
        tags: ['Accordion', 'Collapse', 'Panel']
      },
      {
        title: 'Stepper',
        description: 'Step-by-step wizard navigation',
        path: '/dev/components/ui-components',
        tags: ['Stepper', 'Wizard', 'Steps']
      },
      {
        title: 'Menu',
        description: 'Dropdown menu with icons and actions',
        path: '/dev/components/ui-components',
        tags: ['Menu', 'Dropdown', 'Context']
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
  },
  {
    category: 'Utilities & Helpers',
    description: 'Utility components and helpers',
    icon: Widgets,
    color: '#00897b',
    components: [
      {
        title: 'Tooltip',
        description: 'Tooltips with light, dark, and custom variants',
        path: '/dev/components/ui-components',
        tags: ['Tooltip', 'Hint', 'Helper']
      },
      {
        title: 'Error Boundary',
        description: 'Error boundary for catching React errors',
        path: '/dev/components/ui-components',
        tags: ['Error', 'Boundary', 'Fallback']
      }
    ]
  },
  {
    category: 'Security & Access Control',
    description: 'Permission and role-based components',
    icon: Security,
    color: '#c62828',
    components: [
      {
        title: 'Permission Guard',
        description: 'Permission-based rendering with fallback',
        path: '/dev/components/ui-components',
        tags: ['Permission', 'Guard', 'Access']
      },
      {
        title: 'Role Badge',
        description: 'Role badges with icons (Admin, Manager, User, etc.)',
        path: '/dev/components/ui-components',
        tags: ['Role', 'Badge', 'Access']
      }
    ]
  },
  {
    category: 'Charts & Visualization',
    description: 'Data visualization components for business intelligence',
    icon: ShowChart,
    color: '#0288d1',
    components: [
      {
        title: 'Basic Charts',
        description: 'Line, Bar, Pie, Area, Donut, and Radar charts for standard data visualization',
        path: '/dev/components/charts',
        tags: ['Chart', 'Graph', 'Visualization', 'Basic']
      },
      {
        title: 'Stacked Area Chart',
        description: 'Cumulative trends visualization showing total and component breakdown',
        path: '/dev/components/stacked-area-chart',
        tags: ['Chart', 'Stacked', 'Area', 'Trends']
      },
      {
        title: 'Mixed Bar & Line Chart',
        description: 'Combined bar and line chart for comparing absolute values with rates',
        path: '/dev/components/mixed-bar-line-chart',
        tags: ['Chart', 'Mixed', 'Bar', 'Line']
      },
      {
        title: 'Multi-Axis Chart',
        description: 'Dual Y-axis chart for comparing metrics with different scales',
        path: '/dev/components/multi-axis-chart',
        tags: ['Chart', 'Multi-Axis', 'Dual-Axis', 'Comparison']
      },
      {
        title: 'Trend Chart',
        description: 'Historical data with forecast projections and confidence intervals',
        path: '/dev/components/trend-chart',
        tags: ['Chart', 'Trend', 'Forecast', 'Prediction']
      }
    ]
  },
  {
    category: 'Complete Demo',
    description: 'Comprehensive component demonstrations',
    icon: Category,
    color: '#7b1fa2',
    components: [
      {
        title: 'All UI Components',
        description: 'Comprehensive demo of all 24 new UI components in one interactive page',
        path: '/dev/components/ui-components',
        tags: ['Demo', 'All', 'Complete', 'Interactive']
      }
    ]
  }
];
