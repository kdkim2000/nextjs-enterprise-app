# useHelp Hook Usage Guide

## Overview

The `useHelp` hook is a centralized solution for managing help content functionality across all admin pages. It eliminates code duplication and provides consistent help button behavior.

## Key Features

1. **Automatic Help Detection**: Automatically checks if help content exists for a program
2. **Permission-Based Access**: Shows help button based on user role and permissions
3. **Unified State Management**: Manages help dialog state in one place
4. **Navigation Support**: Provides navigation to help edit page for content creation
5. **Zero Configuration**: Works with minimal setup

## Help Button Display Logic

The help button will be shown if **ANY** of the following conditions are met:

- User is **admin** (`role === 'admin'`)
- User has **update permission** for `PROG-HELP-MGMT` (help management program)
- Help content **exists** for the current program

This ensures that:
- Admins can always access help management, even if content doesn't exist
- Help managers can create/edit help content
- Regular users see the help button only when content is available

## Click Behavior

When the help button is clicked:

1. **If help content exists**: Opens the help viewer dialog
2. **If no content exists AND user is admin/manager**: Navigates to help edit page
3. **Fallback**: Opens the help viewer (which will show an empty state)

## Basic Usage

### Option 1: Using `useHelp` (Full Control)

```tsx
import { useHelp } from '@/hooks/useHelp';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';

export default function MyAdminPage() {
  // Use the help hook
  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    navigateToHelpEdit,
    language
  } = useHelp({ programId: 'PROG-USER-LIST' });

  return (
    <StandardCrudPageLayout
      programId="PROG-USER-LIST"
      helpOpen={helpOpen}
      onHelpOpenChange={setHelpOpen}
      isAdmin={isAdmin}
      helpExists={helpExists}
      canManageHelp={canManageHelp}
      onHelpEdit={navigateToHelpEdit}
      language={language}
    >
      {/* Your page content */}
    </StandardCrudPageLayout>
  );
}
```

### Option 2: Using `useHelpButton` (Simplified)

```tsx
import { useHelpButton } from '@/hooks/useHelp';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';

export default function MyAdminPage() {
  // Get all help props in one object
  const helpProps = useHelpButton({ programId: 'PROG-USER-LIST' });

  return (
    <StandardCrudPageLayout
      {...helpProps}
      // other props
    >
      {/* Your page content */}
    </StandardCrudPageLayout>
  );
}
```

## Migration Guide

### Before (Old Pattern)

Each page had to manually manage help state:

```tsx
// ❌ OLD: Duplicated code in every page
const [helpOpen, setHelpOpen] = useState(false);
const [helpExists, setHelpExists] = useState(false);
const [isAdmin, setIsAdmin] = useState(false);

useEffect(() => {
  const checkHelpAndRole = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === 'admin');
      }

      try {
        const response = await api.get('/help?programId=PROG-USER-LIST&language=en');
        setHelpExists(!!response.help);
      } catch {
        setHelpExists(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setHelpExists(false);
    }
  };

  checkHelpAndRole();
}, []);

return (
  <StandardCrudPageLayout
    programId="PROG-USER-LIST"
    helpOpen={helpOpen}
    onHelpOpenChange={setHelpOpen}
    isAdmin={isAdmin}
    helpExists={helpExists}
    language="en"
  >
    ...
  </StandardCrudPageLayout>
);
```

### After (New Pattern)

```tsx
// ✅ NEW: Single line of code
const {
  helpOpen,
  setHelpOpen,
  helpExists,
  isAdmin,
  canManageHelp,
  navigateToHelpEdit,
  language
} = useHelp({ programId: 'PROG-USER-LIST' });

return (
  <StandardCrudPageLayout
    programId="PROG-USER-LIST"
    helpOpen={helpOpen}
    onHelpOpenChange={setHelpOpen}
    isAdmin={isAdmin}
    helpExists={helpExists}
    canManageHelp={canManageHelp}
    onHelpEdit={navigateToHelpEdit}
    language={language}
  >
    ...
  </StandardCrudPageLayout>
);
```

### Step-by-Step Migration

1. **Import the hook**:
   ```tsx
   import { useHelp } from '@/hooks/useHelp';
   ```

2. **Replace help-related state and useEffect**:
   Remove all help-related useState and useEffect blocks from your page/hook.

3. **Add useHelp hook**:
   ```tsx
   const {
     helpOpen,
     setHelpOpen,
     helpExists,
     isAdmin,
     canManageHelp,
     navigateToHelpEdit,
     language
   } = useHelp({ programId: 'YOUR-PROGRAM-ID' });
   ```

