'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useMenu } from './useMenu';

interface UseProgramIdOptions {
  fallback?: string;
}

interface UseProgramIdReturn {
  programId: string | null;
  isLoading: boolean;
  currentMenu: ReturnType<typeof useMenu>['currentMenu'];
}

/**
 * Hook to get programId from current menu (DB-based)
 *
 * This hook fetches the menu information for the current path from the database
 * and returns the programId associated with it.
 *
 * @param options.fallback - Optional fallback programId if menu is not found
 * @returns { programId, isLoading, currentMenu }
 *
 * @example
 * ```tsx
 * const { programId, isLoading } = useProgramId();
 * // or with fallback
 * const { programId } = useProgramId({ fallback: 'PROG-DEFAULT' });
 * ```
 */
export function useProgramId(options: UseProgramIdOptions = {}): UseProgramIdReturn {
  const { fallback } = options;
  const pathname = usePathname();
  const { getMenuByPath, currentMenu, locale } = useMenu();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      if (pathname) {
        setIsLoading(true);
        try {
          // Remove locale prefix from pathname
          const cleanPath = pathname.replace(`/${locale}`, '');
          await getMenuByPath(cleanPath);
        } catch (error) {
          console.error('[useProgramId] Error fetching menu:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    void fetchMenu();
  }, [pathname, locale, getMenuByPath]);

  // Return programId from currentMenu or fallback
  const programId = currentMenu?.programId || fallback || null;

  return {
    programId,
    isLoading,
    currentMenu
  };
}

export default useProgramId;
