-- Add missing ICON_TYPE codes to the database
-- Run this script to add new icon options for menu management

-- First, check if ICON_TYPE code_type exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM code_types WHERE code = 'ICON_TYPE') THEN
    INSERT INTO code_types (id, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, created_at, updated_at)
    VALUES ('ct-icon-type', 'ICON_TYPE', 'Icon Type', '아이콘 타입', '图标类型', 'Loại biểu tượng', 'Menu icon types', '메뉴 아이콘 타입', '菜单图标类型', 'Loại biểu tượng menu', NOW(), NOW());
  END IF;
END $$;

-- Insert new icon codes (only if they don't exist)
INSERT INTO codes (id, code_type, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, "order", status, parent_code, attributes, created_at, updated_at)
SELECT 'code-icon-menu', 'ICON_TYPE', 'Menu', 'Menu', '메뉴', '菜单', 'Menu', 'Menu icon', '메뉴 아이콘', '菜单图标', 'Biểu tượng menu', 21, 'active', NULL, '{}', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM codes WHERE code_type = 'ICON_TYPE' AND code = 'Menu');

INSERT INTO codes (id, code_type, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, "order", status, parent_code, attributes, created_at, updated_at)
SELECT 'code-icon-message', 'ICON_TYPE', 'Message', 'Message', '메시지', '消息', 'Tin nhắn', 'Message icon', '메시지 아이콘', '消息图标', 'Biểu tượng tin nhắn', 22, 'active', NULL, '{}', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM codes WHERE code_type = 'ICON_TYPE' AND code = 'Message');

INSERT INTO codes (id, code_type, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, "order", status, parent_code, attributes, created_at, updated_at)
SELECT 'code-icon-article', 'ICON_TYPE', 'Article', 'Article', '문서', '文章', 'Bài viết', 'Article icon', '문서 아이콘', '文章图标', 'Biểu tượng bài viết', 23, 'active', NULL, '{}', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM codes WHERE code_type = 'ICON_TYPE' AND code = 'Article');

INSERT INTO codes (id, code_type, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, "order", status, parent_code, attributes, created_at, updated_at)
SELECT 'code-icon-book', 'ICON_TYPE', 'Book', 'Book', '책', '书籍', 'Sách', 'Book icon', '책 아이콘', '书籍图标', 'Biểu tượng sách', 24, 'active', NULL, '{}', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM codes WHERE code_type = 'ICON_TYPE' AND code = 'Book');

INSERT INTO codes (id, code_type, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, "order", status, parent_code, attributes, created_at, updated_at)
SELECT 'code-icon-announcement', 'ICON_TYPE', 'Announcement', 'Announcement', '공지사항', '公告', 'Thông báo', 'Announcement icon', '공지사항 아이콘', '公告图标', 'Biểu tượng thông báo', 25, 'active', NULL, '{}', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM codes WHERE code_type = 'ICON_TYPE' AND code = 'Announcement');

INSERT INTO codes (id, code_type, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, "order", status, parent_code, attributes, created_at, updated_at)
SELECT 'code-icon-forum', 'ICON_TYPE', 'Forum', 'Forum', '포럼', '论坛', 'Diễn đàn', 'Forum icon', '포럼 아이콘', '论坛图标', 'Biểu tượng diễn đàn', 26, 'active', NULL, '{}', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM codes WHERE code_type = 'ICON_TYPE' AND code = 'Forum');

INSERT INTO codes (id, code_type, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, "order", status, parent_code, attributes, created_at, updated_at)
SELECT 'code-icon-info', 'ICON_TYPE', 'Info', 'Info', '정보', '信息', 'Thông tin', 'Info icon', '정보 아이콘', '信息图标', 'Biểu tượng thông tin', 27, 'active', NULL, '{}', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM codes WHERE code_type = 'ICON_TYPE' AND code = 'Info');

INSERT INTO codes (id, code_type, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, "order", status, parent_code, attributes, created_at, updated_at)
SELECT 'code-icon-storage', 'ICON_TYPE', 'Storage', 'Storage', '저장소', '存储', 'Lưu trữ', 'Storage icon', '저장소 아이콘', '存储图标', 'Biểu tượng lưu trữ', 28, 'active', NULL, '{}', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM codes WHERE code_type = 'ICON_TYPE' AND code = 'Storage');

INSERT INTO codes (id, code_type, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, "order", status, parent_code, attributes, created_at, updated_at)
SELECT 'code-icon-notifications', 'ICON_TYPE', 'Notifications', 'Notifications', '알림', '通知', 'Thông báo', 'Notifications icon', '알림 아이콘', '通知图标', 'Biểu tượng thông báo', 29, 'active', NULL, '{}', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM codes WHERE code_type = 'ICON_TYPE' AND code = 'Notifications');

INSERT INTO codes (id, code_type, code, name_en, name_ko, name_zh, name_vi, description_en, description_ko, description_zh, description_vi, "order", status, parent_code, attributes, created_at, updated_at)
SELECT 'code-icon-email', 'ICON_TYPE', 'Email', 'Email', '이메일', '电子邮件', 'Email', 'Email icon', '이메일 아이콘', '电子邮件图标', 'Biểu tượng email', 30, 'active', NULL, '{}', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM codes WHERE code_type = 'ICON_TYPE' AND code = 'Email');

-- Verify the icons were added
SELECT code, name_en, name_ko FROM codes WHERE code_type = 'ICON_TYPE' ORDER BY "order";
