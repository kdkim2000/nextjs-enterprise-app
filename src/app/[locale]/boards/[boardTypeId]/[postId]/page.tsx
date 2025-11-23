'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  Breadcrumbs,
  Link,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  ThumbUp,
  ThumbUpOutlined,
  Download,
  Reply,
  Home,
  PushPin,
  Lock,
  Visibility,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { apiClient } from '@/lib/api/client';

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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const boardTypeId = params.boardTypeId as string;
  const postId = params.postId as string;

  // State
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/post/${postId}`);
        if (response.success) {
          setPost(response.data);
          // Check if current user is author
          // setIsAuthor(response.data.author_id === currentUserId);
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
  }, [postId]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await apiClient.get(`/comment/post/${postId}`);
        if (response.success) {
          setComments(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    if (post) {
      fetchComments();
    }
  }, [postId, post]);

  // Fetch attachments
  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const response = await apiClient.get(`/api/attachment/post/${postId}`);
        if (response.success) {
          setAttachments(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching attachments:', error);
      }
    };
    if (post) {
      fetchAttachments();
    }
  }, [postId, post]);

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
        if (commentsResponse.success) {
          setComments(commentsResponse.data || []);
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

  const handleEdit = () => {
    router.push(`/boards/${boardTypeId}/${postId}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await apiClient.delete(`/post/${postId}`);
      if (response.success) {
        router.push(`/boards/${boardTypeId}`);
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

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Post not found'}</Alert>
        <Button onClick={() => router.push(`/boards/${boardTypeId}`)} sx={{ mt: 2 }}>
          Back to Board
        </Button>
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
          onClick={() => router.push('/')}
        >
          <Home sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: 'pointer' }}
          onClick={() => router.push(`/boards/${boardTypeId}`)}
        >
          {post.board_type_name}
        </Link>
        <Typography color="text.primary">Post</Typography>
      </Breadcrumbs>

      {/* Actions */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push(`/boards/${boardTypeId}`)}>
          Back to List
        </Button>
        {isAuthor && (
          <Stack direction="row" spacing={1}>
            <Button startIcon={<Edit />} variant="outlined" onClick={handleEdit}>
              Edit
            </Button>
            <Button startIcon={<Delete />} color="error" onClick={handleDelete}>
              Delete
            </Button>
          </Stack>
        )}
      </Box>

      {/* Post Content */}
      <Paper sx={{ p: 3, mb: 2 }}>
        {/* Title */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            {post.is_pinned && <PushPin fontSize="small" color="primary" />}
            {post.is_secret && <Lock fontSize="small" color="action" />}
            <Typography variant="h4">{post.title}</Typography>
          </Stack>
          {post.tags && post.tags.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
              {post.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" variant="outlined" />
              ))}
            </Stack>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Metadata */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <Box
          sx={{
            py: 3,
            minHeight: 200,
            '& img': {
              maxWidth: '100%',
              height: 'auto'
            }
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Attachments */}
        {attachments.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
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
        <Divider sx={{ my: 3 }} />
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
      </Paper>

      {/* Comments */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comments ({comments.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />

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
      </Paper>
    </Box>
  );
}
