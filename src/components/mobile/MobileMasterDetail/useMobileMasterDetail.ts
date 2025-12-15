'use client';

import { useState, useCallback } from 'react';
import { MasterDetailView, UseMobileMasterDetailReturn } from './types';

/**
 * Custom hook for managing MobileMasterDetail state
 *
 * @example
 * ```tsx
 * const {
 *   view,
 *   setView,
 *   selectedMaster,
 *   selectMaster,
 *   goBack,
 *   clearSelection
 * } = useMobileMasterDetail<CodeType>();
 *
 * // In master list item click handler
 * const handleCodeTypeClick = (codeType: CodeType) => {
 *   selectMaster(codeType); // Automatically navigates to detail view
 * };
 *
 * // Use selectedMaster to fetch detail data
 * useEffect(() => {
 *   if (selectedMaster) {
 *     fetchCodes(selectedMaster.code);
 *   }
 * }, [selectedMaster]);
 * ```
 */
export function useMobileMasterDetail<TMaster>(
  initialView: MasterDetailView = 'master'
): UseMobileMasterDetailReturn<TMaster> {
  const [view, setView] = useState<MasterDetailView>(initialView);
  const [selectedMaster, setSelectedMaster] = useState<TMaster | null>(null);

  /**
   * Select a master item and navigate to detail view
   */
  const selectMaster = useCallback((item: TMaster) => {
    setSelectedMaster(item);
    setView('detail');
  }, []);

  /**
   * Go back to master view (keeps selection)
   */
  const goBack = useCallback(() => {
    setView('master');
  }, []);

  /**
   * Clear selection and go back to master view
   */
  const clearSelection = useCallback(() => {
    setSelectedMaster(null);
    setView('master');
  }, []);

  return {
    view,
    setView,
    selectedMaster,
    selectMaster,
    goBack,
    clearSelection,
  };
}
