'use client';

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Divider,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Close,
  Edit,
  Delete,
  ThumbUp,
  ThumbUpOutlined,
  Download,
  PushPin,
  Lock,
  Visibility,
  Comment as CommentIcon
} from '@mui/icons-material';
import { apiClient } from '@/lib/api/client';
import SafeHtmlRenderer from '@/components/common/SafeHtmlRenderer';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';

interface Post {
  id: string;
  boardTypeId?: string;
  board_type_id?: string;
  board_type_code?: string;
  board_type_name?: string;
  title: string;
  content: string;
  authorId?: string;
  author_id?: string;
  authorName?: string;
  author_name?: string;
  authorUsername?: string;
  author_username?: string;
  isPinned?: boolean;
  is_pinned?: boolean;
  isSecret?: boolean;
  is_secret?: boolean;
  viewCount?: number;
  view_count?: number;
  likeCount?: number;
  like_count?: number;
  commentCount?: number;
  comment_count?: number;
  tags?: string[];
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

interface Comment {
  id: string;
  authorName?: string;
  author_name?: string;
  authorUsername?: string;
  author_username?: string;
  content: string;
  createdAt?: string;
  created_at?: string;
  replies?: Comment[];
}

interface Attachment {
  id: string;
  original_name: string;
  file_size: number;
  mime_type: string;
}

export interface PostDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  boardTypeId: string;
  onEdit?: (postId: string) => void;
  onDelete?: () => void;
  canWrite?: boolean;
}

