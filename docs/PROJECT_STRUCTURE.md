# Project Structure

This document describes the folder structure and organization of the Next.js Enterprise Application.

## Overview

The project follows a clear separation of concerns with distinct areas for:
- **User Dashboard**: Regular user features and personal settings
- **Administration**: System administration features (admin-only)
- **Development**: Component library and development tools
- **Public Pages**: Publicly accessible pages

## Directory Structure

```
src/
├── app/[locale]/                    # Next.js 13+ App Router with i18n
│   ├── login/                       # Authentication
│   │   └── page.tsx
│   │
│   ├── privacy-policy/              # Public pages (no auth required)
│   │   └── page.tsx
│   │
│   ├── dashboard/                   # User Dashboard (authenticated users)
│   │   ├── layout.tsx               # Dashboard layout with auth check
│   │   ├── page.tsx                 # Dashboard home
│   │   └── settings/                # User personal settings
│   │       └── page.tsx             # Profile, Security, Preferences
│   │
│   ├── admin/                       # Administration Area (admin role only)
│   │   ├── layout.tsx               # Admin layout with role-based access
│   │   ├── page.tsx                 # Admin dashboard
│   │   ├── users/                   # User management
│   │   │   └── page.tsx
│   │   └── menus/                   # Menu management
│   │       └── page.tsx
│   │
│   └── dev/                         # Development Tools
│       ├── layout.tsx
│       ├── page.tsx                 # Component library index
│       └── components/              # Component demos
│           ├── data-grid/
│           ├── file-upload/
│           └── rich-text-editor/
│
├── components/
│   ├── common/                      # Reusable common components
│   │   ├── DataGrid/                # Excel-like data grid
│   │   ├── EmptyState/              # Empty state display
│   │   ├── PageHeader/              # Page header with title/count
│   │   ├── SearchFilterPanel/       # Collapsible search panel
│   │   ├── FileUpload/              # File upload component
│   │   ├── RichTextEditor/          # WYSIWYG editor
│   │   └── AutoLogoutWarning/       # Session timeout warning
│   │
│   ├── features/                    # Domain-specific components
│   │   ├── users/                   # User management components
│   │   ├── menus/                   # Menu management components
│   │   └── settings/                # Settings components
│   │
│   ├── layout/                      # Layout components
│   │   ├── Sidebar/                 # Main navigation sidebar
│   │   ├── DashboardHeader/         # Dashboard header
│   │   └── DashboardFooter/         # Dashboard footer
│   │
│   └── providers/                   # React context providers
│
├── hooks/                           # Custom React hooks
│   ├── useAutoLogout.ts             # Auto logout functionality
│   └── useMenu.ts                   # Menu management hook
│
├── lib/                             # Utility libraries
│   ├── axios/                       # API client configuration
│   └── i18n/                        # Internationalization
│
├── contexts/                        # React contexts
│   └── AuthContext.tsx              # Authentication context
│
├── types/                           # TypeScript type definitions
│   └── menu.ts
│
└── styles/                          # Global styles
```

## Route Structure

### Public Routes (No Authentication)
- `/login` - User login
- `/privacy-policy` - Privacy policy

### User Routes (Authenticated)
- `/dashboard` - User dashboard home
- `/dashboard/settings` - User personal settings (profile, security, preferences)

### Admin Routes (Admin Role Only)
- `/admin` - Admin dashboard
- `/admin/users` - User management (CRUD operations)
- `/admin/menus` - Menu structure management

### Development Routes
- `/dev/components` - Component library and demos
- `/dev/components/data-grid` - DataGrid component demo
- `/dev/components/file-upload` - File upload component demo
- `/dev/components/rich-text-editor` - Rich text editor demo

## Key Design Principles

### 1. Clear Separation by Role
- **Dashboard**: Features for all authenticated users
- **Admin**: Administrative features restricted to admin role
- **Dev**: Development and testing tools

### 2. Role-Based Access Control
- Admin layout (`src/app/[locale]/admin/layout.tsx`) checks user role
- Unauthorized users are redirected to appropriate pages
- Menu visibility controlled by backend `/menu/user-menus` endpoint

### 3. Component Reusability
- **Common Components**: Generic, reusable across the application
- **Feature Components**: Domain-specific, shared within a feature area
- **Layout Components**: Structural components for page layouts

### 4. Scalability
- Easy to add new admin features under `/admin`
- Clear structure for adding new user features under `/dashboard`
- Feature-based component organization for growth

### 5. Maintainability
- URL structure matches folder structure
- Related components grouped together
- Clear naming conventions

