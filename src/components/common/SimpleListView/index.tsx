'use client';

import React, { ReactNode, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme
} from '@mui/material';
import { Add, Delete, Refresh } from '@mui/icons-material';

export interface SimpleListColumn<T> {
  /**
   * Unique field identifier
   */
  field: string;

  /**
   * Column header text
   */
  headerName: string;

  /**
   * Column width (px or %)
   */
  width?: number | string;

  /**
   * Minimum width
   */
  minWidth?: number;

  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Custom cell renderer
   */
  renderCell?: (row: T, index: number) => ReactNode;

  /**
   * Value getter for display
   */
  valueGetter?: (row: T) => string | number | ReactNode;

  /**
   * Header icon (renders instead of text)
   */
  headerIcon?: ReactNode;

  /**
   * Header tooltip
   */
  headerTooltip?: string;

  /**
   * Whether to hide on mobile
   */
  hideOnMobile?: boolean;
}

export interface SimpleListViewProps<T extends { id: string | number }> {
  /**
   * Data rows
   */
  rows: T[];

  /**
   * Column definitions
   */
  columns: SimpleListColumn<T>[];

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Total count for pagination
   */
  totalCount: number;

  /**
   * Current page (0-indexed)
   */
  page: number;

  /**
   * Page size
   */
  pageSize: number;

  /**
   * Page change handler
   */
  onPageChange: (page: number) => void;

  /**
   * Page size change handler
   */
  onPageSizeChange: (pageSize: number) => void;

  /**
   * Page size options
   */
  pageSizeOptions?: number[];

  /**
   * Enable checkbox selection
   */
  checkboxSelection?: boolean;

  /**
   * Selected row IDs
   */
  selectedIds?: (string | number)[];

  /**
   * Selection change handler
   */
  onSelectionChange?: (ids: (string | number)[]) => void;

  /**
   * Row click handler
   */
  onRowClick?: (row: T) => void;

  /**
   * Add button handler (shows add button when provided)
   */
  onAdd?: () => void;

  /**
   * Delete button handler (shows delete button when selected)
   */
  onDelete?: (ids: (string | number)[]) => void;

  /**
   * Refresh button handler
   */
  onRefresh?: () => void;

  /**
   * Show row numbers
   */
  showRowNumber?: boolean;

  /**
   * Row number mode: 'asc' (1,2,3...) or 'desc' (total, total-1, ...)
   */
  rowNumberMode?: 'asc' | 'desc';

  /**
   * Total count label
   */
  totalLabel?: string;

  /**
   * Selected count label
   */
  selectedLabel?: string;

  /**
   * Empty state message
   */
  emptyMessage?: string;

  /**
   * Add button tooltip
   */
  addTooltip?: string;

  /**
   * Delete button tooltip
   */
  deleteTooltip?: string;

  /**
   * Refresh button tooltip
   */
  refreshTooltip?: string;

  /**
   * Row number column header
   */
  rowNumberHeader?: string;

  /**
   * Custom toolbar content (renders before action buttons)
   */
  toolbarContent?: ReactNode;

  /**
   * Sticky header
   */
  stickyHeader?: boolean;

  /**
   * Max height for scrollable container
   */
  maxHeight?: number | string;

  /**
   * Get row style
   */
  getRowStyle?: (row: T) => React.CSSProperties;

  /**
   * Hover background color
   */
  hoverBgColor?: string;

  /**
   * Header background color
   */
  headerBgColor?: string;
}

