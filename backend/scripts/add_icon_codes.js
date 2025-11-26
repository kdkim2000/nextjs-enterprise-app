/**
 * Script to add missing ICON_TYPE codes to the database
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'nextjs_enterprise_app',
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'AppUser2024!'
});

const iconCodes = [
  { code: 'Menu', nameEn: 'Menu', nameKo: '메뉴', nameZh: '菜单', nameVi: 'Menu', order: 21 },
  { code: 'Message', nameEn: 'Message', nameKo: '메시지', nameZh: '消息', nameVi: 'Tin nhắn', order: 22 },
  { code: 'Article', nameEn: 'Article', nameKo: '문서', nameZh: '文章', nameVi: 'Bài viết', order: 23 },
  { code: 'Book', nameEn: 'Book', nameKo: '책', nameZh: '书籍', nameVi: 'Sách', order: 24 },
  { code: 'Announcement', nameEn: 'Announcement', nameKo: '공지사항', nameZh: '公告', nameVi: 'Thông báo', order: 25 },
  { code: 'Forum', nameEn: 'Forum', nameKo: '포럼', nameZh: '论坛', nameVi: 'Diễn đàn', order: 26 },
  { code: 'Info', nameEn: 'Info', nameKo: '정보', nameZh: '信息', nameVi: 'Thông tin', order: 27 },
  { code: 'Storage', nameEn: 'Storage', nameKo: '저장소', nameZh: '存储', nameVi: 'Lưu trữ', order: 28 },
  { code: 'Notifications', nameEn: 'Notifications', nameKo: '알림', nameZh: '通知', nameVi: 'Thông báo', order: 29 },
  { code: 'Email', nameEn: 'Email', nameKo: '이메일', nameZh: '电子邮件', nameVi: 'Email', order: 30 }
];

async function addIconCodes() {
  const client = await pool.connect();
  try {
    console.log('Connected to database');

    // Check existing codes
    const existingResult = await client.query(
      "SELECT code FROM codes WHERE code_type = 'ICON_TYPE'"
    );
    const existingCodes = new Set(existingResult.rows.map(r => r.code));
    console.log(`Found ${existingCodes.size} existing ICON_TYPE codes`);

    // Insert new codes
    let insertedCount = 0;
    for (const icon of iconCodes) {
      if (existingCodes.has(icon.code)) {
        console.log(`  Skipping ${icon.code} (already exists)`);
        continue;
      }

      const id = `code-icon-${icon.code.toLowerCase()}`;
      await client.query(`
        INSERT INTO codes (id, code_type, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, "order", status, parent_code, attributes, created_at, updated_at)
        VALUES ($1, 'ICON_TYPE', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', NULL, '{}', NOW(), NOW())
      `, [
        id,
        icon.code,
        icon.nameEn,
        icon.nameKo,
        icon.nameZh,
        icon.nameVi,
        `${icon.nameEn} icon`,
        `${icon.nameKo} 아이콘`,
        `${icon.nameZh}图标`,
        `Biểu tượng ${icon.nameVi.toLowerCase()}`,
        icon.order
      ]);
      console.log(`  Added ${icon.code}`);
      insertedCount++;
    }

    console.log(`\nInserted ${insertedCount} new icon codes`);

    // Verify
    const verifyResult = await client.query(
      "SELECT code, name_en, name_ko FROM codes WHERE code_type = 'ICON_TYPE' ORDER BY \"order\""
    );
    console.log(`\nTotal ICON_TYPE codes: ${verifyResult.rows.length}`);
    verifyResult.rows.forEach(r => {
      console.log(`  ${r.code}: ${r.name_en} / ${r.name_ko}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addIconCodes().catch(console.error);
