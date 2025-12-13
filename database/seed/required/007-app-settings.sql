-- ==========================================
-- REQUIRED: App Settings
-- 어플리케이션 설정 기본값
-- ==========================================

-- Basic Information Settings
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, display_order, is_sensitive, created_at, updated_at)
VALUES
    ('app_name_en', 'Enterprise App', 'string', 'basic', false, 'Application name (English)', '어플리케이션 명 (영어)', 1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app_name_ko', '기업 어플리케이션', 'string', 'basic', false, 'Application name (Korean)', '어플리케이션 명 (한국어)', 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app_name_zh', '企业应用', 'string', 'basic', false, 'Application name (Chinese)', '어플리케이션 명 (중국어)', 3, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app_name_vi', 'Ung dung Doanh nghiep', 'string', 'basic', false, 'Application name (Vietnamese)', '어플리케이션 명 (베트남어)', 4, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app_description_en', 'Enterprise management application', 'string', 'basic', false, 'Application description (English)', '어플리케이션 설명 (영어)', 5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app_description_ko', '기업 관리 어플리케이션', 'string', 'basic', false, 'Application description (Korean)', '어플리케이션 설명 (한국어)', 6, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app_logo', '/images/logo.png', 'string', 'basic', false, 'Main logo image URL/Path', '대표 로고 이미지', 9, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app_logo_dark', '/images/logo-dark.png', 'string', 'basic', false, 'Logo for dark mode', '다크모드용 로고', 10, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('favicon', '/favicon.ico', 'string', 'basic', false, 'Favicon image', '파비콘 이미지', 11, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app_version', '1.0.0', 'string', 'basic', false, 'Current application version', '현재 버전', 12, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('copyright_text', '(c) 2024 Enterprise Corp. All rights reserved.', 'string', 'basic', false, 'Copyright text', '저작권 문구', 13, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (key) DO NOTHING;

-- Branding Settings
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, display_order, is_sensitive, created_at, updated_at)
VALUES
    ('primary_color', '#1976d2', 'string', 'branding', false, 'Primary theme color', '기본 테마 색상', 1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('secondary_color', '#dc004e', 'string', 'branding', false, 'Secondary theme color', '보조 테마 색상', 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('default_theme', 'light', 'string', 'branding', false, 'Default theme', '기본 테마', 3, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_style', 'default', 'string', 'branding', false, 'Sidebar style', '사이드바 스타일', 4, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('login_background', '/images/login-bg.jpg', 'string', 'branding', false, 'Login page background', '로그인 배경 이미지', 5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (key) DO NOTHING;

-- Localization Settings
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, display_order, is_sensitive, created_at, updated_at)
VALUES
    ('default_language', 'ko', 'string', 'localization', false, 'Default language', '기본 언어', 1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('supported_languages', '["ko", "en", "zh", "vi"]', 'json', 'localization', false, 'Supported languages', '지원 언어 목록', 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('default_timezone', 'Asia/Seoul', 'string', 'localization', false, 'Default timezone', '기본 시간대', 3, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('date_format', 'YYYY-MM-DD', 'string', 'localization', false, 'Date display format', '날짜 표시 형식', 4, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('time_format', '24h', 'string', 'localization', false, 'Time display format', '시간 표시 형식', 5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('currency', 'KRW', 'string', 'localization', false, 'Default currency', '기본 통화', 7, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (key) DO NOTHING;

-- Security Settings
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, display_order, is_sensitive, created_at, updated_at)
VALUES
    ('password_min_length', '8', 'number', 'security', false, 'Minimum password length', '비밀번호 최소 길이', 1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('password_require_uppercase', 'true', 'boolean', 'security', false, 'Require uppercase letters', '대문자 필수 여부', 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('password_require_number', 'true', 'boolean', 'security', false, 'Require numbers', '숫자 필수 여부', 3, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('password_require_special', 'true', 'boolean', 'security', false, 'Require special characters', '특수문자 필수 여부', 4, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('password_expiry_days', '90', 'number', 'security', false, 'Password expiry days', '비밀번호 만료 일수', 5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('session_timeout_minutes', '30', 'number', 'security', false, 'Session timeout in minutes', '세션 타임아웃 (분)', 6, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('max_login_attempts', '5', 'number', 'security', false, 'Maximum login attempts', '최대 로그인 시도 횟수', 7, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('lockout_duration_minutes', '15', 'number', 'security', false, 'Account lockout duration', '계정 잠금 시간', 8, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('two_factor_enabled', 'false', 'boolean', 'security', false, 'Enable 2FA globally', '2FA 활성화', 9, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (key) DO NOTHING;

-- Authentication Settings
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, display_order, is_sensitive, created_at, updated_at)
VALUES
    ('allow_self_registration', 'false', 'boolean', 'authentication', false, 'Allow self registration', '자가 회원가입 허용', 1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('require_email_verification', 'true', 'boolean', 'authentication', false, 'Require email verification', '이메일 인증 필수', 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sso_enabled', 'false', 'boolean', 'authentication', false, 'Enable SSO', 'SSO 활성화', 3, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ldap_enabled', 'false', 'boolean', 'authentication', false, 'Enable LDAP authentication', 'LDAP 인증 사용', 5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (key) DO NOTHING;

-- Notification Settings
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, display_order, is_sensitive, created_at, updated_at)
VALUES
    ('smtp_host', '', 'string', 'notification', false, 'SMTP server host', 'SMTP 서버', 1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('smtp_port', '587', 'number', 'notification', false, 'SMTP server port', 'SMTP 포트', 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('smtp_username', '', 'string', 'notification', false, 'SMTP username', 'SMTP 사용자', 3, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('smtp_password', '', 'string', 'notification', false, 'SMTP password', 'SMTP 비밀번호', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('smtp_from_email', 'noreply@example.com', 'string', 'notification', false, 'Sender email address', '발신 이메일', 5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('email_notifications_enabled', 'true', 'boolean', 'notification', false, 'Enable email notifications', '이메일 알림 활성화', 7, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (key) DO NOTHING;

-- File Upload Settings
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, display_order, is_sensitive, created_at, updated_at)
VALUES
    ('max_file_size_mb', '10', 'number', 'file_upload', false, 'Maximum file size in MB', '최대 파일 크기 (MB)', 1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('max_image_size_mb', '5', 'number', 'file_upload', false, 'Maximum image size in MB', '최대 이미지 크기 (MB)', 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('allowed_file_types', '["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip"]', 'json', 'file_upload', false, 'Allowed file extensions', '허용 파일 확장자', 3, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('storage_provider', 'local', 'string', 'file_upload', false, 'Storage provider', '저장소 제공자', 5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (key) DO NOTHING;

-- Operations Settings
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, display_order, is_sensitive, created_at, updated_at)
VALUES
    ('maintenance_mode', 'false', 'boolean', 'operations', false, 'Enable maintenance mode', '점검 모드 활성화', 1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('maintenance_message_en', 'System under maintenance.', 'string', 'operations', false, 'Maintenance message (EN)', '점검 메시지 (영어)', 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('maintenance_message_ko', '시스템 점검 중입니다.', 'string', 'operations', false, 'Maintenance message (KO)', '점검 메시지 (한국어)', 3, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('debug_mode', 'false', 'boolean', 'operations', false, 'Enable debug mode', '디버그 모드', 7, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('log_level', 'info', 'string', 'operations', false, 'Log level', '로그 레벨', 8, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (key) DO NOTHING;

-- Feature Flags
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, display_order, is_sensitive, created_at, updated_at)
VALUES
    ('feature_chat_enabled', 'false', 'boolean', 'feature_flags', false, 'Enable chat feature', '채팅 기능', 1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('feature_board_enabled', 'true', 'boolean', 'feature_flags', false, 'Enable board feature', '게시판 기능', 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('feature_report_enabled', 'true', 'boolean', 'feature_flags', false, 'Enable report feature', '보고서 기능', 3, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('feature_beta_enabled', 'false', 'boolean', 'feature_flags', false, 'Show beta features', '베타 기능 노출', 4, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (key) DO NOTHING;

-- Organization Settings
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, display_order, is_sensitive, created_at, updated_at)
VALUES
    ('company_name', 'Enterprise Corp.', 'string', 'organization', false, 'Company name', '회사명', 1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('company_address', '', 'string', 'organization', false, 'Company address', '회사 주소', 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('company_phone', '', 'string', 'organization', false, 'Company phone number', '대표 전화', 3, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('company_email', '', 'string', 'organization', false, 'Company email', '대표 이메일', 4, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('support_email', 'support@example.com', 'string', 'organization', false, 'Support email', '고객지원 이메일', 5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('privacy_policy_url', '/privacy', 'string', 'organization', false, 'Privacy policy URL', '개인정보처리방침 URL', 6, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('terms_of_service_url', '/terms', 'string', 'organization', false, 'Terms of service URL', '이용약관 URL', 7, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (key) DO NOTHING;
