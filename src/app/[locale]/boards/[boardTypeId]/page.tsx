'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Breadcrumbs,
  Link,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Add,
  Search,
  PushPin,
  Lock,
  ThumbUp,
  Comment,
  Visibility,
  AttachFile,
  Home
} from '@mui/icons-material';
import { useCurrentLocale } from '@/lib/i18n/client';
import { apiClient } from '@/lib/api/client';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';
import PostDetailDrawer from '@/components/common/PostDetailDrawer';

interface Post {
  id: string;
  title: string;
  author_name?: string;
  author_username?: string;
  is_pinned: boolean;
  is_secret: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  attachment_count: number;
  created_at: string;
}

export default function BoardListPage() {
  const params = useParams();
  const router = useRouter();
  const currentLocale = useCurrentLocale();
  const boardTypeId = params.boardTypeId as string;

  // Board permissions
  const { canWrite, canRead, boardType, loading: permLoading } = useBoardPermissions(boardTypeId);

  // State
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (!boardType) return;

      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(page + 1),
          limit: String(pageSize)
        });
        if (search) {
          params.append('search', search);
        }

        const response = await apiClient.get(`/post/board/${boardType.id}?${params}`);
        if (response.posts) {
          setPosts(response.posts.map((post: any) => ({
            id: post.id,
            title: post.title,
            author_name: post.authorName || post.author_name,
            author_username: post.authorUsername || post.author_username,
            is_pinned: post.isPinned || post.is_pinned,
            is_secret: post.isSecret || post.is_secret,
            view_count: post.viewCount || post.view_count || 0,
            like_count: post.likeCount || post.like_count || 0,
            comment_count: post.commentCount || post.comment_count || 0,
            attachment_count: post.attachmentCount || post.attachment_count || 0,
            created_at: post.createdAt || post.created_at
          })));
          setTotalCount(response.pagination?.totalCount || 0);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [boardType, page, pageSize, search]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setPage(0);
    }
  };

  const handlePostClick = (post: Post) => {
    setSelectedPostId(post.id);
    setDrawerOpen(true);
  };

  const handleWriteClick = () => {
    router.push(`/${currentLocale}/boards/${boardTypeId}/write`);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedPostId(null);
  };

  const handleEditPost = (postId: string) => {
    router.push(`/${currentLocale}/boards/${boardTypeId}/${postId}/edit`);
  };

  const handleDeletePost = async () => {
    // Refresh the post list after deletion
    const params = new URLSearchParams({
      page: String(page + 1),
      limit: String(pageSize)
    });
    if (search) {
      params.append('search', search);
    }

    try {
      const response = await apiClient.get(`/post/board/${boardType?.id}?${params}`);
      if (response.posts) {
        setPosts(response.posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          author_name: post.authorName || post.author_name,
          author_username: post.authorUsername || post.author_username,
          is_pinned: post.isPinned || post.is_pinned,
          is_secret: post.isSecret || post.is_secret,
          view_count: post.viewCount || post.view_count || 0,
          like_count: post.likeCount || post.like_count || 0,
          comment_count: post.commentCount || post.comment_count || 0,
          attachment_count: post.attachmentCount || post.attachment_count || 0,
          created_at: post.createdAt || post.created_at
        })));
        setTotalCount(response.pagination?.totalCount || 0);
      }
    } catch (error) {
      console.error('Error refreshing posts:', error);
    }
  };

  const boardName = useMemo(() => {
    if (!boardType) return '';
    const nameField = currentLocale === 'ko' ? 'name_ko' : currentLocale === 'zh' ? 'name_zh' : currentLocale === 'vi' ? 'name_vi' : 'name_en';
    return (boardType as any)[nameField] || (boardType as any).name_en || '';
  }, [boardType, currentLocale]);

  // Loading state
  if (permLoading || loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  // Board not found
  if (!boardType) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">Board not found</Alert>
      </Box>
    );
  }

  // No read permission
  if (!canRead) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">
          You do not have permission to access this board.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => router.push(`/${currentLocale}`)}
        >
          <Home sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Typography color="text.primary">{boardName}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {boardName}
          </Typography>
          {boardType.type === 'notice' && (
            <Chip label="Notice Board" size="small" color="error" variant="outlined" />
          )}
        </Box>
        {canWrite && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleWriteClick}
          >
            Write Post
          </Button>
        )}
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {/* Posts Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="60%">Title</TableCell>
                <TableCell align="center" width="120px">Author</TableCell>
                <TableCell align="center" width="80px">
                  <Visibility fontSize="small" />
                </TableCell>
                <TableCell align="center" width="80px">
                  <ThumbUp fontSize="small" />
                </TableCell>
                <TableCell align="center" width="100px">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={5}>
                      <Skeleton />
                    </TableCell>
                  </TableRow>
                ))
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No posts found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow
                    key={post.id}
                    hover
                    onClick={() => handlePostClick(post)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {post.is_pinned && <PushPin fontSize="small" color="primary" />}
                        {post.is_secret && <Lock fontSize="small" color="action" />}
                        <Typography variant="body2">{post.title}</Typography>
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
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {post.author_name || post.author_username}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {post.view_count}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {post.like_count}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" color="text.secondary">
                        {new Date(post.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>

      {/* Post Detail Drawer */}
      {selectedPostId && (
        <PostDetailDrawer
          open={drawerOpen}
          onClose={handleCloseDrawer}
          postId={selectedPostId}
          boardTypeId={boardTypeId}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
        />
      )}
    </Box>
  );
}
