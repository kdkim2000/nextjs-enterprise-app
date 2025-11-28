import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import { useCurrentLocale } from '@/lib/i18n/client';
import { usePermissionControl } from './usePermissionControl';

interface UseHelpOptions {
  programId: string;
  /** Enable automatic help content checking (default: true) */
  autoCheck?: boolean;
}

interface UseHelpReturn {
  /** Whether help dialog is open */
  helpOpen: boolean;
  /** Set help dialog open state */
  setHelpOpen: (open: boolean) => void;
  /** Whether help content exists for this program */
  helpExists: boolean;
  /** Whether current user is admin */
  isAdmin: boolean;
  /** Whether current user has update permission for help content */
  canManageHelp: boolean;
  /** Whether help button should be shown (admin, help manager, or help exists) */
  shouldShowHelpButton: boolean;
  /** Navigate to help edit page */
  navigateToHelpEdit: () => void;
  /** Current language */
  language: string;
  /** Loading state */
  loading: boolean;
  /** Refresh help existence status */
  refreshHelpStatus: () => Promise<void>;
}

/**
 * useHelp - Centralized hook for managing help content state
 *
 * This hook handles:
 * - Checking if help content exists for a program
 * - Determining if current user can manage help content
 * - Managing help dialog open/close state
 * - Navigation to help edit page
 *
 * The help button will be shown if:
 * - User is admin, OR
 * - User has 'update' permission for help management program (PROG-HELP-MGMT), OR
 * - Help content exists for the program
 *
 * @example
 * ```tsx
 * function MyPage() {
 *   const {
 *     helpOpen,
 *     setHelpOpen,
 *     shouldShowHelpButton,
 *     language,
 *     isAdmin,
 *     helpExists,
 *     canManageHelp
 *   } = useHelp({ programId: 'PROG-USER-LIST' });
 *
 *   return (
 *     <StandardCrudPageLayout
 *       programId="PROG-USER-LIST"
 *       helpOpen={helpOpen}
 *       onHelpOpenChange={setHelpOpen}
 *       isAdmin={isAdmin}
 *       helpExists={helpExists}
 *       language={language}
 *     >
 *       ...
 *     </StandardCrudPageLayout>
 *   );
 * }
 * ```
 */
export function useHelp({ programId, autoCheck = true }: UseHelpOptions): UseHelpReturn {
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpExists, setHelpExists] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const locale = useCurrentLocale();
  const router = useRouter();

  // Check if user has permission to manage help content
  const { canUpdate: canManageHelp } = usePermissionControl('PROG-HELP-MGMT');

  // Check if help content exists and user role
  const checkHelpStatus = useCallback(async () => {
    if (!autoCheck || !programId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check if user is admin
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === 'admin');
      }

      // Check if help content exists for this program
      try {
        const response = await api.get(`/help?programId=${programId}&language=${locale}`);
        setHelpExists(!!response.help);
      } catch {
        // If API returns 404 or error, help doesn't exist
        setHelpExists(false);
      }
    } catch (error) {
      console.error('Error checking help status:', error);
      setHelpExists(false);
    } finally {
      setLoading(false);
    }
  }, [programId, locale, autoCheck]);

  // Initial check on mount
  useEffect(() => {
    checkHelpStatus();
  }, [checkHelpStatus]);

  // Navigate to help edit page
  const navigateToHelpEdit = useCallback(() => {
    const currentLanguage = locale || 'en';
    router.push(`/${currentLanguage}/admin/help?programId=${programId}&action=edit`);
  }, [programId, locale, router]);

  // Determine if help button should be shown
  const shouldShowHelpButton = isAdmin || canManageHelp || helpExists;

  return {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    canManageHelp,
    shouldShowHelpButton,
    navigateToHelpEdit,
    language: locale,
    loading,
    refreshHelpStatus: checkHelpStatus
  };
}

/**
 * useHelpButton - Simplified hook that only returns props for StandardCrudPageLayout
 *
 * This is a convenience wrapper around useHelp that returns only the props
 * needed for StandardCrudPageLayout component.
 *
 * @example
 * ```tsx
 * function MyPage() {
 *   const helpProps = useHelpButton({ programId: 'PROG-USER-LIST' });
 *
 *   return (
 *     <StandardCrudPageLayout
 *       {...helpProps}
 *       // other props
 *     >
 *       ...
 *     </StandardCrudPageLayout>
 *   );
 * }
 * ```
 */
export function useHelpButton({ programId }: { programId: string }) {
  const {
    helpOpen,
    setHelpOpen,
    helpExists,
    isAdmin,
    language
  } = useHelp({ programId });

  return {
    programId,
    helpOpen,
    onHelpOpenChange: setHelpOpen,
    helpExists,
    isAdmin,
    language
  };
}