export default function PostDetailDrawer({
  open,
  onClose,
  postId,
  onEdit,
  onDelete,
  canWrite = false
}: PostDetailDrawerProps) {
  // State
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch post details
  useEffect(() => {
    if (!open || !postId) return;

    const fetchPost = async () => {
      try {
        setLoading(true);

        // Fetch post data
        const response = await apiClient.get(`/post/${postId}`);
        if (response.success && response.data) {
          const postData = response.data.post || response.data;
          setPost(postData);

          // Increment view count and update the view count in state
          try {
            const viewResponse = await apiClient.get(`/post/${postId}/view`);
            console.log('[PostDetailDrawer] View response:', viewResponse);

            if (viewResponse.success && viewResponse.data) {
              // Update view count with the response from the server
              setPost((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  viewCount: viewResponse.data.viewCount,
                  view_count: viewResponse.data.viewCount
                };
              });
            }
          } catch (viewError) {
            console.error('Error recording view:', viewError);
            // Don't fail if view count fails
          }
        } else {
          setError(response.error || 'Failed to load post');
        }
      } catch (error: any) {
        console.error('Error fetching post:', error);
        setError(error.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, open]);

  // Fetch comments
  useEffect(() => {
    if (!open || !postId || !post) return;

    const fetchComments = async () => {
      try {
        const response = await apiClient.get(`/comment/post/${postId}`);
        if (response.success && response.data) {
          setComments(response.data.comments || []);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
  }, [postId, post, open]);

  // Fetch attachments
  useEffect(() => {
    if (!open || !postId || !post) return;

    const fetchAttachments = async () => {
      try {
        const response = await apiClient.get(`/attachment/post/${postId}`);
        if (response.success && response.data) {
          setAttachments(response.data.attachments || []);
        }
      } catch (error) {
        console.error('Error fetching attachments:', error);
      }
    };
    fetchAttachments();
  }, [postId, post, open]);

  const handleLike = async () => {
    if (!post) return;

    try {
      const response = liked
        ? await apiClient.delete(`/post/${postId}/like`)
        : await apiClient.post(`/post/${postId}/like`);

      if (response.success) {
        setLiked(!liked);

        // Update like count - handle both camelCase and snake_case
        const currentLikeCount = post.likeCount ?? post.like_count ?? 0;

        setPost((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            likeCount: currentLikeCount + (liked ? -1 : 1),
            like_count: currentLikeCount + (liked ? -1 : 1)
          };
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await apiClient.post('/comment', {
        postId,
        content: newComment
      });

      if (response.success) {
        setNewComment('');
        // Refetch comments
        const commentsResponse = await apiClient.get(`/comment/post/${postId}`);
        if (commentsResponse.success && commentsResponse.data) {
          setComments(commentsResponse.data.comments || []);
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      window.open(`/api/attachment/${attachment.id}/download`, '_blank');
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  const handleEditClick = () => {
    if (onEdit && post) {
      // Close current drawer first
      onClose();
      // Then trigger edit in parent
      onEdit(post.id);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      const response = await apiClient.delete(`/post/${postId}`);

      if (response.success) {
        // Show success message
        setSnackbar({
          open: true,
          message: 'Post deleted successfully!',
          severity: 'success'
        });

        // Call onDelete callback to refresh the list
        if (onDelete) {
          onDelete();
        }

        // Close dialog and drawer
        setDeleteDialogOpen(false);
        setTimeout(() => onClose(), 500); // Delay to show snackbar
      } else {
        // Show error message from API
        setSnackbar({
          open: true,
          message: response.error || 'Failed to delete post',
          severity: 'error'
        });
        setDeleteDialogOpen(false);
      }
    } catch (error: any) {
      // Show error message
      const errorMsg = error.response?.data?.error || error.message || 'Failed to delete post';
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
      setDeleteDialogOpen(false);
      console.error('Error deleting post:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: '90%', md: '80%', lg: 900 } }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6">Post Details</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canWrite && post && (
              <>
                <IconButton onClick={handleEditClick} size="small" color="primary" disabled={loading}>
                  <Edit />
                </IconButton>
                <IconButton onClick={handleDeleteClick} size="small" color="error" disabled={loading}>
                  <Delete />
                </IconButton>
              </>
            )}
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error || !post ? (
            <Alert severity="error">{error || 'Post not found'}</Alert>
          ) : (
            <Stack spacing={3}>
              {/* Title */}
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  {(post.isPinned ?? post.is_pinned) && <PushPin fontSize="small" color="primary" />}
                  {(post.isSecret ?? post.is_secret) && <Lock fontSize="small" color="action" />}
                  <Typography variant="h5">{post.title}</Typography>
                </Stack>
                {post.tags && post.tags.length > 0 && (
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                    {post.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                )}
              </Box>

              <Divider />

              {/* Metadata */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2">
                    <strong>{post.authorName || post.author_name || post.authorUsername || post.author_username}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(post.createdAt || post.created_at || '').toLocaleString()}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Visibility fontSize="small" color="action" />
                    <Typography variant="body2">{post.viewCount ?? post.view_count ?? 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ThumbUp fontSize="small" color="action" />
                    <Typography variant="body2">{post.likeCount ?? post.like_count ?? 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CommentIcon fontSize="small" color="action" />
                    <Typography variant="body2">{post.commentCount ?? post.comment_count ?? 0}</Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Content */}
              <SafeHtmlRenderer
                html={post.content}
                sx={{
                  py: 2,
                  minHeight: 200
                }}
              />

              {/* Attachments */}
              {attachments.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Attachments ({attachments.length})
                    </Typography>
                    <List>
                      {attachments.map((attachment) => (
                        <ListItem
                          key={attachment.id}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => handleDownload(attachment)}>
                              <Download />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={attachment.original_name}
                            secondary={formatFileSize(attachment.file_size)}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </>
              )}

              {/* Like Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant={liked ? 'contained' : 'outlined'}
                  startIcon={liked ? <ThumbUp /> : <ThumbUpOutlined />}
                  onClick={handleLike}
                  size="large"
                >
                  Like ({post.likeCount ?? post.like_count ?? 0})
                </Button>
              </Box>

              <Divider />

              {/* Comments */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Comments ({comments.length})
                </Typography>

                {/* New Comment */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSubmitComment}
                    disabled={submittingComment || !newComment.trim()}
                  >
                    Submit Comment
                  </Button>
                </Box>

                {/* Comment List */}
                {comments.length === 0 ? (
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    No comments yet
                  </Typography>
                ) : (
                  <List>
                    {comments.map((comment) => {
                      const authorName = comment.authorName || comment.author_name || comment.authorUsername || comment.author_username || 'Unknown';
                      const createdAt = comment.createdAt || comment.created_at || '';

                      return (
                        <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar>{authorName[0]?.toUpperCase() || 'U'}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2">
                                  {authorName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(createdAt).toLocaleString()}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {comment.content}
                              </Typography>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Stack>
          )}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        itemCount={1}
        itemName="post"
        itemsList={post ? [{ id: post.id, displayName: post.title }] : []}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Confirm Delete"
        cancelText="Cancel"
        confirmText="Delete"
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Drawer>
  );
}
