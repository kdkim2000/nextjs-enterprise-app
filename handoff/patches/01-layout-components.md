# Layout component patches

Three existing layout files need targeted edits — they're not full rewrites because the structure is sound, but specific blocks contradict the new design system.

---

## 1. `src/components/layout/Sidebar/index.tsx`

### Problems identified in the current file

| Line | Issue | Fix |
|---|---|---|
| 13 | `DRAWER_WIDTH = 280` | → `256` (read from `tokens.layout.sidebarExpanded`) |
| 14 | `DRAWER_WIDTH_COLLAPSED = 72` | → `64` |
| 195–212 | `'&.Mui-selected': { backgroundColor: 'primary.main', color: 'primary.contrastText', ... }` — the active menu item is a **solid blue fill**, visually dominating the sidebar | Remove. The new `MuiListItemButton` override in `theme/components.ts` handles selected state as a subtle accent tint + 2px left rule. Delete the `sx` block entirely or strip the `Mui-selected` rules. |
| 230 | `fontSize: level === 0 ? '0.95rem' : '0.9rem'` | Read from theme: `theme.typography.body2.fontSize` |
| 261 | Tabs section uses bottom `borderBottom: 1` | OK, keep — matches new theme |
| 387 | `backgroundColor: 'background.default'` | → `'surface.sunken'` (new token; falls back to default if undefined) |

### Diff

Replace the whole `ListItemButton sx` prop in `renderMenu` (lines ~190–222) with:

```tsx
<ListItemButton
  selected={isActive}
  onClick={() => handleMenuClick(menu)}
  sx={{
    mx: 1,
    my: 0.25,
    minHeight: 36,
    justifyContent: expanded ? 'initial' : 'center',
    // selected state styling now lives in theme/components.ts → MuiListItemButton
  }}
>
  <ListItemIcon
    sx={{
      minWidth: 32,
      justifyContent: 'center',
      // color cascades from selected state in theme
    }}
  >
    {icon}
  </ListItemIcon>
  {expanded && (
    <>
      <ListItemText
        primary={getMenuName(menu)}
        primaryTypographyProps={{
          fontSize: '0.875rem',
          fontWeight: level === 0 ? 500 : 400,
        }}
      />
      {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
    </>
  )}
</ListItemButton>
```

Then change the DRAWER width constants at the top of the file:

```tsx
import { tokens } from '@/theme';
const DRAWER_WIDTH = tokens.layout.sidebarExpanded;       // 256
const DRAWER_WIDTH_COLLAPSED = tokens.layout.sidebarCollapsed; // 64
```

And the Drawer `paper` sx (lines ~376–399), change `backgroundColor: 'background.default'` to:

```tsx
backgroundColor: 'surface.sunken',
```

Also add a brand row at the top of `drawerContent` (above the Tabs box) to give the sidebar a clear identity zone — see PageHeader patterns in the deck for the dot+wordmark composition.

---

## 2. `src/components/layout/DashboardHeader/index.tsx`

### Problems identified

| Line | Issue | Fix |
|---|---|---|
| 134 | `<AppBar position="static" elevation={1}>` — full bleed MUI primary blue background | Remove `elevation={1}`. The MuiAppBar override in `theme/components.ts` now sets a transparent/neutral background. |
| 137 | `<Toolbar>` (no sizing) | OK — MuiToolbar override sets minHeight=56 |
| 150 | `<Typography variant="h6" component="div">` for app name | Change to `variant="subtitle1"` with `fontWeight: 600` — h6 is now smaller in the new scale |
| 168 | `bgcolor: 'secondary.main'` on avatar — secondary is now slate blue (was MUI purple #9c27b0) | OK as-is, but consider `bgcolor: 'primary.dark'` for a more distinct avatar tone, or use the role color from `palette.role[user.role]` |
| 160–172 | User chip hover uses `rgba(255,255,255,0.1)` — assumed AppBar was dark. Now AppBar is light, so this hover is invisible | Change to `'action.hover'` |

### Diff (key changes)

```tsx
// Before (line ~134):
<AppBar position="static" elevation={1} sx={{ zIndex: ... }}>

// After:
<AppBar position="static" sx={{ zIndex: theme => theme.zIndex.drawer + 1, flexShrink: 0 }}>
  {/* elevation removed — MuiAppBar override handles the hairline border */}
```

```tsx
// Before (line ~150):
<Typography variant="h6" component="div">{appName}</Typography>

// After:
<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{appName}</Typography>
```

```tsx
// Before (line ~160):
sx={{
  ...
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
}}

// After:
sx={{
  ...
  '&:hover': { backgroundColor: 'action.hover' }
}}
```

Optional: add a breadcrumb-style page label slot to the right of the app name. Most pages set their own title in `PageHeader`, so the header can stay minimal.

---

## 3. `src/components/layout/AuthenticatedLayout/index.tsx`

### Problems identified

This file is small and structurally correct. Two minor adjustments only:

| Line | Issue | Fix |
|---|---|---|
| 78 | `<Box component="main" ...>` and the wrapper inside use `px: 2, py: 2` (16px) | Increase to `px: 3, py: 3` (24px) for slightly more breathing room — admin pages are dense enough that 16px feels cramped |
| 56 | Loading state: `<Typography>Loading...</Typography>` | Replace with a small centered spinner — most users see this on first nav |

### Diff

```tsx
// Loading view (line ~52):
if (shouldShowLoading) {
  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
      <CircularProgress size={28} thickness={3} />
      <Typography variant="caption" color="text.tertiary" sx={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        loading
      </Typography>
    </Box>
  );
}
```

Default-mode wrapper (line ~92):
```tsx
// Before:
<Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 2, py: 2 }}>

// After:
<Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 3, py: 3, bgcolor: 'background.default' }}>
```

The `bgcolor: 'background.default'` ensures the content area uses the bg token even on devices that don't honor the body bg correctly.

---

## 4. `src/components/layout/DashboardFooter/index.tsx`

Not read in detail, but apply same principles:
- Remove any explicit `backgroundColor` / `borderTop` colors → use `divider` / `background.paper`
- Use `Typography variant="caption"` for footer text, color `text.tertiary`
- Remove drop shadows

---

## Mobile components

`MobileDrawer/`, `MobileHeader/`, `MobileBottomNavigation/`, `MobileLayout/` should be folded into the same `AuthenticatedLayout` using MUI breakpoints. Current pattern duplicates the navigation tree in two places. Migration is Phase 3.
