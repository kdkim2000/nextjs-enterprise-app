'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Chip, Box, IconButton, Tooltip } from '@mui/material';
import { PlayArrow as StartIcon, Visibility as ViewIcon, Edit as EditIcon } from '@mui/icons-material';
import { Inspection, InspectionStatus } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { format } from 'date-fns';

const getStatusColor = (status: InspectionStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'primary';
    case 'draft':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: InspectionStatus, locale: string): string => {
  const labels: Record<InspectionStatus, Record<string, string>> = {
    draft: { ko: '초안', en: 'Draft', zh: '草稿', vi: 'Bản nháp' },
    in_progress: { ko: '진행중', en: 'In Progress', zh: '进行中', vi: 'Đang tiến hành' },
    completed: { ko: '완료', en: 'Completed', zh: '已完成', vi: 'Đã hoàn thành' },
    cancelled: { ko: '취소', en: 'Cancelled', zh: '已取消', vi: 'Đã hủy' },
  };
  return labels[status]?.[locale] || labels[status]?.['en'] || status;
};

export const createColumns = (
  t: any,
  locale: string,
  handleView: (id: string | number) => void,
  handleEdit: (id: string | number) => void,
  handleStart: (id: string | number) => void,
  canUpdate: boolean = true
): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: 'inspection_code',
      headerName: getLocalizedValue({ en: 'Code', ko: '검사코드', zh: '检查代码', vi: 'Mã kiểm tra' }, locale),
      width: 130,
    },
    {
      field: 'title',
      headerName: getLocalizedValue({ en: 'Title', ko: '제목', zh: '标题', vi: 'Tiêu đề' }, locale),
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'template_name',
      headerName: getLocalizedValue({ en: 'Template', ko: '템플릿', zh: '模板', vi: 'Mẫu' }, locale),
      width: 150,
    },
    {
      field: 'inspector_name',
      headerName: getLocalizedValue({ en: 'Inspector', ko: '검사자', zh: '检查员', vi: 'Người kiểm tra' }, locale),
      width: 120,
    },
    {
      field: 'location',
      headerName: getLocalizedValue({ en: 'Location', ko: '위치', zh: '位置', vi: 'Vị trí' }, locale),
      width: 120,
    },
    {
      field: 'inspection_date',
      headerName: getLocalizedValue({ en: 'Date', ko: '검사일', zh: '检查日期', vi: 'Ngày kiểm tra' }, locale),
      width: 110,
      valueFormatter: (value) => {
        if (!value) return '-';
        try {
          return format(new Date(value), 'yyyy-MM-dd');
        } catch {
          return '-';
        }
      },
    },
    {
      field: 'status',
      headerName: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
      width: 110,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value as InspectionStatus, locale)}
          size="small"
          color={getStatusColor(params.value as InspectionStatus)}
        />
      ),
    },
    {
      field: 'actions',
      headerName: getLocalizedValue({ en: 'Actions', ko: '작업', zh: '操作', vi: 'Thao tác' }, locale),
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const inspection = params.row as Inspection;
        const canStart = inspection.status === 'draft' || inspection.status === 'in_progress';
        const canEdit = inspection.status === 'draft';

        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={getLocalizedValue({ en: 'View', ko: '보기' }, locale)}>
              <IconButton size="small" onClick={() => handleView(inspection.id)}>
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canUpdate && canEdit && (
              <Tooltip title={getLocalizedValue({ en: 'Edit', ko: '수정' }, locale)}>
                <IconButton size="small" onClick={() => handleEdit(inspection.id)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canUpdate && canStart && (
              <Tooltip title={getLocalizedValue({ en: 'Start Inspection', ko: '검사 시작' }, locale)}>
                <IconButton size="small" color="primary" onClick={() => handleStart(inspection.id)}>
                  <StartIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  return columns;
};
