/**
 * User Preferences Service Layer
 */

const db = require('../config/database');

async function getUserPreferences(userId) {
  const result = await db.query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);
  return result.rows[0] || null;
}

async function createUserPreferences(data) {
  const {
    userId,
    language,
    theme,
    favoriteMenus,
    recentMenus,
    rowsPerPage,
    emailNotifications,
    systemNotifications,
    sessionTimeout
  } = data;

  const query = `
    INSERT INTO user_preferences (
      user_id,
      language,
      theme,
      favorite_menus,
      recent_menus,
      rows_per_page,
      email_notifications,
      system_notifications,
      session_timeout,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET
      language = COALESCE($2, user_preferences.language),
      theme = COALESCE($3, user_preferences.theme),
      favorite_menus = COALESCE($4, user_preferences.favorite_menus),
      recent_menus = COALESCE($5, user_preferences.recent_menus),
      rows_per_page = COALESCE($6, user_preferences.rows_per_page),
      email_notifications = COALESCE($7, user_preferences.email_notifications),
      system_notifications = COALESCE($8, user_preferences.system_notifications),
      session_timeout = COALESCE($9, user_preferences.session_timeout),
      updated_at = NOW()
    RETURNING *
  `;

  const params = [
    userId,
    language || null,
    theme || null,
    favoriteMenus ? JSON.stringify(favoriteMenus) : null,
    recentMenus ? JSON.stringify(recentMenus) : null,
    rowsPerPage || null,
    emailNotifications !== undefined ? emailNotifications : null,
    systemNotifications !== undefined ? systemNotifications : null,
    sessionTimeout || null,
  ];

  const result = await db.query(query, params);
  return result.rows[0];
}

async function updateUserPreferences(userId, updates) {
  const allowedFields = [
    'language',
    'theme',
    'favorite_menus',
    'recent_menus',
    'rows_per_page',
    'email_notifications',
    'system_notifications',
    'session_timeout'
  ];
  const setClause = [];
  const params = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbField)) {
      if ((dbField === 'favorite_menus' || dbField === 'recent_menus') && value !== null) {
        setClause.push(`${dbField} = $${paramIndex}::jsonb`);
        params.push(JSON.stringify(value));
      } else {
        setClause.push(`${dbField} = $${paramIndex}`);
        params.push(value);
      }
      paramIndex++;
    }
  }

  if (setClause.length === 0) throw new Error('No valid fields to update');
  setClause.push(`updated_at = NOW()`);
  params.push(userId);

  const query = `UPDATE user_preferences SET ${setClause.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`;
  const result = await db.query(query, params);
  return result.rows[0] || null;
}

async function deleteUserPreferences(userId) {
  const result = await db.query('DELETE FROM user_preferences WHERE user_id = $1', [userId]);
  return result.rowCount > 0;
}

module.exports = {
  getUserPreferences,
  createUserPreferences,
  updateUserPreferences,
  deleteUserPreferences,
};
