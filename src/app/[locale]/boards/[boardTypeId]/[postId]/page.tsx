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
  AttachFile,
  CalendarToday,
  Person
} from '@mui/icons-material';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { apiClient } from '@/lib/api/client';
import { useBoardPermissions } from '@/hooks/useBoardPermissions';
import { useQnA } from '@/hooks/useQnA';
import { useAuth } from '@/contexts/AuthContext';
import { QnAStatusBadge } from '@/components/boards/QnAStatusBadge';
import SafeHtmlRenderer from '@/components/common/SafeHtmlRenderer';
import RichTextEditor from '@/components/common/RichTextEditor';
import PageContainer from '@/components/common/PageContainer';
import PageHeader from '@/components/common/PageHeader';
import { MetaInfo } from '@/components/common/Badge';
import { formatDate as formatDateUtil } from '@/lib/utils/date';

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

interface AttachmentFile {
  id: string;
  attachmentId: string;
  originalFilename: string;
  fileExtension: string;
  mimeType: string;
  fileSize: number;
  isImage: boolean;
  downloadCount: number;
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
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Q&A hooks
  const { boardType, canWrite } = useBoardPermissions(boardTypeId);
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

  // Fetch attachments using new reference-based API
  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const response = await apiClient.get(`/attachment/reference/post/${postId}`);
        if (response.success) {
          const attachmentsData = response.data?.attachments || response.data;
          // Extract files from all attachments
          const allFiles: AttachmentFile[] = [];
          if (Array.isArray(attachmentsData)) {
            attachmentsData.forEach((attachment: any) => {
              if (attachment.files && Array.isArray(attachment.files)) {
                allFiles.push(...attachment.files);
              }
            });
          }
          setAttachments(allFiles);
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

  const handleDownload = async (file: AttachmentFile) => {
    try {
      // Use token for authenticated download
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      window.open(`${baseUrl}/attachment/file/${file.id}/download?token=${token}`, '_blank');
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  // Navigate to edit page
  const handleEdit = () => {
    router.push(`/${currentLocale}/boards/${boardTypeId}/${postId}/edit`);
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
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box sx={{ flex: 1, minHeight: 0, p: 4 }}>
        <Alert severity="error">{error || t('common.error')}</Alert>
        <Button onClick={() => router.push(`/boards/${boardTypeId}`)} sx={{ mt: 2 }}>
          {t('board.backToList')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Fixed Header Area */}
      <Box sx={{ flexShrink: 0, borderBottom: '1px solid', borderColor: 'grey.200', bgcolor: 'white' }}>
        <PageContainer sx={{ pb: 0, pt: 1 }}>
          <PageHeader useMenu showBreadcrumb compact />

          {/* Title Bar with Controls */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 1.5
            }}
          >
            {/* Left: Back + Title */}
            <Tooltip title={t('board.backToList')}>
              <IconButton
                onClick={() => router.push(`/${currentLocale}/boards/${boardTypeId}`)}
                sx={{
                  bgcolor: 'grey.100',
                  width: 40,
                  height: 40,
                  '&:hover': { bgcolor: 'grey.200' }
                }}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Title + Badges */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'grey.800'
                  }}
                >
                  {post.title}
                </Typography>
                {post.is_pinned && (
                  <Chip
                    size="small"
                    icon={<PushPin sx={{ fontSize: 12 }} />}
                    label={t('board.pinned')}
                    sx={{
                      height: 20,
                      bgcolor: '#3b82f615',
                      color: '#3b82f6',
                      fontWeight: 500,
                      fontSize: '0.65rem',
                      flexShrink: 0,
                      '& .MuiChip-icon': { color: '#3b82f6' }
                    }}
                  />
                )}
                {post.is_secret && (
                  <Chip
                    size="small"
                    icon={<Lock sx={{ fontSize: 12 }} />}
                    label={t('board.secret')}
                    sx={{
                      height: 20,
                      bgcolor: '#f59e0b15',
                      color: '#f59e0b',
                      fontWeight: 500,
                      fontSize: '0.65rem',
                      flexShrink: 0,
                      '& .MuiChip-icon': { color: '#f59e0b' }
                    }}
                  />
                )}
                {isQnABoard && qnaData && (
                  <QnAStatusBadge status={qnaData.question_status} />
                )}
              </Box>
              {/* Meta Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.25 }}>
                <MetaInfo icon={<Person sx={{ fontSize: 11 }} />} value={post.author_name || post.author_username || 'Unknown'} size="small" />
                <MetaInfo icon={<CalendarToday sx={{ fontSize: 11 }} />} value={formatDate(post.created_at)} size="small" />
                <MetaInfo icon={<Visibility sx={{ fontSize: 11 }} />} value={post.view_count || 0} size="small" />
                <MetaInfo icon={<ThumbUp sx={{ fontSize: 11 }} />} value={likeCount} size="small" />
                <MetaInfo icon={<CommentIcon sx={{ fontSize: 11 }} />} value={comments.length} size="small" />
              </Box>
            </Box>

            {/* Right: Controls */}
            {canEdit && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                <Tooltip title={t('board.editPost')}>
                  <IconButton
                    onClick={handleEdit}
                    sx={{
                      bgcolor: 'grey.100',
                      width: 40,
                      height: 40,
                      '&:hover': { bgcolor: 'grey.200' }
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('board.deletePost')}>
                  <IconButton
                    onClick={handleDelete}
                    sx={{
                      bgcolor: 'grey.100',
                      color: 'error.main',
                      width: 40,
                      height: 40,
                      '&:hover': { bgcolor: 'error.lighter' }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </PageContainer>
      </Box>

      {/* Scrollable Content Area */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', bgcolor: 'grey.50' }}>
        <PageContainer fullHeight={false} sx={{ py: 2 }}>
          {/* Post Content */}
          <Paper sx={{ p: 3, mb: 2 }}>
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {post.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" sx={{ height: 24 }} />
                  ))}
                </Stack>
              </Box>
            )}

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
                    {attachments.map((file) => (
                      <ListItem
                        key={file.id}
                        secondaryAction={
                          <Tooltip title={t('common.download')}>
                            <IconButton edge="end" onClick={() => handleDownload(file)} size="small">
                              <Download />
                            </IconButton>
                          </Tooltip>
                        }
                        sx={{ py: 0.5 }}
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2">{file.originalFilename}</Typography>
                              <Chip
                                label={file.fileExtension.toUpperCase()}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            </Stack>
                          }
                          secondary={
                            <Stack direction="row" spacing={2}>
                              <Typography variant="caption" color="text.secondary">
                                {formatFileSize(file.fileSize)}
                              </Typography>
                              {file.downloadCount > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                  Downloads: {file.downloadCount}
                                </Typography>
                              )}
                            </Stack>
                          }
                          primaryTypographyProps={{ component: 'div' }}
                          secondaryTypographyProps={{ component: 'div' }}
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
        </PageContainer>
      </Box>
    </Box>
  );
}
