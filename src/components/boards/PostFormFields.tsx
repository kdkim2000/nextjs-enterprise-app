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
          Title *
        </Typography>
        <TextField
          fullWidth
          required
          value={post.title}
          onChange={(e) => handleChange('title', e.target.value)}
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
          value={post.tags || []}
          onChange={(tags) => handleChange('tags', tags)}
          placeholder="Type and press Enter to add tags"
          maxTags={10}
          helperText="Add tags to help others find your post"
        />
      </Box>

      {/* Content Field */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Content *
        </Typography>
        <Box sx={{ minHeight: 300 }}>
          <RichTextEditor
            value={post.content}
            onChange={(content) => handleChange('content', content)}
            placeholder="Write your post content here..."
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
              {mode === 'edit' ? 'Add New Attachments' : 'Attachments'}
            </Typography>
          </Box>
          <FileUploadZone
            value={post.files || []}
            onChange={(files) => handleChange('files', files)}
            maxFiles={boardSettings?.maxAttachments || 5}
            maxSize={boardSettings?.maxAttachmentSize || 10485760}
            helperText={
              mode === 'edit'
                ? 'Upload new files to add to the post'
                : `You can upload up to ${boardSettings?.maxAttachments || 5} files`
            }
          />
          {mode === 'edit' && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Note: Existing attachments will be preserved.
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
            Visibility
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

      {/* Admin-only: Popup Notification Options */}
      {isAdmin && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <NotificationsIcon fontSize="small" color="action" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Popup Notification (Admin Only)
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
                    Show as Popup Notification
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Display this notice as a popup when users log in
                  </Typography>
                </Box>
              }
            />

            {post.showPopup && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Divider />
                <DateTimePicker
                  label="Display Start Date"
                  value={post.displayStartDate || null}
                  onChange={(newValue) => handleChange('displayStartDate', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'Leave empty to start immediately'
                    }
                  }}
                />
                <DateTimePicker
                  label="Display End Date"
                  value={post.displayEndDate || null}
                  onChange={(newValue) => handleChange('displayEndDate', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'Leave empty for no end date'
                    }
                  }}
                />
              </Box>
            )}
          </Paper>
        </Box>
      )}
    </Box>
    </LocalizationProvider>
  );
}
