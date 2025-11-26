'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
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
  alpha,
  Tooltip,
  CircularProgress,
  Skeleton
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Download,
  InsertDriveFile,
  Image as ImageIcon,
  PictureAsPdf,
  Description,
  TableChart,
  Slideshow,
  FolderZip,
  CheckCircle,
  Error as ErrorIcon,
  Visibility
} from '@mui/icons-material';
import {
  useAttachment,
  formatFileSize,
  getFileIcon,
  AttachmentFile,
  UploadProgress
} from '@/hooks/useAttachment';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

// ==========================================
// TYPES
// ==========================================

export interface AttachmentUploadProps {
  /** Attachment type code (e.g., 'BOARD_ATTACH', 'PROFILE_IMAGE') */
  attachmentTypeCode: string;
  /** Reference type for linking (e.g., 'post', 'comment', 'user') */
  referenceType?: string;
  /** Reference ID for linking */
  referenceId?: string;
  /** Current locale for multi-language display */
  locale?: string;
  /** Callback when upload completes */
  onUploadComplete?: (attachmentId: string, files: AttachmentFile[]) => void;
  /** Callback when files change */
  onChange?: (files: AttachmentFile[]) => void;
  /** Callback when error occurs */
  onError?: (error: string) => void;
  /** Whether to auto-fetch existing attachments on mount */
  autoFetch?: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether to show file preview */
  showPreview?: boolean;
  /** Whether to show download button */
  showDownload?: boolean;
  /** Custom accept types (overrides attachment type settings) */
  accept?: Record<string, string[]>;
  /** Helper text to display below dropzone */
  helperText?: string;
  /** Whether there's an error state */
  error?: boolean;
  /** Compact mode for smaller UI */
  compact?: boolean;
}

// ==========================================
// FILE ICON COMPONENT
// ==========================================

