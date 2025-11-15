'use client';

import { useMenuContext } from '@/contexts/MenuContext';
import { useCurrentLocale } from '@/lib/i18n/client';

/**
 * Hook to access menu data from MenuContext
 * This is a wrapper around useMenuContext for backward compatibility
 */
export function useMenu() {
  const locale = useCurrentLocale();
  const menuContext = useMenuContext();

  return {
    ...menuContext,
    locale
  };
}
