'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridRowSelectionModel,
  GridCellParams
} from '@mui/x-data-grid';
import {
  Box,
  Stack,
  IconButton,
  Tooltip,
  Menu
} from '@mui/material';
import {
  FileDownload,
  FileUpload,
  Add,
  Delete,
  Refresh,
  Settings
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { useI18n } from '@/lib/i18n/client';
import { toast } from 'react-toastify';

interface ExcelDataGridProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  onRowsChange?: (rows: any[]) => void;
  onAdd?: () => void;
  onEdit?: (id: string | number) => void;
  onDelete?: (ids: (string | number)[]) => void;
  onRefresh?: () => void;
  loading?: boolean;
  editable?: boolean;
  checkboxSelection?: boolean;
  exportFileName?: string;
  height?: number | string;
  paginationMode?: 'client' | 'server';
  rowCount?: number;
  paginationModel?: { page: number; pageSize: number };
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;
}

interface CustomToolbarProps {
  onExport: () => void;
  onImport: () => void;
  onAdd?: () => void;
  onDelete?: () => void;
  onRefresh?: () => void;
  hasSelection: boolean;
  editable?: boolean;
  rowCount?: number;
  totalCount?: number;
}

function CustomToolbar(props: CustomToolbarProps) {
  const t = useI18n();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const settingsOpen = Boolean(settingsAnchorEl);

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  return (
    <GridToolbarContainer>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          flex: 1,
          py: 0.75,
          px: 1.5,
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* Total Count Badge */}
        {typeof props.totalCount === 'number' && (
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
            {t('grid.totalCount', { count: props.totalCount.toLocaleString() })}
          </Box>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Action Buttons - Icon Only */}
        {props.editable && props.onAdd && (
          <Tooltip title={t('common.create')} arrow>
            <IconButton
              size="small"
              onClick={props.onAdd}
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: 'primary.50' }
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {props.editable && props.onDelete && props.hasSelection && (
          <Tooltip title={t('common.delete')} arrow>
            <IconButton
              size="small"
              onClick={props.onDelete}
              sx={{
                color: 'error.main',
                '&:hover': { bgcolor: 'error.50' }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {props.onRefresh && (
          <Tooltip title={t('common.refresh')} arrow>
            <IconButton
              size="small"
              onClick={props.onRefresh}
              sx={{
                color: 'action.active',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title={t('grid.exportExcel')} arrow>
          <IconButton
            size="small"
            onClick={props.onExport}
            sx={{
              color: 'success.main',
              '&:hover': { bgcolor: 'success.50' }
            }}
          >
            <FileDownload fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={t('grid.importExcel')} arrow>
          <IconButton
            size="small"
            onClick={props.onImport}
            sx={{
              color: 'info.main',
              '&:hover': { bgcolor: 'info.50' }
            }}
          >
            <FileUpload fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Settings Menu */}
        <Box sx={{ ml: 0.5, pl: 0.5, borderLeft: '1px solid', borderColor: 'divider' }}>
          <Tooltip title={t('common.settings')} arrow>
            <IconButton
              size="small"
              onClick={handleSettingsClick}
              sx={{
                color: 'action.active',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Settings fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={settingsAnchorEl}
          open={settingsOpen}
          onClose={handleSettingsClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          slotProps={{
            paper: {
              sx: {
                minWidth: 200,
                mt: 0.5
              }
            }
          }}
        >
          <GridToolbarColumnsButton
            slotProps={{
              button: {
                sx: {
                  width: '100%',
                  justifyContent: 'flex-start',
                  px: 2,
                  py: 1,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }
              }
            }}
          />
          <GridToolbarDensitySelector
            slotProps={{
              button: {
                sx: {
                  width: '100%',
                  justifyContent: 'flex-start',
                  px: 2,
                  py: 1,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }
              }
            }}
          />
        </Menu>
      </Stack>
    </GridToolbarContainer>
  );
}

export default function ExcelDataGrid({
  rows,
  columns,
  onRowsChange,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  loading = false,
  editable = false,
  checkboxSelection = true,
  exportFileName = 'export',
  height,
  paginationMode = 'client',
  rowCount,
  paginationModel,
  onPaginationModelChange
}: ExcelDataGridProps) {
  const t = useI18n();
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  // Export to Excel
  const handleExport = useCallback(() => {
    try {
      // Prepare data for export
      const exportData = rows.map((row) => {
        const rowData: any = {};
        columns.forEach((col) => {
          if (col.field !== '__check__' && col.field !== 'actions') {
            rowData[col.headerName || col.field] = row[col.field];
          }
        });
        return rowData;
      });

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      // Auto-size columns
      const maxWidth = 50;
      const wscols = columns
        .filter((col) => col.field !== '__check__' && col.field !== 'actions')
        .map((col) => ({
          wch: Math.min(
            Math.max(
              (col.headerName || col.field).length,
              ...rows.map((row) =>
                String(row[col.field] || '').length
              )
            ) + 2,
            maxWidth
          )
        }));
      ws['!cols'] = wscols;

      // Save file
      XLSX.writeFile(wb, `${exportFileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  }, [rows, columns, exportFileName]);

  // Import from Excel
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';

    input.onchange = async (e) => {
      try {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });

            // Read first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Convert to grid rows
            const importedRows = jsonData.map((row: any, index) => {
              const gridRow: any = { id: `imported-${Date.now()}-${index}` };

              // Map Excel columns to grid columns
              columns.forEach((col) => {
                const headerName = col.headerName || col.field;
                if (row[headerName] !== undefined) {
                  gridRow[col.field] = row[headerName];
                }
              });

              return gridRow;
            });

            if (onRowsChange) {
              onRowsChange([...rows, ...importedRows]);
            }

            toast.success(`Successfully imported ${importedRows.length} rows`);
          } catch (error) {
            console.error('Parse error:', error);
            toast.error('Failed to parse Excel file');
          }
        };

        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import file');
      }
    };

    input.click();
  }, [rows, columns, onRowsChange]);

  const handleDelete = useCallback(() => {
    if (onDelete && selectionModel.length > 0) {
      onDelete(selectionModel as (string | number)[]);
      setSelectionModel([]);
    }
  }, [onDelete, selectionModel]);

  const handleCellDoubleClick = useCallback(
    (params: GridCellParams) => {
      if (editable && onEdit && params.field !== '__check__') {
        onEdit(params.id);
      }
    },
    [editable, onEdit]
  );

  return (
    <Box sx={{ height: height || '100%', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick
        onRowSelectionModelChange={setSelectionModel}
        rowSelectionModel={selectionModel}
        onCellDoubleClick={handleCellDoubleClick}
        slots={{
          toolbar: CustomToolbar as any
        }}
        slotProps={{
          toolbar: {
            onExport: handleExport,
            onImport: handleImport,
            onAdd,
            onDelete: handleDelete,
            onRefresh,
            hasSelection: selectionModel.length > 0,
            editable,
            rowCount: rows.length,
            totalCount: paginationMode === 'server' && rowCount !== undefined ? rowCount : rows.length
          } as any
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        paginationMode={paginationMode}
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        initialState={
          paginationMode === 'client'
            ? {
                pagination: {
                  paginationModel: { pageSize: 25 }
                }
              }
            : undefined
        }
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: '2px solid #1976d2'
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: '2px solid #1976d2'
          },
          // Excel-like styling
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: '#f5f5f5',
            fontWeight: 600
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f0f7ff'
          }
        }}
      />
    </Box>
  );
}
