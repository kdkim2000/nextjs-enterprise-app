'use client';

import React from 'react';
import { GridColDef, GridRowSelectionModel, GridValidRowModel } from '@mui/x-data-grid';
import { useMobile } from '@/hooks/useMobile';
import ExcelDataGrid from '@/components/common/DataGrid';
import MobileCardList from '@/components/mobile/MobileCardList';

export interface ResponsiveDataViewProps<T extends GridValidRowModel> {
  // Common data
  data: T[];
  loading?: boolean;
  error?: string | null;
  keyExtractor: (item: T) => string | number;

  // Desktop settings (ExcelDataGrid)
  columns: GridColDef[];
  onRowClick?: (item: T) => void;
  onEdit?: (id: string | number) => void;
  onDelete?: (ids: (string | number)[]) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  checkboxSelection?: boolean;
  editable?: boolean;
  exportFileName?: string;
  height?: number | string;

  // Pagination
  paginationMode?: 'client' | 'server';
  rowCount?: number;
  paginationModel?: { page: number; pageSize: number };
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;

  // Selection
  rowSelectionModel?: GridRowSelectionModel;
  onRowSelectionModelChange?: (model: GridRowSelectionModel) => void;

  // Mobile settings (MobileCardList)
  mobileCardRenderer: (item: T, index: number) => React.ReactNode;
  mobileHasMore?: boolean;
  onMobileLoadMore?: () => void;
  mobileLoadingMore?: boolean;
  mobileEmptyMessage?: string;
  mobileEmptyIcon?: React.ReactNode;

  // Mobile selection
  mobileSelectable?: boolean;
  mobileSelectedIds?: Set<string | number>;
  onMobileSelectionChange?: (ids: Set<string | number>) => void;

  // Mobile refresh
  onMobileRefresh?: () => Promise<void>;
  mobileRefreshing?: boolean;
}

export default function ResponsiveDataView<T extends GridValidRowModel>({
  // Common
  data,
  loading = false,
  error = null,
  keyExtractor,

  // Desktop
  columns,
  onRowClick,
  onEdit,
  onDelete,
  onAdd,
  onRefresh,
  checkboxSelection = false,
  editable = false,
  exportFileName,
  height,

  // Pagination
  paginationMode = 'client',
  rowCount,
  paginationModel,
  onPaginationModelChange,

  // Selection
  rowSelectionModel,
  onRowSelectionModelChange,

  // Mobile
  mobileCardRenderer,
  mobileHasMore = false,
  onMobileLoadMore,
  mobileLoadingMore = false,
  mobileEmptyMessage,
  mobileEmptyIcon,
  mobileSelectable = false,
  mobileSelectedIds,
  onMobileSelectionChange,
  onMobileRefresh,
  mobileRefreshing = false,
}: ResponsiveDataViewProps<T>) {
  const { isMobileLayout } = useMobile();

  // Mobile view
  if (isMobileLayout) {
    return (
      <MobileCardList<T>
        data={data}
        loading={loading}
        error={error}
        emptyMessage={mobileEmptyMessage}
        emptyIcon={mobileEmptyIcon}
        renderCard={mobileCardRenderer}
        keyExtractor={keyExtractor}
        hasMore={mobileHasMore}
        onLoadMore={onMobileLoadMore}
        loadingMore={mobileLoadingMore}
        selectable={mobileSelectable}
        selectedIds={mobileSelectedIds}
        onSelectionChange={onMobileSelectionChange}
        onRefresh={onMobileRefresh}
        refreshing={mobileRefreshing}
      />
    );
  }

  // Desktop view (ExcelDataGrid)
  return (
    <ExcelDataGrid
      rows={data}
      columns={columns}
      loading={loading}
      onRowClick={onRowClick ? (params) => onRowClick(params.row as T) : undefined}
      onEdit={onEdit}
      onDelete={onDelete}
      onAdd={onAdd}
      onRefresh={onRefresh}
      checkboxSelection={checkboxSelection}
      editable={editable}
      exportFileName={exportFileName}
      height={height}
      paginationMode={paginationMode}
      rowCount={rowCount}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      rowSelectionModel={rowSelectionModel}
      onRowSelectionModelChange={onRowSelectionModelChange}
    />
  );
}
