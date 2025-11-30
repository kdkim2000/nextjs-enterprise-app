import {
  TextFields,
  ColorLens,
  PersonOutline,
  Widgets,
  SpaceBar,
  Info
} from '@mui/icons-material';

export interface ThemeItem {
  id: string;
  title: string;
  titleKey: string;
  description: string;
  tags: string[];
}

export interface ThemeSection {
  id: string;
  category: string;
  categoryKey: string;
  description: string;
  descriptionKey: string;
  icon: typeof TextFields;
  color: string;
  items: ThemeItem[];
}

export const themeSections: ThemeSection[] = [
  {
    id: 'typography',
    category: 'Typography',
    categoryKey: 'themeDemo.typography.title',
    description: 'Heading sizes, body text, and caption styles',
    descriptionKey: 'themeDemo.typography.description',
    icon: TextFields,
    color: '#9c27b0',
    items: [
      { id: 'headings', title: 'Headings', titleKey: 'themeDemo.typography.headings', description: 'H1 to H6 heading styles', tags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
      { id: 'body', title: 'Body Text', titleKey: 'themeDemo.typography.bodyText', description: 'Body1, Body2, and Caption', tags: ['body1', 'body2', 'caption'] }
    ]
  },
  {
    id: 'status',
    category: 'Status Colors',
    categoryKey: 'themeDemo.statusColors.title',
    description: 'Active, Inactive, Pending, Success, Error states',
    descriptionKey: 'themeDemo.statusColors.description',
    icon: ColorLens,
    color: '#2e7d32',
    items: [
      { id: 'active', title: 'Active', titleKey: 'themeDemo.statusColors.active', description: 'Active state indicator', tags: ['active', 'green', 'success'] },
      { id: 'inactive', title: 'Inactive', titleKey: 'themeDemo.statusColors.inactive', description: 'Inactive state indicator', tags: ['inactive', 'red', 'disabled'] },
      { id: 'pending', title: 'Pending', titleKey: 'themeDemo.statusColors.pending', description: 'Pending/Warning state', tags: ['pending', 'yellow', 'warning'] },
      { id: 'info', title: 'Info', titleKey: 'themeDemo.statusColors.info', description: 'Information state', tags: ['info', 'blue', 'information'] },
      { id: 'success', title: 'Success', titleKey: 'themeDemo.statusColors.success', description: 'Success state', tags: ['success', 'green', 'complete'] },
      { id: 'error', title: 'Error', titleKey: 'themeDemo.statusColors.error', description: 'Error state', tags: ['error', 'red', 'fail'] }
    ]
  },
  {
    id: 'role',
    category: 'Role Colors',
    categoryKey: 'themeDemo.roleColors.title',
    description: 'Admin, Manager, Moderator, User, Guest roles',
    descriptionKey: 'themeDemo.roleColors.description',
    icon: PersonOutline,
    color: '#1976d2',
    items: [
      { id: 'admin', title: 'Admin', titleKey: 'themeDemo.roleColors.admin', description: 'Administrator role', tags: ['admin', 'administrator', 'superuser'] },
      { id: 'manager', title: 'Manager', titleKey: 'themeDemo.roleColors.manager', description: 'Manager role', tags: ['manager', 'supervisor'] },
      { id: 'moderator', title: 'Moderator', titleKey: 'themeDemo.roleColors.moderator', description: 'Moderator role', tags: ['moderator', 'mod'] },
      { id: 'user', title: 'User', titleKey: 'themeDemo.roleColors.user', description: 'Regular user role', tags: ['user', 'member'] },
      { id: 'guest', title: 'Guest', titleKey: 'themeDemo.roleColors.guest', description: 'Guest role', tags: ['guest', 'visitor'] }
    ]
  },
  {
    id: 'components',
    category: 'Component Overrides',
    categoryKey: 'themeDemo.componentOverrides.title',
    description: 'Buttons, TextFields, Cards, Alerts styling',
    descriptionKey: 'themeDemo.componentOverrides.description',
    icon: Widgets,
    color: '#ed6c02',
    items: [
      { id: 'buttons', title: 'Buttons', titleKey: 'themeDemo.componentOverrides.buttons', description: 'Contained, Outlined, Text variants', tags: ['button', 'contained', 'outlined', 'text'] },
      { id: 'textfields', title: 'Text Fields', titleKey: 'themeDemo.componentOverrides.textFields', description: 'Input fields with various states', tags: ['input', 'textfield', 'form'] },
      { id: 'cards', title: 'Cards', titleKey: 'themeDemo.componentOverrides.cards', description: 'Card components with elevation', tags: ['card', 'elevation', 'paper'] },
      { id: 'alerts', title: 'Alerts', titleKey: 'themeDemo.componentOverrides.alerts', description: 'Alert notifications', tags: ['alert', 'notification', 'message'] }
    ]
  },
  {
    id: 'spacing',
    category: 'Spacing System',
    categoryKey: 'themeDemo.spacingSystem.title',
    description: 'Consistent spacing values (8px base)',
    descriptionKey: 'themeDemo.spacingSystem.description',
    icon: SpaceBar,
    color: '#00897b',
    items: [
      { id: 'p1', title: 'Padding 1', titleKey: 'themeDemo.spacingSystem.padding1', description: '8px spacing', tags: ['p1', '8px'] },
      { id: 'p2', title: 'Padding 2', titleKey: 'themeDemo.spacingSystem.padding2', description: '16px spacing', tags: ['p2', '16px'] },
      { id: 'p3', title: 'Padding 3', titleKey: 'themeDemo.spacingSystem.padding3', description: '24px spacing', tags: ['p3', '24px'] },
      { id: 'p4', title: 'Padding 4', titleKey: 'themeDemo.spacingSystem.padding4', description: '32px spacing', tags: ['p4', '32px'] }
    ]
  },
  {
    id: 'usage',
    category: 'Usage Guide',
    categoryKey: 'themeDemo.usage.title',
    description: 'Code examples for using theme in components',
    descriptionKey: 'themeDemo.usage.description',
    icon: Info,
    color: '#5e35b1',
    items: [
      { id: 'useTheme', title: 'useTheme Hook', titleKey: 'themeDemo.usage.useTheme', description: 'Access theme values in components', tags: ['hook', 'useTheme', 'access'] },
      { id: 'sx', title: 'SX Prop', titleKey: 'themeDemo.usage.sxProp', description: 'Inline styling with theme', tags: ['sx', 'inline', 'styling'] }
    ]
  }
];