4. **Update StandardCrudPageLayout props**:
   Add the new props `canManageHelp` and `onHelpEdit`:
   ```tsx
   <StandardCrudPageLayout
     programId="YOUR-PROGRAM-ID"
     helpOpen={helpOpen}
     onHelpOpenChange={setHelpOpen}
     isAdmin={isAdmin}
     helpExists={helpExists}
     canManageHelp={canManageHelp}      // NEW
     onHelpEdit={navigateToHelpEdit}    // NEW
     language={language}
   >
   ```

5. **Remove help-related exports from custom hooks**:
   If you have a custom hook (like `useDepartmentManagement`), remove:
   - `helpOpen, setHelpOpen` state
   - `helpExists, isAdmin` state
   - `checkHelpAndRole` useEffect
   - These values from the return statement

## API Reference

### `useHelp(options)`

#### Parameters

```tsx
interface UseHelpOptions {
  programId: string;           // Required: Program ID (e.g., 'PROG-USER-LIST')
  autoCheck?: boolean;         // Optional: Auto-check help existence (default: true)
}
```

#### Return Value

```tsx
interface UseHelpReturn {
  helpOpen: boolean;                    // Help dialog open state
  setHelpOpen: (open: boolean) => void; // Set help dialog state
  helpExists: boolean;                  // Whether help content exists
  isAdmin: boolean;                     // Whether current user is admin
  canManageHelp: boolean;               // Whether user can manage help
  shouldShowHelpButton: boolean;        // Whether to show help button
  navigateToHelpEdit: () => void;       // Navigate to help edit page
  language: string;                     // Current language (from locale)
  loading: boolean;                     // Loading state
  refreshHelpStatus: () => Promise<void>; // Manually refresh help status
}
```

### `useHelpButton(options)`

Simplified hook that returns only the props needed for `StandardCrudPageLayout`.

#### Parameters

```tsx
interface UseHelpButtonOptions {
  programId: string;  // Required: Program ID
}
```

#### Return Value

```tsx
interface UseHelpButtonReturn {
  programId: string;
  helpOpen: boolean;
  onHelpOpenChange: (open: boolean) => void;
  helpExists: boolean;
  isAdmin: boolean;
  language: string;
}
```

## Advanced Usage

### Disable Auto-Check

```tsx
const help = useHelp({
  programId: 'PROG-USER-LIST',
  autoCheck: false  // Don't automatically check help existence
});

// Manually trigger check later
useEffect(() => {
  if (someCondition) {
    help.refreshHelpStatus();
  }
}, [someCondition]);
```

### Conditional Help Button

```tsx
const help = useHelp({ programId: 'PROG-USER-LIST' });

// Only show help button if certain condition is met
<StandardCrudPageLayout
  {...help.shouldShowHelpButton && someCondition ? {
    programId: 'PROG-USER-LIST',
    helpOpen: help.helpOpen,
    onHelpOpenChange: help.setHelpOpen,
    // ... other help props
  } : {}}
>
```

### Loading State

```tsx
const { loading, helpExists } = useHelp({ programId: 'PROG-USER-LIST' });

if (loading) {
  return <LoadingSpinner />;
}

// Now you can safely use helpExists
```

## Best Practices

1. **Always use programId**: Make sure the programId matches the program code in your database
2. **Don't duplicate**: Remove all help-related code from individual pages/hooks
3. **Consistent naming**: Use the returned values directly, don't rename them
4. **Language support**: Use the `language` value from the hook instead of hardcoding
5. **Update StandardCrudPageLayout**: Always include the new `canManageHelp` and `onHelpEdit` props

## Troubleshooting

### Help button not showing

1. Check if help content exists in database:
   ```sql
   SELECT * FROM help WHERE program_id = 'YOUR-PROGRAM-ID' AND status = 'published';
   ```

2. Verify user permissions:
   - Is user an admin?
   - Does user have 'update' permission for 'PROG-HELP-MGMT'?

3. Check browser console for errors

### Help content not loading

1. Verify API is accessible: `/api/help?programId=YOUR-PROGRAM-ID&language=en`
2. Check network tab for failed requests
3. Ensure help content status is 'published', not 'active' or 'draft'

### Navigation not working

1. Ensure `onHelpEdit` prop is passed to `StandardCrudPageLayout`
2. Check if help edit page exists at: `/[locale]/admin/help`
3. Verify router is available (component must be client component with 'use client')

## Examples

See the following files for complete examples:
- `/src/app/[locale]/admin/departments/page.tsx` - Migrated to use `useHelp`
- `/src/app/[locale]/admin/users/page.tsx` - Example with `useHelpButton`
- `/src/hooks/useHelp.ts` - Hook implementation

## Related Documentation

- [Standard Page Pattern](./STANDARD_PAGE_PATTERN.md)
- [Permission System Guide](./PERMISSION_USAGE.md)
- [Help System Overview](./HELP_SYSTEM.md)