## Adding New Features

### Adding a User Feature
1. Create folder: `src/app/[locale]/dashboard/your-feature/`
2. Add page: `src/app/[locale]/dashboard/your-feature/page.tsx`
3. Add menu entry in backend: `backend/data/menus.json`

### Adding an Admin Feature
1. Create folder: `src/app/[locale]/admin/your-feature/`
2. Add page: `src/app/[locale]/admin/your-feature/page.tsx`
3. Add menu entry with appropriate role restrictions
4. Role check is automatic via admin layout

### Adding a Common Component
1. Create folder: `src/components/common/YourComponent/`
2. Add index.tsx with component implementation
3. Export from index.tsx
4. Import where needed: `import YourComponent from '@/components/common/YourComponent'`

### Adding a Feature Component
1. Create folder: `src/components/features/feature-name/ComponentName/`
2. Add implementation
3. Use within feature pages

## Backend Structure

```
backend/
├── data/                            # JSON file storage
│   ├── users.json                   # User data
│   ├── menus.json                   # Menu structure
│   ├── logs.json                    # System logs
│   └── userPreferences.json         # User preferences
│
└── routes/                          # Express routes
    ├── auth.js                      # Authentication routes
    ├── user.js                      # User management
    └── menu.js                      # Menu management
```

## Important Files

- `src/middleware.ts` - Next.js middleware for i18n
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/hooks/useMenu.ts` - Menu data fetching and management
- `backend/data/menus.json` - Menu structure configuration

## Menu Configuration

Menus are configured in `backend/data/menus.json`:

```json
{
  "id": "menu-002",
  "code": "admin",
  "name": {
    "en": "Administration",
    "ko": "관리자"
  },
  "path": "/admin",
  "icon": "AdminPanelSettings",
  "order": 2,
  "parentId": null,
  "level": 1,
  "programId": null
}
```

- Hierarchical structure via `parentId`
- Multi-language support via `name` object
- Icon mapping in `src/components/layout/Sidebar/index.tsx`
- Access control via backend user role check

## Development Workflow

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `npm run dev`
3. **Access Application**: `http://localhost:3000`
4. **Default Admin**: username: `admin`, password: `Admin123!`

## Best Practices

1. **Always use common components** when possible
2. **Keep pages thin** - move logic to hooks or components
3. **Use TypeScript** for type safety
4. **Follow naming conventions** - PascalCase for components, camelCase for functions
5. **Add error handling** for all API calls
6. **Test role-based access** before deploying admin features

## Page Not Found & Coming Soon Handling

### Not Found Pages (404)

The application includes custom 404 pages at different levels:

1. **Global Not Found**: `src/app/[locale]/not-found.tsx`
   - Handles any invalid route
   - Redirects to dashboard home

2. **Dashboard Not Found**: `src/app/[locale]/dashboard/not-found.tsx`
   - Handles invalid dashboard routes
   - Customized for dashboard context

3. **Admin Not Found**: `src/app/[locale]/admin/not-found.tsx`
   - Handles invalid admin routes
   - Includes message about implementing pages

All not-found pages use the common `NotFoundPage` component located at:
`src/components/common/NotFoundPage/index.tsx`

### Coming Soon Pages

For menu items that exist but pages are not yet implemented:

1. **ComingSoon Component**: `src/components/common/ComingSoonPage/index.tsx`
   - Shows "Under Development" status
   - Provides back/home navigation
   - Supports bilingual messages

2. **Example Usage**: `src/app/[locale]/reports/sales-report/page.tsx`
   - Demonstrates how to use ComingSoon page
   - Can be copied as template for new pages

### Adding New Pages

See `PAGE_TEMPLATES.md` for detailed guide on:
- Creating coming soon pages
- Implementing full pages
- Handling 404 scenarios
- Menu integration

Quick workflow:
1. Add menu entry to `backend/data/menus.json`
2. Create coming soon page using template
3. Implement real page when ready
4. Test menu navigation

## Migration Notes

Recent restructuring (v2.0):
- Moved `/dashboard/user-management` → `/admin/users`
- Moved `/dashboard/menu-management` → `/admin/menus`
- Moved `/dashboard/privacy-policy` → `/privacy-policy`
- Moved `/dashboard/components` → `/dev/components`
- Added role-based admin layout
- Improved component organization

Recent additions (v2.1):
- Added NotFoundPage common component
- Added ComingSoonPage common component
- Created 404 pages for each section
- Added example coming soon page (Sales Report)
- Created PAGE_TEMPLATES.md guide
