import {
  Palette,
  Widgets,
  Code,
  Security,
  ShowChart,
  Storage,
  ViewModule,
  ListAlt,
  Dashboard
} from '@mui/icons-material';

export const componentCategories = [
  {
    category: 'Theme System',
    description: 'MUI Theme system with custom colors, typography, and component overrides',
    icon: Palette,
    color: '#9c27b0',
    components: [
      {
        title: 'Theme Demo',
        description: 'Comprehensive demo of custom theme with status/role colors, typography, and spacing',
        path: '/dev/theme-demo',
        tags: ['Theme', 'Colors', 'Typography']
      }
    ]
  },
  {
    category: 'MUI Components (Direct Usage)',
    description: 'Examples of using MUI components directly without wrappers - Theme-styled',
    icon: Widgets,
    color: '#1976d2',
    components: [
      {
        title: 'All UI Components',
        description: 'Comprehensive demo of MUI components: Dialog, Alert, TextField, Select, Switch, Checkbox, Tabs, Table, Accordion, Stepper, Menu, Tooltip, Progress, Loading',
        path: '/dev/components/ui-components',
        tags: ['MUI', 'Direct', 'Demo', 'Complete']
      },
      {
        title: 'Loading Indicators',
        description: 'MUI CircularProgress, LinearProgress, Skeleton, and Backdrop examples',
        path: '/dev/components/loading',
        tags: ['Loading', 'Progress', 'Skeleton']
      }
    ]
  },
  {
    category: 'Data Management',
    description: 'Components for displaying and managing complex data',
    icon: Storage,
    color: '#2e7d32',
    components: [
      {
        title: 'DataGrid',
        description: 'Advanced data grid with sorting, filtering, pagination, Excel export/import, inline editing, and permission-based actions',
        path: '/dev/components/data-grid',
        tags: ['Table', 'Grid', 'Excel', 'CRUD', 'Business']
      },
      {
        title: 'SimpleListView',
        description: 'Lightweight table-based list with pagination, checkbox selection, and toolbar actions - ideal for read-only data display',
        path: '/dev/components/simple-list-view',
        tags: ['Table', 'List', 'Pagination', 'Lightweight']
      },
      {
        title: 'Search & Filter Panel',
        description: 'Advanced search with multiple filter criteria, date ranges, and dynamic field generation',
        path: '/dev/components/search-filter',
        tags: ['Search', 'Filter', 'Panel']
      },
      {
        title: 'Quick Search Bar',
        description: 'Simple search bar with instant results and autocomplete',
        path: '/dev/components/quick-search',
        tags: ['Search', 'Quick', 'Autocomplete']
      }
    ]
  },
  {
    category: 'Form Components',
    description: 'Form inputs with business logic and complex patterns',
    icon: Code,
    color: '#ed6c02',
    components: [
      {
        title: 'CRUD Dialog',
        description: 'Generic dialog for Create, Read, Update, Delete operations with form validation',
        path: '/dev/components/crud-dialog',
        tags: ['Dialog', 'CRUD', 'Form', 'Business']
      },
      {
        title: 'Advanced Search Dialog',
        description: 'Dialog-based advanced search with complex filter combinations',
        path: '/dev/components/advanced-search',
        tags: ['Search', 'Dialog', 'Complex']
      },
      {
        title: 'User Search Dialog',
        description: 'Search and select users from a dialog with API integration',
        path: '/dev/components/user-search',
        tags: ['User', 'Search', 'Dialog']
      },
      {
        title: 'User Selector',
        description: 'Select users with search, autocomplete, and API integration',
        path: '/dev/components/user-selector',
        tags: ['User', 'Autocomplete', 'API']
      },
      {
        title: 'User Autocomplete',
        description: 'Lightweight user autocomplete with server-side search - optimized for performance',
        path: '/dev/components/user-autocomplete',
        tags: ['User', 'Autocomplete', 'Performance', 'Lightweight']
      },
      {
        title: 'Multi Select',
        description: 'Multiple selection dropdown with search and chips',
        path: '/dev/components/multi-select',
        tags: ['Select', 'Multiple', 'Chips']
      },
      {
        title: 'Rich Text Editor',
        description: 'WYSIWYG editor with TipTap: formatting, lists, links, images, tables',
        path: '/dev/components/rich-text-editor',
        tags: ['Editor', 'WYSIWYG', 'TipTap']
      },
      {
        title: 'File Upload',
        description: 'Drag-and-drop file upload with progress, validation, and size limits',
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
        title: 'Tag Input',
        description: 'Tag input with keyboard support, suggestions, and validation',
        path: '/dev/components/tag-input',
        tags: ['Tags', 'Input', 'Chips']
      },
      {
        title: 'File Upload Zone',
        description: 'Drag-and-drop file upload with preview, progress, and file type validation',
        path: '/dev/components/file-upload-zone',
        tags: ['Upload', 'Drag-Drop', 'Preview']
      },
      {
        title: 'Department Tree Select',
        description: 'Hierarchical department selection with tree navigation and search',
        path: '/dev/components/department-tree-select',
        tags: ['Tree', 'Department', 'Hierarchy']
      },
      {
        title: 'Attachments',
        description: 'Comprehensive file attachment system with attachment type validation, multi-file upload, drag-drop, and progress tracking',
        path: '/dev/components/attachments',
        tags: ['Upload', 'Attachment', 'API', 'Validation']
      },
      {
        title: 'Icon Select',
        description: 'MUI icon selector dropdown with search functionality and icon preview',
        path: '/dev/components/icon-select',
        tags: ['Icon', 'Select', 'MUI', 'Search']
      }
    ]
  },
  {
    category: 'Code Management Components',
    description: 'Database-driven select components that load options from code management system',
    icon: ListAlt,
    color: '#00695c',
    components: [
      {
        title: 'CodeSelect & CodeMultiSelect',
        description: 'Single/Multi select components with automatic option loading from code types - just provide codeType prop',
        path: '/dev/components/code-select',
        tags: ['Select', 'Code', 'Dynamic', 'Database']
      }
    ]
  },
  {
    category: 'Date & Time Pickers',
    description: 'Date and time selection with dayjs integration and format standardization',
    icon: Code,
    color: '#5e35b1',
    components: [
      {
        title: 'Date Picker',
        description: 'Single date selection with dayjs integration and format standardization',
        path: '/dev/components/date-picker',
        tags: ['Date', 'Calendar', 'dayjs']
      },
      {
        title: 'Date Range Picker',
        description: 'Select date ranges with calendar interface and validation',
        path: '/dev/components/date-range-picker',
        tags: ['Date', 'Range', 'Period']
      },
      {
        title: 'Time Picker',
        description: 'Select time with hour and minute',
        path: '/dev/components/time-picker',
        tags: ['Time', 'Clock']
      },
      {
        title: 'DateTime Picker',
        description: 'Select date and time combined with dayjs',
        path: '/dev/components/datetime-picker',
        tags: ['DateTime', 'Calendar', 'Time']
      },
      {
        title: 'DateTime Range Picker',
        description: 'Select date and time ranges with validation',
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
    category: 'Dialogs & Modals',
    description: 'Dialog patterns with business logic and complex interactions',
    icon: ViewModule,
    color: '#00897b',
    components: [
      {
        title: 'Form Dialog',
        description: 'Full-screen responsive dialog for complex forms with loading state and validation support',
        path: '/dev/components/form-dialog',
        tags: ['Dialog', 'Form', 'Full-Screen', 'Responsive']
      },
      {
        title: 'Delete Confirm Dialog',
        description: 'Specialized confirmation dialog for delete operations with safety checks',
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
        description: 'Display contextual help content with markdown support and API integration',
        path: '/dev/components/help-viewer',
        tags: ['Help', 'Markdown', 'API']
      }
    ]
  },
  {
    category: 'Business Logic Components',
    description: 'Components with project-specific business logic and integrations',
    icon: Security,
    color: '#d32f2f',
    components: [
      {
        title: 'Page Header',
        description: 'Standardized page header with menu integration, breadcrumb, title, and actions',
        path: '/dev/components/page-header',
        tags: ['Layout', 'Menu', 'Breadcrumb']
      },
      {
        title: 'Actions Cell',
        description: 'Permission-based action buttons for DataGrid rows (Edit, Delete, Status)',
        path: '/dev/components/actions-cell',
        tags: ['Actions', 'Permission', 'Grid']
      },
      {
        title: 'Status Change Menu',
        description: 'Dropdown menu for changing status with role-based colors',
        path: '/dev/components/status-menu',
        tags: ['Status', 'Menu', 'Colors']
      },
      {
        title: 'Status Indicator (UI Components)',
        description: 'Status badges with business logic: active, inactive, pending, error',
        path: '/dev/components/ui-components',
        tags: ['Status', 'Badge', 'Business']
      },
      {
        title: 'Role Badge (UI Components)',
        description: 'Role badges with icons and colors: Admin, Manager, User, Guest',
        path: '/dev/components/ui-components',
        tags: ['Role', 'Badge', 'Security']
      },
      {
        title: 'Permission Guard (UI Components)',
        description: 'Permission-based rendering with fallback for access control',
        path: '/dev/components/ui-components',
        tags: ['Permission', 'Guard', 'Security']
      },
      {
        title: 'Notification Center (UI Components)',
        description: 'Notification dropdown with badge, list, and actions',
        path: '/dev/components/ui-components',
        tags: ['Notification', 'Bell', 'Alerts']
      },
      {
        title: 'Unified Message System',
        description: 'Centralized message management with code-based messages, multi-language support, and dynamic parameters',
        path: '/dev/components/message-system',
        tags: ['Message', 'i18n', 'Hook', 'System']
      },
      {
        title: 'Safe HTML Renderer',
        description: 'XSS-protected HTML rendering with DOMPurify - safely displays user-generated content',
        path: '/dev/components/safe-html-renderer',
        tags: ['HTML', 'XSS', 'Security', 'Sanitize']
      },
      {
        title: 'Notice Popup',
        description: 'Automatic popup dialog for important notifications with "Don\'t show today" feature and localStorage persistence',
        path: '/dev/components/notice-popup',
        tags: ['Notification', 'Popup', 'Dialog', 'Auto']
      }
    ]
  },
  {
    category: 'Layout Components',
    description: 'Page structure and navigation components',
    icon: Dashboard,
    color: '#f57c00',
    components: [
      {
        title: 'Page Container',
        description: 'Standard page container with consistent padding and spacing',
        path: '/dev/components/page-container',
        tags: ['Layout', 'Container', 'Wrapper']
      },
      {
        title: 'Page State Wrapper',
        description: 'Handles common page states: loading skeleton, error, permission denied, not found, empty - with retry support',
        path: '/dev/components/page-state-wrapper',
        tags: ['Layout', 'State', 'Loading', 'Error']
      },
      {
        title: 'Master Detail Layout',
        description: 'Resizable split-pane layout with draggable divider for master-detail patterns',
        path: '/dev/components/master-detail-layout',
        tags: ['Layout', 'Split', 'Resizable', 'Panel']
      },
      {
        title: 'Empty State',
        description: 'Display empty state with icon, message, and action button',
        path: '/dev/components/empty-state',
        tags: ['UI', 'State', 'Placeholder']
      },
      {
        title: 'Breadcrumb (UI Components)',
        description: 'Navigation breadcrumb with menu integration',
        path: '/dev/components/ui-components',
        tags: ['Breadcrumb', 'Navigation', 'Menu']
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
        tags: ['Chart', 'Graph', 'Recharts']
      },
      {
        title: 'Stacked Area Chart',
        description: 'Cumulative trends showing total and component breakdown',
        path: '/dev/components/stacked-area-chart',
        tags: ['Chart', 'Stacked', 'Trends']
      },
      {
        title: 'Mixed Bar & Line Chart',
        description: 'Combined chart comparing absolute values with rates',
        path: '/dev/components/mixed-bar-line-chart',
        tags: ['Chart', 'Mixed', 'Comparison']
      },
      {
        title: 'Multi-Axis Chart',
        description: 'Dual Y-axis chart for comparing metrics with different scales',
        path: '/dev/components/multi-axis-chart',
        tags: ['Chart', 'Multi-Axis', 'Comparison']
      },
      {
        title: 'Trend Chart',
        description: 'Historical data with forecast projections and confidence intervals',
        path: '/dev/components/trend-chart',
        tags: ['Chart', 'Trend', 'Forecast']
      }
    ]
  }
];
