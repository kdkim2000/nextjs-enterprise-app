'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Download,
  InsertDriveFile,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { api } from '@/lib/axios';
import { useI18n } from '@/lib/i18n/client';

interface FileUploadProps {
  multiple?: boolean;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  onUploadComplete?: (files: UploadedFile[]) => void;
  autoUpload?: boolean;
}

interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  path: string;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  uploadedFile?: UploadedFile;
}

export default function FileUpload({
  multiple = true,
  maxSize = 10, // 10MB default
  acceptedTypes = [],
  onUploadComplete,
  autoUpload = true
}: FileUploadProps) {
  const t = useI18n();
  const [files, setFiles] = useState<FileWithProgress[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Add files to state
      const newFiles: FileWithProgress[] = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: 'pending' as const
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Auto upload if enabled
      if (autoUpload) {
        for (let i = 0; i < newFiles.length; i++) {
          await uploadFile(newFiles[i], files.length + i);
        }
      }
    },
    [autoUpload, files.length]
  );

  const uploadFile = async (fileWithProgress: FileWithProgress, index: number) => {
    try {
      // Update status to uploading
      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: 'uploading' };
        return updated;
      });

      const formData = new FormData();
      formData.append('file', fileWithProgress.file);

      // Upload with progress tracking
      const response = await api.post<{ file: UploadedFile }>('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;

          setFiles((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], progress };
            return updated;
          });
        }
      });

      // Update status to success
      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          status: 'success',
          progress: 100,
          uploadedFile: response.file
        };
        return updated;
      });

      if (onUploadComplete) {
        onUploadComplete([response.file]);
      }
    } catch (error: any) {
      console.error('Upload error:', error);

      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          status: 'error',
          error: error.response?.data?.error || 'Upload failed'
        };
        return updated;
      });
    }
  };

  const handleManualUpload = async () => {
    const pendingFiles = files
      .map((f, index) => ({ ...f, index }))
      .filter((f) => f.status === 'pending');

    for (const fileWithIndex of pendingFiles) {
      await uploadFile(fileWithIndex, fileWithIndex.index);
    }
  };

  const handleDelete = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownload = async (file: FileWithProgress) => {
    if (file.uploadedFile) {
      window.open(file.uploadedFile.url, '_blank');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxSize: maxSize * 1024 * 1024,
    accept: acceptedTypes.length > 0 ? { '*/*': acceptedTypes } : undefined
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        <Stack alignItems="center" spacing={2}>
          <CloudUpload sx={{ fontSize: 64, color: 'primary.main' }} />
          <Typography variant="h6" textAlign="center">
            {isDragActive
              ? t('file.dragDrop')
              : 'Drag and drop files here, or click to select'}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Chip
              label={`Max size: ${maxSize}MB`}
              size="small"
              variant="outlined"
            />
            {acceptedTypes.length > 0 && (
              <Chip
                label={`Types: ${acceptedTypes.join(', ')}`}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        </Stack>
      </Paper>

      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Files ({files.length})
          </Typography>

          <List>
            {files.map((fileWithProgress, index) => (
              <Paper key={index} sx={{ mb: 1 }}>
                <ListItem>
                  <InsertDriveFile sx={{ mr: 2, color: 'primary.main' }} />
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1">
                          {fileWithProgress.file.name}
                        </Typography>
                        {fileWithProgress.status === 'success' && (
                          <CheckCircle color="success" fontSize="small" />
                        )}
                        {fileWithProgress.status === 'error' && (
                          <ErrorIcon color="error" fontSize="small" />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(fileWithProgress.file.size)}
                        </Typography>
                        {fileWithProgress.status === 'uploading' && (
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={fileWithProgress.progress}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {fileWithProgress.progress}%
                            </Typography>
                          </Box>
                        )}
                        {fileWithProgress.status === 'error' && (
                          <Alert severity="error" sx={{ mt: 1 }}>
                            {fileWithProgress.error}
                          </Alert>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      {fileWithProgress.status === 'success' && (
                        <IconButton
                          edge="end"
                          onClick={() => handleDownload(fileWithProgress)}
                        >
                          <Download />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(index)}
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              </Paper>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
