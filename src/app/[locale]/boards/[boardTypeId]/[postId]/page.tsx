'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  Chip,
  Divider,
  Tooltip,
  Button,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  ThumbUp,
  ThumbUpOutlined,
  Download,
  PushPin,
  Lock,
  Visibility,
  Comment as CommentIcon,
  Send,
  AttachFile
} from '@mui/icons-material';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { apiClient } from '@/lib/api/client';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';
import { useQnA } from '@/hooks/useQnA';
import { useAuth } from '@/contexts/AuthContext';
import { QnAStatusBadge } from '@/components/boards/QnAStatusBadge';
import PostFormModal from '@/components/boards/PostFormModal';
import { PostFormData } from '@/components/boards/PostFormFields';
import SafeHtmlRenderer from '@/components/common/SafeHtmlRenderer';
import RichTextEditor from '@/components/common/RichTextEditor';

interface Post {
  id: string;
  board_type_id: string;
  boardTypeId?: string;
  board_type_code: string;
  boardTypeCode?: string;
  board_type_name: string;
  boardTypeName?: string;
  title: string;
  content: string;
  author_id: string;
  authorId?: string;
  author_name?: string;
  authorName?: string;
  author_username?: string;
  authorUsername?: string;
  is_pinned: boolean;
  isPinned?: boolean;
  is_secret: boolean;
  isSecret?: boolean;
  view_count: number;
  viewCount?: number;
  like_count: number;
  likeCount?: number;
  comment_count: number;
  commentCount?: number;
  tags?: string[];
  created_at: string;
  createdAt?: string;
  updated_at: string;
  updatedAt?: string;
}

interface Comment {
  id: string;
  author_id: string;
  authorId?: string;
  author_name?: string;
  authorName?: string;
  author_username?: string;
  authorUsername?: string;
  content: string;
  created_at: string;
  createdAt?: string;
  is_accepted?: boolean;
  helpful_count?: number;
  quality_score?: number;
  parent_id?: string | null;
  replies?: Comment[];
}

interface Attachment {
  id: string;
  original_name: string;
  originalName?: string;
  file_size: number;
  fileSize?: number;
  mime_type: string;
  mimeType?: string;
}

// Normalize post data from API
const normalizePost = (data: any): Post => ({
  id: data.id,
  board_type_id: data.board_type_id || data.boardTypeId,
  board_type_code: data.board_type_code || data.boardTypeCode || '',
  board_type_name: data.board_type_name || data.boardTypeName || '',
  title: data.title || '',
  content: data.content || '',
  author_id: data.author_id || data.authorId || '',
  author_name: data.author_name || data.authorName,
  author_username: data.author_username || data.authorUsername,
  is_pinned: data.is_pinned ?? data.isPinned ?? false,
  is_secret: data.is_secret ?? data.isSecret ?? false,
  view_count: data.view_count ?? data.viewCount ?? 0,
  like_count: data.like_count ?? data.likeCount ?? 0,
  comment_count: data.comment_count ?? data.commentCount ?? 0,
  tags: data.tags || [],
  created_at: data.created_at || data.createdAt || '',
  updated_at: data.updated_at || data.updatedAt || ''
});

