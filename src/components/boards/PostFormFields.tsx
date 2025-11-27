'use client';

import React from 'react';
import {
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import {
  Lock as LockIcon,
  Public as PublicIcon,
  Label as LabelIcon,
  AttachFile as AttachFileIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import RichTextEditor from '@/components/common/RichTextEditor';
import FileUploadZone, { UploadedFile } from '@/components/common/FileUploadZone';
import TagInput from '@/components/common/TagInput';
import { useI18n } from '@/lib/i18n/client';

export interface PostFormData {
  id?: string;
  title: string;
  content: string;
  tags?: string[];
  isSecret: boolean;
  isPinned?: boolean;
  showPopup?: boolean;
  displayStartDate?: Date | null;
  displayEndDate?: Date | null;
  files?: UploadedFile[];
}

export interface PostFormFieldsProps {
  post: PostFormData | null;
  onChange: (post: PostFormData) => void;
  onError?: (error: string) => void;
  boardSettings?: {
    allowComments?: boolean;
    allowAttachments?: boolean;
    allowLikes?: boolean;
    maxAttachments?: number;
    maxAttachmentSize?: number;
  };
  mode?: 'create' | 'edit';
  isAdmin?: boolean;
}

export default function PostFormFields({
  post,
  onChange,
  onError,
  boardSettings = {},
  mode = 'create',
  isAdmin = false
}: PostFormFieldsProps) {
  const t = useI18n();

  if (!post) return null;

  const handleChange = (field: keyof PostFormData, value: any) => {
    onChange({ ...post, [field]: value });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Title Field */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          {t('board.titleRequired')}
        </Typography>
        <TextField
          fullWidth
          required
          value={post.title}
          onChange={(e) => handleChange('title', e.target.value)}
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
          value={post.tags || []}
          onChange={(tags) => handleChange('tags', tags)}
          placeholder={t('board.tagsPlaceholder')}
          maxTags={10}
          helperText={t('board.tagsHelper')}
        />
      </Box>

      {/* Content Field */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          {t('board.contentRequired')}
        </Typography>
        <Box sx={{ minHeight: 300 }}>
          <RichTextEditor
            value={post.content}
            onChange={(content) => handleChange('content', content)}
            placeholder={t('board.contentPlaceholder')}
            minHeight={300}
          />
        </Box>
      </Box>

      {/* Attachments */}
      {boardSettings?.allowAttachments && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AttachFileIcon fontSize="small" color="action" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {mode === 'edit' ? t('board.addNewAttachments') : t('board.attachmentsTitle')}
            </Typography>
          </Box>
          <FileUploadZone
            value={post.files || []}
            onChange={(files) => handleChange('files', files)}
            maxFiles={boardSettings?.maxAttachments || 5}
            maxSize={boardSettings?.maxAttachmentSize || 10485760}
            helperText={
              mode === 'edit'
                ? t('board.attachmentsEditHelper')
                : t('board.attachmentsHelper', { count: boardSettings?.maxAttachments || 5 })
            }
          />
          {mode === 'edit' && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {t('board.attachmentsPreserved')}
            </Typography>
          )}
        </Box>
      )}

      {/* Visibility Options */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {post.isSecret ? (
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
                checked={post.isSecret}
                onChange={(e) => handleChange('isSecret', e.target.checked)}
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

      {/* Admin-only: Popup Notification Options */}
      {isAdmin && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <NotificationsIcon fontSize="small" color="action" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t('board.popupNotification')}
            </Typography>
          </Box>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={post.showPopup || false}
                  onChange={(e) => handleChange('showPopup', e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {t('board.showAsPopup')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('board.showAsPopupDesc')}
                  </Typography>
                </Box>
              }
            />

            {post.showPopup && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('board.displayPeriod')}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    alignItems: { sm: 'flex-start' }
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <DateTimePicker
                      label={t('board.startDate')}
                      value={post.displayStartDate || null}
                      onChange={(newValue) => handleChange('displayStartDate', newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          helperText: t('board.startDateHelper')
                        }
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: { xs: 'none', sm: 'flex' },
                      alignItems: 'center',
                      pt: 1,
                      color: 'text.secondary'
                    }}
                  >
                    ~
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <DateTimePicker
                      label={t('board.endDate')}
                      value={post.displayEndDate || null}
                      onChange={(newValue) => handleChange('displayEndDate', newValue)}
                      minDateTime={post.displayStartDate || undefined}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          helperText: t('board.endDateHelper')
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      )}
    </Box>
    </LocalizationProvider>
  );
}
