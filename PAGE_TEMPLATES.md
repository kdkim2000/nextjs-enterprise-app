# Page Templates Guide

This guide helps you quickly create new pages in the application, whether they are fully implemented, under construction, or placeholder pages.

## Quick Start

### 1. Menu Exists but Page Not Yet Implemented

When you have a menu item in `backend/data/menus.json` but haven't built the page yet, use the **ComingSoon** template:

```tsx
// src/app/[locale]/your-section/your-page/page.tsx
'use client';

import ComingSoonPage from '@/components/common/ComingSoonPage';
import { useCurrentLocale } from '@/lib/i18n/client';

export default function YourFeaturePage() {
  const locale = useCurrentLocale();

  return (
    <ComingSoonPage
      title={locale === 'ko' ? '한글 제목' : 'English Title'}
      featureName={locale === 'ko' ? '기능 이름' : 'Feature Name'}
      message={
        locale === 'ko'
          ? '이 기능은 현재 개발 중입니다.'
          : 'This feature is currently under development.'
      }
      homeUrl={`/${locale}/dashboard`}
    />
  );
}
```

**Example:** See `src/app/[locale]/reports/sales-report/page.tsx`

### 2. Page Not Found (404)

404 pages are automatically handled by Next.js using `not-found.tsx` files:

- **Dashboard 404**: `src/app/[locale]/dashboard/not-found.tsx`
- **Admin 404**: `src/app/[locale]/admin/not-found.tsx`
- **Global 404**: `src/app/[locale]/not-found.tsx`

You can also manually trigger a 404:

```tsx
import { notFound } from 'next/navigation';

export default function YourPage() {
  const data = await fetchData();

  if (!data) {
    notFound(); // Triggers the nearest not-found.tsx
  }

  return <div>Your content</div>;
}
```

### 3. Custom Not Found Page

If you need a custom not-found message:

```tsx
'use client';

import NotFoundPage from '@/components/common/NotFoundPage';
import { useCurrentLocale } from '@/lib/i18n/client';

export default function CustomNotFound() {
  const locale = useCurrentLocale();

  return (
    <NotFoundPage
      title={locale === 'ko' ? '커스텀 제목' : 'Custom Title'}
      message={locale === 'ko' ? '커스텀 메시지' : 'Custom message'}
      homeUrl={`/${locale}/dashboard`}
    />
  );
}
```

## Step-by-Step: Adding a New Feature

### Scenario: Adding "Inventory Management" Feature

#### Step 1: Add Menu Entry

Edit `backend/data/menus.json`:

```json
{
  "id": "menu-009",
  "code": "inventory",
  "name": {
    "en": "Inventory Management",
    "ko": "재고 관리"
  },
  "path": "/inventory",
  "icon": "Inventory",
  "order": 5,
  "parentId": null,
  "level": 1,
  "programId": "PROG-INVENTORY",
  "description": {
    "en": "Manage inventory and stock levels",
    "ko": "재고 및 재고 수준 관리"
  }
}
```

#### Step 2: Create Coming Soon Page (Temporary)

Create folder structure:
```bash
mkdir -p src/app/[locale]/inventory
```

Create `src/app/[locale]/inventory/page.tsx`:

```tsx
'use client';

import ComingSoonPage from '@/components/common/ComingSoonPage';
import { useCurrentLocale } from '@/lib/i18n/client';

export default function InventoryPage() {
  const locale = useCurrentLocale();

  return (
    <ComingSoonPage
      title={locale === 'ko' ? '재고 관리' : 'Inventory Management'}
      featureName={locale === 'ko' ? '재고 및 재고 수준 관리' : 'Manage Inventory and Stock Levels'}
      message={
        locale === 'ko'
          ? '재고 관리 기능은 현재 개발 중입니다. 재고 추적, 입출고 관리, 재고 수준 알림 등의 기능이 제공될 예정입니다.'
          : 'The Inventory Management feature is currently under development. It will provide inventory tracking, stock in/out management, inventory level alerts, and more.'
      }
      homeUrl={`/${locale}/dashboard`}
    />
  );
}
```

Create `src/app/[locale]/inventory/layout.tsx`:

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale } from '@/lib/i18n/client';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import Sidebar from '@/components/layout/Sidebar';

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, isLoading, router, locale]);

  if (isLoading || !isAuthenticated) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <DashboardHeader onMenuClick={() => setSidebarExpanded(!sidebarExpanded)} />
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar expanded={sidebarExpanded} />
        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 2, py: 2 }}>
            {children}
          </Box>
          <DashboardFooter />
        </Box>
      </Box>
    </Box>
  );
}
```

#### Step 3: Test the Menu

1. Restart backend server (if menus.json was changed)
2. Login and click on "Inventory Management" in the sidebar
3. You should see the "Coming Soon" page

#### Step 4: Implement the Real Page (When Ready)

Replace `src/app/[locale]/inventory/page.tsx` with your implementation:

```tsx
'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import { useI18n } from '@/lib/i18n/client';

