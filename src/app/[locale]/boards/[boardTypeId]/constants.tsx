'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Box, Chip, Typography } from '@mui/material';
import { PushPin, Lock, Comment, AttachFile, Visibility, ThumbUp } from '@mui/icons-material';
import ActionsCell from '@/components/common/ActionsCell';
import { Post } from './types';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export const createColumns = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  locale: string,
  handleView: (id: string) => void,
  canUpdate: boolean = true
): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: getLocalizedValue({ en: 'ID', ko: 'ID', zh: 'ID', vi: 'ID' }, locale),
      width: 70
    },
    {
      field: 'title',
      headerName: getLocalizedValue({ en: 'Title', ko: '제목', zh: '标题', vi: 'Tiêu đề' }, locale),
      flex: 1,
      minWidth: 300,
      renderCell: (params) => {
        const post = params.row as Post;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
            {post.is_pinned && <PushPin fontSize="small" color="primary" />}
            {post.is_secret && <Lock fontSize="small" color="action" />}
            <Typography variant="body2" sx={{ flex: 1 }}>
              {post.title}
            </Typography>
            {post.comment_count > 0 && (
              <Chip
                icon={<Comment fontSize="small" />}
                label={post.comment_count}
                size="small"
                variant="outlined"
                sx={{ height: 20 }}
              />
            )}
            {post.attachment_count > 0 && (
              <AttachFile fontSize="small" color="action" />
            )}
          </Box>
        );
      }
    },
    {
      field: 'author_name',
      headerName: getLocalizedValue({ en: 'Author', ko: '작성자', zh: '作者', vi: 'Tác giả' }, locale),
      width: 120,
      valueGetter: (_value, row) => row.author_name || row.author_username || '-'
    },
    {
      field: 'view_count',
      headerName: getLocalizedValue({ en: 'Views', ko: '조회', zh: '查看', vi: 'Xem' }, locale),
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Visibility fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {params.row.view_count || 0}
          </Typography>
        </Box>
      )
    },
    {
      field: 'like_count',
      headerName: getLocalizedValue({ en: 'Likes', ko: '좋아요', zh: '点赞', vi: 'Thích' }, locale),
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ThumbUp fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {params.row.like_count || 0}
          </Typography>
        </Box>
      )
    },
    {
      field: 'created_at',
      headerName: getLocalizedValue({ en: 'Date', ko: '작성일', zh: '日期', vi: 'Ngày' }, locale),
      width: 110,
      valueFormatter: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString();
      }
    },
    {
      field: 'status',
      headerName: getLocalizedValue({ en: 'Status', ko: '상태', zh: '状态', vi: 'Trạng thái' }, locale),
      width: 100,
      renderCell: (params) => {
        const status = params.row.status || 'published';
        const colorMap: Record<string, 'success' | 'default' | 'warning'> = {
          published: 'success',
          draft: 'default',
          archived: 'warning'
        };
        const labelMap: Record<string, Record<string, string>> = {
          published: { en: 'Published', ko: '게시됨', zh: '已发布', vi: 'Đã xuất bản' },
          draft: { en: 'Draft', ko: '임시저장', zh: '草稿', vi: 'Bản nháp' },
          archived: { en: 'Archived', ko: '보관됨', zh: '已归档', vi: 'Đã lưu trữ' }
        };
        return (
          <Chip
            label={getLocalizedValue(labelMap[status] || labelMap.published, locale)}
            size="small"
            color={colorMap[status] || 'default'}
          />
        );
      }
    }
  ];

  if (canUpdate) {
    columns.push({
      field: 'actions',
      headerName: getLocalizedValue({ en: 'Actions', ko: '작업', zh: '操作', vi: 'Thao tác' }, locale),
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <ActionsCell
            onEdit={() => handleView(params.row.id)}
            editTooltip={getLocalizedValue({ en: 'View Post', ko: '게시글 보기', zh: '查看帖子', vi: 'Xem bài viết' }, locale)}
            showMore={false}
          />
        );
      }
    });
  }

  return columns;
};
