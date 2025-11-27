'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  DeleteSweep as ClearIcon,
  AttachFile as AttachFileIcon,
  Label as LabelIcon,
  Lock as LockIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { apiClient } from '@/lib/api/client';
import RichTextEditor from '@/components/common/RichTextEditor';
import AttachmentUpload from '@/components/common/AttachmentUpload';
import TagInput from '@/components/common/TagInput';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';

interface BoardType {
  id: string;
  code: string;
  name_en: string;
  name_ko: string;
  name_zh?: string;
  name_vi?: string;
  type: 'normal' | 'notice';
  settings: {
    allowComments?: boolean;
    allowAttachments?: boolean;
    allowLikes?: boolean;
    maxAttachments?: number;
    maxAttachmentSize?: number;
  };
}

export interface PostFormPageProps {
  /** Board type ID or code */
  boardTypeId: string;
  /** Post ID (for edit mode) */
  postId?: string;
  /** Mode: 'create' or 'edit' */
  mode: 'create' | 'edit';
  /** Base path for navigation (default: '/boards') */
  basePath?: string;
  /** Page title */
  pageTitle?: string;
  /** Submit button text */
  submitButtonText?: string;
}

/**
 * PostFormPage - Reusable component for creating and editing posts
 * Redesigned with StandardCrudPageLayout for consistent UI/UX
 */
