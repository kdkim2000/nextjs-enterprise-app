/**
 * Check if app_settings table exists and create if not
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'nextjs_enterprise_app',
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || '<REDACTED_PASSWORD>'
});

async function checkAndCreateTable() {
  const client = await pool.connect();

  try {
    // Check if table exists
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'app_settings'
      );
    `);

    const tableExists = checkResult.rows[0].exists;
    console.log('app_settings table exists:', tableExists);

    if (!tableExists) {
      console.log('Creating app_settings table...');

      // Create table
      await client.query(`
        CREATE TABLE app_settings (
          key VARCHAR(100) PRIMARY KEY,
          value TEXT,
          value_type VARCHAR(20) NOT NULL DEFAULT 'string',
          category VARCHAR(50) NOT NULL,
          is_ready BOOLEAN NOT NULL DEFAULT false,
          description_en TEXT,
          description_ko TEXT,
          description_zh TEXT,
          description_vi TEXT,
          display_order INTEGER DEFAULT 0,
          is_sensitive BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_by VARCHAR(50)
        );

        CREATE INDEX idx_app_settings_category ON app_settings(category);
        CREATE INDEX idx_app_settings_is_ready ON app_settings(is_ready);
        CREATE INDEX idx_app_settings_value_type ON app_settings(value_type);
      `);

      console.log('Table created successfully!');
      console.log('Inserting initial data...');

      // Insert initial data
      const insertData = `
        -- 1. Basic Information (split by language)
        INSERT INTO app_settings (key, value, value_type, category, is_ready, description_en, description_ko, display_order, is_sensitive) VALUES
        ('app_name_en', 'Enterprise App', 'string', 'basic', false, 'Application name (English)', '어플리케이션 명 (영어)', 1, false),
        ('app_name_ko', '기업 어플리케이션', 'string', 'basic', false, 'Application name (Korean)', '어플리케이션 명 (한국어)', 2, false),
        ('app_name_zh', '企业应用', 'string', 'basic', false, 'Application name (Chinese)', '어플리케이션 명 (중국어)', 3, false),
        ('app_name_vi', 'Ứng dụng Doanh nghiệp', 'string', 'basic', false, 'Application name (Vietnamese)', '어플리케이션 명 (베트남어)', 4, false),
        ('app_description_en', 'Enterprise management application', 'string', 'basic', false, 'Application description (English)', '어플리케이션 설명 (영어)', 5, false),
        ('app_description_ko', '기업 관리 어플리케이션', 'string', 'basic', false, 'Application description (Korean)', '어플리케이션 설명 (한국어)', 6, false),
        ('app_description_zh', '企业管理应用', 'string', 'basic', false, 'Application description (Chinese)', '어플리케이션 설명 (중국어)', 7, false),
        ('app_description_vi', 'Ứng dụng quản lý doanh nghiệp', 'string', 'basic', false, 'Application description (Vietnamese)', '어플리케이션 설명 (베트남어)', 8, false),
        ('app_logo', '/images/logo.png', 'string', 'basic', false, 'Main logo image URL/Path', '대표 로고 이미지', 9, false),
        ('app_logo_dark', '/images/logo-dark.png', 'string', 'basic', false, 'Logo for dark mode', '다크모드용 로고', 10, false),
        ('favicon', '/favicon.ico', 'string', 'basic', false, 'Favicon image', '파비콘 이미지', 11, false),
        ('app_version', '1.0.0', 'string', 'basic', false, 'Current application version', '현재 버전', 12, false),
        ('copyright_text', '© 2024 Enterprise Corp. All rights reserved.', 'string', 'basic', false, 'Copyright text', '저작권 문구', 13, false),

        -- 2. Branding
        ('primary_color', '#1976d2', 'string', 'branding', false, 'Primary theme color (HEX)', '기본 테마 색상', 1, false),
        ('secondary_color', '#dc004e', 'string', 'branding', false, 'Secondary theme color (HEX)', '보조 테마 색상', 2, false),
        ('default_theme', 'light', 'string', 'branding', false, 'Default theme (light/dark/system)', '기본 테마', 3, false),
        ('sidebar_style', 'default', 'string', 'branding', false, 'Sidebar style', '사이드바 스타일', 4, false),
        ('login_background', '/images/login-bg.jpg', 'string', 'branding', false, 'Login page background image', '로그인 배경 이미지', 5, false),

        -- 3. Localization
        ('default_language', 'ko', 'string', 'localization', false, 'Default language', '기본 언어', 1, false),
        ('supported_languages', '["ko", "en", "zh", "vi"]', 'json', 'localization', false, 'Supported languages list', '지원 언어 목록', 2, false),
        ('default_timezone', 'Asia/Seoul', 'string', 'localization', false, 'Default timezone', '기본 시간대', 3, false),
        ('date_format', 'YYYY-MM-DD', 'string', 'localization', false, 'Date display format', '날짜 표시 형식', 4, false),
        ('time_format', '24h', 'string', 'localization', false, 'Time display format', '시간 표시 형식', 5, false),
        ('number_format', 'ko-KR', 'string', 'localization', false, 'Number format locale', '숫자 형식', 6, false),
        ('currency', 'KRW', 'string', 'localization', false, 'Default currency', '기본 통화', 7, false),

        -- 4. Security
        ('password_min_length', '8', 'number', 'security', false, 'Minimum password length', '비밀번호 최소 길이', 1, false),
        ('password_require_uppercase', 'true', 'boolean', 'security', false, 'Require uppercase letters', '대문자 필수 여부', 2, false),
        ('password_require_number', 'true', 'boolean', 'security', false, 'Require numbers', '숫자 필수 여부', 3, false),
        ('password_require_special', 'true', 'boolean', 'security', false, 'Require special characters', '특수문자 필수 여부', 4, false),
        ('password_expiry_days', '90', 'number', 'security', false, 'Password expiry days', '비밀번호 만료 일수', 5, false),
        ('session_timeout_minutes', '30', 'number', 'security', false, 'Session timeout in minutes', '세션 타임아웃', 6, false),
        ('max_login_attempts', '5', 'number', 'security', false, 'Maximum login attempts', '최대 로그인 시도', 7, false),
        ('lockout_duration_minutes', '15', 'number', 'security', false, 'Account lockout duration', '계정 잠금 시간', 8, false),
        ('two_factor_enabled', 'false', 'boolean', 'security', false, 'Enable 2FA globally', '2FA 활성화', 9, false),
        ('ip_whitelist', '[]', 'json', 'security', false, 'IP whitelist', 'IP 화이트리스트', 10, false),

        -- 5. Authentication
        ('allow_self_registration', 'false', 'boolean', 'authentication', false, 'Allow self registration', '자가 회원가입 허용', 1, false),
        ('require_email_verification', 'true', 'boolean', 'authentication', false, 'Require email verification', '이메일 인증 필수', 2, false),
        ('sso_enabled', 'false', 'boolean', 'authentication', false, 'Enable SSO', 'SSO 활성화', 3, false),
        ('sso_provider', '', 'string', 'authentication', false, 'SSO provider', 'SSO 제공자', 4, false),
        ('ldap_enabled', 'false', 'boolean', 'authentication', false, 'Enable LDAP', 'LDAP 인증 사용', 5, false),
        ('oauth_google_enabled', 'false', 'boolean', 'authentication', false, 'Enable Google OAuth', 'Google OAuth', 6, false),
        ('oauth_github_enabled', 'false', 'boolean', 'authentication', false, 'Enable GitHub OAuth', 'GitHub OAuth', 7, false),

        -- 6. Notification
        ('smtp_host', '', 'string', 'notification', false, 'SMTP server host', 'SMTP 서버', 1, false),
        ('smtp_port', '587', 'number', 'notification', false, 'SMTP server port', 'SMTP 포트', 2, false),
        ('smtp_username', '', 'string', 'notification', false, 'SMTP username', 'SMTP 사용자', 3, false),
        ('smtp_password', '', 'string', 'notification', false, 'SMTP password', 'SMTP 비밀번호', 4, true),
        ('smtp_from_email', 'noreply@example.com', 'string', 'notification', false, 'Sender email', '발신 이메일', 5, false),
        ('smtp_from_name', 'Enterprise App', 'string', 'notification', false, 'Sender name', '발신자 이름', 6, false),
        ('email_notifications_enabled', 'true', 'boolean', 'notification', false, 'Enable email notifications', '이메일 알림', 7, false),
        ('push_notifications_enabled', 'false', 'boolean', 'notification', false, 'Enable push notifications', '푸시 알림', 8, false),

        -- 7. File Upload
        ('max_file_size_mb', '10', 'number', 'file_upload', false, 'Maximum file size (MB)', '최대 파일 크기', 1, false),
        ('max_image_size_mb', '5', 'number', 'file_upload', false, 'Maximum image size (MB)', '최대 이미지 크기', 2, false),
        ('allowed_file_types', '["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip"]', 'json', 'file_upload', false, 'Allowed file extensions', '허용 파일 확장자', 3, false),
        ('image_compression_quality', '85', 'number', 'file_upload', false, 'Image compression quality (%)', '이미지 압축 품질', 4, false),
        ('storage_provider', 'local', 'string', 'file_upload', false, 'Storage provider', '저장소 제공자', 5, false),

        -- 8. Operations (split by language)
        ('maintenance_mode', 'false', 'boolean', 'operations', false, 'Enable maintenance mode', '점검 모드', 1, false),
        ('maintenance_message_en', 'System under maintenance. Please try again later.', 'string', 'operations', false, 'Maintenance message (English)', '점검 메시지 (영어)', 2, false),
        ('maintenance_message_ko', '시스템 점검 중입니다. 잠시 후 다시 시도해주세요.', 'string', 'operations', false, 'Maintenance message (Korean)', '점검 메시지 (한국어)', 3, false),
        ('maintenance_message_zh', '系统维护中，请稍后再试。', 'string', 'operations', false, 'Maintenance message (Chinese)', '점검 메시지 (중국어)', 4, false),
        ('maintenance_message_vi', 'Hệ thống đang bảo trì. Vui lòng thử lại sau.', 'string', 'operations', false, 'Maintenance message (Vietnamese)', '점검 메시지 (베트남어)', 5, false),
        ('maintenance_end_time', '', 'string', 'operations', false, 'Maintenance end time', '점검 종료 시간', 6, false),
        ('debug_mode', 'false', 'boolean', 'operations', false, 'Enable debug mode', '디버그 모드', 7, false),
        ('log_level', 'info', 'string', 'operations', false, 'Log level', '로그 레벨', 8, false),
        ('api_rate_limit', '100', 'number', 'operations', false, 'API rate limit (req/min)', 'API 요청 제한', 9, false),

        -- 9. Feature Flags
        ('feature_chat_enabled', 'false', 'boolean', 'feature_flags', false, 'Enable chat feature', '채팅 기능', 1, false),
        ('feature_board_enabled', 'true', 'boolean', 'feature_flags', false, 'Enable board feature', '게시판 기능', 2, false),
        ('feature_report_enabled', 'true', 'boolean', 'feature_flags', false, 'Enable report feature', '보고서 기능', 3, false),
        ('feature_beta_enabled', 'false', 'boolean', 'feature_flags', false, 'Show beta features', '베타 기능', 4, false),

        -- 10. Organization
        ('company_name', 'Enterprise Corp.', 'string', 'organization', false, 'Company name', '회사명', 1, false),
        ('company_address', '', 'string', 'organization', false, 'Company address', '회사 주소', 2, false),
        ('company_phone', '', 'string', 'organization', false, 'Company phone', '대표 전화', 3, false),
        ('company_email', '', 'string', 'organization', false, 'Company email', '대표 이메일', 4, false),
        ('support_email', 'support@example.com', 'string', 'organization', false, 'Support email', '고객지원 이메일', 5, false),
        ('privacy_policy_url', '/privacy', 'string', 'organization', false, 'Privacy policy URL', '개인정보처리방침', 6, false),
        ('terms_of_service_url', '/terms', 'string', 'organization', false, 'Terms of service URL', '이용약관', 7, false);
      `;

      await client.query(insertData);
      console.log('Initial data inserted successfully!');
    }

    // Show count
    const countResult = await client.query('SELECT COUNT(*) FROM app_settings');
    console.log('Total settings count:', countResult.rows[0].count);

    // Show by category
    const categoryResult = await client.query(`
      SELECT category, COUNT(*) as count
      FROM app_settings
      GROUP BY category
      ORDER BY category
    `);
    console.log('\nSettings by category:');
    categoryResult.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndCreateTable();
