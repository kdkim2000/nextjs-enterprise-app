'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
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
  Visibility,
  AttachFile,
  Home,
  AdminPanelSettings
} from '@mui/icons-material';
import { useCurrentLocale } from '@/lib/i18n/client';
import { apiClient } from '@/lib/api/client';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';

interface Post {
  id: string;
  title: string;
  authorName?: string;
  authorId?: string;
  isPinned: boolean;
  isSecret: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  attachmentCount: number;
  createdAt: string;
  status: string;
}

export default function AdminBoardListPage() {
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
            authorName: post.authorName || post.author_name,
            authorId: post.authorId || post.author_id,
            isPinned: post.isPinned || post.is_pinned,
            isSecret: post.isSecret || post.is_secret,
            viewCount: post.viewCount || post.view_count || 0,
            likeCount: post.likeCount || post.like_count || 0,
            commentCount: post.commentCount || post.comment_count || 0,
            attachmentCount: post.attachmentCount || post.attachment_count || 0,
            createdAt: post.createdAt || post.created_at,
            status: post.status
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
    router.push(`/admin/boards/${boardTypeId}/${post.id}`);
  };

  const handleWriteClick = () => {
    router.push(`/boards/${boardTypeId}/write`);
  };

  const boardName = useMemo(() => {
    if (!boardType) return '';
    const nameField = `name_${currentLocale}`;
    return (boardType as any)[nameField] || (boardType as any).name?.en || (boardType as any).name_en || '';
  }, [boardType, currentLocale]);

  // Loading state
  if (permLoading || loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  // Board not found
  if (!boardType) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Board not found</Alert>
      </Container>
    );
  }

  // No read permission
  if (!canRead) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          You do not have permission to access this board.
        </Alert>
      </Container>
    );
  }

  // Admin only check
  if (!canWrite) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Only administrators can manage this board.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => router.push('/')}
        >
          <Home sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => router.push('/admin')}
        >
          <AdminPanelSettings sx={{ mr: 0.5 }} fontSize="small" />
          Admin
        </Link>
        <Typography color="text.primary">{boardName}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {boardName}
          </Typography>
          <Chip label="Admin Board" size="small" color="error" variant="outlined" />
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleWriteClick}
        >
          Write Post
        </Button>
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
                        {post.isPinned && <PushPin fontSize="small" color="primary" />}
                        {post.isSecret && <Lock fontSize="small" color="action" />}
                        <Typography variant="body2">{post.title}</Typography>
                        {post.commentCount > 0 && (
                          <Chip
                            label={post.commentCount}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20 }}
                          />
                        )}
                        {post.attachmentCount > 0 && (
                          <AttachFile fontSize="small" color="action" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {post.authorName}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {post.viewCount}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {post.likeCount}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" color="text.secondary">
                        {new Date(post.createdAt).toLocaleDateString()}
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
    </Container>
  );
}
