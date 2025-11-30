-- ==========================================
-- APP SETTINGS INITIAL DATA
-- Insert all application settings with default values
-- is_ready = false (settings need to be implemented before activation)
-- ==========================================

-- Clear existing data
DELETE FROM app_settings;

-- ==========================================
-- 1. Basic Information (기본 정보)
-- ==========================================
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive) VALUES
-- App Name (split by language)
('app_name_en', 'Enterprise App', 'string', 'basic', false, 'Application name (English)', '어플리케이션 명 (영어)', '应用名称 (英文)', 'Tên ứng dụng (Tiếng Anh)', 1, false),
('app_name_ko', '기업 어플리케이션', 'string', 'basic', false, 'Application name (Korean)', '어플리케이션 명 (한국어)', '应用名称 (韩文)', 'Tên ứng dụng (Tiếng Hàn)', 2, false),
('app_name_zh', '企业应用', 'string', 'basic', false, 'Application name (Chinese)', '어플리케이션 명 (중국어)', '应用名称 (中文)', 'Tên ứng dụng (Tiếng Trung)', 3, false),
('app_name_vi', 'Ứng dụng Doanh nghiệp', 'string', 'basic', false, 'Application name (Vietnamese)', '어플리케이션 명 (베트남어)', '应用名称 (越南文)', 'Tên ứng dụng (Tiếng Việt)', 4, false),
-- App Description (split by language)
('app_description_en', 'Enterprise management application', 'string', 'basic', false, 'Application description (English)', '어플리케이션 설명 (영어)', '应用描述 (英文)', 'Mô tả ứng dụng (Tiếng Anh)', 5, false),
('app_description_ko', '기업 관리 어플리케이션', 'string', 'basic', false, 'Application description (Korean)', '어플리케이션 설명 (한국어)', '应用描述 (韩文)', 'Mô tả ứng dụng (Tiếng Hàn)', 6, false),
('app_description_zh', '企业管理应用', 'string', 'basic', false, 'Application description (Chinese)', '어플리케이션 설명 (중국어)', '应用描述 (中文)', 'Mô tả ứng dụng (Tiếng Trung)', 7, false),
('app_description_vi', 'Ứng dụng quản lý doanh nghiệp', 'string', 'basic', false, 'Application description (Vietnamese)', '어플리케이션 설명 (베트남어)', '应用描述 (越南文)', 'Mô tả ứng dụng (Tiếng Việt)', 8, false),
-- Other basic settings
('app_logo', '/images/logo.png', 'string', 'basic', false, 'Main logo image URL/Path', '대표 로고 이미지', '主标志图片', 'Hình ảnh logo chính', 9, false),
('app_logo_dark', '/images/logo-dark.png', 'string', 'basic', false, 'Logo for dark mode', '다크모드용 로고', '深色模式标志', 'Logo cho chế độ tối', 10, false),
('favicon', '/favicon.ico', 'string', 'basic', false, 'Favicon image', '파비콘 이미지', '网站图标', 'Favicon', 11, false),
('app_version', '1.0.0', 'string', 'basic', false, 'Current application version', '현재 버전', '当前版本', 'Phiên bản hiện tại', 12, false),
('copyright_text', '© 2024 Enterprise Corp. All rights reserved.', 'string', 'basic', false, 'Copyright text', '저작권 문구', '版权声明', 'Văn bản bản quyền', 13, false);

-- ==========================================
-- 2. Branding/UI Settings (브랜딩/UI 설정)
-- ==========================================
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive) VALUES
('primary_color', '#1976d2', 'string', 'branding', false, 'Primary theme color (HEX)', '기본 테마 색상', '主题主色', 'Màu chủ đề chính', 1, false),
('secondary_color', '#dc004e', 'string', 'branding', false, 'Secondary theme color (HEX)', '보조 테마 색상', '主题副色', 'Màu chủ đề phụ', 2, false),
('default_theme', 'light', 'string', 'branding', false, 'Default theme (light/dark/system)', '기본 테마', '默认主题', 'Chủ đề mặc định', 3, false),
('sidebar_style', 'default', 'string', 'branding', false, 'Sidebar style', '사이드바 스타일', '侧边栏样式', 'Kiểu thanh bên', 4, false),
('login_background', '/images/login-bg.jpg', 'string', 'branding', false, 'Login page background image', '로그인 배경 이미지', '登录背景图片', 'Hình nền trang đăng nhập', 5, false);

