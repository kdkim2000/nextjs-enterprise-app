import { useState, useEffect } from 'react';

export interface PageState<TCriteria = Record<string, any>, TData = any> {
  searchCriteria: TCriteria;
  paginationModel?: { page: number; pageSize: number };
  quickSearch: string;
  data?: TData[];
  rowCount?: number;
}

export interface UsePageStateOptions<TCriteria, _TData = any> {
  storageKey: string;
  initialCriteria: TCriteria;
  initialPaginationModel?: { page: number; pageSize: number };
}

/**
 * Hook for managing page state with session storage persistence
 * Automatically saves and restores page state including search criteria,
 * pagination, and data
 */
export function usePageState<TCriteria = Record<string, any>, TData = any>(
  options: UsePageStateOptions<TCriteria, TData>
) {
  const { storageKey, initialCriteria, initialPaginationModel } = options;

  // Load saved state on mount
  const loadSavedState = (): PageState<TCriteria, TData> | null => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load page state:', error);
      return null;
    }
  };

  const savedState = loadSavedState();

  const [searchCriteria, setSearchCriteria] = useState<TCriteria>(
    savedState?.searchCriteria || initialCriteria
  );
  const [paginationModel, setPaginationModel] = useState(
    savedState?.paginationModel || initialPaginationModel || { page: 0, pageSize: 50 }
  );
  const [quickSearch, setQuickSearch] = useState(savedState?.quickSearch || '');
  const [data, setData] = useState<TData[]>(savedState?.data || []);
  const [rowCount, setRowCount] = useState(savedState?.rowCount || 0);

  // Save page state whenever it changes
  useEffect(() => {
    const state: PageState<TCriteria, TData> = {
      searchCriteria,
      paginationModel,
      quickSearch,
      data,
      rowCount
    };

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save page state:', error);
    }
  }, [storageKey, searchCriteria, paginationModel, quickSearch, data, rowCount]);

  const clearPageState = () => {
    try {
      sessionStorage.removeItem(storageKey);
      setSearchCriteria(initialCriteria);
      setPaginationModel(initialPaginationModel || { page: 0, pageSize: 50 });
      setQuickSearch('');
      setData([]);
      setRowCount(0);
    } catch (error) {
      console.error('Failed to clear page state:', error);
    }
  };

  return {
    searchCriteria,
    setSearchCriteria,
    paginationModel,
    setPaginationModel,
    quickSearch,
    setQuickSearch,
    data,
    setData,
    rowCount,
    setRowCount,
    clearPageState,
    hasSavedState: savedState !== null
  };
}
