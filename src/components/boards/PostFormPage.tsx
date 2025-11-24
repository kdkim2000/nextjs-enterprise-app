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
  Clear as ClearIcon,
  AttachFile as AttachFileIcon,
  Label as LabelIcon,
  Lock as LockIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import { useCurrentLocale } from '@/lib/i18n/client';
import { apiClient } from '@/lib/api/client';
import RichTextEditor from '@/components/common/RichTextEditor';
import FileUploadZone, { UploadedFile } from '@/components/common/FileUploadZone';
import TagInput from '@/components/common/TagInput';
import StandardCrudPageLayout from '@/components/common/StandardCrudPageLayout';
import MessageAlert from '@/components/common/MessageAlert';

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

interface Post {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  is_secret: boolean;
  author_id: string;
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
  const currentLocale = useCurrentLocale();

  // State
  const [boardType, setBoardType] = useState<BoardType | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
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
            setPost(postData);
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
        isSecret: isSecret
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

      // Upload attachments if any
      if (files.length > 0 && boardType?.settings?.allowAttachments) {
        const formData = new FormData();
        files.forEach((uploadedFile) => {
          formData.append('files', uploadedFile.file);
        });
        formData.append('post_id', finalPostId);

        const uploadResponse = await apiClient.post('/attachment', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (!uploadResponse.success) {
          console.error('Failed to upload attachments:', uploadResponse.error);
        }
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
    if (window.confirm('Are you sure you want to cancel? Your changes will be lost.')) {
      if (mode === 'edit' && postId) {
        router.push(`/${currentLocale}${basePath}/${boardTypeId}/${postId}`);
      } else {
        router.push(`/${currentLocale}${basePath}/${boardTypeId}`);
      }
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all fields?')) {
      setTitle('');
      setContent('');
      setTags([]);
      setFiles([]);
      setIsSecret(false);
    }
  };

  const boardName = boardType
    ? ((boardType[`name_${currentLocale}` as keyof BoardType] as string) || boardType.name_en)
    : '';

  const defaultPageTitle = mode === 'create' ? 'Write New Post' : 'Edit Post';
  const defaultSubmitText = mode === 'create' ? 'Save Post' : 'Update Post';

  // Loading state
  if (initialLoading) {
    return (
      <StandardCrudPageLayout
        useMenu
        showBreadcrumb
        showQuickSearch={false}
      >
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography>Loading...</Typography>
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Clear all fields" arrow>
            <IconButton
              color="default"
              onClick={handleClear}
              disabled={loading}
              size="medium"
            >
              <ClearIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancel" arrow>
            <IconButton
              color="default"
              onClick={handleCancel}
              disabled={loading}
              size="medium"
            >
              <ClearIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={submitButtonText || defaultSubmitText} arrow>
            <IconButton
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              size="medium"
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
        </Box>
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
            Title *
          </Typography>
          <TextField
            fullWidth
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title..."
            variant="outlined"
            size="medium"
          />
        </Box>

        {/* Tags Field */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LabelIcon fontSize="small" color="action" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Tags
            </Typography>
          </Box>
          <TagInput
            value={tags}
            onChange={setTags}
            placeholder="Type and press Enter to add tags"
            maxTags={10}
            helperText="Add tags to help others find your post"
          />
        </Box>

        {/* Content Field */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Content *
          </Typography>
          <Box sx={{ flex: 1, minHeight: 300 }}>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your post content here..."
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
                {mode === 'edit' ? 'Add New Attachments' : 'Attachments'}
              </Typography>
            </Box>
            <FileUploadZone
              value={files}
              onChange={setFiles}
              maxFiles={boardType.settings?.maxAttachments || 5}
              maxSize={boardType.settings?.maxAttachmentSize || 10485760}
              helperText={
                mode === 'edit'
                  ? 'Upload new files to add to the post'
                  : `You can upload up to ${boardType.settings?.maxAttachments || 5} files`
              }
            />
            {mode === 'edit' && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Note: Existing attachments will be preserved.
              </Typography>
            )}
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
              Visibility
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
                    Secret Post
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Only you and administrators can view this post
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
