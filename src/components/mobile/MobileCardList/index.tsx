'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Skeleton,
  Alert
} from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';
import { useI18n } from '@/lib/i18n/client';

export interface MobileCardListProps<T> {
  // Data
  data: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;

  // Card rendering
  renderCard: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;

  // Pagination (infinite scroll)
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;

  // Selection
  selectable?: boolean;
  selectedIds?: Set<string | number>;
  onSelectionChange?: (ids: Set<string | number>) => void;

  // Pull to refresh
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;

  // Skeleton
  skeletonCount?: number;
  renderSkeleton?: () => React.ReactNode;
}

// Default skeleton card
const DefaultSkeleton = () => (
  <Box sx={{ p: 1.5, display: 'flex', gap: 1.5 }}>
    <Skeleton variant="circular" width={40} height={40} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="80%" height={24} />
      <Skeleton variant="text" width="60%" height={20} />
      <Skeleton variant="text" width="40%" height={16} />
    </Box>
  </Box>
);

export default function MobileCardList<T>({
  data,
  loading = false,
  error = null,
  emptyMessage,
  emptyIcon,
  renderCard,
  keyExtractor,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  selectable = false,
  selectedIds,
  onSelectionChange,
  onRefresh,
  refreshing = false,
  skeletonCount = 5,
  renderSkeleton,
}: MobileCardListProps<T>) {
  const t = useI18n();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [pullStartY, setPullStartY] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, loadingMore, onLoadMore]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  // Pull to refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!onRefresh || refreshing) return;
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      setPullStartY(e.touches[0].clientY);
    }
  }, [onRefresh, refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (pullStartY === null || !onRefresh || refreshing) return;
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, Math.min(currentY - pullStartY, 100));
    setPullDistance(distance);
  }, [pullStartY, onRefresh, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 60 && onRefresh && !refreshing) {
      await onRefresh();
    }
    setPullStartY(null);
    setPullDistance(0);
  }, [pullDistance, onRefresh, refreshing]);

  // Selection handlers
  const handleSelectionChange = useCallback((id: string | number, selected: boolean) => {
    if (!onSelectionChange || !selectedIds) return;
    const newSelection = new Set(selectedIds);
    if (selected) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    onSelectionChange(newSelection);
  }, [selectedIds, onSelectionChange]);

  // Initial loading state
  if (loading && data.length === 0) {
    return (
      <Box>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Box key={index}>
            {renderSkeleton ? renderSkeleton() : <DefaultSkeleton />}
          </Box>
        ))}
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Empty state
  if (!loading && data.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 2,
          color: 'text.secondary',
        }}
      >
        {emptyIcon || <InboxIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />}
        <Typography variant="body1" color="text.secondary">
          {emptyMessage || t('grid.noRows')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{
        flex: 1,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: pullDistance,
            transition: pullStartY === null ? 'height 0.2s' : 'none',
          }}
        >
          <CircularProgress
            size={24}
            variant={pullDistance > 60 ? 'indeterminate' : 'determinate'}
            value={(pullDistance / 60) * 100}
          />
        </Box>
      )}

      {/* Refreshing indicator */}
      {refreshing && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 2,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Card list */}
      <Box>
        {data.map((item, index) => {
          const key = keyExtractor(item);
          return (
            <Box key={key}>
              {renderCard(item, index)}
            </Box>
          );
        })}
      </Box>

      {/* Load more trigger */}
      <Box ref={loadMoreRef} sx={{ height: 1 }} />

      {/* Loading more indicator */}
      {loadingMore && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 2,
          }}
        >
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {t('common.loading')}
          </Typography>
        </Box>
      )}

      {/* End of list indicator */}
      {!hasMore && data.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t('grid.noRows')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