export default function PostFormPage({
  boardTypeId,
  postId,
  mode,
  basePath = '/boards',
  pageTitle,
  submitButtonText
}: PostFormPageProps) {
  const router = useRouter();
  const t = useI18n();
  const currentLocale = useCurrentLocale();

  // State
  const [boardType, setBoardType] = useState<BoardType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [attachmentId, setAttachmentId] = useState<string | null>(null);
  const [isSecret, setIsSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);

        // Fetch board type
        const endpoint = boardTypeId.startsWith('BOARD-TYPE-')
          ? `/board-type/${boardTypeId}`
          : `/board-type/code/${boardTypeId}`;

        const boardTypeResponse = await apiClient.get(endpoint);
        if (boardTypeResponse.success && boardTypeResponse.data) {
          setBoardType(boardTypeResponse.data);
        } else {
          setError('Board not found');
          return;
        }

        // Fetch post data in edit mode
        if (mode === 'edit' && postId) {
          const postResponse = await apiClient.get(`/post/${postId}`);
          if (postResponse.success && postResponse.data) {
            const postData = postResponse.data;
            setTitle(postData.title);
            setContent(postData.content);
            setTags(postData.tags || []);
            setIsSecret(postData.is_secret);
          } else {
            setError('Post not found');
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [boardTypeId, postId, mode]);

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!content.trim() || content === '<p></p>') {
      setError('Please enter content');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const postData = {
        ...(mode === 'create' && { boardTypeId: boardType!.id }),
        title: title.trim(),
        content,
        tags,
        isSecret: isSecret,
        // Pass attachmentId to link attachment to post
        ...(attachmentId && { attachmentId })
      };

      // Create or update post
      let postResponse;
      let finalPostId: string;

      if (mode === 'create') {
        postResponse = await apiClient.post('/post', postData);
        if (!postResponse.success) {
          throw new Error(postResponse.error || 'Failed to create post');
        }
        finalPostId = postResponse.data.post.id;
      } else {
        postResponse = await apiClient.put(`/post/${postId}`, postData);
        if (!postResponse.success) {
          throw new Error(postResponse.error || 'Failed to update post');
        }
        finalPostId = postId!;
      }

      setSuccess(mode === 'create' ? 'Post created successfully!' : 'Post updated successfully!');

      // Redirect to the post detail page
      setTimeout(() => {
        router.push(`/${currentLocale}${basePath}/${boardTypeId}/${finalPostId}`);
      }, 1000);
    } catch (error: any) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} post:`, error);
      setError(error.message || `Failed to ${mode === 'create' ? 'create' : 'update'} post`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm(t('common.confirm'))) {
      if (mode === 'edit' && postId) {
        router.push(`/${currentLocale}${basePath}/${boardTypeId}/${postId}`);
      } else {
        router.push(`/${currentLocale}${basePath}/${boardTypeId}`);
      }
    }
  };

  const handleClear = () => {
    if (window.confirm(t('common.confirm'))) {
      setTitle('');
      setContent('');
      setTags([]);
      setAttachmentId(null);
      setIsSecret(false);
    }
  };

  const boardName = boardType
    ? ((boardType[`name_${currentLocale}` as keyof BoardType] as string) || boardType.name_en)
    : '';

  const defaultPageTitle = mode === 'create' ? t('board.createPost') : t('board.editPostTitle');
  const defaultSubmitText = mode === 'create' ? t('common.save') : t('common.save');

  // Loading state
  if (initialLoading) {
    return (
      <StandardCrudPageLayout
        useMenu
        showBreadcrumb
        showQuickSearch={false}
      >
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography>{t('common.loading')}</Typography>
        </Paper>
      </StandardCrudPageLayout>
    );
  }

  // Error state
  if (error && !boardType) {
    return (
      <StandardCrudPageLayout
        useMenu
        showBreadcrumb
        showQuickSearch={false}
        errorMessage={error}
      >
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </StandardCrudPageLayout>
    );
  }

  return (
    <StandardCrudPageLayout
      useMenu
      showBreadcrumb
      showQuickSearch={false}
      successMessage={success}
      errorMessage={error}
      headerActions={
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t('common.clear')} arrow>
            <IconButton
              onClick={handleClear}
              disabled={loading}
              size="small"
              sx={{
                color: 'action.active',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.cancel')} arrow>
            <IconButton
              onClick={handleCancel}
              disabled={loading}
              size="small"
              sx={{
                color: 'error.main',
                '&:hover': { bgcolor: 'error.50' }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={submitButtonText || defaultSubmitText} arrow>
            <IconButton
              onClick={handleSubmit}
              disabled={loading}
              size="small"
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: 'primary.50' }
              }}
            >
              <SaveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      {/* Main Form Area */}
      <Paper sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Page Title with Board Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {pageTitle || defaultPageTitle}
          </Typography>
          <Chip
            label={boardName}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>

        <Divider />

        {/* Title Field */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            {t('board.titleRequired')}
          </Typography>
          <TextField
            fullWidth
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('board.titlePlaceholder')}
            variant="outlined"
            size="medium"
          />
        </Box>

        {/* Tags Field */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LabelIcon fontSize="small" color="action" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t('board.tags')}
            </Typography>
          </Box>
          <TagInput
            value={tags}
            onChange={setTags}
            placeholder={t('board.tagsPlaceholder')}
            maxTags={10}
            helperText={t('board.tagsHelper')}
          />
        </Box>

        {/* Content Field */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            {t('board.contentRequired')}
          </Typography>
          <Box sx={{ flex: 1, minHeight: 300 }}>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder={t('board.contentPlaceholder')}
              minHeight={300}
            />
          </Box>
        </Box>

        {/* Attachments */}
        {boardType?.settings?.allowAttachments && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AttachFileIcon fontSize="small" color="action" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {mode === 'edit' ? t('board.addNewAttachments') : t('board.attachmentsTitle')}
              </Typography>
            </Box>
            <AttachmentUpload
              attachmentTypeCode="BOARD_GENERAL"
              referenceType={mode === 'edit' ? 'post' : undefined}
              referenceId={mode === 'edit' ? postId : undefined}
              locale={currentLocale}
              autoFetch={mode === 'edit'}
              onUploadComplete={(id) => setAttachmentId(id)}
              helperText={
                mode === 'edit'
                  ? t('board.attachmentsEditHelper')
                  : t('board.attachmentsHelper', { count: boardType.settings?.maxAttachments || 5 })
              }
              compact
            />
          </Box>
        )}

        {/* Options */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {isSecret ? (
              <LockIcon fontSize="small" color="action" />
            ) : (
              <PublicIcon fontSize="small" color="action" />
            )}
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t('board.visibility')}
            </Typography>
          </Box>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSecret}
                  onChange={(e) => setIsSecret(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {t('board.secretPost')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('board.secretPostDesc')}
                  </Typography>
                </Box>
              }
            />
          </Paper>
        </Box>
      </Paper>
    </StandardCrudPageLayout>
  );
}
