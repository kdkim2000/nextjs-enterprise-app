-- ==========================================
-- SPLIT JSON APP SETTINGS INTO INDIVIDUAL ITEMS
-- Converts multi-language JSON fields to separate per-language settings
-- ==========================================

-- ==========================================
-- 1. Split app_name into individual language keys
-- ==========================================
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive)
SELECT
    'app_name_en',
    COALESCE((value::jsonb)->>'en', 'Enterprise App'),
    'string',
    category,
    is_ready,
    'Application name (English)',
    '어플리케이션 명 (영어)',
    '应用名称 (英文)',
    'Tên ứng dụng (Tiếng Anh)',
    1,
    false
FROM app_settings WHERE key = 'app_name';

INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive)
SELECT
    'app_name_ko',
    COALESCE((value::jsonb)->>'ko', '기업 어플리케이션'),
    'string',
    category,
    is_ready,
    'Application name (Korean)',
    '어플리케이션 명 (한국어)',
    '应用名称 (韩文)',
    'Tên ứng dụng (Tiếng Hàn)',
    2,
    false
FROM app_settings WHERE key = 'app_name';

INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive)
SELECT
    'app_name_zh',
    COALESCE((value::jsonb)->>'zh', '企业应用'),
    'string',
    category,
    is_ready,
    'Application name (Chinese)',
    '어플리케이션 명 (중국어)',
    '应用名称 (中文)',
    'Tên ứng dụng (Tiếng Trung)',
    3,
    false
FROM app_settings WHERE key = 'app_name';

INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive)
SELECT
    'app_name_vi',
    COALESCE((value::jsonb)->>'vi', 'Ứng dụng Doanh nghiệp'),
    'string',
    category,
    is_ready,
    'Application name (Vietnamese)',
    '어플리케이션 명 (베트남어)',
    '应用名称 (越南文)',
    'Tên ứng dụng (Tiếng Việt)',
    4,
    false
FROM app_settings WHERE key = 'app_name';

-- Delete original app_name JSON field
DELETE FROM app_settings WHERE key = 'app_name';

-- ==========================================
-- 2. Split app_description into individual language keys
-- ==========================================
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive)
SELECT
    'app_description_en',
    COALESCE((value::jsonb)->>'en', 'Enterprise management application'),
    'string',
    category,
    is_ready,
    'Application description (English)',
    '어플리케이션 설명 (영어)',
    '应用描述 (英文)',
    'Mô tả ứng dụng (Tiếng Anh)',
    5,
    false
FROM app_settings WHERE key = 'app_description';

INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive)
SELECT
    'app_description_ko',
    COALESCE((value::jsonb)->>'ko', '기업 관리 어플리케이션'),
    'string',
    category,
    is_ready,
    'Application description (Korean)',
    '어플리케이션 설명 (한국어)',
    '应用描述 (韩文)',
    'Mô tả ứng dụng (Tiếng Hàn)',
    6,
    false
FROM app_settings WHERE key = 'app_description';

INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive)
SELECT
    'app_description_zh',
    COALESCE((value::jsonb)->>'zh', '企业管理应用'),
    'string',
    category,
    is_ready,
    'Application description (Chinese)',
    '어플리케이션 설명 (중국어)',
    '应用描述 (中文)',
    'Mô tả ứng dụng (Tiếng Trung)',
    7,
    false
FROM app_settings WHERE key = 'app_description';

INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive)
SELECT
    'app_description_vi',
    COALESCE((value::jsonb)->>'vi', 'Ứng dụng quản lý doanh nghiệp'),
    'string',
    category,
    is_ready,
    'Application description (Vietnamese)',
    '어플리케이션 설명 (베트남어)',
    '应用描述 (越南文)',
    'Mô tả ứng dụng (Tiếng Việt)',
    8,
    false
FROM app_settings WHERE key = 'app_description';

-- Delete original app_description JSON field
DELETE FROM app_settings WHERE key = 'app_description';

-- ==========================================
-- 3. Split maintenance_message into individual language keys
-- ==========================================
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive)
SELECT
    'maintenance_message_en',
    COALESCE((value::jsonb)->>'en', 'System under maintenance. Please try again later.'),
    'string',
    category,
    is_ready,
    'Maintenance message (English)',
    '점검 메시지 (영어)',
    '维护消息 (英文)',
    'Thông báo bảo trì (Tiếng Anh)',
    2,
    false
FROM app_settings WHERE key = 'maintenance_message';

INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive)
SELECT
    'maintenance_message_ko',
    COALESCE((value::jsonb)->>'ko', '시스템 점검 중입니다. 잠시 후 다시 시도해주세요.'),
    'string',
    category,
    is_ready,
    'Maintenance message (Korean)',
    '점검 메시지 (한국어)',
    '维护消息 (韩文)',
    'Thông báo bảo trì (Tiếng Hàn)',
    3,
    false
FROM app_settings WHERE key = 'maintenance_message';

INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive)
SELECT
    'maintenance_message_zh',
    COALESCE((value::jsonb)->>'zh', '系统维护中，请稍后再试。'),
    'string',
    category,
    is_ready,
    'Maintenance message (Chinese)',
    '점검 메시지 (중국어)',
    '维护消息 (中文)',
    'Thông báo bảo trì (Tiếng Trung)',
    4,
    false
FROM app_settings WHERE key = 'maintenance_message';

INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive)
SELECT
    'maintenance_message_vi',
    COALESCE((value::jsonb)->>'vi', 'Hệ thống đang bảo trì. Vui lòng thử lại sau.'),
    'string',
    category,
    is_ready,
    'Maintenance message (Vietnamese)',
    '점검 메시지 (베트남어)',
    '维护消息 (越南文)',
    'Thông báo bảo trì (Tiếng Việt)',
    5,
    false
FROM app_settings WHERE key = 'maintenance_message';

-- Delete original maintenance_message JSON field
DELETE FROM app_settings WHERE key = 'maintenance_message';

-- ==========================================
-- 4. Update display_order for affected categories
-- ==========================================

-- Update basic category display_order
UPDATE app_settings SET display_order = 9 WHERE key = 'app_logo' AND category = 'basic';
UPDATE app_settings SET display_order = 10 WHERE key = 'app_logo_dark' AND category = 'basic';
UPDATE app_settings SET display_order = 11 WHERE key = 'favicon' AND category = 'basic';
UPDATE app_settings SET display_order = 12 WHERE key = 'app_version' AND category = 'basic';
UPDATE app_settings SET display_order = 13 WHERE key = 'copyright_text' AND category = 'basic';

-- Update operations category display_order
UPDATE app_settings SET display_order = 6 WHERE key = 'maintenance_end_time' AND category = 'operations';
UPDATE app_settings SET display_order = 7 WHERE key = 'debug_mode' AND category = 'operations';
UPDATE app_settings SET display_order = 8 WHERE key = 'log_level' AND category = 'operations';
UPDATE app_settings SET display_order = 9 WHERE key = 'api_rate_limit' AND category = 'operations';

-- ==========================================
-- 5. Verify changes
-- ==========================================
SELECT key, value_type, category, display_order
FROM app_settings
WHERE category IN ('basic', 'operations')
ORDER BY category, display_order;

SELECT 'Total settings after migration:' as info, COUNT(*) as count FROM app_settings;