export default function InventoryPage() {
  const t = useI18n();

  return (
    <Box>
      <PageHeader
        title={t('menu.inventory') || 'Inventory Management'}
      />

      {/* Your actual implementation here */}
      <Box sx={{ mt: 2 }}>
        {/* Tables, forms, charts, etc. */}
      </Box>
    </Box>
  );
}
```

## Component Reference

### ComingSoonPage Props

```typescript
interface ComingSoonPageProps {
  title?: string;           // Main title
  message?: string;         // Description message
  featureName?: string;     // Feature name (displayed prominently)
  showBackButton?: boolean; // Show "Go Back" button (default: true)
  showHomeButton?: boolean; // Show "Go Home" button (default: true)
  homeUrl?: string;         // Custom home URL (default: /[locale]/dashboard)
}
```

### NotFoundPage Props

```typescript
interface NotFoundPageProps {
  title?: string;           // Main title
  message?: string;         // Description message
  showBackButton?: boolean; // Show "Go Back" button (default: true)
  showHomeButton?: boolean; // Show "Go Home" button (default: true)
  homeUrl?: string;         // Custom home URL (default: /[locale]/dashboard)
}
```

## Best Practices

### 1. Always Use Layout Files

Each new section should have its own `layout.tsx` that includes:
- Authentication check
- Sidebar and Header
- Proper overflow handling

### 2. Menu Management

- Add menu entries to `backend/data/menus.json`
- Use clear, descriptive names in both languages
- Set appropriate `order` for menu positioning
- Use `parentId` for nested menus

### 3. Icon Mapping

Add new icons to `src/components/layout/Sidebar/index.tsx`:

```tsx
import { YourIcon } from '@mui/icons-material';

const iconMap: Record<string, React.ReactElement> = {
  // ... existing icons
  YourIcon: <YourIcon />
};
```

### 4. Internationalization

Always support both English and Korean:

```tsx
const locale = useCurrentLocale();
const title = locale === 'ko' ? '한글 제목' : 'English Title';
```

Add translations to:
- `src/lib/i18n/locales/en.ts`
- `src/lib/i18n/locales/ko.ts`

### 5. Use Common Components

Leverage existing common components:
- `PageHeader` - Page title and count
- `SearchFilterPanel` - Collapsible search/filter
- `EmptyState` - Empty state display
- `DataGrid` - Excel-like data grid

## Troubleshooting

### Menu doesn't appear in sidebar

1. Check menu exists in `backend/data/menus.json`
2. Restart backend server
3. Check user has permission to access the menu
4. Verify icon name is mapped in Sidebar component

### Page shows 404

1. Check folder structure matches menu path
2. Ensure `page.tsx` exists in the folder
3. Check file naming (must be `page.tsx` not `Page.tsx`)
4. Verify layout.tsx exists in the section

### Sidebar/Header layout issues

1. Ensure layout.tsx includes proper structure
2. Check overflow settings
3. Verify DashboardHeader receives `onMenuClick` prop
4. Test with sidebar expanded and collapsed

## Examples

All example pages are in the repository:

- **Coming Soon**: `src/app/[locale]/reports/sales-report/page.tsx`
- **Not Found (Dashboard)**: `src/app/[locale]/dashboard/not-found.tsx`
- **Not Found (Admin)**: `src/app/[locale]/admin/not-found.tsx`
- **Implemented Page**: `src/app/[locale]/admin/users/page.tsx`

## Quick Copy-Paste Templates

### Minimal Coming Soon Page

```tsx
'use client';
import ComingSoonPage from '@/components/common/ComingSoonPage';
export default function Page() {
  return <ComingSoonPage />;
}
```

### Minimal Layout File

```tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentLocale } from '@/lib/i18n/client';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import Sidebar from '@/components/layout/Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push(`/${locale}/login`);
  }, [isAuthenticated, isLoading, router, locale]);

  if (isLoading || !isAuthenticated) {
    return <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography>Loading...</Typography></Box>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <DashboardHeader onMenuClick={() => setSidebarExpanded(!sidebarExpanded)} />
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar expanded={sidebarExpanded} />
        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 2, py: 2 }}>{children}</Box>
          <DashboardFooter />
        </Box>
      </Box>
    </Box>
  );
}
```

---

For more information, see `PROJECT_STRUCTURE.md` for overall architecture.
