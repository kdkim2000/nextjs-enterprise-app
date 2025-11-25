'use client';

import React from 'react';
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
  useTheme,
  alpha
} from '@mui/material';
import {
  PushPin,
  Lock,
  Visibility,
  ThumbUp,
  Comment,
  AttachFile,
  Add,
  Delete,
  Refresh
} from '@mui/icons-material';
import { useI18n } from '@/lib/i18n/client';

export interface BoardPost {
  id: string;
  title: string;
  author_name?: string;
  author_username?: string;
  is_pinned?: boolean;
  is_secret?: boolean;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  attachment_count?: number;
  tags?: string[];
  created_at?: string;
  status?: string;
}

export interface BoardListViewProps {
  posts: BoardPost[];
  loading?: boolean;
  // Pagination
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  // Selection
  checkboxSelection?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;
  // Actions
  onRowClick?: (postId: string) => void;
  onAdd?: () => void;
  onDelete?: (ids: (string | number)[]) => void;
  onRefresh?: () => void;
  // Customization
  showRowNumber?: boolean;
  locale?: string;
}

/**
 * BoardListView - A board-optimized list component
 *
 * Unlike ExcelDataGrid which is designed for data management,
 * BoardListView is optimized for displaying board posts with:
 * - Clean, readable layout
 * - Post metadata (views, likes, comments)
 * - Visual indicators (pinned, secret, attachments)
 * - Simplified actions
 */
export default function BoardListView({
  posts,
  loading = false,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  checkboxSelection = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  onAdd,
  onDelete,
  onRefresh,
  showRowNumber = true,
  locale = 'en'
}: BoardListViewProps) {
  const theme = useTheme();
  const t = useI18n();

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectionChange?.(posts.map(p => p.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectOne = (id: string) => {
    const currentIndex = selectedIds.indexOf(id);
    const newSelected = [...selectedIds];

    if (currentIndex === -1) {
      newSelected.push(id);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    onSelectionChange?.(newSelected);
  };

  const isSelected = (id: string) => selectedIds.includes(id);
  const isAllSelected = posts.length > 0 && selectedIds.length === posts.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < posts.length;

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      // Always show date and time in one line: MM/DD HH:mm
      const dateOptions: Intl.DateTimeFormatOptions = { month: '2-digit', day: '2-digit' };
      const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
      const datePart = date.toLocaleDateString(locale, dateOptions);
      const timePart = date.toLocaleTimeString(locale, timeOptions);
      return `${datePart} ${timePart}`;
    } catch {
      return dateStr;
    }
  };

  const getRowNumber = (index: number): number => {
    return totalCount - (page * pageSize) - index;
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar - Matching ExcelDataGrid style */}
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
        {/* Total Count Badge - Same as ExcelDataGrid */}
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
          {t('board.total')}: {totalCount.toLocaleString()}
        </Box>

        {selectedIds.length > 0 && (
          <Chip
            size="small"
            label={`${selectedIds.length} ${t('board.selected')}`}
            color="primary"
            variant="outlined"
          />
        )}

        <Box sx={{ flex: 1 }} />

        {/* Action Buttons - Icon Only, same as ExcelDataGrid */}
        {onAdd && (
          <Tooltip title={t('board.newPost')} arrow>
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
          <Tooltip title={t('board.deleteSelected')} arrow>
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
          <Tooltip title={t('common.refresh')} arrow>
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
      <TableContainer sx={{ flex: 1 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {checkboxSelection && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    width: 48,
                    bgcolor: '#f5f5f5',
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
                <TableCell align="center" sx={{ width: 60, bgcolor: '#f5f5f5', fontWeight: 600 }}>{t('board.no')}</TableCell>
              )}
              <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>{t('board.title')}</TableCell>
              <TableCell align="center" sx={{ width: 100, bgcolor: '#f5f5f5', fontWeight: 600 }}>{t('board.author')}</TableCell>
              <TableCell align="center" sx={{ width: 80, bgcolor: '#f5f5f5', fontWeight: 600 }}>
                <Tooltip title={t('board.views')}><Visibility fontSize="small" /></Tooltip>
              </TableCell>
              <TableCell align="center" sx={{ width: 60, bgcolor: '#f5f5f5', fontWeight: 600 }}>
                <Tooltip title={t('board.likes')}><ThumbUp fontSize="small" /></Tooltip>
              </TableCell>
              <TableCell align="center" sx={{ width: 60, bgcolor: '#f5f5f5', fontWeight: 600 }}>
                <Tooltip title={t('board.comments')}><Comment fontSize="small" /></Tooltip>
              </TableCell>
              <TableCell align="center" sx={{ width: 120, bgcolor: '#f5f5f5', fontWeight: 600 }}>{t('board.date')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={checkboxSelection ? 8 : 7}
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Typography color="text.secondary">
                    {t('board.noPosts')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post, index) => {
                const selected = isSelected(post.id);
                return (
                  <TableRow
                    key={post.id}
                    hover
                    selected={selected}
                    onClick={() => onRowClick?.(post.id)}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      bgcolor: post.is_pinned ? alpha(theme.palette.primary.main, 0.04) : undefined,
                      '&:hover': {
                        bgcolor: '#f0f7ff'  // Match ExcelDataGrid hover color
                      }
                    }}
                  >
                    {checkboxSelection && (
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected}
                          onChange={() => handleSelectOne(post.id)}
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
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {post.is_pinned && (
                          <Tooltip title={t('board.pinned')}>
                            <PushPin fontSize="small" color="primary" sx={{ fontSize: 16 }} />
                          </Tooltip>
                        )}
                        {post.is_secret && (
                          <Tooltip title={t('board.secret')}>
                            <Lock fontSize="small" color="action" sx={{ fontSize: 16 }} />
                          </Tooltip>
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: post.is_pinned ? 600 : 400,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 400
                          }}
                        >
                          {post.title}
                        </Typography>
                        {(post.attachment_count || 0) > 0 && (
                          <Tooltip title={`${post.attachment_count} ${t('board.attachments')}`}>
                            <AttachFile fontSize="small" color="action" sx={{ fontSize: 16 }} />
                          </Tooltip>
                        )}
                        {(post.comment_count || 0) > 0 && (
                          <Chip
                            size="small"
                            label={post.comment_count}
                            sx={{ height: 18, fontSize: '0.7rem' }}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {post.author_name || post.author_username || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {(post.view_count || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {post.like_count || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {post.comment_count || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(post.created_at)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination - Matching ExcelDataGrid options */}
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50, 100]}
        sx={{ borderTop: 1, borderColor: 'divider' }}
      />
    </Paper>
  );
}
