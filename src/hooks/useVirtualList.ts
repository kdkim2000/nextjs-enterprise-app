'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export interface VirtualListOptions {
  itemHeight: number;
  overscan?: number;
  containerHeight?: number;
}

export interface VirtualListItem<T> {
  index: number;
  data: T;
  style: React.CSSProperties;
}

export interface VirtualListResult<T> {
  virtualItems: VirtualListItem<T>[];
  totalHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
}

/**
 * Virtual list hook for rendering large lists efficiently
 * Only renders items that are visible in the viewport
 */
export function useVirtualList<T>(
  items: T[],
  options: VirtualListOptions
): VirtualListResult<T> {
  const { itemHeight, overscan = 3 } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(options.containerHeight || 400);

  // Calculate total height
  const totalHeight = items.length * itemHeight;

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);

    // Add scroll listener
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Calculate visible range
  const { startIndex, endIndex } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);

    return { startIndex: start, endIndex: end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Generate virtual items
  const virtualItems = useMemo(() => {
    const result: VirtualListItem<T>[] = [];

    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        index: i,
        data: items[i],
        style: {
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          width: '100%',
          height: itemHeight,
        },
      });
    }

    return result;
  }, [items, startIndex, endIndex, itemHeight]);

  // Scroll to index
  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      if (containerRef.current) {
        const targetTop = index * itemHeight;
        containerRef.current.scrollTo({
          top: targetTop,
          behavior,
        });
      }
    },
    [itemHeight]
  );

  return {
    virtualItems,
    totalHeight,
    containerRef,
    scrollToIndex,
  };
}

export default useVirtualList;