/**
 * SimpleListView - A lightweight table-based list component
 *
 * Unlike ExcelDataGrid (MUI DataGrid based), SimpleListView is:
 * - Lighter weight with native MUI Table
 * - Simpler API for basic list displays
 * - Optimized for read-heavy scenarios
 *
 * Usage:
 * ```tsx
 * <SimpleListView
 *   rows={items}
 *   columns={[
 *     { field: 'name', headerName: 'Name', width: 200 },
 *     { field: 'status', headerName: 'Status', renderCell: (row) => <Chip label={row.status} /> }
 *   ]}
 *   totalCount={100}
 *   page={0}
 *   pageSize={20}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 *   checkboxSelection
 *   selectedIds={selected}
 *   onSelectionChange={setSelected}
 *   onAdd={handleAdd}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export default function SimpleListView<T extends { id: string | number }>({
  rows,
  columns,
  loading = false,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  checkboxSelection = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  onAdd,
  onDelete,
  onRefresh,
  showRowNumber = false,
  rowNumberMode = 'desc',
  totalLabel = 'Total',
  selectedLabel = 'selected',
  emptyMessage = 'No data available',
  addTooltip = 'Add new',
  deleteTooltip = 'Delete selected',
  refreshTooltip = 'Refresh',
  rowNumberHeader = 'No',
  toolbarContent,
  stickyHeader = true,
  maxHeight,
  getRowStyle,
  hoverBgColor = '#f0f7ff',
  headerBgColor = '#f5f5f5'
}: SimpleListViewProps<T>) {
  const theme = useTheme();

  // Selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectionChange?.(rows.map(row => row.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectOne = (id: string | number) => {
    const currentIndex = selectedIds.indexOf(id);
    const newSelected = [...selectedIds];

    if (currentIndex === -1) {
      newSelected.push(id);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    onSelectionChange?.(newSelected);
  };

  const isSelected = (id: string | number) => selectedIds.includes(id);
  const isAllSelected = rows.length > 0 && selectedIds.length === rows.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < rows.length;

  // Row number calculation
  const getRowNumber = (index: number): number => {
    if (rowNumberMode === 'asc') {
      return page * pageSize + index + 1;
    }
    return totalCount - (page * pageSize) - index;
  };

  // Column count for empty state
  const totalColumns = useMemo(() => {
    let count = columns.length;
    if (checkboxSelection) count++;
    if (showRowNumber) count++;
    return count;
  }, [columns.length, checkboxSelection, showRowNumber]);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          flex: 0,
          py: 0.75,
          px: 1.5,
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* Total Count Badge */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.5,
            bgcolor: 'primary.50',
            borderRadius: 1,
            color: 'primary.main',
            fontWeight: 600,
            fontSize: '0.8125rem'
          }}
        >
          {totalLabel}: {totalCount.toLocaleString()}
        </Box>

        {selectedIds.length > 0 && (
          <Chip
            size="small"
            label={`${selectedIds.length} ${selectedLabel}`}
            color="primary"
            variant="outlined"
          />
        )}

        {toolbarContent}

        <Box sx={{ flex: 1 }} />

        {/* Action Buttons */}
        {onAdd && (
          <Tooltip title={addTooltip} arrow>
            <IconButton
              size="small"
              onClick={onAdd}
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: 'primary.50' }
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {onDelete && selectedIds.length > 0 && (
          <Tooltip title={deleteTooltip} arrow>
            <IconButton
              size="small"
              onClick={() => onDelete(selectedIds)}
              sx={{
                color: 'error.main',
                '&:hover': { bgcolor: 'error.50' }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {onRefresh && (
          <Tooltip title={refreshTooltip} arrow>
            <IconButton
              size="small"
              onClick={onRefresh}
              sx={{
                color: 'action.active',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {/* Loading indicator */}
      {loading && <LinearProgress />}

      {/* Table */}
      <TableContainer sx={{ flex: 1, maxHeight }}>
        <Table stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {checkboxSelection && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    width: 48,
                    bgcolor: headerBgColor,
                    fontWeight: 600
                  }}
                >
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    size="small"
                  />
                </TableCell>
              )}
              {showRowNumber && (
                <TableCell
                  align="center"
                  sx={{ width: 60, bgcolor: headerBgColor, fontWeight: 600 }}
                >
                  {rowNumberHeader}
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  sx={{
                    width: column.width,
                    minWidth: column.minWidth,
                    bgcolor: headerBgColor,
                    fontWeight: 600
                  }}
                >
                  {column.headerIcon ? (
                    column.headerTooltip ? (
                      <Tooltip title={column.headerTooltip}>{column.headerIcon as React.ReactElement}</Tooltip>
                    ) : (
                      column.headerIcon
                    )
                  ) : (
                    column.headerName
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Typography color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => {
                const selected = isSelected(row.id);
                const rowStyle = getRowStyle?.(row) || {};

                return (
                  <TableRow
                    key={row.id}
                    hover
                    selected={selected}
                    onClick={() => onRowClick?.(row)}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      ...rowStyle,
                      '&:hover': {
                        bgcolor: hoverBgColor
                      }
                    }}
                  >
                    {checkboxSelection && (
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected}
                          onChange={() => handleSelectOne(row.id)}
                          size="small"
                        />
                      </TableCell>
                    )}
                    {showRowNumber && (
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {getRowNumber(index)}
                        </Typography>
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.field} align={column.align || 'left'}>
                        {column.renderCell
                          ? column.renderCell(row, index)
                          : column.valueGetter
                            ? column.valueGetter(row)
                            : (row as any)[column.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={pageSizeOptions}
        sx={{ borderTop: 1, borderColor: 'divider' }}
      />
    </Paper>
  );
}
