-- Update Phase 1 settings to is_ready=true
-- These settings are already implemented in DashboardFooter

-- Phase 1 settings:
-- 1. App name (localized)
-- 2. App version
-- 3. Copyright text
-- 4. Privacy policy URL
-- 5. Terms of service URL
-- 6. Support email
-- 7. Company address
-- 8. Company phone
-- 9. Company email

UPDATE app_settings
SET is_ready = true, updated_at = NOW()
WHERE key IN (
  -- Basic info
  'app_name_en',
  'app_name_ko',
  'app_name_zh',
  'app_name_vi',
  'app_version',
  'copyright_text',
  -- Organization
  'company_address',
  'company_phone',
  'company_email',
  'support_email',
  'privacy_policy_url',
  'terms_of_service_url'
);

-- Verify changes
SELECT key, value, is_ready, is_applied
FROM app_settings
WHERE key IN (
  'app_name_en', 'app_name_ko', 'app_name_zh', 'app_name_vi',
  'app_version', 'copyright_text',
  'company_address', 'company_phone', 'company_email',
  'support_email', 'privacy_policy_url', 'terms_of_service_url'
)
ORDER BY key;
