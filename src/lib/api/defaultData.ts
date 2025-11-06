/**
 * Default data for initialization
 * Used in Vercel and fresh installations
 */

export const defaultUsers = [
  {
    id: 'user-001',
    username: 'admin',
    password: '$2b$10$fgfsM0IoX778lfwSuOWbH.GsOTic.s0IkL7w7cZOhR87Y8Hqcphj6', // admin123
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    department: 'IT',
    mfaEnabled: false,
    ssoEnabled: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: null,
  },
  {
    id: 'user-002',
    username: 'john.doe',
    password: '$2b$10$Li/hlR94cDRa5PkbzNUEP.Joz5WguYeUzjLYwysZXlNY68mMzffyi', // password123
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'user',
    department: 'Sales',
    mfaEnabled: false,
    ssoEnabled: false,
    status: 'active',
    createdAt: '2024-01-15T00:00:00.000Z',
    lastLogin: null,
  },
  {
    id: 'user-003',
    username: 'jane.smith',
    password: '$2b$10$Li/hlR94cDRa5PkbzNUEP.Joz5WguYeUzjLYwysZXlNY68mMzffyi', // password123
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'user',
    department: 'Engineering',
    mfaEnabled: false,
    ssoEnabled: false,
    status: 'active',
    createdAt: '2024-02-01T00:00:00.000Z',
    lastLogin: null,
  },
];

export const defaultMenus = [
  {
    id: 'menu-001',
    code: 'dashboard',
    name: {
      en: 'Dashboard',
      ko: '대시보드',
    },
    path: '/dashboard',
    icon: 'Dashboard',
    order: 1,
    parentId: null,
    level: 1,
    programId: 'PROG-DASHBOARD',
    description: {
      en: 'Main dashboard overview',
      ko: '메인 대시보드 개요',
    },
  },
  {
    id: 'menu-002',
    code: 'admin',
    name: {
      en: 'Admin',
      ko: '관리',
    },
    path: '/admin',
    icon: 'AdminPanelSettings',
    order: 2,
    parentId: null,
    level: 1,
    programId: 'PROG-ADMIN',
    description: {
      en: 'Administration features',
      ko: '관리 기능',
    },
  },
  {
    id: 'menu-003',
    code: 'user-management',
    name: {
      en: 'User Management',
      ko: '사용자 관리',
    },
    path: '/admin/users',
    icon: 'People',
    order: 1,
    parentId: 'menu-002',
    level: 2,
    programId: 'PROG-USER-MGMT',
    description: {
      en: 'Manage users and permissions',
      ko: '사용자 및 권한 관리',
    },
  },
  {
    id: 'menu-004',
    code: 'menu-management',
    name: {
      en: 'Menu Management',
      ko: '메뉴 관리',
    },
    path: '/admin/menus',
    icon: 'List',
    order: 2,
    parentId: 'menu-002',
    level: 2,
    programId: 'PROG-MENU-MGMT',
    description: {
      en: 'Manage application menus',
      ko: '애플리케이션 메뉴 관리',
    },
  },
  {
    id: 'menu-005',
    code: 'reports',
    name: {
      en: 'Reports',
      ko: '리포트',
    },
    path: '/reports',
    icon: 'Assessment',
    order: 3,
    parentId: null,
    level: 1,
    programId: 'PROG-REPORTS',
    description: {
      en: 'View reports and analytics',
      ko: '리포트 및 분석 보기',
    },
  },
  {
    id: 'menu-006',
    code: 'sales-report',
    name: {
      en: 'Sales Report',
      ko: '매출 리포트',
    },
    path: '/reports/sales-report',
    icon: 'TrendingUp',
    order: 1,
    parentId: 'menu-005',
    level: 2,
    programId: 'PROG-SALES-REPORT',
    description: {
      en: 'Sales performance report',
      ko: '매출 성과 리포트',
    },
  },
  {
    id: 'menu-007',
    code: 'settings',
    name: {
      en: 'Settings',
      ko: '설정',
    },
    path: '/dashboard/settings',
    icon: 'Settings',
    order: 4,
    parentId: null,
    level: 1,
    programId: 'PROG-SETTINGS',
    description: {
      en: 'Application settings',
      ko: '애플리케이션 설정',
    },
  },
  {
    id: 'menu-008',
    code: 'dev-components',
    name: {
      en: 'Components',
      ko: '컴포넌트',
    },
    path: '/dev/components/components',
    icon: 'Widgets',
    order: 5,
    parentId: null,
    level: 1,
    programId: 'PROG-DEV-COMPONENTS',
    description: {
      en: 'UI component showcase',
      ko: 'UI 컴포넌트 쇼케이스',
    },
  },
];

export const defaultUserPreferences = [
  {
    userId: 'user-001',
    favoriteMenus: ['menu-001', 'menu-003'],
    recentMenus: ['menu-001', 'menu-003', 'menu-004'],
    language: 'en',
    theme: 'light',
    updatedAt: new Date().toISOString(),
  },
  {
    userId: 'user-002',
    favoriteMenus: [],
    recentMenus: [],
    language: 'en',
    theme: 'light',
    updatedAt: new Date().toISOString(),
  },
];

export const defaultMfaCodes: any[] = [];

export const defaultLogs: any[] = [];
