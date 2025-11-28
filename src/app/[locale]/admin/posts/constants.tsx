import { GridColDef } from '@mui/x-data-grid-pro';
import { Post } from './types';
import ActionsCell from '@/components/common/ActionsCell';
import { Chip, Box, Tooltip } from '@mui/material';
import { PushPin, Lock, CheckCircle, Visibility, ThumbUp, Comment, AttachFile } from '@mui/icons-material';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const createColumns = (
   
  t: any,
  currentLocale: string,
  handleEdit: (row: Post) => void,
  handleView: (row: Post) => void,
  handleApprove: (row: Post) => void,
  handlePin: (row: Post) => void,
  editable: boolean
): GridColDef<Post>[] => {
  return [
    {
      field: 'board_type_name',
      headerName: 'Board',
      width: 150,
      editable: false
    },
    {
      field: 'title',
      headerName: t('common.title') || 'Title',
      flex: 1,
      minWidth: 250,
      editable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {params.row.is_pinned && (
            <Tooltip title="Pinned">
              <PushPin fontSize="small" color="primary" />
            </Tooltip>
          )}
          {params.row.is_secret && (
            <Tooltip title="Secret">
              <Lock fontSize="small" color="action" />
            </Tooltip>
          )}
          {!params.row.is_approved && (
            <Tooltip title="Pending Approval">
              <Chip label="Pending" size="small" color="warning" sx={{ height: 20 }} />
            </Tooltip>
          )}
          <span>{params.value}</span>
        </Box>
      )
    },
    {
      field: 'author_username',
      headerName: 'Author',
      width: 130,
      editable: false,
      valueGetter: (value, row) => row.author_username || row.author_name || row.author_id
    },
    {
      field: 'view_count',
      headerName: 'Views',
      width: 90,
      type: 'number',
      editable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', width: '100%' }}>
          <Visibility fontSize="small" sx={{ color: 'action.disabled' }} />
          {params.value?.toLocaleString() || 0}
        </Box>
      )
    },
    {
      field: 'like_count',
      headerName: 'Likes',
      width: 90,
      type: 'number',
      editable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', width: '100%' }}>
          <ThumbUp fontSize="small" sx={{ color: 'action.disabled' }} />
          {params.value?.toLocaleString() || 0}
        </Box>
      )
    },
    {
      field: 'comment_count',
      headerName: 'Comments',
      width: 110,
      type: 'number',
      editable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', width: '100%' }}>
          <Comment fontSize="small" sx={{ color: 'action.disabled' }} />
          {params.value?.toLocaleString() || 0}
        </Box>
      )
    },
    {
      field: 'attachment_count',
      headerName: 'Files',
      width: 90,
      type: 'number',
      editable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', width: '100%' }}>
          <AttachFile fontSize="small" sx={{ color: 'action.disabled' }} />
          {params.value?.toLocaleString() || 0}
        </Box>
      )
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 160,
      editable: false,
      valueFormatter: (value) => {
        if (!value) return '';
        return new Date(value).toLocaleString(currentLocale);
      }
    },
    {
      field: 'status',
      headerName: t('common.status'),
      width: 100,
      editable: false,
      renderCell: (params) => {
        const status = params.value as string;
        const isPublished = status === 'published';
        const isDraft = status === 'draft';
        return (
          <Chip
            label={isPublished
              ? getLocalizedValue({ en: 'Published', ko: '게시됨', zh: '已发布', vi: 'Đã xuất bản' }, currentLocale)
              : isDraft
                ? getLocalizedValue({ en: 'Draft', ko: '임시', zh: '草稿', vi: 'Bản nháp' }, currentLocale)
                : getLocalizedValue({ en: 'Inactive', ko: '비활성', zh: '未激活', vi: 'Không hoạt động' }, currentLocale)
            }
            size="small"
            color={isPublished ? 'success' : isDraft ? 'warning' : 'default'}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 150,
      sortable: false,
      filterable: false,
      editable: false,
      renderCell: (params) => (
        <ActionsCell
          row={params.row}
          onEdit={() => handleEdit(params.row)}
          onView={() => handleView(params.row)}
          editable={editable}
          customActions={[
            ...(!params.row.is_approved
              ? [
                  {
                    label: 'Approve',
                    onClick: () => handleApprove(params.row),
                    icon: <CheckCircle fontSize="small" />
                  }
                ]
              : []),
            {
              label: params.row.is_pinned ? 'Unpin' : 'Pin',
              onClick: () => handlePin(params.row),
              icon: <PushPin fontSize="small" />
            }
          ]}
        />
      )
    }
  ];
};
