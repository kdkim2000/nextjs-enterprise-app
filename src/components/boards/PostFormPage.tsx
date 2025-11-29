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
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  ArrowBack,
  AttachFile as AttachFileIcon,
  Label as LabelIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  Edit as EditIcon,
  Add as AddIcon,
  PushPin as PushPinIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import RichTextEditor from '@/components/common/RichTextEditor';
import AttachmentUpload from '@/components/common/AttachmentUpload';
import TagInput from '@/components/common/TagInput';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/common/PageContainer';
import { MetaInfo } from '@/components/common/Badge';
import DateTimeRangePicker from '@/components/common/DateTimeRangePicker';

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
 * Redesigned with fixed header and scrollable content like detail page
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
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State
  const [boardType, setBoardType] = useState<BoardType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [attachmentId, setAttachmentId] = useState<string | null>(null);
  const [isSecret, setIsSecret] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [displayStartDate, setDisplayStartDate] = useState<string>('');
  const [displayEndDate, setDisplayEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helper function to check if string is a UUID or legacy ID
  const isUUIDOrLegacyId = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(str);
    const isLegacyId = str.startsWith('BOARD-TYPE-');
    return isUUID || isLegacyId;
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);

        // Fetch board type - determine if boardTypeId is UUID/legacy ID or code
        const endpoint = isUUIDOrLegacyId(boardTypeId)
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
            // API returns post data under data.post or directly under data
            const postData = postResponse.data.post || postResponse.data;
            setTitle(postData.title || '');
            setContent(postData.content || '');
            setTags(postData.tags || []);
            setIsSecret(postData.is_secret ?? postData.isSecret ?? false);
            setIsPinned(postData.is_pinned ?? postData.isPinned ?? false);
            setShowPopup(postData.show_popup ?? postData.showPopup ?? false);
            // Format dates for input fields (YYYY-MM-DDTHH:mm format)
            if (postData.display_start_date || postData.displayStartDate) {
              const startDate = new Date(postData.display_start_date || postData.displayStartDate);
              setDisplayStartDate(startDate.toISOString().slice(0, 16));
            }
            if (postData.display_end_date || postData.displayEndDate) {
              const endDate = new Date(postData.display_end_date || postData.displayEndDate);
              setDisplayEndDate(endDate.toISOString().slice(0, 16));
            }
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
      setError(t('board.titleRequired'));
      return;
    }
    if (!content.trim() || content === '<p></p>') {
      setError(t('board.contentRequired'));
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
        isPinned: isPinned,
        showPopup: showPopup,
        displayStartDate: displayStartDate ? new Date(displayStartDate).toISOString() : null,
        displayEndDate: displayEndDate ? new Date(displayEndDate).toISOString() : null,
        ...(attachmentId && { attachmentId })
      };

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
    if (mode === 'edit' && postId) {
      router.push(`/${currentLocale}${basePath}/${boardTypeId}/${postId}`);
    } else {
      router.push(`/${currentLocale}${basePath}/${boardTypeId}`);
    }
  };

  const boardName = boardType
    ? ((boardType[`name_${currentLocale}` as keyof BoardType] as string) || boardType.name_en)
    : '';

  const defaultPageTitle = mode === 'create' ? t('board.createPost') : t('board.editPostTitle');

  // Loading state
  if (initialLoading) {
    return (
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state (no board type found)
  if (error && !boardType) {
    return (
      <Box sx={{ flex: 1, minHeight: 0, p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button startIcon={<ArrowBack />} onClick={handleCancel}>
          {t('board.backToList')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Fixed Header Area */}
      <Box sx={{ flexShrink: 0, borderBottom: '1px solid', borderColor: 'grey.200', bgcolor: 'white' }}>
        <PageContainer fullHeight={false} sx={{ pb: 0, pt: 1 }}>
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
            <Tooltip title={t('common.cancel')}>
              <IconButton
                onClick={handleCancel}
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
                {mode === 'create' ? (
                  <AddIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                ) : (
                  <EditIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                )}
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  sx={{ color: 'grey.800' }}
                >
                  {pageTitle || defaultPageTitle}
                </Typography>
                <Chip
                  size="small"
                  label={boardName}
                  sx={{
                    height: 20,
                    bgcolor: '#3b82f615',
                    color: '#3b82f6',
                    fontWeight: 500,
                    fontSize: '0.65rem',
                    flexShrink: 0
                  }}
                />
                {isSecret && (
                  <Chip
                    size="small"
                    icon={<LockIcon sx={{ fontSize: 12 }} />}
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
              </Box>
              {/* Meta Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.25 }}>
                <MetaInfo
                  icon={<LabelIcon sx={{ fontSize: 11 }} />}
                  value={tags.length > 0 ? `${tags.length} tags` : 'No tags'}
                  size="small"
                />
              </Box>
            </Box>

            {/* Right: Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Tooltip title={t('common.cancel')}>
                <IconButton
                  onClick={handleCancel}
                  disabled={loading}
                  sx={{
                    bgcolor: 'grey.100',
                    color: 'error.main',
                    width: 40,
                    height: 40,
                    '&:hover': { bgcolor: 'error.lighter' }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={submitButtonText || t('common.save')}>
                <IconButton
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 40,
                    height: 40,
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&.Mui-disabled': {
                      bgcolor: 'action.disabledBackground',
                      color: 'action.disabled'
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={20} sx={{ color: 'inherit' }} />
                  ) : (
                    <SaveIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </PageContainer>
      </Box>

      {/* Scrollable Content Area */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', bgcolor: 'grey.50' }}>
        <PageContainer fullHeight={false} sx={{ py: 2 }}>
          {/* Messages */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          {/* Main Form */}
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </Box>

              {/* Content Field */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  {t('board.contentRequired')}
                </Typography>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder={t('board.contentPlaceholder')}
                  minHeight={300}
                  disabled={loading}
                />
              </Box>

              {/* Attachments */}
              {boardType?.settings?.allowAttachments && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AttachFileIcon fontSize="small" color="action" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {t('board.attachmentsTitle')}
                    </Typography>
                  </Box>
                  <AttachmentUpload
                    attachmentTypeCode="BOARD_GENERAL"
                    referenceType={mode === 'edit' ? 'post' : undefined}
                    referenceId={mode === 'edit' ? postId : undefined}
                    locale={currentLocale}
                    autoFetch={mode === 'edit'}
                    onUploadComplete={(id) => setAttachmentId(id)}
                    helperText={t('board.attachmentsHelper', { count: boardType.settings?.maxAttachments || 5 })}
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
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isSecret}
                          onChange={(e) => setIsSecret(e.target.checked)}
                          disabled={loading}
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
                    {isAdmin && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isPinned}
                            onChange={(e) => setIsPinned(e.target.checked)}
                            disabled={loading}
                          />
                        }
                        label={
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PushPinIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {t('board.pinnedPost')}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {t('board.pinnedPostDesc')}
                            </Typography>
                          </Box>
                        }
                      />
                    )}
                  </Stack>
                </Paper>
              </Box>

              {/* Popup Notification Options - Admin Only */}
              {isAdmin && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <NotificationsIcon fontSize="small" color="action" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {t('board.popupNotification')}
                    </Typography>
                  </Box>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={showPopup}
                            onChange={(e) => setShowPopup(e.target.checked)}
                            disabled={loading}
                          />
                        }
                        label={
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <NotificationsIcon sx={{ fontSize: 16, color: 'info.main' }} />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {t('board.showAsPopup')}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {t('board.showAsPopupDesc')}
                            </Typography>
                          </Box>
                        }
                      />

                      {/* Display Period - only show when popup is enabled */}
                      {showPopup && (
                        <Box sx={{ pl: 4 }}>
                          <DateTimeRangePicker
                            label={t('board.displayPeriod')}
                            startDateTime={displayStartDate}
                            endDateTime={displayEndDate}
                            onChange={(start, end) => {
                              setDisplayStartDate(start);
                              setDisplayEndDate(end);
                            }}
                            startLabel={t('board.startDate')}
                            endLabel={t('board.endDate')}
                            helperText={t('board.startDateHelper')}
                            disabled={loading}
                            lang={currentLocale}
                          />
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                </Box>
              )}
            </Stack>
          </Paper>
        </PageContainer>
      </Box>
    </Box>
  );
}
