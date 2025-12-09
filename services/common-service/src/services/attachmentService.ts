/**
 * Attachment Service Layer
 * Provides data access methods for attachment-related operations.
 */

import { query, getClient } from '../utils/database';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import * as attachmentTypeService from './attachmentTypeService';
import { Attachment, AttachmentFile } from '../types';

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export function generateStoredFilename(originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase();
  const uuid = uuidv4();
  return `${uuid}${ext}`;
}

export function calculateChecksum(buffer: Buffer): string {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

export function isImageFile(mimeType: string): boolean {
  return Boolean(mimeType && mimeType.startsWith('image/'));
}

export function getFileExtension(filename: string): string {
  const ext = path.extname(filename);
  return ext ? ext.substring(1).toLowerCase() : '';
}

export function validateFile(file: any, attachmentType: any): { valid: boolean; error?: string } {
  if (file.size > attachmentType.max_file_size) {
    return {
      valid: false,
      error: `File size (${file.size}) exceeds maximum allowed size (${attachmentType.max_file_size})`
    };
  }

  const ext = getFileExtension(file.originalname);
  const allowedExtensions = attachmentType.allowed_extensions || [];

  if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension (.${ext}) is not allowed. Allowed: ${allowedExtensions.join(', ')}`
    };
  }

  return { valid: true };
}

function getDateBasedPath(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${year}${month}/${year}${month}${day}`;
}

// ==========================================
// ATTACHMENT GROUP FUNCTIONS
// ==========================================

export async function createAttachment(data: {
  attachmentTypeId: string;
  referenceType?: string;
  referenceId?: string;
  title?: string;
  description?: string;
  createdBy?: string;
}): Promise<any> {
  const id = uuidv4();

  const queryText = `
    INSERT INTO attachments (
      id, attachment_type_id, reference_type, reference_id,
      title, description, file_count, total_size,
      status, created_by, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 'active', $7, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    id,
    data.attachmentTypeId,
    data.referenceType || null,
    data.referenceId || null,
    data.title || null,
    data.description || null,
    data.createdBy || null
  ];

  const result = await query(queryText, params);
  return result.rows[0];
}

export async function getAttachmentById(attachmentId: string, includeFiles = true): Promise<any | null> {
  const queryText = `
    SELECT a.*, at.code as attachment_type_code, at.storage_path
    FROM attachments a
    LEFT JOIN attachment_types at ON a.attachment_type_id = at.id
    WHERE a.id = $1 AND a.status != 'deleted'
  `;

  const result = await query(queryText, [attachmentId]);
  const attachment = result.rows[0];

  if (!attachment) return null;

  if (includeFiles) {
    attachment.files = await getFilesByAttachmentId(attachmentId);
  }

  return attachment;
}

export async function getAttachmentsByReference(
  referenceType: string,
  referenceId: string,
  includeFiles = true
): Promise<any[]> {
  const queryText = `
    SELECT a.*, at.code as attachment_type_code, at.storage_path
    FROM attachments a
    LEFT JOIN attachment_types at ON a.attachment_type_id = at.id
    WHERE a.reference_type = $1 AND a.reference_id = $2 AND a.status != 'deleted'
    ORDER BY a.created_at ASC
  `;

  const result = await query(queryText, [referenceType, referenceId]);
  const attachments = result.rows;

  if (includeFiles) {
    for (const attachment of attachments) {
      attachment.files = await getFilesByAttachmentId(attachment.id);
    }
  }

  return attachments;
}

export async function updateAttachmentReference(
  attachmentId: string,
  referenceType: string,
  referenceId: string
): Promise<any> {
  const queryText = `
    UPDATE attachments
    SET reference_type = $1, reference_id = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;

  const result = await query(queryText, [referenceType, referenceId, attachmentId]);
  return result.rows[0];
}

export async function deleteAttachment(attachmentId: string, deletePhysicalFiles = true): Promise<boolean> {
  const attachment = await getAttachmentById(attachmentId, true);

  if (!attachment) return false;

  if (deletePhysicalFiles && attachment.files) {
    for (const file of attachment.files) {
      await deletePhysicalFile(file);
    }
  }

  await query(
    `UPDATE attachment_files SET status = 'deleted', deleted_at = NOW() WHERE attachment_id = $1`,
    [attachmentId]
  );

  const result = await query(
    `UPDATE attachments SET status = 'deleted', deleted_at = NOW() WHERE id = $1`,
    [attachmentId]
  );

  return (result.rowCount ?? 0) > 0;
}

// ==========================================
// ATTACHMENT FILE FUNCTIONS
// ==========================================

export async function addFileToAttachment(data: {
  attachmentId: string;
  originalFilename: string;
  storedFilename: string;
  fileExtension?: string;
  mimeType?: string;
  fileSize: number;
  storagePath: string;
  fullPath?: string;
  checksum?: string;
  isImage?: boolean;
  imageWidth?: number;
  imageHeight?: number;
  thumbnailPath?: string;
  order?: number;
  createdBy?: string;
}): Promise<any> {
  const id = uuidv4();

  const queryText = `
    INSERT INTO attachment_files (
      id, attachment_id, original_filename, stored_filename,
      file_extension, mime_type, file_size, storage_path, full_path,
      checksum, is_image, image_width, image_height, thumbnail_path,
      download_count, "order", status, created_by, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 0, $15, 'active', $16, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    id,
    data.attachmentId,
    data.originalFilename,
    data.storedFilename,
    data.fileExtension || getFileExtension(data.originalFilename),
    data.mimeType || 'application/octet-stream',
    data.fileSize,
    data.storagePath,
    data.fullPath || null,
    data.checksum || null,
    data.isImage || false,
    data.imageWidth || null,
    data.imageHeight || null,
    data.thumbnailPath || null,
    data.order || 0,
    data.createdBy || null
  ];

  const result = await query(queryText, params);
  return result.rows[0];
}

export async function getFileById(fileId: string): Promise<any | null> {
  const queryText = `
    SELECT af.*, a.attachment_type_id, at.storage_path as type_storage_path
    FROM attachment_files af
    JOIN attachments a ON af.attachment_id = a.id
    LEFT JOIN attachment_types at ON a.attachment_type_id = at.id
    WHERE af.id = $1 AND af.status != 'deleted'
  `;

  const result = await query(queryText, [fileId]);
  return result.rows[0] || null;
}

export async function getFilesByAttachmentId(attachmentId: string): Promise<any[]> {
  const queryText = `
    SELECT *
    FROM attachment_files
    WHERE attachment_id = $1 AND status != 'deleted'
    ORDER BY "order", created_at ASC
  `;

  const result = await query(queryText, [attachmentId]);
  return result.rows;
}

export async function updateFileOrder(fileId: string, order: number): Promise<any> {
  const queryText = `
    UPDATE attachment_files
    SET "order" = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;

  const result = await query(queryText, [order, fileId]);
  return result.rows[0];
}

export async function deleteFile(fileId: string, deletePhysical = true): Promise<boolean> {
  const file = await getFileById(fileId);

  if (!file) return false;

  if (deletePhysical) {
    await deletePhysicalFile(file);
  }

  const result = await query(
    `UPDATE attachment_files SET status = 'deleted', deleted_at = NOW() WHERE id = $1`,
    [fileId]
  );

  return (result.rowCount ?? 0) > 0;
}

export async function incrementDownloadCount(fileId: string): Promise<any> {
  const queryText = `
    UPDATE attachment_files
    SET download_count = download_count + 1, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await query(queryText, [fileId]);
  return result.rows[0];
}

// ==========================================
// PHYSICAL FILE OPERATIONS
// ==========================================

async function deletePhysicalFile(file: any): Promise<void> {
  try {
    if (file.full_path) {
      await fs.unlink(file.full_path);
    } else if (file.storage_path && file.stored_filename) {
      const fullPath = path.join(process.cwd(), 'uploads', file.storage_path, file.stored_filename);
      await fs.unlink(fullPath);
    }

    if (file.thumbnail_path) {
      try {
        await fs.unlink(file.thumbnail_path);
      } catch (e) {
        // Ignore thumbnail deletion errors
      }
    }
  } catch (error) {
    console.error('Error deleting physical file:', error);
  }
}

export async function ensureStorageDirectory(storagePath: string): Promise<string> {
  const fullPath = path.join(process.cwd(), 'uploads', storagePath);
  await fs.mkdir(fullPath, { recursive: true });
  return fullPath;
}

export async function saveFileToStorage(
  buffer: Buffer,
  baseStoragePath: string,
  storedFilename: string
): Promise<{ fullPath: string; relativePath: string }> {
  const datePath = getDateBasedPath();
  const relativePath = path.join(baseStoragePath, datePath).replace(/\\/g, '/');

  const dirPath = await ensureStorageDirectory(relativePath);
  const fullPath = path.join(dirPath, storedFilename);
  await fs.writeFile(fullPath, buffer);

  return { fullPath, relativePath };
}

// ==========================================
// HIGH-LEVEL FILE UPLOAD FUNCTION
// ==========================================

export async function uploadFiles(
  attachmentTypeCode: string,
  files: any[],
  options: {
    referenceType?: string;
    referenceId?: string;
    attachmentId?: string;
    title?: string;
    description?: string;
    createdBy?: string;
  } = {}
): Promise<{ attachment: any; files: any[]; errors: any[] }> {
  const attachmentType = await attachmentTypeService.getAttachmentTypeByCode(attachmentTypeCode);

  if (!attachmentType) {
    throw new Error(`Attachment type '${attachmentTypeCode}' not found`);
  }

  let attachment;
  if (options.attachmentId) {
    attachment = await getAttachmentById(options.attachmentId, false);
    if (!attachment) {
      throw new Error(`Attachment '${options.attachmentId}' not found`);
    }
  } else {
    attachment = await createAttachment({
      attachmentTypeId: attachmentType.id,
      referenceType: options.referenceType,
      referenceId: options.referenceId,
      title: options.title,
      description: options.description,
      createdBy: options.createdBy
    });
  }

  const currentFileCountResult = await query(
    `SELECT COUNT(*) FROM attachment_files WHERE attachment_id = $1 AND status = 'active'`,
    [attachment.id]
  );
  const existingCount = parseInt(currentFileCountResult.rows[0].count);

  if (existingCount + files.length > attachmentType.max_file_count) {
    throw new Error(
      `File count limit exceeded. Max: ${attachmentType.max_file_count}, Current: ${existingCount}, Adding: ${files.length}`
    );
  }

  const uploadedFiles: any[] = [];
  const errors: any[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    try {
      const validation = validateFile(file, attachmentType);
      if (!validation.valid) {
        errors.push({ file: file.originalname, error: validation.error });
        continue;
      }

      const storedFilename = generateStoredFilename(file.originalname);
      const fileExtension = getFileExtension(file.originalname);
      const baseStoragePath = attachmentType.storage_path;
      const checksum = calculateChecksum(file.buffer);

      const { fullPath, relativePath } = await saveFileToStorage(
        file.buffer,
        baseStoragePath,
        storedFilename
      );

      const isImage = isImageFile(file.mimetype);

      const savedFile = await addFileToAttachment({
        attachmentId: attachment.id,
        originalFilename: file.originalname,
        storedFilename,
        fileExtension,
        mimeType: file.mimetype,
        fileSize: file.size,
        storagePath: relativePath,
        fullPath,
        checksum,
        isImage,
        order: existingCount + i,
        createdBy: options.createdBy
      });

      uploadedFiles.push(savedFile);
    } catch (error: any) {
      errors.push({ file: file.originalname, error: error.message });
    }
  }

  const updatedAttachment = await getAttachmentById(attachment.id, true);

  return { attachment: updatedAttachment, files: uploadedFiles, errors };
}

// ==========================================
// BACKWARD COMPATIBILITY FUNCTIONS
// ==========================================

export async function getAttachmentsByPostId(postId: string): Promise<any[]> {
  const attachments = await getAttachmentsByReference('post', postId, true);

  const files: any[] = [];
  for (const attachment of attachments) {
    if (attachment.files) {
      for (const file of attachment.files) {
        files.push({
          ...file,
          post_id: postId,
          attachment_group_id: attachment.id
        });
      }
    }
  }

  return files;
}

export async function deleteAttachmentsByPostId(postId: string, deleteFiles = true): Promise<number> {
  const attachments = await getAttachmentsByReference('post', postId, false);
  let count = 0;

  for (const attachment of attachments) {
    const deleted = await deleteAttachment(attachment.id, deleteFiles);
    if (deleted) count++;
  }

  return count;
}