-- ==========================================
-- 3. Localization Settings (지역화 설정)
-- ==========================================
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive) VALUES
('default_language', 'ko', 'string', 'localization', false, 'Default language (ko, en, zh, vi)', '기본 언어', '默认语言', 'Ngôn ngữ mặc định', 1, false),
('supported_languages', '["ko", "en", "zh", "vi"]', 'json', 'localization', false, 'Supported languages list', '지원 언어 목록', '支持的语言列表', 'Danh sách ngôn ngữ hỗ trợ', 2, false),
('default_timezone', 'Asia/Seoul', 'string', 'localization', false, 'Default timezone', '기본 시간대', '默认时区', 'Múi giờ mặc định', 3, false),
('date_format', 'YYYY-MM-DD', 'string', 'localization', false, 'Date display format', '날짜 표시 형식', '日期显示格式', 'Định dạng ngày', 4, false),
('time_format', '24h', 'string', 'localization', false, 'Time display format (12h/24h)', '시간 표시 형식', '时间显示格式', 'Định dạng thời gian', 5, false),
('number_format', 'ko-KR', 'string', 'localization', false, 'Number format locale', '숫자 형식', '数字格式', 'Định dạng số', 6, false),
('currency', 'KRW', 'string', 'localization', false, 'Default currency', '기본 통화', '默认货币', 'Tiền tệ mặc định', 7, false);

-- ==========================================
-- 4. Security Settings (보안 설정)
-- ==========================================
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive) VALUES
('password_min_length', '8', 'number', 'security', false, 'Minimum password length', '비밀번호 최소 길이', '密码最小长度', 'Độ dài mật khẩu tối thiểu', 1, false),
('password_require_uppercase', 'true', 'boolean', 'security', false, 'Require uppercase letters', '대문자 필수 여부', '是否需要大写字母', 'Yêu cầu chữ hoa', 2, false),
('password_require_number', 'true', 'boolean', 'security', false, 'Require numbers', '숫자 필수 여부', '是否需要数字', 'Yêu cầu số', 3, false),
('password_require_special', 'true', 'boolean', 'security', false, 'Require special characters', '특수문자 필수 여부', '是否需要特殊字符', 'Yêu cầu ký tự đặc biệt', 4, false),
('password_expiry_days', '90', 'number', 'security', false, 'Password expiry days (0=unlimited)', '비밀번호 만료 일수', '密码过期天数', 'Số ngày hết hạn mật khẩu', 5, false),
('session_timeout_minutes', '30', 'number', 'security', false, 'Session timeout in minutes', '세션 타임아웃 (분)', '会话超时(分钟)', 'Thời gian chờ phiên (phút)', 6, false),
('max_login_attempts', '5', 'number', 'security', false, 'Maximum login attempts', '최대 로그인 시도 횟수', '最大登录尝试次数', 'Số lần đăng nhập tối đa', 7, false),
('lockout_duration_minutes', '15', 'number', 'security', false, 'Account lockout duration', '계정 잠금 시간', '账户锁定时间', 'Thời gian khóa tài khoản', 8, false),
('two_factor_enabled', 'false', 'boolean', 'security', false, 'Enable 2FA globally', '2FA 활성화', '启用双因素认证', 'Bật 2FA', 9, false),
('ip_whitelist', '[]', 'json', 'security', false, 'IP whitelist for admin access', 'IP 화이트리스트', 'IP白名单', 'Danh sách IP được phép', 10, false);

