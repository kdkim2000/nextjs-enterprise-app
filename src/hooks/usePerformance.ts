'use client';

import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  slowRenders: number;
  mountTime?: number;
}

interface PerformanceOptions {
  slowThreshold?: number; // ms, renders slower than this are counted as slow
  logSlowRenders?: boolean;
  trackMountTime?: boolean;
}

// Global metrics store
const metricsStore = new Map<string, PerformanceMetrics>();

/**
 * Hook for monitoring component performance
 * Tracks render counts, render times, and slow renders
 */
export function usePerformance(
  componentName: string,
  options: PerformanceOptions = {}
) {
  const { slowThreshold = 16, logSlowRenders = false, trackMountTime = true } = options;

  const renderCountRef = useRef(0);
  const renderStartRef = useRef<number>(0);
  const renderTimesRef = useRef<number[]>([]);
  const mountTimeRef = useRef<number | undefined>(undefined);

  // Track mount time
  useEffect(() => {
    if (trackMountTime) {
      mountTimeRef.current = performance.now();
    }
  }, [trackMountTime]);

  // Track render start
  useLayoutEffect(() => {
    renderStartRef.current = performance.now();
    renderCountRef.current += 1;
  });

  // Track render end and update metrics
  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current;
    renderTimesRef.current.push(renderTime);

    // Keep only last 100 render times
    if (renderTimesRef.current.length > 100) {
      renderTimesRef.current = renderTimesRef.current.slice(-100);
    }

    // Calculate average
    const avgRenderTime =
      renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;

    // Count slow renders
    const slowRenders = renderTimesRef.current.filter((t) => t > slowThreshold).length;

    // Update metrics
    const metrics: PerformanceMetrics = {
      componentName,
      renderCount: renderCountRef.current,
      averageRenderTime: Math.round(avgRenderTime * 100) / 100,
      lastRenderTime: Math.round(renderTime * 100) / 100,
      slowRenders,
      mountTime: mountTimeRef.current,
    };

    metricsStore.set(componentName, metrics);

    // Log slow renders if enabled
    if (logSlowRenders && renderTime > slowThreshold) {
      console.warn(
        `[Performance] Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
      );
    }
  });

  return null;
}

/**
 * Hook for tracking function execution time
 */
export function useTrackTime() {
  const track = useCallback(<T>(name: string, fn: () => T): T => {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    if (duration > 16) {
      console.warn(`[Performance] Slow operation "${name}": ${duration.toFixed(2)}ms`);
    }

    return result;
  }, []);

  const trackAsync = useCallback(async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    if (duration > 100) {
      console.warn(`[Performance] Slow async operation "${name}": ${duration.toFixed(2)}ms`);
    }

    return result;
  }, []);

  return { track, trackAsync };
}

/**
 * Get all performance metrics
 */
export function getPerformanceMetrics(): Map<string, PerformanceMetrics> {
  return new Map(metricsStore);
}

/**
 * Get metrics for a specific component
 */
export function getComponentMetrics(componentName: string): PerformanceMetrics | undefined {
  return metricsStore.get(componentName);
}

/**
 * Clear all metrics
 */
export function clearPerformanceMetrics(): void {
  metricsStore.clear();
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): {
  totalComponents: number;
  totalRenders: number;
  averageRenderTime: number;
  slowestComponent: string | null;
  mostRenderedComponent: string | null;
} {
  const metrics = Array.from(metricsStore.values());

  if (metrics.length === 0) {
    return {
      totalComponents: 0,
      totalRenders: 0,
      averageRenderTime: 0,
      slowestComponent: null,
      mostRenderedComponent: null,
    };
  }

  const totalRenders = metrics.reduce((sum, m) => sum + m.renderCount, 0);
  const avgRenderTime =
    metrics.reduce((sum, m) => sum + m.averageRenderTime, 0) / metrics.length;

  const slowestComponent = metrics.reduce((max, m) =>
    m.averageRenderTime > (max?.averageRenderTime || 0) ? m : max
  );

  const mostRenderedComponent = metrics.reduce((max, m) =>
    m.renderCount > (max?.renderCount || 0) ? m : max
  );

  return {
    totalComponents: metrics.length,
    totalRenders,
    averageRenderTime: Math.round(avgRenderTime * 100) / 100,
    slowestComponent: slowestComponent?.componentName || null,
    mostRenderedComponent: mostRenderedComponent?.componentName || null,
  };
}

export default usePerformance;
