'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Slide,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import MobileFab from '@/components/mobile/MobileFab';
import { MobileMasterDetailProps, MasterDetailView } from './types';

// Re-export types and hook
export * from './types';
export { useMobileMasterDetail } from './useMobileMasterDetail';

/**
 * MobileMasterDetail - A mobile-optimized Master-Detail navigation component
 *
 * Features:
 * - Slide animation between master and detail views
 * - Back button navigation
 * - FAB support for both views
 * - Selection mode support
 * - Loading and empty states
 * - Swipe back gesture (optional)
 *
 * @example
 * ```tsx
 * const { view, setView, selectedMaster, selectMaster, goBack } = useMobileMasterDetail<CodeType>();
 *
 * <MobileMasterDetail
 *   view={view}
 *   onViewChange={setView}
 *   masterContent={<CodeTypeList onSelect={selectMaster} />}
 *   detailContent={<CodeList codeType={selectedMaster} />}
 *   detailHeader={{ title: selectedMaster?.name || '' }}
 *   masterFab={{ onClick: handleAddCodeType }}
 *   detailFab={{ onClick: handleAddCode }}
 * />
 * ```
 */
export default function MobileMasterDetail({
  view,
  onViewChange,
  masterContent,
  detailContent,
  masterTitle,
  detailHeader,
  showBackButton = true,
  onBack,
  masterFab,
  detailFab,
  detailSelection,
  enableSwipeBack = false,
  animationDuration = 300,
  detailLoading = false,
  detailEmptyState,
  hasDetailContent = true,
  containerHeight = 'calc(100dvh - 112px)',
}: MobileMasterDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      onViewChange('master');
    }
  }, [onBack, onViewChange]);

  // Swipe back gesture handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enableSwipeBack || view !== 'detail') return;
      setTouchStart(e.touches[0].clientX);
    },
    [enableSwipeBack, view]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!enableSwipeBack || view !== 'detail' || touchStart === null) return;

      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchEnd - touchStart;

      // Swipe right from left edge to go back
      if (touchStart < 50 && diff > 100) {
        handleBack();
      }

      setTouchStart(null);
    },
    [enableSwipeBack, view, touchStart, handleBack]
  );

  // Current FAB based on view
  const currentFab = view === 'master' ? masterFab : detailFab;

  return (
    <Box
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      sx={{
        position: 'relative',
        height: containerHeight,
        minHeight: 300,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Master View */}
      <Slide
        direction="right"
        in={view === 'master'}
        mountOnEnter
        unmountOnExit
        timeout={animationDuration}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
          }}
        >
          {/* Master Title (optional) */}
          {masterTitle && (
            <Paper
              elevation={0}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                {masterTitle}
              </Typography>
            </Paper>
          )}

          {/* Master Content */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>{masterContent}</Box>
        </Box>
      </Slide>

      {/* Detail View */}
      <Slide
        direction="left"
        in={view === 'detail'}
        mountOnEnter
        unmountOnExit
        timeout={animationDuration}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
          }}
        >
          {/* Detail Header */}
          <Paper
            elevation={0}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* Title Bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 1,
                py: 1,
                gap: 1,
              }}
            >
              {showBackButton && (
                <IconButton size="small" onClick={handleBack}>
                  <ArrowBackIcon />
                </IconButton>
              )}

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  noWrap
                  sx={{ lineHeight: 1.2 }}
                >
                  {detailHeader.title}
                </Typography>
                {detailHeader.subtitle && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ display: 'block' }}
                  >
                    {detailHeader.subtitle}
                  </Typography>
                )}
              </Box>

              {detailHeader.actions}
            </Box>

            {/* Selection Mode Bar */}
            {detailSelection?.active && (
              <>
                <Divider />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 0.75,
                    bgcolor: 'primary.50',
                  }}
                >
                  <Typography variant="caption" color="primary.main" fontWeight={500}>
                    {detailSelection.selectedCount} / {detailSelection.totalCount} selected
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography
                      component="button"
                      variant="caption"
                      onClick={detailSelection.onSelectAll}
                      sx={{
                        color: 'primary.main',
                        cursor: 'pointer',
                        border: 'none',
                        bgcolor: 'transparent',
                        textDecoration: 'underline',
                      }}
                    >
                      Select All
                    </Typography>
                    <Typography
                      component="button"
                      variant="caption"
                      onClick={detailSelection.onDeselectAll}
                      sx={{
                        color: 'text.secondary',
                        cursor: 'pointer',
                        border: 'none',
                        bgcolor: 'transparent',
                        textDecoration: 'underline',
                      }}
                    >
                      Deselect
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Paper>

          {/* Detail Content */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {detailLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  p: 4,
                }}
              >
                <CircularProgress size={32} />
              </Box>
            ) : !hasDetailContent && detailEmptyState ? (
              detailEmptyState
            ) : (
              detailContent
            )}
          </Box>
        </Box>
      </Slide>

      {/* FAB */}
      {currentFab && (
        <MobileFab
          icon={currentFab.icon || <AddIcon />}
          onClick={currentFab.onClick}
          label={currentFab.label}
        />
      )}
    </Box>
  );
}
