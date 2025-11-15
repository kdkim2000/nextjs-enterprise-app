'use client';

import React, { ReactNode } from 'react';
import { Box, Paper, IconButton, Tooltip } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import MessageAlert from '@/components/common/MessageAlert';
import QuickSearchBar from '@/components/common/QuickSearchBar';
import SearchFilterPanel from '@/components/common/SearchFilterPanel';
import HelpViewer from '@/components/common/HelpViewer';
import RouteGuard from '@/components/auth/RouteGuard';

export interface StandardCrudPageLayoutProps {
  // Page Header
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

  // Help
  programId?: string;
  helpOpen?: boolean;
  onHelpOpenChange?: (open: boolean) => void;
  isAdmin?: boolean;
  helpExists?: boolean;
  language?: string;

  // Main Content
  children: ReactNode;

  // Container Props
  containerSx?: any;
}

/**
 * StandardCrudPageLayout - Standardized layout for CRUD pages
 *
 * Provides a consistent layout structure for CRUD pages with:
 * - Page header with breadcrumb and actions
 * - Message alerts (success/error/warning/info)
 * - Quick search bar
 * - Advanced filter panel (optional)
 * - Help viewer (optional)
 * - Main content area
 *
 * @example
 * ```tsx
 * <StandardCrudPageLayout
 *   useMenu
 *   showBreadcrumb
 *   successMessage={successMessage}
 *   errorMessage={errorMessage}
 *   quickSearch={quickSearch}
 *   onQuickSearchChange={setQuickSearch}
 *   onQuickSearch={handleQuickSearch}
 *   onQuickSearchClear={handleQuickSearchClear}
 *   showAdvancedFilter
 *   advancedFilterOpen={advancedFilterOpen}
 *   onAdvancedFilterClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
 *   activeFilterCount={activeFilterCount}
 *   filterContent={<SearchFilterFields fields={filterFields} values={searchCriteria} onChange={handleSearchChange} />}
 *   onFilterApply={handleAdvancedFilterApply}
 *   onFilterClear={handleQuickSearchClear}
 *   onFilterClose={handleAdvancedFilterClose}
 *   programId="PROG-USER-LIST"
 *   helpOpen={helpOpen}
 *   onHelpOpenChange={setHelpOpen}
 *   isAdmin={isAdmin}
 *   helpExists={helpExists}
 * >
 *   <Paper sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
 *     <ExcelDataGrid ... />
 *   </Paper>
 * </StandardCrudPageLayout>
 * ```
 */
export default function StandardCrudPageLayout({
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
  quickSearchPlaceholder = 'Search...',
  searching = false,
  showQuickSearch = true,

  // Advanced Filter
  showAdvancedFilter = true,
  advancedFilterOpen = false,
  onAdvancedFilterClick,
  activeFilterCount = 0,
  filterTitle = 'Search / Filter',
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

  // Main Content
  children,

  // Container Props
  containerSx = {}
}: StandardCrudPageLayoutProps) {
  // Build header actions with help button if applicable
  const finalHeaderActions = (
    <>
      {headerActions}
      {programId && (isAdmin || helpExists) && onHelpOpenChange && (
        <Tooltip title={isAdmin ? 'Help (Admin: Click to edit)' : 'Help'}>
          <IconButton onClick={() => onHelpOpenChange(true)} color="primary" sx={{ ml: 1 }}>
            <HelpOutline />
          </IconButton>
        </Tooltip>
      )}
    </>
  );

  const pageContent = (
    <PageContainer sx={containerSx}>
      {/* Header */}
      <PageHeader useMenu={useMenu} showBreadcrumb={showBreadcrumb} actions={finalHeaderActions} />

      {/* Message Alerts */}
      <MessageAlert
        successMessage={successMessage}
        errorMessage={errorMessage}
        warningMessage={warningMessage}
        infoMessage={infoMessage}
      />

      {/* Quick Search Bar */}
      {showQuickSearch && onQuickSearchChange && onQuickSearch && onQuickSearchClear && (
        <QuickSearchBar
          searchValue={quickSearch}
          onSearchChange={onQuickSearchChange}
          onSearch={onQuickSearch}
          onClear={onQuickSearchClear}
          onAdvancedFilterClick={onAdvancedFilterClick}
          placeholder={quickSearchPlaceholder}
          searching={searching}
          activeFilterCount={activeFilterCount}
          showAdvancedButton={showAdvancedFilter}
        />
      )}

      {/* Advanced Filter Panel */}
      {showAdvancedFilter && advancedFilterOpen && filterContent && (
        <SearchFilterPanel
          title={filterTitle}
          activeFilterCount={activeFilterCount}
          onApply={onFilterApply}
          onClear={onFilterClear}
          onClose={onFilterClose}
          mode="advanced"
          expanded={true}
          showHeader={false}
        >
          {filterContent}
        </SearchFilterPanel>
      )}

      {/* Main Content */}
      {children}

      {/* Help Viewer */}
      {programId && onHelpOpenChange && (
        <HelpViewer
          open={helpOpen}
          onClose={() => onHelpOpenChange(false)}
          programId={programId}
          language={language as "en" | "ko" | undefined}
          isAdmin={isAdmin}
        />
      )}
    </PageContainer>
  );

  // If programId is provided, wrap with RouteGuard for permission check
  if (programId) {
    return (
      <RouteGuard programCode={programId} requiredPermission="view" fallbackUrl="/dashboard">
        {pageContent}
      </RouteGuard>
    );
  }

  return pageContent;
}
