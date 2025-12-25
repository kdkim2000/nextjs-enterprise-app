'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

export interface SearchCriteria {
  [key: string]: string | number | boolean | undefined;
}

export interface UseInspectionSearchOptions<T extends SearchCriteria> {
  initialCriteria: T;
  debounceMs?: number;
  onSearch?: (criteria: T) => void;
}

export interface UseInspectionSearchResult<T extends SearchCriteria> {
  // Quick search
  quickSearch: string;
  setQuickSearch: (value: string) => void;
  debouncedQuickSearch: string;

  // Advanced search
  searchCriteria: T;
  setSearchCriteria: React.Dispatch<React.SetStateAction<T>>;

  // Filter panel
  advancedFilterOpen: boolean;
  setAdvancedFilterOpen: (open: boolean) => void;

  // Counts
  activeFilterCount: number;

  // Handlers
  handleSearchChange: (field: keyof T, value: T[keyof T]) => void;
  handleQuickSearch: () => void;
  handleQuickSearchClear: () => void;
  handleAdvancedFilterApply: () => void;
  handleAdvancedFilterClose: () => void;
  handleResetFilters: () => void;

  // Utilities
  hasActiveFilters: boolean;
  getSearchParams: () => URLSearchParams;
}

/**
 * Reusable hook for inspection search/filter functionality
 * Encapsulates common search state and handlers
 */
export function useInspectionSearch<T extends SearchCriteria>(
  options: UseInspectionSearchOptions<T>
): UseInspectionSearchResult<T> {
  const { initialCriteria, debounceMs = 300, onSearch } = options;

  // Quick search state
  const [quickSearch, setQuickSearch] = useState('');
  const debouncedQuickSearch = useDebounce(quickSearch, debounceMs);

  // Advanced search state
  const [searchCriteria, setSearchCriteria] = useState<T>(initialCriteria);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);

  // Calculate active filter count (excluding empty values)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    for (const [key, value] of Object.entries(searchCriteria)) {
      // Skip certain fields that shouldn't count
      if (key === 'page' || key === 'pageSize' || key === 'sortBy' || key === 'sortOrder') {
        continue;
      }
      if (value !== undefined && value !== null && value !== '') {
        count++;
      }
    }
    return count;
  }, [searchCriteria]);

  // Handle individual field change
  const handleSearchChange = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      setSearchCriteria((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // Handle quick search execution
  const handleQuickSearch = useCallback(() => {
    if (onSearch) {
      onSearch({
        ...searchCriteria,
        quickSearch: debouncedQuickSearch,
      } as T);
    }
  }, [searchCriteria, debouncedQuickSearch, onSearch]);

  // Clear quick search
  const handleQuickSearchClear = useCallback(() => {
    setQuickSearch('');
    if (onSearch) {
      onSearch({
        ...searchCriteria,
        quickSearch: '',
      } as T);
    }
  }, [searchCriteria, onSearch]);

  // Apply advanced filters
  const handleAdvancedFilterApply = useCallback(() => {
    setAdvancedFilterOpen(false);
    if (onSearch) {
      onSearch(searchCriteria);
    }
  }, [searchCriteria, onSearch]);

  // Close advanced filter panel
  const handleAdvancedFilterClose = useCallback(() => {
    setAdvancedFilterOpen(false);
  }, []);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setQuickSearch('');
    setSearchCriteria(initialCriteria);
    if (onSearch) {
      onSearch(initialCriteria);
    }
  }, [initialCriteria, onSearch]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return activeFilterCount > 0 || quickSearch.length > 0;
  }, [activeFilterCount, quickSearch]);

  // Convert criteria to URL search params
  const getSearchParams = useCallback(() => {
    const params = new URLSearchParams();

    if (quickSearch) {
      params.set('q', quickSearch);
    }

    for (const [key, value] of Object.entries(searchCriteria)) {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    }

    return params;
  }, [quickSearch, searchCriteria]);

  return {
    quickSearch,
    setQuickSearch,
    debouncedQuickSearch,
    searchCriteria,
    setSearchCriteria,
    advancedFilterOpen,
    setAdvancedFilterOpen,
    activeFilterCount,
    handleSearchChange,
    handleQuickSearch,
    handleQuickSearchClear,
    handleAdvancedFilterApply,
    handleAdvancedFilterClose,
    handleResetFilters,
    hasActiveFilters,
    getSearchParams,
  };
}

export default useInspectionSearch;
