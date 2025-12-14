'use client';

import React, { ReactNode, useState } from 'react';
import { Box, Paper } from '@mui/material';
import { useMobile } from '@/hooks/useMobile';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import MobileSearchHeader, { SortOption } from '@/components/mobile/MobileSearchHeader';
import MobileDetailSheet from '@/components/mobile/MobileDetailSheet';
import MobileFab from '@/components/mobile/MobileFab';
import { Add as AddIcon } from '@mui/icons-material';

export interface ResponsivePageLayoutProps {
  children: ReactNode;

  // Page Header (Desktop)
  useMenu?: boolean;
  showBreadcrumb?: boolean;
  headerActions?: ReactNode;

  // Messages
  successMessage?: string | null;
  errorMessage?: string | null;
  warningMessage?: string | null;
  infoMessage?: string | null;

  // Quick Search
  quickSearch?: string;
  onQuickSearchChange?: (value: string) => void;
  onQuickSearch?: () => void;
  onQuickSearchClear?: () => void;
  quickSearchPlaceholder?: string;
  searching?: boolean;
  showQuickSearch?: boolean;

  // Advanced Filter
  showAdvancedFilter?: boolean;
  advancedFilterOpen?: boolean;
  onAdvancedFilterClick?: () => void;
  activeFilterCount?: number;
  filterTitle?: string;
  filterContent?: ReactNode;
  onFilterApply?: () => void;
  onFilterClear?: () => void;
  onFilterClose?: () => void;

  // Help (Desktop)
  programId?: string;
  helpOpen?: boolean;
  onHelpOpenChange?: (open: boolean) => void;
  isAdmin?: boolean;
  helpExists?: boolean;
  language?: string;
  canManageHelp?: boolean;
  onHelpEdit?: () => void;

  // Mobile specific
  mobileFab?: {
    icon?: ReactNode;
    onClick: () => void;
    label?: string;
    extended?: boolean;
    hide?: boolean;
  };
  mobileSort?: {
    options: SortOption[];
    value: string;
    onChange: (value: string) => void;
  };
  mobileSelectionMode?: boolean;
  mobileSelectedCount?: number;
  mobileTotalCount?: number;
  onMobileSelectionModeToggle?: () => void;
  onMobileSelectAll?: () => void;
  onMobileDeselectAll?: () => void;
  onMobileDeleteSelected?: () => void;
  mobileCustomHeader?: ReactNode;
  hideMobileSearchHeader?: boolean;

  // Container Props
  containerSx?: any;
}

