'use client';

import { useRef, useCallback, useEffect } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PrefetchOptions {
  cacheTime?: number; // Cache duration in ms (default: 5 minutes)
  staleTime?: number; // Time before data is considered stale (default: 30 seconds)
}

// Global cache for prefetched data
const prefetchCache = new Map<string, CacheEntry<unknown>>();

/**
 * Hook for prefetching data before it's needed
 * Useful for preloading data on hover or route prefetching
 */
export function usePrefetch<T>(options: PrefetchOptions = {}) {
  const { cacheTime = 5 * 60 * 1000, staleTime = 30 * 1000 } = options;
  const pendingRequests = useRef<Map<string, Promise<T>>>(new Map());

  // Cleanup expired cache entries periodically
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      for (const [key, entry] of prefetchCache.entries()) {
        if (entry.expiresAt < now) {
          prefetchCache.delete(key);
        }
      }
    };

    const interval = setInterval(cleanup, 60 * 1000); // Run every minute
    return () => clearInterval(interval);
  }, []);

  /**
   * Prefetch data and store in cache
   */
  const prefetch = useCallback(
    async (key: string, fetcher: () => Promise<T>): Promise<T | null> => {
      // Check if already cached and not expired
      const cached = prefetchCache.get(key) as CacheEntry<T> | undefined;
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }

      // Check if request is already in progress
      const pending = pendingRequests.current.get(key);
      if (pending) {
        return pending;
      }

      try {
        // Start fetching
        const promise = fetcher();
        pendingRequests.current.set(key, promise);

        const data = await promise;

        // Store in cache
        const now = Date.now();
        prefetchCache.set(key, {
          data,
          timestamp: now,
          expiresAt: now + cacheTime,
        });

        return data;
      } catch (error) {
        console.error('Prefetch failed:', key, error);
        return null;
      } finally {
        pendingRequests.current.delete(key);
      }
    },
    [cacheTime]
  );

  /**
   * Get cached data if available
   */
  const getCached = useCallback((key: string): T | null => {
    const cached = prefetchCache.get(key) as CacheEntry<T> | undefined;
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    return null;
  }, []);

  /**
   * Check if cached data is stale
   */
  const isStale = useCallback(
    (key: string): boolean => {
      const cached = prefetchCache.get(key) as CacheEntry<T> | undefined;
      if (!cached) return true;
      return Date.now() - cached.timestamp > staleTime;
    },
    [staleTime]
  );

  /**
   * Invalidate cached data
   */
  const invalidate = useCallback((key: string): void => {
    prefetchCache.delete(key);
  }, []);

  /**
   * Invalidate all cached data matching a pattern
   */
  const invalidatePattern = useCallback((pattern: RegExp): void => {
    for (const key of prefetchCache.keys()) {
      if (pattern.test(key)) {
        prefetchCache.delete(key);
      }
    }
  }, []);

  /**
   * Clear all cached data
   */
  const clearAll = useCallback((): void => {
    prefetchCache.clear();
  }, []);

  return {
    prefetch,
    getCached,
    isStale,
    invalidate,
    invalidatePattern,
    clearAll,
  };
}

/**
 * Hook for prefetching on element hover
 */
export function usePrefetchOnHover<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: PrefetchOptions = {}
) {
  const { prefetch, getCached, isStale } = usePrefetch<T>(options);
  const prefetchedRef = useRef(false);

  const onMouseEnter = useCallback(() => {
    if (!prefetchedRef.current && (isStale(key) || !getCached(key))) {
      prefetch(key, fetcher);
      prefetchedRef.current = true;
    }
  }, [key, fetcher, prefetch, getCached, isStale]);

  // Reset on key change
  useEffect(() => {
    prefetchedRef.current = false;
  }, [key]);

  return {
    onMouseEnter,
    getCached: () => getCached(key),
  };
}

export default usePrefetch;
