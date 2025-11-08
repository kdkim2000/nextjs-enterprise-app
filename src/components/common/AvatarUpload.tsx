'use client';

import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';
import { api } from '@/lib/axios';
import { getAvatarUrl } from '@/lib/config';

export interface AvatarUploadProps {
  avatarUrl?: string;
  name: string;
  onAvatarChange: (avatarUrl: string) => void;
  onError?: (error: string) => void;
  size?: number;
  acceptedFormats?: string;
  maxSizeText?: string;
}

export default function AvatarUpload({
  avatarUrl,
  name,
  onAvatarChange,
  onError,
  size = 80,
  acceptedFormats = 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
  maxSizeText = 'JPG, PNG, GIF, WEBP (Max 10MB)'
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await api.post('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onAvatarChange(response.file.path);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage = error.response?.data?.error || 'Failed to upload avatar';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Avatar
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
        <Avatar
          src={avatarUrl ? getAvatarUrl(avatarUrl) : undefined}
          alt={name}
          sx={{ width: size, height: size }}
        >
          {!avatarUrl && name?.substring(0, 2).toUpperCase()}
        </Avatar>
        <Button
          component="label"
          variant="outlined"
          size="small"
          disabled={uploading}
        >
          {uploading ? <CircularProgress size={20} /> : 'Upload'}
          <input
            type="file"
            hidden
            accept={acceptedFormats}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                await handleUpload(file);
              }
            }}
          />
        </Button>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {maxSizeText}
      </Typography>
    </Box>
  );
}
