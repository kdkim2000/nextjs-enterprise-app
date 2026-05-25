# Admin page migration — the CrudShell pattern

The 20+ admin pages (`/admin/users`, `/admin/roles`, `/admin/menus`, `/admin/codes`, …) all share an almost-identical structure:

```
<Title> + <Add button>
<Search/Filter row>
<DataGrid>
<Add/Edit Dialog (CrudDialog)>
```

Today they each re-implement this layout slightly differently. The migration plan: standardize on **PageHeader + DataShell + DataGrid**.

## The new pattern (apply to every admin page)

```tsx
'use client';
import { useState } from 'react';
import { DataGridPremium } from '@mui/x-data-grid-premium';
import { Button, Tabs, Tab, TextField } from '@mui/material';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PageHeader from '@/components/common/PageHeader';
import DataShell from '@/components/common/DataShell';

export default function UsersPage() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  return (
    <AuthenticatedLayout fullBleed>
      <Box sx={{ px: 4, py: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <PageHeader
          breadcrumb={['Admin', '사용자']}
          title="사용자 관리"
          subtitle="역할 매핑, 부서 이동, 권한 회수"
          kpis={[
            { label: 'total', value: 248 },
            { label: 'active', value: 231, tone: 'success' },
            { label: 'suspended', value: 17, tone: 'danger' },
          ]}
          meta="UPDATED 14:08 KST"
          actions={
            <>
              <Button variant="outlined">Export</Button>
              <Button variant="contained">+ 추가</Button>
            </>
          }
        />

        <DataShell
          tabs={
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="전체" value="all" />
              <Tab label="활성" value="active" />
              <Tab label="정지" value="suspended" />
              <Tab label="대기" value="pending" />
            </Tabs>
          }
          toolbar={
            <>
              <TextField
                size="small"
                placeholder="사용자명 / 이메일 / ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: 280 }}
              />
              {/* extra filter chips, density toggle, column visibility ... */}
            </>
          }
        >
          <DataGridPremium
            rows={users}
            columns={columns}
            density="compact"
            // no border / radius — DataShell wraps it
          />
        </DataShell>
      </Box>
    </AuthenticatedLayout>
  );
}
```

## Per-page checklist

For each of these files, apply the pattern above:

- `src/app/[locale]/admin/users/page.tsx`
- `src/app/[locale]/admin/roles/page.tsx`
- `src/app/[locale]/admin/menus/page.tsx`
- `src/app/[locale]/admin/codes/page.tsx`
- `src/app/[locale]/admin/departments/page.tsx`
- `src/app/[locale]/admin/programs/page.tsx`
- `src/app/[locale]/admin/messages/page.tsx`
- `src/app/[locale]/admin/boards/page.tsx`
- `src/app/[locale]/admin/posts/page.tsx`
- `src/app/[locale]/admin/help/page.tsx`
- `src/app/[locale]/admin/logs/page.tsx`
- `src/app/[locale]/admin/mail/page.tsx`
- `src/app/[locale]/admin/app-settings/page.tsx`
- + any other CRUD-style admin pages

## Column type guidance

DataGrid columns should follow these rules in the new system:

| Data | Column config | Rationale |
|---|---|---|
| Numeric (counts, amounts, IDs) | `type: 'number'`, `align: 'right'`, header `align: 'right'` | Tabular nums right-align makes scanning columns trivial |
| Status (active/inactive/pending) | `renderCell` with a dot-prefix label, no chip | Chips add visual weight; a colored dot + text is quieter |
| Role | `renderCell` returning small `<Box>` colored by `theme.palette.role[role]` | Lifts the existing role token from palette |
| Date/time | `valueFormatter` → `YYYY-MM-DD HH:mm`, mono font | Sortable, scannable |
| Actions | `type: 'actions'`, icons only, single row | No labels — context is the row |

## Status indicator helper

Create `src/components/common/StatusDot.tsx`:

```tsx
'use client';
import { Box, Typography, useTheme } from '@mui/material';

type Status = 'active' | 'inactive' | 'pending' | 'suspended';

export default function StatusDot({ status, label }: { status: Status; label?: string }) {
  const theme = useTheme();
  const colorMap = {
    active: (theme.palette as any).status?.success,
    inactive: (theme.palette as any).status?.neutral,
    pending: (theme.palette as any).status?.warning,
    suspended: (theme.palette as any).status?.error,
  };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ width: 6, height: 6, bgcolor: colorMap[status], borderRadius: '50%' }} />
      <Typography variant="caption" color="text.secondary">
        {label ?? status}
      </Typography>
    </Box>
  );
}
```

## Dialog (CrudDialog) update

The existing `common/CrudDialog` should:
- Use `Dialog` with `maxWidth="sm"` for narrow forms, `maxWidth="md"` for wider
- Title via `<DialogTitle>` (theme-styled — see components.ts)
- Content uses `<Stack spacing={2}>` of `TextField`s
- Actions bar: cancel (text variant) on left, confirm (contained) on right
- Destructive variant: confirm button gets `color="error"` and a one-second confirmation delay

No structural change to the component is required — the theme overrides automatically apply.
