'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { ContentCopy as CloneIcon } from '@mui/icons-material';
import ActionsCell from '@/components/common/ActionsCell';
import { ChecksheetTemplate, TemplateStatus } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';
import { format } from 'date-fns';

const getStatusColor = (status: TemplateStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'active':
      return 'success';
    case 'draft':
      return 'warning';
    case 'inactive':
      return 'default';
    case 'archived':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: TemplateStatus, locale: string): string => {
  const labels: Record<TemplateStatus, Record<string, string>> = {
    draft: { ko: '초안', en: 'Draft', zh: '草稿', vi: 'Bản nháp' },
    active: { ko: '활성', en: 'Active', zh: '激活', vi: 'Hoạt động' },
    inactive: { ko: '비활성', en: 'Inactive', zh: '未激活', vi: 'Không hoạt động' },
    archived: { ko: '보관', en: 'Archived', zh: '已归档', vi: 'Đã lưu trữ' },
  };
  return labels[status]?.[locale] || labels[status]?.['en'] || status;
};

export const createColumns = (
  t: any,
  locale: string,
  handleEdit: (id: string | number) => void,
  handleView: (id: string | number) => void,
  handleClone?: (id: string | number) => void,
  canUpdate: boolean = true
): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
    },
    {
      field: 'code',
      headerName: getLocalizedValue({ en: 'Code', ko: '코드', zh: '编码', vi: 'Mã' }, locale),
      width: 120,
    },
    {
      field: 'name',
      headerName: getLocalizedValue({ en: 'Template Name', ko: '템플릿명', zh: '模板名称', vi: 'Tên mẫu' }, locale),
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'category',
      headerName: getLocalizedValue({ en: 'Category', ko: '카테고리', zh: '类别', vi: 'Danh mục' }, locale),
      width: 130,
    },
    {
      field: 'version',
      headerName: getLocalizedValue({ en: 'Version', ko: '버전', zh: '版本', vi: 'Phiên bản' }, locale),
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => `v${params.value}`,
    },
    {
      field: 'item_count',
      headerName: getLocalizedValue({ en: 'Items', ko: '항목수', zh: '项目数', vi: 'Số mục' }, locale),
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'status',
      headerName: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
      width: 100,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value as TemplateStatus, locale)}
          size="small"
          color={getStatusColor(params.value as TemplateStatus)}
        />
      ),
    },
    {
      field: 'created_by_name',
      headerName: getLocalizedValue({ en: 'Created By', ko: '작성자', zh: '创建者', vi: 'Người tạo' }, locale),
      width: 120,
    },
    {
      field: 'created_at',
      headerName: getLocalizedValue({ en: 'Created', ko: '작성일', zh: '创建日期', vi: 'Ngày tạo' }, locale),
      width: 100,
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
      field: 'updated_at',
      headerName: getLocalizedValue({ en: 'Updated', ko: '수정일', zh: '更新日期', vi: 'Ngày cập nhật' }, locale),
      width: 100,
      valueFormatter: (value) => {
        if (!value) return '-';
        try {
          return format(new Date(value), 'yyyy-MM-dd');
        } catch {
          return '-';
        }
      },
    },
  ];

  // Add actions column if user can update
  if (canUpdate) {
    columns.push({
      field: 'actions',
      headerName: getLocalizedValue({ en: 'Actions', ko: '작업', zh: '操作', vi: 'Thao tác' }, locale),
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionsCell
          onEdit={() => handleEdit(params.row.id)}
          onView={() => handleView(params.row.id)}
          editTooltip={getLocalizedValue({ en: 'Edit Template', ko: '템플릿 수정', zh: '编辑模板', vi: 'Sửa mẫu' }, locale)}
          viewLabel={getLocalizedValue({ en: 'View Details', ko: '상세 보기', zh: '查看详情', vi: 'Xem chi tiết' }, locale)}
          customActions={handleClone ? [
            {
              label: getLocalizedValue({ en: 'Clone Template', ko: '템플릿 복제', zh: '克隆模板', vi: 'Nhân bản mẫu' }, locale),
              onClick: () => handleClone(params.row.id),
              icon: <CloneIcon fontSize="small" />,
              color: 'secondary',
            }
          ] : undefined}
        />
      ),
    });
  }

  return columns;
};