-- ==========================================
-- 5. Authentication Settings (인증 설정)
-- ==========================================
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive) VALUES
('allow_self_registration', 'false', 'boolean', 'authentication', false, 'Allow self registration', '자가 회원가입 허용', '允许自注册', 'Cho phép tự đăng ký', 1, false),
('require_email_verification', 'true', 'boolean', 'authentication', false, 'Require email verification', '이메일 인증 필수', '需要邮箱验证', 'Yêu cầu xác minh email', 2, false),
('sso_enabled', 'false', 'boolean', 'authentication', false, 'Enable SSO', 'SSO 활성화', '启用SSO', 'Bật SSO', 3, false),
('sso_provider', '', 'string', 'authentication', false, 'SSO provider (SAML, OAuth)', 'SSO 제공자', 'SSO提供商', 'Nhà cung cấp SSO', 4, false),
('ldap_enabled', 'false', 'boolean', 'authentication', false, 'Enable LDAP authentication', 'LDAP 인증 사용', '启用LDAP认证', 'Bật xác thực LDAP', 5, false),
('oauth_google_enabled', 'false', 'boolean', 'authentication', false, 'Enable Google OAuth', 'Google OAuth 활성화', '启用Google OAuth', 'Bật Google OAuth', 6, false),
('oauth_github_enabled', 'false', 'boolean', 'authentication', false, 'Enable GitHub OAuth', 'GitHub OAuth 활성화', '启用GitHub OAuth', 'Bật GitHub OAuth', 7, false);

-- ==========================================
-- 6. Notification Settings (이메일/알림 설정)
-- ==========================================
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive) VALUES
('smtp_host', '', 'string', 'notification', false, 'SMTP server host', 'SMTP 서버', 'SMTP服务器', 'Máy chủ SMTP', 1, false),
('smtp_port', '587', 'number', 'notification', false, 'SMTP server port', 'SMTP 포트', 'SMTP端口', 'Cổng SMTP', 2, false),
('smtp_username', '', 'string', 'notification', false, 'SMTP username', 'SMTP 사용자', 'SMTP用户名', 'Tên người dùng SMTP', 3, false),
('smtp_password', '', 'string', 'notification', false, 'SMTP password (encrypted)', 'SMTP 비밀번호', 'SMTP密码', 'Mật khẩu SMTP', 4, true),
('smtp_from_email', 'noreply@example.com', 'string', 'notification', false, 'Sender email address', '발신 이메일', '发件人邮箱', 'Email gửi', 5, false),
('smtp_from_name', 'Enterprise App', 'string', 'notification', false, 'Sender name', '발신자 이름', '发件人名称', 'Tên người gửi', 6, false),
('email_notifications_enabled', 'true', 'boolean', 'notification', false, 'Enable email notifications', '이메일 알림 활성화', '启用邮件通知', 'Bật thông báo email', 7, false),
('push_notifications_enabled', 'false', 'boolean', 'notification', false, 'Enable push notifications', '푸시 알림 활성화', '启用推送通知', 'Bật thông báo đẩy', 8, false);

-- ==========================================
-- 7. File Upload Settings (파일 업로드 설정)
-- ==========================================
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive) VALUES
('max_file_size_mb', '10', 'number', 'file_upload', false, 'Maximum file size in MB', '최대 파일 크기 (MB)', '最大文件大小(MB)', 'Kích thước file tối đa (MB)', 1, false),
('max_image_size_mb', '5', 'number', 'file_upload', false, 'Maximum image size in MB', '최대 이미지 크기 (MB)', '最大图片大小(MB)', 'Kích thước ảnh tối đa (MB)', 2, false),
('allowed_file_types', '["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip"]', 'json', 'file_upload', false, 'Allowed file extensions', '허용 파일 확장자', '允许的文件扩展名', 'Định dạng file được phép', 3, false),
('image_compression_quality', '85', 'number', 'file_upload', false, 'Image compression quality (%)', '이미지 압축 품질 (%)', '图片压缩质量(%)', 'Chất lượng nén ảnh (%)', 4, false),
('storage_provider', 'local', 'string', 'file_upload', false, 'Storage provider (local, s3, azure)', '저장소 제공자', '存储提供商', 'Nhà cung cấp lưu trữ', 5, false);

