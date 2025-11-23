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
  Alert
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

interface Post {
  id: string;
  board_type_id: string;
  board_type_code: string;
  board_type_name: string;
  title: string;
  content: string;
  author_id: string;
  author_name?: string;
  author_username?: string;
  is_pinned: boolean;
  is_secret: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  author_name?: string;
  author_username?: string;
  content: string;
  created_at: string;
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
}

export default function PostDetailDrawer({
  open,
  onClose,
  postId,
  onEdit,
  onDelete
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
  const [isAuthor] = useState(false);

  // Fetch post details
  useEffect(() => {
    if (!open || !postId) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/post/${postId}`);
        if (response.success && response.data) {
          setPost(response.data.post || response.data);
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
    try {
      const response = liked
        ? await apiClient.post(`/post/${postId}/unlike`)
        : await apiClient.post(`/post/${postId}/like`);

      if (response.success) {
        setLiked(!liked);
        setPost((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            like_count: prev.like_count + (liked ? -1 : 1)
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
      onEdit(post.id);
    }
  };

  const handleDeleteClick = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await apiClient.delete(`/post/${postId}`);
      if (response.success) {
        if (onDelete) {
          onDelete();
        }
        onClose();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
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
            {isAuthor && post && (
              <>
                <IconButton onClick={handleEditClick} size="small" color="primary">
                  <Edit />
                </IconButton>
                <IconButton onClick={handleDeleteClick} size="small" color="error">
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
                  {post.is_pinned && <PushPin fontSize="small" color="primary" />}
                  {post.is_secret && <Lock fontSize="small" color="action" />}
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
                    <strong>{post.author_name || post.author_username}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(post.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Visibility fontSize="small" color="action" />
                    <Typography variant="body2">{post.view_count}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ThumbUp fontSize="small" color="action" />
                    <Typography variant="body2">{post.like_count}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CommentIcon fontSize="small" color="action" />
                    <Typography variant="body2">{post.comment_count}</Typography>
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
                  Like ({post.like_count})
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
                    {comments.map((comment) => (
                      <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar>{comment.author_name?.[0] || 'U'}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2">
                                {comment.author_name || comment.author_username}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(comment.created_at).toLocaleString()}
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
                    ))}
                  </List>
                )}
              </Box>
            </Stack>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
