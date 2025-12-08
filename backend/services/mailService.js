/**
 * Mail Service v2 - Multi-recipient Support
 */
const { pool } = require('../config/database');

class MailService {
  // ===== Message List & Detail =====

  async getMessages(userId, folder = 'inbox', options = {}) {
    const { page = 1, limit = 50, search } = options;
    const offset = (page - 1) * limit;

    let whereClause = `
      WHERE um.user_id = $1
        AND um.folder = $2
        AND um.is_deleted = false
    `;
    const params = [userId, folder];
    let paramIndex = 3;

    if (search) {
      whereClause += ` AND (m.subject ILIKE $${paramIndex} OR m.body ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Count query
    const countResult = await pool.query(`
      SELECT COUNT(*)
      FROM mail_user_messages um
      JOIN mail_messages m ON um.message_id = m.id
      ${whereClause}
    `, params);
    const total = parseInt(countResult.rows[0].count);

    // List query with sender/recipients info
    const result = await pool.query(`
      SELECT
        um.id as user_message_id,
        um.folder,
        um.is_read,
        um.role,
        m.id,
        m.subject,
        LEFT(m.body, 200) as preview,
        m.sender_id,
        m.attachment_id,
        m.send_external,
        m.external_status,
        m.is_draft,
        m.sent_at,
        m.created_at,
        u.name_ko as sender_name,
        u.email as sender_email,
        (
          SELECT json_agg(json_build_object(
            'id', ru.id,
            'name', ru.name_ko,
            'email', ru.email,
            'type', mr.recipient_type
          ))
          FROM mail_recipients mr
          JOIN users ru ON mr.recipient_id = ru.id
          WHERE mr.message_id = m.id
        ) as recipients
      FROM mail_user_messages um
      JOIN mail_messages m ON um.message_id = m.id
      LEFT JOIN users u ON m.sender_id = u.id
      ${whereClause}
      ORDER BY m.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return {
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  async getMessage(messageId, userId, folder = null) {
    // Build query - if folder is specified, use it to get the correct user_message
    let query = `
      SELECT
        um.id as user_message_id,
        um.folder,
        um.is_read,
        um.role,
        m.*,
        u.name_ko as sender_name,
        u.email as sender_email,
        (
          SELECT json_agg(json_build_object(
            'id', ru.id,
            'name', COALESCE(ru.name_ko, ru.name_en, ru.loginid),
            'email', ru.email,
            'type', mr.recipient_type
          ) ORDER BY mr.recipient_type)
          FROM mail_recipients mr
          JOIN users ru ON mr.recipient_id = ru.id
          WHERE mr.message_id = m.id
        ) as recipients
      FROM mail_user_messages um
      JOIN mail_messages m ON um.message_id = m.id
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.id = $1 AND um.user_id = $2 AND um.is_deleted = false
    `;

    const params = [messageId, userId];
    if (folder) {
      query += ` AND um.folder = $3`;
      params.push(folder);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) return null;

    const message = result.rows[0];

    // Mark as read if inbox and unread
    if (message.folder === 'inbox' && !message.is_read) {
      await pool.query(`
        UPDATE mail_user_messages
        SET is_read = true, read_at = NOW(), updated_at = NOW()
        WHERE message_id = $1 AND user_id = $2 AND folder = 'inbox'
      `, [messageId, userId]);
      message.is_read = true;
    }

    return message;
  }

  // ===== Draft Operations =====

  async createDraft(userId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { subject, body, bodyHtml, recipients, attachmentId, sendExternal } = data;

      // Create mail message
      const messageResult = await client.query(`
        INSERT INTO mail_messages (sender_id, subject, body, body_html, attachment_id, send_external, is_draft)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        RETURNING *
      `, [userId, subject, body, bodyHtml, attachmentId, sendExternal || false]);

      const message = messageResult.rows[0];

      // Add recipients
      if (recipients && recipients.length > 0) {
        await this._saveRecipients(client, message.id, recipients);
      }

      // Create user message for sender (draft)
      await client.query(`
        INSERT INTO mail_user_messages (message_id, user_id, role, folder, is_read)
        VALUES ($1, $2, 'sender', 'draft', true)
      `, [message.id, userId]);

      await client.query('COMMIT');
      return message;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateDraft(messageId, userId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { subject, body, bodyHtml, recipients, attachmentId, sendExternal } = data;

      // Verify ownership and draft status
      const checkResult = await client.query(`
        SELECT m.id FROM mail_messages m
        JOIN mail_user_messages um ON m.id = um.message_id
        WHERE m.id = $1 AND um.user_id = $2 AND um.folder = 'draft' AND m.is_draft = true
      `, [messageId, userId]);

      if (checkResult.rows.length === 0) {
        throw new Error('Draft not found or not accessible');
      }

      // Update message
      await client.query(`
        UPDATE mail_messages SET
          subject = COALESCE($2, subject),
          body = COALESCE($3, body),
          body_html = COALESCE($4, body_html),
          attachment_id = COALESCE($5, attachment_id),
          send_external = COALESCE($6, send_external),
          updated_at = NOW()
        WHERE id = $1
      `, [messageId, subject, body, bodyHtml, attachmentId, sendExternal]);

      // Update recipients
      if (recipients !== undefined) {
        await client.query(`DELETE FROM mail_recipients WHERE message_id = $1`, [messageId]);
        if (recipients && recipients.length > 0) {
          await this._saveRecipients(client, messageId, recipients);
        }
      }

      await client.query('COMMIT');

      return this.getMessage(messageId, userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ===== Send Message =====

  async sendMessage(userId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { draftId, subject, body, bodyHtml, recipients, attachmentId, sendExternal } = data;
      let messageId;
      const sentAt = new Date();

      if (draftId) {
        // Send existing draft
        const checkResult = await client.query(`
          SELECT m.id FROM mail_messages m
          JOIN mail_user_messages um ON m.id = um.message_id
          WHERE m.id = $1 AND um.user_id = $2 AND m.is_draft = true
        `, [draftId, userId]);

        if (checkResult.rows.length === 0) {
          throw new Error('Draft not found');
        }

        messageId = draftId;

        // Update draft to sent
        await client.query(`
          UPDATE mail_messages SET
            subject = COALESCE($2, subject),
            body = COALESCE($3, body),
            body_html = COALESCE($4, body_html),
            attachment_id = COALESCE($5, attachment_id),
            send_external = COALESCE($6, send_external),
            external_status = CASE WHEN COALESCE($6, send_external) THEN 'pending' ELSE NULL END,
            is_draft = false,
            sent_at = $7,
            updated_at = NOW()
          WHERE id = $1
        `, [messageId, subject, body, bodyHtml, attachmentId, sendExternal, sentAt]);

        // Update sender's folder to 'sent'
        await client.query(`
          UPDATE mail_user_messages SET folder = 'sent', updated_at = NOW()
          WHERE message_id = $1 AND user_id = $2
        `, [messageId, userId]);

        // Update recipients if provided
        if (recipients !== undefined) {
          await client.query(`DELETE FROM mail_recipients WHERE message_id = $1`, [messageId]);
        }
      } else {
        // Create new message and send immediately
        const messageResult = await client.query(`
          INSERT INTO mail_messages (
            sender_id, subject, body, body_html, attachment_id,
            send_external, external_status, is_draft, sent_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, CASE WHEN $6 THEN 'pending' ELSE NULL END, false, $7)
          RETURNING *
        `, [userId, subject, body, bodyHtml, attachmentId, sendExternal || false, sentAt]);

        messageId = messageResult.rows[0].id;

        // Create sender's user_message
        await client.query(`
          INSERT INTO mail_user_messages (message_id, user_id, role, folder, is_read)
          VALUES ($1, $2, 'sender', 'sent', true)
        `, [messageId, userId]);
      }

      // Save recipients
      if (recipients && recipients.length > 0) {
        await this._saveRecipients(client, messageId, recipients);

        // Create inbox entries for each recipient
        for (const recipient of recipients) {
          if (recipient.id) {
            // Create inbox entry for recipient (including self-mail)
            // UNIQUE constraint is on (message_id, user_id, folder) so sender can have both sent and inbox
            await client.query(`
              INSERT INTO mail_user_messages (message_id, user_id, role, folder, is_read)
              VALUES ($1, $2, $3, 'inbox', false)
              ON CONFLICT (message_id, user_id, folder) DO NOTHING
            `, [messageId, recipient.id, recipient.type || 'to']);
          }
        }
      }

      await client.query('COMMIT');
      return { success: true, messageId, sentAt };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ===== Helper: Save Recipients =====

  async _saveRecipients(client, messageId, recipients) {
    for (const recipient of recipients) {
      if (recipient.id) {
        await client.query(`
          INSERT INTO mail_recipients (message_id, recipient_id, recipient_type)
          VALUES ($1, $2, $3)
          ON CONFLICT (message_id, recipient_id) DO UPDATE SET recipient_type = $3
        `, [messageId, recipient.id, recipient.type || 'to']);
      }
    }
  }

  // ===== Folder Operations =====

  async moveToTrash(messageId, userId) {
    const result = await pool.query(`
      UPDATE mail_user_messages
      SET folder = 'trash', updated_at = NOW()
      WHERE message_id = $1 AND user_id = $2 AND folder != 'trash'
      RETURNING *
    `, [messageId, userId]);
    return result.rows[0];
  }

  async restoreFromTrash(messageId, userId) {
    const result = await pool.query(`
      UPDATE mail_user_messages
      SET folder = CASE
        WHEN role = 'sender' THEN 'sent'
        ELSE 'inbox'
      END,
      updated_at = NOW()
      WHERE message_id = $1 AND user_id = $2 AND folder = 'trash'
      RETURNING *
    `, [messageId, userId]);
    return result.rows[0];
  }

  async deletePermanently(messageId, userId) {
    // Only delete user's view, not the actual message
    const result = await pool.query(`
      UPDATE mail_user_messages
      SET is_deleted = true, deleted_at = NOW(), updated_at = NOW()
      WHERE message_id = $1 AND user_id = $2
      RETURNING id
    `, [messageId, userId]);
    return result.rowCount > 0;
  }

  async deleteDraft(messageId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify it's a draft and owned by user
      const checkResult = await client.query(`
        SELECT m.id FROM mail_messages m
        JOIN mail_user_messages um ON m.id = um.message_id
        WHERE m.id = $1 AND um.user_id = $2 AND m.is_draft = true
      `, [messageId, userId]);

      if (checkResult.rows.length === 0) {
        throw new Error('Draft not found');
      }

      // Delete the draft completely (cascade will handle recipients and user_messages)
      await client.query(`DELETE FROM mail_messages WHERE id = $1`, [messageId]);

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ===== Read Status =====

  async markAsRead(messageId, userId, isRead = true) {
    // Update read status
    const updateResult = await pool.query(`
      UPDATE mail_user_messages
      SET is_read = $3,
          read_at = CASE WHEN $3 THEN NOW() ELSE NULL END,
          updated_at = NOW()
      WHERE message_id = $1 AND user_id = $2
      RETURNING *
    `, [messageId, userId, isRead]);

    if (updateResult.rows.length === 0) {
      return null;
    }

    // Return full message info for frontend state sync
    return await this.getMessage(messageId, userId);
  }

  // ===== Folder Counts =====

  async getFolderCounts(userId) {
    const result = await pool.query(`
      SELECT
        folder,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_read = false) as unread
      FROM mail_user_messages
      WHERE user_id = $1 AND is_deleted = false
      GROUP BY folder
    `, [userId]);

    const counts = {
      inbox: { total: 0, unread: 0 },
      sent: { total: 0, unread: 0 },
      draft: { total: 0, unread: 0 },
      trash: { total: 0, unread: 0 }
    };

    result.rows.forEach(row => {
      counts[row.folder] = {
        total: parseInt(row.total),
        unread: parseInt(row.unread)
      };
    });

    return counts;
  }

  // ===== Bulk Actions =====

  async bulkAction(userId, messageIds, action) {
    if (!messageIds || messageIds.length === 0) return;

    const placeholders = messageIds.map((_, i) => `$${i + 2}`).join(',');

    switch (action) {
      case 'trash':
        await pool.query(`
          UPDATE mail_user_messages
          SET folder = 'trash', updated_at = NOW()
          WHERE user_id = $1 AND message_id IN (${placeholders})
        `, [userId, ...messageIds]);
        break;

      case 'delete':
        await pool.query(`
          UPDATE mail_user_messages
          SET is_deleted = true, deleted_at = NOW(), updated_at = NOW()
          WHERE user_id = $1 AND message_id IN (${placeholders}) AND folder = 'trash'
        `, [userId, ...messageIds]);
        break;

      case 'read':
        await pool.query(`
          UPDATE mail_user_messages
          SET is_read = true, read_at = NOW(), updated_at = NOW()
          WHERE user_id = $1 AND message_id IN (${placeholders})
        `, [userId, ...messageIds]);
        break;

      case 'unread':
        await pool.query(`
          UPDATE mail_user_messages
          SET is_read = false, read_at = NULL, updated_at = NOW()
          WHERE user_id = $1 AND message_id IN (${placeholders})
        `, [userId, ...messageIds]);
        break;
    }
  }

  // ===== External Mail Queue (for separate worker process) =====

  async getPendingExternalMails() {
    const result = await pool.query(`
      SELECT
        m.*,
        u.email as sender_email,
        u.name_ko as sender_name,
        (
          SELECT json_agg(json_build_object(
            'id', ru.id,
            'email', ru.email,
            'name', ru.name_ko,
            'type', mr.recipient_type
          ))
          FROM mail_recipients mr
          JOIN users ru ON mr.recipient_id = ru.id
          WHERE mr.message_id = m.id
        ) as recipients
      FROM mail_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.send_external = true AND m.external_status = 'pending'
      ORDER BY m.sent_at ASC
      LIMIT 50
    `);
    return result.rows;
  }

  async updateExternalStatus(messageId, status, error = null) {
    await pool.query(`
      UPDATE mail_messages SET
        external_status = $2,
        external_sent_at = CASE WHEN $2 = 'sent' THEN NOW() ELSE NULL END,
        external_error = $3,
        updated_at = NOW()
      WHERE id = $1
    `, [messageId, status, error]);
  }
}

module.exports = new MailService();
