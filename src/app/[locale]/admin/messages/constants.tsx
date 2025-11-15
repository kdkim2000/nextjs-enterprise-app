import { GridColDef } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { Message, MESSAGE_CATEGORIES, MESSAGE_TYPES } from './types';

export const createColumns = (
  locale: string,
  onEdit: (message: Message) => void,
  canUpdate: boolean = true
): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: locale === 'ko' ? '코드' : 'Code',
      flex: 1,
      minWidth: 180
    },
    {
      field: 'category',
      headerName: locale === 'ko' ? '카테고리' : 'Category',
      flex: 0.8,
      minWidth: 120,
      valueGetter: (value) => {
        const category = MESSAGE_CATEGORIES.find(c => c.value === value);
        return category ? (locale === 'ko' ? category.label.ko : category.label.en) : value;
      }
    },
    {
      field: 'type',
      headerName: locale === 'ko' ? '타입' : 'Type',
      flex: 0.6,
      minWidth: 100,
      valueGetter: (value) => {
        const type = MESSAGE_TYPES.find(t => t.value === value);
        return type ? (locale === 'ko' ? type.label.ko : type.label.en) : value;
      }
    },
    {
      field: 'message',
      headerName: locale === 'ko' ? '메시지' : 'Message',
      flex: 1.5,
      minWidth: 250,
      valueGetter: (_value, row: Message) => locale === 'ko' ? row.message.ko : row.message.en
    },
    {
      field: 'description',
      headerName: locale === 'ko' ? '설명' : 'Description',
      flex: 1.2,
      minWidth: 200,
      valueGetter: (_value, row: Message) => locale === 'ko' ? row.description.ko : row.description.en
    },
    {
      field: 'status',
      headerName: locale === 'ko' ? '상태' : 'Status',
      flex: 0.6,
      minWidth: 100,
      valueGetter: (value) => value === 'active'
        ? (locale === 'ko' ? '활성' : 'Active')
        : (locale === 'ko' ? '비활성' : 'Inactive')
    }
  ];

  if (canUpdate) {
    columns.push({
      field: 'actions',
      headerName: locale === 'ko' ? '작업' : 'Actions',
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