const FileIcon: React.FC<{ mimeType: string }> = ({ mimeType }) => {
  const iconType = getFileIcon(mimeType);

  switch (iconType) {
    case 'image':
      return <ImageIcon color="primary" />;
    case 'pdf':
      return <PictureAsPdf color="error" />;
    case 'document':
      return <Description color="info" />;
    case 'spreadsheet':
      return <TableChart color="success" />;
    case 'presentation':
      return <Slideshow color="warning" />;
    case 'archive':
      return <FolderZip color="secondary" />;
    default:
      return <InsertDriveFile />;
  }
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  attachmentTypeCode,
  referenceType,
  referenceId,
  locale = 'ko',
  onUploadComplete,
  onChange,
  onError,
  autoFetch = true,
  disabled = false,
  showPreview = true,
  showDownload = true,
  accept,
  helperText,
  error = false,
  compact = false
}) => {
  const theme = useTheme();

  const {
    attachment,
    attachmentType,
    uploading,
    uploadProgress,
    loading,
    error: uploadError,
    fetchAttachmentType,
    fetchAttachments,
    uploadFiles,
    deleteFile,
    downloadFile,
    validateFile,
    clearUploadProgress,
    setError
  } = useAttachment({
    attachmentTypeCode,
    referenceType,
    referenceId,
    onUploadComplete: (result) => {
      if (onUploadComplete) {
        onUploadComplete(result.attachment.id, result.attachment.files);
      }
      if (onChange) {
        onChange(result.attachment.files);
      }
    },
    onError: (err) => {
      if (onError) {
        onError(err.message);
      }
    }
  });

  // Fetch attachment type and existing attachments on mount
  useEffect(() => {
    fetchAttachmentType();
  }, [fetchAttachmentType]);

  useEffect(() => {
    if (autoFetch && referenceType && referenceId) {
      fetchAttachments();
    }
  }, [autoFetch, referenceType, referenceId, fetchAttachments]);

  // Notify parent when files change
  useEffect(() => {
    if (onChange && attachment?.files) {
      onChange(attachment.files);
    }
  }, [attachment?.files, onChange]);

  // Build accept config from attachment type settings
  const acceptConfig = useMemo(() => {
    if (accept) return accept;

    if (!attachmentType?.allowedExtensions?.length) {
      return {
        '*/*': []
      };
    }

    // Build accept object from extensions
    const acceptObj: Record<string, string[]> = {};
    attachmentType.allowedExtensions.forEach(ext => {
      const dotExt = ext.startsWith('.') ? ext : `.${ext}`;
      // Map common extensions to MIME types
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
        acceptObj['image/*'] = acceptObj['image/*'] || [];
        acceptObj['image/*'].push(dotExt);
      } else if (ext === 'pdf') {
        acceptObj['application/pdf'] = ['.pdf'];
      } else if (['doc', 'docx'].includes(ext)) {
        acceptObj['application/msword'] = acceptObj['application/msword'] || [];
        acceptObj['application/msword'].push(dotExt);
      } else if (['xls', 'xlsx'].includes(ext)) {
        acceptObj['application/vnd.ms-excel'] = acceptObj['application/vnd.ms-excel'] || [];
        acceptObj['application/vnd.ms-excel'].push(dotExt);
      } else if (['ppt', 'pptx'].includes(ext)) {
        acceptObj['application/vnd.ms-powerpoint'] = acceptObj['application/vnd.ms-powerpoint'] || [];
        acceptObj['application/vnd.ms-powerpoint'].push(dotExt);
      } else if (['zip', 'rar', '7z'].includes(ext)) {
        acceptObj['application/zip'] = acceptObj['application/zip'] || [];
        acceptObj['application/zip'].push(dotExt);
      } else if (['txt', 'csv'].includes(ext)) {
        acceptObj['text/*'] = acceptObj['text/*'] || [];
        acceptObj['text/*'].push(dotExt);
      }
    });

    return Object.keys(acceptObj).length > 0 ? acceptObj : { '*/*': [] };
  }, [accept, attachmentType?.allowedExtensions]);

  // Dropzone handler
  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setError(null);

      // Validate files
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of acceptedFiles) {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: ${validation.error}`);
        }
      }

      // Handle rejected files
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rejectedFiles as any[]).forEach(({ file, errors: fileErrors }: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorMessages = fileErrors.map((e: any) => {
          if (e.code === 'file-too-large') {
            return 'File is too large';
          }
          if (e.code === 'file-invalid-type') {
            return 'Invalid file type';
          }
          return e.message;
        });
        errors.push(`${file.name}: ${errorMessages.join(', ')}`);
      });

      if (errors.length > 0) {
        setError(errors.join('; '));
        if (onError) {
          onError(errors.join('; '));
        }
      }

      // Upload valid files
      if (validFiles.length > 0) {
        await uploadFiles(validFiles);
      }
    },
    [validateFile, uploadFiles, setError, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptConfig,
    maxSize: attachmentType?.maxFileSize || 100 * 1024 * 1024,
    maxFiles: attachmentType?.maxFileCount || 10,
    disabled: disabled || uploading,
    multiple: (attachmentType?.maxFileCount || 10) > 1
  });

  // Handle file delete
  const handleDeleteFile = async (fileId: string) => {
    const success = await deleteFile(fileId);
    if (success && onChange && attachment?.files) {
      onChange(attachment.files.filter(f => f.id !== fileId));
    }
  };

  // Handle file download
  const handleDownloadFile = (fileId: string) => {
    downloadFile(fileId);
  };

  // Get type display name
  const typeName = attachmentType?.name
    ? getLocalizedValue(attachmentType.name, locale)
    : attachmentTypeCode;

  // Existing files from attachment
  const existingFiles = attachment?.files || [];
  const currentFileCount = existingFiles.length + uploadProgress.filter(p => p.status === 'success').length;
  const maxFileCount = attachmentType?.maxFileCount || 10;
  const canUploadMore = currentFileCount < maxFileCount;

  // Loading state
  if (!attachmentType && loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={compact ? 100 : 150} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Dropzone */}
      <Paper
        {...getRootProps()}
        variant="outlined"
        sx={{
          p: compact ? 2 : 3,
          textAlign: 'center',
          cursor: disabled || !canUploadMore ? 'not-allowed' : 'pointer',
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: error || uploadError
            ? 'error.main'
            : isDragActive
            ? 'primary.main'
            : 'divider',
          backgroundColor: isDragActive
            ? alpha(theme.palette.primary.main, 0.05)
            : disabled || !canUploadMore
            ? 'action.disabledBackground'
            : 'background.paper',
          transition: 'all 0.2s ease',
          opacity: disabled || !canUploadMore ? 0.6 : 1,
          '&:hover': disabled || !canUploadMore
            ? {}
            : {
                borderColor: 'primary.main',
                backgroundColor: alpha(theme.palette.primary.main, 0.02)
              }
        }}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <Box>
            <CircularProgress size={compact ? 32 : 48} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Uploading...
            </Typography>
          </Box>
        ) : (
          <>
            <CloudUpload
              sx={{
                fontSize: compact ? 32 : 48,
                color: isDragActive ? 'primary.main' : 'text.secondary',
                mb: 1
              }}
            />
            <Typography variant={compact ? 'body2' : 'body1'} gutterBottom>
              {isDragActive
                ? 'Drop files here...'
                : !canUploadMore
                ? `Maximum files (${maxFileCount}) reached`
                : 'Drag & drop files here, or click to select'}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              flexWrap="wrap"
              sx={{ mt: 1 }}
            >
              <Chip
                label={`${typeName}`}
                size="small"
                variant="outlined"
                color="primary"
              />
              <Chip
                label={`Max: ${formatFileSize(attachmentType?.maxFileSize || 0)}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`${currentFileCount}/${maxFileCount} files`}
                size="small"
                variant="outlined"
                color={canUploadMore ? 'default' : 'warning'}
              />
            </Stack>
            {attachmentType?.allowedExtensions && attachmentType.allowedExtensions.length > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: 'block' }}
              >
                Allowed: {attachmentType.allowedExtensions.join(', ')}
              </Typography>
            )}
          </>
        )}
      </Paper>

      {/* Error Message */}
      {(uploadError || (error && helperText)) && (
        <Alert severity="error" sx={{ mt: 1 }} onClose={() => setError(null)}>
          {typeof uploadError === 'object' && uploadError !== null
            ? (uploadError as { message?: string }).message || JSON.stringify(uploadError)
            : uploadError || helperText}
        </Alert>
      )}

      {/* Helper Text */}
      {!error && !uploadError && helperText && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, px: 1.75, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Upload Progress
          </Typography>
          <List dense>
            {uploadProgress.map((progress, index) => (
              <UploadProgressItem
                key={index}
                progress={progress}
                onClear={() => clearUploadProgress()}
                compact={compact}
              />
            ))}
          </List>
        </Box>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Attached Files ({existingFiles.length})
          </Typography>
          <List dense>
            {existingFiles.map((file) => (
              <FileListItem
                key={file.id}
                file={file}
                onDelete={() => handleDeleteFile(file.id)}
                onDownload={() => handleDownloadFile(file.id)}
                showPreview={showPreview}
                showDownload={showDownload}
                disabled={disabled}
                compact={compact}
              />
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

interface UploadProgressItemProps {
  progress: UploadProgress;
  onClear: () => void;
  compact?: boolean;
}

const UploadProgressItem: React.FC<UploadProgressItemProps> = ({
  progress,
  compact = false
}) => {
  return (
    <ListItem
      sx={{
        border: 1,
        borderColor: progress.status === 'error' ? 'error.light' : 'divider',
        borderRadius: 1,
        mb: 0.5,
        py: compact ? 0.5 : 1,
        backgroundColor: 'background.paper'
      }}
    >
      <Box sx={{ mr: 2, color: 'text.secondary' }}>
        <FileIcon mimeType={progress.file.type} />
      </Box>

      <ListItemText
        primary={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
              {progress.file.name}
            </Typography>
            {progress.status === 'success' && (
              <CheckCircle color="success" fontSize="small" />
            )}
            {progress.status === 'error' && (
              <ErrorIcon color="error" fontSize="small" />
            )}
          </Stack>
        }
        secondary={
          <Box component="span" sx={{ display: 'block' }}>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(progress.file.size)}
            </Typography>
            {progress.status === 'uploading' && (
              <LinearProgress
                variant="determinate"
                value={progress.progress}
                sx={{ mt: 0.5 }}
              />
            )}
            {progress.error && (
              <Typography variant="caption" color="error" display="block">
                {typeof progress.error === 'object' && progress.error !== null
                  ? (progress.error as { message?: string }).message || JSON.stringify(progress.error)
                  : progress.error}
              </Typography>
            )}
          </Box>
        }
        secondaryTypographyProps={{ component: 'div' }}
      />
    </ListItem>
  );
};

interface FileListItemProps {
  file: AttachmentFile;
  onDelete: () => void;
  onDownload: () => void;
  showPreview?: boolean;
  showDownload?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

const FileListItem: React.FC<FileListItemProps> = ({
  file,
  onDelete,
  onDownload,
  showPreview = true,
  showDownload = true,
  disabled = false,
  compact = false
}) => {
  const isImage = file.isImage;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  const previewUrl = isImage
    ? `${baseUrl}/attachment/file/${file.id}/view`
    : null;

  return (
    <ListItem
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        mb: 0.5,
        py: compact ? 0.5 : 1,
        backgroundColor: 'background.paper'
      }}
    >
      {/* Preview or Icon */}
      {showPreview && previewUrl ? (
        <Box
          component="img"
          src={previewUrl}
          alt={file.originalFilename}
          sx={{
            width: compact ? 32 : 40,
            height: compact ? 32 : 40,
            objectFit: 'cover',
            borderRadius: 1,
            mr: 2
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <Box sx={{ mr: 2, color: 'text.secondary' }}>
          <FileIcon mimeType={file.mimeType} />
        </Box>
      )}

      {/* File Info */}
      <ListItemText
        primary={
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={file.originalFilename}>
              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                {file.originalFilename}
              </Typography>
            </Tooltip>
            <Chip
              label={file.fileExtension.toUpperCase()}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Stack>
        }
        secondary={
          <Stack component="span" direction="row" spacing={2}>
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
        secondaryTypographyProps={{ component: 'div' }}
      />

      {/* Actions */}
      <ListItemSecondaryAction>
        <Stack direction="row" spacing={0.5}>
          {showPreview && isImage && (
            <Tooltip title="Preview">
              <IconButton
                edge="end"
                size="small"
                onClick={() => window.open(previewUrl!, '_blank')}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {showDownload && (
            <Tooltip title="Download">
              <IconButton edge="end" size="small" onClick={onDownload}>
                <Download fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <IconButton
              edge="end"
              size="small"
              onClick={onDelete}
              disabled={disabled}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default AttachmentUpload;
