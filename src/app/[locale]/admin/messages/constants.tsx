import { GridColDef } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { Message, MESSAGE_CATEGORIES, MESSAGE_TYPES } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const createColumns = (
  locale: string,
  onEdit: (message: Message) => void,
  canUpdate: boolean = true
): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: getLocalizedValue({ en: 'Code', ko: '코드', zh: '代码', vi: 'Mã' }, locale),
      flex: 1,
      minWidth: 180
    },
    {
      field: 'category',
      headerName: getLocalizedValue({ en: 'Category', ko: '카테고리', zh: '类别', vi: 'Danh mục' }, locale),
      flex: 0.8,
      minWidth: 120,
      valueGetter: (value) => {
        const category = MESSAGE_CATEGORIES.find(c => c.value === value);
        return category ? getLocalizedValue(category.label, locale) : value;
      }
    },
    {
      field: 'type',
      headerName: getLocalizedValue({ en: 'Type', ko: '타입', zh: '类型', vi: 'Loại' }, locale),
      flex: 0.6,
      minWidth: 100,
      valueGetter: (value) => {
        const type = MESSAGE_TYPES.find(t => t.value === value);
        return type ? getLocalizedValue(type.label, locale) : value;
      }
    },
    {
      field: 'message',
      headerName: getLocalizedValue({ en: 'Message', ko: '메시지', zh: '消息', vi: 'Tin nhắn' }, locale),
      flex: 1.5,
      minWidth: 250,
      valueGetter: (_value, row: Message) => getLocalizedValue(row.message, locale)
    },
    {
      field: 'description',
      headerName: getLocalizedValue({ en: 'Description', ko: '설명', zh: '描述', vi: 'Mô tả' }, locale),
      flex: 1.2,
      minWidth: 200,
      valueGetter: (_value, row: Message) => getLocalizedValue(row.description, locale)
    },
    {
      field: 'status',
      headerName: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
      flex: 0.6,
      minWidth: 100,
      valueGetter: (value) => value === 'active'
        ? getLocalizedValue({ en: 'Active', ko: '활성', zh: '激活', vi: 'Kích hoạt' }, locale)
        : getLocalizedValue({ en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' }, locale)
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
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(params.row as Message);
          }}
        >
          <Edit fontSize="small" />
        </IconButton>
      )
    });
  }

  return columns;
};
