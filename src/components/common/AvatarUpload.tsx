'use client';

import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Button,
  Typography,
  CircularProgress,
  IconButton
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { api } from '@/lib/axios';
import { getAvatarUrl } from '@/lib/config';

export interface AvatarUploadProps {
  avatarUrl?: string;
  avatarImage?: string; // Base64 encoded image
  name: string;
  onAvatarChange?: (avatarUrl: string) => void;
  onAvatarImageChange?: (base64Image: string) => void; // Callback for base64 image
  onDelete?: () => void; // Callback for delete
  onError?: (error: string) => void;
  size?: number;
  acceptedFormats?: string;
  maxSizeText?: string;
  useBase64?: boolean; // If true, convert to base64 instead of uploading
  showDelete?: boolean; // Show delete button
  label?: string;
  uploadButtonText?: string;
  deleteButtonText?: string;
}

export default function AvatarUpload({
  avatarUrl,
  avatarImage,
  name,
  onAvatarChange,
  onAvatarImageChange,
  onDelete,
  onError,
  size = 100,
  acceptedFormats = 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
  maxSizeText = 'JPG, PNG, GIF, WEBP (Max 10MB)',
  useBase64 = true,
  showDelete = true,
  label,
  uploadButtonText = 'Upload',
  deleteButtonText = 'Delete'
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result); // Returns data:image/...;base64,...
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (file: File) => {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      if (onError) {
        onError('Image size must be less than 10MB');
      }
      return;
    }

    setUploading(true);
    try {
      if (useBase64) {
        // Convert to base64 and call onAvatarImageChange
        const base64String = await convertToBase64(file);
        if (onAvatarImageChange) {
          onAvatarImageChange(base64String);
        }
      } else {
        // Upload to server
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/file/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (onAvatarChange) {
          onAvatarChange(response.file.path);
        }
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = error.response?.data?.error || error.message || 'Failed to process avatar';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  // Helper function to get initials from name
  const getInitials = (name: string): string => {
    if (!name) return '';

    // Check if name contains Korean characters
    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(name);

    if (hasKorean) {
      // For Korean names, take 1 character (usually the last name)
      return name.substring(0, 1);
    } else {
      // For English/other names, take 2 characters
      return name.substring(0, 2).toUpperCase();
    }
  };

  // Determine avatar source (priority: avatarImage > avatarUrl)
  const avatarSrc = avatarImage || (avatarUrl ? getAvatarUrl(avatarUrl) : undefined);
  const hasAvatar = !!(avatarImage || avatarUrl);
  const initials = getInitials(name);

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: label ? 1 : 0 }}>
        <Avatar
          src={avatarSrc}
          alt={name}
          sx={{ width: size, height: size }}
        >
          {!avatarSrc && initials}
        </Avatar>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            component="label"
            variant="outlined"
            size="small"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={16} /> : <PhotoCamera />}
          >
            {uploading ? 'Uploading...' : uploadButtonText}
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
          {showDelete && hasAvatar && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
              disabled={uploading}
            >
              {deleteButtonText}
            </Button>
          )}
          {maxSizeText && (
            <Typography variant="caption" color="text.secondary">
              {maxSizeText}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
