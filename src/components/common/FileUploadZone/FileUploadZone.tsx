'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Alert,
  Chip,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  InsertDriveFile,
  Image as ImageIcon,
  PictureAsPdf,
  Description
} from '@mui/icons-material';

export interface UploadedFile {
  file: File;
  preview?: string;
  progress?: number;
  error?: string;
  uploaded?: boolean;
}

export interface FileUploadZoneProps {
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  showPreview?: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = {
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/plain': ['.txt'],
    'text/csv': ['.csv'],
    'application/zip': ['.zip']
  },
  disabled = false,
  error = false,
  helperText,
  showPreview = true
}) => {
  const theme = useTheme();
  const [uploadError, setUploadError] = useState<string>('');

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setUploadError('');

      // Check max files limit
      if (value.length + acceptedFiles.length > maxFiles) {
        setUploadError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map(({ file, errors }) => {
          const errorMessages = errors.map((e: any) => {
            if (e.code === 'file-too-large') {
              return `${file.name}: File is too large (max ${formatFileSize(maxSize)})`;
            }
            if (e.code === 'file-invalid-type') {
              return `${file.name}: Invalid file type`;
            }
            return `${file.name}: ${e.message}`;
          });
          return errorMessages.join(', ');
        });
        setUploadError(errors.join('; '));
        return;
      }

      // Create preview URLs for images
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => {
        const uploadedFile: UploadedFile = {
          file,
          progress: 0,
          uploaded: false
        };

        // Create preview for images
        if (file.type.startsWith('image/')) {
          uploadedFile.preview = URL.createObjectURL(file);
        }

        return uploadedFile;
      });

      onChange?.([...value, ...newFiles]);
    },
    [value, onChange, maxFiles, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    disabled,
    multiple: maxFiles > 1
  });

  const handleRemove = (index: number) => {
    const file = value[index];
    // Revoke preview URL to avoid memory leaks
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange?.(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon />;
    } else if (file.type === 'application/pdf') {
      return <PictureAsPdf />;
    } else if (
      file.type.includes('word') ||
      file.type.includes('document')
    ) {
      return <Description />;
    } else {
      return <InsertDriveFile />;
    }
  };

  return (
    <Box>
      {/* Dropzone */}
      <Paper
        {...getRootProps()}
        variant="outlined"
        sx={{
          p: 3,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: error
            ? 'error.main'
            : isDragActive
            ? 'primary.main'
            : 'divider',
          backgroundColor: isDragActive
            ? alpha(theme.palette.primary.main, 0.05)
            : disabled
            ? 'action.disabledBackground'
            : 'background.paper',
          transition: 'all 0.2s ease',
          '&:hover': disabled
            ? {}
            : {
                borderColor: 'primary.main',
                backgroundColor: alpha(theme.palette.primary.main, 0.02)
              }
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload
          sx={{
            fontSize: 48,
            color: isDragActive ? 'primary.main' : 'text.secondary',
            mb: 1
          }}
        />
        <Typography variant="body1" gutterBottom>
          {isDragActive
            ? 'Drop files here...'
            : 'Drag & drop files here, or click to select'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Maximum {maxFiles} files, up to {formatFileSize(maxSize)} each
        </Typography>
      </Paper>

      {/* Error Message */}
      {(uploadError || (error && helperText)) && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {uploadError || helperText}
        </Alert>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, px: 1.75, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}

      {/* File List */}
      {value.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Files ({value.length}/{maxFiles})
          </Typography>
          <List dense>
            {value.map((uploadedFile, index) => (
              <ListItem
                key={index}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: 'background.paper'
                }}
              >
                {/* Preview or Icon */}
                {showPreview && uploadedFile.preview ? (
                  <Box
                    component="img"
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: 'cover',
                      borderRadius: 1,
                      mr: 2
                    }}
                  />
                ) : (
                  <Box sx={{ mr: 2, color: 'text.secondary' }}>
                    {getFileIcon(uploadedFile.file)}
                  </Box>
                )}

                {/* File Info */}
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" noWrap>
                        {uploadedFile.file.name}
                      </Typography>
                      {uploadedFile.uploaded && (
                        <Chip label="Uploaded" size="small" color="success" />
                      )}
                      {uploadedFile.error && (
                        <Chip label="Error" size="small" color="error" />
                      )}
                    </Stack>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(uploadedFile.file.size)}
                      </Typography>
                      {uploadedFile.progress !== undefined &&
                        uploadedFile.progress < 100 && (
                          <LinearProgress
                            variant="determinate"
                            value={uploadedFile.progress}
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      {uploadedFile.error && (
                        <Typography
                          variant="caption"
                          color="error"
                          display="block"
                        >
                          {uploadedFile.error}
                        </Typography>
                      )}
                    </Box>
                  }
                />

                {/* Delete Button */}
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemove(index)}
                    disabled={disabled}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FileUploadZone;
