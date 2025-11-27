'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import ActionsCell from '@/components/common/ActionsCell';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const ATTACHMENT_TYPE_STATUS = ['active', 'inactive'] as const;

export const STATUS_OPTIONS = [
  { value: 'active', labelEn: 'Active', labelKo: '활성', labelZh: '激活', labelVi: 'Hoạt động' },
  { value: 'inactive', labelEn: 'Inactive', labelKo: '비활성', labelZh: '未激活', labelVi: 'Không hoạt động' }
];

// Format bytes to human readable
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const createColumns = (
   
  t: any,
  locale: string,
  handleEdit: (id: string | number) => void,
  canUpdate: boolean = true
): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: getLocalizedValue({ en: 'Code', ko: '코드', zh: '代码', vi: 'Mã' }, locale),
      width: 150
    },
    {
      field: 'name',
      headerName: getLocalizedValue({ en: 'Name', ko: '이름', zh: '名称', vi: 'Tên' }, locale),
      width: 180,
      valueGetter: (_value, row) => getLocalizedValue(row.name, locale)
    },
    {
      field: 'storagePath',
      headerName: getLocalizedValue({ en: 'Storage Path', ko: '저장 경로', zh: '存储路径', vi: 'Đường dẫn lưu trữ' }, locale),
      width: 180
    },
    {
      field: 'maxFileCount',
      headerName: getLocalizedValue({ en: 'Max Files', ko: '최대 파일수', zh: '最大文件数', vi: 'Số file tối đa' }, locale),
      width: 100,
      type: 'number'
    },
    {
      field: 'maxFileSize',
      headerName: getLocalizedValue({ en: 'Max Size', ko: '최대 크기', zh: '最大大小', vi: 'Kích thước tối đa' }, locale),
      width: 110,
      valueGetter: (_value, row) => formatBytes(row.maxFileSize)
    },
    {
      field: 'allowedExtensions',
      headerName: getLocalizedValue({ en: 'Extensions', ko: '확장자', zh: '扩展名', vi: 'Phần mở rộng' }, locale),
      width: 200,
      valueGetter: (_value, row) => (row.allowedExtensions || []).join(', ')
    },
    {
      field: 'status',
      headerName: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
      width: 100,
      sortable: true,
      type: 'singleSelect',
      valueOptions: ['active', 'inactive'],
      renderCell: (params) => {
        const status = params.value as string;
        const color = status === 'active' ? 'success' : 'default';
        const label = STATUS_OPTIONS.find(opt => opt.value === status);
        const labelText = label
          ? getLocalizedValue({ en: label.labelEn, ko: label.labelKo, zh: label.labelZh, vi: label.labelVi }, locale)
          : status;
        return (
          <Chip
            label={labelText}
            color={color}
            size="small"
          />
        );
      }
    },
    {
      field: 'order',
      headerName: getLocalizedValue({ en: 'Order', ko: '순서', zh: '顺序', vi: 'Thứ tự' }, locale),
      width: 80,
      type: 'number'
    }
  ];

  if (canUpdate) {
    columns.push({
      field: 'actions',
      headerName: getLocalizedValue({ en: 'Actions', ko: '작업', zh: '操作', vi: 'Thao tác' }, locale),
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionsCell
          onEdit={() => handleEdit(params.row.id)}
          editTooltip={getLocalizedValue({ en: 'Edit', ko: '수정', zh: '编辑', vi: 'Sửa' }, locale)}
          showMore={false}
        />
      )
    });
  }

  return columns;
};
