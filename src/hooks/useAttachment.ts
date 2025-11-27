import { useState, useCallback } from 'react';
import { api } from '@/lib/axios';

// ==========================================
// TYPES
// ==========================================

export interface AttachmentType {
  id: string;
  code: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  storagePath: string;
  maxFileCount: number;
  maxFileSize: number;
  maxTotalSize: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  status: string;
  order: number;
}

export interface AttachmentFile {
  id: string;
  attachmentId: string;
  originalFilename: string;
  storedFilename: string;
  fileExtension: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  checksum: string;
  isImage: boolean;
  imageWidth?: number;
  imageHeight?: number;
  thumbnailPath?: string;
  downloadCount: number;
  order: number;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  attachmentTypeId: string;
  attachmentTypeCode: string;
  referenceType?: string;
  referenceId?: string;
  title?: string;
  description?: string;
  fileCount: number;
  totalSize: number;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  files: AttachmentFile[];
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  uploadedFile?: AttachmentFile;
}

export interface UploadResult {
  attachment: Attachment;
  uploadedFiles: AttachmentFile[];
  errors: { file: string; error: string }[];
}

// ==========================================
// HOOK
// ==========================================

interface UseAttachmentOptions {
  attachmentTypeCode: string;
  referenceType?: string;
  referenceId?: string;
  onUploadComplete?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

export function useAttachment(options: UseAttachmentOptions) {
  const { attachmentTypeCode, referenceType, referenceId, onUploadComplete, onError } = options;

  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [attachmentType, setAttachmentType] = useState<AttachmentType | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch attachment type settings
   */
  const fetchAttachmentType = useCallback(async () => {
    console.log('[useAttachment] Fetching attachment type:', attachmentTypeCode);
    try {
      const response = await api.get<{ attachmentType: AttachmentType }>(
        `/attachment-type/code/${attachmentTypeCode}`
      );
      console.log('[useAttachment] Attachment type fetched:', response.attachmentType);
      setAttachmentType(response.attachmentType);
      return response.attachmentType;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch attachment type';
      console.error('[useAttachment] Failed to fetch attachment type:', error);
      setError(errorMessage);
      return null;
    }
  }, [attachmentTypeCode]);

  /**
   * Fetch existing attachments by reference
   */
  const fetchAttachments = useCallback(async () => {
    if (!referenceType || !referenceId) return [];

    try {
      setLoading(true);
      const response = await api.get<{ attachments: Attachment[] }>(
        `/attachment/reference/${referenceType}/${referenceId}`
      );

      // Get the first attachment (usually one per reference)
      if (response.attachments.length > 0) {
        setAttachment(response.attachments[0]);
      }

      return response.attachments;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to fetch attachments';
      console.error('Failed to fetch attachments:', error);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [referenceType, referenceId]);

  /**
   * Upload files
   */
  const uploadFiles = useCallback(async (files: File[]) => {
    console.log('[useAttachment] uploadFiles called with', files.length, 'files');
    if (files.length === 0) {
      console.log('[useAttachment] No files to upload');
      return null;
    }

    try {
      setUploading(true);
      setError(null);

      // Initialize progress tracking
      const initialProgress: UploadProgress[] = files.map(file => ({
        file,
        progress: 0,
        status: 'pending'
      }));
      setUploadProgress(initialProgress);

      // Update status to uploading
      setUploadProgress(prev => prev.map(p => ({
        ...p,
        status: 'uploading'
      })));

      // Create FormData
      const formData = new FormData();
      formData.append('attachmentTypeCode', attachmentTypeCode);

      if (attachment?.id) {
        formData.append('attachmentId', attachment.id);
      }

      if (referenceType) {
        formData.append('referenceType', referenceType);
      }

      if (referenceId) {
        formData.append('referenceId', referenceId);
      }

      files.forEach(file => {
        formData.append('files', file);
      });

      console.log('[useAttachment] Uploading with FormData:', {
        attachmentTypeCode,
        attachmentId: attachment?.id,
        referenceType,
        referenceId,
        filesCount: files.length,
        fileNames: files.map(f => f.name)
      });

      // Upload with progress tracking
      // Note: Don't set Content-Type header for FormData - browser will set it with boundary
      console.log('[useAttachment] Sending API request to /attachment/upload');
      const response = await api.post<UploadResult>('/attachment/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;

          setUploadProgress(prev => prev.map(p => ({
            ...p,
            progress
          })));
        }
      });

      console.log('[useAttachment] API response received:', {
        attachmentId: response.attachment?.id,
        uploadedFilesCount: response.uploadedFiles?.length,
        errors: response.errors
      });

      // Update progress to success
      setUploadProgress(prev => prev.map((p, index) => {
        const uploadedFile = response.uploadedFiles?.[index];
        const fileError = response.errors?.find(e => e.file === p.file.name);

        return {
          ...p,
          progress: 100,
          status: fileError ? 'error' : 'success',
          error: fileError?.error,
          uploadedFile
        };
      }));

      // Update attachment state
      console.log('[useAttachment] Setting attachment state:', response.attachment?.id);
      setAttachment(response.attachment);

      // Call completion callback
      if (onUploadComplete) {
        console.log('[useAttachment] Calling onUploadComplete callback');
        onUploadComplete(response);
      }

      return response;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Upload failed';

      console.error('[useAttachment] Upload failed:', {
        errorMessage,
        responseData: error.response?.data,
        status: (err as any)?.response?.status
      });

      // Update progress to error
      setUploadProgress(prev => prev.map(p => ({
        ...p,
        status: 'error',
        error: errorMessage
      })));

      setError(errorMessage);

      if (onError) {
        onError(new Error(errorMessage));
      }

      return null;
    } finally {
      setUploading(false);
    }
  }, [attachmentTypeCode, attachment?.id, referenceType, referenceId, onUploadComplete, onError]);

  /**
   * Delete a single file
   */
  const deleteFile = useCallback(async (fileId: string) => {
    try {
      await api.delete(`/attachment/file/${fileId}`);

      // Update attachment state
      if (attachment) {
        setAttachment({
          ...attachment,
          files: attachment.files.filter(f => f.id !== fileId),
          fileCount: attachment.fileCount - 1
        });
      }

      return true;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to delete file';
      console.error('Failed to delete file:', error);
      setError(errorMessage);
      return false;
    }
  }, [attachment]);

  /**
   * Delete entire attachment group
   */
  const deleteAttachment = useCallback(async () => {
    if (!attachment?.id) return false;

    try {
      await api.delete(`/attachment/${attachment.id}`);
      setAttachment(null);
      return true;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to delete attachment';
      console.error('Failed to delete attachment:', error);
      setError(errorMessage);
      return false;
    }
  }, [attachment?.id]);

  /**
   * Download a file
   */
  const downloadFile = useCallback(async (fileId: string) => {
    try {
      // Use window.open for download
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      window.open(`${baseUrl}/attachment/file/${fileId}/download?token=${token}`, '_blank');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to download file';
      console.error('Failed to download file:', error);
      setError(errorMessage);
    }
  }, []);

  /**
   * Update attachment reference
   */
  const updateReference = useCallback(async (newReferenceType: string, newReferenceId: string) => {
    if (!attachment?.id) return null;

    try {
      const response = await api.put<{ attachment: Attachment }>(
        `/attachment/${attachment.id}/reference`,
        { referenceType: newReferenceType, referenceId: newReferenceId }
      );

      setAttachment(response.attachment);
      return response.attachment;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update reference';
      console.error('Failed to update reference:', error);
      setError(errorMessage);
      return null;
    }
  }, [attachment?.id]);

  /**
   * Clear upload progress
   */
  const clearUploadProgress = useCallback(() => {
    setUploadProgress([]);
  }, []);

  /**
   * Validate file before upload
   */
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    if (!attachmentType) {
      return { valid: true }; // Can't validate without type info
    }

    // Check file size
    if (file.size > attachmentType.maxFileSize) {
      return {
        valid: false,
        error: `File size (${formatFileSize(file.size)}) exceeds maximum (${formatFileSize(attachmentType.maxFileSize)})`
      };
    }

    // Check file extension
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (attachmentType.allowedExtensions.length > 0 && !attachmentType.allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `File type (.${ext}) is not allowed. Allowed types: ${attachmentType.allowedExtensions.join(', ')}`
      };
    }

    // Check file count
    const currentCount = attachment?.fileCount || 0;
    if (currentCount >= attachmentType.maxFileCount) {
      return {
        valid: false,
        error: `Maximum file count (${attachmentType.maxFileCount}) reached`
      };
    }

    return { valid: true };
  }, [attachmentType, attachment]);

  return {
    // State
    attachment,
    attachmentType,
    uploading,
    uploadProgress,
    loading,
    error,

    // Actions
    fetchAttachmentType,
    fetchAttachments,
    uploadFiles,
    deleteFile,
    deleteAttachment,
    downloadFile,
    updateReference,
    clearUploadProgress,
    validateFile,

    // Setters
    setAttachment,
    setError
  };
}

// ==========================================
// UTILITIES
// ==========================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'spreadsheet';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'presentation';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
  return 'file';
}

export default useAttachment;