export default function ResponsivePageLayout({
  children,

  // Page Header
  useMenu = true,
  showBreadcrumb = true,
  headerActions,

  // Messages
  successMessage,
  errorMessage,
  warningMessage,
  infoMessage,

  // Quick Search
  quickSearch = '',
  onQuickSearchChange,
  onQuickSearch,
  onQuickSearchClear,
  quickSearchPlaceholder,
  searching = false,
  showQuickSearch = true,

  // Advanced Filter
  showAdvancedFilter = true,
  advancedFilterOpen = false,
  onAdvancedFilterClick,
  activeFilterCount = 0,
  filterTitle,
  filterContent,
  onFilterApply,
  onFilterClear,
  onFilterClose,

  // Help
  programId,
  helpOpen = false,
  onHelpOpenChange,
  isAdmin = false,
  helpExists = false,
  language = 'en',
  canManageHelp = false,
  onHelpEdit,

  // Mobile specific
  mobileFab,
  mobileSort,
  mobileSelectionMode = false,
  mobileSelectedCount = 0,
  mobileTotalCount = 0,
  onMobileSelectionModeToggle,
  onMobileSelectAll,
  onMobileDeselectAll,
  onMobileDeleteSelected,
  mobileCustomHeader,
  hideMobileSearchHeader = false,

  // Container Props
  containerSx,
}: ResponsivePageLayoutProps) {
  const { isMobileLayout } = useMobile();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Mobile Layout
  if (isMobileLayout) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          ...containerSx,
        }}
      >
        {/* Mobile Custom Header (for drill-down navigation) */}
        {mobileCustomHeader}

        {/* Mobile Search Header */}
        {showQuickSearch && !hideMobileSearchHeader && (
          <MobileSearchHeader
            searchValue={quickSearch}
            onSearchChange={onQuickSearchChange || (() => {})}
            onSearch={onQuickSearch || (() => {})}
            searchPlaceholder={quickSearchPlaceholder}
            searching={searching}
            showFilter={showAdvancedFilter}
            filterCount={activeFilterCount}
            onFilterClick={() => setMobileFilterOpen(true)}
            sortOptions={mobileSort?.options}
            sortValue={mobileSort?.value}
            onSortChange={mobileSort?.onChange}
            selectionMode={mobileSelectionMode}
            selectedCount={mobileSelectedCount}
            totalCount={mobileTotalCount}
            onSelectionModeToggle={onMobileSelectionModeToggle}
            onSelectAll={onMobileSelectAll}
            onDeselectAll={onMobileDeselectAll}
            onDeleteSelected={onMobileDeleteSelected}
          />
        )}

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>

        {/* Mobile Filter Bottom Sheet */}
        {showAdvancedFilter && filterContent && (
          <MobileDetailSheet
            open={mobileFilterOpen}
            onClose={() => setMobileFilterOpen(false)}
            title={filterTitle}
            actions={
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                <Box
                  component="button"
                  onClick={() => {
                    onFilterClear?.();
                    setMobileFilterOpen(false);
                  }}
                  sx={{
                    flex: 1,
                    py: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    backgroundColor: 'background.paper',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </Box>
                <Box
                  component="button"
                  onClick={() => {
                    onFilterApply?.();
                    setMobileFilterOpen(false);
                  }}
                  sx={{
                    flex: 1,
                    py: 1.5,
                    border: 'none',
                    borderRadius: 1,
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    cursor: 'pointer',
                  }}
                >
                  Apply
                </Box>
              </Box>
            }
          >
            {filterContent}
          </MobileDetailSheet>
        )}

        {/* Mobile FAB */}
        {mobileFab && (
          <MobileFab
            icon={mobileFab.icon || <AddIcon />}
            onClick={mobileFab.onClick}
            label={mobileFab.label}
            extended={mobileFab.extended}
            hide={mobileFab.hide || mobileSelectionMode}
          />
        )}
      </Box>
    );
  }

  // Desktop Layout (StandardCrudPageLayout)
  return (
    <StandardCrudPageLayout
      useMenu={useMenu}
      showBreadcrumb={showBreadcrumb}
      headerActions={headerActions}
      successMessage={successMessage}
      errorMessage={errorMessage}
      warningMessage={warningMessage}
      infoMessage={infoMessage}
      quickSearch={quickSearch}
      onQuickSearchChange={onQuickSearchChange}
      onQuickSearch={onQuickSearch}
      onQuickSearchClear={onQuickSearchClear}
      quickSearchPlaceholder={quickSearchPlaceholder}
      searching={searching}
      showQuickSearch={showQuickSearch}
      showAdvancedFilter={showAdvancedFilter}
      advancedFilterOpen={advancedFilterOpen}
      onAdvancedFilterClick={onAdvancedFilterClick}
      activeFilterCount={activeFilterCount}
      filterTitle={filterTitle}
      filterContent={filterContent}
      onFilterApply={onFilterApply}
      onFilterClear={onFilterClear}
      onFilterClose={onFilterClose}
      programId={programId}
      helpOpen={helpOpen}
      onHelpOpenChange={onHelpOpenChange}
      isAdmin={isAdmin}
      helpExists={helpExists}
      language={language}
      canManageHelp={canManageHelp}
      onHelpEdit={onHelpEdit}
      containerSx={containerSx}
    >
      {children}
    </StandardCrudPageLayout>
  );
}
