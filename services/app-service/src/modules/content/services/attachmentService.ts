/**
 * Attachment Service Layer
 *
 * Note: This is a simplified version that directly accesses the database.
 * In a full MSA setup, this would call the common-service via HTTP.
 */

import { query } from '@enterprise/shared';

/**
 * Get attachment by ID with files
 */
export async function getAttachmentById(attachmentId: string): Promise<any | null> {
  const attachmentQuery = `
    SELECT * FROM attachments WHERE id = $1 AND status = 'active'
  `;
  const attachmentResult = await query(attachmentQuery, [attachmentId]);

  if (attachmentResult.rows.length === 0) {
    return null;
  }

  const attachment = attachmentResult.rows[0];

  // Get files for this attachment
  const filesQuery = `
    SELECT * FROM attachment_files
    WHERE attachment_id = $1 AND status = 'active'
    ORDER BY created_at ASC
  `;
  const filesResult = await query(filesQuery, [attachmentId]);

  return {
    ...attachment,
    files: filesResult.rows
  };
}

/**
 * Get attachments by post ID (legacy support)
 */
export async function getAttachmentsByPostId(postId: string): Promise<any[]> {
  const queryText = `
    SELECT af.*
    FROM attachment_files af
    INNER JOIN attachments a ON af.attachment_id = a.id
    WHERE a.reference_type = 'post'
      AND a.reference_id = $1
      AND a.status = 'active'
      AND af.status = 'active'
    ORDER BY af.created_at ASC
  `;

  const result = await query(queryText, [postId]);
  return result.rows;
}

/**
 * Update attachment reference
 */
export async function updateAttachmentReference(
  attachmentId: string,
  referenceType: string,
  referenceId: string
): Promise<boolean> {
  const queryText = `
    UPDATE attachments
    SET reference_type = $1, reference_id = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;

  const result = await query(queryText, [referenceType, referenceId, attachmentId]);
  return (result.rowCount ?? 0) > 0;
}