// Normalize comment data from API
const normalizeComment = (data: any): Comment => ({
  id: data.id,
  author_id: data.author_id || data.authorId || '',
  author_name: data.author_name || data.authorName,
  author_username: data.author_username || data.authorUsername,
  content: data.content || '',
  created_at: data.created_at || data.createdAt || '',
  is_accepted: data.is_accepted ?? data.isAccepted,
  helpful_count: data.helpful_count ?? data.helpfulCount,
  quality_score: data.quality_score ?? data.qualityScore,
  parent_id: data.parent_id ?? data.parentId,
  replies: data.replies
});

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const boardTypeId = params.boardTypeId as string;
  const postId = params.postId as string;
  const { user } = useAuth();

  // State
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostFormData | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Q&A hooks
  const { boardType } = useBoardPermissions(boardTypeId);
  const isQnABoard = boardType?.type === 'qna';
  const { qnaData } = useQnA(postId, post?.author_id);

  // Check if current user is author or admin
  const isAdmin = user?.role === 'admin';
  const isAuthor = post?.author_id === user?.id;
  const canEdit = isAuthor || isAdmin;

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/post/${postId}`);
        if (response.success && response.data) {
          const postData = response.data.post || response.data;
          const normalized = normalizePost(postData);
          setPost(normalized);
          setLikeCount(normalized.like_count || 0);
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
          const commentsData = response.data?.comments || response.data;
          if (Array.isArray(commentsData)) {
            setComments(commentsData.map(normalizeComment));
          } else {
            setComments([]);
          }
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
        const response = await apiClient.get(`/attachment/post/${postId}`);
        if (response.success) {
          const attachmentsData = response.data?.attachments || response.data;
          setAttachments(Array.isArray(attachmentsData) ? attachmentsData : []);
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
        setLikeCount(prev => prev + (liked ? -1 : 1));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || newComment === '<p></p>') return;

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
          const commentsData = commentsResponse.data?.comments || commentsResponse.data;
          if (Array.isArray(commentsData)) {
            setComments(commentsData.map(normalizeComment));
          }
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
    if (!post) return;

    setEditingPost({
      id: post.id,
      title: post.title,
      content: post.content,
      tags: post.tags || [],
      isSecret: post.is_secret,
      isPinned: post.is_pinned
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPost || !post) return;

    try {
      setSaveLoading(true);

      const postData = {
        title: editingPost.title.trim(),
        content: editingPost.content,
        tags: editingPost.tags || [],
        isSecret: editingPost.isSecret,
        isPinned: editingPost.isPinned,
        showPopup: editingPost.showPopup,
        displayStartDate: editingPost.displayStartDate,
        displayEndDate: editingPost.displayEndDate
      };

      const response = await apiClient.put(`/post/${post.id}`, postData);
      if (response.success) {
        setPost({
          ...post,
          title: editingPost.title,
          content: editingPost.content,
          tags: editingPost.tags,
          is_secret: editingPost.isSecret,
          is_pinned: editingPost.isPinned || false
        });
        setEditModalOpen(false);
        setEditingPost(null);
      }
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingPost(null);
  };

  const handleDelete = async () => {
    if (!window.confirm(t('common.confirm'))) return;

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

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString(currentLocale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">{error || t('common.error')}</Alert>
        <Button onClick={() => router.push(`/boards/${boardTypeId}`)} sx={{ mt: 2 }}>
          {t('board.backToList')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      {/* Header Actions */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tooltip title={t('board.backToList')}>
          <IconButton onClick={() => router.push(`/boards/${boardTypeId}`)}>
            <ArrowBack />
          </IconButton>
        </Tooltip>
        {canEdit && (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={t('board.editPost')}>
              <IconButton onClick={handleEdit} color="primary">
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('board.deletePost')}>
              <IconButton onClick={handleDelete} color="error">
                <Delete />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Box>

      {/* Post Content */}
      <Paper sx={{ p: 3, mb: 2 }}>
        {/* Title */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            {post.is_pinned && (
              <Tooltip title={t('board.pinned')}>
                <PushPin fontSize="small" color="primary" />
              </Tooltip>
            )}
            {post.is_secret && (
              <Tooltip title={t('board.secret')}>
                <Lock fontSize="small" color="action" />
              </Tooltip>
            )}
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{post.title}</Typography>
          </Stack>
          {isQnABoard && qnaData && (
            <Box sx={{ mt: 1 }}>
              <QnAStatusBadge status={qnaData.question_status} />
            </Box>
          )}
          {post.tags && post.tags.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
              {post.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" variant="outlined" />
              ))}
            </Stack>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Metadata */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {(post.author_name || post.author_username || 'U')[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {post.author_name || post.author_username || 'Unknown'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(post.created_at)}
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title={t('board.views')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Visibility fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">{post.view_count || 0}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title={t('board.likes')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ThumbUp fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">{likeCount}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title={t('board.comments')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CommentIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">{comments.length}</Typography>
              </Box>
            </Tooltip>
          </Stack>
        </Box>

        {/* Content - Using SafeHtmlRenderer for XSS protection */}
        <Box sx={{ py: 2, minHeight: 150 }}>
          <SafeHtmlRenderer
            html={post.content}
            sx={{
              '& p:first-of-type': { marginTop: 0 },
              '& p:last-of-type': { marginBottom: 0 }
            }}
          />
        </Box>

        {/* Attachments */}
        {attachments.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <AttachFile fontSize="small" color="action" />
                <Typography variant="subtitle2">
                  {t('board.attachmentsTitle')} ({attachments.length})
                </Typography>
              </Stack>
              <List dense>
                {attachments.map((attachment) => (
                  <ListItem
                    key={attachment.id}
                    secondaryAction={
                      <Tooltip title={t('common.download')}>
                        <IconButton edge="end" onClick={() => handleDownload(attachment)} size="small">
                          <Download />
                        </IconButton>
                      </Tooltip>
                    }
                    sx={{ py: 0.5 }}
                  >
                    <ListItemText
                      primary={attachment.original_name || attachment.originalName}
                      secondary={formatFileSize(attachment.file_size || attachment.fileSize || 0)}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}

        {/* Like Button */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title={liked ? t('board.unlike') : t('board.like')}>
            <IconButton
              onClick={handleLike}
              color={liked ? 'primary' : 'default'}
              sx={{
                border: 1,
                borderColor: liked ? 'primary.main' : 'divider',
                borderRadius: 2,
                px: 3,
                py: 1,
                gap: 1
              }}
            >
              {liked ? <ThumbUp /> : <ThumbUpOutlined />}
              <Typography variant="body2" fontWeight={500}>{likeCount}</Typography>
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Comments Section */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <CommentIcon color="action" />
          <Typography variant="h6">
            {t('board.commentsTitle')} ({comments.length})
          </Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />

        {/* New Comment with RichTextEditor */}
        <Box sx={{ mb: 3 }}>
          <RichTextEditor
            value={newComment}
            onChange={setNewComment}
            placeholder={t('board.writeComment')}
            minHeight={120}
          />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title={t('board.submitComment')}>
              <span>
                <IconButton
                  onClick={handleSubmitComment}
                  disabled={submittingComment || !newComment.trim() || newComment === '<p></p>'}
                  color="primary"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&:disabled': { bgcolor: 'action.disabledBackground' }
                  }}
                >
                  {submittingComment ? <CircularProgress size={20} color="inherit" /> : <Send />}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        {/* Comment List */}
        {comments.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            {t('board.noComments')}
          </Typography>
        ) : (
          <List disablePadding>
            {comments.map((comment, index) => (
              <React.Fragment key={comment.id}>
                {index > 0 && <Divider sx={{ my: 1 }} />}
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 36, height: 36 }}>
                      {(comment.author_name || comment.author_username || 'U')[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2">
                          {comment.author_name || comment.author_username || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(comment.created_at)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <SafeHtmlRenderer
                        html={comment.content}
                        sx={{
                          fontSize: '0.875rem',
                          '& p': { marginTop: 0, marginBottom: '0.5em' },
                          '& p:last-child': { marginBottom: 0 }
                        }}
                      />
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Edit Post Modal */}
      <PostFormModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
        post={editingPost}
        onChange={setEditingPost}
        mode="edit"
        saveLoading={saveLoading}
        boardSettings={boardType?.settings}
        isAdmin={isAdmin}
      />
    </Box>
  );
}