-- ==========================================
-- 8. Operations Settings (시스템 운영 설정)
-- ==========================================
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive) VALUES
('maintenance_mode', 'false', 'boolean', 'operations', false, 'Enable maintenance mode', '점검 모드 활성화', '启用维护模式', 'Bật chế độ bảo trì', 1, false),
-- Maintenance message (split by language)
('maintenance_message_en', 'System under maintenance. Please try again later.', 'string', 'operations', false, 'Maintenance message (English)', '점검 메시지 (영어)', '维护消息 (英文)', 'Thông báo bảo trì (Tiếng Anh)', 2, false),
('maintenance_message_ko', '시스템 점검 중입니다. 잠시 후 다시 시도해주세요.', 'string', 'operations', false, 'Maintenance message (Korean)', '점검 메시지 (한국어)', '维护消息 (韩文)', 'Thông báo bảo trì (Tiếng Hàn)', 3, false),
('maintenance_message_zh', '系统维护中，请稍后再试。', 'string', 'operations', false, 'Maintenance message (Chinese)', '점검 메시지 (중국어)', '维护消息 (中文)', 'Thông báo bảo trì (Tiếng Trung)', 4, false),
('maintenance_message_vi', 'Hệ thống đang bảo trì. Vui lòng thử lại sau.', 'string', 'operations', false, 'Maintenance message (Vietnamese)', '점검 메시지 (베트남어)', '维护消息 (越南文)', 'Thông báo bảo trì (Tiếng Việt)', 5, false),
('maintenance_end_time', '', 'string', 'operations', false, 'Scheduled maintenance end time', '점검 종료 예정 시간', '维护结束时间', 'Thời gian kết thúc bảo trì', 6, false),
('debug_mode', 'false', 'boolean', 'operations', false, 'Enable debug mode', '디버그 모드', '调试模式', 'Chế độ gỡ lỗi', 7, false),
('log_level', 'info', 'string', 'operations', false, 'Log level (error, warn, info, debug)', '로그 레벨', '日志级别', 'Cấp độ log', 8, false),
('api_rate_limit', '100', 'number', 'operations', false, 'API rate limit (requests/minute)', 'API 요청 제한 (회/분)', 'API速率限制(次/分钟)', 'Giới hạn API (lần/phút)', 9, false);

-- ==========================================
-- 9. Feature Flags (기능 플래그)
-- ==========================================
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive) VALUES
('feature_chat_enabled', 'false', 'boolean', 'feature_flags', false, 'Enable chat feature', '채팅 기능', '聊天功能', 'Tính năng chat', 1, false),
('feature_board_enabled', 'true', 'boolean', 'feature_flags', false, 'Enable board feature', '게시판 기능', '公告板功能', 'Tính năng bảng tin', 2, false),
('feature_report_enabled', 'true', 'boolean', 'feature_flags', false, 'Enable report feature', '보고서 기능', '报告功能', 'Tính năng báo cáo', 3, false),
('feature_beta_enabled', 'false', 'boolean', 'feature_flags', false, 'Show beta features', '베타 기능 노출', '显示测试功能', 'Hiển thị tính năng beta', 4, false);

-- ==========================================
-- 10. Organization Settings (회사/조직 정보)
-- ==========================================
INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, description_zh, description_vi, display_order, is_sensitive) VALUES
('company_name', 'Enterprise Corp.', 'string', 'organization', false, 'Company name', '회사명', '公司名称', 'Tên công ty', 1, false),
('company_address', '', 'string', 'organization', false, 'Company address', '회사 주소', '公司地址', 'Địa chỉ công ty', 2, false),
('company_phone', '', 'string', 'organization', false, 'Company phone number', '대표 전화', '公司电话', 'Số điện thoại công ty', 3, false),
('company_email', '', 'string', 'organization', false, 'Company email', '대표 이메일', '公司邮箱', 'Email công ty', 4, false),
('support_email', 'support@example.com', 'string', 'organization', false, 'Customer support email', '고객지원 이메일', '客服邮箱', 'Email hỗ trợ', 5, false),
('privacy_policy_url', '/privacy', 'string', 'organization', false, 'Privacy policy URL', '개인정보처리방침 URL', '隐私政策URL', 'URL chính sách bảo mật', 6, false),
('terms_of_service_url', '/terms', 'string', 'organization', false, 'Terms of service URL', '이용약관 URL', '服务条款URL', 'URL điều khoản dịch vụ', 7, false);

-- Verify insert count
SELECT
    category,
    COUNT(*) as count
FROM app_settings
GROUP BY category
ORDER BY category;

SELECT COUNT(*) as total_settings FROM app_settings;
