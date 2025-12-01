/**
 * Simplified Mail Service
 */
const { pool } = require('../config/database');

class MailService {
  async getMessages(userId, folder = 'inbox', options = {}) {
    const { page = 1, limit = 50, search } = options;
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE owner_id = $1 AND folder = $2 AND is_deleted = false';
    const params = [userId, folder];
    let paramIndex = 3;
    if (search) {
      whereClause += ` AND (subject ILIKE $${paramIndex} OR body ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    const countResult = await pool.query(`SELECT COUNT(*) FROM mail_messages ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query(`SELECT id, sender_id, sender_name, sender_email, recipient_id, recipient_name, recipient_email, subject, LEFT(body, 200) as preview, folder, is_read, sent_at, created_at FROM mail_messages ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, [...params, limit, offset]);
    return { data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getMessage(messageId, userId) {
    const result = await pool.query(`SELECT * FROM mail_messages WHERE id = $1 AND owner_id = $2 AND is_deleted = false`, [messageId, userId]);
    if (result.rows.length === 0) return null;
    const message = result.rows[0];
    if (message.folder === 'inbox' && !message.is_read) { await this.markAsRead(messageId, userId); message.is_read = true; }
    return message;
  }

  async createDraft(userId, data) {
    const { recipientId, recipientName, recipientEmail, subject, body, bodyHtml } = data;
    const senderResult = await pool.query(`SELECT id, COALESCE(name_ko, name_en, loginid) as name, email FROM users WHERE id = $1`, [userId]);
    const sender = senderResult.rows[0];
    const result = await pool.query(`INSERT INTO mail_messages (owner_id, sender_id, sender_name, sender_email, recipient_id, recipient_name, recipient_email, subject, body, body_html, folder) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'draft') RETURNING *`, [userId, userId, sender?.name, sender?.email, recipientId, recipientName, recipientEmail, subject, body, bodyHtml]);
    return result.rows[0];
  }

  async updateDraft(messageId, userId, data) {
    const { recipientId, recipientName, recipientEmail, subject, body, bodyHtml } = data;
    const result = await pool.query(`UPDATE mail_messages SET recipient_id = COALESCE($3, recipient_id), recipient_name = COALESCE($4, recipient_name), recipient_email = COALESCE($5, recipient_email), subject = COALESCE($6, subject), body = COALESCE($7, body), body_html = COALESCE($8, body_html), updated_at = NOW() WHERE id = $1 AND owner_id = $2 AND folder = 'draft' RETURNING *`, [messageId, userId, recipientId, recipientName, recipientEmail, subject, body, bodyHtml]);
    return result.rows[0];
  }

  async sendMessage(userId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { draftId, recipientId, recipientName, recipientEmail, subject, body, bodyHtml } = data;
      const senderResult = await client.query(`SELECT id, COALESCE(name_ko, name_en, loginid) as name, email FROM users WHERE id = $1`, [userId]);
      const sender = senderResult.rows[0];
      let finalRecipientName = recipientName, finalRecipientEmail = recipientEmail;
      if (recipientId && !recipientName) {
        const recipientResult = await client.query(`SELECT COALESCE(name_ko, name_en, loginid) as name, email FROM users WHERE id = $1`, [recipientId]);
        if (recipientResult.rows[0]) { finalRecipientName = recipientResult.rows[0].name; finalRecipientEmail = recipientResult.rows[0].email; }
      }
      const sentAt = new Date();
      if (draftId) {
        await client.query(`UPDATE mail_messages SET folder = 'sent', sent_at = $3, updated_at = NOW(), recipient_id = COALESCE($4, recipient_id), recipient_name = COALESCE($5, recipient_name), recipient_email = COALESCE($6, recipient_email) WHERE id = $1 AND owner_id = $2 AND folder = 'draft'`, [draftId, userId, sentAt, recipientId, finalRecipientName, finalRecipientEmail]);
      } else {
        await client.query(`INSERT INTO mail_messages (owner_id, sender_id, sender_name, sender_email, recipient_id, recipient_name, recipient_email, subject, body, body_html, folder, sent_at, is_read) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'sent', $11, true)`, [userId, userId, sender?.name, sender?.email, recipientId, finalRecipientName, finalRecipientEmail, subject, body, bodyHtml, sentAt]);
      }
      if (recipientId) {
        await client.query(`INSERT INTO mail_messages (owner_id, sender_id, sender_name, sender_email, recipient_id, recipient_name, recipient_email, subject, body, body_html, folder, sent_at, is_read) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'inbox', $11, false)`, [recipientId, userId, sender?.name, sender?.email, recipientId, finalRecipientName, finalRecipientEmail, subject, body, bodyHtml, sentAt]);
      }
      await client.query('COMMIT');
      return { success: true, sentAt };
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }

  async moveToTrash(messageId, userId) {
    const result = await pool.query(`UPDATE mail_messages SET folder = 'trash', updated_at = NOW() WHERE id = $1 AND owner_id = $2 AND folder != 'trash' RETURNING *`, [messageId, userId]);
    return result.rows[0];
  }

  async restoreFromTrash(messageId, userId) {
    const result = await pool.query(`UPDATE mail_messages SET folder = CASE WHEN sender_id = owner_id THEN 'sent' ELSE 'inbox' END, updated_at = NOW() WHERE id = $1 AND owner_id = $2 AND folder = 'trash' RETURNING *`, [messageId, userId]);
    return result.rows[0];
  }

  async deletePermanently(messageId, userId) {
    const result = await pool.query(`DELETE FROM mail_messages WHERE id = $1 AND owner_id = $2 RETURNING id`, [messageId, userId]);
    return result.rowCount > 0;
  }

  async markAsRead(messageId, userId, isRead = true) {
    const result = await pool.query(`UPDATE mail_messages SET is_read = $3, read_at = CASE WHEN $3 THEN NOW() ELSE NULL END, updated_at = NOW() WHERE id = $1 AND owner_id = $2 RETURNING *`, [messageId, userId, isRead]);
    return result.rows[0];
  }

  async getFolderCounts(userId) {
    const result = await pool.query(`SELECT folder, COUNT(*) as total, COUNT(*) FILTER (WHERE is_read = false) as unread FROM mail_messages WHERE owner_id = $1 AND is_deleted = false GROUP BY folder`, [userId]);
    const counts = { inbox: { total: 0, unread: 0 }, sent: { total: 0, unread: 0 }, draft: { total: 0, unread: 0 }, trash: { total: 0, unread: 0 } };
    result.rows.forEach(row => { counts[row.folder] = { total: parseInt(row.total), unread: parseInt(row.unread) }; });
    return counts;
  }

  async bulkAction(userId, messageIds, action) {
    if (!messageIds || messageIds.length === 0) return;
    const placeholders = messageIds.map((_, i) => `$${i + 2}`).join(',');
    switch (action) {
      case 'trash': await pool.query(`UPDATE mail_messages SET folder = 'trash', updated_at = NOW() WHERE owner_id = $1 AND id IN (${placeholders})`, [userId, ...messageIds]); break;
      case 'delete': await pool.query(`DELETE FROM mail_messages WHERE owner_id = $1 AND id IN (${placeholders}) AND folder = 'trash'`, [userId, ...messageIds]); break;
      case 'read': await pool.query(`UPDATE mail_messages SET is_read = true, read_at = NOW(), updated_at = NOW() WHERE owner_id = $1 AND id IN (${placeholders})`, [userId, ...messageIds]); break;
      case 'unread': await pool.query(`UPDATE mail_messages SET is_read = false, read_at = NULL, updated_at = NOW() WHERE owner_id = $1 AND id IN (${placeholders})`, [userId, ...messageIds]); break;
    }
  }
}

module.exports = new MailService();
